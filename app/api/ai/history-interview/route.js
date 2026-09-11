import { NextResponse } from 'next/server';
import { generateLLMResponse } from '@/lib/ai-provider';

export const dynamic = 'force-dynamic';

// Clinical Red Flag Emergency Symptom Patterns
const RED_FLAG_PATTERNS = [
  {
    regex: /(chest pain|crushing pain|pain in left arm|heart attack|angina|सीने में दर्द|छाती में दर्द|दिल का दौरा)/i,
    name: 'Acute Coronary / Chest Pain Syndrome',
    advice: 'Potential acute cardiac event. Immediate emergency medical evaluation required.'
  },
  {
    regex: /(difficulty breathing|severe breathlessness|can't breathe|unable to breathe|gasping|सांस फूलना|सांस लेने में दिक्कत|दम घुटना)/i,
    name: 'Acute Respiratory Distress',
    advice: 'Severe breathing difficulty detected. Seek urgent emergency respiratory support.'
  },
  {
    regex: /(stroke|face droop|slurred speech|sudden paralysis|one sided weakness|लकवा|फालिज|चेहरा टेढ़ा|बोलने में दिक्कत)/i,
    name: 'Acute Cerebrovascular / Stroke Symptoms',
    advice: 'Possible stroke warning signs. Immediate hospital emergency triage advised.'
  },
  {
    regex: /(vomiting blood|blood in vomit|hematemesis|black stool|melena|खून की उल्टी|उल्टी में खून|काला मल)/i,
    name: 'Upper GI Hemorrhage / Acute Bleeding',
    advice: 'Sign of internal bleeding. Immediate medical evaluation needed.'
  },
  {
    regex: /(loss of consciousness|fainted|unresponsive|seizure|convulsions|बेहोश|दौरा|मूर्छा)/i,
    name: 'Altered Sensorium / Seizure',
    advice: 'Critical neurological or hemodynamic emergency. Contact emergency services.'
  },
  {
    regex: /(sudden severe headache|thunderclap|worst headache of my life|अचानक तेज सिरदर्द)/i,
    name: 'Severe Acute Neurological Event',
    advice: 'Sudden severe thunderclap headache requires urgent brain imaging.'
  }
];

function detectRedFlags(text) {
  if (!text) return null;
  for (const item of RED_FLAG_PATTERNS) {
    if (item.regex.test(text)) {
      return {
        detected: true,
        type: item.name,
        warning: 'Potential emergency symptoms detected. Please alert medical staff immediately.',
        advice: item.advice
      };
    }
  }
  return null;
}

const INTERVIEW_STAGES = [
  'chief_complaint',
  'hpi',
  'past_history',
  'medications_allergies',
  'family_history',
  'personal_lifestyle',
  'ayush_digestive'
];

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      messages = [],
      userResponse = '',
      language = 'en',
      collectedData = {},
      currentStage = 'chief_complaint'
    } = body;

    const lang = language === 'hi' ? 'hi' : 'en';
    const cleanInput = userResponse ? userResponse.trim() : '';

    // 1. Check for Red Flags in the patient's latest input
    const redFlag = detectRedFlags(cleanInput);

    // 2. Clone collected data
    let updatedData = { ...collectedData };

    // Initial greeting if conversation is starting
    if (!cleanInput && messages.length === 0) {
      const initialGreeting = lang === 'hi'
        ? 'नमस्ते! मैं आपका आयुष क्लिनिकल एआई सहायक हूँ। डॉक्टर से मिलने से पहले, कृपया मुझे अपनी मुख्य स्वास्थ्य समस्या या लक्षण (Chief Complaint) के बारे में बताएं।'
        : 'Hello! I am your AyushCase Clinical AI Assistant. To help your doctor prepare for your consultation, please describe your main symptom or health concern (Chief Complaint).';

      return NextResponse.json({
        success: true,
        message: initialGreeting,
        currentStage: 'chief_complaint',
        isComplete: false,
        collectedData: updatedData,
        redFlag: null
      });
    }

    // 3. Dynamic LLM Conversational Interviewer
    // Uses the same Groq Llama 3.3 70B / Gemini / OpenAI LLM as the chatbot
    const systemPrompt = `You are an empathetic, context-aware AYUSH Clinical Intake AI Assistant (AyushCase).
Your mission is to conduct a dynamic, natural, and helpful pre-consultation health interview with a patient.

PATIENT LANGUAGE: ${lang === 'hi' ? 'Hindi (हिन्दी)' : 'English'}
CURRENT DATA ALREADY COLLECTED:
${JSON.stringify(updatedData, null, 2)}

CRITICAL CONVERSATIONAL RULES:
1. NEVER REPEAT OR ASK QUESTIONS ABOUT INFORMATION THE PATIENT ALREADY GAVE YOU.
   - Example: If the patient already stated they have Diabetes, Joint Pain, or take Metformin, DO NOT ask "Do you have diabetes?" or "What conditions do you have?". Acknowledge what they said (e.g. "I have noted your diabetes and knee pain...") and move forward to what is NOT yet known.
2. Maintain natural conversational context. Reference the patient's specific symptoms.
3. Guide the patient through clinical dimensions one at a time:
   - Chief Complaint & Duration
   - History of Present Illness (triggers, intensity 1-10, timing)
   - Past Medical/Surgical History (only asking for other conditions not yet mentioned)
   - Current Medications & Known Allergies
   - Family Medical History
   - Personal Routine & Diet (Ahara/Vihara)
   - Ayurvedic Digestion (Agni: appetite, acidity, gas) & Bowel nature (Koshta: regular, constipation, loose)
4. Keep your spoken response brief, warm, and clear (2 to 3 sentences maximum).
5. When all key domains have been gathered or after 5-6 natural turns, gently let the patient know that their clinical history is recorded and they can proceed to upload previous reports.

You MUST respond strictly with a single valid JSON object adhering to this schema:
{
  "replyMessage": "Empathetic conversational response and next logical question in ${lang === 'hi' ? 'Hindi' : 'English'}",
  "currentStage": "chief_complaint" | "hpi" | "past_history" | "medications_allergies" | "family_history" | "personal_lifestyle" | "ayush_digestive" | "completed",
  "isComplete": true/false,
  "extractedEntities": {
    "chiefComplaint": "string or null",
    "duration": "string or null",
    "hpi": "string or null",
    "pastMedicalHistory": "string or null",
    "currentMedicines": "string or null",
    "allergies": "string or null",
    "familyHistory": "string or null",
    "personalHistory": "string or null",
    "ayushAgni": "Samagni" | "Vishamagni" | "Tikshnagni" | "Mandagni" | null,
    "ayushKoshta": "Madhyama" | "Krura" | "Mridu" | null
  }
}`;

    const formattedHistory = messages.slice(-8).map((m) => ({
      sender: m.role === 'assistant' ? 'assistant' : 'user',
      text: m.content
    }));

    const userMessage = `Patient's Latest Reply: "${cleanInput}"
Current Interview Stage: ${currentStage}
Please analyze, extract newly provided data, and formulate the next natural contextual follow-up question.`;

    let aiMessage = '';
    let nextStage = currentStage;
    let isComplete = false;

    try {
      const llmResponse = await generateLLMResponse({
        systemPrompt,
        userMessage,
        conversationHistory: formattedHistory,
        temperature: 0.3,
        maxTokens: 600
      });

      if (llmResponse && llmResponse.text) {
        let cleaned = llmResponse.text.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(cleaned);

        if (parsed.replyMessage) {
          aiMessage = parsed.replyMessage;
        }
        if (parsed.currentStage) {
          nextStage = parsed.currentStage;
        }
        if (parsed.isComplete !== undefined) {
          isComplete = parsed.isComplete;
        }

        // Merge extracted entities into updatedData
        if (parsed.extractedEntities) {
          Object.entries(parsed.extractedEntities).forEach(([key, val]) => {
            if (val && val !== 'null' && val !== 'Not detected') {
              if (key === 'hpi' && updatedData.hpi && !updatedData.hpi.includes(val)) {
                updatedData.hpi = `${updatedData.hpi} ${val}`.trim();
              } else if (!updatedData[key] || updatedData[key] === 'None' || updatedData[key] === 'None reported') {
                updatedData[key] = val;
              } else if (key === 'pastMedicalHistory' && !updatedData.pastMedicalHistory.includes(val)) {
                updatedData.pastMedicalHistory = `${updatedData.pastMedicalHistory}, ${val}`.trim();
              } else {
                updatedData[key] = val;
              }
            }
          });
        }
      }
    } catch (llmErr) {
      console.warn('Dynamic LLM history interview failed, using intelligent context fallback:', llmErr.message);
    }

    // 4. Intelligent Context-Aware Fallback if LLM was unavailable
    if (!aiMessage) {
      // Direct extraction
      if (cleanInput) {
        if (!updatedData.chiefComplaint || currentStage === 'chief_complaint') {
          updatedData.chiefComplaint = cleanInput;
          const durMatch = cleanInput.match(/(\d+\s*(?:days?|weeks?|months?|years?|दिन|हफ्ते|महीने|साल))/i);
          if (durMatch) updatedData.duration = durMatch[1];
        } else if (currentStage === 'hpi') {
          updatedData.hpi = (updatedData.hpi ? updatedData.hpi + '. ' : '') + cleanInput;
        } else if (currentStage === 'past_history') {
          updatedData.pastMedicalHistory = cleanInput;
        } else if (currentStage === 'medications_allergies') {
          if (/allergic|allergy|एलर्जी/i.test(cleanInput)) updatedData.allergies = cleanInput;
          else updatedData.currentMedicines = cleanInput;
        } else if (currentStage === 'family_history') {
          updatedData.familyHistory = cleanInput;
        } else if (currentStage === 'personal_lifestyle') {
          updatedData.personalHistory = cleanInput;
        } else if (currentStage === 'ayush_digestive') {
          updatedData.reviewOfSystems = cleanInput;
          if (/heavy|sluggish|bloat|कम भूख|मंद/i.test(cleanInput)) updatedData.ayushAgni = 'Mandagni (Sluggish)';
          else if (/hyperacid|burning|तीक्ष्ण|जलन|तेज भूख/i.test(cleanInput)) updatedData.ayushAgni = 'Tikshnagni (High acid)';
          else if (/irregular|gas|variable/i.test(cleanInput)) updatedData.ayushAgni = 'Vishamagni (Variable)';
          else updatedData.ayushAgni = 'Samagni (Balanced)';

          if (/constipat|hard|dry|कब्ज|कठिन/i.test(cleanInput)) updatedData.ayushKoshta = 'Krura (Hard / Constipated)';
          else if (/loose|frequent|पतला दस्त/i.test(cleanInput)) updatedData.ayushKoshta = 'Mridu (Soft)';
          else updatedData.ayushKoshta = 'Madhyama (Regular)';
        }
      }

      // Check current stage progression
      const currentIdx = INTERVIEW_STAGES.indexOf(currentStage);
      if (currentIdx < INTERVIEW_STAGES.length - 1) {
        nextStage = INTERVIEW_STAGES[currentIdx + 1];
      } else {
        isComplete = true;
      }

      // Formulate non-repetitive smart fallback message
      const hasDiabetesMentioned = /(diabetes|sugar|मधुमेह|शुगर)/i.test(updatedData.chiefComplaint || '') ||
        /(diabetes|sugar|मधुमेह|शुगर)/i.test(updatedData.pastMedicalHistory || '') ||
        /(diabetes|sugar|मधुमेह|शुगर)/i.test(cleanInput);

      if (lang === 'hi') {
        switch (nextStage) {
          case 'hpi':
            aiMessage = `मैंने आपकी समस्या ("${cleanInput}") दर्ज कर ली है। यह लक्षण कब से महसूस हो रहे हैं और क्या किसी विशेष समय (जैसे सुबह या भोजन के बाद) बढ़ जाते हैं?`;
            break;
          case 'past_history':
            aiMessage = hasDiabetesMentioned
              ? 'डायबिटीज के अलावा, क्या आपको उच्च रक्तचाप (BP), थायराइड या कोई पुरानी बीमारी अथवा सर्जरी का इतिहास है?'
              : 'क्या आपको पहले से कोई पुरानी स्वास्थ्य समस्या (जैसे BP, थायराइड, सांस की तकलीफ) या कोई पिछली सर्जरी का इतिहास है?';
            break;
          case 'medications_allergies':
            aiMessage = 'वर्तमान में आप कौन-सी दवाइयां या आयुर्वेदिक औषधियां ले रहे हैं? क्या आपको किसी दवा या खाद्य पदार्थ से कोई एलर्जी है?';
            break;
          case 'family_history':
            aiMessage = 'क्या आपके परिवार में किसी को गठिया, मधुमेह, रक्तचाप या कोई आनुवंशिक रोग का इतिहास है?';
            break;
          case 'personal_lifestyle':
            aiMessage = 'आपकी दैनिक दिनचर्या कैसी है? आपका आहार (शाकाहारी/मांसाहारी), नींद और पानी का सेवन कैसा रहता है?';
            break;
          case 'ayush_digestive':
            aiMessage = 'आयुर्वेदिक अग्नि व कोष्ठ हेतु: आपकी भूख कैसी है और क्या पेट में गैस, खट्टी डकार या कब्ज की समस्या रहती है?';
            break;
          default:
            aiMessage = 'धन्यवाद! आपका स्वास्थ्य इतिहास पूर्ण हो चुका है। कृपया अपनी पुरानी मेडिकल रिपोर्ट्स अपलोड करने के लिए आगे बढ़ें।';
            isComplete = true;
        }
      } else {
        switch (nextStage) {
          case 'hpi':
            aiMessage = `I have noted: "${cleanInput}". How long have you experienced this, and is it triggered or worsened at specific times (e.g. morning, after meals, physical activity)?`;
            break;
          case 'past_history':
            aiMessage = hasDiabetesMentioned
              ? 'Apart from diabetes, do you have any other pre-existing conditions (such as Hypertension, Thyroid disorders, Asthma) or surgical history?'
              : 'Do you have any other existing medical conditions (such as Hypertension, Thyroid disorders, Asthma) or previous hospitalizations?';
            break;
          case 'medications_allergies':
            aiMessage = 'What medicines or supplements are you currently taking? Do you have any known drug or food allergies?';
            break;
          case 'family_history':
            aiMessage = 'Is there any family history of chronic conditions like Arthritis, Diabetes, or Cardiovascular disease?';
            break;
          case 'personal_lifestyle':
            aiMessage = 'Could you briefly describe your daily routine, dietary preference (Veg / Non-Veg), sleep schedule, and hydration habits?';
            break;
          case 'ayush_digestive':
            aiMessage = 'For Ayurvedic digestive assessment (Agni & Koshta): How is your appetite (steady or erratic), and do you experience bloating, acidity, or constipation?';
            break;
          default:
            aiMessage = 'Thank you! Your health history is comprehensively recorded. Please proceed to upload any previous medical documents.';
            isComplete = true;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: aiMessage,
      currentStage: nextStage,
      isComplete,
      collectedData: updatedData,
      redFlag: redFlag || null
    });
  } catch (error) {
    console.error('Error in AI History Interview API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process AI interview response',
        details: error.message
      },
      { status: 500 }
    );
  }
}
