# Testes do backend

## Testes unitários (sem banco)

Cobrem a regra de sobreposição de intervalos usada pelo endpoint de reservas (`ReservaConflito`).

```bash
dotnet test src/backend.tests/backend.tests.csproj
```

## Testes de integração com PostgreSQL (opcional)

A API usa **Npgsql** com SQL direto (não Entity Framework). Para testes de integração HTTP + Postgres:

1. Com NuGet acessível, adicione ao `backend.tests.csproj`:
   - `Microsoft.AspNetCore.Mvc.Testing`
   - `Testcontainers.PostgreSql` (exige Docker em execução)
2. Suba um Postgres efêmero com Testcontainers, aplique o schema em [`docs/sql/reservas-supabase.sql`](../../docs/sql/reservas-supabase.sql) (e tabelas `common_areas` / `users` conforme o projeto).
3. Use `WebApplicationFactory<Program>` e sobrescreva `ConnectionStrings:DefaultConnection` para a connection string do container.
4. Chame `GET/POST/PUT/DELETE` em `/api/reservas` e valide respostas e status `409 Conflict` quando houver sobreposição de horário na mesma área.

Alternativa sem Docker: aponte `ConnectionStrings:DefaultConnection` para um banco de dados de teste (por variável de ambiente ou `appsettings.Testing.json` excluído do Git) e execute os mesmos cenários.
