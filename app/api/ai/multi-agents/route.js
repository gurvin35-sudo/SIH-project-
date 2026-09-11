import { NextResponse } from 'next/server';
import { generateLLMResponse } from '@/lib/ai-provider';

export const dynamic = 'force-dynamic';

// 4 Specialized AI Agents Configuration & Domain Rules
export const AGENT_PERSONAS = {
  ayur_vaidya: {
    id: 'ayur_vaidya',
    name: '🌿 AyurVaidya AI',
    title: 'Classical Ayurvedic Consultant & Prakriti Specialist',
    description: 'Expert in Tridosha (Vata, Pitta, Kapha), Prakriti, Dinacharya, classical herbs, and Pathya-Apathya diet.',
    greetingEn: 'Namaste! I am AyurVaidya AI, specialized in classical Ayurveda, Dosha balance, herbal formulations, and personalized diet regimens. How may I assist your Ayurvedic journey today?',
    greetingHi: 'नमस्ते! मैं आयुर्वैद्य एआई हूँ। मैं त्रिदोष (वात, पित्त, कफ), प्रकृति, शास्त्रीय जड़ी-बूटियों एवं पथ्य-अपथ्य आहार पर परामर्श देने के लिए उपलब्ध हूँ। आज मैं आपकी क्या सहायता करूँ?',
    sampleQuestions: [
      'What dietary changes balance aggravated Pitta dosha?',
      'Explain the health benefits and contraindications of Ashwagandha.',
      'How to determine whether a condition is Vata or Kapha dominant?',
      'What are the classical rules for Dinacharya (daily routine)?'
    ]
  },
  clinical_pariksha: {
    id: 'clinical_pariksha',
    name: '📋 Clinical Pariksha Assistant',
    title: 'Doctor & Practitioner Clinical Case Guide',
    description: 'Assists clinicians with Ashtavidha & Dashavidha Pariksha, Nadi diagnosis, Agni/Koshta profiling, and dual ICD-11 mapping.',
    greetingEn: 'Hello Doctor! I am your Clinical Pariksha Assistant. I assist AYUSH practitioners with pulse examination (Nadi), tongue (Jihva), digestive fire (Agni), dual ICD-11 diagnosis, and Panchakarma protocols.',
    greetingHi: 'प्रणाम वैद्य जी! मैं क्लिनिकल परीक्षा सहायक हूँ। मैं अष्टविध परीक्षा (नाड़ी, जिह्वा, मल, मूत्र आदि), अग्नि-कोष्ठ मूल्यांकन और दोहरे आयुष-आधुनिक निदान में आपकी सहायता कर सकता हूँ।',
    sampleQuestions: [
      'How to differentiate Sarpa Gati vs Manduka Gati in Nadi Pariksha?',
      'What is the dual Ayurvedic and ICD-11 mapping for Sandhigatavata?',
      'Protocols for Janu Basti and Patra Pinda Sweda in knee osteoarthritis.',
      'How to evaluate Vishamagni vs Mandagni in clinical case-taking?'
    ]
  },
  herb_drug_safety: {
    id: 'herb_drug_safety',
    name: '🔬 AyushGuard (Herb-Drug Safety)',
    title: 'Botanical Pharmacology & Drug Interaction Specialist',
    description: 'Monitors interactions between Ayurvedic formulations and modern allopathic medications, dosage cautions, and pregnancy safety.',
    greetingEn: 'Welcome to AyushGuard. I analyze safety boundaries, herb-drug interactions (e.g. Guggulu with Statins, Shunthi with Anticoagulants), and organ-specific cautions.',
    greetingHi: 'आयुषगार्ड (हर्ब-ड्रग सेफ्टी) में आपका स्वागत है। मैं आयुर्वेदिक औषधियों एवं एलोपैथिक दवाओं के परस्पर प्रभाव (Herb-Drug Interactions), सुरक्षा चेतावनियों एवं सही अनुपान की जानकारी देता हूँ।',
    sampleQuestions: [
      'Can a patient taking Metformin take Shilajit and Karela Churna safely?',
      'Interactions between blood thinners (Warfarin/Aspirin) and Guggulu or Garlic.',
      'Are there safety cautions for High Pitta patients taking Trikatu Churna?',
      'Which Ayurvedic rasayanas should be avoided during pregnancy?'
    ]
  },
  patient_navigator: {
    id: 'patient_navigator',
    name: '🩺 AyushCare (Patient Companion)',
    title: 'Patient Guidance & Symptom Companion',
    description: 'Explains health terms in simple language, guides pre-consultation readiness, and provides lifestyle tips.',
    greetingEn: 'Hello! I am your AyushCare Patient Companion. I help you understand your symptoms, explain how to take medicines with warm water/milk, and guide you before consulting your doctor.',
    greetingHi: 'नमस्ते! मैं आयुषकेयर पेशेंट साथी हूँ। मैं आपके लक्षणों को सरल भाषा में समझाने, दवाइयों को सही अनुपान (गर्म पानी/दूध) के साथ लेने और डॉक्टर से मिलने से पहले तैयारी में मदद करता हूँ।',
    sampleQuestions: [
      'What does it mean if my doctor prescribed Triphala with Ushnodaka (warm water)?',
      'Simple home remedies and diet tips for morning joint stiffness.',
      'How does Prakriti assessment help in choosing the right daily routine?',
      'What documents should I upload before my Ayurvedic doctor consultation?'
    ]
  }
};

// Broad Domain Filter: Rejects non-medical / non-health spam
function isQueryInDomain(query) {
  if (!query || !query.trim()) return false;
  const lower = query.toLowerCase();

  const nonMedicalSpam = /(write code|python script|javascript function|write java|c\+\+ program|crypto price|bitcoin|stock market|who is the prime minister|who is the president|movie review|ipl match score|cricket score|hack wifi|hack instagram|hack facebook)/i;
  
  if (nonMedicalSpam.test(lower)) {
    return false;
  }

  return true;
}

export async function GET(request) {
  return NextResponse.json({
    success: true,
    agents: Object.values(AGENT_PERSONAS)
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      agentId = 'ayur_vaidya',
      message = '',
      language = 'en',
      conversationHistory = []
    } = body;

    const lang = language === 'hi' ? 'hi' : 'en';
    const cleanMsg = message ? message.trim() : '';

    const selectedAgent = AGENT_PERSONAS[agentId] || AGENT_PERSONAS.ayur_vaidya;

    // 1. If empty message, return greeting
    if (!cleanMsg) {
      return NextResponse.json({
        success: true,
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        response: lang === 'hi' ? selectedAgent.greetingHi : selectedAgent.greetingEn,
        sampleQuestions: selectedAgent.sampleQuestions
      });
    }

    // 2. Project Identity & Meta Question Handler
    const isIdentityQuestion = /(who built you|who made you|who created you|what is your name|who are you|what is this website|what is this project|what is ayushcase|aapko kisne banaya|aapka naam kya hai|kon ho tum|who is your developer|about this app|tell me about yourself)/i.test(cleanMsg);
    
    if (isIdentityQuestion) {
      const identityMsg = lang === 'hi'
        ? `नमस्ते! मैं **${selectedAgent.name}** हूँ — **AyushCase** का आधिकारिक क्लिनिकल एआई सहायक। AyushCase को **स्मार्ट इंडिया हैकाथॉन (SIH 2026)** के आयुष मंत्रालय (Ministry of Ayush) प्रॉब्लम स्टेटमेंट के तहत विकसित किया गया है।\n\nमेरा मुख्य कार्य आयुष चिकित्सकों और मरीजों को शास्त्रीय त्रिदोष मूल्यांकन, अष्टविध परीक्षा, डिजिटल प्री-कंसल्टेशन और हर्ब-ड्रग सुरक्षा में सहायता करना है।`
        : `Namaste! I am **${selectedAgent.name}**, an official Clinical AI Assistant developed for **AyushCase** — the Smart Automation AYUSH Patient Case-Taking & Clinical Decision Support System built for the **Smart India Hackathon (SIH 2026)** under the Ministry of Ayush theme.\n\nMy purpose is to assist clinicians and patients with classical Ayurvedic assessment, Ashtavidha Pariksha, pre-consultation digitization, and herbal pharmacology.`;

      return NextResponse.json({
        success: true,
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        response: identityMsg,
        isIdentity: true,
        inDomain: true
      });
    }

    // 2.5. Intelligent Greetings & Small Talk Handler
    const isGreeting = /^(hi|hello|hey|namaste|namaskar|pranam|helo|hii|hiii|good\s+morning|good\s+evening|good\s+afternoon|how\s+are\s+you|kya\s+hal\s+hai|shuru\s+karein|help)$/i.test(cleanMsg.trim());
    
    if (isGreeting) {
      let greetResponse = '';
      if (agentId === 'clinical_pariksha') {
        greetResponse = lang === 'hi'
          ? `प्रणाम वैद्य जी! मैं **क्लिनिकल परीक्षा सहायक** हूँ। मैं अष्टविध परीक्षा (नाड़ी, जिह्वा, मल, मूत्र आदि), अग्नि-कोष्ठ मूल्यांकन, दोहरे ICD-11 निदान एवं पंचकर्म प्रोटोकॉल में आपकी सहायता कर सकता हूँ। आप किस नैदानिक विषय पर चर्चा करना चाहते हैं?`
          : `Hello Doctor! I am your **Clinical Pariksha Assistant**. I assist AYUSH clinicians with pulse diagnosis (Nadi), tongue examination (Jihva), Agni/Koshta profiling, dual ICD-11 mapping, and Panchakarma regimens. How may I assist your clinical evaluation today?`;
      } else if (agentId === 'herb_drug_safety') {
        greetResponse = lang === 'hi'
          ? `नमस्ते! मैं **आयुषगार्ड (Herb-Drug Safety)** हूँ। मैं आयुर्वेदिक औषधियों और एलोपैथिक दवाओं के परस्पर प्रभाव (Drug Interactions), खुराक सावधानियों और अंग सुरक्षा पर परामर्श देता हूँ। आप किस दवा के संबंध में जानकारी चाहते हैं?`
          : `Hello! I am **AyushGuard**, your Botanical Pharmacology & Drug Interaction specialist. I analyze herb-drug safety boundaries (e.g. Guggulu with Blood Thinners, Shilajit with Metformin). Which formulation would you like me to check?`;
      } else if (agentId === 'patient_navigator') {
        greetResponse = lang === 'hi'
          ? `नमस्ते! मैं **आयुषकेयर** — आपका पेशेंट साथी हूँ। मैं आपके स्वास्थ्य लक्षणों को सरल भाषा में समझाने, दवाइयों को सही अनुपान (गर्म पानी/दूध) के साथ लेने और डॉक्टर से मिलने की तैयारी में मदद करता हूँ। आप क्या पूछना चाहते हैं?`
          : `Hello! I am **AyushCare**, your patient companion. I explain symptoms in simple words, guide proper Anupana rules (how to take herbal formulations with warm water or milk), and help you prepare for your consultation. What health question do you have?`;
      } else {
        greetResponse = lang === 'hi'
          ? `नमस्ते! मैं **आयुर्वैद्य एआई** हूँ — आपका शास्त्रीय आयुर्वेदिक सलाहकार।\n\nमैं आपकी निम्नलिखित विषयों में सहायता कर सकता हूँ:\n1. **त्रिदोष संतुलन:** वात, पित्त और कफ दोष के लक्षण एवं सुधार।\n2. **पथ्य-अपथ्य आहार:** रोग व प्रकृति अनुकूल भोजन नियम।\n3. **शास्त्रीय औषधियां:** अश्वगंधा, त्रिफला, गिलोय, शतावरी आदि का सही प्रयोग।\n4. **दिनचर्या व योग:** दैनिक स्वास्थ्य नियम एवं प्राणायाम।\n\nआज आप किस स्वास्थ्य विषय या लक्षण के बारे में परामर्श चाहते हैं?`
          : `Namaste! I am **AyurVaidya AI**, your classical Ayurvedic clinical consultant.\n\nI can assist you with:\n1. **Tridosha Balance:** Identifying Vata, Pitta, and Kapha imbalances.\n2. **Pathya-Apathya Diet:** Personalized Ayurvedic nutrition and home remedies.\n3. **Classical Formulations:** Proper usage and Anupana for herbs (Ashwagandha, Triphala, Giloy, etc.).\n4. **Dinacharya & Yoga:** Circadian routines and seasonal wellness.\n\nWhat health question or symptom would you like to explore today?`;
      }

      return NextResponse.json({
        success: true,
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        response: greetResponse,
        inDomain: true
      });
    }

    // 3. Strict Domain Boundary Check
    const inDomain = isQueryInDomain(cleanMsg);
    if (!inDomain) {
      const refusalMsg = lang === 'hi'
        ? `नमस्ते! मैं **AyushCase क्लिनिकल एआई** हूँ और केवल आयुष, आयुर्वेद, स्वास्थ्य एवं क्लिनिकल परामर्श से संबंधित प्रश्नों के लिए विशेषीकृत हूँ। कृपया स्वास्थ्य, रोग, लक्षण, त्रिदोष, आहार अथवा औषधियों से जुड़ा प्रश्न पूछें।`
        : `Namaste! I am an **AyushCase Clinical AI Agent** specialized in AYUSH healthcare, clinical assessment, and herbal safety. I cannot assist with non-medical topics like programming or general trivia. Please ask a question related to symptoms, conditions (e.g. diabetes, arthritis, acidity), Dosha balance, or medications.`;

      return NextResponse.json({
        success: true,
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        response: refusalMsg,
        isOutOfDomain: true
      });
    }

    // 4. Try Live LLM (Groq Open Models / Gemini / OpenAI)
    const formatRule = "FORMATTING: Use clean bullet points, numbered lists, and bold key terms. DO NOT use markdown table pipes (|) or HTML tags (<br>). Keep the answer direct, practical, and highly detailed.";
    
    const systemPrompts = {
      ayur_vaidya: `You are AyurVaidya AI, an expert classical Ayurvedic clinician on the AyushCase system. Language: ${lang === 'hi' ? 'Hindi' : 'English'}. For any health condition or question asked, provide: 1. Ayurvedic root cause (Dosha: Vata/Pitta/Kapha, Agni, Ama), 2. Pathya diet (Foods to eat) & Apathya (Foods to avoid), 3. Classical Ayurvedic herbs with Anupana, 4. Lifestyle & Dinacharya. ${formatRule}`,
      clinical_pariksha: `You are Clinical Pariksha Assistant, a clinical guide for doctors on the AyushCase system. Language: ${lang === 'hi' ? 'Hindi' : 'English'}. Assist practitioners with Ashtavidha Pariksha (Nadi pulse, Jihva tongue, Mala, Mutra), Agni/Koshta, ICD-11 dual diagnosis mapping, and Panchakarma protocols. ${formatRule}`,
      herb_drug_safety: `You are AyushGuard, an AI botanical pharmacology specialist on the AyushCase system. Language: ${lang === 'hi' ? 'Hindi' : 'English'}. Analyze herb-drug interactions, allopathic co-administration safety, organ precautions, and contraindications. ${formatRule}`,
      patient_navigator: `You are AyushCare, a patient companion on the AyushCase system. Language: ${lang === 'hi' ? 'Hindi' : 'English'}. Explain medical conditions in simple terms, Anupana dosage rules (how to take with warm water/milk), and pre-consultation guidance. ${formatRule}`
    };

    const llmResult = await generateLLMResponse({
      systemPrompt: systemPrompts[agentId] || systemPrompts.ayur_vaidya,
      userMessage: cleanMsg,
      conversationHistory
    });

    if (llmResult?.text && typeof llmResult.text === 'string' && llmResult.text.trim().length > 30) {
      const cleanedResponse = String(llmResult.text)
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .trim();

      if (cleanedResponse.length > 20) {
        return NextResponse.json({
          success: true,
          agentId: selectedAgent.id,
          agentName: selectedAgent.name,
          response: cleanedResponse,
          provider: llmResult.provider,
          inDomain: true
        });
      }
    }

    // 5. Comprehensive Classical AYUSH Fallback Knowledge Matrix (Offline / Zero-API)
    let responseText = '';
    const lower = cleanMsg.toLowerCase();

    // Condition 1: Acidity / Pitta / GERD / Amlapitta
    if (lower.includes('pitta') || lower.includes('acid') || lower.includes('burning') || lower.includes('gerd') || lower.includes('पित्त') || lower.includes('acidity') || lower.includes('gastric') || lower.includes('heartburn') || lower.includes('खट्टी डकार')) {
      if (agentId === 'herb_drug_safety') {
        responseText = lang === 'hi'
          ? `🔬 **आयुषगार्ड — अम्लपित्त एवं एंटासिड सुरक्षा (Herb-Drug Interaction):**
* **एंटासिड्स (Omeprazole, Pantoprazole) के साथ:** अविपत्तिकर चूर्ण अथवा कामदुधा रस लेते समय एलोपैथिक PPI दवा के बीच कम से कम 1 घंटे का अंतराल रखें।
* **सावधानी:** पित्त वृद्धि की अवस्था में तीक्ष्ण उष्ण द्रव्य जैसे त्रिकटु, पिप्पली, अथवा अत्यधिक लहसुन का सेवन बंद करें।
* **सुरक्षित अनुपान:** शीतल जल, शुद्ध गाय का दूध, अथवा मुनक्का स्वरस।`
          : `🔬 **AyushGuard — Acidity & Herb-Drug Safety Guidance:**
* **Co-administration with PPIs (Pantoprazole, Omeprazole):** Maintain a 60-minute gap between Avipattikar Churna / Kamadudha Rasa and modern antacids to ensure optimal gastrointestinal absorption.
* **Contraindications:** Avoid heating spices (Trikatu, excess black pepper, raw garlic) during acute hyperacidity.
* **Safe Anupana:** Cool water, fresh coconut water, or lukewarm goat/cow milk.`;
      } else {
        responseText = lang === 'hi'
          ? `🌿 **अम्लपित्त एवं पित्त दोष (Acidity & High Pitta) — सम्पूर्ण समाधान:**
1. **मूल कारण (हेतु):** अत्यधिक तीखा, खट्टा, तला हुआ भोजन, देर रात तक जागना एवं खाली पेट चाय-कॉफी पीने से पित्त दोष प्रकुपित होकर आमाशय में विदग्धता उत्पन्न करता है।
2. **पथ्य आहार (क्या खाएं):** 
   - शुद्ध गाय का घी (1 चम्मच भोजन में)।
   - नारियल पानी, मुनक्का (भिगोकर), खीरा, तरबूज, अनार एवं सौंफ का पानी।
   - पुराना जौ, सावां चावल एवं मिश्री युक्त ठंडा दूध।
3. **अपथ्य (क्या न खाएं):** 
   - लाल मिर्च, सिरका, टमाटर सॉस, अचार, शराब, सिगरेट एवं बासी भोजन।
   - दिन में सोना और रात में देर से खाना।
4. **शास्त्रीय औषधियां (चिकित्सक परामर्श अनुसार):**
   - **अविपत्तिकर चूर्ण:** 3 ग्राम भोजन से 15 मिनट पूर्व गुनगुने पानी से।
   - **कामदुधा रस (मुक्तायुक्त):** 1 वटी दिन में दो बार।
   - **शतावरी चूर्ण:** 3 ग्राम रात्रि में दूध के साथ (आमाशय की म्यूकोसा की रक्षा हेतु)।
5. **दिनचर्या व योग:** शीतली एवं शीतकारी प्राणायाम, चंद्र नमस्कार, एवं नियमित भोजन समय।`
          : `🌿 **Ayurvedic Management for Acidity & High Pitta (Amlapitta):**
1. **Etiopathogenesis:** Aggravated Pitta with increased *Vidagdha* (acidic ferment) in the stomach caused by pungent, sour, fried foods, irregular meal schedules, and mental stress.
2. **Pathya (Recommended Diet):**
   - Pure Cow's Ghee (1 tsp with warm meals to soothe gastric mucosa).
   - Fresh coconut water, soaked black raisins (*Munakka*), cucumber, fennel infusion, sweet pomegranate.
   - Barley, aged rice, coriander seed water.
3. **Apathya (Foods to Avoid):**
   - Excess red chillies, vinegar, fried snacks, sour curds at night, carbonated beverages, empty-stomach coffee.
4. **Classical Herbal Formulations:**
   - **Avipattikar Churna:** 3g before main meals with lukewarm water.
   - **Kamadudha Rasa (Mukta-yukta):** 1 tablet twice daily for neutralizing gastric acid.
   - **Shatavari Churna:** 3-5g with milk at bedtime to protect the epithelial lining.
5. **Lifestyle & Yoga:** Practice Sheetali and Sheetkari Pranayama, avoid direct midday sun exposure, and adhere to regular circadian meal timings.`;
      }
    }
    // Condition 2: Joint Pain / Arthritis / Sandhigatavata / Amavata / Vata
    else if (lower.includes('joint') || lower.includes('pain') || lower.includes('arthritis') || lower.includes('घुटने') || lower.includes('दर्द') || lower.includes('वात') || lower.includes('vata') || lower.includes('amavata') || lower.includes('sandhi') || lower.includes('back pain') || lower.includes('sciatica')) {
      if (agentId === 'clinical_pariksha') {
        responseText = lang === 'hi'
          ? `📋 **क्लिनिकल परीक्षा — संधिवात एवं आमवात (Arthritis Clinical Protocol):**
1. **अष्टविध परीक्षा भेद:** 
   - **संधिवात (OA):** शुष्क वातज नाड़ी (सर्प गति), जोड़ों में क्रैपिटस (कटकट ध्वनि), शुष्कता, विश्राम से राहत।
   - **आमवात (RA):** साम वात-कफ नाड़ी, जिह्वा पर श्वेत लेप (आम), प्रातःकालीन जकड़न (Morning Stiffness > 1 hr), ज्वरवत वेदना।
2. **ICD-11 Dual Mapping:** 
   - Sandhigatavata ➔ **ICD-11: FA00 (Osteoarthritis of knee)**.
   - Amavata ➔ **ICD-11: FA20 (Rheumatoid Arthritis)**.
3. **पंचकर्म प्रोटोकॉल:** जानु बस्ति (महानारायण/क्षीरबला तेल), पत्रपिंड स्वेद, एवं दीपन-पाचन हेतु वैश्वानर चूर्ण।`
          : `📋 **Clinical Case Protocol — Joint Pain (Sandhigatavata vs Amavata):**
1. **Differential Diagnosis Matrix:**
   - **Sandhigatavata (Osteoarthritis):** Vata dominance, localized crepitus (*Sandhisphutana*), degenerative changes, aggravated by exertion.
   - **Amavata (Rheumatoid Arthritis):** Ama + Vata pathogenesis, Saama Jihva (coated tongue), generalized morning stiffness, migrating polyarthritis.
2. **ICD-11 Dual Diagnostic Mapping:**
   - *Sandhigatavata* ➔ **ICD-11: FA00 Osteoarthritis of Knee**.
   - *Amavata* ➔ **ICD-11: FA20 Rheumatoid Arthritis**.
3. **Panchakarma Procedures:** Janu Basti (with Sahacharadi/Mahanarayana Taila), Valuka Sweda (dry sand poultice for Saama stage), and Patra Pinda Sweda.`;
      } else {
        responseText = lang === 'hi'
          ? `🌿 **संधिवात एवं जोड़ों के दर्द (Joint Pain & Arthritis) — सम्पूर्ण प्रोटोकॉल:**
1. **दोष व संप्राप्ति:** संधियों में वात दोष का संचय और स्निग्धता का क्षय होने से जोड़ों में दर्द, सूजन व अकड़न होती है।
2. **पथ्य आहार:** गर्म ताजा सुपाच्य भोजन, गाय का घी, तिल का तेल, लहसुन, अदरक, मेथी दाना, मुनक्का, अखरोट एवं गर्म हल्दी दूध।
3. **अपथ्य:** ठंडा पानी, फ्रिज का खाना, उड़द की दाल, राजमा, छोले, कच्चा सलाद, और एसी की सीधी ठंडी हवा।
4. **शास्त्रीय औषधियां:**
   - **योगराज गुग्गुलु / सिंहनाद गुग्गुलु:** 2-2 वटी दिन में दो बार भोजनोपरांत गुनगुने पानी से।
   - **रास्नादि क्वाथ:** 20 ml बराबर पानी मिलाकर सुबह-शाम।
   - **महानारायण तेल / विषगर्भ तेल:** जोड़ों पर हल्के हाथ से मालिश कर सिकाई करें।
5. **पंचकर्म व व्यायाम:** जानु बस्ति, कटि बस्ति, एवं सूक्ष्म व्यायाम।`
          : `🌿 **Ayurvedic Protocol for Joint Pain & Osteoarthritis (Sandhigatavata):**
1. **Etiopathogenesis:** Aggravation of Ruksha (dry) and Sheeta (cold) qualities of Vata depleting *Shleshaka Kapha* (synovial fluid) in joints.
2. **Pathya (Recommended Diet):** Freshly cooked warm unctuous meals, cow's ghee, garlic, ginger, soaked almonds, sesame seeds, and golden turmeric milk at night.
3. **Apathya (Foods to Avoid):** Cold refrigerated food, carbonated sodas, heavy dry legumes (Rajma, Chana), raw nightshades, and prolonged exposure to cold air.
4. **Classical Formulations:**
   - **Yograj Guggulu:** 2 tablets twice daily after meals with warm water.
   - **Rasnadi Kwath:** 20ml with equal warm water twice daily.
   - **Mahanarayana Taila / Ksheerabala Taila:** Topical warm oil massage followed by hot fomentation.
5. **Panchakarma & Yoga:** Janu Basti, Patra Pinda Sweda, and gentle Sukshma Vyayama.`;
      }
    }
    // Condition 3: Diabetes / Sugar / Madhumeha / Prameha
    else if (lower.includes('diabet') || lower.includes('sugar') || lower.includes('मधुमेह') || lower.includes('शुगर') || lower.includes('prameha')) {
      responseText = lang === 'hi'
        ? `🌿 **मधुमेह (Diabetes / Madhumeha) — आयुर्वेदिक दृष्टिकोण एवं आहार नियम:**
1. **दोष प्रभाव:** कफ एवं मेद धातु की विकृति के कारण वात प्रकोप (कफज से वातज प्रमेह)।
2. **पथ्य आहार (क्या खाएं):** जौ (Yava), करेला, जामुन, मेथी दाना का पानी, पुराना चावल, आंवला, दालचीनी एवं सहजन (Moringa)।
3. **अपथ्य (क्या न खाएं):** चीनी, गुड़, मिठाई, मैदा, नया चावल, मीठे फल (चीकू, आम), दही का रात में सेवन, एवं दिन में सोना।
4. **शास्त्रीय औषधियां:** 
   - **मेषशृंगी (गुड़मार) चूर्ण:** 3g भोजन से 20 मिनट पूर्व।
   - **निशा-आमलकी चूर्ण (हल्दी + आंवला):** 3g गुनगुने पानी से सुबह-शाम।
   - **चंद्रप्रभा वटी / वसंत कुसुमाकर रस:** 1-2 वटी रीनल व मेटाबॉलिक सपोर्ट हेतु।
5. **दिनचर्या:** नित्य 45 मिनट तेज चलना, कपालभाति एवं मंडूकासन का अभ्यास।`
        : `🌿 **Ayurvedic Management for Diabetes Mellitus (Madhumeha):**
1. **Etiopathogenesis (Samprapti):** Characterized as *Kaphaja Prameha* progressing to *Dhatukshaya* and Vata aggravation affecting the Medas (adipose) and Mutra (urinary) channels.
2. **Pathya (Recommended Diet):** Barley (Yava), bitter gourd (Karela), Jamun seed powder, Fenugreek (Methi) water, Cinnamon infusion, Amla, and drumstick leaves.
3. **Apathya (Foods to Avoid):** Refined sugars, jaggery, bakery items, heavy unctuous milk products, late dinners, and day-sleeping (*Divasvapna*).
4. **Classical Herbal Formulations:**
   - **Nisha-Amalaki Churna:** (Turmeric + Indian Gooseberry) 3g twice daily before meals with lukewarm water.
   - **Meshashringi (Gymnema Sylvestre / 'Sugar Destroyer'):** 500mg extract or 3g churna.
   - **Shilajitvadi Vati / Chandraprabha Vati:** 1-2 tablets twice daily for renal & metabolic support.
5. **Lifestyle & Yoga:** Daily brisk walking (minimum 45 min), Mandukasana, Paschimottanasana, and Kapalabhati Pranayama.`;
    }
    // Condition 4: Ashwagandha
    else if (lower.includes('ashwagandha') || lower.includes('अश्वगंधा')) {
      responseText = lang === 'hi'
        ? `🌿 **अश्वगंधा (Withania somnifera) — शास्त्रीय प्रोफाइल एवं लाभ:**
1. **रस-गुण-वीर्य:** तिक्त-कषाय रस, स्निग्ध गुण, उष्ण वीर्य, मधुर विपाक।
2. **दोष कर्म:** वात एवं कफ दोष का सर्वोत्तम शमन करता है; मेध्य एवं रसायन द्रव्य है।
3. **मुख्य लाभ:**
   - मानसिक तनाव (Cortisol) कम करता है एवं गहरी निद्रा लाता है।
   - मांसपेशियों की शक्ति (Bala) एवं ओज (Immunity) बढ़ाता है।
   - जोड़ों के दर्द व नसों की कमजोरी में लाभकारी।
4. **सेवन विधि एवं अनुपान:** 3-5 ग्राम चूर्ण अथवा 1-1 वटी रात्रि में गुनगुने दूध एवं 1/2 चम्मच गाय के घी के साथ।
5. **सावधानी:** तीव्र पित्त प्रकोप, अल्सर, अथवा गर्भावस्था में बिना चिकित्सक सलाह न लें।`
        : `🌿 **Ashwagandha (Withania somnifera) — Clinical Monograph:**
1. **Pharmacodynamics:** Tikta-Kashaya (Bitter/Astringent) taste, Snigdha (Unctuous), Ushna (Heating) potency, Madhura Vipaka.
2. **Dosha Karma:** Premier pacifier of Vata and Kapha; revitalizes Ojas and cognitive stamina.
3. **Key Clinical Indications:**
   - Adaptogenic stress and cortisol regulation, insomnia, and nervous exhaustion.
   - Neuromuscular rehabilitation, muscle building, and joint stamina.
   - Immune modulation (*Rasayana*) and male reproductive vitality (*Vajikarana*).
4. **Dosage & Anupana:** 3-5g Churna with warm boiled milk and half teaspoon pure cow's ghee at bedtime.
5. **Contraindications:** High acute Pitta with ulceration, severe hyperthyroidism, and unmonitored pregnancy.`;
    }
    // Condition 5: Triphala
    else if (lower.includes('triphala') || lower.includes('त्रिफला')) {
      responseText = lang === 'hi'
        ? `🌿 **त्रिफला (आंवला, हरड़, बहेड़ा) — त्रिदोष शामक रसायन:**
1. **घटक:** आमलकी (पित्त शामक), हरीतकी (वात शामक), बिभीतकी (कफ शामक)।
2. **लाभ:** आंतों की सफाई, कब्ज निवारण, आंखों की रोशनी बढ़ाना, और कोलेस्ट्रॉल नियंत्रण।
3. **सेवन विधि:**
   - **विरेचन (कब्ज हेतु):** 3-5 ग्राम चूर्ण रात को गुनगुने पानी के साथ।
   - **रसायन (कायाकल्प हेतु):** सुबह शहद व घी के साथ (विषम मात्रा में)।
4. **आंखों के लिए (त्रिफला नेत्र प्रक्षालन):** त्रिफला का उबला व छाना हुआ जल आंखों को धोने में लाभकारी है।`
        : `🌿 **Triphala (Haritaki, Bibhitaki, Amalaki) — Tridoshic Rejuvenator:**
1. **Constituents:** Amalaki (pacifies Pitta), Haritaki (pacifies Vata), Bibhitaki (pacifies Kapha).
2. **Key Benefits:** Gentle colon detoxification, peristaltic stimulation, eye health (*Chakshushya*), and antioxidant activity.
3. **Dosage & Administration:**
   - **For Regular Bowel Movement:** 3-5g powder at bedtime with warm water (*Ushnodaka*).
   - **As a Rasayana (Anti-Aging):** Morning intake with unequal parts of honey and cow ghee.
4. **Eye Care:** Triphala eyewash (*Netra Prakshalana*) strengthens optic nerves and reduces eye fatigue.`;
    }
    // Condition 6: Digestion / Constipation / Kabz / Gas / Bloating
    else if (lower.includes('digest') || lower.includes('constipat') || lower.includes('kabz') || lower.includes('gas') || lower.includes('bloat') || lower.includes('कब्ज') || lower.includes('पाचन') || lower.includes('पेट')) {
      responseText = lang === 'hi'
        ? `🌿 **पाचन विकार एवं कब्ज (Constipation & Indigestion) — आयुर्वेदिक समाधान:**
1. **मूल कारण:** मंदाग्नि एवं अपान वायु की विकृति से मल का अवरोध (विबंध)।
2. **घरेलू उपाय:**
   - सुबह उठते ही 2 गिलास गुनगुना पानी (उषापान) पिएं।
   - रात को 5-7 मुनक्का दूध में उबालकर पिएं।
   - भोजन के बाद 1/2 चम्मच सौंफ और मिश्री चबाएं।
3. **शास्त्रीय औषधियां:**
   - **त्रिफला चूर्ण / हरीतकी चूर्ण:** 3-5 ग्राम रात को गर्म पानी से।
   - **हिंग्वाष्टक चूर्ण:** 2-3 ग्राम दोपहर के भोजन के प्रथम ग्रास में घी के साथ (गैस व अफारा हेतु)।
   - **अभयारिष्ट:** 20 ml बराबर पानी मिलाकर भोजनोपरांत।
4. **अपथ्य:** मैदा, बेकरी उत्पाद, रात का बासी भोजन, और कम पानी पीना।`
        : `🌿 **Ayurvedic Management for Digestion, Gas & Constipation (Vibandha & Agnimandya):**
1. **Root Cause:** Impaired *Jatharagni* (digestive fire) and aggravated *Apana Vata* leading to sluggish peristalsis and accumulation of *Ama* (endotoxins).
2. **Dietary Recommendations:**
   - Practice *Ushapana* (drinking 2 glasses of warm water immediately upon waking).
   - Consume soaked Munakka (black raisins) or prunes with warm milk at bedtime.
   - Include cumin, ginger, and asafoetida (Hing) in daily cooking.
3. **Classical Formulations:**
   - **Triphala Churna / Haritaki Churna:** 3-5g at bedtime with warm water.
   - **Hingvashtak Churna:** 2-3g with the first morsel of food mixed with 1 tsp cow ghee (for flatulence and bloating).
   - **Abhayarishta:** 20ml with equal water after lunch and dinner.
4. **Lifestyle:** Avoid sedentary sitting after meals; practice *Vajrasana* for 10 minutes post-lunch.`;
    }
    // Condition 7: Herb-Drug Safety General
    else if (agentId === 'herb_drug_safety' || lower.includes('interact') || lower.includes('safety') || lower.includes('allopath') || lower.includes('warfarin') || lower.includes('metformin')) {
      responseText = lang === 'hi'
        ? `🔬 **आयुषगार्ड — प्रमुख हर्ब-ड्रग परस्पर प्रभाव (Pharmacovigilance Guide):**
1. **खून पतला करने वाली दवाएं (Aspirin, Warfarin, Clopidogrel):**
   - **सावधानी:** गुग्गुलु, लहसुन (Garlic), अदरक (Shunthi), एवं करक्यूमिन का अत्यधिक सेवन रक्त स्राव (Bleeding risk) बढ़ा सकता है।
2. **एंटी-डायबिटिक दवाएं (Metformin, Glimepiride):**
   - **सावधानी:** करेला, जामुन बीज, गुड़मार और शिलाजीत शुगर तेजी से गिराते हैं। हाइपोग्लाइसीमिया (Low Sugar) से बचने के लिए ग्लूकोज मॉनिटरिंग जरूरी है।
3. **एंटी-हाइपरटेंसिव (BP Medicines):**
   - **सावधानी:** सर्पगंधा अथवा अर्जुनारिष्ट लेते समय नियमित ब्लड प्रेशर चेक करें।
4. **सामान्य नियम:** एलोपैथी और आयुर्वेदिक औषधियों के बीच न्यूनतम 45 से 60 मिनट का समय अंतराल रखें।`
        : `🔬 **AyushGuard — Essential Herb-Drug Safety & Interaction Matrix:**
1. **Anticoagulants / Antiplatelets (Aspirin, Warfarin, Clopidogrel):**
   - **Warning:** High doses of *Guggulu*, *Garlic (Lashuna)*, *Ginger (Shunthi)*, and concentrated *Curcumin* exhibit mild antiplatelet synergy. Monitor INR/bleeding parameters.
2. **Oral Hypoglycemics (Metformin, Sulfonylureas, Insulin):**
   - **Warning:** *Gymnema (Meshashringi)*, *Karela*, and *Jamun* enhance insulin sensitivity. Patients must monitor glucose levels to avoid sudden hypoglycemia.
3. **Sedatives / Anxiolytics (Benzodiazepines, SSRIs):**
   - **Warning:** *Brahmi (Bacopa)* and *Tagara (Valerian)* potentiate GABAergic pathways. Avoid excessive compounding without dosage titration.
4. **General Golden Rule:** Always maintain a strict 45-60 minute gap between Allopathic medications and Ayurvedic herbal compounds.`;
    }
    // Condition 8: Nadi Pariksha / Clinical Pariksha
    else if (agentId === 'clinical_pariksha' || lower.includes('nadi') || lower.includes('pulse') || lower.includes('pariksha') || lower.includes('नाड़ी')) {
      responseText = lang === 'hi'
        ? `📋 **अष्टविध नाड़ी परीक्षा (Pulse Examination Guide):**
1. **नाड़ी परीक्षा का समय:** प्रातःकाल सूर्योदय के 2-3 घंटे बाद, जब रोगी मल-मूत्र त्याग चुका हो और खाली पेट हो।
2. **स्थान व अंगुलियां (त्रिदोष निर्धारण):**
   - **तर्जनी (Index finger):** वात नाड़ी (सर्प गति / वक्र चाल — तेज, हल्की, ठंडी)।
   - **मध्यमा (Middle finger):** पित्त नाड़ी (मण्डूक गति / मेंढक कूद — तीव्र, गर्म, उछाल युक्त)।
   - **अनामिका (Ring finger):** कफ नाड़ी (हंस/राजहंस गति — गंभीर, मंद, स्निग्ध, भारी)।
3. **विकृति निदान:** यदि नाड़ी में दो दोषों का संसर्ग हो (जैसे वात-पित्त), तो दोनों अंगुलियों पर स्पंदन का अनुभव होता है।`
        : `📋 **Clinical Pulse Diagnosis (Ashtavidha Nadi Pariksha Guide):**
1. **Optimal Timing:** Early morning (*Pratah Kala*), fasting state, post-evacuation of bowel and bladder.
2. **Tridosha Radial Pulse Finger Positions:**
   - **Index Finger (Tarjani - Root of Thumb):** Evaluates **Vata Dosha** (Movement: *Sarpa Gati* like a serpentine crawl — fast, thin, erratic).
   - **Middle Finger (Madhyama):** Evaluates **Pitta Dosha** (Movement: *Manduka Gati* like a leaping frog — bounding, hot, sharp).
   - **Ring Finger (Anamika):** Evaluates **Kapha Dosha** (Movement: *Hamsa / Gaja Gati* like a graceful swan or steady elephant — slow, heavy, deep).
3. **Clinical Integration:** Correlate Nadi with Tongue (*Jihva*), Digestive fire (*Agni*), and modern hemodynamics.`;
    }
    // General Dynamic Fallback
    else {
      responseText = lang === 'hi'
        ? `🌿 **आयुर्वेदिक क्लिनिकल परामर्श (${cleanMsg}):**
1. **त्रिदोष एवं धातु दृष्टिकोण:** प्रस्तुत स्वास्थ्य स्थिति का संबंध जठराग्नि की कार्यक्षमता और वात-पित्त-कफ के संतुलन से है।
2. **पथ्य आहार (अनुकूल आहार):**
   - ताजा पका हुआ, सुपाच्य, गुनगुना भोजन करें।
   - भोजन में शुद्ध गाय का घी, जीरा, धनिया, अदरक और हल्दी का संतुलित प्रयोग करें।
   - पर्याप्त मात्रा में गुनगुना जल (उष्णोदक) पिएं।
3. **अपथ्य (परहेज):**
   - अत्यधिक तला-भुना, तीखा, खट्टा, बासी एवं ठंडा भोजन न लें।
   - दिन में सोना एवं रात में देर तक जागना बंद करें।
4. **अनुशंसित शास्त्रीय द्रव्य:**
   - पाचन व डिटॉक्स हेतु: **त्रिफला चूर्ण** अथवा **सोंठ-जीरा क्वाथ**।
   - बल व ऊर्जा संवर्धन हेतु: **अश्वगंधा** अथवा **गिलोय (गुडूची) स्वरस**।
5. **परामर्श:** सटीक औषधि मात्रा, रोग की अवस्था एवं व्यक्तिगत प्रकृति निर्धारण हेतु अपने आयुष चिकित्सक से परामर्श लें।`
        : `🌿 **Ayurvedic Clinical Guidance for: "${cleanMsg}"**
1. **Tridoshic Etiology:** Classical Ayurveda evaluates this presentation through the balance of *Vata, Pitta, and Kapha*, metabolic digestive fire (*Jatharagni*), and tissue vitality (*Dhatus*).
2. **Pathya Regimen (Wholesome Diet):**
   - Consume freshly cooked, warm, light meals at regular circadian intervals.
   - Incorporate digestive culinary herbs: Cumin (*Jeera*), Coriander (*Dhanyaka*), Ginger (*Shunthi*), and Turmeric (*Haridra*).
   - Drink lukewarm water (*Ushnodaka*) to prevent toxic metabolic residue (*Ama*).
3. **Apathya (Foods to Avoid):**
   - Excessively oily, processed, deep-fried, sour, and heavy refrigerated foods.
   - Day-sleeping (*Divasvapna*) and late-night dinners.
4. **General Supportive Formulations:**
   - For gentle gut detox and cellular rejuvenation: **Triphala Churna** (3g with warm water at night).
   - For immune defense and tissue vitality: **Guduchi (Giloy) Ghanvati** or **Ashwagandha**.
5. **Clinical Note:** Please consult your registered AYUSH physician for tailored dosage formulations based on your Prakriti constitution.`;
    }

    return NextResponse.json({
      success: true,
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      response: responseText,
      inDomain: true
    });
  } catch (error) {
    console.error('Error in multi-agent chatbot API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate agent response', details: error.message },
      { status: 500 }
    );
  }
}
