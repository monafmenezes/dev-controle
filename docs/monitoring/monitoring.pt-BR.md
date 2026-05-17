# Guia de Monitoramento e Observabilidade

Este documento explica o que já foi implementado em monitoramento, como funciona e como rodar localmente e com Docker.

## O que está implementado

O projeto usa atualmente:

1. Sentry para rastreamento de erros e stack traces
2. Coleta de Core Web Vitals para `LCP`, `INP` e `CLS`
3. Persistência no MongoDB para payloads válidos de web-vitals

Observação: `FID` foi amplamente substituído por `INP` no monitoramento moderno de web-vitals.

## Arquitetura

### Rastreamento de erros

- `instrumentation.ts`: inicializa o setup de Sentry por runtime e encaminha `onRequestError` para o Sentry.
- `sentry.server.config.ts`: init do Sentry para runtime Node.js.
- `sentry.edge.config.ts`: init do Sentry para runtime Edge.
- `instrumentation-client.ts`: init do Sentry no browser e breadcrumbs de navegação.

### Fluxo de web-vitals

1. O componente `src/components/observability/web-vitals.tsx` captura web-vitals no browser.
2. Ele envia métricas para `POST /api/monitoring/web-vitals`.
3. `src/app/api/monitoring/web-vitals/route.ts` valida o payload.
4. Métricas válidas são salvas via Prisma na collection `MonitoringWebVital`.
5. Métricas não-`good` também são encaminhadas para o Sentry.

### Campos persistidos

A model `MonitoringWebVital` salva:

- `metricId`
- `name`
- `value`
- `delta`
- `rating`
- `navigationType`
- `path`
- `userAgent`
- `occurredAt`
- `createdAt`
- `userId` quando houver sessão autenticada

## Variáveis de ambiente obrigatórias

Use `.env.example` como base.

```bash
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

### Uso das variáveis

- `SENTRY_DSN`: reporte server/edge
- `NEXT_PUBLIC_SENTRY_DSN`: reporte no browser
- `SENTRY_*_SAMPLE_RATE`: amostragem de tracing/profiling
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`: upload de sourcemaps no build

## Acesso ao painel admin

O acesso a `/dashboard/admin` depende do campo `role` do usuário no banco:

- `USER`: acesso padrão
- `ADMIN`: acesso ao painel admin

Para promover um usuário existente, atualize o campo `role` para `ADMIN` na collection `User`.

## Setup local (sem Docker)

1. Instalar dependências:

```bash
npm install
```

2. Criar arquivo de ambiente:

```bash
cp .env.example .env.local
```

3. Preencher valores do Sentry em `.env.local`.

4. Iniciar aplicação:

```bash
npm run dev
```

5. Abrir `http://localhost:3000`.

## Setup com Docker

O repositório inclui:

- `Dockerfile` (imagem de produção da aplicação)
- `docker-compose.yml` (app e perfil opcional e2e)
- `Dockerfile.e2e` (container Playwright)

### Preparar ambiente

```bash
cp .env.example .env
```

Preencha os valores de Sentry em `.env`.

### Subir aplicação

```bash
npm run docker:up
```

Abra `http://localhost:3000`.

### Ler logs

```bash
npm run docker:logs
```

### Parar containers

```bash
npm run docker:down
```

### Rodar E2E no Docker

```bash
npm run docker:e2e
```

## Como validar se o monitoramento está funcionando

### Validar init do Sentry

1. Rode a app com DSN válido.
2. Gere um erro de servidor intencionalmente (rota temporária de teste) e confirme evento no Sentry.

### Validar fluxo de web-vitals

1. Abra a aplicação no navegador.
2. Verifique no Network o `POST /api/monitoring/web-vitals`.
3. Confirme que payloads válidos são persistidos no MongoDB.
4. Confirme no Sentry mensagens com `rating` `needs-improvement`/`poor`.

## Troubleshooting

- Sem eventos no Sentry:
  - Verifique valores de DSN.
  - Confirme que as variáveis estão carregadas no runtime correto.
- Sem eventos do browser:
  - Garanta `NEXT_PUBLIC_SENTRY_DSN` no build/runtime.
- Docker sobe, mas sem telemetria:
  - Verifique se `.env` existe e tem valores de Sentry.
  - Rebuild após mudanças de env:
    - `npm run docker:down`
    - `npm run docker:up`

## Limitação atual

- O endpoint de web-vitals é público e recebe payload do client sem autenticação.
- Para endurecer produção, adicione filtro/rate-limit antes de persistir ou encaminhar eventos ao Sentry.
