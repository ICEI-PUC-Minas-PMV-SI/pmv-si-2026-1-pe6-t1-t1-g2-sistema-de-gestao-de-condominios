import { Button, MaterialIcon } from "#/components/ui";
import { X } from "lucide-react";
import type { ActiveFilter, Delivery } from "../types/delivery";
import {
	formatDateTime,
	getStatusClasses,
	getUserLabel,
} from "../utils/delivery-formatters";

type DeliveriesTableProps = {
	activeFilters: ActiveFilter[];
	deletePending: boolean;
	deliveries: Delivery[];
	errorMessage?: string;
	filteredDeliveries: Delivery[];
	isLoading: boolean;
	onClearFilters: () => void;
	onDeleteDelivery: (id: number) => void;
	onOpenFilterModal: () => void;
	onOpenReportModal: () => void;
	onRemoveFilter: (id: string) => void;
	showUsersWarning: boolean;
};

export function DeliveriesTable({
	activeFilters,
	deletePending,
	deliveries,
	errorMessage,
	filteredDeliveries,
	isLoading,
	onClearFilters,
	onDeleteDelivery,
	onOpenFilterModal,
	onOpenReportModal,
	onRemoveFilter,
	showUsersWarning,
}: DeliveriesTableProps) {
	return (
		<div className="bg-white rounded-[2.5rem] soft-shadow border border-slate-50 overflow-hidden">
			<div className="p-8 border-b border-slate-50 flex items-center justify-between">
				<h3 className="font-bold text-slate-900">Entregas Recentes</h3>
				<div className="flex items-center gap-2">
					<Button color="secondary" size="md" onClick={onOpenFilterModal}>
						Filtros
						{activeFilters.length > 0 && (
							<span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">
								{activeFilters.length}
							</span>
						)}
					</Button>
					<Button color="secondary" size="md" onClick={onOpenReportModal}>
						Relatório
					</Button>
				</div>
			</div>

			{activeFilters.length > 0 && (
				<div className="px-8 py-3 border-b border-slate-50 flex flex-wrap gap-2 items-center">
					<span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
						Filtros ativos:
					</span>
					{activeFilters.map((filter) => (
						<span
							key={filter.id}
							className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full"
						>
							{filter.label}
							<button
								aria-label={`Remover filtro ${filter.label}`}
								className="hover:text-primary/60 transition-colors"
								onClick={() => onRemoveFilter(filter.id)}
								type="button"
							>
								<X className="w-3 h-3" />
							</button>
						</span>
					))}
					<button
						className="text-[11px] text-slate-400 hover:text-slate-600 underline underline-offset-2 ml-1 transition-colors"
						onClick={onClearFilters}
						type="button"
					>
						Limpar todos
					</button>
				</div>
			)}

			<div className="overflow-x-auto">
				<table className="w-full text-left">
					<thead>
						<tr className="text-slate-400 text-[10px] uppercase tracking-widest bg-slate-50/50">
							<th className="px-8 py-4 font-bold">Destinatário</th>
							<th className="px-8 py-4 font-bold">Registrado por</th>
							<th className="px-8 py-4 font-bold">Descrição</th>
							<th className="px-8 py-4 font-bold">Status</th>
							<th className="px-8 py-4 font-bold">Data de Recebimento</th>
							<th className="px-8 py-4 font-bold">Data de Retirada</th>
							<th className="px-8 py-4 font-bold text-right">Ações</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-50">
						{isLoading ? (
							<tr>
								<td colSpan={7} className="text-center py-8 text-slate-400">
									Carregando...
								</td>
							</tr>
						) : errorMessage ? (
							<tr>
								<td colSpan={7} className="text-center py-8 text-error">
									{errorMessage}
								</td>
							</tr>
						) : filteredDeliveries.length === 0 ? (
							<tr>
								<td colSpan={7} className="text-center py-8 text-slate-400">
									Nenhuma encomenda encontrada.
								</td>
							</tr>
						) : (
							filteredDeliveries.map((delivery) => (
								<tr
									key={delivery.id}
									className="group hover:bg-slate-50/50 transition-colors"
								>
									<td className="px-8 py-5">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
												<MaterialIcon name="person" />
											</div>
											<span className="font-bold text-slate-900 text-sm">
												{getUserLabel(
													{
														username: delivery.recipient_username,
														email: delivery.recipient_email,
													},
													delivery.recipient_user_id,
												)}
											</span>
										</div>
									</td>
									<td className="px-8 py-5">
										<span className="text-sm text-slate-600 font-medium">
											{getUserLabel(
												{
													username: delivery.registered_by_username,
													email: delivery.registered_by_email,
												},
												delivery.registered_by_user_id,
											)}
										</span>
									</td>
									<td className="px-8 py-5">
										<span className="line-clamp-2 text-sm text-slate-600">
											{delivery.description || "-"}
										</span>
									</td>
									<td className="px-8 py-5">
										<span
											className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${getStatusClasses(delivery.status)}`}
										>
											<span className="w-1.5 h-1.5 bg-current rounded-full" />
											{delivery.status ?? "-"}
										</span>
									</td>
									<td className="px-8 py-5 text-sm text-slate-500 font-medium">
										{formatDateTime(delivery.arrival_date)}
									</td>
									<td className="px-8 py-5 text-sm text-slate-500 font-medium">
										{formatDateTime(delivery.pickup_date)}
									</td>
									<td className="px-8 py-5 text-right">
										<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
											<button
												className="p-2 text-slate-400 hover:text-error transition-colors disabled:opacity-50"
												disabled={deletePending}
												onClick={() => onDeleteDelivery(delivery.id)}
												type="button"
											>
												<MaterialIcon name="delete" className="text-xl" />
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			<div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
				<p className="text-xs text-slate-500 font-medium">
					Mostrando {filteredDeliveries.length} de {deliveries.length}{" "}
					encomendas
				</p>
				{showUsersWarning && (
					<p className="text-xs text-amber-600 font-medium">
						Nomes de usuários indisponíveis para este perfil.
					</p>
				)}
			</div>
		</div>
	);
}
