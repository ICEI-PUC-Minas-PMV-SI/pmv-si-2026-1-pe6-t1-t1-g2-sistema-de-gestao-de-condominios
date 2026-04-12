# APIs e Web Services

O planejamento de uma aplicação de APIS Web é uma etapa fundamental para o sucesso do projeto. Ao planejar adequadamente, você pode evitar muitos problemas e garantir que a sua API seja segura, escalável e eficiente.

Aqui estão algumas etapas importantes que devem ser consideradas no planejamento de uma aplicação de APIS Web.

[Inclua uma breve descrição do projeto.]

## Objetivos da API

O primeiro passo é definir os objetivos da sua API. O que você espera alcançar com ela? Você quer que ela seja usada por clientes externos ou apenas por aplicações internas? Quais são os recursos que a API deve fornecer?

[Inclua os objetivos da sua api.]


## Modelagem da Aplicação
[Descreva a modelagem da aplicação, incluindo a estrutura de dados, diagramas de classes ou entidades, e outras representações visuais relevantes.]


## Tecnologias Utilizadas

Existem muitas tecnologias diferentes que podem ser usadas para desenvolver APIs Web. A tecnologia certa para o seu projeto dependerá dos seus objetivos, dos seus clientes e dos recursos que a API deve fornecer.

[Lista das tecnologias principais que serão utilizadas no projeto.]

## API Endpoints

[Liste os principais endpoints da API, incluindo as operações disponíveis, os parâmetros esperados e as respostas retornadas.]

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
