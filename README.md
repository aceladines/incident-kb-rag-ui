# incident-kb-rag-ui

An internal support team portal for logging incidents and querying past incidents via natural language using Retrieval-Augmented Generation (RAG). Built with Next.js, Tailwind CSS, and shadcn/ui.

## Overview

This application serves as the frontend for an Incident Knowledge Base system. Support agents can:

- **Log incidents** with structured metadata (title, description, impacted services, fix details, responsible team)
- **Manage a knowledge base** of runbooks, SOPs, troubleshooting guides, FAQs, and configuration references
- **Search past incidents and KB articles** using natural language queries powered by RAG
- **Track resolution progress** with status and severity workflows
- **Get AI-suggested fixes** based on semantically similar past incidents and relevant KB documentation

Administrators can additionally:

- **Configure rules** that govern RAG behavior (relevance thresholds, source preferences, staleness policies) and agent guardrails (what the AI agent can and cannot do autonomously)

The frontend communicates with a FastAPI backend that already leverages the Microsoft AI Agent framework to automate IT incident workflows (RCA, fix application, validation, ITSM integration, notifications). The RAG, KB, and rules capabilities are being added on top of that existing automation pipeline.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Theme | Dark/Light via next-themes |
| Forms | react-hook-form + zod |
| Backend | FastAPI (separate repository) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/<your-org>/incident-kb-rag-ui.git
cd incident-kb-rag-ui
npm install
```

### Environment Setup

Copy the example env file and configure:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8000    # FastAPI backend URL
NEXT_PUBLIC_USE_MOCK=true                    # Set to false when backend is available
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Dashboard
│   ├── ask/                # RAG query interface
│   ├── incidents/          # Incident CRUD pages
│   ├── kb/                 # Knowledge Base article CRUD pages
│   └── settings/           # Service catalog, team, & category management
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/             # Sidebar, Navbar, ThemeToggle
│   ├── incidents/          # Incident-specific components
│   ├── kb/                 # KB article components
│   ├── ask/                # RAG query components
│   └── dashboard/          # Dashboard widgets
├── lib/
│   ├── api/                # API service layer
│   ├── types/              # Shared TypeScript interfaces
│   ├── mock/               # Mock data (dev mode)
│   └── utils.ts            # Utilities
└── hooks/                  # Custom React hooks
```

## Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |
| `npm run format:check` | Check formatting without fixing |
| `npm run type-check` | Run TypeScript compiler check |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, branch naming conventions, and pull request guidelines.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
