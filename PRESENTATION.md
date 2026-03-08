# MediVCon: AI-Powered Patient Conversation Intelligence

---

## The Problem

**Most EHR systems store notes *about* conversations—not the conversation itself.**

- Clinical notes are summaries, not the source of truth
- No structured way to search across a patient's *entire* conversation history
- Consent and privacy are bolted on, not built in
- "Has this patient mentioned chest pain in any past visit?" — hard to answer

---

## The Insight

**Store the conversation itself as a structured artifact, then derive clinical intelligence from it.**

- vCon (IETF standard) = conversation as first-class data
- Built-in participant identity, consent attachments, audit trails
- AI analysis stored *inside* the record—not in a separate system

---

## What is MediVCon?

**A platform that captures doctor-patient conversations, stores them as vCon records, and uses Claude to generate structured clinical outputs—with full HIPAA-compliant audit trails.**

- Post-consultation pipeline: transcript → vCon → SOAP notes
- Longitudinal patient intelligence: semantic search across years of visits
- Consent & redaction layer: privacy markers per conversation, auto-redact before sharing

---

## How It Works

**1. Ingest** — Doctor uploads or pastes consultation transcript

**2. Store** — Saved as vCon with parties (doctor, patient), dialog, and metadata

**3. Analyze** — Claude generates SOAP notes, patient summary, medication reminders, red-flag alerts

**4. Search** — Longitudinal search: "Has this patient mentioned chest pain in any past visit?"

---

## Key Features

- **Post-Consultation Pipeline** — Transcript → vCon → SOAP notes, follow-up plan, patient summary
- **Longitudinal Patient Intelligence** — Search across a patient's entire conversation history
- **Consent & Redaction** — vCon consent attachments, SCITT receipts, audit trails, PII redaction before sharing

---

## Consent & Privacy Flow

**vCon's built-in consent attachments (IETF draft-howe-vcon-consent):**

- Consent recorded per conversation
- Purpose-based permissions (clinical care, specialist sharing, etc.)
- Withdrawal supported—revocation registered in transparency service
- Audit trail: ConsentRecorded → vConCreated → SCITTRegistered → AccessLog

---

## Redaction Before Sharing

**Auto-redact PII before sharing with specialists or insurers:**

- Patient contact info, family identifiers, sensitive anatomical references
- Redaction preview shows exactly what gets shared
- Consent scope determines what can be shared with whom

---

## Why vCon?

**vCon maps naturally to healthcare:**

| vCon Feature | Healthcare Use |
|--------------|----------------|
| Participant identity | Doctor, patient roles |
| Tags | Diagnosis codes, visit types, urgency |
| Attachments | Lab results, prescriptions linked to conversation |
| Analysis field | Claude's clinical summaries stored in the record |
| Consent attachments | Privacy markers per conversation |

---

## Architecture

- **Next.js** — Frontend and API routes
- **vCon MCP Server** — REST API for vCon CRUD (vcon-mcp)
- **Claude** — Clinical analysis (SOAP notes, summaries)
- **IETF standard** — vCon format, consent draft, SCITT principles

---

## Demo Flow

1. **Ingest** — Paste a teleconsultation transcript
2. **Store** — Saved as vCon with parties and dialog
3. **Analyze** — Claude generates SOAP notes and follow-up plan
4. **Consent** — View consent records, audit trail, redaction preview
5. **Search** — Find consultations by keyword across patient history

---

## The Novel Idea

**vCon as the longitudinal medical record layer.**

- Not just "AI summarizes calls"
- The conversation itself is the primary artifact
- Clinical intelligence derived from it—not stored separately
- Consent and audit built into the data model

---

## Thank You

**MediVCon — AI-Powered Patient Conversation Intelligence**

*Store the conversation. Derive the intelligence. Respect the consent.*
