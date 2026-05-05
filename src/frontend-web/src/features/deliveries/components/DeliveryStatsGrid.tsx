import { MaterialIcon } from "#/components/ui";
import type { DeliveryStats } from "../types/delivery";

type DeliveryStatsGridProps = {
	totalDeliveries: number;
	stats: DeliveryStats;
};

const cards = [
	{
		key: "receivedToday",
		icon: "inventory_2",
		iconClass: "bg-blue-50 text-blue-600",
		label: "Total Recebido (Hoje)",
	},
	{
		key: "waitingPickup",
		icon: "pending_actions",
		iconClass: "bg-amber-50 text-amber-600",
		label: "Aguardando Retirada",
	},
	{
		key: "pickedUpToday",
		icon: "check_circle",
		iconClass: "bg-slate-50 text-slate-600",
		label: "Retiradas (Hoje)",
	},
] as const;

export function DeliveryStatsGrid({
	totalDeliveries,
	stats,
}: DeliveryStatsGridProps) {
	const storagePercent = totalDeliveries
		? (stats.inStorage / totalDeliveries) * 100
		: 0;

	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
			{cards.map((card) => (
				<div
					className="bg-white p-4 rounded-[2rem] soft-shadow border border-slate-50 md:p-6"
					key={card.key}
				>
					<div className="flex items-center justify-between mb-4">
						<div
							className={`w-10 h-10 rounded-full flex items-center justify-center ${card.iconClass}`}
						>
							<MaterialIcon name={card.icon} />
						</div>
					</div>
					<p className="text-slate-500 text-xs font-medium">{card.label}</p>
					<p className="text-2xl font-extrabold text-slate-900">
						{stats[card.key]}
					</p>
				</div>
			))}

			<div className="bg-primary text-white p-4 rounded-[2rem] shadow-xl shadow-primary/20 relative overflow-hidden md:p-6">
				<div className="relative z-10">
					<p className="text-primary-fixed text-xs font-medium opacity-80">
						Encomendas no Depósito
					</p>
					<p className="text-2xl font-extrabold mt-1">{stats.inStorage}</p>
					<div className="w-full bg-white/20 h-1.5 rounded-full mt-4">
						<div
							className="bg-white h-full rounded-full"
							style={{ width: `${storagePercent}%` }}
						/>
					</div>
				</div>
				<div className="absolute -right-4 -bottom-4 opacity-10">
					<MaterialIcon name="warehouse" className="text-8xl" />
				</div>
			</div>
		</div>
	);
}
