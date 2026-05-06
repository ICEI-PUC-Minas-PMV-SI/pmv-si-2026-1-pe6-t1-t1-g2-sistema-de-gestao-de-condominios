# Frontend Web - Sistema de Gestão de Condomínios

## 🚀 Configuração de Ambiente

### Variáveis de Ambiente Necessárias

Este projeto usa Vite e requer as seguintes variáveis de ambiente:

#### Desenvolvimento Local

1. **Copie o template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure as variáveis em `.env.local`:**
   ```env
   # URL do backend (desenvolvimento local)
   VITE_BACKEND_URL="http://localhost:5219"
   
   # Google OAuth Client ID (deve ser criado no Google Cloud Console)
   VITE_GOOGLE_CLIENT_ID="seu-client-id-aqui"
   ```

### 🔐 Como Obter o Google OAuth Client ID

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Vá para **APIs & Services** → **Credentials**
4. Clique em **Create Credentials** → **OAuth 2.0 Client ID**
5. Selecione **Web application**
6. Configure as **Authorized redirect URIs**:
   - `http://localhost:3000` (desenvolvimento local)
   - `http://localhost:8888` (Netlify dev)
   - `https://seu-dominio.com` (produção)
7. Copie o **Client ID** para `.env.local`

### 🏗️ Instalação e Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar desenvolvimento (porta 3000 ou 8888 com Netlify dev)
npm run dev

# Build para produção
npm run build

# Rodar servidor de produção localmente
npm run preview
```

### 📦 Estrutura de Variáveis

| Arquivo | Uso | Descrição |
|---------|-----|-----------|
| `.env` | Base compartilhada | Variáveis padrão (commitado) |
| `.env.local` | Desenvolvimento local | Sobrescreve `.env` (GITIGNORED) |
| `.env.production` | Build de produção | Usado com `npm run build` |

### 🌐 Netlify Deployment

Para deploiar com variáveis de ambiente:

1. **Netlify Dashboard**:
   - Vá para **Site settings** → **Build & deploy** → **Environment**
   - Adicione as variáveis:
     ```
     VITE_BACKEND_URL = https://api-producao.com
     VITE_GOOGLE_CLIENT_ID = seu-prod-client-id
     ```

2. **Netlify CLI** (local):
   ```bash
   netlify dev  # Usa .env.local
   netlify build # Usa .env.production
   ```

### ⚠️ Segurança

- ✅ `.env.local` está em `.gitignore` (nunca commitar credenciais)
- ✅ Use Client IDs separados para desenvolvimento e produção
- ✅ Use `HTTPS` em produção
- ✅ Nunca compartilhe credenciais em repositórios públicos

### 🔗 Integração com Backend

O frontend se comunica com o backend via:

- **Endpoint de Login Social**: `POST /api/Users/exchange-code`
- **Endpoint de Autenticação**: `POST /api/Users/auth`
- **Endpoint do Usuário**: `GET /api/Users/me`

O URL base é configurado por `VITE_BACKEND_URL`.

### 📝 Notas

- Variáveis com prefixo `VITE_` são expostas ao navegador
- Variáveis sem prefixo `VITE_` NÃO são acessíveis ao cliente
- Use `import.meta.env.VITE_*` para acessar no código
