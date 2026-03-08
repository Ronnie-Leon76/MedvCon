'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface VConSummary {
  uuid: string;
  subject?: string;
  created_at?: string;
  parties?: { name?: string }[];
}

export default function ConsultationsPage() {
  const [vcons, setVcons] = useState<VConSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vcons?limit=50')
      .then((r) => r.json())
      .then((d) => setVcons(d.vcons || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">All Consultations</h1>
        <p className="mt-1 text-slate-400">
          Longitudinal patient conversation history — search and browse vCon records.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Consultations</CardTitle>
          <Link href="/consultations/new">
            <button className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-teal-400">
              New
            </button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : vcons.length === 0 ? (
            <p className="text-slate-500">
              No consultations. <Link href="/consultations/new" className="text-teal-400 hover:underline">Ingest one</Link>.
            </p>
          ) : (
            <ul className="space-y-3">
              {vcons.map((v) => (
                <li key={v.uuid}>
                  <Link
                    href={`/consultations/${v.uuid}`}
                    className="block rounded-lg border border-slate-700/50 bg-slate-800/20 p-4 hover:border-teal-500/50 transition"
                  >
                    <div className="font-medium text-slate-200">{v.subject || 'Untitled'}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {formatDate(v.created_at)} • {v.parties?.map((p) => p.name).filter(Boolean).join(', ') || '—'}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
