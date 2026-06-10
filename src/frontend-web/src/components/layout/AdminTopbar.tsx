import { MaterialIcon, Modal } from "#/components/ui";
import type { AuthUser } from "#/types/auth";
import { useState } from "react";

type AdminTopbarProps = {
  authUser?: AuthUser | null;
  avatarUrl?: string;
  displayName?: string;
  profileLabel?: string;
  onSearchTermChange?: (value: string) => void;
  searchTerm?: string;
  placeholder?: string;
  showSearch?: boolean;
};

export function AdminTopbar({
  authUser = null,
  avatarUrl = "",
  displayName = "Usuário",
  profileLabel = "",
  onSearchTermChange,
  searchTerm = "",
  placeholder = "Filtrar por morador, descrição ou status...",
  showSearch = Boolean(onSearchTermChange),
}: AdminTopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <header className="flex justify-between items-center gap-4 pl-20 pr-4 py-3 sticky top-0 z-40 bg-white/90 backdrop-blur-md font-manrope text-sm antialiased shadow-sm border-b border-slate-100 md:ml-64 md:w-[calc(100%-16rem)] md:px-6">
        <div className="min-w-0 flex-1">
          {showSearch && (
            <div className="flex w-full items-center bg-slate-50 rounded-full px-4 py-1.5 max-w-full border border-slate-100 transition-all focus-within:ring-2 focus-within:ring-primary/20 sm:max-w-xs md:max-w-sm lg:w-96 lg:max-w-none">
              <MaterialIcon
                name="search"
                className="text-slate-400 text-sm mr-2"
              />
              <input
                className="bg-transparent border-none text-xs w-full text-slate-600 placeholder:text-slate-400"
                onChange={(event) => onSearchTermChange?.(event.target.value)}
                placeholder={placeholder}
                type="text"
                value={searchTerm}
              />
            </div>
          )}
        </div>
      </header>
      <Modal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="Informacoes do usuario"
      >
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              alt={`Perfil de ${displayName}`}
              className="w-14 h-14 rounded-full object-cover"
              src={avatarUrl}
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <MaterialIcon name="person" />
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-on-surface">
              {displayName}
            </p>
            {profileLabel && (
              <span className="mt-1 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {profileLabel}
              </span>
            )}
          </div>
        </div>
        <div className="grid gap-3 text-sm text-slate-600">
          <div className="flex flex-col">
            <span className="text-xs uppercase text-slate-400">Email</span>
            <span className="font-medium text-slate-700">
              {authUser?.email ?? "-"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase text-slate-400">ID</span>
            <span className="font-medium text-slate-700">
              {authUser?.id ?? "-"}
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
