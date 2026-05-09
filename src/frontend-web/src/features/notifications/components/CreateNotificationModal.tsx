import { Button, Modal } from "#/components/ui";
import { NOTIFICATION_TYPES } from "../constants";
import type { NotificationForm, NotificationUser } from "../types/notification";
import { getUserLabel } from "../utils/notification-formatters";

type CreateNotificationModalProps = {
	errorMessage?: string;
	form: NotificationForm;
	isPending: boolean;
	onChange: (
		event: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => void;
	onClose: () => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	open: boolean;
	users: NotificationUser[];
};

const inputClass =
	"rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-container-lowest text-on-surface-variant";

export function CreateNotificationModal({
	errorMessage,
	form,
	isPending,
	onChange,
	onClose,
	onSubmit,
	open,
	users,
}: CreateNotificationModalProps) {
	return (
		<Modal open={open} onClose={onClose} title="Nova Notificacao">
			<form className="flex w-full flex-col gap-4" onSubmit={onSubmit}>
				<div className="flex flex-col gap-2">
					<label className="text-sm font-semibold text-on-surface" htmlFor="userId">
						Morador
					</label>
					{users.length ? (
						<select
							className={inputClass}
							id="userId"
							name="userId"
							onChange={onChange}
							required
							value={form.userId}
						>
							<option value="">Selecione um morador</option>
							{users.map((user) => (
								<option key={user.id} value={user.id}>
									{getUserLabel(user, user.id)}
								</option>
							))}
						</select>
					) : (
						<input
							className={inputClass}
							id="userId"
							min="1"
							name="userId"
							onChange={onChange}
							placeholder="ID do morador"
							required
							type="number"
							value={form.userId}
						/>
					)}
				</div>
				<div className="flex flex-col gap-2">
					<label className="text-sm font-semibold text-on-surface" htmlFor="type">
						Tipo
					</label>
					<select
						className={inputClass}
						id="type"
						name="type"
						onChange={onChange}
						value={form.type}
					>
						{NOTIFICATION_TYPES.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</div>
				<div className="flex flex-col gap-2">
					<label
						className="text-sm font-semibold text-on-surface"
						htmlFor="message"
					>
						Mensagem
					</label>
					<textarea
						className={inputClass}
						id="message"
						name="message"
						onChange={onChange}
						placeholder="Mensagem que sera exibida para o morador"
						required
						rows={4}
						value={form.message}
					/>
				</div>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					<div className="flex flex-col gap-2">
						<label className="text-xs font-semibold text-slate-500" htmlFor="deliveryId">
							Encomenda
						</label>
						<input
							className={inputClass}
							id="deliveryId"
							min="1"
							name="deliveryId"
							onChange={onChange}
							placeholder="ID"
							type="number"
							value={form.deliveryId}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label className="text-xs font-semibold text-slate-500" htmlFor="reservationId">
							Reserva
						</label>
						<input
							className={inputClass}
							id="reservationId"
							min="1"
							name="reservationId"
							onChange={onChange}
							placeholder="ID"
							type="number"
							value={form.reservationId}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label className="text-xs font-semibold text-slate-500" htmlFor="occurrenceId">
							Ocorrencia
						</label>
						<input
							className={inputClass}
							id="occurrenceId"
							min="1"
							name="occurrenceId"
							onChange={onChange}
							placeholder="ID"
							type="number"
							value={form.occurrenceId}
						/>
					</div>
				</div>
				{errorMessage && <div className="text-error text-sm">{errorMessage}</div>}
				<div className="mt-2 flex justify-end gap-3">
					<Button color="primary" disabled={isPending} size="md" type="submit">
						{isPending ? "Enviando..." : "Enviar Notificacao"}
					</Button>
					<Button color="secondary" onClick={onClose} size="md" type="button">
						Cancelar
					</Button>
				</div>
			</form>
		</Modal>
	);
}
