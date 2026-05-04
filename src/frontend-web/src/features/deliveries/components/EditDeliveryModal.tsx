import type { ChangeEvent, FormEvent } from "react";
import { Button, Modal } from "#/components/ui";
import { DELIVERY_STATUS_OPTIONS } from "../constants";
import type { Delivery, DeliveryUser } from "../types/delivery";
import { getUserLabel } from "../utils/delivery-formatters";

type EditDeliveryModalProps = {
	delivery: Delivery | null;
	errorMessage?: string;
	isPending: boolean;
	onChange: (
		event: ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => void;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	open: boolean;
	users: DeliveryUser[];
};

export function EditDeliveryModal({
	delivery,
	errorMessage,
	isPending,
	onChange,
	onClose,
	onSubmit,
	open,
	users,
}: EditDeliveryModalProps) {
	if (!delivery) return null;

	return (
		<Modal open={open} onClose={onClose} title="Editar Encomenda">
			<form className="flex flex-col gap-4 w-full" onSubmit={onSubmit}>
				<div className="flex flex-col gap-2">
					<label
						className="text-sm font-semibold text-on-surface"
						htmlFor="recipientUserId"
					>
						Destinatário
					</label>
					{users.length ? (
						<select
							className="rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant"
							id="recipientUserId"
							name="recipientUserId"
							onChange={onChange}
							value={delivery.recipient_user_id?.toString() ?? ""}
						>
							<option value="">Sem destinatário vinculado</option>
							{users.map((user) => (
								<option key={user.id} value={user.id}>
									{getUserLabel(user, user.id)}
								</option>
							))}
						</select>
					) : (
						<input
							className="rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant"
							id="recipientUserId"
							name="recipientUserId"
							onChange={onChange}
							placeholder="ID do destinatário"
							type="number"
							value={delivery.recipient_user_id?.toString() ?? ""}
						/>
					)}
				</div>
				<div className="flex flex-col gap-2">
					<label
						className="text-sm font-semibold text-on-surface"
						htmlFor="description"
					>
						Descrição
					</label>
					<textarea
						className="rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant"
						id="description"
						name="description"
						onChange={onChange}
						placeholder="Descrição registrada para esta encomenda"
						required
						rows={3}
						value={delivery.description ?? ""}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						className="text-sm font-semibold text-on-surface"
						htmlFor="status"
					>
						Status
					</label>
					<select
						className="rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant"
						id="status"
						name="status"
						onChange={onChange}
						value={delivery.status ?? ""}
					>
						{DELIVERY_STATUS_OPTIONS.map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</select>
				</div>
				{errorMessage && (
					<div className="text-error text-sm">{errorMessage}</div>
				)}
				<div className="flex gap-3 mt-2 justify-end">
					<Button
						color="primary"
						disabled={isPending}
						size="md"
						type="submit"
					>
						{isPending ? "Salvando..." : "Salvar Alterações"}
					</Button>
					<Button
						color="secondary"
						onClick={onClose}
						size="md"
						type="button"
					>
						Cancelar
					</Button>
				</div>
			</form>
		</Modal>
	);
}
