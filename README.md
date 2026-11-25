# Projeto Horta Escolar

Aplicação React/Vite para a interface, FastAPI para a API e PostgreSQL para
persistência. A configuração de produção usa Vercel para o frontend e Render
para a API.

## Banco de dados

O banco deve conter as tabelas do esquema compartilhado: `colegio`,
`dispositivo`, `canteiro`, `tipo_planta`, `medicao`, `alerta`,
`historico_irrigacao`, `aplicacao_fertilizante`, `fertilizante` e `usuario`.
Antes do primeiro deploy, execute uma vez
[`backend/migrations/001_production_setup.sql`](./backend/migrations/001_production_setup.sql)
no editor SQL do PostgreSQL/Supabase. O script:

- exige que `dispositivo.id_dispositivo = 1` já exista (não cria nem altera o
  sensor);
- cadastra a E.E.E.F.M. Prof. Nagib Coelho Matni e o Colégio Santo Antônio,
  ambos em Belém-PA, com o telefone informado;
- cria `colegio_dispositivo`, tabela de associação necessária para ligar o
  mesmo dispositivo ID 1 às duas escolas sem duplicar o identificador;
- cria o índice único de e-mail para cadastro seguro de contas.

O script é idempotente para escolas e associações. Se falhar porque não existe
o dispositivo 1, cadastre primeiro esse dispositivo na tabela `dispositivo` e
execute a migração novamente. Não apague nem recrie IDs existentes.

## Executar localmente

1. Na pasta `backend`, copie `.env.example` para `.env` e preencha
   `DATABASE_URL`, `SESSION_SECRET` e `SENSOR_INGEST_TOKEN`. Gere segredos
   diferentes com `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
   Não versione arquivos `.env` nem coloque esses segredos no frontend.
2. Na pasta `backend`, instale as dependências e inicie a API:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn main:app --env-file .env --reload --host 127.0.0.1 --port 8000
   ```

3. Na pasta `frontend`, instale dependências, copie `.env.example` para
   `.env.local` e execute `npm run dev`. O Vite encaminha `/api` à API local
   quando `VITE_API_URL` não é sobrescrita.

## Publicar

### Render (API)

O arquivo [`render.yaml`](./render.yaml) define o serviço. Crie o serviço web
usando esse blueprint e preencha as variáveis secretas solicitadas:

- `DATABASE_URL`: URL PostgreSQL com SSL; use a string de conexão do provedor
  do banco e mantenha a senha somente no painel do Render.
- `SESSION_SECRET`: segredo aleatório forte, diferente do token dos sensores.
- `SENSOR_INGEST_TOKEN`: token compartilhado com o firmware dos sensores;
  leituras usam o cabeçalho `X-Sensor-Token`.
- `INITIAL_ADMIN_EMAIL`: e-mail que receberá perfil administrador ao criar a
  primeira conta com esse endereço.
- `CORS_ORIGINS`: origem exata do site Vercel, por exemplo
  `https://seu-projeto.vercel.app` (sem barra final).

O health check em `/health` verifica também a conexão PostgreSQL; resposta
`503` indica configuração/conectividade pendente, não um deploy validado.
Configure o `SENSOR_INGEST_TOKEN` também no firmware. A API recebe leituras
em `POST /sensores/leituras`, com `X-Sensor-Token` e JSON no formato
`{"sensor_id":"1","umidade_solo":45,"umidade_ar":60,"temperatura":25,"luminosidade":1}`.

### Vercel (frontend)

Importe o repositório, defina `frontend` como Root Directory e configure:

- `VITE_API_URL=https://URL-PUBLICA-DA-API-RENDER`
- `VITE_USE_MOCK=false`

Essas variáveis são incorporadas durante o build. Após o deploy, inclua o
domínio Vercel em `CORS_ORIGINS` no Render e faça novo deploy da API.

Depois de executar a migração e configurar as variáveis, crie a conta indicada
por `INITIAL_ADMIN_EMAIL` pela tela de cadastro e valide `/health`, login,
escolas, dispositivo e a chegada de uma leitura real do firmware. O código
não afirma que houve deploy nem que sensores físicos foram testados.
