# APIs e Web Services

O planejamento de uma aplicação de APIS Web é uma etapa fundamental para o sucesso do projeto. Ao planejar adequadamente, você pode evitar muitos problemas e garantir que a sua API seja segura, escalável e eficiente.

Aqui estão algumas etapas importantes que devem ser consideradas no planejamento de uma aplicação de APIS Web.

Este projeto consiste no desenvolvimento de uma API Web para gestão de condomínios, voltada ao controle centralizado das operações administrativas e do dia a dia dos moradores. A solução contempla funcionalidades como cadastro e autenticação de usuários, gestão de áreas comuns, reservas de espaços e envio de notificações, promovendo organização e transparência na comunicação entre administração e condôminos.
A aplicação foi planejada com foco em segurança, escalabilidade e eficiência, utilizando autenticação por token, controle de acesso por perfil e integração com banco de dados relacional. Dessa forma, a API serve como base para futuras integrações com interfaces web e mobile, garantindo evolução contínua e manutenção simplificada do sistema

## Objetivos da API

O primeiro passo é definir os objetivos da sua API. O que você espera alcançar com ela? Você quer que ela seja usada por clientes externos ou apenas por aplicações internas? Quais são os recursos que a API deve fornecer?

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
- Parâmetros:
  - id: [id da area comum]
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
  
### Deliveries

- Método: GET
- URL: /api/Deliveries
- Headers: Authorization -> Bearer 'token_aqui'
- Resposta:
  - Sucesso (200 OK)
    ```
    [
      {
        "id": 30,
        "recipient_user_id": 1,
        "registered_by_user_id": 3,
        "description": "string",
        "arrival_date": "2026-04-12T19:09:39.104",
        "pickup_date": "2026-04-12T19:09:39.104",
        "status": "Registrada",
        "created_at": "2026-04-12T19:19:24.709661",
        "updated_at": "2026-04-12T19:19:24.709661"
      }
    ]
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
- Método: GET
- URL: /api/Deliveries
- Headers: Authorization -> Bearer 'token_aqui'
- Parâmetros:
  - id: [id_da_encomenda]
- Resposta:
  - Sucesso (200 OK)
   ```
   {
      "id": 30,
      "recipient_user_id": 1,
      "registered_by_user_id": 3,
      "description": "string",
      "arrival_date": "2026-04-12T19:09:39.104",
      "pickup_date": "2026-04-12T19:09:39.104",
      "status": "Registrada",
      "created_at": "2026-04-12T19:19:24.709661",
      "updated_at": "2026-04-12T19:19:24.709661"
   }
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
- Método: POST
- URL: /api/Deliveries
- Headers: Authorization -> Bearer 'token_aqui'
- Corpo Da Requisição:
  ```
  {
    "recipient_user_id": 1,
    "registered_by_user_id": 3,
    "description": "string",
    "arrival_date": "2026-04-12T19:09:39.104Z",
    "pickup_date": "2026-04-12T19:09:39.104Z",
    "status": "Registrada"
  }
  ```
- Resposta:
  - Sucesso (201 Created)
    ```
    {
      "id": 30,
      "recipient_user_id": 1,
      "registered_by_user_id": 3,
      "description": "string",
      "arrival_date": "2026-04-12T19:09:39.104",
      "pickup_date": "2026-04-12T19:09:39.104",
      "status": "Registrada",
      "created_at": "2026-04-12T19:19:24.709661",
      "updated_at": "2026-04-12T19:19:24.709661"
    } 
    ```
  - Erro (400)
    ```
    {
      "message":"Usuário registrador não existe."
    }
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
  - Erro (500)
    ```
    status: 500 Erro ao criar entrega: 22P02: invalid input value for enum delivery_status: "Em Andamento"
    ```
- Método: PUT
- URL: /api/Deliveries
- Parâmetros:
  - id: [id_da_encomenda]
- Headers: Authorization -> Bearer 'token_aqui'
- Corpo Da Requisição:
  ```
  {
    "recipient_user_id": 1,
    "registered_by_user_id": 3,
    "description": "Encomenda em análise de entrega",
    "arrival_date": "2026-04-12T19:09:39.104Z",
    "pickup_date": "2026-04-12T19:09:39.104Z",
    "status": "Disponível para Retirada"
  }
  ```
- Resposta:
  - Sucesso (200 OK)
    ```
    {
      "id": 30,
      "recipient_user_id": 1,
      "registered_by_user_id": 3,
      "description": "string",
      "arrival_date": "2026-04-12T19:09:39.104",
      "pickup_date": "2026-04-12T19:09:39.104",
      "status": "Registrada",
      "created_at": "2026-04-12T19:19:24.709661",
      "updated_at": "2026-04-12T19:19:24.709661"
    } 
    ```
  - Erro (400)
    ```
    {
      "message":"Usuário registrador não existe."
    }
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
  - Erro (500)
    ```
    status: 500 Erro ao criar entrega: 22P02: invalid input value for enum delivery_status: "Em Andamento"
    ```
- Método: DELETE
- URL: /api/Deliveries
- Headers: Authorization -> Bearer 'token_aqui'
- Parâmetros:
  - id: [id_da_encomenda]
- Resposta(204 No Content):
  -
    ```
  - Erro (400)
    ```
    {
      "message":"Usuário registrador não existe."
    }
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
  - Erro (500)
    ```
    status: 500 Erro ao criar entrega: 22P02: invalid input value for enum delivery_status: "Em Andamento"
    ```
### Notifications

- Método: GET
- URL: /api/Notifications
- Headers: Authorization -> Bearer 'token_aqui'
- Resposta:
  - Sucesso (200 OK)
    ```
    [
      {
      "id": 31,
      "user_id": 1,
      "type": "Encomenda Chegou",
      "message": "Sua encomenda (ID: 30) está disponível para retirada.",
      "is_read": false,
      "reservation_id": null,
      "occurrence_id": null,
      "delivery_id": null,
      "created_at": "2026-04-12T20:19:44.030064",
      "updated_at": "2026-04-12T20:19:44.030064"
    },
    {
    "id": 30,
    "user_id": 1,
    "type": "Reserva Confirmada",
    "message": "Sua reserva da área comum (ID: 21) foi confirmada.",
    "is_read": false,
    "reservation_id": null,
    "occurrence_id": null,
    "delivery_id": null,
    "created_at": "2026-04-11T21:28:08.443816",
    "updated_at": "2026-04-11T21:28:08.443816"
  }
]
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
- Método: GET
- URL: /api/Notifications
- Headers: Authorization -> Bearer 'token_aqui'
- Parâmetros:
  - id: [id_da_notificação]
- Resposta:
  - Sucesso (200 OK)
  ```
   {
    "id": 20,
    "user_id": 3,
    "type": "Encomenda Chegou",
    "message": "Sua encomenda (ID: 25) está disponível para retirada.",
    "is_read": false,
    "reservation_id": null,
    "occurrence_id": null,
    "delivery_id": null,
    "created_at": "2026-04-08T23:48:01.783409",
    "updated_at": "2026-04-08T23:48:01.783409"
  }
  ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
- Método: DELETE
- URL: /api/Notifications
- Headers: Authorization -> Bearer 'token_aqui'
- Parâmetros:
- Resposta:
  - Sucesso (204 No Content)
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
- Método: POST
- URL: /api/Notifications
- Headers: Authorization -> Bearer 'token_aqui'
- Corpo Da Requisição:
  ```
  {
    "user_id": 3,
    "type": "Encomenda Chegou",
    "message": "Sua encomenda chegou",
    "is_read": true,
    "reservation_id": null,
    "occurrence_id": null,
    "delivery_id": null
  }
  ```
- Resposta:
  - Sucesso (201 Created)
    ```
    {
      "id": 34,
      "user_id": 3,
      "type": "Encomenda Chegou",
      "message": "Sua encomenda chegou",
      "is_read": true,
      "reservation_id": null,
      "occurrence_id": null,
      "delivery_id": null,
      "created_at": "2026-04-12T20:35:28.486973",
      "updated_at": "2026-04-12T20:35:28.486973"
    }
    ```
  - Erro (400)
    ```
    {
      "message":"Usuário registrador não existe."
    }
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
  - Erro (500)
    ```
    status: 500 Erro ao criar entrega: 22P02: invalid input value for enum delivery_status: "Em Andamento"
    ```
- Método: PUT
- URL: /api/Deliveries
- Parâmetros:
  - id: [id_da_encomenda]
- Headers: Authorization -> Bearer 'token_aqui'
- Corpo Da Requisição:
  ```
  {
    "recipient_user_id": 1,
    "registered_by_user_id": 3,
    "description": "Encomenda em análise de entrega",
    "arrival_date": "2026-04-12T19:09:39.104Z",
    "pickup_date": "2026-04-12T19:09:39.104Z",
    "status": "Disponível para Retirada"
  }
  ```
- Resposta:
  - Sucesso (200 OK)
    ```
    {
      "id": 30,
      "recipient_user_id": 1,
      "registered_by_user_id": 3,
      "description": "string",
      "arrival_date": "2026-04-12T19:09:39.104",
      "pickup_date": "2026-04-12T19:09:39.104",
      "status": "Registrada",
      "created_at": "2026-04-12T19:19:24.709661",
      "updated_at": "2026-04-12T19:19:24.709661"
    } 
    ```
  - Erro (400)
    ```
    {
      "message":"Usuário registrador não existe."
    }
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
  - Erro (500)
    ```
    status: 500 Erro ao criar entrega: 22P02: invalid input value for enum delivery_status: "Em Andamento"
    ```
- Método: DELETE
- URL: /api/Deliveries
- Headers: Authorization -> Bearer 'token_aqui'
- Parâmetros:
  - id: [id_da_encomenda]
- Resposta(204 No Content):
  -
    ```
  - Erro (400)
    ```
    {
      "message":"Usuário registrador não existe."
    }
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
  - Erro (500)
    ```
    status: 500 Erro ao criar entrega: 22P02: invalid input value for enum delivery_status: "Em Andamento"
    ```
### Ocorrências

- Método: GET
- URL: /api/Occurrences
- Headers: Authorization -> Bearer 'token_aqui'
- Resposta:
  - Sucesso (200 OK)
    ```
    [
      {
        "id": 6,
        "user_id": 1,
        "title": "Ocorrencia 2",
        "description": "Uma ocorrencia qualquer",
        "status": "Aberto",
        "created_at": "2026-04-12T21:08:34.85953",
        "updated_at": "2026-04-12T21:08:34.85953"
      },
      {
        "id": 5,
        "user_id": 1,
        "title": "Ocorrencia 1",
        "description": "Uma ocorrencia qualquer",
        "status": "Aberto",
        "created_at": "2026-04-12T21:08:20.159985",
        "updated_at": "2026-04-12T21:08:20.159985"
      }
    ]
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
  - Erro (403)
    ```
    status: 403 Forbidden
    ```
- Método: GET
- URL: /api/Occurrences
- Headers: Authorization -> Bearer 'token_aqui'
- Parâmetros:
  - id: [id_da_ocorrência]
- Resposta:
  - Sucesso (200 OK)
  ```
   {
    "id": 6,
    "user_id": 1,
    "title": "Ocorrencia 2",
    "description": "Uma ocorrencia qualquer",
    "status": "Aberto",
    "created_at": "2026-04-12T21:08:34.85953",
    "updated_at": "2026-04-12T21:08:34.85953"
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
- Método: GET
- URL: /api/Occurrences/meu
- Headers: Authorization -> Bearer 'token_aqui'
- Resposta:
  - Sucesso (200 OK)
  ```
  [
    {
      "id": 6,
      "user_id": 1,
      "title": "Ocorrencia 2",
      "description": "Uma ocorrencia qualquer",
      "status": "Aberto",
      "created_at": "2026-04-12T21:08:34.85953",
      "updated_at": "2026-04-12T21:08:34.85953"
    },
    {
      "id": 5,
      "user_id": 1,
      "title": "Ocorrencia 1",
      "description": "Uma ocorrencia qualquer",
      "status": "Aberto",
      "created_at": "2026-04-12T21:08:20.159985",
      "updated_at": "2026-04-12T21:08:20.159985"
    }
  ]
  ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
  - Erro (403)
    ```
    status: 403 Forbidden
    ```
- Método: GET
- URL: /api/Occurrences/images
- Headers: Authorization -> Bearer 'token_aqui'
- Parâmetros:
  - id:[id_da_ocorrência]
  - imageId:[id_da_imagem]
- Resposta:
  - Sucesso (200 OK)
  ```
  {
    "id": 1,
    "occurrence_id": 5,
    "file_path": "/uploads/occurrences/5_639116272460232410.jpg",
    "file_name": "https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg",
    "mime_type": "image/jpeg",
    "file_size": 22746,
    "created_at": "2026-04-12T21:47:27.785109"
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
- Método: DELETE
- URL: /api/Occurrences
- Headers: Authorization -> Bearer 'token_aqui'
- Parâmetros:
  - id: [id_da_ocorrência]
- Resposta:
  - Sucesso (204 No Content)
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
  - Erro (403)
    ```
    status: 403 Forbidden
    ```
- Método: POST
- URL: /api/Occurrences
- Headers: Authorization -> Bearer 'token_aqui'
- Corpo Da Requisição:
  ```
  {
    "title:"Ocorrencia 2",
    "description":"Uma ocorrencia qualquer"
  }
  ```
- Resposta:
  - Sucesso (201 Created)
    ```
    {
      "id": 6,
      "user_id": 1,
      "title": "Ocorrencia 2",
      "description": "Uma ocorrencia qualquer",
      "status": "Aberto",
      "created_at": "2026-04-12T21:08:34.85953",
      "updated_at": "2026-04-12T21:08:34.85953"
    }
    ```
  - Erro (400)
    ```
    {
      "message":"Usuário registrador não existe."
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
- Método: POST
- URL: /api/Occurrences/images
- Headers:
  - Authorization -> Bearer 'token_aqui'
  - Content-Type ->  application/json
- Parâmetros:
  - id: [id_da_ocorrência]
- Corpo Da Requisição:
  ```
  {
    "file":"https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg"
  }
  ```
- Resposta:
  - Sucesso (201 Created)
    ```
    {
      "id": 1,
      "occurrence_id": 5,
      "file_path": "/uploads/occurrences/5_639116272460232410.jpg",
      "file_name": "https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg",
      "mime_type": "image/jpeg",
      "file_size": 22746,
      "created_at": "2026-04-12T21:47:27.785109"
    }
    ```
  - Erro (400)
    ```
    {
      "message":"Usuário registrador não existe."
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
  - Erro (415)
    ```
    status: 415 Unsupported Media Type
    ```
- Método: PUT
- URL: /api/Occurrences
- Parâmetros:
  - id: [id_da_encomenda]
- Headers: Authorization -> Bearer 'token_aqui'
- Corpo Da Requisição:
  ```
  {
    "title":"Ocorrencia 2",
    "description":"Uma ocorrencia qualquer 2",
    "status":"Em Andamento"
  }
  ```
- Resposta:
  - Sucesso (200 OK)
    ```
    {
      "id": 30,
      "recipient_user_id": 1,
      "registered_by_user_id": 3,
      "description": "string",
      "arrival_date": "2026-04-12T19:09:39.104",
      "pickup_date": "2026-04-12T19:09:39.104",
      "status": "Registrada",
      "created_at": "2026-04-12T19:19:24.709661",
      "updated_at": "2026-04-12T19:19:24.709661"
    } 
    ```
  - Erro (400)
    ```
    {
      "message":"Usuário registrador não existe."
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
  - Erro (500)
    ```
    status: 500 Erro ao criar entrega: 22P02: invalid input value for enum delivery_status: "Em Andamento"
    ```
- Método: DELETE
- URL: /api/Occurrences
- Headers: Authorization -> Bearer 'token_aqui'
- Parâmetros:
  - id: [id_da_ocorrência]
- Resposta(204 No Content):
  -
    ```
  - Erro (400)
    ```
    {
      "message":"Usuário registrador não existe."
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
  - Erro (500)
    ```
    status: 500 Erro ao criar entrega: 22P02: invalid input value for enum delivery_status: "Em Andamento"
    ```
### Reservas

- Método: GET
- URL: /api/reservas
- Headers: Authorization -> Bearer 'token_aqui'
- Resposta:
  - Sucesso (200 OK)
    ```
    [
      {
        "id": 24,
        "common_area_id": 9,
        "user_id": 3,
        "start_time": "2026-04-12T21:53:55.236",
        "end_time": "2026-04-12T21:53:58.236",
        "status": "Pendente",
        "notes": null,
        "created_at": "2026-04-12T21:58:52.333029",
        "updated_at": "2026-04-12T21:58:52.333029"
      }
    ]
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
- Método: GET
- URL: /api/reservas
- Headers: Authorization -> Bearer 'token_aqui'
- Parâmetros:
  - id: [id_da_reserva]
- Resposta:
  - Sucesso (200 OK)
  ```
  {
    "id": 24,
    "common_area_id": 9,
    "user_id": 3,
    "start_time": "2026-04-12T21:53:55.236",
    "end_time": "2026-04-12T21:53:58.236",
    "status": "Pendente",
    "notes": null,
    "created_at": "2026-04-12T21:58:52.333029",
    "updated_at": "2026-04-12T21:58:52.333029"
  }
  ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```

- Método: DELETE
- URL: /api/reservas
- Headers: Authorization -> Bearer 'token_aqui'
- Parâmetros:
  - id: [id_da_reserva]
- Resposta:
  - Sucesso (204 No Content)
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```

- Método: POST
- URL: /api/reservas
- Headers: Authorization -> Bearer 'token_aqui'
- Corpo Da Requisição:
  ```
  {
    "common_area_id": 9,
    "user_id": 1,
    "start_time": "2026-04-12T21:53:55.236Z",
    "end_time": "2026-04-12T21:53:58.236Z",
    "status": "Pendente",
    "notes": "string"
  }
  ```
- Resposta:
  - Sucesso (201 Created)
    ```
    {
      "id": 23,
      "common_area_id": 9,
      "user_id": 1,
      "start_time": "2026-04-12T21:53:55.236",
      "end_time": "2026-04-12T21:53:58.236",
      "status": "Pendente",
      "notes": null,
      "created_at": "2026-04-12T21:56:00.423005",
      "updated_at": "2026-04-12T21:56:00.423005"
    }
    ```
  - Erro (400)
    ```
    {
      "message":"Usuário registrador não existe."
    }
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
  - Erro (409)
    ```
    status: 409 Conflict
    Já existe reserva ativa (não cancelada) neste horário para esta área comum.
    ```
- Método: PUT
- URL: /api/reservas
- Parâmetros:
  - id: [id_da_reserva]
- Headers: Authorization -> Bearer 'token_aqui'
- Corpo Da Requisição:
  ```
  {
    "common_area_id": 13,
    "user_id": 3,
    "start_time": "2026-04-12T21:53:55.236Z",
    "end_time": "2026-04-12T21:53:58.236Z",
    "status": "Pendente",
    "notes": "string"
  }
  ```
- Resposta:
  - Sucesso (200 OK)
    ```
    {
      "id": 24,
      "common_area_id": 13,
      "user_id": 3,
      "start_time": "2026-04-12T21:53:55.236",
      "end_time": "2026-04-12T21:53:58.236",
      "status": "Pendente",
      "notes": null,
      "created_at": "2026-04-12T21:58:52.333029",
      "updated_at": "2026-04-12T22:02:30.241348"
    }
    ```
  - Erro (400)
    ```
    {
      "message":"Usuário registrador não existe."
    }
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
### Usuários

- Método: GET
- URL: /api/Users
- Headers: Authorization -> Bearer 'token_aqui'
- Resposta:
  - Sucesso (200 OK)
    ```
    [
      {
          "id": 1,
          "username": "Matheus",
          "password_hash": null,
          "email": "m@hotmail.com",
          "profile": "Morador",
          "created_at": "2026-03-25T18:10:24.392162",
          "updated_at": "2026-03-25T18:10:24.392162"
      },
      {
          "id": 2,
          "username": "Guilherme",
          "password_hash": null,
          "email": "gigas@hotmail.com",
          "profile": "Administrador",
          "created_at": "2026-03-25T18:55:56.446297",
          "updated_at": "2026-03-25T18:55:56.446297"
      },
      {
          "id": 3,
          "username": "Mathias",
          "password_hash": null,
          "email": "matheus.blaselbauer@gmail.com",
          "profile": "Administrador",
          "created_at": "2026-04-08T19:09:17.811516",
          "updated_at": "2026-04-08T19:09:17.811516"
      },
      {
          "id": 4,
          "username": "Gabriel",
          "password_hash": null,
          "email": "gabriel@gmail.com",
          "profile": "Administrador",
          "created_at": "2026-04-12T02:50:33.232616",
          "updated_at": "2026-04-12T02:50:33.232616"
      }
    ]
    ```
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
  - Erro (403)
    ```
    status: 403 Forbidden
    ```
- Método: GET
- URL: /api/Users
- Headers: Authorization -> Bearer 'token_aqui'
- Parâmetros:
  - id: [id_do_usuário]
- Resposta:
  - Sucesso (200 OK)
  ```
  {
    "id": 5,
    "username": "Douglas",
    "password_hash": null,
    "email": "douglas@gmail.com",
    "profile": "Morador",
    "created_at": "2026-04-12T22:13:17.669608",
    "updated_at": "2026-04-12T22:13:17.669608"
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

- Método: DELETE
- URL: /api/Users
- Headers: Authorization -> Bearer 'token_aqui'
- Parâmetros:
  - id: [id_do_usuário]
- Resposta:
  - Sucesso (204 No Content)
  - Erro (401)
    ```
    status: 401 Not Authorized
    ```
  - Erro (403)
    ```
    status: 403 Forbidden
    ```

- Método: POST
- URL: /api/Users/auth
- Headers: Authorization -> Bearer 'token_aqui'
- Corpo Da Requisição:
  ```
  {
    "id": 3,
    "password": "Naruto1014"
  }
  ```
- Resposta:
  - Sucesso (201 Created)
    ```
    {
    "token":  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIzIiwicm9sZSI6IkFkbWluaXN0cmFkb3IiLCJuYmYiOjE3NzYwMzE4MzEsImV4cCI6MTc3NjA2MDYzMSwiaWF0IjoxNzc2MDMxODMxfQ.azvpKyGKl_vzpwnbbGnlcf1auARmtSbizVjIhvZvsgk"
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
- URL: /api/Users
- Parâmetros:
  - id: [id_do_usuario]
- Headers: Authorization -> Bearer 'token_aqui'
- Corpo Da Requisição:
  ```
  {
    "username": "Doug",
    "password_hash": "Naruto1014",
    "email": "douglas@gmail.com",
    "profile": "Morador"
  }
  ```
- Resposta:
  - Sucesso (200 OK)
    ```
    {
      "id": 5,
      "username": "Doug",
      "password_hash": null,
      "email": "douglas@gmail.com",
      "profile": "Morador",
      "created_at": "2026-04-12T22:13:17.669608",
      "updated_at": "2026-04-12T22:27:20.137665"
    }
    ```
  - Erro (400)
    ```
    {
      "message":"Usuário registrador não existe."
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

### 1. Requisitos de Hardware e Software

Para que a aplicação funcione de forma eficiente, o ambiente de produção deve atender às seguintes especificações:

### **Hardware (Mínimo Recomendado)**
* **Processador (CPU):** 2 vCPUs (unidades de processamento virtual).
* **Memória RAM:** 4 GB (mínimo de 2 GB livres exclusivamente para o processo da API).
* **Armazenamento:** 20 GB de SSD (espaço para SO, imagens Docker, binários e logs).
* **Rede:** Conectividade de baixa latência com largura de banda de pelo menos 100 Mbps.

### **Software**
* **Sistema Operacional:** Distribuições Linux (Ubuntu 22.04 LTS ou Debian 11) são preferíveis pela leveza e segurança.
* **Runtime:** ASP.NET Core Runtime 8.0 (instalar via pacote oficial da Microsoft se não usar Docker).
* **Gerenciamento de Containers:** Docker Engine v24+ e Docker Compose v2+.
* **Segurança:** Firewall ativo (UFW ou IPtables) permitindo apenas as portas 80 (HTTP), 443 (HTTPS) e 22 (SSH).

---

### 2. Escolha da Plataforma de Hospedagem

A plataforma deve ser escolhida com base na escalabilidade necessária para o sistema distribuído:

* **Opção em Nuvem (PaaS/IaaS):**
    * **Microsoft Azure:** Recomendado por possuir integração nativa com o ecossistema .NET. O *Azure App Service for Containers* simplifica o deploy.
    * **AWS:** Utilizar o *Amazon ECS* (Elastic Container Service) para orquestração de containers.
* **Servidores Privados (VPS):**
    * **DigitalOcean / Linode:** Excelente custo-benefício para hospedar instâncias individuais (Droplets) com Docker pré-instalado.

---

### 3. Configuração do Ambiente de Implantação



Antes de subir a aplicação, prepare o servidor:

1.  **Atualização do Sistema:**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
2.  **Instalação do Docker:**
    ```bash
    sudo apt install docker.io docker-compose -y
    sudo systemctl enable --now docker
    ```
3.  **Configuração das Variáveis de Ambiente:**
    Crie um arquivo chamado `.env` no diretório de deploy. Este arquivo **não deve ser enviado ao GitHub**:
    ```env
    ASPNETCORE_ENVIRONMENT=Production
    ConnectionStrings__DefaultConnection="Host=db;Database=condominio;Username=admin;Password=sua_senha_segura"
    JWT_SECRET="SuaChaveSecretaDePeloMenos32Caracteres"
    DB_PASSWORD="sua_senha_segura"
    ```

---

### 4. Deploy da Aplicação

O deploy deve seguir o fluxo de integração contínua ou manual via Docker:

1.  **Geração da Imagem (Build):**
    No diretório `src/backend`, execute o build da imagem Docker:
    ```bash
    docker build -t gestao-condominio-api:1.0 .
    ```
2.  **Subida dos Serviços (Up):**
    Configure um arquivo `docker-compose.yml` para orquestrar a API e o Banco de Dados:
    ```yaml
    version: '3.8'
    services:
      api:
        image: gestao-condominio-api:1.0
        env_file: .env
        ports:
          - "80:80"
        restart: always
        depends_on:
          - db
      db:
        image: postgres:15
        environment:
          POSTGRES_PASSWORD: ${DB_PASSWORD}
    ```
    Inicie o sistema: `docker-compose up -d`

---

### 5. Testes de Produção e Validação

Após o deploy, realize as validações finais para garantir a disponibilidade:

* **Teste de Conectividade:** Tente acessar a URL pública da API. O esperado é um retorno JSON ou a página do Swagger (se configurada para produção).
* **Monitoramento de Logs:** Execute `docker logs -f [id-do-container]` para verificar se há exceções de conexão com o banco de dados.
* **Teste de Carga Simples:** Utilize ferramentas como `ab` (Apache Benchmark) ou `k6` para validar se a aplicação responde sob múltiplas requisições simultâneas.
* **Certificado SSL:** Verifique se o cadeado de segurança aparece no navegador (configuração via Nginx + Certbot).

## Testes

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
### Testes das Rotas
## users: 
Autenticação:
![Rota de Autenticação](img/imgs-testes-rotas/users/rota-autenticacao.png)
Buscar Usuário
![Buscar Usuário](img/imgs-testes-rotas/users/rota-buscar-user.png)
Deletar Usuário:
![Deletar Usuário](img/imgs-testes-rotas/users/rota-deletar-user.png)
Editar Usuário:
![Editar Usuário](img/imgs-testes-rotas/users/rota-editar-user.png)
Listar Usuários:
![Listar Usuários](img/imgs-testes-rotas/users/rota-listar-users.png)
---
# Referências

Inclua todas as referências (livros, artigos, sites, etc) utilizados no desenvolvimento do trabalho.
