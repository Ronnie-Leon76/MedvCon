'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SAMPLE_TRANSCRIPT = `Doctor: Good morning. What brings you in today?

Patient: I've been having chest pain for the past few days. It's a dull ache, mostly when I'm stressed or after eating.

Doctor: I see. Any shortness of breath, nausea, or pain radiating to your arm?

Patient: A little shortness of breath when I climb stairs. No nausea. The pain sometimes goes to my left arm.

Doctor: Any family history of heart disease?

Patient: My father had a heart attack at 55.

Doctor: We'll run an ECG and some blood work today. I'm also prescribing aspirin 81mg daily as a precaution. Avoid heavy exertion until we have results. Call us immediately if the pain worsens or you have trouble breathing.

Patient: Okay, thank you.`;

export default function NewConsultationPage() {
  const router = useRouter();
  const [transcript, setTranscript] = useState('');
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const ingestRes = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.trim(),
          subject: subject || `Consultation: ${patientName || 'Patient'}`,
          patientName: patientName || 'Patient',
          doctorName: doctorName || 'Doctor',
        }),
      });
      const ingestData = await ingestRes.json();
      if (!ingestRes.ok) throw new Error(ingestData.error || 'Ingest failed');

      const uuid = ingestData.uuid;

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.trim(),
          patientName: patientName || undefined,
          doctorName: doctorName || undefined,
        }),
      });
      const analysis = analyzeRes.ok ? await analyzeRes.json() : null;
      if (analysis && typeof window !== 'undefined') {
        sessionStorage.setItem(`medivcon-analysis-${uuid}`, JSON.stringify(analysis));
      }

      router.push(`/consultations/${uuid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Ingest Consultation</h1>
        <p className="mt-1 text-slate-400">
          Paste a doctor-patient transcript. It will be stored as a vCon and analyzed for SOAP notes and clinical summaries.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Consultation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Chest pain evaluation"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Dr. Smith"
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transcript</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}
            >
              Load sample
            </Button>
          </CardHeader>
          <CardContent>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste the consultation transcript here..."
              rows={14}
              required
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none font-mono text-sm"
            />
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? 'Ingesting & analyzing...' : 'Ingest & Analyze'}
        </Button>
      </form>
    </div>
  );
}
