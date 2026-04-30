import type { ChangeEvent } from "react";
import { Button, Modal } from "#/components/ui";
import { DELIVERY_STATUS_OPTIONS } from "../constants";
import type { FilterForm } from "../types/delivery";

type FilterModalProps = {
	filterForm: FilterForm;
	onApply: () => void;
	onChange: (nextFilterForm: FilterForm) => void;
	onClose: () => void;
	open: boolean;
};

export function FilterModal({
	filterForm,
	onApply,
	onChange,
	onClose,
	open,
}: FilterModalProps) {
	function updateField(field: keyof FilterForm) {
		return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			onChange({
				...filterForm,
				[field]: event.target.value,
			});
		};
	}

	return (
		<Modal open={open} onClose={onClose} title="Filtros">
			<div className="flex flex-col gap-4 w-full">
				<div className="flex flex-col gap-2">
					<label
						className="text-sm font-semibold text-on-surface"
						htmlFor="filter-status"
					>
						Status
					</label>
					<select
						className="rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant"
						id="filter-status"
						onChange={updateField("status")}
						value={filterForm.status}
					>
						<option value="">Todos</option>
						{DELIVERY_STATUS_OPTIONS.map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</select>
				</div>
				<div className="flex flex-col gap-2">
					<label
						className="text-sm font-semibold text-on-surface"
						htmlFor="filter-arrival-from"
					>
						Data de chegada - de
					</label>
					<input
						className="rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant"
						id="filter-arrival-from"
						onChange={updateField("arrivalDateFrom")}
						type="date"
						value={filterForm.arrivalDateFrom}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						className="text-sm font-semibold text-on-surface"
						htmlFor="filter-arrival-to"
					>
						Data de chegada - até
					</label>
					<input
						className="rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant"
						id="filter-arrival-to"
						onChange={updateField("arrivalDateTo")}
						type="date"
						value={filterForm.arrivalDateTo}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						className="text-sm font-semibold text-on-surface"
						htmlFor="filter-recipient"
					>
						Destinatário
					</label>
					<input
						className="rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant"
						id="filter-recipient"
						onChange={updateField("recipient")}
						placeholder="Nome ou e-mail"
						type="text"
						value={filterForm.recipient}
					/>
				</div>
				<div className="flex gap-3 mt-2 justify-end">
					<Button color="primary" size="md" type="button" onClick={onApply}>
						Aplicar filtros
					</Button>
					<Button color="secondary" size="md" type="button" onClick={onClose}>
						Cancelar
					</Button>
				</div>
			</div>
		</Modal>
	);
}
