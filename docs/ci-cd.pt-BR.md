# Guia de CI/CD (GitHub Actions)

Este documento explica o pipeline de CI, como bloquear merge de PR e noções de custo.

## O que está configurado

Arquivo de workflow:

- `.github/workflows/ci.yml`

Gatilhos:

- `pull_request` para `main` e `develop`
- `push` para `main` e `develop`

Checks executados:

1. `npm run lint`
2. `npm run type-check`
3. `npm run test:integration`
4. `npm run build`

## Objetivo

Permitir merge de PR apenas quando todos os checks obrigatórios passarem.

## Como bloquear merge

No repositório GitHub:

1. Abra `Settings` > `Branches`
2. Em `Branch protection rules`, clique em `Add rule`
3. Em `Branch name pattern`, use `main`
4. Ative `Require a pull request before merging`
5. Ative `Require status checks to pass before merging`
6. Selecione como check obrigatório:
   - `Lint, Typecheck, Tests and Build`
7. Salve

8. Repita a mesma regra para `develop` (ou crie uma regra por branch da sua estratégia)

Depois disso, PR para `main` e `develop` só faz merge com CI verde.

## Paridade local de comandos

Rode localmente antes de subir:

```bash
npm run lint
npm run type-check
npm run test:integration
npm run build
```

## Notas de custo

- Repositórios públicos: runners padrão do GitHub Actions são gratuitos.
- Repositórios privados: existe cota mensal por plano; excedente é cobrado.
- Estudantes verificados no GitHub Education têm benefícios do GitHub Pro, incluindo cota maior de Actions que o plano Free.

Sempre confirme valores e limites na documentação oficial:

- Billing do GitHub Actions: `docs.github.com` (Billing > GitHub Actions)
- Benefícios para estudantes: `github.com/education/students`
