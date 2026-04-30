import { Button, Modal } from "#/components/ui";
import type { Delivery, DeliveryStats } from "../types/delivery";
import { formatDateTime, getStatusClasses } from "../utils/delivery-formatters";

type ReportModalProps = {
	deliveries: Delivery[];
	onClose: () => void;
	open: boolean;
	stats: DeliveryStats;
};

export function ReportModal({
	deliveries,
	onClose,
	open,
	stats,
}: ReportModalProps) {
	const statusDistribution = Array.from(
		deliveries.reduce((accumulator, delivery) => {
			const status = delivery.status ?? "Sem status";
			accumulator.set(status, (accumulator.get(status) ?? 0) + 1);
			return accumulator;
		}, new Map<string, number>()),
	);

	return (
		<Modal open={open} onClose={onClose} title="Relatório de Encomendas">
			<div className="grid grid-cols-2 gap-3">
				{[
					{ label: "Total", value: deliveries.length },
					{ label: "Recebidas hoje", value: stats.receivedToday },
					{ label: "Aguardando retirada", value: stats.waitingPickup },
					{ label: "No depósito", value: stats.inStorage },
				].map(({ label, value }) => (
					<div
						key={label}
						className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3"
					>
						<p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">
							{label}
						</p>
						<p className="text-2xl font-extrabold text-slate-900 mt-0.5">
							{value}
						</p>
					</div>
				))}
			</div>

			<div>
				<p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
					Por status
				</p>
				<div className="flex flex-col gap-1.5">
					{statusDistribution.map(([status, count]) => (
						<div
							key={status}
							className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
						>
							<span
								className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusClasses(status)}`}
							>
								<span className="w-1.5 h-1.5 bg-current rounded-full" />
								{status}
							</span>
							<span className="font-bold text-slate-700">{count}</span>
						</div>
					))}
					{deliveries.length === 0 && (
						<p className="text-sm text-slate-400 text-center py-2">
							Nenhuma encomenda registrada.
						</p>
					)}
				</div>
			</div>

			<div>
				<p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
					Últimas encomendas
				</p>
				<div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
					{deliveries.slice(0, 20).map((delivery) => (
						<div
							key={delivery.id}
							className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs"
						>
							<div className="flex flex-col min-w-0">
								<span className="font-semibold text-slate-800 truncate">
									{delivery.description || `Encomenda #${delivery.id}`}
								</span>
								<span className="text-slate-400 truncate">
									{delivery.recipient_username ??
										delivery.recipient_email ??
										"Sem destinatário"}{" "}
									· {formatDateTime(delivery.arrival_date)}
								</span>
							</div>
							<span
								className={`ml-3 shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusClasses(delivery.status)}`}
							>
								{delivery.status ?? "-"}
							</span>
						</div>
					))}
					{deliveries.length === 0 && (
						<p className="text-sm text-slate-400 text-center py-2">
							Nenhuma encomenda registrada.
						</p>
					)}
				</div>
			</div>

			<div className="flex justify-end pt-1">
				<Button color="secondary" size="md" onClick={onClose}>
					Fechar
				</Button>
			</div>
		</Modal>
	);
}
