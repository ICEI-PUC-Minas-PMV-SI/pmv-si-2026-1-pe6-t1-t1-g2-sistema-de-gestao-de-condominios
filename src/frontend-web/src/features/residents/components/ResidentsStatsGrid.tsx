import { MaterialIcon } from "#/components/ui";
import type { ResidentStats } from "../types/resident";
import { formatNumber } from "../utils/resident-formatters";

type ResidentsStatsGridProps = {
	stats: ResidentStats;
	onReportClick?: () => void;
};

const cards = [
	{
		key: "totalResidents",
		icon: "group",
		iconClass: "bg-blue-50 text-blue-600",
		label: "Total de Residentes",
	},
	{
		key: "newThisMonth",
		icon: "person_add",
		iconClass: "bg-emerald-50 text-emerald-600",
		label: "Novos este Mês",
	},
	{
		key: "pendingRequests",
		icon: "description",
		iconClass: "bg-orange-50 text-orange-500",
		label: "Solicitações Pendentes",
	},
] as const;

export function ResidentsStatsGrid({ stats, onReportClick }: ResidentsStatsGridProps) {
	return (
		<section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
			{cards.map((card) => (
				<button
					className="bg-white p-4 rounded-[2rem] soft-shadow border border-slate-50 flex items-center gap-4 hover:shadow-md transition-shadow text-left md:p-6"
					key={card.key}
					onClick={card.key === "pendingRequests" ? onReportClick : undefined}
					disabled={card.key !== "pendingRequests"}
					type="button"
				>
					<div className={`p-4 rounded-2xl ${card.iconClass}`}>
						<MaterialIcon name={card.icon} />
					</div>
					<div>
						<p className="text-sm text-slate-500">{card.label}</p>
						<p className="text-2xl font-bold text-slate-800">
							{formatNumber(stats[card.key])}
						</p>
					</div>
				</button>
			))}
		</section>
	);
}
