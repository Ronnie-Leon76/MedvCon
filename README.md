# MediVCon

**AI-Powered Patient Conversation Intelligence Platform**

MediVCon captures doctor-patient conversations (or teleconsultation transcripts), stores them as [vCon](https://mcp.conserver.io) records via the vCon MCP Server REST API, and uses Claude to automatically generate structured clinical outputs — SOAP notes, medication reminders, follow-up tasks, and red-flag alerts.

## Features

- **Post-Consultation Pipeline**: Ingest transcripts → store as vCon → auto-generate SOAP notes, patient summary, follow-up plan
- **Longitudinal Patient Intelligence**: Search across a patient's entire conversation history
- **Clinical Analysis**: Claude-powered SOAP notes, medication reminders, red-flag alerts

## Prerequisites

1. **vCon MCP Server** running in HTTP mode with REST API enabled:
   ```bash
   cd ..  # vcon-mcp root
   MCP_TRANSPORT=http MCP_HTTP_PORT=3000 API_KEYS=your-key npm run dev
   ```

2. **Anthropic API Key** for Claude clinical analysis

## Setup

```bash
cd medivcon
cp .env.local.example .env.local
# Edit .env.local with your API keys
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_VCON_API_URL` | vCon MCP REST API base URL (default: `http://localhost:3000/api/v1`) |
| `VCON_API_KEY` | API key for vCon MCP server (set `API_KEYS` on server) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude clinical analysis |

## API Reference

MediVCon uses the [vCon MCP Server REST API](https://mcp.conserver.io/api-reference/rest-api):

- `POST /api/v1/vcons` — Create vCon
- `GET /api/v1/vcons` — List vCons
- `GET /api/v1/vcons/:uuid` — Get vCon
- `GET /api/v1/health` — Health check

## Demo Flow

1. **Ingest**: Paste a sample teleconsultation transcript on the New Consultation page
2. **Store**: Transcript is saved as a vCon with doctor/patient parties and dialog
3. **Analyze**: Claude generates SOAP notes, patient summary, follow-up plan
4. **Search**: Use the Search page to find consultations by keyword (e.g., "chest pain")
