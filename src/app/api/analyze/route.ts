import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export interface AnalyzeRequest {
  transcript: string;
  patientName?: string;
  doctorName?: string;
  language?: string;
}

export interface ClinicalAnalysis {
  soapNotes: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  patientSummary: string;
  medicationReminders: string[];
  followUpTasks: string[];
  redFlags: string[];
  followUpPlan: string;
}

const SYSTEM_PROMPT = `You are a clinical documentation assistant. Given a doctor-patient consultation transcript, generate structured clinical outputs. Be concise and medically accurate. Output valid JSON only.`;

const USER_PROMPT_TEMPLATE = (transcript: string, patientName?: string, doctorName?: string, language?: string) => `
Analyze this consultation transcript and produce structured clinical documentation.

${patientName ? `Patient: ${patientName}` : ''}
${doctorName ? `Doctor: ${doctorName}` : ''}
${language ? `Patient's preferred language for summary: ${language}` : ''}

TRANSCRIPT:
---
${transcript}
---

Respond with a single JSON object (no markdown, no code blocks) with this exact structure:
{
  "soapNotes": {
    "subjective": "Patient's chief complaint and history in 2-3 sentences",
    "objective": "Observable findings, vitals if mentioned, exam findings",
    "assessment": "Clinical impression/diagnosis",
    "plan": "Treatment plan, medications, referrals"
  },
  "patientSummary": "2-3 sentence plain-language summary for the patient",
  "medicationReminders": ["reminder 1", "reminder 2"],
  "followUpTasks": ["task 1", "task 2"],
  "redFlags": ["any concerning symptoms or findings to monitor"],
  "followUpPlan": "When to return, what to watch for"
}
`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 503 }
      );
    }

    const body = (await request.json()) as AnalyzeRequest;
    const { transcript, patientName, doctorName, language } = body;

    if (!transcript?.trim()) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: USER_PROMPT_TEMPLATE(transcript, patientName, doctorName, language),
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text in response');
    }

    let analysis: ClinicalAnalysis;
    try {
      const raw = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, '');
      analysis = JSON.parse(raw) as ClinicalAnalysis;
    } catch {
      throw new Error('Invalid JSON in AI response');
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
