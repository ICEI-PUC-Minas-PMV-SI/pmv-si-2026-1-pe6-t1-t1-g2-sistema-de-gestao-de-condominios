import { useState } from "react";

/**
 * Hook customizado para gerenciar o estado do modal de configurações de perfil.
 * Pode ser usado em qualquer página que tenha AdminSidebar.
 *
 * @example
 * ```tsx
 * const profileModal = useProfileModal();
 *
 * return (
 *   <>
 *     <AdminSidebar
 *       onProfileClick={profileModal.open}
 *       {...otherProps}
 *     />
 *     <ProfileConfigModal
 *       isOpen={profileModal.isOpen}
 *       onClose={profileModal.close}
 *       authUser={authUser}
 *     />
 *   </>
 * );
 * ```
 */
export function useProfileModal() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
