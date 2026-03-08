/**
 * vCon types for MediVCon - aligned with IETF vCon spec
 */

export type Encoding = 'base64url' | 'json' | 'none';
export type DialogType = 'recording' | 'text' | 'transfer' | 'incomplete';

export interface Party {
  tel?: string;
  sip?: string;
  mailto?: string;
  name?: string;
  did?: string;
  uuid?: string;
  role?: string;
}

export interface Dialog {
  type: DialogType;
  start?: string;
  duration?: number;
  parties?: number | number[];
  originator?: number;
  body?: string;
  encoding?: Encoding;
}

export interface Analysis {
  type: string;
  vendor: string;
  schema?: string;
  body?: string;
  encoding?: Encoding;
  dialog?: number | number[];
}

export interface VCon {
  vcon: '0.3.0';
  uuid?: string;
  created_at?: string;
  subject?: string;
  parties: Party[];
  dialog?: Dialog[];
  analysis?: Analysis[];
  attachments?: unknown[];
}

export interface CreateVConResponse {
  success: boolean;
  uuid: string;
  id: string;
  message: string;
  duration_ms?: number;
}

export interface ListVConsResponse {
  success: boolean;
  count: number;
  limit: number;
  vcons: VCon[];
}

export interface GetVConResponse {
  success: boolean;
  vcon: VCon;
}
