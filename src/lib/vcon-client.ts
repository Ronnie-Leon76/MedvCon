/**
 * vCon MCP Server REST API Client
 * https://mcp.conserver.io/api-reference/rest-api
 */

import type { VCon, CreateVConResponse, ListVConsResponse, GetVConResponse } from '@/types/vcon';

const getApiUrl = () =>
  process.env.VCON_API_URL || process.env.NEXT_PUBLIC_VCON_API_URL || 'http://localhost:3000/api/v1';
const getApiKey = () => process.env.VCON_API_KEY || '';

async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${getApiUrl()}${path}`;
  const apiKey = getApiKey();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (apiKey) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    return await fetch(url, { ...options, headers });
  } catch (err) {
    const cause = err instanceof Error ? err.cause : undefined;
    const code = cause && typeof cause === 'object' && 'code' in cause ? (cause as { code?: string }).code : undefined;
    if (code === 'ECONNREFUSED') {
      throw new Error(
        `vCon server unreachable at ${getApiUrl()}. Ensure the vCon MCP server is running with MCP_TRANSPORT=http and MCP_HTTP_PORT=3000.`
      );
    }
    throw err;
  }
}

export async function createVCon(vcon: Partial<VCon>): Promise<CreateVConResponse> {
  const payload: Partial<VCon> = {
    vcon: '0.3.0',
    subject: vcon.subject,
    parties: vcon.parties || [],
    dialog: vcon.dialog || [],
    analysis: vcon.analysis || [],
    attachments: vcon.attachments || [],
  };

  const res = await fetchWithAuth('/vcons', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create vCon');
  }
  return data;
}

export async function getVCon(uuid: string): Promise<GetVConResponse> {
  const res = await fetchWithAuth(`/vcons/${uuid}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to fetch vCon');
  }
  return data;
}

export async function listVCons(limit = 50): Promise<ListVConsResponse> {
  const res = await fetchWithAuth(`/vcons?limit=${limit}`);
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error(res.statusText || 'Failed to list vCons');
  }
  if (!res.ok) {
    throw new Error((data as { message?: string; error?: string })?.message || (data as { message?: string; error?: string })?.error || 'Failed to list vCons');
  }
  return data as ListVConsResponse;
}

export async function deleteVCon(uuid: string): Promise<void> {
  const res = await fetchWithAuth(`/vcons/${uuid}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to delete vCon');
  }
}

export async function healthCheck(): Promise<{ status: string; database: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/health`);
    return res.json();
  } catch (err) {
    const cause = err instanceof Error ? err.cause : undefined;
    const code = cause && typeof cause === 'object' && 'code' in cause ? (cause as { code?: string }).code : undefined;
    if (code === 'ECONNREFUSED') {
      throw new Error(`vCon server unreachable at ${getApiUrl()}`);
    }
    throw err;
  }
}
