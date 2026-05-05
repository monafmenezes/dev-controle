# Dev Controle

Versão em inglês: [README.md](README.md)

Dev Controle é uma aplicação web focada em gestão de clientes e chamados.

O objetivo principal é permitir que cada usuário:

- cadastre e gerencie seus próprios clientes
- crie chamados vinculados a esses clientes
- acompanhe chamados por status e histórico dentro do seu próprio espaço

Este repositório é a versão inicial do projeto e vai evoluir com autenticação, regras de propriedade dos dados e fluxo completo de chamados.

## Escopo do Produto (Inicial)

- Cadastro de clientes
- Criação de chamados vinculados a um cliente
- Visibilidade de dados por usuário (cada usuário vê apenas seus próprios dados)
- Dashboard para visão operacional rápida

## Documentação de Testes

- English: [docs/testing.en.md](docs/testing.en.md)
- Português (Brasil): [docs/testing.pt-BR.md](docs/testing.pt-BR.md)

## Stack Tecnológica

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Vitest + Testing Library (testes de integração)
- Playwright (E2E)

## Como Começar

Instale as dependências:

```bash
npm install
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Scripts Úteis

- `npm run dev`: inicia o servidor de desenvolvimento
- `npm run build`: gera o build de produção
- `npm run start`: executa o build de produção
- `npm run lint`: executa o ESLint
- `npm run type-check`: executa checagem de tipos com TypeScript
- `npm run test:integration`: executa testes de integração
- `npm run test:e2e`: executa testes E2E do Playwright localmente
- `npm run test:e2e:docker`: executa testes E2E dentro do Docker

## Próximos Marcos

1. Autenticação e autorização por usuário
2. CRUD de clientes
3. CRUD de chamados com fluxo de status
4. Atribuição e filtros por usuário
5. Trilha de auditoria e timeline por chamado

## Observações

- A estrutura do projeto e as convenções podem evoluir conforme as funcionalidades centrais forem implementadas.
- Para padrões de testes, use os guias em `docs/testing.en.md` e `docs/testing.pt-BR.md`.
