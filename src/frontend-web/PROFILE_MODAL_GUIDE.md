# Profile Configuration Modal - Guia de Uso

Este guia explica como adicionar o modal de configurações de perfil em qualquer página que use `AdminSidebar`.

## Componentes Envolvidos

### 1. **ProfileConfigModal** (`#/components/modals/ProfileConfigModal.tsx`)

Componente modal que exibe as configurações de perfil do usuário.

### 2. **useProfileModal** (`#/hooks/useProfileModal.ts`)

Hook customizado que gerencia o estado do modal (aberto/fechado).

## Como Usar em Sua Página

### Passo 1: Importar os componentes necessários

```tsx
import { AdminSidebar } from "#/components/layout/AdminSidebar";
import { ProfileConfigModal } from "#/components/modals/ProfileConfigModal";
import { useProfileModal } from "#/hooks/useProfileModal";
```

### Passo 2: Inicializar o hook na sua página

```tsx
export function MinhaPagina() {
  const profileModal = useProfileModal();
  // ... resto da lógica
```

### Passo 3: Conectar ao AdminSidebar

```tsx
<AdminSidebar
  authUser={authUser}
  avatarUrl={avatarUrl}
  displayName={displayName}
  onLogout={handleLogout}
  onProfileClick={profileModal.open} // ← Passa a função de abrir o modal
  profileLabel={profileLabel}
/>
```

### Passo 4: Renderizar o modal

```tsx
<ProfileConfigModal
  authUser={authUser}
  isOpen={profileModal.isOpen} // ← Estado do modal
  onClose={profileModal.close} // ← Função para fechar
/>
```

## Exemplo Completo

```tsx
import { AdminSidebar } from "#/components/layout/AdminSidebar";
import { AdminTopbar } from "#/components/layout/AdminTopbar";
import { ProfileConfigModal } from "#/components/modals/ProfileConfigModal";
import { useProfileModal } from "#/hooks/useProfileModal";
import { useState, useEffect } from "react";
import { getAuthUser } from "#/services/auth-service";
import type { AuthUser } from "#/types/auth";

export function MinhaPagina() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const profileModal = useProfileModal();

  useEffect(() => {
    setAuthUser(getAuthUser());
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* Sidebar com suporte ao modal */}
      <AdminSidebar
        authUser={authUser}
        avatarUrl={getAvatarUrl(authUser?.username)}
        displayName={authUser?.username || "Usuário"}
        onLogout={handleLogout}
        onProfileClick={profileModal.open}
        profileLabel={getProfileLabel(authUser?.profile)}
      />

      {/* Topbar */}
      <AdminTopbar
        authUser={authUser}
        displayName={authUser?.username || "Usuário"}
        {...otherProps}
      />

      {/* Conteúdo principal */}
      <main className="ml-64 p-8">{/* Seu conteúdo aqui */}</main>

      {/* Modal de Configurações */}
      <ProfileConfigModal
        authUser={authUser}
        isOpen={profileModal.isOpen}
        onClose={profileModal.close}
      />
    </div>
  );
}
```

## API do Hook `useProfileModal`

```typescript
const profileModal = useProfileModal();

// Propriedades:
profileModal.isOpen; // boolean - Se o modal está aberto
profileModal.open; // () => void - Abre o modal
profileModal.close; // () => void - Fecha o modal
profileModal.toggle; // () => void - Alterna estado do modal
```

## Notas Importantes

- O hook gerencia apenas o estado de visibilidade do modal
- A lógica de atualização de perfil está dentro do `ProfileConfigModal`
- O modal aceita `authUser` para preencher os dados atuais
- O modal é responsável por chamar a API de atualização quando o usuário salva

## Migração de Código Antigo

Se você tem código usando `ConfiguracoesModal` do diretório `deliveries`:

```tsx
// ❌ Antigo (ainda funciona mas deprecated)
import { ConfiguracoesModal } from "#/features/deliveries/components/ConfiguracoesModal";

// ✅ Novo (recomendado)
import { ProfileConfigModal } from "#/components/modals/ProfileConfigModal";
```

O arquivo antigo ainda funciona como um wrapper para compatibilidade backward, mas será removido em versões futuras.
