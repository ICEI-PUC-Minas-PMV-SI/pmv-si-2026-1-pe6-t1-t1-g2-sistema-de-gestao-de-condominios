# Código-fonte (`src/`)

## Backend (ASP.NET Core)

Local: [`backend/`](backend/).

- **Acesso ao banco:** [Npgsql](https://www.npgsql.org/) com SQL direto (sem Entity Framework Core).
- **Configuração:** `ConnectionStrings:DefaultConnection` em `appsettings.json` / `appsettings.Development.json` ou variáveis de ambiente. Para desenvolvimento local, prefira [User Secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets) para não commitar senhas.
- **API REST:** controllers em `Controllers/` (ex.: `ReservasController` em `/api/reservas`).
- **Documentação HTTP:** Swagger UI em ambiente Development — ao subir o projeto, acesse `/swagger`.

### Executar o backend

```bash
cd src/backend
dotnet run
```

### Testes

```bash
dotnet test src/backend.tests/backend.tests.csproj
```

Detalhes sobre testes de integração com PostgreSQL: [`backend.tests/README.md`](backend.tests/README.md).

### Documentação da API

Ver [`docs/backend-apis.md`](../docs/backend-apis.md).

## Frontends

Os diretórios de frontend web e mobile serão adicionados conforme o andamento do projeto; instruções de build serão documentadas aqui.
