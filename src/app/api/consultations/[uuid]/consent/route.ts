import { NextRequest, NextResponse } from 'next/server';
import { getDummyAuditLog, getDummyVCon, getRedactedTranscript, DUMMY_REDACTION_RULES } from '@/lib/dummy-data';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  const vcon = getDummyVCon(uuid);
  if (!vcon) {
    return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
  }

  const consentAttachments = (vcon.attachments || []).filter(
    (a): a is { type: string; encoding: string; party: number; body: string } =>
      Boolean(a && typeof a === 'object' && 'type' in a && (a as { type: string }).type === 'consent_record')
  );

  const consentRecords = consentAttachments.map((a) => {
    try {
      return { ...JSON.parse(a.body), party_index: a.party };
    } catch {
      return null;
    }
  }).filter(Boolean);

  const auditLog = getDummyAuditLog(uuid);
  const redactedTranscript = getRedactedTranscript(uuid);

  return NextResponse.json({
    consent_records: consentRecords,
    audit_log: auditLog,
    redaction_preview: {
      transcript: redactedTranscript,
      rules: DUMMY_REDACTION_RULES,
      note: 'PII redacted before sharing with specialists or insurers per consent scope',
    },
    _demo_mode: true,
  });
}
