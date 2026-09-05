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

// Domain Keywords Check: Strict Boundary Enforcement
const AYUSH_KEYWORDS = [
  'ayush', 'ayurved', 'ayurveda', 'dosha', 'vata', 'pitta', 'kapha', 'tridosha', 'prakriti', 'vikriti',
  'agni', 'koshta', 'nadi', 'jihva', 'pariksha', 'ashtavidha', 'dashavidha', 'churna', 'vati', 'taila',
  'kwath', 'asava', 'arista', 'bhasma', 'guggulu', 'triphala', 'ashwagandha', 'shatavari', 'guduchi',
  'brahmi', 'turmeric', 'curcumin', 'neem', 'amla', 'ginger', 'shunthi', 'tulsi', 'panchakarma',
  'abhyanga', 'swedana', 'shirodhara', 'basti', 'vamana', 'virechana', 'nasya', 'pathya', 'apathya',
  'ahara', 'vihara', 'dinacharya', 'ritucharya', 'rasayana', 'amavata', 'sandhigatavata', 'amlapitta',
  'prameha', 'madhumeha', 'joint', 'pain', 'arthritis', 'digestion', 'acid', 'constipation', 'stiffness',
  'sleep', 'stress', 'herb', 'medicine', 'prescription', 'blood', 'report', 'health', 'diet', 'remedy',
  'icd-11', 'symptom', 'disease', 'fever', 'cough', 'swelling', 'anupana', 'vaidya', 'doctor', 'patient',
  'वात', 'पित्त', 'कफ', 'आयुर्वेद', 'दोष', 'प्रकृति', 'अग्नि', 'कोष्ठ', 'नाड़ी', 'जिह्वा', 'चूर्ण', 'वटी',
  'तेल', 'काढ़ा', 'भस्म', 'गुग्गुलु', 'त्रिफला', 'अश्वगंधा', 'शतावरी', 'गिलोय', 'ब्राह्मी', 'तुलसी', 'पंचकर्म',
  'अभ्यंग', 'स्वेदन', 'बस्ति', 'पथ्य', 'अपथ्य', 'आहार', 'विहार', 'दिनचर्या', 'दर्द', 'गठिया', 'पाचन', 'कब्ज', 'दवा'
];

// Broad Domain Filter: Rejects only clear non-medical / non-health spam
function isQueryInDomain(query) {
  if (!query || !query.trim()) return false;
  const lower = query.toLowerCase();

  // Explicit non-medical refusal patterns (programming, crypto, movies, sports scores, hacking)
  const nonMedicalSpam = /(write code|python script|javascript function|write java|c\+\+ program|crypto price|bitcoin|stock market|who is the prime minister|who is the president|movie review|ipl match score|cricket score|hack wifi|hack instagram|hack facebook)/i;
  
  if (nonMedicalSpam.test(lower)) {
    return false;
  }

  // Allow all health, symptoms, clinical conditions, diseases, herbs, diets, and lifestyle questions
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

    // 3. Strict Domain Boundary Check (Rejects non-medical spam)
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

    // 4. Try Live LLM (Groq Llama 3.3 70B / Gemini 1.5 Flash / OpenAI GPT-4o-mini)
    const systemPrompts = {
      ayur_vaidya: `You are AyurVaidya AI, an expert classical Ayurvedic clinician on the AyushCase system. Language: ${lang === 'hi' ? 'Hindi' : 'English'}. For any health condition or question asked (such as Diabetes/Madhumeha, Hypertension, Arthritis, Acid Reflux, Weight, Digestion, etc.), provide: 1. Ayurvedic root cause (Dosha vitiation: Vata/Pitta/Kapha, Agni status, Ama), 2. Pathya diet (Foods to eat) & Apathya (Foods to avoid), 3. Recommended classical Ayurvedic herbs/formulations with Anupana (adjuvant), 4. Lifestyle (Dinacharya/Yoga) advice. Always provide clear, professional, markdown-formatted answers.`,
      clinical_pariksha: `You are Clinical Pariksha Assistant, a clinical guide for doctors on the AyushCase system. Language: ${lang === 'hi' ? 'Hindi' : 'English'}. Assist practitioners with Ashtavidha Pariksha (Nadi pulse, Jihva tongue, Mala, Mutra), Agni & Koshta assessment, ICD-11 dual mapping for the condition, and Panchakarma protocols. Format answers professionally with bullet points.`,
      herb_drug_safety: `You are AyushGuard, an AI botanical pharmacology specialist on the AyushCase system. Language: ${lang === 'hi' ? 'Hindi' : 'English'}. Analyze herb-drug interactions, allopathic co-administration safety (e.g. Metformin with Jamun/Shilajit, NSAIDs with Guggulu, Blood thinners with Garlic/Ginkgo), organ precautions, and pregnancy safety.`,
      patient_navigator: `You are AyushCare, a patient companion on the AyushCase system. Language: ${lang === 'hi' ? 'Hindi' : 'English'}. Explain medical conditions, symptom severity, how to take Ayurvedic medicines with warm water/milk (Anupana rules), and pre-consultation guidance in simple, comforting terms.`
    };

    const llmResult = await generateLLMResponse({
      systemPrompt: systemPrompts[agentId] || systemPrompts.ayur_vaidya,
      userMessage: cleanMsg,
      conversationHistory
    });

    if (llmResult?.text) {
      return NextResponse.json({
        success: true,
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        response: llmResult.text,
        provider: llmResult.provider,
        inDomain: true
      });
    }

    // 5. Comprehensive Classical AYUSH Fallback Engine (Offline / Zero-API Fallback)
    let responseText = '';
    const lower = cleanMsg.toLowerCase();

    // Diabetes / Sugar / Madhumeha / Prameha
    if (lower.includes('diabet') || lower.includes('sugar') || lower.includes('मधुमेह') || lower.includes('शुगर') || lower.includes('prameha')) {
      if (agentId === 'ayur_vaidya') {
        responseText = lang === 'hi'
          ? `🌿 **मधुमेह (Diabetes / Madhumeha) — आयुर्वेदिक दृष्टिकोण एवं आहार नियम:**
1. **दोष प्रभाव:** कफ एवं मेद धातु की विकृति के कारण वात प्रकोप (कफज से वातज प्रमेह)।
2. **पथ्य आहार (क्या खाएं):** जौ (Yava), करेला, जामुन, मेथी दाना का पानी, पुराना चावल, आंवला, दालचीनी एवं सहजन (Moringa)।
3. **अपथ्य (क्या न खाएं):** चीनी, गुड़, मिठाई, मैदा, नया चावल, मीठे फल (चीकू, आम), दही का रात में सेवन, एवं दिवास्वप्न (दिन में सोना)।
4. **शास्त्रीय औषधियां:** 
   - **मेषशृंगी (Gymnema Sylvestre / गुड़मार)** चूर्ण (3g भोजन पूर्व)।
   - **निशा-आमलकी चूर्ण** (हल्दी + आंवला) 3-5g गुनगुने पानी से।
   - **वसंत कुसुमाकर रस** अथवा **शिलाजत्वादि वटी** (1-1 वटी)।
5. **दिनचर्या:** नित्य 45 मिनट तेज चाल में टहलना, कपालभाति एवं मंडूकासन का अभ्यास।`
          : `🌿 **Ayurvedic Management for Diabetes Mellitus (Madhumeha):**
1. **Etiopathogenesis (Samprapti):** Characterized as *Kaphaja Prameha* progressing to *Dhatukshaya* and Vata aggravation affecting the Medas (adipose) and Mutra (urinary) channels.
2. **Pathya (Recommended Diet):** Barley (Yava), bitter gourd (Karela), Jamun seed powder, Fenugreek (Methi) water, Cinnamon infusion, Amla, and drumstick leaves.
3. **Apathya (Foods to Avoid):** Refined sugars, jaggery, bakery items, heavy unctuous milk products, late dinners, and day-sleeping (*Divasvapna*).
4. **Classical Herbal Formulations:**
   - **Nisha-Amalaki Churna:** (Turmeric + Indian Gooseberry) 3g twice daily before meals with lukewarm water.
   - **Meshashringi (Gymnema Sylvestre / 'Sugar Destroyer'):** 500mg extract or 3g churna.
   - **Shilajitvadi Vati / Chandraprabha Vati:** 1-2 tablets twice daily for renal & metabolic support.
5. **Lifestyle & Yoga:** Daily brisk walking (minimum 45 min), Mandukasana, Paschimottanasana, and Kapalabhati Pranayama.`;
      } else if (agentId === 'clinical_pariksha') {
        responseText = lang === 'hi'
          ? `📋 **क्लिनिकल परीक्षा — मधुमेह (Diabetes Case Evaluation):**
1. **अष्टविध परीक्षा:** नाड़ी में कफ-वात संसर्ग (मंद-कठिन गति), जिह्वा पर साम कफ लेप, मूत्र में आविलता (टर्बिडिटी) एवं पिपीलिकाभिगमन (चींटियों का आकर्षित होना)।
2. **अग्नि/कोष्ठ:** मंदाग्नि अथवा विषमाग्नि के साथ मेदोदुष्टि का मूल्यांकन करें।
3. **ICD-11 Dual Mapping:** Madhumeha ➔ **ICD-11: 5A11 (Type 2 Diabetes Mellitus)**.
4. **अनुशंसित पंचकर्म:** उद्वर्तन (हर्बल पाउडर मसाज) एवं दीपन-पाचन हेतु त्रिकटु कल्प।`
          : `📋 **Clinical Case-Taking Protocol — Diabetes (Madhumeha):**
1. **Ashtavidha Pariksha Findings:** Kapha-Vata dominant sluggish pulse (Manda-Gati), Saama Jihva (thick white coat indicating metabolic endotoxins/Ama), polyuria (*Prabhuta Mutrata*).
2. **Agni Profile:** *Mandagni* (sluggish metabolism) leading to *Medovaha Srotodushti*.
3. **ICD-11 Dual Diagnostic Mapping:** *Madhumeha / Kaphaja Prameha* ➔ **ICD-11: 5A11 Type 2 Diabetes Mellitus**.
4. **Panchakarma Protocol:** *Udvartana* (dry herbal powder scrub using Triphala/Kulattha) to reduce subcutaneous adipose tissue, followed by *Virechana*.`;
      } else if (agentId === 'herb_drug_safety') {
        responseText = lang === 'hi'
          ? `🔬 **आयुषगार्ड — मधुमेह हर्ब-ड्रग सुरक्षा (Safety Warnings):**
1. **Metformin / Glimepiride के साथ:** जामुन बीज, गुड़मार और शिलाजीत रक्त शर्करा को तेजी से कम करते हैं। अतः एलोपैथी के साथ लेते समय ब्लड शुगर नियमित मापें (हाइपोग्लाइसीमिया / Low Sugar का ध्यान रखें)।
2. **किडनी सुरक्षा:** लंबे समय से मधुमेह रोगियों में बिना डॉक्टर सलाह के धातु भस्म न दें; केवल पुनर्नवा व चंद्रप्रभा वटी जैसे रीनो-प्रोटेक्टिव योग सुरक्षित हैं।`
          : `🔬 **AyushGuard Herb-Drug Interaction & Safety (Diabetes):**
1. **Synergy with Modern Antidiabetics (Metformin, Glimepiride, SGLT2i):** Potent hypoglycemic herbs like *Gymnema (Meshashringi)*, *Karela*, and *Jamun* amplify insulin sensitivity. Patients must monitor fasting/PP glucose to avoid sudden hypoglycemia.
2. **Renal Protection in Diabetic Nephropathy:** Avoid high-potency metallic Bhasmas without certified purification. Favor gentle renoprotective herbs like *Punarnava (Boerhavia diffusa)* and *Gokshura*.`;
      } else {
        responseText = lang === 'hi'
          ? `🩺 **आयुषकेयर — मधुमेह के लिए दैनिक सावधानियां:**
1. **दवाई लेने का समय:** निशा-आमलकी अथवा जामुन चूर्ण हमेशा भोजन से 20 मिनट पहले गुनगुने पानी से लें।
2. **घरेलू उपाय:** रात में 1 चम्मच मेथी दाना पानी में भिगोएं और सुबह खाली पेट पानी पिएं व दाने चबाएं।
3. **डॉक्टर से मिलने से पहले:** अपनी हालिया HbA1c और Fasting Blood Sugar रिपोर्ट पोर्टल पर अपलोड करें।`
          : `🩺 **AyushCare Patient Companion — Diabetes Care Tips:**
1. **Anupana & Timing:** Take your herbal formulations (like Triphala or Nisha-Amalaki) with lukewarm water 20-30 minutes before main meals.
2. **Simple Home Remedy:** Soak 1 teaspoon of fenugreek seeds (Methi) in a glass of water overnight; drink the water and chew the seeds in the morning.
3. **Pre-Consultation Tip:** Please upload your latest **HbA1c**, Fasting, and Post-Prandial blood sugar reports to your patient portal for your doctor's review!`;
      }
    } else if (lower.includes('pitta') || lower.includes('acid') || lower.includes('burning') || lower.includes('gerd') || lower.includes('पित्त') || lower.includes('acidity')) {
      responseText = lang === 'hi'
        ? `🌿 **अम्लपित्त एवं पित्त दोष शमन मार्गदर्शन:**
1. **पथ्य आहार:** शुद्ध गाय का घी, नारियल पानी, मुनक्का, खीरा, सौंफ का पानी, आंवला, ठंडा दूध एवं जौ का सत्तू।
2. **अपथ्य:** तीखा, खट्टा, सिरका, लाल मिर्च, चाय/कॉफी और खाली पेट देर तक रहना।
3. **औषधियां:** अविपत्तिकर चूर्ण (3g भोजन पूर्व), कामदुधा रस (1 वटी), सूतशेखर रस एवं शतावरी चूर्ण।
4. **विहार:** शीतली प्राणायाम करें और रात को समय पर सोएं।`
        : `🌿 **Ayurvedic Protocol for Acidity & High Pitta (Amlapitta):**
1. **Pathya (Recommended Diet):** Pure cow's ghee (1 tsp per meal), tender coconut water, soaked black raisins (Munakka), cucumber, fennel infusion, and fresh pomegranate.
2. **Apathya (Foods to Avoid):** Excessive spicy, sour fermented foods, deep-fried items, red chillies, raw garlic, and empty-stomach caffeine.
3. **Classical Herbal Formulations:** Avipattikar Churna (3g before meals with lukewarm water), Kamadudha Rasa, Shatavari Churna, and Sutashekhara Rasa.
4. **Lifestyle (Vihara):** Practice Sheetali Pranayama, avoid midday heat exposure, and maintain regular meal intervals.`;
    } else if (lower.includes('joint') || lower.includes('pain') || lower.includes('arthritis') || lower.includes('घुटने') || lower.includes('दर्द') || lower.includes('वात') || lower.includes('vata')) {
      responseText = lang === 'hi'
        ? `🌿 **संधिवात एवं वात शमन (Joint Pain & Arthritis Protocol):**
1. **पथ्य आहार:** गर्म ताजा भोजन, गाय का घी, तिल का तेल, लहसुन, अदरक, मुनक्का, मेथी और गर्म हल्दी दूध।
2. **अपथ्य:** बासी भोजन, ठंडा पानी, उड़द दाल, राजमा, कच्चा सलाद और एसी की ठंडी हवा।
3. **शास्त्रीय औषधियां:** योगराज गुग्गुलु (2 वटी दिन में दो बार), रास्नादि क्वाथ, क्षीरबला तेल कैप्सूल एवं महानारायण तेल की मालिश।
4. **पंचकर्म:** जानु बस्ति एवं पत्रपिंड स्वेद से तुरंत आराम मिलता है।`
        : `🌿 **Ayurvedic Protocol for Joint Pain & Osteoarthritis (Sandhigatavata):**
1. **Pathya (Recommended Diet):** Warm cooked unctuous meals, cow ghee, garlic, ginger, soaked almonds, sesame seeds, and warm turmeric milk at bedtime.
2. **Apathya (Foods to Avoid):** Cold refrigerated foods, carbonated drinks, dry snacks, raw sprouts at night, and direct AC cold air exposure.
3. **Classical Herbal Formulations:** Yograj Guggulu (2 tablets twice daily after meals), Rasnadi Kwath, Ksheerabala 101 capsules, and topical Mahanarayana Taila.
4. **Panchakarma Therapies:** Janu Basti (local medicated oil pool) and Patra Pinda Sweda for rapid pain relief.`;
    } else if (lower.includes('ashwagandha') || lower.includes('अश्वगंधा')) {
      responseText = lang === 'hi'
        ? `🌿 **अश्वगंधा (Withania somnifera) — शास्त्रीय प्रोफाइल:**
* **रस/गुण/वीर्य:** तिक्त-कषाय रस, स्निग्ध गुण, उष्ण वीर्य, मधुर विपाक।
* **दोष प्रभाव:** वात एवं कफ दोष का मुख्य रूप से शमन करता है।
* **लाभ:** तनाव (Cortisol) नियंत्रण, गहरी नींद, शारीरिक बल व ओज वृद्धि।
* **सेवन विधि:** 3-5 ग्राम चूर्ण रात्रि में गुनगुने दूध एवं घी के साथ।`
        : `🌿 **Ashwagandha (Withania somnifera) — Clinical Profile:**
* **Pharmacodynamics:** Tikta-Kashaya (Bitter/Astringent) taste, Snigdha (Unctuous), Ushna (Heating) potency.
* **Dosha Karma:** Highly pacifies Vata and Kapha; revitalizes Ojas and cognitive stamina.
* **Indications:** Stress, chronic fatigue, insomnia, neuro-muscular weakness, and joint stiffness.
* **Dosage & Anupana:** 3-5g Churna with warm boiled milk at bedtime.`;
    } else {
      responseText = lang === 'hi'
        ? `🌿 **आयुर्वेदिक क्लिनिकल परामर्श:**
आयुर्वेद के अनुसार स्वास्थ्य वात, पित्त और कफ के संतुलन (समदोष) और जाठराग्नि की सम्यावस्था पर निर्भर करता है।
1. **दीपन-पाचन:** सोंठ, जीरा और धनिया जल का सेवन करें जिससे आम (विषाक्त रस) का पाचन हो सके।
2. **आहार नियम:** अपनी प्रकृति अनुकूल ऋतुचर्या का पालन करें और ताजा सुपाच्य भोजन लें।
3. **परामर्श:** सटीक औषधि मात्रा एवं अनुपान हेतु अपने आयुष चिकित्सक से संपर्क करें।`
        : `🌿 **Ayurvedic Clinical Guidance:**
Classical Ayurveda evaluates all health concerns through the dynamic balance of Tridoshas (Vata, Pitta, Kapha), Agni (digestive fire), and Dhatus (tissues).
1. **Metabolic Balance:** Support digestive fire through Deepana-Pachana herbs (Ginger, Cumin, Coriander infusion) to clear toxic residue (*Ama*).
2. **Pathya Regimen:** Follow circadian Dinacharya habits with freshly cooked, warm, wholesome meals aligned with your Prakriti.
3. **Consultation:** Please consult your AYUSH practitioner for personalized herbal formulations and dosages.`;
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
