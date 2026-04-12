# APIs e Web Services

O planejamento de uma aplicação de APIS Web é uma etapa fundamental para o sucesso do projeto. Ao planejar adequadamente, você pode evitar muitos problemas e garantir que a sua API seja segura, escalável e eficiente.

Aqui estão algumas etapas importantes que devem ser consideradas no planejamento de uma aplicação de APIS Web.

[Inclua uma breve descrição do projeto.]

## Objetivos da API

O primeiro passo é definir os objetivos da sua API. O que você espera alcançar com ela? Você quer que ela seja usada por clientes externos ou apenas por aplicações internas? Quais são os recursos que a API deve fornecer?

[Inclua os objetivos da sua api.]

### Objetivos específicos — módulo Reservas de áreas comuns

O módulo de **reservas de áreas comuns** expõe um CRUD REST sobre a tabela PostgreSQL `public.reservations`, para ser consumido por **aplicações internas** do condomínio (interfaces web e mobile planejadas no projeto), e não como API pública aberta a clientes externos arbitrários.

Os objetivos operacionais deste módulo são:

- Permitir **listar** e **consultar por id** as reservas cadastradas, com ordenação por `id`.
- Permitir **criar** e **atualizar** reservas com validação de negócio: `common_area_id` e `user_id` devem ser maiores que zero; o intervalo `start_time`–`end_time` deve ser válido (`end_time` posterior a `start_time`); as datas enviadas são **normalizadas para UTC** no servidor antes de persistir.
- Impedir **sobreposição de horários** na mesma área comum (`common_area_id`) quando já existir outra reserva cujo status **não** seja `Cancelada`, retornando **409 Conflict** com mensagem explicativa.
- Permitir **remover** uma reserva por identificador, com resposta **204 No Content** em caso de sucesso.
- Expor o recurso apenas a usuários autenticados com papel **Administrador** (autorização JWT), alinhado ao atributo `[Authorize(Roles = "Administrador")]` no controlador de reservas.
- Em falhas de banco (ex.: violação de chave estrangeira, valor inválido para enum de status), retornar mensagens tratadas de forma amigável quando possível (mapeamento de erros PostgreSQL no controlador).

## Modelagem da Aplicação
[Descreva a modelagem da aplicação, incluindo a estrutura de dados, diagramas de classes ou entidades, e outras representações visuais relevantes.]


## Tecnologias Utilizadas

Existem muitas tecnologias diferentes que podem ser usadas para desenvolver APIs Web. A tecnologia certa para o seu projeto dependerá dos seus objetivos, dos seus clientes e dos recursos que a API deve fornecer.

[Lista das tecnologias principais que serão utilizadas no projeto.]

### Tecnologias em uso no backend (projeto)

| Área | Tecnologia / componente |
|------|-------------------------|
| Runtime e hospedagem da API | **.NET 10** (`net10.0`), **ASP.NET Core** (aplicação web com controllers) |
| Banco de dados | **PostgreSQL** (ex.: instância **Supabase** em nuvem) |
| Acesso a dados | **Npgsql** (driver ADO.NET); **Entity Framework Core** + **Npgsql.EntityFrameworkCore.PostgreSQL** (contexto `ApplicationDbContext` e uso de `GetDbConnection()` para SQL parametrizado nas operações de reservas) |
| Contrato e documentação HTTP | **Swagger / OpenAPI** via **Swashbuckle.AspNetCore** |
| Autenticação e tokens | **JWT Bearer** (`Microsoft.AspNetCore.Authentication.JwtBearer`) |
| Segurança de credenciais (ex.: usuários) | **BCrypt.Net-Next** para hash de senhas |

## API Endpoints

[Liste os principais endpoints da API, incluindo as operações disponíveis, os parâmetros esperados e as respostas retornadas.]

### Módulo Reservas — `/api/reservas`

**Autenticação e autorização:** todas as operações exigem cabeçalho `Authorization: Bearer <token JWT>` e perfil com papel **Administrador**.

**Formato do corpo (POST/PUT):** JSON em *snake_case*, alinhado ao modelo `ReservaAreaComum`: `common_area_id`, `user_id`, `start_time`, `end_time`, `status` (obrigatório, string do enum), `notes` (opcional; **não é persistido** na tabela `public.reservations`). Respostas seguem o mesmo padrão de nomes de propriedades.

**Valores de `status`:** `Pendente`, `Aprovada`, `Rejeitada`, `Cancelada` (alinhados ao enum PostgreSQL `reservation_status`). Na entrada JSON, `Confirmada` ou `Confirmado` são aceitos como alias de `Aprovada`.

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/reservas` | Lista todas as reservas, ordenadas por `id`. **200 OK** com array de objetos; **500** em erro de servidor ou conexão inválida. |
| GET | `/api/reservas/{id}` | Obtém uma reserva pelo `id` (inteiro). **200 OK** com objeto; **404** se não existir; **500** em erro de servidor. |
| POST | `/api/reservas` | Cria reserva. **201 Created** com corpo da entidade criada e cabeçalho `Location` apontando para `GET` por id; **400 Bad Request** com mensagem em texto quando validação de negócio falha; **409 Conflict** se houver sobreposição de horário na mesma área (exceto reservas `Cancelada`); **500** / **502** em erros de banco ou resposta vazia inesperada. Pode retornar **400** com `ValidationProblem` (JSON) se o modelo enviado for inválido. |
| PUT | `/api/reservas/{id}` | Atualiza reserva existente. **200 OK** com objeto atualizado; **400** / **409** com as mesmas regras do POST; **404** se o `id` não existir; **500** em erro de banco. |
| DELETE | `/api/reservas/{id}` | Remove a reserva. **204 No Content** em sucesso; **404** se o `id` não existir; **500** em erro de banco. |

**Respostas de erro (visão geral):** além dos códigos acima, mensagens de falha costumam ser **texto plano** na resposta (string), exceto quando o ASP.NET Core retorna **400** com corpo de validação (`ValidationProblem`) para o corpo JSON malformado em relação ao modelo.

### Endpoint 1
- Método: GET
- URL: /endpoint1
- Parâmetros:
  - param1: [descrição]
- Resposta:
  - Sucesso (200 OK)
    ```
    {
      "message": "Success",
      "data": {
        ...
      }
    }
    ```
  - Erro (4XX, 5XX)
    ```
    {
      "message": "Error",
      "error": {
        ...
      }
    }
    ```

## Considerações de Segurança

[Discuta as considerações de segurança relevantes para a aplicação distribuída, como autenticação, autorização, proteção contra ataques, etc.]

## Implantação

[Instruções para implantar a aplicação distribuída em um ambiente de produção.]

1. Defina os requisitos de hardware e software necessários para implantar a aplicação em um ambiente de produção.
2. Escolha uma plataforma de hospedagem adequada, como um provedor de nuvem ou um servidor dedicado.
3. Configure o ambiente de implantação, incluindo a instalação de dependências e configuração de variáveis de ambiente.
4. Faça o deploy da aplicação no ambiente escolhido, seguindo as instruções específicas da plataforma de hospedagem.
5. Realize testes para garantir que a aplicação esteja funcionando corretamente no ambiente de produção.

## Testes

[Descreva a estratégia de teste, incluindo os tipos de teste a serem realizados (unitários, integração, carga, etc.) e as ferramentas a serem utilizadas.]

1. Crie casos de teste para cobrir todos os requisitos funcionais e não funcionais da aplicação.
2. Implemente testes unitários para testar unidades individuais de código, como funções e classes.
3. Realize testes de integração para verificar a interação correta entre os componentes da aplicação.
4. Execute testes de carga para avaliar o desempenho da aplicação sob carga significativa.
5. Utilize ferramentas de teste adequadas, como frameworks de teste e ferramentas de automação de teste, para agilizar o processo de teste.

# Referências

Inclua todas as referências (livros, artigos, sites, etc) utilizados no desenvolvimento do trabalho.
