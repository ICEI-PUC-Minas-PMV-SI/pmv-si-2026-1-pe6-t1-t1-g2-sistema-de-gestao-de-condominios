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

### CommonAreas
- Método: GET
- URL: /api/areas-comuns
- Headers: Authorization -> Bearer 'token_aqui'
- Resposta:
  - Sucesso (200 OK)
    ```
    [
      {
        "id": 4,
        "name": "Piscina",
        "capacity": 20,
        "rules": "string"
      }
    ]
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
- Método: GET
- URL: /api/areas-comuns
- Headers: Authorization -> Bearer 'token_aqui'
- Parâmetros:
  - id: [id da area comum]
- Resposta:
  - Sucesso (200 OK)
    ```
    {
      "id": 11,
      "name": "Salao",
      "capacity": 10,
      "rules": "string",
      "created_at": "2026-04-12T18:19:41.694662",
      "updated_at": "2026-04-12T18:19:41.694662"
    }
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
- Método: POST
- URL: /api/areas-comuns
- Headers: Authorization -> Bearer 'token_aqui'
- Corpo da Requisição:
  ```
  {
    "name": "Churrasqueira",
    "capacity": 10,
    "rules": "string",
    "created_at": "2026-04-12T17:38:28.531Z",
    "updated_at": "2026-04-12T17:38:28.531Z"
  }
  ```
- Resposta:
  - Sucesso (201 Created)
  ```
  {
    "id": 12,
    "name": "Churrasqueira",
    "capacity": 10,
    "rules": "string",
    "created_at": "2026-04-12T18:21:57.590449",
    "updated_at": "2026-04-12T18:21:57.590449"
  }
  ```
  - Erro (400)
  ```
    {
      message: "Já existe uma área comum com este nome"
    }
  ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
  - Erro (403)
    ```
    status: 403 Forbidden
    ```
- Método: PUT
- URL: /api/areas-comuns
- Headers: Authorization -> Bearer 'token_aqui'
- Corpo da Requisição:
  ```
  {
    "name": "Churrasqueira",
    "capacity": 20,
    "rules": "string",
    "created_at": "2026-04-12T17:38:28.531Z",
    "updated_at": "2026-04-12T17:38:28.531Z"
  }
  ```
- Parâmetros:
  - id: [id da area comum]
- Resposta:
  - Sucesso (200 OK)
    ```
    {
      "id": 12,
      "name": "Churrasqueira",
      "capacity": 20,
      "rules": "string",
      "created_at": "2026-04-12T18:21:57.590449",
      "updated_at": "2026-04-12T18:23:07.549357"
    }
    ```
  - Erro (400)
    ```
    status: 400 Bad Request
    Não é possível editar esta área comum pois existe reserva futura associada.
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
  - Erro (403)
    ```
    status: 403 Forbidden
    ```
- Método: DELETE
- URL: /api/areas-comuns
- Headers: Authorization -> Bearer 'token_aqui'
- Parâmetros:
  - id: [id da area comum]
- Resposta:
  - Sucesso (204 No Content)
  - Erro (400)
    ```
    status: 400 Bad Request
    Não é possível editar esta área comum pois existe reserva futura associada.
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
  - Erro (403)
    ```
    status: 403 Forbidden
    ```
  
### Consultar Disponibilidade de Reservas (RF 03)
- **Método:** GET
- **URL:** `/api/reservas/disponibilidade`
- **Parâmetros:**
  - `areaId` (int): ID da área comum (obrigatório).
  - `data` (DateTime): Data para consulta (obrigatório, formato ISO 8601).
- **Resposta:**
  - **Sucesso (200 OK):** Retorna a lista de horários ocupados.
    ```json
    [
      { "inicio": "2026-03-22T10:00:00Z", "fim": "2026-03-22T12:00:00Z" }
    ]
    ```
  - **Erro (400 Bad Request):** Parâmetros inválidos ou ausentes (ex: `areaId` não é um número ou `data` em formato incorreto).
    ```json
    {
      "type": "[https://tools.ietf.org/html/rfc7231#section-6.5.1](https://tools.ietf.org/html/rfc7231#section-6.5.1)",
      "title": "One or more validation errors occurred.",
      "status": 400,
      "errors": { "data": ["The value 'data-invalida' is not valid."] }
    }
    ```
  - **Erro (500 Internal Server Error):** Erro interno ao processar a consulta ou falha na conexão com o banco de dados.

 
## API Endpoints - Gestão de Ocorrências

### Listar Ocorrências
- **Método:** GET
- **URL:** `/api/occurrences`
- **Resposta de Sucesso (200 OK):** Retorna a lista completa de ocorrências registradas.

### Consultar Ocorrência por ID
- **Método:** GET
- **URL:** `/api/occurrences/{id}`
- **Parâmetros:** `id` (int) - Identificador único da ocorrência.
- **Resposta de Sucesso (200 OK):** Retorna os detalhes da ocorrência solicitada.
- **Resposta de Erro (404 Not Found):** Caso o ID não exista no banco de dados.

### Criar Ocorrência
- **Método:** POST
- **URL:** `/api/occurrences`
- **Corpo da Requisição (JSON):**
    ```json
    {
      "description": "Descrição do problema",
      "userId": 1,
      "status": "Pendente"
    }
    ```
- **Resposta de Sucesso (201 Created):** Retorna a ocorrência criada com seu novo ID.
- **Resposta de Erro (400 Bad Request):** Caso os dados enviados sejam inválidos.

### Atualizar Ocorrência
- **Método:** PUT
- **URL:** `/api/occurrences/{id}`
- **Parâmetros:** `id` (int) - ID da ocorrência a ser editada.
- **Resposta de Sucesso (204 No Content):** Indica que a atualização foi realizada com sucesso.
- **Resposta de Erro (400 Bad Request):** Caso o ID da URL não coincida com o ID no corpo da requisição.

### Excluir Ocorrência
- **Método:** DELETE
- **URL:** `/api/occurrences/{id}`
- **Resposta de Sucesso (204 No Content):** Ocorrência removida com sucesso.
- **Resposta de Erro (404 Not Found):** Caso a ocorrência não seja encontrada.

## Considerações de Segurança

Esta seção detalha os mecanismos de proteção implementados na API e apresenta uma análise crítica sobre os riscos e vulnerabilidades remanescentes no código.

### 1. Mecanismos Implementados

* **Autenticação e Autorização (JWT):** O acesso a endpoints sensíveis é controlado via JSON Web Tokens. O sistema utiliza perfis de acesso (*Roles*) para restringir funcionalidades:
    * **Administrador:** Possui permissões para gerir todas as ocorrências e áreas comuns.
    * **Morador:** Restrito a funcionalidades de consulta e criação de registros próprios.
* **Proteção contra SQL Injection:** A utilização do **Entity Framework Core** como ORM garante a parametrização das consultas, mitigando ataques de injeção de SQL.
* **Segurança na Camada de Transporte:** A conexão com a base de dados PostgreSQL está configurada para exigir SSL (`SslMode = SslMode.Require`), protegendo os dados em trânsito.
* **Validação de Uploads (Ocorrências):**
    * **Tipo de Arquivo:** O sistema verifica o tipo MIME, aceitando apenas formatos de imagem específicos (JPEG, PNG, GIF, WebP).
    * **Tamanho do Arquivo:** Existe uma verificação lógica que limita o upload a **5MB** por arquivo no controlador de ocorrências.
* **Proteção contra Acesso Indevido (IDOR):** No módulo de ocorrências, o sistema valida se o usuário que tenta anexar uma imagem é de fato o proprietário do registro.

### 2. Análise de Riscos e Incoerências (Sinceridade Técnica)

Como solicitado pela coordenação do projeto, abaixo são listados os pontos de falha e incoerências que representam riscos à segurança da aplicação:

* **Incoerência nos Limites de Upload:** Existe uma contradição técnica no código. Enquanto o controlador de ocorrências limita o arquivo a **5MB**, a configuração global do servidor no arquivo `Program.cs` permite corpos de requisição de até **100MB** (`MultipartBodyLengthLimit`). Isso pode permitir que ataques de negação de serviço (DoS) ocupem recursos do servidor antes mesmo da lógica do controlador barrar o arquivo.
* **CORS Excessivamente Permissivo:** A API está configurada com `AllowAnyOrigin()`, `AllowAnyMethod()` e `AllowAnyHeader()`. Isso significa que qualquer site malicioso pode tentar realizar requisições contra a API, representando um risco grave de segurança em ambiente de produção.
* **Configuração Insegura de Metadados HTTPS:** No `Program.cs`, a opção `RequireHttpsMetadata` está definida como `false`. O próprio comentário no código admite que isso é inseguro e deveria ser `true` para garantir que o token JWT nunca viaje por conexões não criptografadas.
* **Vulnerabilidade a Ataques de Força Bruta:** Não foi implementado nenhum mecanismo de *Rate Limiting*. Um atacante pode realizar milhares de tentativas de login ou consultas aos endpoints sem ser bloqueado automaticamente pelo sistema.
* **Risco de Exposição de IDs Sequenciais:** O uso de IDs numéricos simples (1, 2, 3...) facilita a enumeração de recursos por atacantes. A ausência de identificadores únicos complexos (GUIDs) torna o sistema mais vulnerável a tentativas de adivinhação de registros.
* **Ausência de Revogação de Tokens:** O sistema não possui uma "lista negra" para tokens. Se um token for comprometido, ele permanecerá válido até sua expiração natural, mesmo que o usuário saia do sistema ou mude a senha.

## Implantação

[Instruções para implantar a aplicação distribuída em um ambiente de produção.]

1. Defina os requisitos de hardware e software necessários para implantar a aplicação em um ambiente de produção.
2. Escolha uma plataforma de hospedagem adequada, como um provedor de nuvem ou um servidor dedicado.
3. Configure o ambiente de implantação, incluindo a instalação de dependências e configuração de variáveis de ambiente.
4. Faça o deploy da aplicação no ambiente escolhido, seguindo as instruções específicas da plataforma de hospedagem.
5. Realize testes para garantir que a aplicação esteja funcionando corretamente no ambiente de produção.

## Testes

[Descreva a estratégia de teste, incluindo os tipos de teste a serem realizados (unitários, integração, carga, etc.) e as ferramentas a serem utilizadas.]

O projeto utiliza uma suíte de testes automatizados e verificações manuais para garantir a estabilidade de todos os módulos.

### 1. Testes Unitários (xUnit)
Cobre a lógica de negócio de todo o backend:

- **Autenticação e Segurança:** - `UsersControllerTests` e `JwtGenTests` validam o registro, login e a geração correta de tokens JWT com as devidas permissões (Roles).
- **Gestão de Reservas:** - `ReservaConflitoTests` e `ReservasControllerTests` garantem que não ocorram sobreposições de horários e que os inputs (datas e IDs) sejam válidos.
  - `ReservationStatusJsonConverterTests` assegura que os status das reservas sejam convertidos corretamente entre o banco e a aplicação.
- **Gestão de Ocorrências:** - `OccurrencesControllerTests` valida o ciclo de vida das ocorrências e as restrições de acesso por perfil.
- **Serviços de Infraestrutura:** - `EmailServiceTests` confirma o funcionamento do envio de e-mails para notificações do sistema.

### 2. Testes de Integração e Carga
- **Resiliência (`BackendIntegrationLoadTests`)**: Simula o comportamento do sistema sob alta carga de requisições e valida a persistência real dos dados no PostgreSQL.

### 3. Verificação Funcional
Validado via Swagger UI e Postman:
- **Fluxo de Disponibilidade:** Verificado que reservas canceladas liberam o horário imediatamente no endpoint de consulta.
- **Fluxo de Ocorrências:** Confirmado que moradores não conseguem listar ocorrências de outros usuários nem anexar fotos a registros que não lhes pertencem.

**Status Final:** A suíte de testes atual cobre os requisitos críticos de segurança e integridade de dados definidos para o projeto.

# Referências

Inclua todas as referências (livros, artigos, sites, etc) utilizados no desenvolvimento do trabalho.
