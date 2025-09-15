# FoodSnap Tutor 🍽️  
Your personal AI chef & nutritionist — snap a photo of any meal to instantly get the recipe, estimated nutrition facts, and healthier variations powered by Google Gemini 2.5 Flash.

## Overview
FoodSnap Tutor is a lightweight web application for foodies, home cooks, and health-conscious users who want immediate culinary insight. Upload a food or drink photo and the app will:  
1. Detect whether the image contains food.  
2. Identify the dish (or best guesses).  
3. Return a full recipe, nutrition breakdown, and friendly health tips.  

Everything runs entirely in the browser; no backend needed.

## Features
- 📸 Drag-and-drop or click-to-upload image input  
- 🤖 Google GenAI Gemini 2.5 Flash model with structured JSON schema  
- 🍲 Dish name + step-by-step recipe generation  
- 🥗 Nutrition estimates (calories, protein, carbs, fat)  
- 💡 Healthier variation & moderation advice  
- ⚡ Instant UI built with Vite + React 19 + Tailwind CSS  
- 🔄 Retry / upload-new image flow with smooth animations  

## Tech Stack
- React 19  
- TypeScript  
- Vite 6 build tooling  
- Tailwind CSS (via CDN)  
- @google/genai SDK calling **Gemini 2.5 Flash**  
- No server; static hosting friendly

## Architecture
1. User selects or drags an image in the browser.  
2. `fileToPart` converts the File → base64 inlineData part.  
3. `geminiService.ts` sends `[imagePart, prompt]` to Gemini with a strict response schema.  
4. Gemini returns JSON → parsed into `FoodAnalysis` type.  
5. React components render recipe, nutrition, and tips; errors handled gracefully.

```
[Browser]
  │
  ├── image upload
  │
  ├── encode → Gemini API (https://generativelanguage.googleapis.com)
  │
  └── JSON response → React UI
```

## Prerequisites
- Node.js >= 18  
- npm (comes with Node)

## Quick Start
```bash
# 1. Clone
git clone <your-fork-url>
cd foodsnap-tutor

# 2. Install deps
npm install

# 3. Configure API key
cp .env.local.example .env.local
# edit .env.local and set GEMINI_API_KEY=YOUR_KEY

# 4. Run dev server
npm run dev
# → http://localhost:5173
```

## Configuration
`.env.local` example:
```dotenv
# Google GenAI API key (client side)
GEMINI_API_KEY=ai-xxxxxxxxxxxxxxxx
```
`vite.config.ts` injects it:
```ts
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```
At runtime the key is available as `process.env.API_KEY` inside `geminiService.ts`.

## Run Locally
Start Vite dev server and open the default port.
```bash
npm run dev
# visit http://localhost:5173
```

## Scripts
| Script | Purpose |
|--------|---------|
| `dev`      | Run Vite in development with HMR |
| `build`    | Produce optimized static files in `dist/` |
| `preview`  | Serve the built files locally to verify production build |

## Build
```bash
npm run build   # output → dist/
npm run preview # test production bundle on http://localhost:4173
```

## Deployment
The app is pure static assets (`dist/`). Deploy to:
- Vercel (`vercel deploy --prod`)
- Netlify (drag-and-drop `dist/`)
- GitHub Pages (`gh-pages` branch)
  
⚠️ **API key is exposed in client bundle.**  
For production, restrict the key to allowed origins in Google AI Studio **or** proxy requests through a secure backend that adds the key server-side.

## Directory Structure
```
foodsnap-tutor/
├─ App.tsx
├─ index.tsx
├─ index.html
├─ vite.config.ts
├─ services/
│  └─ geminiService.ts
├─ components/
│  ├─ Header.tsx
│  ├─ StartScreen.tsx
│  ├─ Spinner.tsx
│  └─ icons.tsx
├─ public/          # (none now, but Vite serves static assets here)
├─ package.json
└─ README.md
```

## Troubleshooting
| Issue | Fix |
|-------|-----|
| `GEMINI_API_KEY` empty/invalid | Ensure `.env.local` is present and key is correct; restart dev server. |
| Request blocked (safety settings) | Gemini may reject certain images; try a clearer food photo. |
| `Failed to parse JSON response` | Model returned malformed JSON; retry upload. |
| CORS / origin error in production | Add your domain to allowed origins for the API key or route via proxy. |

## License
Apache-2.0 (see SPDX headers). Feel free to fork & improve!
