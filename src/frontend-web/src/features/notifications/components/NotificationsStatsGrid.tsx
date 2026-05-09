import { MaterialIcon } from "#/components/ui";
import type { NotificationStats } from "../types/notification";

type NotificationsStatsGridProps = {
	stats: NotificationStats;
};

const statCards = [
	{
		key: "total",
		icon: "notifications",
		iconClass: "bg-blue-50 text-blue-700",
		label: "Total",
	},
	{
		key: "unread",
		icon: "mark_email_unread",
		iconClass: "bg-amber-50 text-amber-700",
		label: "Nao lidas",
	},
	{
		key: "read",
		icon: "done_all",
		iconClass: "bg-emerald-50 text-emerald-700",
		label: "Lidas",
	},
	{
		key: "delivery",
		icon: "package_2",
		iconClass: "bg-slate-100 text-slate-700",
		label: "Encomendas",
	},
] as const;

export function NotificationsStatsGrid({ stats }: NotificationsStatsGridProps) {
	return (
		<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
			{statCards.map((card) => (
				<div
					className="bg-white p-6 rounded-[2rem] soft-shadow border border-slate-50"
					key={card.key}
				>
					<div
						className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${card.iconClass}`}
					>
						<MaterialIcon name={card.icon} />
					</div>
					<p className="text-slate-500 text-xs font-medium">{card.label}</p>
					<p className="text-2xl font-extrabold text-slate-900 mt-1">
						{stats[card.key]}
					</p>
				</div>
			))}
		</div>
	);
}
