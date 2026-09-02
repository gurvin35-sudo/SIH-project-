import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDatabaseSeeded } from '@/lib/auto-seed';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    await ensureDatabaseSeeded(prisma);

    const body = await request.json();
    const {
      patientId,
      name,
      age,
      gender,
      contact,
      email,
      address,
      bloodGroup,
      abhaId,
      language = 'en',
      consentGiven = true,
      chiefComplaint = '',
      duration = '',
      hpi = '',
      pastMedicalHistory = '',
      pastSurgicalHistory = '',
      currentMedicines = '',
      allergies = '',
      familyHistory = '',
      personalHistory = '',
      reviewOfSystems = '',
      ayushAgni = 'Samagni',
      ayushKoshta = 'Madhyama',
      aiInterviewTranscript = [],
      documents = [],
      redFlags = null,
      status = 'SENT_TO_DOCTOR'
    } = body;

    // 1. Find or assign default doctor
    const defaultDoctor = await prisma.doctor.findFirst();
    if (!defaultDoctor) {
      return NextResponse.json({ error: 'No doctor found to assign patient' }, { status: 500 });
    }

    // 2. Synthesize Physician-Ready AI Clinical Summary
    const parsedDocsCount = documents?.length || 0;
    const extractedMedsList = [];
    const extractedLabList = [];

    documents.forEach((doc) => {
      try {
        const data = typeof doc.extractedData === 'string' ? JSON.parse(doc.extractedData) : doc.extractedData;
        if (data?.medicines) {
          data.medicines.forEach((m) => extractedMedsList.push(`${m.name} (${m.dose || 'Std'})`));
        }
        if (data?.labValues) {
          data.labValues.forEach((l) => extractedLabList.push(`${l.parameter}: ${l.value} ${l.unit} [${l.status}]`));
        }
      } catch (e) {}
    });

    const isHindi = language === 'hi';

    const aiSummary = {
      generatedAt: new Date().toISOString(),
      disclaimer: isHindi
        ? '⚠️ एआई द्वारा तैयार क्लिनिकल सारांश — चिकित्सक द्वारा सत्यापन एवं पुष्टि अनिवार्य है।'
        : '⚠️ AI-Generated Clinical Draft — Doctor Verification & Confirmation Required.',
      patientHeader: {
        name,
        age: parseInt(age, 10) || 30,
        gender,
        contact,
        abhaId: abhaId || null,
        bloodGroup: bloodGroup || 'Unspecified',
        language: isHindi ? 'हिन्दी (Hindi)' : 'English',
        consentGiven: Boolean(consentGiven)
      },
      redFlags: redFlags || null,
      clinicalHistory: {
        chiefComplaint: chiefComplaint || (isHindi ? 'विशेष लक्षण दर्ज नहीं' : 'No primary complaint logged'),
        duration: duration || (isHindi ? 'अस्पष्ट' : 'Not specified'),
        hpi: hpi || (isHindi ? 'लक्षणों का विवरण उपलब्ध नहीं' : 'Patient reported gradual onset.'),
        pastMedicalHistory: pastMedicalHistory || 'None reported',
        pastSurgicalHistory: pastSurgicalHistory || 'None',
        currentMedicines: currentMedicines || 'None',
        allergies: allergies || 'No known drug allergies (NKDA)',
        familyHistory: familyHistory || 'Non-contributory',
        personalHistory: personalHistory || 'Balanced diet & routine',
        reviewOfSystems: reviewOfSystems || 'Normal'
      },
      ayushParameters: {
        prakritiTendency: chiefComplaint?.toLowerCase().includes('joint') || chiefComplaint?.toLowerCase().includes('pain') ? 'Vata dominant' : 'Pitta-Vata',
        agni: ayushAgni || 'Samagni (Balanced)',
        koshta: ayushKoshta || 'Madhyama (Regular)',
        lifestyleDiet: personalHistory?.toLowerCase().includes('veg') ? 'Vegetarian' : 'Standard diet'
      },
      digitizedRecordsSummary: {
        totalDocumentsUploaded: parsedDocsCount,
        extractedPriorMedicines: extractedMedsList,
        extractedLabParameters: extractedLabList,
      },
      physicianBrief: isHindi
        ? `${name} (${age} वर्ष, ${gender}) ने परामर्श पूर्व एआई इतिहास पूर्ण किया। मुख्य लक्षण: "${chiefComplaint}". ${allergies ? `एलर्जी: ${allergies}।` : ''} पूर्व जांच रिपोर्ट्स (${parsedDocsCount}) एवं औषधि इतिहास सफलतापूर्वक डिजिटाइज किया गया है।`
        : `${name}, a ${age}-year-old ${gender.toLowerCase()}, completed AI pre-consultation intake. Chief complaint: "${chiefComplaint}" with duration: "${duration || 'recent'}". Allergies: ${allergies || 'None reported'}. ${parsedDocsCount} historical medical record(s) digitized with OCR entity extraction.`
    };

    // 3. Upsert or Create Patient
    let patientRecord;
    if (patientId) {
      patientRecord = await prisma.patient.update({
        where: { id: patientId },
        data: {
          name: name.trim(),
          age: parseInt(age, 10) || 30,
          gender,
          contact: contact.trim(),
          email: email?.trim() || null,
          address: address?.trim() || null,
          bloodGroup: bloodGroup?.trim() || null,
          abhaId: abhaId?.trim() || null,
          allergies: allergies?.trim() || null,
          preConsultationStatus: status,
          language,
          consentGiven: Boolean(consentGiven),
          consentTimestamp: new Date(),
          chiefComplaint,
          duration,
          hpi,
          pastMedicalHistory,
          pastSurgicalHistory,
          currentMedicines,
          familyHistory,
          personalHistory,
          reviewOfSystems,
          ayushAgni,
          ayushKoshta,
          aiSummary: JSON.stringify(aiSummary),
          aiInterviewData: JSON.stringify(aiInterviewTranscript),
          redFlags: redFlags ? JSON.stringify(redFlags) : null,
        }
      });
    } else {
      // Check if patient with contact or abhaId already exists
      let existing = null;
      if (abhaId && abhaId.trim()) {
        existing = await prisma.patient.findUnique({ where: { abhaId: abhaId.trim() } });
      }
      if (!existing && contact) {
        existing = await prisma.patient.findFirst({ where: { contact: contact.trim() } });
      }

      if (existing) {
        patientRecord = await prisma.patient.update({
          where: { id: existing.id },
          data: {
            name: name.trim(),
            age: parseInt(age, 10) || existing.age,
            gender: gender || existing.gender,
            bloodGroup: bloodGroup?.trim() || existing.bloodGroup,
            allergies: allergies?.trim() || existing.allergies,
            preConsultationStatus: status,
            language,
            consentGiven: Boolean(consentGiven),
            consentTimestamp: new Date(),
            chiefComplaint,
            duration,
            hpi,
            pastMedicalHistory,
            pastSurgicalHistory,
            currentMedicines,
            familyHistory,
            personalHistory,
            reviewOfSystems,
            ayushAgni,
            ayushKoshta,
            aiSummary: JSON.stringify(aiSummary),
            aiInterviewData: JSON.stringify(aiInterviewTranscript),
            redFlags: redFlags ? JSON.stringify(redFlags) : null,
          }
        });
      } else {
        patientRecord = await prisma.patient.create({
          data: {
            doctorId: defaultDoctor.id,
            name: name.trim(),
            age: parseInt(age, 10) || 30,
            gender,
            contact: contact.trim(),
            email: email?.trim() || null,
            address: address?.trim() || null,
            bloodGroup: bloodGroup?.trim() || null,
            abhaId: abhaId?.trim() || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            allergies: allergies?.trim() || null,
            prakritiType: 'Vata-Pitta dominant',
            preConsultationStatus: status,
            language,
            consentGiven: Boolean(consentGiven),
            consentTimestamp: new Date(),
            chiefComplaint,
            duration,
            hpi,
            pastMedicalHistory,
            pastSurgicalHistory,
            currentMedicines,
            familyHistory,
            personalHistory,
            reviewOfSystems,
            ayushAgni,
            ayushKoshta,
            aiSummary: JSON.stringify(aiSummary),
            aiInterviewData: JSON.stringify(aiInterviewTranscript),
            redFlags: redFlags ? JSON.stringify(redFlags) : null,
          }
        });
      }
    }

    // 4. Save uploaded digitized medical documents into the database
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        // Avoid duplicate by title & patientId
        const existingDoc = await prisma.medicalDocument.findFirst({
          where: {
            patientId: patientRecord.id,
            title: doc.title || 'Medical Record'
          }
        });

        if (!existingDoc) {
          await prisma.medicalDocument.create({
            data: {
              patientId: patientRecord.id,
              title: doc.title || 'Medical Report',
              docType: doc.docType || 'Medical Report',
              docDate: doc.docDate ? new Date(doc.docDate) : new Date(),
              fileUrl: doc.fileUrl || null,
              ocrText: doc.ocrText || '',
              extractedData: typeof doc.extractedData === 'object' ? JSON.stringify(doc.extractedData) : doc.extractedData || '{}',
              summary: doc.summary || doc.extractedData?.summary || '',
              uploadedBy: 'patient'
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Patient health assessment & records submitted successfully to doctor',
      patientId: patientRecord.id,
      patient: patientRecord,
      aiSummary
    });
  } catch (error) {
    console.error('Error in patient-assessment route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process patient assessment', details: error.message },
      { status: 500 }
    );
  }
}
