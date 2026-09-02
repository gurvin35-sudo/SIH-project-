import { NextResponse } from 'next/server';

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

// Check text for red flags
function detectRedFlags(text) {
  if (!text) return null;
  for (const item of RED_FLAG_PATTERNS) {
    if (item.regex.test(text)) {
      return {
        detected: true,
        type: item.name,
        warning: 'Potential emergency symptoms detected. Please alert medical/triage staff immediately.',
        advice: item.advice
      };
    }
  }
  return null;
}

// Conversation interview state categories in clinical sequence
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
    const updatedData = { ...collectedData };

    // 3. Extract information from cleanInput based on current stage or keywords
    if (cleanInput) {
      if (!updatedData.chiefComplaint || currentStage === 'chief_complaint') {
        updatedData.chiefComplaint = cleanInput;
        // Attempt to extract duration if mentioned
        const durationMatch = cleanInput.match(/(\d+\s*(?:days?|weeks?|months?|years?|दिन|हफ्ते|महीने|साल))/i);
        if (durationMatch) {
          updatedData.duration = durationMatch[1];
        }
      } else if (currentStage === 'hpi') {
        updatedData.hpi = (updatedData.hpi ? updatedData.hpi + ' ' : '') + cleanInput;
      } else if (currentStage === 'past_history') {
        updatedData.pastMedicalHistory = cleanInput;
      } else if (currentStage === 'medications_allergies') {
        if (/allergic|allergy|एलर्जी/i.test(cleanInput)) {
          updatedData.allergies = cleanInput;
        } else {
          updatedData.currentMedicines = cleanInput;
          if (!updatedData.allergies) updatedData.allergies = 'None reported';
        }
      } else if (currentStage === 'family_history') {
        updatedData.familyHistory = cleanInput;
      } else if (currentStage === 'personal_lifestyle') {
        updatedData.personalHistory = cleanInput;
        // Check for diet indicators
        if (/veg|vegetarian|शाकाहारी/i.test(cleanInput)) updatedData.dietType = 'Vegetarian';
        else if (/non-veg|egg|meat|मांसाहारी/i.test(cleanInput)) updatedData.dietType = 'Non-Vegetarian';
      } else if (currentStage === 'ayush_digestive') {
        updatedData.reviewOfSystems = cleanInput;
        // Evaluate Agni / Koshta keywords
        if (/heavy|sluggish|bloat|कम भूख|मंद/i.test(cleanInput)) {
          updatedData.ayushAgni = 'Mandagni (Sluggish)';
        } else if (/hyperacid|burning|तीक्ष्ण|जलन|तेज भूख/i.test(cleanInput)) {
          updatedData.ayushAgni = 'Tikshnagni (High acid/intense)';
        } else if (/irregular|gas|variable|कभी कम कभी ज्यादा/i.test(cleanInput)) {
          updatedData.ayushAgni = 'Vishamagni (Variable / Vata)';
        } else {
          updatedData.ayushAgni = 'Samagni (Balanced)';
        }

        if (/constipat|hard|dry|कब्ज|कठिन/i.test(cleanInput)) {
          updatedData.ayushKoshta = 'Krura (Hard / Constipated)';
        } else if (/loose|frequent|पतला दस्त/i.test(cleanInput)) {
          updatedData.ayushKoshta = 'Mridu (Soft / Sensitive)';
        } else {
          updatedData.ayushKoshta = 'Madhyama (Regular / Normal)';
        }
      }
    }

    // 4. Determine next stage
    let nextStageIndex = INTERVIEW_STAGES.indexOf(currentStage) + 1;
    let isComplete = false;
    let nextStage = currentStage;

    if (cleanInput) {
      if (nextStageIndex < INTERVIEW_STAGES.length) {
        nextStage = INTERVIEW_STAGES[nextStageIndex];
      } else {
        isComplete = true;
      }
    }

    // 5. Generate conversational AI response / next question
    let aiMessage = '';

    if (lang === 'hi') {
      if (!cleanInput) {
        // Initial welcome question
        aiMessage = 'नमस्ते! मैं आपका आयुष क्लिनिकल एआई सहायक हूँ। कृपया मुझे बताएं कि आपको आज क्या मुख्य तकलीफ या लक्षण (Chief Complaint) महसूस हो रहे हैं? (आप बोलकर या लिखकर उत्तर दे सकते हैं)';
      } else if (isComplete) {
        aiMessage = 'धन्यवाद! आपके स्वास्थ्य का संपूर्ण इतिहास दर्ज कर लिया गया है। अब आप अपनी पुरानी मेडिकल रिपोर्ट्स / पर्चे (Prescriptions, Blood reports) अपलोड कर सकते हैं, ताकि डॉक्टर के लिए एक संपूर्ण क्लिनिकल सारांश तैयार किया जा सके।';
      } else {
        switch (nextStage) {
          case 'hpi':
            aiMessage = `मैंने दर्ज कर लिया: "${cleanInput}". यह तकलीफ कब से है, क्या यह किसी विशेष समय पर (जैसे भोजन के बाद, सुबह या रात में) अधिक होती है? दर्द की तीव्रता 1 से 10 के पैमाने पर कितनी है?`;
            break;
          case 'past_history':
            aiMessage = 'क्या आपको पहले से कोई पुरानी बीमारी (जैसे डायबिटीज, बीपी, थायराइड, पीलिया) या कोई पिछली सर्जरी/ऑपरेशन का इतिहास है?';
            break;
          case 'medications_allergies':
            aiMessage = 'वर्तमान में आप कौन-कौन सी दवाइयां या आयुर्वेदिक औषधियां ले रहे हैं? क्या आपको किसी दवा या खाद्य पदार्थ से कोई ज्ञात एलर्जी है?';
            break;
          case 'family_history':
            aiMessage = 'क्या आपके परिवार में किसी को गठिया (Arthritis), मधुमेह, उच्च रक्तचाप या कोई अन्य आनुवंशिक रोग का इतिहास है?';
            break;
          case 'personal_lifestyle':
            aiMessage = 'आपकी दैनिक जीवनशैली कैसी है? भोजन का प्रकार (शाकाहारी/मांसाहारी), नींद की गुणवत्ता (गहरी या टूटी हुई), और रोजाना पानी का सेवन कैसा रहता है?';
            break;
          case 'ayush_digestive':
            aiMessage = 'आयुर्वेदिक मूल्यांकन हेतु: आपकी भूख कैसी है (नियमित, बहुत तेज या मंद)? क्या पेट में गैस, खट्टी डकार या कब्ज की समस्या रहती है? पेट साफ होने की प्रकृति कैसी है?';
            break;
          default:
            aiMessage = 'स्वास्थ्य इतिहास सफलतापूर्वक संकलित हो चुका है। कृपया अपनी पुरानी जांच रिपोर्ट अपलोड करने हेतु आगे बढ़ें।';
        }
      }
    } else {
      // English mode
      if (!cleanInput) {
        aiMessage = 'Hello! I am your AyushCase Clinical AI Assistant. To help your doctor understand your health before consultation, please describe your main symptom or health concern (Chief Complaint). You can type or use the voice button.';
      } else if (isComplete) {
        aiMessage = 'Thank you! Your clinical health history has been comprehensively recorded. You can now proceed to upload your previous medical documents (Prescriptions, Lab tests, Discharge summaries) to generate a physician-ready clinical summary.';
      } else {
        switch (nextStage) {
          case 'hpi':
            aiMessage = `Understood: "${cleanInput}". How long have you had this issue, and when is it most noticeable (e.g. after meals, mornings, physical activity)? On a scale of 1 to 10, how severe is the discomfort?`;
            break;
          case 'past_history':
            aiMessage = 'Do you have any past medical conditions (such as Diabetes, Hypertension, Thyroid issues, Jaundice) or previous surgeries/hospital stays?';
            break;
          case 'medications_allergies':
            aiMessage = 'What medicines or herbal supplements are you currently taking? Do you have any known drug allergies (e.g. Penicillin, Sulfa) or food intolerances?';
            break;
          case 'family_history':
            aiMessage = 'Is there any family history of chronic illnesses, such as Osteoarthritis, Diabetes, Heart disease, or Autoimmune disorders?';
            break;
          case 'personal_lifestyle':
            aiMessage = 'How would you describe your lifestyle routine? Please tell me about your dietary preferences (Veg / Non-Veg), sleep schedule, daily water intake, and physical activity.';
            break;
          case 'ayush_digestive':
            aiMessage = 'For Ayurvedic digestive assessment (Agni & Koshta): How is your appetite (steady, erratic, or sluggish)? Do you experience acidity, bloating, or bowel irregularity / constipation?';
            break;
          default:
            aiMessage = 'Clinical history gathering complete. Please proceed to upload your prior medical reports.';
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
