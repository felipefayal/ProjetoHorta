<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5affa6b5-10a0-4017-a410-43807ca101fa

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## API and mock data

The frontend uses schema-compatible mock responses by default, including a simulated
network delay. Copy `.env.example` to `.env.local` to configure the application.
To connect to the FastAPI backend, set `VITE_USE_MOCK=false` and set `VITE_API_URL`
to the backend base URL (for example, `https://your-service.onrender.com`).
Set `CORS_ORIGINS` on the backend to the frontend origin(s), separated by commas.

The demo login accepts any username and the password `123456`.
