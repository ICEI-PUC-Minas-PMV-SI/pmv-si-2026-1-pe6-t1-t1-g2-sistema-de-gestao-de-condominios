import { Button, MaterialIcon, Modal } from "#/components/ui";
import type { Resident } from "../types/resident";
import { formatNumber } from "../utils/resident-formatters";

type ReportModalProps = {
	residents: Resident[];
	totalResidents: number;
	onReportGenerated?: () => void;
	onClose: () => void;
	open: boolean;
};

export function ReportModal({
	residents,
	totalResidents,
	onReportGenerated,
	onClose,
	open,
}: ReportModalProps) {
	const now = new Date();
	const monthName = now.toLocaleString("pt-BR", { month: "long" });
	const year = now.getFullYear();

	const handleDownload = () => {
		const csvContent = [
			["Nome", "Email", "Status"],
			...residents.map((r) => [r.name, r.email, r.status]),
		]
			.map((row) => row.map((cell) => `"${cell}"`).join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `residentes-${year}-${String(now.getMonth() + 1).padStart(2, "0")}.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
		onReportGenerated?.();
	};

	const handlePrint = () => {
		window.print();
		onReportGenerated?.();
	};

	return (
		<Modal open={open} onClose={onClose} title="Relatório de Residentes">
			<div className="space-y-6">
				<div className="bg-slate-50 p-4 rounded-lg">
					<p className="text-sm text-slate-600 mb-2">
						<span className="font-semibold">Período:</span> {monthName} de{" "}
						{year}
					</p>
					<p className="text-sm text-slate-600">
						<span className="font-semibold">Total de Residentes:</span>{" "}
						{formatNumber(totalResidents)}
					</p>
					<p className="text-sm text-slate-600">
						<span className="font-semibold">Residentes Exibidos:</span>{" "}
						{formatNumber(residents.length)}
					</p>
				</div>

				<div className="max-h-96 overflow-y-auto">
					<table className="w-full text-sm">
						<thead className="sticky top-0 bg-slate-100">
							<tr>
								<th className="text-left px-3 py-2 font-semibold text-slate-700">
									Nome
								</th>
								<th className="text-left px-3 py-2 font-semibold text-slate-700">
									Email
								</th>
								<th className="text-left px-3 py-2 font-semibold text-slate-700">
									Status
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200">
							{residents.map((resident) => (
								<tr key={resident.id} className="hover:bg-slate-50">
									<td className="px-3 py-2 text-slate-800">
										{resident.name}
									</td>
									<td className="px-3 py-2 text-slate-600">
										{resident.email}
									</td>
									<td className="px-3 py-2">
										<span
											className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase ${resident.status === "Ativo"
												? "bg-emerald-100 text-emerald-700"
												: "bg-slate-100 text-slate-600"
												}`}
										>
											{resident.status}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="flex gap-3 justify-end">
					<Button
						color="secondary"
						icon={<MaterialIcon name="download" />}
						size="md"
						onClick={handleDownload}
					>
						Download CSV
					</Button>
					<Button
						color="secondary"
						icon={<MaterialIcon name="print" />}
						size="md"
						onClick={handlePrint}
					>
						Imprimir
					</Button>
					<Button
						color="primary"
						size="md"
						onClick={onClose}
					>
						Fechar
					</Button>
				</div>
			</div>
		</Modal>
	);
}
