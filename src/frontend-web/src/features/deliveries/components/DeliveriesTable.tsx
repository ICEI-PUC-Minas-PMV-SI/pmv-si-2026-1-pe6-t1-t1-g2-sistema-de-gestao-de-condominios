import { Button, MaterialIcon } from "#/components/ui";
import { Pencil, X } from "lucide-react";
import type { ActiveFilter, Delivery } from "../types/delivery";
import type { AuthUser } from "#/types/auth";
import {
	formatDateTime,
	getStatusClasses,
	getUserLabel,
} from "../utils/delivery-formatters";

type DeliveriesTableProps = {
	activeFilters: ActiveFilter[];
	authUser: AuthUser | null;
	deletePending: boolean;
	deliveries: Delivery[];
	errorMessage?: string;
	filteredDeliveries: Delivery[];
	isLoading: boolean;
	onClearFilters: () => void;
	onDeleteDelivery: (id: number) => void;
	onEditDelivery: (delivery: Delivery) => void;
	onOpenFilterModal: () => void;
	onOpenReportModal: () => void;
	onRemoveFilter: (id: string) => void;
	showUsersWarning: boolean;
};

function isAdmin(profile: string | null | undefined): boolean {
	return profile?.toLowerCase() === "administrador";
}

export function DeliveriesTable({
	activeFilters,
	authUser,
	deletePending,
	deliveries,
	errorMessage,
	filteredDeliveries,
	isLoading,
	onClearFilters,
	onDeleteDelivery,
	onEditDelivery,
	onOpenFilterModal,
	onOpenReportModal,
	onRemoveFilter,
	showUsersWarning,
}: DeliveriesTableProps) {
	const userIsAdmin = isAdmin(authUser?.profile);

	return (
		<div className="bg-white rounded-[2.5rem] soft-shadow border border-slate-50 overflow-hidden">
			<div className="flex flex-col gap-4 border-b border-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
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
					<span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mr-1">
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

			<div className="overflow-x-auto -mx-4 md:mx-0">
				<table className="min-w-[960px] w-full text-left">
					<thead>
						<tr className="text-slate-400 text-[10px] uppercase tracking-widest bg-slate-50/50">
							<th className="px-4 py-4 font-bold md:px-6 lg:px-8">Destinatário</th>
							<th className="px-4 py-4 font-bold md:px-6 lg:px-8">Registrado por</th>
							<th className="px-4 py-4 font-bold md:px-6 lg:px-8">Descrição</th>
							<th className="px-4 py-4 font-bold md:px-6 lg:px-8">Status</th>
							<th className="px-4 py-4 font-bold md:px-6 lg:px-8">Data de Recebimento</th>
							<th className="px-4 py-4 font-bold md:px-6 lg:px-8">Data de Retirada</th>
							<th className="px-4 py-4 font-bold text-right md:px-6 lg:px-8">Ações</th>
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
									<td className="px-4 py-5 md:px-6 lg:px-8">
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
									<td className="px-4 py-5 md:px-6 lg:px-8">
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
									<td className="px-4 py-5 md:px-6 lg:px-8">
										<span className="line-clamp-2 text-sm text-slate-600">
											{delivery.description || "-"}
										</span>
									</td>
									<td className="px-4 py-5 md:px-6 lg:px-8">
										<span
											className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${getStatusClasses(delivery.status)}`}
										>
											<span className="w-1.5 h-1.5 bg-current rounded-full" />
											{delivery.status ?? "-"}
										</span>
									</td>
									<td className="px-4 py-5 text-sm font-medium text-slate-500 md:px-6 lg:px-8">
										{formatDateTime(delivery.arrival_date)}
									</td>
									<td className="px-4 py-5 text-sm font-medium text-slate-500 md:px-6 lg:px-8">
										{formatDateTime(delivery.pickup_date)}
									</td>
									<td className="px-4 py-5 text-right md:px-6 lg:px-8">
										{userIsAdmin ? (
											<div className="flex items-center justify-end gap-2">
												<button
													className="p-2 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
													onClick={() => onEditDelivery(delivery)}
													type="button"
												>
													<Pencil className="text-xl" />
												</button>
												<button
													className="p-2 text-slate-400 hover:text-error transition-colors disabled:opacity-50"
													disabled={deletePending}
													onClick={() => onDeleteDelivery(delivery.id)}
													type="button"
												>
													<MaterialIcon name="delete" className="text-xl" />
												</button>
											</div>
										) : (
											<div className="flex items-center justify-end">
												<span className="text-xs text-slate-400 italic">
													Apenas leitura
												</span>
											</div>
										)}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			<div className="flex flex-col gap-2 border-t border-slate-50 bg-slate-50/50 p-6 sm:flex-row sm:items-center sm:justify-between">
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
