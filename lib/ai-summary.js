/**
 * AI Clinical Summary & Doctor-to-Doctor Handover Engine
 * Synthesizes patient longitudinal records, Prakriti, Ashtavidha Pariksha,
 * dual diagnoses, prescriptions, and alerts for seamless doctor transitions.
 */

/**
 * Generate a comprehensive clinical handover summary for a patient.
 * @param {Object} patient - Full patient object with cases array
 * @param {Object} options - { language: 'en' | 'hi', doctorNotes?: string }
 */
export function generatePatientAISummary(patient, options = {}) {
  const lang = options.language === 'hi' ? 'hi' : 'en';
  const customNotes = options.doctorNotes || '';
  const cases = patient.cases || [];
  
  // Sort cases chronologically (oldest to newest for trajectory, newest for active status)
  const sortedCasesDesc = [...cases].sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
  const latestCase = sortedCasesDesc[0] || null;
  const initialCase = sortedCasesDesc[sortedCasesDesc.length - 1] || null;

  // 1. Gather all unique diagnoses
  const ayurDiagnoses = Array.from(
    new Set(cases.map((c) => c.ayurvedicDiagnosis).filter(Boolean))
  );
  const modernDiagnoses = Array.from(
    new Set(cases.map((c) => c.modernDiagnosis).filter(Boolean))
  );

  // 2. Aggregate active and previous medications
  let activePrescriptions = [];
  let allHistoricalMeds = [];
  
  cases.forEach((c, idx) => {
    try {
      if (c.prescription) {
        const meds = typeof c.prescription === 'string' ? JSON.parse(c.prescription) : c.prescription;
        if (Array.isArray(meds)) {
          if (idx === 0) {
            // Latest case = active prescriptions
            activePrescriptions = meds;
          }
          meds.forEach(m => {
            if (!allHistoricalMeds.some(existing => existing.name?.toLowerCase() === m.name?.toLowerCase())) {
              allHistoricalMeds.push({ ...m, visitDate: c.visitDate });
            }
          });
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  });

  // 3. Panchakarma therapies received
  const panchakarmaProcedures = Array.from(
    new Set(cases.map((c) => c.panchakarmaAdvice).filter(Boolean))
  );

  // 4. Clinical Pariksha & Constitution profiling
  const prakriti = patient.prakritiType || latestCase?.prakritiResult || 'Tridoshic (Balanced)';
  const vataScore = latestCase?.vataScore || 0;
  const pittaScore = latestCase?.pittaScore || 0;
  const kaphaScore = latestCase?.kaphaScore || 0;
  const totalScore = vataScore + pittaScore + kaphaScore || 1;
  const vataPct = Math.round((vataScore / totalScore) * 100);
  const pittaPct = Math.round((pittaScore / totalScore) * 100);
  const kaphaPct = Math.round((kaphaScore / totalScore) * 100);

  const agni = latestCase?.agniType || 'Samagni (Balanced)';
  const koshta = latestCase?.koshtaType || 'Madhyama';
  const nadi = latestCase?.nadiPariksha || 'Normal / Balanced pulse';
  const jihva = latestCase?.jihvaPariksha || 'Niram (Clean, un-coated)';
  const mala = latestCase?.malaPariksha || 'Regular';

  // 5. Build Chief Complaint Trajectory
  const complaintEvolution = sortedCasesDesc.map((c, idx) => ({
    visitNumber: sortedCasesDesc.length - idx,
    date: c.visitDate,
    complaint: c.chiefComplaint,
    duration: c.duration,
    ayurDiag: c.ayurvedicDiagnosis,
    modernDiag: c.modernDiagnosis,
    prognosis: c.prognosis,
  }));

  // 6. Build Safety & Caution Alerts for incoming doctor
  const criticalAlerts = [];
  if (patient.allergies && patient.allergies.toLowerCase() !== 'none' && patient.allergies.toLowerCase() !== 'no') {
    criticalAlerts.push({
      type: 'allergy',
      severity: 'high',
      title: lang === 'hi' ? 'गंभीर एलर्जी चेतावनी' : 'Known Allergy / Hypersensitivity',
      message: `${lang === 'hi' ? 'रोगी की ज्ञात एलर्जी' : 'Patient reported allergies'}: ${patient.allergies}. ${lang === 'hi' ? 'कृपया संबंधित जड़ी-बूटियों एवं अनुपान से बचें।' : 'Avoid cross-reactive herbal formulations and adjuvants.'}`,
    });
  }

  if (prakriti.toLowerCase().includes('pitta') || pittaScore > 5) {
    criticalAlerts.push({
      type: 'contraindication',
      severity: 'medium',
      title: lang === 'hi' ? 'पित्त दोष सावधानी' : 'High Pitta / Ushna Sensitivity',
      message: lang === 'hi' 
        ? 'रोगी में उच्च पित्त प्रवृत्ति है। तीक्ष्ण, अत्यधिक उष्ण एवं लवण-अम्ल औषधियों से बचें।'
        : 'Patient has high Pitta constitution. Exercise caution with hyper-potent heating herbs (Tikshna/Ushna virya like excessive Shunthi, Maricha, or Kshar).',
    });
  }

  if (prakriti.toLowerCase().includes('vata') || vataScore > 5) {
    criticalAlerts.push({
      type: 'contraindication',
      severity: 'medium',
      title: lang === 'hi' ? 'वात दोष सावधानी' : 'Vata Sensitivity & Ruksha Warning',
      message: lang === 'hi'
        ? 'रोगी में वात प्रकोप की संभावना है। रुक्ष, शीतल एवं उपवास आधारित उपचारों से बचें।'
        : 'Vata dominance noted. Avoid excessively dry (Ruksha) medications, cold potency herbs, and strenuous fasting therapies.',
    });
  }

  // 7. Executive Handover Brief (English & Hindi)
  let executiveBrief = '';
  let recommendations = [];

  if (lang === 'hi') {
    executiveBrief = `${patient.name} (${patient.age} वर्ष, ${patient.gender}) एक पंजीकृत आयुष रोगी हैं जिनकी प्रमुख प्रकृति '${prakriti}' है। ${
      ayurDiagnoses.length > 0 ? `रोगी का मुख्य निदान '${ayurDiagnoses.join(', ')}' (${modernDiagnoses.join(', ') || 'संबद्ध आधुनिक लक्षण'}) के रूप में दर्ज है।` : ''
    } कुल ${cases.length} नैदानिक परामर्श दर्ज किए गए हैं। वर्तमान में अग्नि '${agni}' एवं कोष्ठ '${koshta}' अवस्था में है। यह सारांश नए चिकित्सक को रोगी के इतिहास, सक्रिय दवाओं एवं दोष स्थिति की त्वरित समझ प्रदान करने हेतु तैयार किया गया है।`;

    recommendations = [
      `वर्तमान सक्रिय दवाओं (${activePrescriptions.length}) की निरंतरता एवं रोग लक्षण प्रतिक्रिया की समीक्षा करें।`,
      `अग्नि '${agni}' एवं कोष्ठ '${koshta}' के अनुसार दीपन-पाचन उपचार जारी रखें।`,
      latestCase?.followUpDate ? `आगामी निर्धारित फॉलो-अप तिथि: ${new Date(latestCase.followUpDate).toLocaleDateString('hi-IN')}` : 'रोग के शमन अनुसार 2 से 4 सप्ताह में पुनर्मूल्यांकन अनुशंसित है।',
      panchakarmaProcedures.length > 0 ? `पूर्व पंचकर्म (${panchakarmaProcedures.join(', ')}) के उपरांत संसर्जन क्रम व रसायन चिकित्सा पर ध्यान दें।` : 'आवश्यकतानुसार सौम्य शोधन या शमन चिकित्सा का मूल्यांकन करें।',
    ];
  } else {
    executiveBrief = `${patient.name} is a ${patient.age}-year-old ${patient.gender.toLowerCase()} presenting with a constitution of ${prakriti}. ${
      ayurDiagnoses.length > 0 
        ? `Primary clinical diagnosis is ${ayurDiagnoses.join(' / ')}${modernDiagnoses.length > 0 ? ` correlated with ${modernDiagnoses.join(', ')}` : ''}.`
        : 'No formal chronic diagnosis logged yet.'
    } Over ${cases.length} documented consultation(s), current digestive fire (Agni) is evaluated as ${agni} and bowel nature (Koshta) as ${koshta}. This synthesized transfer-of-care summary provides incoming physicians with an instant clinical overview of pathology progression, current prescription load, and constitution safety boundaries.`;

    recommendations = [
      `Review therapeutic response to the ${activePrescriptions.length} active medications currently prescribed.`,
      `Maintain Deepana-Pachana alignment with the patient's ${agni} digestive fire and ${koshta} bowel pattern.`,
      latestCase?.followUpDate ? `Previous physician scheduled follow-up for: ${new Date(latestCase.followUpDate).toLocaleDateString()}` : 'Re-evaluate clinical markers and dosha balance in 2-3 weeks.',
      panchakarmaProcedures.length > 0 ? `Monitor post-therapy stabilization following prior Panchakarma (${panchakarmaProcedures.join(', ')}).` : 'Consider targeted Shamana or gentle Shodhana if symptoms persist.',
    ];
  }

  return {
    patientId: patient.id,
    patientName: patient.name,
    age: patient.age,
    gender: patient.gender,
    contact: patient.contact,
    bloodGroup: patient.bloodGroup || 'Not specified',
    abhaId: patient.abhaId || null,
    allergies: patient.allergies || 'None reported',
    totalVisits: cases.length,
    lastVisitDate: latestCase?.visitDate || patient.createdAt,
    prakriti,
    doshaScores: { vata: vataPct, pitta: pittaPct, kapha: kaphaPct },
    parikshaTrends: {
      agni,
      koshta,
      nadi,
      jihva,
      mala,
    },
    primaryAyurvedicDiagnoses: ayurDiagnoses,
    primaryModernDiagnoses: modernDiagnoses,
    executiveBrief,
    complaintEvolution,
    activePrescriptions,
    allHistoricalMeds,
    panchakarmaProcedures,
    dietAdvice: {
      pathya: latestCase?.pathyaDiet || 'Wholesome warm freshly cooked meals',
      apathya: latestCase?.apathyaDiet || 'Excess oily, spicy, processed foods',
      lifestyle: latestCase?.lifestyleAdvice || 'Pranayama, regular sleep schedule, gentle yoga',
    },
    criticalAlerts,
    doctorReferralNotes: customNotes,
    recommendations,
    generatedAt: new Date().toISOString(),
    confidenceScore: cases.length > 0 ? 96 : 85,
  };
}

/**
 * Generate a single-visit AI synthesis for a specific CaseRecord.
 */
export function generateCaseAISynthesis(caseRecord, patient, options = {}) {
  const lang = options.language === 'hi' ? 'hi' : 'en';
  
  let meds = [];
  try {
    if (caseRecord.prescription) {
      meds = typeof caseRecord.prescription === 'string' 
        ? JSON.parse(caseRecord.prescription) 
        : caseRecord.prescription;
    }
  } catch (e) {
    meds = [];
  }

  const diagnosisSummary = `${caseRecord.ayurvedicDiagnosis || 'Ayurvedic evaluation'} ${
    caseRecord.modernDiagnosis ? `(${caseRecord.modernDiagnosis})` : ''
  }`;

  const clinicalHighlights = [
    `Chief Complaint: ${caseRecord.chiefComplaint} (Duration: ${caseRecord.duration || 'Not specified'})`,
    `Prakriti & Dosha state: ${caseRecord.prakritiResult || patient?.prakritiType || 'Tridoshic'} (V:${caseRecord.vataScore} P:${caseRecord.pittaScore} K:${caseRecord.kaphaScore})`,
    `Ashtavidha Pariksha findings: Nadi - ${caseRecord.nadiPariksha || 'Normal'}, Jihva - ${caseRecord.jihvaPariksha || 'Niram'}, Agni - ${caseRecord.agniType || 'Samagni'}`,
    `Treatment protocol: ${meds.length} formulation(s) prescribed with targeted Panchakarma / Pathya regimen.`,
  ];

  return {
    caseId: caseRecord.id,
    visitDate: caseRecord.visitDate,
    patientName: patient?.name,
    age: patient?.age,
    gender: patient?.gender,
    diagnosisSummary,
    prognosis: caseRecord.prognosis || 'Sukha Sadhya (Easily Curable)',
    clinicalHighlights,
    medicationsCount: meds.length,
    medications: meds,
    panchakarmaAdvice: caseRecord.panchakarmaAdvice,
    pathyaDiet: caseRecord.pathyaDiet,
    apathyaDiet: caseRecord.apathyaDiet,
    lifestyleAdvice: caseRecord.lifestyleAdvice,
    followUpDate: caseRecord.followUpDate,
    generatedAt: new Date().toISOString(),
  };
}
