import { Button, MaterialIcon } from "#/components/ui";
import type { AuthUser } from "#/types/auth";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";

type AdminSidebarProps = {
  authUser: AuthUser | null;
  avatarUrl: string;
  displayName: string;
  onLogout: () => void;
  onProfileClick?: () => void;
  profileLabel: string;
};

const navItems = [
  { icon: "dashboard", label: "Dashboard" },
  { icon: "group", label: "Residentes", to: "/residents" },
  { icon: "package_2", label: "Encomendas", to: "/deliveries" },
  { icon: "build", label: "Manutenção", to: "/occurrences" },
];

export function AdminSidebar({
  authUser,
  avatarUrl,
  displayName,
  onLogout,
  onProfileClick,
  profileLabel,
}: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isAdmin = (authUser?.profile ?? "").toLowerCase() === "administrador";

  return (
    <>
      <button
        aria-label="Abrir menu de navegação"
        className="fixed left-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface shadow-card md:hidden"
        onClick={() => setIsMobileMenuOpen(true)}
        type="button"
      >
        <MaterialIcon name="menu" />
      </button>

      {isMobileMenuOpen && (
        <button
          aria-label="Fechar menu de navegação"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          type="button"
        />
      )}

      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 rounded-tr-card rounded-br-card border-r border-outline-variant bg-surface-container-lowest text-sm font-medium shadow-card md:flex md:flex-col">
        <SidebarContent
          authUser={authUser}
          avatarUrl={avatarUrl}
          displayName={displayName}
          isAdmin={isAdmin}
          navItems={navItems}
          onLogout={onLogout}
          onNavItemClick={() => undefined}
          onProfileClick={onProfileClick}
          pathname={pathname}
          profileLabel={profileLabel}
        />
      </aside>

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-outline-variant bg-surface-container-lowest text-sm font-medium shadow-card transition-transform duration-300 md:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent
          authUser={authUser}
          avatarUrl={avatarUrl}
          displayName={displayName}
          isAdmin={isAdmin}
          navItems={navItems}
          onLogout={onLogout}
          onNavItemClick={() => setIsMobileMenuOpen(false)}
          onProfileClick={onProfileClick}
          pathname={pathname}
          profileLabel={profileLabel}
        />
      </aside>
    </>
  );
}

type SidebarContentProps = {
  authUser: AuthUser | null;
  avatarUrl: string;
  displayName: string;
  isAdmin: boolean;
  navItems: typeof navItems;
  onLogout: () => void;
  onNavItemClick: () => void;
  onProfileClick?: () => void;
  pathname: string;
  profileLabel: string;
};

function SidebarContent({
  authUser,
  avatarUrl,
  displayName,
  isAdmin,
  navItems,
  onLogout,
  onNavItemClick,
  onProfileClick,
  pathname,
  profileLabel,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col gap-y-4 p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary shadow-card">
            <MaterialIcon name="package_2" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-on-surface">
              Admin Portal
            </h1>
            <p className="text-xs text-on-surface-variant">Grand Residences</p>
          </div>
        </div>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = item.to
            ? pathname === item.to || pathname.startsWith(`${item.to}/`)
            : false;
          const className = isActive
            ? "flex w-full items-center gap-3 rounded-lg border-l-4 border-primary bg-surface px-4 py-2 text-primary shadow-card transition-all duration-200 ease-in-out"
            : "flex w-full items-center gap-3 rounded-lg px-4 py-2 text-on-surface-variant transition-all duration-200 ease-in-out hover:bg-surface-container-low hover:text-on-surface";

          if (item.label === "Residentes" && !isAdmin) {
            return (
              <div className="relative group" key={item.label}>
                <button
                  aria-disabled="true"
                  className={`${className} cursor-not-allowed`}
                  type="button"
                >
                  <MaterialIcon name={item.icon} />
                  <span className="flex-1">{item.label}</span>
                  <MaterialIcon
                    name="lock"
                    className="text-on-surface-variant"
                  />
                </button>
                <div className="pointer-events-none absolute left-full top-1/2 z-10 ml-3 w-56 -translate-y-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                  Você não tem permissão para acessar essa informação.
                </div>
              </div>
            );
          }

          if (item.to) {
            return (
              <Link
                className={className}
                key={item.label}
                onClick={onNavItemClick}
                to={item.to}
              >
                <MaterialIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          }

          return (
            <button
              className={className}
              key={item.label}
              onClick={onNavItemClick}
              type="button"
            >
              <MaterialIcon name={item.icon} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-outline-variant pt-6">
        <div className="flex items-center gap-3 px-2">
          <button
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left transition-colors duration-200 hover:bg-surface-container-low"
            onClick={onProfileClick}
            type="button"
          >
            <img
              alt={`Perfil de ${displayName}`}
              className="h-8 w-8 rounded-full object-cover"
              src={avatarUrl}
            />
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-xs font-bold text-on-surface">
                {displayName}
              </p>
              <span
                className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold leading-tight ${
                  authUser?.profile?.toLowerCase() === "administrador"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {profileLabel}
              </span>
            </div>
          </button>
          <Button
            aria-label="Sair da aplicação"
            className="h-9 w-9 shrink-0 rounded-full hover:bg-surface-container-low"
            color="transparent"
            onClick={onLogout}
            size="icon"
            title="Sair"
            type="button"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
