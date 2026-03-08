'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface HealthStatus {
  status: string;
  database: string;
}

interface VConSummary {
  uuid: string;
  subject?: string;
  created_at?: string;
  parties?: { name?: string }[];
}

interface ListResponse {
  vcons: VConSummary[];
  _demo_mode?: boolean;
  _message?: string;
}

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [recentVcons, setRecentVcons] = useState<VConSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const healthRes = await fetch('/api/health');
        const healthData = await healthRes.json();
        setHealth(healthData);

        const vconsRes = await fetch('/api/vcons?limit=5');
        const vconsData: ListResponse = await vconsRes.json();
        setRecentVcons(vconsData.vcons || []);
        if (!vconsRes.ok) {
          setHealth({ status: 'unhealthy', database: 'error' });
        }
      } catch {
        setHealth({ status: 'unhealthy', database: 'error' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">MediVCon</h1>
        <p className="mt-2 text-slate-400">
          AI-Powered Patient Conversation Intelligence — store consultations as vCon records and derive clinical insights.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500">Checking...</p>
            ) : health?.status === 'healthy' ? (
              <div className="flex items-center gap-2 text-teal-400">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                Connected — vCon MCP server ready
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  {health?.database === 'error' ? 'vCon server unreachable' : 'Degraded'}
                </div>
                {health?.database === 'error' && (
                  <p className="text-xs text-slate-500 mt-2">
                    Start the vCon MCP server: <code className="bg-slate-800 px-1 rounded">MCP_TRANSPORT=http API_KEYS=your-key npm run dev</code>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/consultations/new">
              <Button size="lg" className="w-full">
                Ingest New Consultation
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Consultations</CardTitle>
          <Link href="/consultations">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : recentVcons.length === 0 ? (
            <p className="text-slate-500">
              No consultations yet.{' '}
              <Link href="/consultations/new" className="text-teal-400 hover:underline">
                Ingest your first transcript
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {recentVcons.map((v) => (
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
