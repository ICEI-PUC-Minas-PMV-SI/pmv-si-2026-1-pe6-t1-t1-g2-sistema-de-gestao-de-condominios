import { Button, MaterialIcon } from "#/components/ui";
import { useState } from "react";
import type { Resident, ResidentFilter, ResidentPagination } from "../types/resident";
import {
	formatNumber,
	getStatusClasses,
	getStatusDotClass,
} from "../utils/resident-formatters";

type ResidentsTableProps = {
	filteredResidents: Resident[];
	errorMessage?: string;
	isLoading: boolean;
	onFilterChange: (filter: ResidentFilter) => void;
	onOpenEditModal?: (resident: Resident) => void;
	onOpenDeleteConfirm?: (residentId: number) => void;
	onOpenReportModal?: () => void;
	residents: Resident[];
	selectedFilter: ResidentFilter;
	totalResidents: number;
	pagination: ResidentPagination;
};

export function ResidentsTable({
	filteredResidents,
	errorMessage,
	isLoading,
	onFilterChange,
	onOpenEditModal,
	onOpenDeleteConfirm,
	residents,
	selectedFilter,
	totalResidents,
	pagination,
	onOpenReportModal,
}: ResidentsTableProps) {
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [actionMenuId, setActionMenuId] = useState<number | null>(null);

	const filterOptions: Array<{ label: string; value: ResidentFilter }> = [
		{ label: "Todos", value: "all" },
		{ label: "Somente administradores", value: "admins" },
		{ label: "Somente moradores", value: "residents" },
		{ label: "Ativos", value: "active" },
		{ label: "Inativos", value: "inactive" },
	];

	return (
		<section className="bg-white rounded-[2.5rem] soft-shadow border border-slate-50 overflow-hidden">
			<div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
				<h2 className="text-xl font-bold text-slate-800">Todos os Residentes</h2>
				<div className="flex gap-3">
					<div className="relative">
						<Button
							color="secondary"
							icon={<MaterialIcon name="filter_alt" />}
							size="md"
							type="button"
							onClick={() => setFiltersOpen((open) => !open)}
						>
							Filtros
						</Button>
						{filtersOpen && (
							<div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg z-10">
								{filterOptions.map((option) => {
									const isSelected = selectedFilter === option.value;
									return (
										<button
											key={option.value}
											className={`w-full px-4 py-2 text-left text-sm transition-colors ${isSelected
												? "bg-slate-100 text-slate-900 font-semibold"
												: "text-slate-600 hover:bg-slate-50"
												}`}
											onClick={() => {
												onFilterChange(option.value);
												setFiltersOpen(false);
											}}
											type="button"
										>
											{option.label}
										</button>
									);
								})}
							</div>
						)}
					</div>
					<Button
						color="secondary"
						icon={<MaterialIcon name="description" />}
						size="md"
						type="button"
						onClick={onOpenReportModal}
					>
						Relatório
					</Button>
				</div>
			</div>
			<div className="overflow-x-auto -mx-4 md:mx-0">
				<table className="min-w-[860px] w-full text-left border-collapse">
					<thead>
						<tr className="border-y border-slate-100 bg-slate-50/50">
							<th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-300 md:px-6 lg:px-8">
								Nome
							</th>
							<th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-300 md:px-6 lg:px-8">
								Unidade/Bloco
							</th>
							<th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-300 md:px-6 lg:px-8">
								Contato
							</th>
							<th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-300 md:px-6 lg:px-8">
								Status
							</th>
							<th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-300 md:px-6 lg:px-8">
								Ações
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{isLoading ? (
							<tr>
								<td colSpan={5} className="text-center py-10 text-slate-400">
									Carregando...
								</td>
							</tr>
						) : errorMessage ? (
							<tr>
								<td colSpan={5} className="text-center py-10 text-error">
									{errorMessage}
								</td>
							</tr>
						) : filteredResidents.length === 0 ? (
							<tr>
								<td colSpan={5} className="text-center py-10 text-slate-400">
									Nenhum residente encontrado.
								</td>
							</tr>
						) : (
							filteredResidents.map((resident) => (
								<tr
									className="hover:bg-slate-50/80 transition-colors group"
									key={resident.id}
								>
									<td className="px-4 py-6 md:px-6 lg:px-8">
										<div className="flex items-center gap-4">
											<div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
												<MaterialIcon name="person" />
											</div>
											<div>
												<p className="font-semibold text-slate-800">
													{resident.name}
												</p>
												<p className="text-xs text-slate-400">
													{resident.memberSince}
												</p>
											</div>
										</div>
									</td>
									<td className="px-4 py-6 md:px-6 lg:px-8">
										<p className="text-slate-600 font-medium">
											{resident.unit}
										</p>
									</td>
									<td className="px-4 py-6 md:px-6 lg:px-8">
										{resident.phone && resident.phone !== "-" ? (
											<>
												<p className="text-slate-700 text-sm">
													{resident.phone}
												</p>
												<p className="text-xs text-slate-400">
													{resident.email}
												</p>
											</>
										) : (
											<p className="text-slate-700 text-sm">
												{resident.email}
											</p>
										)}
									</td>
									<td className="px-4 py-6 md:px-6 lg:px-8">
										<span
											className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusClasses(resident.status)}`}
										>
											<span
												className={`w-1.5 h-1.5 rounded-full ${getStatusDotClass(resident.status)}`}
											/>
											{resident.status}
										</span>
									</td>
									<td className="px-4 py-6 text-right md:px-6 lg:px-8">
										<div className="relative">
											<button
												className="text-slate-300 group-hover:text-slate-500 transition-colors hover:bg-slate-100 p-2 rounded-lg"
												onClick={() =>
													setActionMenuId(
														actionMenuId === resident.id
															? null
															: resident.id,
													)
												}
												type="button"
											>
												<MaterialIcon name="more_horiz" />
											</button>
											{actionMenuId === resident.id && (
												<div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-slate-200 bg-white shadow-lg z-20">
													<button
														className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
														onClick={() => {
															onOpenEditModal?.(resident);
															setActionMenuId(null);
														}}
														type="button"
													>
														<MaterialIcon name="edit" className="text-sm" />
														Editar
													</button>
													<button
														className="w-full px-4 py-2 text-left text-sm text-error hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-slate-100"
														onClick={() => {
															onOpenDeleteConfirm?.(resident.id);
															setActionMenuId(null);
														}}
														type="button"
													>
														<MaterialIcon name="delete" className="text-sm" />
														Excluir
													</button>
												</div>
											)}
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			<div className="px-8 py-6 flex items-center justify-between border-t border-slate-100">
				<p className="text-sm text-slate-500">
					Mostrando{" "}
					<span className="font-bold text-slate-800">
						{formatNumber(filteredResidents.length)}
					</span>{" "}
					de{" "}
					<span className="font-bold text-slate-800">
						{formatNumber(filteredResidents.length)}
					</span>{" "}
					residentes
				</p>
				<nav className="flex items-center gap-1">
					<button
						className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50"
						type="button"
					>
						<MaterialIcon name="chevron_left" />
					</button>
					<button
						className="w-10 h-10 flex items-center justify-center bg-[#3949AB] text-white font-bold rounded-lg shadow-sm"
						type="button"
					>
						{pagination.currentPage}
					</button>
					{pagination.totalPages >= 2 && (
						<button
							className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-medium rounded-lg"
							type="button"
						>
							2
						</button>
					)}
					{pagination.totalPages >= 3 && (
						<button
							className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-medium rounded-lg"
							type="button"
						>
							3
						</button>
					)}
					<button
						className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50"
						type="button"
					>
						<MaterialIcon name="chevron_right" />
					</button>
				</nav>
			</div>
		</section>
	);
}
