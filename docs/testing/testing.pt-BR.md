# Guia de Testes

Este projeto usa duas camadas de testes:

1. Testes de integração com `Vitest` + `Testing Library`
2. Testes end-to-end (E2E) com `Playwright`

## Stack de testes

- Integração:
  - `vitest`
  - `@testing-library/react`
  - `@testing-library/jest-dom`
  - Configuração: `vitest.config.mts` + `vitest.setup.ts`
- E2E:
  - `@playwright/test`
  - Configuração: `playwright.config.ts`
  - Suporte Docker: `Dockerfile.e2e`

## Comandos disponíveis

- `npm run test`: executa Vitest em modo watch
- `npm run test:integration`: executa testes de integração uma vez
- `npm run test:e2e`: executa Playwright E2E localmente
- `npm run test:e2e:ui`: executa Playwright em modo UI
- `npm run test:e2e:docker`: builda e executa E2E no Docker

## Testes de integração (Vitest)

### Onde criar testes

- Crie os testes perto do componente ou módulo testado.
- Convenção atual: `src/**/*.test.tsx` e `src/**/*.test.ts`

Exemplos:

- `src/components/header/header.test.tsx`
- `src/components/container/container.test.tsx`

### Padrão de teste

- Use `describe` e `test`.
- Prefira asserções orientadas ao usuário com Testing Library (`getByRole`, `getByText`, etc.).
- Evite seletores acoplados à implementação sempre que possível.

Exemplo:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

describe('NomeDoComponente', () => {
  test('renderiza conteúdo visível', () => {
    render(<div>Ola</div>);
    expect(screen.getByText('Ola')).toBeInTheDocument();
  });
});
```

### Como rodar

```bash
npm run test:integration
```

## Testes E2E (Playwright)

### Onde criar testes

- Use `tests/e2e/*.spec.ts`
- Exemplo atual: `tests/e2e/navigation.spec.ts`

### Padrão de teste

- Valide fluxos do usuário (navegação, envio de formulário, permissões, caminhos críticos).
- Use locators semânticos (`getByRole`) primeiro.
- Mantenha os testes determinísticos e independentes.

Exemplo:

```ts
import { expect, test } from '@playwright/test';

test('navega da home para o dashboard', async ({ page }) => {
  await page.goto('/');
  await page.locator('a[href="/dashboard"]').click();
  await expect(page).toHaveURL('/dashboard');
});
```

### Como rodar localmente

```bash
npm run test:e2e
```

Se os browsers locais não estiverem instalados:

```bash
npx playwright install chromium
```

## Rodando E2E com Docker

Use Docker quando quiser um ambiente estável de browser/runtime sem instalar browsers do Playwright na máquina host.

### Pré-requisitos

- Docker instalado e em execução

### Como rodar

```bash
npm run test:e2e:docker
```

O que esse comando faz:

1. Builda a imagem `dev-controle-e2e` usando `Dockerfile.e2e`
2. Executa os testes dentro do container com `--ipc=host`

### Observações

- A primeira execução é mais lenta porque a imagem base do Playwright é grande.
- As próximas execuções são mais rápidas por causa do cache de camadas do Docker.
- Artefatos de teste são ignorados pelo git:
  - `playwright-report/`
  - `test-results/`

## Ordem sugerida para CI

Rode as verificações nesta ordem:

1. `npm run lint`
2. `npm run type-check`
3. `npm run test:integration`
4. `npm run build`
5. `npm run test:e2e:docker` (ou `npm run test:e2e` se o CI já tiver browsers instalados)
