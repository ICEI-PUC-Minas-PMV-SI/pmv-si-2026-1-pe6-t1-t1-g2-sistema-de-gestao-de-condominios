# APIs e Web Services

Documentação da camada de API do **Sistema de Gestão de Condomínios**: backend em ASP.NET Core, persistência com **PostgreSQL** via **Npgsql** (SQL direto; **não** se utiliza Entity Framework Core neste repositório).

## Objetivos da API

Expor recursos REST para web e mobile: usuários, áreas comuns, reservas, ocorrências, entregas, notificações e demais módulos definidos no contexto do projeto. A API é consumida por aplicações internas do condomínio (moradores e administradores).

## Modelagem da Aplicação

- Entidades principais alinhadas às tabelas no PostgreSQL (ex.: `common_areas`, `reservas`, `users`).
- Modelo de reserva: `ReservaAreaComum` com chaves `area_comum_id`, `morador_id`, intervalo `data_hora_inicio` / `data_hora_fim`, `status` e `observacao` opcional.
- Scripts de referência para índices e FKs: [`docs/sql/reservas-supabase.sql`](sql/reservas-supabase.sql).

## Tecnologias Utilizadas

| Componente | Tecnologia |
|------------|------------|
| Runtime | .NET (ASP.NET Core) |
| Banco de dados | PostgreSQL (ex.: Supabase) |
| Acesso a dados | **Npgsql** (ADO.NET), comandos SQL parametrizados |
| Documentação interativa | **Swagger** / OpenAPI (habilitado em ambiente Development) |

## API Endpoints

### Reservas de áreas comuns — `/api/reservas`

Base URL relativa: `api/reservas` (definida em [`ReservasController`](../src/backend/Controllers/ReservasController.cs)).

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/reservas` | Lista todas as reservas. |
| GET | `/api/reservas/{id}` | Obtém uma reserva por ID. |
| POST | `/api/reservas` | Cria reserva. Corpo JSON com `area_comum_id`, `morador_id`, `data_hora_inicio`, `data_hora_fim`, `status`, `observacao` (opcional). |
| PUT | `/api/reservas/{id}` | Atualiza reserva existente. |
| DELETE | `/api/reservas/{id}` | Remove reserva. Resposta `204 No Content` em sucesso. |

**Status aceitos** (campo `status`): `Confirmada`, `Pendente`, `Cancelada`.

**Regras de negócio:**

- `DataHoraFim` deve ser maior que `DataHoraInicio`.
- Não é permitida **sobreposição de horários** na mesma `area_comum_id` entre reservas com status diferente de `Cancelada`. Em conflito, a API responde **409 Conflict** com mensagem explicativa.

**Payload JSON (exemplo):** propriedades em snake_case conforme `JsonPropertyName` no model (ex.: `area_comum_id`, `data_hora_inicio`).

### Documentação OpenAPI (Swagger)

Em **Development**, com a aplicação em execução, a UI Swagger fica disponível em `/swagger` (a URL exata é logada na inicialização).

## Considerações de Segurança

- Connection string em `ConnectionStrings:DefaultConnection` — preferir **User Secrets** ou variáveis de ambiente em desenvolvimento; **não** versionar credenciais.
- Endpoints atuais não implementam autenticação JWT nesta documentação; evoluir conforme [`docs/contexto.md`](contexto.md).

## Implantação

1. Definir connection string do PostgreSQL (SSL conforme provedor, ex.: Supabase).
2. Aplicar schema e índices necessários (ver `docs/sql/`).
3. Publicar o projeto [`src/backend`](../src/backend) no ambiente escolhido.
4. Configurar variáveis de ambiente ou secrets para produção.

## Testes

- **Unitários:** projeto [`src/backend.tests`](../src/backend.tests) — regras de intervalo de tempo para reservas (`ReservaConflito`).
- **Integração:** ver [`src/backend.tests/README.md`](../src/backend.tests/README.md) (Postgres via Testcontainers ou banco de teste dedicado).

1. Casos de teste alinhados aos requisitos funcionais.
2. Testes de integração opcionais com HTTP + PostgreSQL.
3. Executar: `dotnet test src/backend.tests/backend.tests.csproj`.

# Referências

Documentação ASP.NET Core Web API, Npgsql e OpenAPI/Swashbuckle.
