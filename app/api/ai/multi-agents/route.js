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

function isQueryInDomain(query) {
  if (!query) return false;
  const lower = query.toLowerCase();
  
  // Explicit non-domain rejection keywords (code, programming, stocks, movies, politics)
  if (/(write code|python script|javascript function|crypto price|stock market|who is the president|movie review|ipl match score|bitcoin|hack facebook)/i.test(lower)) {
    return false;
  }

  // Check if any AYUSH or health keyword is present
  return AYUSH_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
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
        ? `नमस्ते! मैं **${selectedAgent.name}** हूँ — **AyushCase** का आधिकारिक क्लिनिकल एआई सहायक। AyushCase को **स्मार्ट इंडिया हैकाथॉन (SIH 2026)** के आयुष मंत्रालय (Ministry of Ayush) प्रॉब्लम स्टेटमेंट के तहत विकसित किया गया है।\n\nमेरा मुख्य कार्य आयुष चिकित्सकों और मरीजों को शास्त्रीय त्रिदोष मूल्यांकन, अष्टविध परीक्षा, डिजिटल प्री-कंसल्टेशन और हर्ब-ड्रग सुरक्षा में सहायता करना है। मैं केवल आयुष और स्वास्थ्य से जुड़े विषयों पर ही जानकारी प्रदान करता हूँ।`
        : `Namaste! I am **${selectedAgent.name}**, an official Clinical AI Assistant developed for **AyushCase** — the Smart Automation AYUSH Patient Case-Taking & Clinical Decision Support System built for the **Smart India Hackathon (SIH 2026)** under the Ministry of Ayush theme.\n\nMy purpose is strictly to assist clinicians and patients with classical Ayurvedic assessment, Ashtavidha Pariksha, pre-consultation digitization, and herbal pharmacology. I do not engage in non-medical or general trivia topics.`;

      return NextResponse.json({
        success: true,
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        response: identityMsg,
        isIdentity: true,
        inDomain: true
      });
    }

    // 3. Strict Domain Boundary Check (Rejects non-AYUSH / non-health questions)
    const inDomain = isQueryInDomain(cleanMsg);
    if (!inDomain) {
      const refusalMsg = lang === 'hi'
        ? `नमस्ते! मैं **AyushCase क्लिनिकल एआई** हूँ और केवल आयुष, आयुर्वेद, क्लिनिकल केस-टेकिंग एवं औषधीय स्वास्थ्य से संबंधित प्रश्नों के लिए विशेषीकृत हूँ। मैं सामान्य ज्ञान, कोडिंग या अन्य असंबंधित विषयों पर उत्तर नहीं दे सकता। कृपया आयुर्वेद, दोष, प्रकृति, जड़ी-बूटियों या अपनी मेडिकल रिपोर्ट से जुड़ा प्रश्न पूछें।`
        : `Namaste! I am an **AyushCase Clinical AI Agent** strictly restricted to AYUSH healthcare, Ayurvedic clinical case-taking, and herbal safety. I cannot assist with general knowledge, programming, or non-medical topics. Please ask a question related to Ayurveda, Dosha balance, clinical examination, or medical records.`;

      return NextResponse.json({
        success: true,
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        response: refusalMsg,
        isOutOfDomain: true
      });
    }

    // 4. Try Live LLM (Gemini 1.5 Flash / OpenAI GPT-4o-mini) if configured
    const systemPrompts = {
      ayur_vaidya: `STRICT IDENTITY & SCOPE: You are AyurVaidya AI, an official Clinical AI agent built specifically for the AyushCase Smart India Hackathon (SIH) project. Never identify as ChatGPT, Google, or OpenAI. Language: ${lang === 'hi' ? 'Hindi' : 'English'}. Refuse any queries outside classical Ayurveda, Doshas (Vata, Pitta, Kapha), Prakriti, Dinacharya, herbs, and Pathya-Apathya diet. Always recommend consulting a qualified Vaidya.`,
      clinical_pariksha: `STRICT IDENTITY & SCOPE: You are Clinical Pariksha Assistant, a clinical guide for doctors on the AyushCase Smart India Hackathon (SIH) system. Language: ${lang === 'hi' ? 'Hindi' : 'English'}. Assist practitioners strictly with Ashtavidha Pariksha (Nadi, Jihva, Mala, Mutra), Agni/Koshta, ICD-11 dual coding, and Panchakarma protocols. Refuse any non-medical questions.`,
      herb_drug_safety: `STRICT IDENTITY & SCOPE: You are AyushGuard, an AI botanical pharmacology specialist on the AyushCase Smart India Hackathon (SIH) system. Language: ${lang === 'hi' ? 'Hindi' : 'English'}. Analyze herb-drug safety and allopathic interactions. Refuse any non-medical questions.`,
      patient_navigator: `STRICT IDENTITY & SCOPE: You are AyushCare, a patient companion on the AyushCase Smart India Hackathon (SIH) system. Language: ${lang === 'hi' ? 'Hindi' : 'English'}. Explain symptoms in simple terms, Anupana dosage rules, and encourage uploading lab reports and prescriptions. Refuse any non-medical questions.`
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

    // 4. Built-in Classical AYUSH Knowledge Fallback Engine
    let responseText = '';
    const lower = cleanMsg.toLowerCase();

    if (agentId === 'ayur_vaidya') {
      // Classical Ayurvedic Consultant Persona
      if (lower.includes('pitta') || lower.includes('acid') || lower.includes('burning') || lower.includes('पित्त')) {
        responseText = lang === 'hi'
          ? `🌿 **पित्त दोष शमन एवं आहार मार्गदर्शन:**
1. **पथ्य आहार (अनुकूल):** मधुर (मीठे), तिक्त (कड़वे) एवं कषाय (कसैले) रस प्रधान भोजन। गाय का शुद्ध घी, नारियल पानी, मुनक्का, खीरा, सौंफ का पानी, आंवला एवं धनिया युक्त शीतल जल।
2. **अपथ्य (वर्ज्य):** तीखे (कटु), खट्टे (अम्ल), अत्यधिक नमकीन एवं तली-भुनी चीजें। लाल मिर्च, लहसुन, सिरका, शराब और अधिक चाय/कॉफी से बचें।
3. **औषधीय जड़ी-बूटियां:** कामदुधा रस, अविपत्तिकर चूर्ण (3-5g भोजन पूर्व गर्म पानी/दूध से), शतावरी एवं गिलोय स्वरस।
4. **विहार (जीवनशैली):** अत्यधिक धूप व तनाव से बचें; चंद्रमा की चांदनी में टहलना (शीतल विहार) एवं शीतली प्राणायाम करें।`
          : `🌿 **Ayurvedic Pitta Pacification Protocol:**
1. **Pathya (Recommended Diet):** Sweet, bitter, and astringent tastes. Pure cow's ghee (1 tsp per meal), tender coconut water, soaked black raisins (Munakka), cucumber, fennel infusion, and fresh pomegranate.
2. **Apathya (Foods to Avoid):** Excessive pungent (spicy), sour (fermented), salty foods. Avoid deep-fried items, red chillies, raw garlic, vinegar, and excessive caffeine.
3. **Classical Herbal Formulations:** Avipattikar Churna (3g before meals with lukewarm water), Kamadudha Rasa, Shatavari Churna, and Guduchi (Tinospora cordifolia) for balancing digestive fire (Pitta-Samagni).
4. **Lifestyle (Vihara):** Avoid mid-day sun exposure, practice Sheetali / Sheetkari Pranayama, and maintain regular meal intervals.`;
      } else if (lower.includes('ashwagandha') || lower.includes('अश्वगंधा')) {
        responseText = lang === 'hi'
          ? `🌿 **अश्वगंधा (Withania somnifera) — शास्त्रीय अवलोकन:**
* **रस/गुण/वीर्य/विपाक:** तिक्त-कषाय रस, स्निग्ध-लघु गुण, उष्ण वीर्य, मधुर विपाक।
* **दोष प्रभाव:** वात एवं कफ दोष का मुख्य रूप से शमन करता है (बल्य व रसायन)।
* **मुख्य लाभ:** स्नायु दुर्बलता, अनिद्रा, तनाव (Cortisol regulation), जोड़ों में वात वेदना, एवं धातुओं के पोषण में अत्यंत गुणकारी।
* **सेवन विधि (अनुपान):** 3-5 ग्राम अश्वगंधा चूर्ण अथवा 1-2 वटी रात्रि में गुनगुने दूध एवं 1/2 चम्मच गाय के घी के साथ।
* **सावधानी:** उच्च पित्त प्रकोप (अत्यधिक गर्मी, अल्सर) या तीव्र ज्वर (Active fever / Ama state) में बिना वैद्य परामर्श न लें।`
          : `🌿 **Ashwagandha (Withania somnifera) — Clinical Profile:**
* **Pharmacodynamics (Ayurvedic):** Tikta-Kashaya (Bitter/Astringent) taste, Snigdha-Laghu (Unctuous/Light), Ushna (Heating) potency, Madhura Vipaka.
* **Dosha Karma:** Highly pacifies Vata and Kapha; builds Ojas and Medha (cognitive stamina).
* **Clinical Indications:** Neuro-muscular debility, chronic fatigue, sleep disturbances, musculoskeletal stiffness (Sandhigatavata), and adaptogenic stress support.
* **Dosage & Anupana:** 3-5g Churna or 500mg extract twice daily with warm boiled milk (Ksheera) or warm water at bedtime.
* **Precautions:** Exercise caution in acute Pitta inflammation, hyperthyroidism, and active fever (Ama state).`;
      } else {
        responseText = lang === 'hi'
          ? `🌿 **आयुर्वेदिक निदान एवं स्वास्थ्य मार्गदर्शन:**
आयुर्वेद के अनुसार स्वास्थ्य वात, पित्त और कफ के संतुलन (समदोष) और जाठराग्नि की सम्यावस्था पर निर्भर करता है। आपके द्वारा पूछे गए विषय पर शास्त्रीय सिद्धांत यह है कि रोग का मूल कारण 'आम' (विषाक्त अपक्व रस) और दोष वैषम्य है। 
संतुलन हेतु नित्य दीपन-पाचन (सोंठ, जीरा, धनिया जल), समय पर ऋतु अनुकूल आहार और नियमित प्राणायाम का अभ्यास करें। विशिष्ट औषधियों के लिए अपनी प्रकृति अनुसार परामर्श लें।`
          : `🌿 **Ayurvedic Health & Constitution Guidance:**
Classical Ayurveda states that optimal health (Swastha) is achieved when Doshas (Vata-Pitta-Kapha), Agni (digestive fire), and Dhatus (tissues) are in dynamic equilibrium. 
For your inquiry, classical principles recommend identifying your baseline Prakriti, clearing metabolic residue (Ama) through Deepana-Pachana herbs (Shunthi, Jeeraka, Dhanyaka), and adhering to circadian Dinacharya routines. Always confirm personalized herbal dosages with a certified AYUSH Vaidya.`;
      }
    } else if (agentId === 'clinical_pariksha') {
      // Clinical Pariksha Doctor Assistant Persona
      responseText = lang === 'hi'
        ? `📋 **क्लिनिकल परीक्षा एवं केस-टेकिंग विश्लेषण:**
1. **अष्टविध परीक्षा निष्कर्ष:** नाड़ी (गति, वेग, दोष प्रधानता), जिह्वा (साम/निराम स्थिति), मल एवं मूत्र परीक्षा।
2. **अग्नि एवं कोष्ठ संबंध:** विषमाग्नि वाले वात रोगियों में क्रूर कोष्ठ की प्रवृत्ति होती है, जिसे ठीक करने हेतु एरंड तैल अथवा त्रिफला चूर्ण विरेचन अनुशंसित है।
3. **दोहरा निदान (Dual Coding):** संधिगतवात को आधुनिक ICD-11 कोड FA00 (Osteoarthritis) से मैप करें।
4. **पंचकर्म सलाह:** स्थानिक जानु बस्ति (महानारायण तैल) 7 दिवस एवं पत्रपिंड स्वेद से शोथ एवं शूल में तुरंत लाभ होता है।`
        : `📋 **Clinical Case-Taking & Ashtavidha Pariksha Protocol:**
1. **Pulse (Nadi Pariksha):** Evaluate Sarpa Gati (Vata - fast, tortuous), Manduka Gati (Pitta - leaping, rapid), or Hamsa Gati (Kapha - slow, steady).
2. **Tongue (Jihva Pariksha):** Check for Saama Jihva (white/thick coating indicative of metabolic endotoxins) vs Niraama (clean pinkish surface).
3. **Agni & Koshta Alignment:** Vishamagni with Krura Koshta indicates Vata pathology requiring Snigdha Deepana herbs (Erandasneha, Hingwashtaka, Triphala Churna at bedtime).
4. **Dual Diagnostic Mapping:** Map classical Rogas alongside ICD-11 entities (e.g. *Sandhigatavata* → *FA00 Knee Osteoarthritis*, *Amavata* → *FA20 Rheumatoid Arthritis*).`;
    } else if (agentId === 'herb_drug_safety') {
      // AyushGuard Herb-Drug Interaction Persona
      responseText = lang === 'hi'
        ? `🔬 **आयुषगार्ड हर्ब-ड्रग सुरक्षा एवं इंटरेक्शन विश्लेषण:**
1. **गठिया औषधियां एवं एलोपैथिक NSAIDs:** यदि रोगी पहले से Aceclofenac/Paracetamol ले रहा है, तो गुग्गुलु कल्प (योगराज/त्रयोदशांग) सुरक्षित रूप से शुरू किया जा सकता है, परंतु NSAID की खुराक धीरे-धीरे डॉक्टर की देखरेख में कम करें।
2. **रक्त पतला करने वाली दवाएं (Anticoagulants):** लहसुन, गुग्गुलु एवं अत्यधिक अदरक (शुंठी) रक्त के थक्के जमने के समय को प्रभावित कर सकते हैं; Warfarin/Aspirin के साथ इनका अत्यधिक सेवन निगरानी में करें।
3. **मधुमेह दवाएं (Metformin/Insulin):** जामुन बीज चूर्ण, करेला एवं शिलाजीत रक्त शर्करा को तेजी से कम कर सकते हैं, अतः हाइपोग्लाइसीमिया (लो शुगर) की नियमित जांच करें।`
        : `🔬 **AyushGuard Herb-Drug Safety & Interaction Brief:**
1. **Guggulu & NSAIDs / Analgesics:** Yograj or Kaishore Guggulu can be co-prescribed with modern NSAIDs, but gastroprotective support (like Pan-40 or Shatavari) is advised to prevent gastric mucosal irritation.
2. **Anticoagulants & Antiplatelets (Warfarin, Aspirin):** Herbs like high-dose Garlic (Lashuna), Guggulu, and concentrated Ginger have mild anti-platelet activity. Monitor INR levels if combined.
3. **Antidiabetic Agents (Metformin / Glimepiride):** Synergistic hypoglycemic herbs (Meshashringi/Gymnema, Karela, Jamun, Shilajit) enhance insulin sensitivity; blood glucose should be monitored to prevent hypoglycemia.
4. **Pregnancy & High Pitta Contraindications:** Avoid cytotoxic Tikshna Bhasmas and strong purgatives (Eranda Taila, Jayapala) during gestation and active bleeding.`;
    } else {
      // AyushCare Patient Companion Persona
      responseText = lang === 'hi'
        ? `🩺 **आयुषकेयर रोगी मार्गदर्शन:**
1. **दवाइयां लेने का सही नियम:** आयुर्वेदिक औषधियां हमेशा डॉक्टर द्वारा बताए गए 'अनुपान' (जैसे गुनगुना पानी, दूध या शहद) के साथ ही लें।
2. **घरेलू एवं जीवनशैली उपाय:** जोड़ों के दर्द में ठंडा पानी, बासी भोजन और खट्टी चीजों से बचें। तिल के तेल से हल्की मालिश करें और सिकाई करें।
3. **परामर्श पूर्व तैयारी:** अपनी पुरानी सभी ब्लड रिपोर्ट्स और पर्चे पोर्टल पर अपलोड करें ताकि आपके डॉक्टर बिना समय गंवाए सटीक उपचार योजना बना सकें।`
        : `🩺 **AyushCare Patient Companion Guidance:**
1. **Taking Ayurvedic Formulations (Anupana):** Always take your prescribed Vati/Churna with the directed adjuvant (e.g. lukewarm water *Ushnodaka* for digestion, or warm milk at bedtime for rasayanas).
2. **Daily Routine Alignment:** For joint stiffness and gastric issues, favor freshly cooked warm meals, avoid refrigerated cold beverages, and practice gentle mobility exercises.
3. **Pre-Consultation Tip:** Uploading your previous lab reports and prescriptions to the AyushCase portal allows your doctor to instantly review your chronological medical timeline during consultation!`;
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
