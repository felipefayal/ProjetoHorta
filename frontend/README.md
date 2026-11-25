# Frontend

Aplicação React/Vite. Para rodar localmente, copie `.env.example` para
`.env.local`, configure `VITE_API_URL` (em desenvolvimento pode usar
`http://127.0.0.1:8000`) e execute `npm run dev`.

Para produção, use `frontend` como Root Directory no Vercel, configure
`VITE_API_URL` com a URL pública do Render e mantenha `VITE_USE_MOCK=false`.
Consulte o [guia de deploy na raiz](../README.md) para a migração do banco e
as variáveis necessárias à API.
