# Configuração de OAuth para Google

## Redirect URIs Configurados no Google Cloud Console

Para o login com Google funcionar, você precisa registrar os seguintes redirect URIs no Google Cloud Console:

### Desenvolvimento Local
- `http://localhost:3000`
- `http://localhost:8888` (Netlify dev)
- `http://localhost:3000/oauth-callback.html`
- `http://localhost:8888/oauth-callback.html`

### Produção
- `https://seu-dominio.com`
- `https://seu-dominio.com/oauth-callback.html`

## Passo a Passo para Configurar

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Selecione seu projeto
3. Vá para **APIs & Services** → **Credentials**
4. Clique no OAuth 2.0 Client ID (Web application)
5. Em **Authorized redirect URIs**, adicione TODOS os URIs acima
6. Clique em **Save**

## Erro Comum: redirect_uri_mismatch

Se você recebe o erro `Error 400: redirect_uri_mismatch`, significa que o URI usado na requisição não corresponde a nenhum dos registrados no console.

**Solução**: Registre o URI exato que está sendo usado.

## Como Saber Qual URI Está Sendo Usado

O URI é construído dinamicamente no SocialAuthButton.tsx:

```typescript
const redirect = `${window.location.origin}/oauth-callback.html`;
// Se acessar em http://localhost:3000, será:
// http://localhost:3000/oauth-callback.html
```

Se o problema persiste, você pode tentar remover `/oauth-callback.html` e apenas usar `window.location.origin`.
