import { LogOut } from "lucide-react";
import { Button } from "#/components/ui";
import type { AuthUser } from "#/types/auth";
import { MaterialIcon } from "./MaterialIcon";

type DeliverySidebarProps = {
	authUser: AuthUser | null;
	avatarUrl: string;
	displayName: string;
	onLogout: () => void;
	onProfileClick: () => void;
	profileLabel: string;
};

const navItems = [
	{ icon: "dashboard", label: "Dashboard", active: false },
	{ icon: "group", label: "Residents", active: false },
	{ icon: "package_2", label: "Deliveries", active: true },
	{ icon: "build", label: "Maintenance", active: false },
];

export function DeliverySidebar({
	authUser,
	avatarUrl,
	displayName,
	onLogout,
	onProfileClick,
	profileLabel,
}: DeliverySidebarProps) {
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
					{navItems.map((item) => (
						<button
							className={
								item.active
									? "flex w-full items-center gap-3 text-primary bg-surface shadow-card rounded-lg py-2 px-4 border-l-4 border-primary transition-all duration-200 ease-in-out"
									: "flex w-full items-center gap-3 text-on-surface-variant py-2 px-4 hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out"
							}
							key={item.label}
							type="button"
						>
							<MaterialIcon name={item.icon} />
							<span>{item.label}</span>
						</button>
					))}
				</nav>
				<div className="mt-auto pt-6 border-t border-outline-variant">
					<button
						className="flex items-center gap-3 px-2 w-full rounded-lg hover:bg-surface-container-low transition-colors text-left"
						onClick={onProfileClick}
						type="button"
					>
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
								className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold leading-tight ${
									authUser?.profile?.toLowerCase() === "administrador"
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
					</button>
				</div>
			</div>
		</aside>
	);
}
