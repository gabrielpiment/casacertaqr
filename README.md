# CasaCerta QR — QR Codes dinâmicos para WhatsApp

Nuxt 4 + Tailwind CSS v4.

## Como funciona

```
QR Code impresso  →  https://seudominio.com/r/abc123  →  (busca o número atual)  →  https://wa.me/55119...
```

O QR Code **nunca** contém o número do WhatsApp, só o link fixo `/r/<código>`.
Se o número cair, abra o painel, clique em **Trocar número** e pronto: o mesmo QR
impresso passa a abrir o número novo na hora (o redirecionamento é `302` + `no-store`,
então nada fica em cache).

## Rodando

```bash
npm install
cp .env.example .env   # ajuste a senha
npm run dev            # http://localhost:3000  (senha padrão: admin)
```

## Variáveis

| Variável | Descrição |
|---|---|
| `NUXT_ADMIN_PASSWORD` | Senha do painel |
| `NUXT_PUBLIC_SITE_URL` | Domínio fixo usado dentro do QR (ex: `https://qr.casacerta.com.br`). **Defina em produção** e nunca troque depois. |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_KEY` | Chave pública `anon` do Supabase |
| `CRM_API_URL` | URL da API do CRM (padrão: `https://back4.legendaryhub.com.br`) |
| `CRM_CLIENT_ID` | Client ID gerado no CRM |
| `CRM_CLIENT_SECRET` | Client Secret gerado no CRM |

## Integração com CRM (Legendary Hub)

Sempre que um lead chama no WhatsApp através do QR Code, o CRM adiciona automaticamente a etiqueta **LEAD QRCODE** no ticket.

1. **Configurar Webhook no CRM**:
   - No painel do Legendary Hub (Configurações > Webhook), adicione a URL:
     `https://seu-dominio/api/webhook/crm`
   - Evento: Criação de novo ticket / mensagem recebida.
2. **Como o sistema processa**:
   - O endpoint `POST /api/webhook/crm` recebe o evento.
   - Autentica via OAuth2 com `CRM_CLIENT_ID` e `CRM_CLIENT_SECRET`.
   - Localiza a tag chamada `LEAD QRCODE` em `GET /api/tagList`.
   - Adiciona a tag ao ticket via `POST /api/tickets/<id>/tags`.

## Banco de Dados (Supabase)

Para persistir os dados no Supabase, execute o script [supabase/schema.sql](supabase/schema.sql) no **SQL Editor** do seu painel do Supabase:

1. Acesse: https://supabase.com/dashboard/project/pxdsrlrxfsomfztrfucz/sql
2. Cole o conteúdo de [supabase/schema.sql](supabase/schema.sql)
3. Clique em **Run** (Executar)

Assim que executado, a tabela `links` passa a ser usada automaticamente como banco de dados principal. Caso a tabela ainda não tenha sido criada, o sistema usa armazenamento local temporário como fallback para evitar quebras.

```bash
npm run build
node .output/server/index.mjs
```

Os dados ficam em `.data/db/` (arquivos JSON). Faça backup dessa pasta e use um
servidor com disco persistente (VPS, Railway, Render com volume, etc.).
Hospedagens serverless (Vercel/Netlify) **não** mantêm esses arquivos — nesse caso
troque o driver em `nuxt.config.ts > nitro.storage.db` por Redis, Upstash, Cloudflare KV etc.

## Estrutura

- `server/routes/r/[slug].ts` — redirecionamento público (o que o QR abre)
- `server/api/links/*` — CRUD protegido por senha
- `app/pages/index.vue` — painel
- `app/components/LinkCard.vue` — card com QR (download PNG/SVG)
- `app/components/LinkForm.vue` — criar/editar

> Nuxt fixado em `4.5.2`: a `4.6.0` tem um bug de SSR no Windows
> ("Either manifest or precomputed data must be provided").
