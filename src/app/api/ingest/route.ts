import { NextRequest, NextResponse } from 'next/server';
import { createVCon } from '@/lib/vcon-client';
import type { VCon, Dialog, Party } from '@/types/vcon';

export interface IngestRequest {
  transcript: string;
  subject?: string;
  patientName?: string;
  patientId?: string;
  doctorName?: string;
  doctorEmail?: string;
  visitDate?: string;
  runAnalysis?: boolean;
}

/**
 * Ingest a consultation transcript as a vCon.
 * Creates parties (doctor, patient) and a single text dialog with the full transcript.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as IngestRequest;
    const {
      transcript,
      subject = 'Teleconsultation',
      patientName = 'Patient',
      patientId,
      doctorName = 'Doctor',
      doctorEmail,
      visitDate = new Date().toISOString(),
    } = body;

    if (!transcript?.trim()) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const parties: Party[] = [
      {
        name: doctorName,
        mailto: doctorEmail || `doctor@medivcon.local`,
        role: 'agent',
      },
      {
        name: patientName,
        did: patientId || undefined,
        tel: patientId?.startsWith('+') ? patientId : undefined,
        role: 'customer',
      },
    ].filter((p) => p.name);

    const dialog: Dialog[] = [
      {
        type: 'text',
        start: visitDate,
        parties: [0, 1],
        originator: 1,
        body: transcript.trim(),
        encoding: 'none',
      },
    ];

    const vconPayload: Partial<VCon> = {
      vcon: '0.3.0',
      subject: subject || `Consultation: ${patientName} - ${new Date(visitDate).toLocaleDateString()}`,
      parties,
      dialog,
      analysis: [],
      attachments: [],
    };

    const result = await createVCon(vconPayload);

    return NextResponse.json(
      {
        success: true,
        uuid: result.uuid,
        id: result.id,
        message: 'vCon created successfully',
        duration_ms: result.duration_ms,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ingest failed' },
      { status: 500 }
    );
  }
}
