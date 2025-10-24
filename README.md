# AI Brand Guideline Assistant

A SvelteKit application that extracts brand guidelines from PDFs, enhances them with Google Gemini (LLM), scrapes websites, and runs an audit comparing site implementation vs. the brand rules.

This project includes:
- PDF → text conversion via ConvertAPI
- Robust multi-stage guideline extraction (regex + heuristics + LLM refinement)
- Web scraping (Playwright/Puppeteer multi-strategy)
- Compliance analysis (colors, typography, logo, spacing, imagery)
- Debug text saving and improved error handling

## Prerequisites
- Node.js 18+ (Node 20 recommended)
- npm or pnpm
- A free Google AI API key (Gemini)
- A free ConvertAPI key
- (Optional) PostgreSQL (for persistent storage via Drizzle ORM)

## Quick Start

1) Clone the repo and install deps
```bash
# from your workspace root
cd AI-Brand-Guideline-Assistant
npm install
```

2) Configure environment variables
Create a `.env` file at the project root with:
```bash
# Google AI (Gemini)
GOOGLE_AI_API_KEY=your_google_ai_api_key
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key

# ConvertAPI (PDF → text)
VITE_CONVERTAPI_SECRET=your_convertapi_secret

# (Optional) Database
DATABASE_URL=postgres://user:password@localhost:5432/brand_audit
```
Notes:
- Client-side usage relies on `VITE_` prefix; server-side reads from `process.env`.
- The LLM is set to `gemini-1.5-flash` for stability.

3) Run the app
```bash
npm run dev
# open http://localhost:5173
```

4) Workflow
- Go to `/dashboard/audit`
- Enter the company name, then upload the PDF
- The system converts PDF → text, extracts guidelines, and saves them
- Enter a website URL and run “Scrape & Analyze Website”
- View the audit results (scores, issues, and recommendations)

## Key Environment Variables
- `GOOGLE_AI_API_KEY` / `VITE_GOOGLE_AI_API_KEY`: Google Gemini API key
- `VITE_CONVERTAPI_SECRET`: ConvertAPI secret for client PDF → text
- `DATABASE_URL` (optional): PostgreSQL connection string

## Notable Files
- `src/lib/services/llmEnhancementService.js`: LLM post-processing with robust JSON parsing, retries, prompt truncation, brand-aware color naming, and typography fallbacks
- `src/lib/services/enhancedBrandExtractor.js`: Section segmentation, context-aware extraction, specialized extractors, LLM integration, and debug text saving
- `src/lib/services/enhancedComplianceAnalyzer.js`: Contextual color analysis, severity weighting, readable issues, and normalization to HEX
- `src/routes/dashboard/audit/+page.svelte`: Main UI flow for PDF upload → scrape → analyze
- `src/routes/api/extract-brand-guidelines/+server.js`: Server endpoint for extraction
- `src/routes/api/scrape-website/+server.js`: Server endpoint for scraping and compliance analysis

## Troubleshooting
- “Google API not configured”: Ensure `.env` exists and keys are present. We load via `dotenv` on server and `import.meta.env` on client
- “Empty response from LLM”: The service now auto-retries with a strict JSON prompt and truncates input for token safety
- ConvertAPI errors: Confirm `VITE_CONVERTAPI_SECRET` exists and is valid
- Svelte 5 runes mode: Custom UI components use `$derived` to avoid `$:` reactivity errors

## Commit and Push (Git)
If this directory is your working copy and you want to push it to your GitHub repository:
```bash
# from repo root (where package.json exists)
git init
git add .
git commit -m "feat: robust LLM extraction, PMS→HEX, typography fallback, and README"

git branch -M main
# replace the URL below with your repo URL
git remote add origin https://github.com/javeriapervaiz-debug/BrandAudit.git
git push -u origin main
```
If the remote already exists:
```bash
git remote set-url origin https://github.com/javeriapervaiz-debug/BrandAudit.git
git push -u origin main
```

## Notes
- PMS to HEX mapping includes common codes; Target Red (PMS 186 → #CC0000) is handled
- Typography fallback seeds fonts and weights (e.g., Helvetica/Arial, Regular/Bold) when missing
- Colors are normalized to HEX; 3-digit HEX expanded; RGB → HEX supported
- Debug text files are saved to `debug-text-files/` for inspection

## License
MIT
