# Código-fonte (`src/`)

Este diretório contém o código-fonte da aplicação "Sistema de Gestão de Condomínios" — uma solução para gerenciar residentes, encomendas, ocorrências e notificações em condomínios.

Visão rápida:
- Backend: ASP.NET Core (C#) com acesso direto a PostgreSQL via Npgsql.
- Frontend web: aplicativo React + Vite (em `frontend-web/`).
- Testes: projetos de teste em `backend.tests/`.

## Estrutura principal

- `backend/` — API REST em ASP.NET Core.
- `backend.tests/` — testes unitários e de integração do backend.
- `frontend-web/` — frontend web (React, Vite, Tailwind).

## Como rodar em desenvolvimento

Pré-requisitos:
- .NET SDK (versão 8+ / compatível com o projeto)
- Node.js (18+ recomendado)
- PostgreSQL (local ou via Supabase)

1) Rodar o backend

```bash
cd src/backend
dotnet run
```

O backend expõe a API e, em ambiente de Development, o Swagger UI em `/swagger`.

2) Rodar o frontend (web)

```bash
cd src/frontend-web
npm install
npm run dev
```

Abra o navegador no endereço mostrado pelo Vite (ex.: `http://localhost:5173`).

## Variáveis de ambiente importantes

- `JWT_SECRET` — chave usada para assinar tokens JWT (obrigatória para iniciar o backend).
- `DATABASE_URL` / `SUPABASE_DB_URL` — connection string do PostgreSQL (alternativa a `ConnectionStrings:DefaultConnection`).
- `RESEND_API_KEY` — chave para serviço de envio de e-mails (opcional em dev).

Recomendações: use User Secrets (`dotnet user-secrets`) ou variáveis de ambiente locais para não commitar credenciais.

## Banco de dados

O projeto utiliza PostgreSQL com alguns tipos enum no banco (ex.: `reservation_status`, `delivery_status`). As constantes do frontend devem corresponder exatamente (case-sensitive) aos valores do enum no banco.

Para criar as tabelas e enums locais, use o arquivo `sql/reservas-supabase.sql` como referência ou a configuração do Supabase usada no projeto.

## Testes

- Rodar testes unitários do backend:

```bash
cd src
dotnet test src/backend.tests/backend.tests.csproj
```

Para testes de integração que exigem PostgreSQL, a suíte usa Testcontainers (ou aponte `ConnectionStrings:DefaultConnection` para um banco de testes).

## Convenções e notas úteis

- Nomes de código e documentação estão em Português (BR).
- Controllers e models do backend seguem a nomenclatura em Português.
- O frontend usa Tailwind + tokens de design (ex.: `text-headline-md`).
- Alguns controllers usam tanto EF Core quanto SQL direto com Npgsql — ver `Data/ApplicationDbContext.cs` e `Controllers/*`.

## Desenvolvimento e PRs

- Crie branches por feature: `feat/<descrição>` ou `fix/<descrição>`.
- Commits claros e pequenos ajudam a geração de relatórios de contribuição automática.
- Ao gerar PR, descreva screenshots e passos para reproduzir se alterar a UI.

## Problemas comuns

- Erro PostgreSQL 22P02: normalmente é causado por mismatch entre enums enviados pelo frontend e os enums do banco — ver `DELIVERY_STATUS_OPTIONS` no frontend.
- Overflow/Quebra de layout em mobile: ver `RESPONSIVIDADE_GUIA.md` na raiz do repositório com correções sugeridas.

## Contato

Para dúvidas ou acesso a credenciais de desenvolvimento, contate o mantenedor do projeto ou a equipe responsável.

---
Feito por equipe — documentação mínima para começar a desenvolver e testar localmente.
