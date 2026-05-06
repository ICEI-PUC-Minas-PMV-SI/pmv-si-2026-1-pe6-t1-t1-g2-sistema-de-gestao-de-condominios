# Solução: Erro 400 - redirect_uri_mismatch no Google OAuth

## Problema Identificado

```
Access blocked: This app's request is invalid
Error 400: redirect_uri_mismatch
```

Este erro ocorre quando o `redirect_uri` enviado na requisição de OAuth **não corresponde** a nenhum dos URIs registrados no Google Cloud Console.

## Root Cause

O sistema está enviando o redirect_uri:
```
http://localhost:3000/oauth-callback.html
```

Mas este URI **não foi configurado** no Google Cloud Console.

## Solução

### Passo 1: Acessar Google Cloud Console

1. Abra [Google Cloud Console](https://console.cloud.google.com)
2. Selecione o projeto (ou crie um novo)
3. Ative a API Google+ se ainda não estiver ativada

### Passo 2: Criar/Editar OAuth 2.0 Client ID

1. Vá para **APIs & Services** → **Credentials**
2. Clique em **Create Credentials** → **OAuth 2.0 Client ID**
3. Selecione **Web application**
4. Nome: `CondoAdmin`

### Passo 3: Configurar Authorized Redirect URIs

Em **Authorized redirect URIs**, clique em **Add URI** e registre TODOS os seguintes:

#### Para Desenvolvimento Local
```
http://localhost:3000
http://localhost:3000/oauth-callback.html
http://localhost:8888
http://localhost:8888/oauth-callback.html
```

#### Para Produção (quando deploiar)
```
https://seu-dominio.com
https://seu-dominio.com/oauth-callback.html
```

### Passo 4: Copiar o Client ID

1. Após salvar, você verá o **Client ID** exibido
2. Copie o valor
3. Abra `src/frontend-web/.env.local`
4. Atualize:
   ```env
   VITE_GOOGLE_CLIENT_ID="seu-novo-client-id-aqui"
   ```

### Passo 5: Reiniciar o Frontend

```bash
cd src/frontend-web
npm run dev
```

## Como Funciona o Fluxo de Redirect

```
1. Usuário clica no botão "Entrar com Google"
   ↓
2. Frontend abre popup para: https://accounts.google.com/o/oauth2/v2/auth?
   - client_id=...
   - redirect_uri=http://localhost:3000/oauth-callback.html
   - ...outros parâmetros
   ↓
3. Usuário faz login no Google
   ↓
4. Google redireciona para: http://localhost:3000/oauth-callback.html?code=...
   ↓
5. Arquivo oauth-callback.html recebe o código
   ↓
6. Envia mensagem via postMessage para janela pai
   ↓
7. Frontend captura o código e faz exchange com backend
   ↓
8. Backend valida com Google e retorna JWT
   ↓
9. Usuário é logado e redirecionado para /deliveries
```

## Checklist de Verificação

- [ ] Google Cloud Console tem os 4 URIs registrados?
- [ ] Client ID foi copiado para `.env.local`?
- [ ] Frontend foi reiniciado com `npm run dev`?
- [ ] Arquivo `public/oauth-callback.html` existe?
- [ ] Backend está rodando em `localhost:5219`?

## Se Continuar Não Funcionando

1. **Limpe o cache:**
   ```bash
   cd src/frontend-web
   rm -rf .tanstack dist node_modules/.vite
   npm run dev
   ```

2. **Verifique o console do navegador** para mensagens de erro específicas

3. **Use as ferramentas de dev do navegador:**
   - F12 → Network
   - Clique no botão do Google
   - Veja qual URL está sendo chamada
   - Verifique se o redirect_uri está correto

4. **Teste manualmente com curl:**
   ```bash
   curl "https://accounts.google.com/o/oauth2/v2/auth?client_id=SEU_ID&redirect_uri=http://localhost:3000/oauth-callback.html&response_type=code&scope=openid+email+profile"
   ```

## Referências

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2/web-server)
- [PKCE Flow](https://datatracker.ietf.org/doc/html/rfc7636)
- [OAuth Callback Mismatch](https://stackoverflow.com/questions/21938673/google-oauth-redirect-uri-mismatch-what-does-it-mean)
