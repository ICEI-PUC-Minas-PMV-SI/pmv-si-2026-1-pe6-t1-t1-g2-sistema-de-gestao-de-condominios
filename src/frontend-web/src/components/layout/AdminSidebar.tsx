import { Button, MaterialIcon } from "#/components/ui";
import type { AuthUser } from "#/types/auth";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

type AdminSidebarProps = {
	authUser: AuthUser | null;
	avatarUrl: string;
	displayName: string;
	onLogout: () => void;
	profileLabel: string;
};

const navItems = [
	{ icon: "dashboard", label: "Dashboard" },
	{ icon: "group", label: "Residentes", to: "/residents" },
	{ icon: "package_2", label: "Encomendas", to: "/deliveries" },
	{ icon: "build", label: "Manutenção", to: "/occurrences" },
	{ icon: "settings", label: "Configurações" },
];

export function AdminSidebar({
	authUser,
	avatarUrl,
	displayName,
	onLogout,
	profileLabel,
}: AdminSidebarProps) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const isAdmin = (authUser?.profile ?? "").toLowerCase() === "administrador";

	return (
		<aside className="h-screen w-64 fixed left-0 top-0 border-r border-outline-variant bg-surface-container-lowest text-sm font-medium z-50 rounded-tr-card rounded-br-card shadow-card">
			<div className="flex flex-col gap-y-4 p-6 h-full">
				<div className="mb-8">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-card">
							<MaterialIcon name="package_2" />
						</div>
						<div>
							<h1 className="text-lg font-extrabold text-on-surface tracking-tight">
								Admin Portal
							</h1>
							<p className="text-xs text-on-surface-variant">
								Grand Residences
							</p>
						</div>
					</div>
				</div>
				<nav className="space-y-1">
					{navItems.map((item) => {
						const isActive = item.to
							? pathname === item.to || pathname.startsWith(`${item.to}/`)
							: false;
						const className = isActive
							? "flex w-full items-center gap-3 text-primary bg-surface shadow-card rounded-lg py-2 px-4 border-l-4 border-primary transition-all duration-200 ease-in-out"
							: "flex w-full items-center gap-3 text-on-surface-variant py-2 px-4 hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out";

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
								<Link className={className} key={item.label} to={item.to}>
									<MaterialIcon name={item.icon} />
									<span>{item.label}</span>
								</Link>
							);
						}

						return (
							<button className={className} key={item.label} type="button">
								<MaterialIcon name={item.icon} />
								<span>{item.label}</span>
							</button>
						);
					})}
				</nav>
				<div className="mt-auto pt-6 border-t border-outline-variant">
					<div className="flex items-center gap-3 px-2">
						<img
							alt={`Perfil de ${displayName}`}
							className="w-8 h-8 rounded-full object-cover"
							src={avatarUrl}
						/>
						<div className="min-w-0 flex-1 overflow-hidden">
							<p className="text-xs font-bold truncate text-on-surface">
								{displayName}
							</p>
							<span
								className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold leading-tight ${authUser?.profile?.toLowerCase() === "administrador"
										? "bg-blue-100 text-blue-700"
										: "bg-emerald-100 text-emerald-700"
									}`}
							>
								{profileLabel}
							</span>
						</div>
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
		</aside>
	);
}
