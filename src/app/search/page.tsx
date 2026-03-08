'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface VConSummary {
  uuid: string;
  subject?: string;
  created_at?: string;
  parties?: { name?: string }[];
  dialog?: { body?: string }[];
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VConSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/vcons?limit=100`);
      const data = await res.json();
      const vcons: VConSummary[] = data.vcons || [];
      const q = query.toLowerCase().trim();
      const filtered = vcons.filter((v) => {
        const subjectMatch = v.subject?.toLowerCase().includes(q);
        const partyMatch = v.parties?.some((p) => p.name?.toLowerCase().includes(q));
        const dialogMatch = v.dialog?.some((d) => d.body?.toLowerCase().includes(q));
        return subjectMatch || partyMatch || dialogMatch;
      });
      setResults(filtered);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Longitudinal Patient Intelligence</h1>
        <p className="mt-1 text-slate-400">
          Search across a patient&apos;s entire conversation history. Ask: &quot;Has this patient mentioned chest pain in any past visit?&quot;
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Consultations</CardTitle>
          <p className="text-sm text-slate-500">
            Keyword search across subjects, participant names, and transcript content.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., chest pain, diabetes, Dr. Smith..."
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searched && (
        <Card>
          <CardHeader>
            <CardTitle>
              Results {results.length > 0 && `(${results.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-slate-500">No matching consultations.</p>
            ) : (
              <ul className="space-y-3">
                {results.map((v) => (
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
      )}
    </div>
  );
}
