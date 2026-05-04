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
      <header className="flex justify-between items-center px-6 py-3 sticky top-0 z-40 bg-white/90 backdrop-blur-md font-manrope text-sm antialiased shadow-sm border-b border-slate-100 ml-64 w-[calc(100%-16rem)]">
        <div className="flex-1">
          {showSearch && (
            <div className="flex items-center bg-slate-50 rounded-full px-4 py-1.5 w-96 border border-slate-100 transition-all focus-within:ring-2 focus-within:ring-primary/20">
              <MaterialIcon
                name="search"
                className="text-slate-400 text-sm mr-2"
              />
              <input
                className="bg-transparent border-none text-xs focus:ring-0 w-full text-slate-600 placeholder:text-slate-400"
                onChange={(event) => onSearchTermChange?.(event.target.value)}
                placeholder={placeholder}
                type="text"
                value={searchTerm}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative"
            type="button"
          >
            <MaterialIcon name="notifications" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border-2 border-white" />
          </button>
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
