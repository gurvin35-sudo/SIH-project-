// Comprehensive AYUSH Knowledge Base for AyushCase

export const PRAKRITI_QUESTIONS = [
  {
    id: 'body_build',
    labelEn: 'Body Frame & Physical Build',
    labelHi: 'शारीरिक गठन और संरचना',
    options: [
      {
        id: 'v_build',
        dosha: 'vata',
        textEn: 'Thin, slender, bony, difficult to gain weight, prominent joints/veins',
        textHi: 'पतला, दुबला, हड्डियां उभरी हुई, वजन बढ़ना मुश्किल',
      },
      {
        id: 'p_build',
        dosha: 'pitta',
        textEn: 'Medium frame, symmetrical, athletic, moderate muscle tone',
        textHi: 'मध्यम ढांचा, सुडौल, संतुलित मांसपेशियां, एथलेटिक',
      },
      {
        id: 'k_build',
        dosha: 'kapha',
        textEn: 'Broad, heavy, solid bone structure, easy to gain weight, thick limbs',
        textHi: 'चौड़ा, भारी, मजबूत हड्डियां, वजन आसानी से बढ़ना',
      },
    ],
  },
  {
    id: 'skin_type',
    labelEn: 'Skin Texture & Complexion',
    labelHi: 'त्वचा की बनावट और रंगत',
    options: [
      {
        id: 'v_skin',
        dosha: 'vata',
        textEn: 'Dry, rough, thin, cool to touch, cracks easily in winter, darkish tint',
        textHi: 'सूखी, खुरदरी, ठंडी, सर्दियों में फटने वाली, सांवली',
      },
      {
        id: 'p_skin',
        dosha: 'pitta',
        textEn: 'Warm, soft, sensitive, prone to moles/freckles, redness, acne/rashes',
        textHi: 'गर्म, कोमल, तिल/मस्से युक्त, लालिमा या मुहांसों की प्रवृत्ति',
      },
      {
        id: 'k_skin',
        dosha: 'kapha',
        textEn: 'Thick, oily/moist, smooth, cool, fair/radiant, rarely dries or wrinkles',
        textHi: 'मोटी, तैलीय/स्निग्ध, चिकनी, चमकदार, जल्दी झुर्रियां न पड़ना',
      },
    ],
  },
  {
    id: 'appetite_agni',
    labelEn: 'Appetite & Digestion (Agni)',
    labelHi: 'भूख और पाचन शक्ति (अग्नि)',
    options: [
      {
        id: 'v_agni',
        dosha: 'vata',
        textEn: 'Irregular/Variable (Vishamagni) - sometimes very hungry, sometimes no appetite; bloating/gas',
        textHi: 'विषमाग्नि (अनियमित) - कभी बहुत भूख, कभी बिल्कुल नहीं; पेट फूलना/गैस',
      },
      {
        id: 'p_agni',
        dosha: 'pitta',
        textEn: 'Strong/Intense (Tikshnagni) - sharp hunger, irritable if meal delayed, acidity/heartburn',
        textHi: 'तीक्ष्णाग्नि (तेज) - समय पर भोजन न मिले तो गुस्सा/चिड़चिड़ापन, अम्लता/एसिडिटी',
      },
      {
        id: 'k_agni',
        dosha: 'kapha',
        textEn: 'Slow/Constant (Mandagni) - can easily skip meals without distress, heavy feeling after food',
        textHi: 'मन्दाग्नि (धीमी) - कम भूख में भी काम चलना, खाने के बाद भारीपन',
      },
    ],
  },
  {
    id: 'bowel_habits',
    labelEn: 'Bowel Habits (Koshta)',
    labelHi: 'मल विसर्जन व कोष्ठ (Bowel Habit)',
    options: [
      {
        id: 'v_bowel',
        dosha: 'vata',
        textEn: 'Hard, dry, irregular, prone to constipation (Krura Koshta)',
        textHi: 'कठोर, सूखा, अनियमित, कब्ज की शिकायत (क्रूर कोष्ठ)',
      },
      {
        id: 'p_bowel',
        dosha: 'pitta',
        textEn: 'Soft, loose, frequent (2-3 times/day), burning sensation (Mridu Koshta)',
        textHi: 'मुलायम, ढीला, दिन में 2-3 बार, कभी जलन (मृदु कोष्ठ)',
      },
      {
        id: 'k_bowel',
        dosha: 'kapha',
        textEn: 'Regular, formed, moderate, sluggish, heavy evacuation (Madhyama Koshta)',
        textHi: 'नियमित, बंधा हुआ, मध्यम, कभी भारीपन महसूस होना (मध्यम कोष्ठ)',
      },
    ],
  },
  {
    id: 'sleep_pattern',
    labelEn: 'Sleep Pattern & Dreams',
    labelHi: 'निद्रा और स्वप्न (Sleep & Dreams)',
    options: [
      {
        id: 'v_sleep',
        dosha: 'vata',
        textEn: 'Light, interrupted, less than 6 hours, dreams of flying, running, fear/anxiety',
        textHi: 'हल्की, टूटने वाली, कम नींद (<6 घंटे), उड़ने/भागने या डर के सपने',
      },
      {
        id: 'p_sleep',
        dosha: 'pitta',
        textEn: 'Moderate (6-7 hrs), sound, wakes up alert, dreams of fire, fights, passion, bright lights',
        textHi: 'मध्यम (6-7 घंटे), गहरी, आग, लड़ाई, रोशनी या प्रतिस्पर्धा के सपने',
      },
      {
        id: 'k_sleep',
        dosha: 'kapha',
        textEn: 'Deep, heavy, 8+ hours, difficult to wake up in morning, dreams of water, romance, calm lakes',
        textHi: 'गहरी, भारी, 8+ घंटे, सुबह उठना कठिन, पानी/झील या शांतिपूर्ण सपने',
      },
    ],
  },
  {
    id: 'weather_tolerance',
    labelEn: 'Weather & Temperature Preference',
    labelHi: 'ऋतु और तापमान सहनशीलता',
    options: [
      {
        id: 'v_weather',
        dosha: 'vata',
        textEn: 'Averts cold & dry windy weather; loves warmth, hot drinks, sunshine, and oil massages',
        textHi: 'ठंड और तेज हवा नापसंद; गर्माहट, धूप और गर्म पेय पसंद',
      },
      {
        id: 'p_weather',
        dosha: 'pitta',
        textEn: 'Averts heat and direct sun; loves cool breeze, AC, cold water, and monsoon coolness',
        textHi: 'गर्मी और तेज धूप नापसंद; ठंडी हवा, शीतल पेय और ठंडक पसंद',
      },
      {
        id: 'k_weather',
        dosha: 'kapha',
        textEn: 'Averts cold & damp/humid weather; tolerates heat well, loves dry warm climates',
        textHi: 'ठंड और नमी/बरसात नापसंद; गर्म और शुष्क मौसम आसानी से सहना',
      },
    ],
  },
  {
    id: 'mind_memory',
    labelEn: 'Mind, Speech & Memory',
    labelHi: 'मानसिक प्रकृति, वाणी और स्मरण शक्ति',
    options: [
      {
        id: 'v_mind',
        dosha: 'vata',
        textEn: 'Quick grasp but quick to forget; speaks fast, enthusiastic, creative, mind jumps between thoughts',
        textHi: 'जल्दी समझना पर जल्दी भूलना; तेज बोलना, विचार चंचल, अत्यधिक रचनात्मक',
      },
      {
        id: 'p_mind',
        dosha: 'pitta',
        textEn: 'Sharp intellect, organized, distinct memory; articulate, precise, goal-oriented, decisive',
        textHi: 'तेज बुद्धि, व्यवस्थित, सटीक याददाश्त; स्पष्ट वक्ता, लक्ष्य-केंद्रित',
      },
      {
        id: 'k_mind',
        dosha: 'kapha',
        textEn: 'Slow to learn but never forgets (long retention); calm speech, methodical, patient, steady',
        textHi: 'धीमी समझ लेकिन दीर्घकालिक याददाश्त; शांत वाणी, धैर्यवान, स्थिर स्वभाव',
      },
    ],
  },
  {
    id: 'temperament_stress',
    labelEn: 'Stress Response & Emotion',
    labelHi: 'तनाव और संवेगात्मक प्रतिक्रिया',
    options: [
      {
        id: 'v_stress',
        dosha: 'vata',
        textEn: 'Becomes anxious, fearful, worried, overthinks, restless under stress',
        textHi: 'चिंता, घबराहट, अत्यधिक सोचना, बेचैनी और असुरक्षा की भावना',
      },
      {
        id: 'p_stress',
        dosha: 'pitta',
        textEn: 'Becomes irritable, impatient, angry, critical, demanding under pressure',
        textHi: 'क्रोध, चिड़चिड़ापन, असहिष्णुता, आलोचनात्मक रवैया',
      },
      {
        id: 'k_stress',
        dosha: 'kapha',
        textEn: 'Remains calm, withdraws, becomes stubborn, procrastinates, emotional eating',
        textHi: 'शांत रहना, टालमटोल करना, अंदर समेट लेना, अत्यधिक खाना खाना',
      },
    ],
  },
];

export const ASHTAVIDHA_PARIKSHA = {
  nadi: {
    labelEn: 'Nadi Pariksha (Pulse Examination)',
    labelHi: 'नाड़ी परीक्षा (Pulse)',
    options: [
      { id: 'sarpa_vata', labelEn: 'Sarpa Gati (Snake-like / Fast & irregular - Vata dominant)', labelHi: 'सर्प गति (वात प्रधान - चंचल व तीव्र)' },
      { id: 'manduka_pitta', labelEn: 'Manduka Gati (Frog-like / Jumping & bounding - Pitta dominant)', labelHi: 'मण्डूक गति (पित्त प्रधान - उछलने वाली)' },
      { id: 'hamsa_kapha', labelEn: 'Hamsa / Gaja Gati (Swan/Elephant / Slow & steady - Kapha dominant)', labelHi: 'हंस/गज गति (कफ प्रधान - मन्द व स्थिर)' },
      { id: 'vata_pitta', labelEn: 'Dwidoshaja: Vata-Pitta Gati (Fast & warm)', labelHi: 'द्विदोषज: वात-पित्त गति' },
      { id: 'pitta_kapha', labelEn: 'Dwidoshaja: Pitta-Kapha Gati (Full & warm)', labelHi: 'द्विदोषज: पित्त-कफ गति' },
      { id: 'sama_tridosha', labelEn: 'Samanya / Tridosha Sama (Balanced rhythm)', labelHi: 'सम / त्रिदोष सम गति' },
    ],
  },
  jihva: {
    labelEn: 'Jihva Pariksha (Tongue Examination)',
    labelHi: 'जिह्वा परीक्षा (Tongue)',
    options: [
      { id: 'sama_coated', labelEn: 'Sama Jihva (Coated / White thick layer - High Ama / Toxins)', labelHi: 'साम जिह्वा (सफेद मोटी परत - आम दोष)' },
      { id: 'nirama_clean', labelEn: 'Nirama Jihva (Clean, pinkish, healthy, no coat)', labelHi: 'निराम जिह्वा (स्वच्छ, गुलाबी, स्वस्थ)' },
      { id: 'dry_cracked', labelEn: 'Ruksha / Sphutita (Dry, cracked, darkish - Vata)', labelHi: 'रुक्ष / स्फुटित (सूखी, फटी हुई - वात)' },
      { id: 'red_burning', labelEn: 'Rakta / Ushna (Red, papillae inflamed, yellowish coat - Pitta)', labelHi: 'रक्त / पीताभ (लाल, पीले धब्बे - पित्त)' },
      { id: 'pale_moist', labelEn: 'Pandu / Snigdha (Pale, excessively moist, thick edges - Kapha)', labelHi: 'पाण्डु / स्निग्ध (पीली, अत्यधिक गीली - कफ)' },
    ],
  },
  mala: {
    labelEn: 'Mala Pariksha (Stool Examination)',
    labelHi: 'मल परीक्षा (Stool / Bowel)',
    options: [
      { id: 'vibandha_constipation', labelEn: 'Vibandha / Grathita (Hard, pellet-like, constipated - Vata)', labelHi: 'विबन्ध / ग्रथित (कठोर, सूखा, कब्ज - वात)' },
      { id: 'athisara_loose', labelEn: 'Drava / Pitabh (Loose, yellowish, burning, frequent - Pitta)', labelHi: 'द्रव / पीताभ (पतला, पीला, जलन युक्त - पित्त)' },
      { id: 'ama_sinking', labelEn: 'Ama Yukta / Guru (Sticky, foul smell, sinks in water, mucous - Ama/Kapha)', labelHi: 'साम युक्त / गुरु (चिपचिपा, दुर्गंध, भारी - आम)' },
      { id: 'prakruta_normal', labelEn: 'Prakruta / Nirama (Well formed, floats, non-sticky - Normal)', labelHi: 'प्राकृत / निराम (बंधा हुआ, तैरने वाला, सामान्य)' },
    ],
  },
  mutra: {
    labelEn: 'Mutra Pariksha (Urine Examination)',
    labelHi: 'मूत्र परीक्षा (Urine)',
    options: [
      { id: 'alpa_varna', labelEn: 'Alpa / Shyamavarna (Scanty, clear/whitish, irregular - Vata)', labelHi: 'अल्प / श्यामाभ (कम, झागदार - वात)' },
      { id: 'pitabha_burning', labelEn: 'Pitabha / Daha (Yellowish/reddish, burning micturition - Pitta)', labelHi: 'पीताभ / दाह (पीला/लाल, मूत्र त्याग में जलन - पित्त)' },
      { id: 'avila_frothy', labelEn: 'Avila / Shwetavarna (Cloudy, turbid, frothy, heavy - Kapha)', labelHi: 'आविल / श्वेताभ (धुंधला, झागयुक्त, गाढ़ा - कफ)' },
      { id: 'prakruta_mutra', labelEn: 'Prakruta (Pale straw yellow, clear, painless - Normal)', labelHi: 'प्राकृत (हल्का पीला, साफ, सामान्य)' },
    ],
  },
  sparsha: {
    labelEn: 'Sparsha Pariksha (Skin / Touch)',
    labelHi: 'स्पर्श परीक्षा (Touch / Skin Temperature)',
    options: [
      { id: 'ruksha_sheeta', labelEn: 'Ruksha & Sheeta (Dry, rough, cold to touch - Vata)', labelHi: 'रुक्ष एवं शीत (सूखा, खुरदरा, ठंडा - वात)' },
      { id: 'ushna_sweda', labelEn: 'Ushna & Swedayukta (Hot, warm, perspiring, burning - Pitta)', labelHi: 'उष्ण एवं स्वेदयुक्त (गर्म, पसीनेदार, जलन - पित्त)' },
      { id: 'snigdha_sheeta', labelEn: 'Snigdha & Sheeta (Oily, smooth, cold, clammy - Kapha)', labelHi: 'स्निग्ध एवं शीत (चिकना, कोमल, शीतल - कफ)' },
      { id: 'sama_sparsha', labelEn: 'Sama Sparsha (Normal body temperature and texture)', labelHi: 'सम स्पर्श (सामान्य तापमान एवं स्पर्श)' },
    ],
  },
  druk: {
    labelEn: 'Druk Pariksha (Eye Examination)',
    labelHi: 'दृक परीक्षा (Eyes / Sclera)',
    options: [
      { id: 'ruksha_astira', labelEn: 'Ruksha / Alpa (Dry, dull, unsteady gaze, dark circles - Vata)', labelHi: 'रुक्ष / अस्थिर (सूखी, चमकहीन, चंचल दृष्टि - वात)' },
      { id: 'rakta_pitabha', labelEn: 'Rakta / Haridra (Red sclera, yellowish tint, photophobia - Pitta)', labelHi: 'रक्त / पीताभ (लाल, पीली आभा, जलन - पित्त)' },
      { id: 'shweta_snigdha', labelEn: 'Shweta / Snigdha (White, clear, moist, prominent lashes - Kapha)', labelHi: 'श्वेत / स्निग्ध (सफेद, चमकदार, नम - कफ)' },
      { id: 'prakruta_druk', labelEn: 'Prakruta Druk (Clear vision, normal conjunctiva)', labelHi: 'प्राकृत दृक (स्वस्थ एवं सामान्य दृष्टि)' },
    ],
  },
  shabda: {
    labelEn: 'Shabda Pariksha (Voice & Sound)',
    labelHi: 'शब्द परीक्षा (Voice / Speech)',
    options: [
      { id: 'kheena_sphuta', labelEn: 'Ksheena / Sphutita (Hoarse, feeble, fast, broken voice - Vata)', labelHi: 'क्षीण / स्फुटित (कर्कश, टूटी हुई, तेज आवाज - वात)' },
      { id: 'teekshna_spashta', labelEn: 'Teekshna / Ugra (Sharp, loud, clear, commanding - Pitta)', labelHi: 'तीक्ष्ण / उग्र (तेज, स्पष्ट, रोबीली आवाज - पित्त)' },
      { id: 'gambhira_mandra', labelEn: 'Gambhira / Mandra (Deep, resonant, heavy, melodious - Kapha)', labelHi: 'गम्भीर / मन्द्र (भारी, गहरी, मधुर आवाज - कफ)' },
    ],
  },
  aakriti: {
    labelEn: 'Aakriti Pariksha (General Facies & Posture)',
    labelHi: 'आकृति परीक्षा (General Posture & Build)',
    options: [
      { id: 'krisha_chala', labelEn: 'Krisha / Chala (Emaciated, restless gait, stooped posture - Vata)', labelHi: 'कृश / चल (पतला शरीर, चंचल चाल - वात)' },
      { id: 'madhyama_tejas', labelEn: 'Madhyama / Tejasvi (Medium posture, bright, assertive - Pitta)', labelHi: 'मध्यम / तेजस्वी (संतुलित ढांचा, तेजवान मुख - पित्त)' },
      { id: 'sthula_dhira', labelEn: 'Sthula / Sthira (Robust build, slow & graceful gait - Kapha)', labelHi: 'स्थूल / स्थिर (मजबूत शरीर, स्थिर चाल - कफ)' },
    ],
  },
};

export const COMMON_ROGAS = [
  {
    ayurvedic: 'Amavata',
    modern: 'Rheumatoid Arthritis / Inflammatory Polyarthritis (ICD-11: FA20)',
    dosha: 'Vata-Kapha with Ama',
    symptoms: 'Joint pain with morning stiffness, swelling, body ache, feverish feeling',
  },
  {
    ayurvedic: 'Sandhigatavata',
    modern: 'Osteoarthritis (ICD-11: FA00)',
    dosha: 'Vata dominant',
    symptoms: 'Crepitus, pain on movement, degeneration in weight-bearing joints (knees)',
  },
  {
    ayurvedic: 'Amlapitta',
    modern: 'GERD / Hyperacidity / Acid Peptic Disease (ICD-11: DA40)',
    dosha: 'Pitta dominant',
    symptoms: 'Sour eructations, burning sensation in chest/throat, nausea, indigestion',
  },
  {
    ayurvedic: 'Prameha / Madhumeha',
    modern: 'Type 2 Diabetes Mellitus (ICD-11: 5A11)',
    dosha: 'Kapha-Vata dominant with Medo Dhatu dusti',
    symptoms: 'Polyuria, turbidity in urine, excessive thirst, lethargy, burning feet',
  },
  {
    ayurvedic: 'Tamaka Shwasa',
    modern: 'Bronchial Asthma (ICD-11: CA23)',
    dosha: 'Vata-Kapha dominant (Pranavaha Srotas)',
    symptoms: 'Paroxysmal breathlessness, wheezing, cough, aggravated in cloudy/cold weather',
  },
  {
    ayurvedic: 'Grahani Roga',
    modern: 'Irritable Bowel Syndrome (IBS) / Malabsorption (ICD-11: DD90)',
    dosha: 'Tridoshaja / Agnimandya',
    symptoms: 'Altered bowel habits (loose then hard), undigested stool, abdominal cramps',
  },
  {
    ayurvedic: 'Kasa (Vataja / Kaphaja)',
    modern: 'Chronic / Acute Cough & Bronchitis (ICD-11: MD30)',
    dosha: 'Vata or Kapha',
    symptoms: 'Dry or productive cough, throat irritation, chest congestion',
  },
  {
    ayurvedic: 'Vatarakta',
    modern: 'Gout / Hyperuricemia (ICD-11: FA25)',
    dosha: 'Vata & Rakta dusti',
    symptoms: 'Acute excruciating pain and redness in great toe or ankle joints',
  },
  {
    ayurvedic: 'Twak Vikara / Kushta (Vicharchika)',
    modern: 'Eczema / Dermatitis / Psoriasis (ICD-11: EA80)',
    dosha: 'Kapha-Pitta dominant',
    symptoms: 'Itching, skin scaling, oozing or dry hyperkeratotic patches',
  },
  {
    ayurvedic: 'Anidra / Manovaha Srotodusti',
    modern: 'Insomnia & Anxiety Disorder (ICD-11: 7A00 / 6B00)',
    dosha: 'Vata-Pitta with Rajasika Manas',
    symptoms: 'Difficulty falling or maintaining sleep, restless thoughts, fatigue',
  },
  {
    ayurvedic: 'Sthaulya / Medoroga',
    modern: 'Obesity / Metabolic Syndrome (ICD-11: 5B81)',
    dosha: 'Kapha & Medo Dhatu vriddhi',
    symptoms: 'Excess adipose tissue, breathlessness on mild exertion, excessive sweating',
  },
  {
    ayurvedic: 'Gridhrasi',
    modern: 'Sciatica / Lumbar Radiculopathy (ICD-11: ME84.0)',
    dosha: 'Vata dominant (Kandara dusti)',
    symptoms: 'Radiating pain from low back to buttocks, thigh, calf, and foot',
  },
];

export const AYURVEDIC_MEDICINES = [
  { name: 'Triphala Churna', form: 'Churna', defaultDose: '3-5g', anupana: 'Warm water / Honey', timing: 'Bedtime (Nishakala)' },
  { name: 'Yograj Guggulu', form: 'Vati', defaultDose: '2 tablets (500mg)', anupana: 'Warm water / Rasnadi Kwath', timing: 'After food (Adhahbhakta)' },
  { name: 'Avipattikar Churna', form: 'Churna', defaultDose: '3-5g', anupana: 'Warm water / Coconut water', timing: 'Before food (Pragbhakta)' },
  { name: 'Ashwagandhadishta', form: 'Asava/Arishta', defaultDose: '15-20 ml with equal water', anupana: 'Lukewarm water', timing: 'After meals twice daily' },
  { name: 'Mahasudarshan Vati', form: 'Vati', defaultDose: '2 tablets', anupana: 'Warm water', timing: 'Twice daily after food' },
  { name: 'Dashamularishta', form: 'Asava/Arishta', defaultDose: '15-20 ml with equal water', anupana: 'Water', timing: 'Twice daily post meals' },
  { name: 'Ksheerabala 101 Taila', form: 'Capsule / Drops', defaultDose: '1 capsule or 5-10 drops', anupana: 'Warm milk', timing: 'Bedtime / Empty stomach' },
  { name: 'Brahmi Vati (Gold)', form: 'Vati', defaultDose: '1 tablet', anupana: 'Honey / Cow Milk', timing: 'Morning & Evening' },
  { name: 'Sitopaladi Churna', form: 'Churna', defaultDose: '3g', anupana: 'Honey and Ghee (unequal parts)', timing: 'Thrice daily with honey' },
  { name: 'Gokshuradi Guggulu', form: 'Vati', defaultDose: '2 tablets', anupana: 'Musta Kwath / Water', timing: 'Twice daily after food' },
  { name: 'Punarnavarishta', form: 'Asava/Arishta', defaultDose: '20 ml', anupana: 'Equal quantity of water', timing: 'Twice daily after meals' },
  { name: 'Arogyavardhini Vati', form: 'Vati', defaultDose: '2 tablets (250mg each)', anupana: 'Lukewarm water', timing: 'Twice daily before food' },
  { name: 'Shankha Vati', form: 'Vati', defaultDose: '1-2 tablets', anupana: 'Lemon water / Warm water', timing: 'After food during discomfort' },
  { name: 'Haridra Khanda', form: 'Granules', defaultDose: '5g', anupana: 'Warm milk', timing: 'Twice daily' },
  { name: 'Chitrakadi Vati', form: 'Vati', defaultDose: '1-2 tablets', anupana: 'Warm water / Buttermilk', timing: 'Before food for Deepana-Pachana' },
];

export const PANCHAKARMA_THERAPIES = [
  'Abhyanga (Herbal Oil Massage)',
  'Swedana (Herbal Steam Therapy)',
  'Shirodhara (Forehead Oil Stream)',
  'Basti (Medicated Enema - Matra/Niruha)',
  'Nasya (Nasal Drop Administration)',
  'Virechana (Therapeutic Purgation)',
  'Vamana (Therapeutic Emesis)',
  'Janu Basti (Knee Oil Pool)',
  'Kati Basti (Lumbar Oil Pool)',
  'Greeva Basti (Cervical Oil Pool)',
  'Patra Pinda Sweda (Leaf Bolus Therapy)',
  'Shashtika Shali Pinda Sweda',
  'Takradhara (Medicated Buttermilk Stream)',
  'Netra Tarpana (Eye Nourishment Pool)',
];

export const DIET_PRESETS = {
  vata: {
    pathya: 'Warm freshly cooked foods, ghee, sweet fruits (dates, ripe mangoes), soups, ginger, boiled milk with cardamom, regular meal times',
    apathya: 'Dry, cold, raw salads, cold drinks, fasting, beans/rajma without spices, dry crackers, caffeine, night waking',
  },
  pitta: {
    pathya: 'Cooling foods, coconut water, sweet pomegranate, cilantro, fennel tea, ghee, basmati rice, soaked almonds, melons, sweet lassi',
    apathya: 'Spicy/chilli foods, deep fried, fermented foods, vinegar, pickles, excessive curd/alcohol, direct hot sun, skipped meals',
  },
  kapha: {
    pathya: 'Warm, light, dry foods, barley, honey (not heated), warm water, ginger/black pepper tea, steamed vegetables, vigorous exercise',
    apathya: 'Cold dairy products, ice cream, heavy sweets, cheese, fried oily foods, daytime napping, sedentary lifestyle',
  },
  general: {
    pathya: 'Shashtika shali (aged rice), Mudga (green gram/moong dal), Godhuma (wheat), Ghrita (pure cow ghee), warm water, timely sleep (10 PM)',
    apathya: 'Viruddha Ahara (incompatible food combinations e.g. milk+fish, heated honey), excess junk foods, suppressing natural urges (Adharaniya Vega)',
  },
};
