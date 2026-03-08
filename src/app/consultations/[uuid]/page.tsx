'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { VCon } from '@/types/vcon';
import type { ClinicalAnalysis } from '@/app/api/analyze/route';

interface ConsentData {
  consent_records: Array<Record<string, unknown>>;
  audit_log: Array<{ timestamp: string; action: string; actor: string; details: string }>;
  redaction_preview: { transcript: string; rules: Record<string, unknown>; note: string };
  _demo_mode?: boolean;
}

export default function ConsultationDetailPage() {
  const params = useParams();
  const uuid = params.uuid as string;
  const [vcon, setVcon] = useState<VCon | null>(null);
  const [analysis, setAnalysis] = useState<ClinicalAnalysis | null>(null);
  const [consentData, setConsentData] = useState<ConsentData | null>(null);
  const [showRedactionPreview, setShowRedactionPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/vcons/${uuid}`);
        const data = await res.json();
        if (data.vcon) setVcon(data.vcon);

        if (data._demo_mode) {
          const consentRes = await fetch(`/api/consultations/${uuid}/consent`);
          if (consentRes.ok) {
            const consent = await consentRes.json();
            setConsentData(consent);
          }
        }

        if (typeof window !== 'undefined') {
          const stored = sessionStorage.getItem(`medivcon-analysis-${uuid}`);
          if (stored) {
            try {
              setAnalysis(JSON.parse(stored) as ClinicalAnalysis);
            } catch {}
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [uuid]);

  async function generateAnalysis() {
    const transcript = vcon?.dialog?.map((d) => d.body).filter(Boolean).join('\n\n') || '';
    if (!transcript) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          patientName: vcon?.parties?.find((_, i) => i === 1)?.name,
          doctorName: vcon?.parties?.[0]?.name,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnalysis(data);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`medivcon-analysis-${uuid}`, JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  }

  const transcript = vcon?.dialog?.map((d) => d.body).filter(Boolean).join('\n\n') || '';

  const builtInAnalysis = vcon?.analysis?.find((a) => a.type === 'soap_summary');
  const soapFromVcon = builtInAnalysis?.body
    ? (() => {
        try {
          return JSON.parse(builtInAnalysis.body) as { subjective: string; objective: string; assessment: string; plan: string };
        } catch {
          return null;
        }
      })()
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!vcon) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Consultation not found.</p>
        <Link href="/consultations" className="mt-4 inline-block text-teal-400 hover:underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/consultations" className="text-sm text-slate-500 hover:text-teal-400">
            ← Back
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-100">{vcon.subject || 'Consultation'}</h1>
          <p className="mt-1 text-slate-500">{formatDate(vcon.created_at)}</p>
        </div>
        {!analysis && !soapFromVcon && transcript && (
          <Button onClick={generateAnalysis} disabled={analyzing}>
            {analyzing ? 'Analyzing...' : 'Generate Clinical Summary'}
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
            <p className="text-sm text-slate-500">
              {vcon.parties?.map((p) => p.name).filter(Boolean).join(' • ')}
            </p>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-lg bg-slate-900/50 p-4 text-sm text-slate-300 font-mono">
              {transcript || 'No transcript'}
            </pre>
          </CardContent>
        </Card>

        {(analysis || soapFromVcon) ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SOAP Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs font-medium uppercase text-teal-400">Subjective</span>
                  <p className="mt-1 text-slate-300">{(analysis?.soapNotes ?? soapFromVcon)?.subjective}</p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase text-teal-400">Objective</span>
                  <p className="mt-1 text-slate-300">{(analysis?.soapNotes ?? soapFromVcon)?.objective}</p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase text-teal-400">Assessment</span>
                  <p className="mt-1 text-slate-300">{(analysis?.soapNotes ?? soapFromVcon)?.assessment}</p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase text-teal-400">Plan</span>
                  <p className="mt-1 text-slate-300">{(analysis?.soapNotes ?? soapFromVcon)?.plan}</p>
                </div>
              </CardContent>
            </Card>

            {analysis?.patientSummary && (
              <Card>
                <CardHeader>
                  <CardTitle>Patient Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{analysis.patientSummary}</p>
                </CardContent>
              </Card>
            )}

            {analysis && (analysis.medicationReminders?.length > 0 || analysis.followUpTasks?.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Reminders & Follow-up</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.medicationReminders?.length > 0 && (
                    <div>
                      <span className="text-xs font-medium uppercase text-teal-400">Medications</span>
                      <ul className="mt-1 list-disc pl-5 text-slate-300">
                        {analysis.medicationReminders.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.followUpTasks?.length > 0 && (
                    <div>
                      <span className="text-xs font-medium uppercase text-teal-400">Tasks</span>
                      <ul className="mt-1 list-disc pl-5 text-slate-300">
                        {analysis.followUpTasks.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.followUpPlan && (
                    <div>
                      <span className="text-xs font-medium uppercase text-teal-400">Follow-up Plan</span>
                      <p className="mt-1 text-slate-300">{analysis.followUpPlan}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {analysis && analysis.redFlags && analysis.redFlags.length > 0 && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="text-amber-400">Red Flags</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-amber-200/90">
                    {analysis.redFlags.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Clinical Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500">
                Click &quot;Generate Clinical Summary&quot; to create SOAP notes, patient summary, and follow-up plan from this transcript.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {consentData && (
        <div className="space-y-6 border-t border-slate-700/50 pt-8">
          <h2 className="text-xl font-semibold text-slate-100">Consent & Privacy</h2>
          <p className="text-sm text-slate-500">
            vCon consent attachments and HIPAA-compliant audit trail. SCITT receipts provide tamper-evident proof.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Consent Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {consentData.consent_records.map((r, i) => (
                  <div key={i} className="rounded-lg bg-slate-800/50 p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${
                        r.consent_status === 'granted' ? 'bg-teal-400' :
                        r.consent_status === 'withdrawn' ? 'bg-amber-400' : 'bg-slate-500'
                      }`} />
                      <span className="font-medium text-slate-200 capitalize">{String(r.consent_status)}</span>
                      {'withdrawal_date' in r && r.withdrawal_date ? (
                        <span className="text-slate-500">(withdrawn {formatDate(String(r.withdrawal_date))})</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-slate-400">Purpose: {String(r.purpose)}</p>
                    <p className="text-xs text-slate-500">Jurisdiction: {String(r.jurisdiction)} • Method: {String(r.consent_method)}</p>
                    {'registry' in r && r.registry ? (
                      <p className="mt-1 text-xs text-teal-400/80">SCITT receipt registered</p>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {consentData.audit_log.map((entry, i) => (
                    <li key={i} className="flex gap-3 border-b border-slate-700/50 pb-2 last:border-0">
                      <span className="text-slate-500 shrink-0">{formatDate(entry.timestamp)}</span>
                      <div>
                        <span className="font-medium text-slate-300">{entry.action}</span>
                        <span className="text-slate-500"> — {entry.actor}</span>
                        <p className="text-slate-400">{entry.details}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Redaction Preview</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowRedactionPreview(!showRedactionPreview)}>
                {showRedactionPreview ? 'Hide' : 'Show'} before sharing
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-3">{consentData.redaction_preview.note}</p>
              {showRedactionPreview ? (
                <pre className="whitespace-pre-wrap rounded-lg bg-slate-900/50 p-4 text-sm text-slate-300 font-mono border border-amber-500/20">
                  {consentData.redaction_preview.transcript}
                </pre>
              ) : (
                <p className="text-slate-500 text-sm">PII redacted per consent scope before sharing with specialists or insurers.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
