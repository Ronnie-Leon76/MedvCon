/**
 * Dummy vCon data for demo mode when vCon MCP server is unreachable.
 * Demonstrates end-to-end consent flow, audit trails, and redaction per
 * IETF draft-howe-vcon-consent and SCITT principles.
 */

import type { VCon } from '@/types/vcon';

export interface ConsentRecord {
  purpose: string;
  status: 'granted' | 'withdrawn' | 'expired' | 'pending' | 'revoked';
  consent_date: string;
  expiry_date?: string;
  jurisdiction: string;
  consent_method: string;
  data_categories: string[];
}

export interface ConsentAttachment {
  type: 'consent_record';
  encoding: 'json';
  party: number;
  start: string;
  body: string; // JSON string
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}

const SAMPLE_TRANSCRIPT = `Doctor: Good morning. What brings you in today?

Patient: I've been having chest pain for the past few days. It's a dull ache, mostly when I'm stressed or after eating.

Doctor: I see. Any shortness of breath, nausea, or pain radiating to your arm?

Patient: A little shortness of breath when I climb stairs. No nausea. The pain sometimes goes to my left arm.

Doctor: Any family history of heart disease?

Patient: My father had a heart attack at 55.

Doctor: We'll run an ECG and some blood work today. I'm also prescribing aspirin 81mg daily as a precaution. Avoid heavy exertion until we have results. Call us immediately if the pain worsens or you have trouble breathing.

Patient: Okay, thank you.`;

const REDACTED_TRANSCRIPT = `Doctor: Good morning. What brings you in today?

Patient: I've been having chest pain for the past few days. It's a dull ache, mostly when I'm stressed or after eating.

Doctor: I see. Any shortness of breath, nausea, or pain radiating to your arm?

Patient: A little shortness of breath when I climb stairs. No nausea. The pain sometimes goes to [REDACTED].

Doctor: Any family history of heart disease?

Patient: My father had a heart attack at 55.

Doctor: We'll run an ECG and some blood work today. I'm also prescribing aspirin 81mg daily as a precaution. Avoid heavy exertion until we have results. Call us immediately if the pain worsens or you have trouble breathing.

Patient: Okay, thank you.`;

export const DUMMY_VCONS: VCon[] = [
  {
    vcon: '0.3.0',
    uuid: 'demo-001-chest-pain',
    created_at: '2025-03-01T10:30:00.000Z',
    subject: 'Chest pain evaluation - John Doe',
    parties: [
      { name: 'Dr. Sarah Chen', mailto: 'schen@medivcon.demo', role: 'agent' },
      { name: 'John Doe', tel: '+1-555-0100', did: 'patient-demo-001', role: 'customer' },
    ],
    dialog: [
      {
        type: 'text',
        start: '2025-03-01T10:30:00.000Z',
        parties: [0, 1],
        originator: 1,
        body: SAMPLE_TRANSCRIPT,
        encoding: 'none',
      },
    ],
    analysis: [
      {
        type: 'soap_summary',
        vendor: 'MediVCon',
        schema: 'clinical-v1',
        body: JSON.stringify({
          subjective: 'Patient reports chest pain for past few days, dull ache, worse with stress or after eating. Family history of heart disease (father, age 55).',
          objective: 'No vitals recorded in transcript. Patient describes shortness of breath with stairs, pain radiating to left arm.',
          assessment: 'Possible cardiac etiology. Requires ECG and cardiac workup to rule out ACS.',
          plan: 'ECG and blood work today. Aspirin 81mg daily. Avoid heavy exertion. Return immediately if worsening pain or breathing difficulty.',
        }),
        encoding: 'json',
      },
    ],
    attachments: [
      {
        type: 'consent_record',
        encoding: 'json',
        party: 1,
        start: '2025-03-01T10:28:00.000Z',
        body: JSON.stringify({
          consent_type: 'explicit',
          consent_status: 'granted',
          consent_date: '2025-03-01T10:28:00.000Z',
          expiry_date: '2026-03-01T10:28:00.000Z',
          legal_basis: 'gdpr_6_1_a',
          jurisdiction: 'US-HIPAA',
          purpose: 'clinical_care',
          purposes: ['clinical_care', 'quality_improvement'],
          data_categories: ['conversation_content', 'patient_identity'],
          consent_method: 'verbal',
          consent_mechanism: 'pre_consultation_recorded',
          revocable: true,
          consent_version: '1.0',
          policy_url: 'https://medivcon.demo/privacy',
          data_subject_id: 'patient-demo-001',
          registry: {
            type: 'scitt',
            url: 'https://transparency.medivcon.demo',
            receipt: 'scitt-receipt-demo-abc123',
          },
        }),
      },
      {
        type: 'tags',
        encoding: 'json',
        body: JSON.stringify(['department:cardiology', 'urgency:moderate', 'consent:granted']),
      },
    ],
  },
  {
    vcon: '0.3.0',
    uuid: 'demo-002-follow-up',
    created_at: '2025-02-15T14:00:00.000Z',
    subject: 'Follow-up: Diabetes management - Jane Smith',
    parties: [
      { name: 'Dr. Michael Park', mailto: 'mpark@medivcon.demo', role: 'agent' },
      { name: 'Jane Smith', mailto: 'jane.smith@email.com', did: 'patient-demo-002', role: 'customer' },
    ],
    dialog: [
      {
        type: 'text',
        start: '2025-02-15T14:00:00.000Z',
        parties: [0, 1],
        originator: 1,
        body: `Doctor: How have your blood sugar levels been since we last met?

Patient: Much better. I've been following the diet and taking metformin as prescribed.

Doctor: Good. Let's review your A1C results. 6.2% - that's an improvement from 7.1%.

Patient: I'm glad. I've been worried about my vision.

Doctor: We'll run a retinal screening. For diabetes, consent to share with ophthalmology is important. Have you signed the consent form?

Patient: Yes, I signed it last week.`,
        encoding: 'none',
      },
    ],
    analysis: [],
    attachments: [
      {
        type: 'consent_record',
        encoding: 'json',
        party: 1,
        start: '2025-02-15T13:55:00.000Z',
        body: JSON.stringify({
          consent_type: 'explicit',
          consent_status: 'granted',
          consent_date: '2025-02-15T13:55:00.000Z',
          expiry_date: '2026-02-15T13:55:00.000Z',
          legal_basis: 'gdpr_6_1_a',
          jurisdiction: 'US-HIPAA',
          purpose: 'clinical_care',
          purposes: ['clinical_care', 'share_with_specialists'],
          data_categories: ['conversation_content', 'patient_identity', 'lab_results'],
          consent_method: 'written',
          consent_mechanism: 'electronic_signature',
          revocable: true,
          consent_version: '1.0',
          policy_url: 'https://medivcon.demo/privacy',
          data_subject_id: 'patient-demo-002',
          registry: {
            type: 'scitt',
            url: 'https://transparency.medivcon.demo',
            receipt: 'scitt-receipt-demo-def456',
          },
        }),
      },
      {
        type: 'tags',
        encoding: 'json',
        body: JSON.stringify(['department:endocrinology', 'consent:granted', 'share_consent:ophthalmology']),
      },
    ],
  },
  {
    vcon: '0.3.0',
    uuid: 'demo-003-withdrawn',
    created_at: '2025-01-20T09:00:00.000Z',
    subject: 'Mental health consultation - Alex Rivera',
    parties: [
      { name: 'Dr. Emily Watson', mailto: 'ewatson@medivcon.demo', role: 'agent' },
      { name: 'Alex Rivera', tel: '+1-555-0200', did: 'patient-demo-003', role: 'customer' },
    ],
    dialog: [
      {
        type: 'text',
        start: '2025-01-20T09:00:00.000Z',
        parties: [0, 1],
        originator: 1,
        body: `Doctor: How have you been feeling since our last session?

Patient: I've been having more anxiety. I've decided I don't want my records shared with my employer's wellness program.

Doctor: I understand. I'll note that you're withdrawing consent for employer sharing. Your records will remain confidential.`,
        encoding: 'none',
      },
    ],
    analysis: [],
    attachments: [
      {
        type: 'consent_record',
        encoding: 'json',
        party: 1,
        start: '2025-01-20T09:00:00.000Z',
        body: JSON.stringify({
          consent_type: 'explicit',
          consent_status: 'granted',
          consent_date: '2025-01-20T09:00:00.000Z',
          expiry_date: '2026-01-20T09:00:00.000Z',
          legal_basis: 'gdpr_6_1_a',
          jurisdiction: 'US-HIPAA',
          purpose: 'clinical_care',
          purposes: ['clinical_care'],
          data_categories: ['conversation_content', 'patient_identity'],
          consent_method: 'verbal',
          consent_mechanism: 'pre_consultation_recorded',
          revocable: true,
          consent_version: '1.0',
          policy_url: 'https://medivcon.demo/privacy',
          data_subject_id: 'patient-demo-003',
          registry: {
            type: 'scitt',
            url: 'https://transparency.medivcon.demo',
            receipt: 'scitt-receipt-demo-ghi789',
          },
        }),
      },
      {
        type: 'consent_record',
        encoding: 'json',
        party: 1,
        start: '2025-01-25T14:30:00.000Z',
        body: JSON.stringify({
          consent_type: 'explicit',
          consent_status: 'withdrawn',
          consent_date: '2025-01-20T09:00:00.000Z',
          withdrawal_date: '2025-01-25T14:30:00.000Z',
          legal_basis: 'gdpr_6_1_a',
          jurisdiction: 'US-HIPAA',
          purpose: 'employer_wellness',
          purposes: ['employer_wellness'],
          data_categories: ['conversation_content', 'patient_identity'],
          consent_method: 'verbal',
          consent_mechanism: 'verbal_revocation',
          revocable: true,
          consent_version: '1.0',
          policy_url: 'https://medivcon.demo/privacy',
          data_subject_id: 'patient-demo-003',
          registry: {
            type: 'scitt',
            url: 'https://transparency.medivcon.demo',
            receipt: 'scitt-receipt-demo-revoke-001',
          },
        }),
      },
      {
        type: 'tags',
        encoding: 'json',
        body: JSON.stringify(['department:mental_health', 'consent:partial_withdrawn']),
      },
    ],
  },
];

export const DUMMY_AUDIT_LOGS: Record<string, AuditEntry[]> = {
  'demo-001-chest-pain': [
    { timestamp: '2025-03-01T10:28:00.000Z', action: 'ConsentRecorded', actor: 'Patient', details: 'Consent granted for clinical care and quality improvement' },
    { timestamp: '2025-03-01T10:30:00.000Z', action: 'vConCreated', actor: 'System', details: 'Consultation recorded' },
    { timestamp: '2025-03-01T10:35:00.000Z', action: 'AnalysisGenerated', actor: 'Claude', details: 'SOAP notes and clinical summary generated' },
    { timestamp: '2025-03-01T11:00:00.000Z', action: 'AccessLog', actor: 'Dr. Chen', details: 'Viewed full record for clinical review' },
  ],
  'demo-002-follow-up': [
    { timestamp: '2025-02-15T13:55:00.000Z', action: 'ConsentRecorded', actor: 'Patient', details: 'Consent granted for clinical care and specialist sharing' },
    { timestamp: '2025-02-15T14:00:00.000Z', action: 'vConCreated', actor: 'System', details: 'Follow-up consultation recorded' },
    { timestamp: '2025-02-16T09:00:00.000Z', action: 'ShareRequest', actor: 'Ophthalmology', details: 'Request to access for retinal screening - consent verified' },
  ],
  'demo-003-withdrawn': [
    { timestamp: '2025-01-20T09:00:00.000Z', action: 'ConsentRecorded', actor: 'Patient', details: 'Consent granted for clinical care only' },
    { timestamp: '2025-01-20T09:00:00.000Z', action: 'vConCreated', actor: 'System', details: 'Consultation recorded' },
    { timestamp: '2025-01-25T14:30:00.000Z', action: 'ConsentRevoked', actor: 'Patient', details: 'Withdrew consent for employer wellness program sharing' },
    { timestamp: '2025-01-25T14:30:00.000Z', action: 'SCITTRegistered', actor: 'System', details: 'Revocation receipt registered in transparency service' },
  ],
};

export const DUMMY_REDACTION_RULES = {
  pii_patterns: ['phone numbers', 'email addresses', 'SSN', 'specific anatomical references when sharing externally'],
  before_share: ['Patient contact info', 'Family member identifiers', 'Exact symptom locations for non-clinical recipients'],
};

export function getDummyVCon(uuid: string): VCon | undefined {
  return DUMMY_VCONS.find((v) => v.uuid === uuid);
}

export function getDummyVCons(limit = 50): VCon[] {
  return DUMMY_VCONS.slice(0, limit);
}

export function getDummyAuditLog(uuid: string): AuditEntry[] {
  return DUMMY_AUDIT_LOGS[uuid] || [];
}

export function getRedactedTranscript(uuid: string): string {
  const vcon = getDummyVCon(uuid);
  if (!vcon) return '';
  // For demo-001, return the redacted version; others use full for now
  if (uuid === 'demo-001-chest-pain') return REDACTED_TRANSCRIPT;
  return vcon.dialog?.map((d) => d.body).filter(Boolean).join('\n\n') || '';
}
