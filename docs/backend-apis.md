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
