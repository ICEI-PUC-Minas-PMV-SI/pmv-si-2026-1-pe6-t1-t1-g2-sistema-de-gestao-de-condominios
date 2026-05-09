import { Button, MaterialIcon } from "#/components/ui";
import type {
	Notification,
	NotificationStatusFilter,
	NotificationUser,
} from "../types/notification";
import {
	formatNotificationDate,
	formatRelatedRecord,
	getNotificationIcon,
	getNotificationTypeClasses,
	getUserLabel,
} from "../utils/notification-formatters";

type NotificationsListProps = {
	deletePending: boolean;
	errorMessage?: string;
	filteredNotifications: Notification[];
	isLoading: boolean;
	notifications: Notification[];
	onDeleteNotification: (id: number) => void;
	onStatusFilterChange: (filter: NotificationStatusFilter) => void;
	onToggleReadStatus: (notification: Notification) => void;
	statusFilter: NotificationStatusFilter;
	toggleReadPending: boolean;
	usersById: Map<number, NotificationUser>;
};

const statusFilters: { label: string; value: NotificationStatusFilter }[] = [
	{ label: "Todas", value: "all" },
	{ label: "Nao lidas", value: "unread" },
	{ label: "Lidas", value: "read" },
];

type DeliveryMessageDetails = {
	description: string;
	requestedBy: string;
};

function parseDeliveryMessage(
    message?: string | null,
): DeliveryMessageDetails | null {
    if (!message) return null;

    const descMatch = message.match(/Descrição:\s*(.*?)\.\s*Solicitada por:/s);
    const requestedByMatch = message.match(/Solicitada por:\s*(.*?)\.\s*Recebida em:/);

    if (!descMatch || !requestedByMatch) return null;

    return {
        description: descMatch[1].trim(),
        requestedBy: requestedByMatch[1].trim(),
    };
}

export function NotificationsList({
	deletePending,
	errorMessage,
	filteredNotifications,
	isLoading,
	notifications,
	onDeleteNotification,
	onStatusFilterChange,
	onToggleReadStatus,
	statusFilter,
	toggleReadPending,
	usersById,
}: NotificationsListProps) {
	return (
		<div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white soft-shadow">
			<div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="font-bold text-slate-900">Notificacoes Recentes</h3>
					<p className="mt-1 text-xs font-medium text-slate-500">
						Mostrando {filteredNotifications.length} de {notifications.length}
					</p>
				</div>
				<div className="inline-flex w-fit rounded-full bg-slate-50 p-1">
					{statusFilters.map((filter) => (
						<button
							className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
								statusFilter === filter.value
									? "bg-white text-primary shadow-sm"
									: "text-slate-500 hover:text-slate-800"
							}`}
							key={filter.value}
							onClick={() => onStatusFilterChange(filter.value)}
							type="button"
						>
							{filter.label}
						</button>
					))}
				</div>
			</div>

			<div className="flex flex-col gap-3 p-4">
				{isLoading ? (
					<div className="p-8 text-center text-sm text-slate-400">
						Carregando...
					</div>
				) : errorMessage ? (
					<div className="p-8 text-center text-sm text-error">
						{errorMessage}
					</div>
				) : filteredNotifications.length === 0 ? (
					<div className="p-8 text-center text-sm text-slate-400">
						Nenhuma notificacao encontrada.
					</div>
				) : (
					filteredNotifications.map((notification) => {
						const user = usersById.get(notification.user_id);
						const deliveryMessage = parseDeliveryMessage(notification.message);

						return (
							<article
								className={`group flex flex-col gap-4 rounded-2xl border p-5 transition-colors md:flex-row md:items-start ${
									notification.is_read
										? "border-slate-100 bg-white opacity-75 hover:bg-slate-50/60 hover:opacity-100"
										: "border-blue-100 bg-blue-50/40 hover:bg-blue-50/60"
								}`}
								key={notification.id}
							>
								<div
									className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${getNotificationTypeClasses(
										notification.type,
									)}`}
								>
									<MaterialIcon name={getNotificationIcon(notification.type)} />
								</div>

								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<span
											className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${getNotificationTypeClasses(
												notification.type,
											)}`}
										>
											<span className="h-1.5 w-1.5 rounded-full bg-current" />
											{notification.type ?? "Sem tipo"}
										</span>
										<span
											className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${
												notification.is_read
													? "bg-emerald-50 text-emerald-700"
													: "bg-amber-50 text-amber-700"
											}`}
										>
											{notification.is_read ? "Lida" : "Nao lida"}
										</span>
									</div>

									{deliveryMessage ? (
										<div className="mt-4 max-w-4xl space-y-3">
											<p className="text-sm font-bold leading-6 text-slate-900">
												Sua encomenda está disponível para retirada.
											</p>
											<div className="grid gap-3 text-sm md:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.8fr)]">
												<div className="rounded-xl bg-slate-50 px-4 py-3">
													<span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">
														Descrição
													</span>
													<span className="mt-1 block font-semibold leading-5 text-slate-900">
														{deliveryMessage.description}
													</span>
												</div>
												<div className="rounded-xl bg-slate-50 px-4 py-3">
													<span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">
														Solicitada por
													</span>
													<span className="mt-1 block font-semibold leading-5 text-slate-900">
														{deliveryMessage.requestedBy}
													</span>
												</div>
											</div>
										</div>
									) : (
										<p className="mt-3 max-w-4xl text-sm font-semibold leading-6 text-slate-900">
											{notification.message || "Mensagem indisponivel"}
										</p>
									)}

									<div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
										<span className="inline-flex items-center gap-1.5">
											<MaterialIcon name="person" className="text-sm" />
											{getUserLabel(user, notification.user_id)}
										</span>
										<span className="inline-flex items-center gap-1.5">
											<MaterialIcon name="link" className="text-sm" />
											{formatRelatedRecord(notification)}
										</span>
										<span className="inline-flex items-center gap-1.5">
											<MaterialIcon name="schedule" className="text-sm" />
											{formatNotificationDate(notification.created_at)}
										</span>
									</div>
								</div>

								<div className="flex gap-2 md:justify-end">
									<Button
										aria-label={
											notification.is_read
												? "Marcar como nao lida"
												: "Marcar como lida"
										}
										className={`h-10 w-10 rounded-full ${
											notification.is_read
												? "text-slate-400!"
												: "text-emerald-700!"
										}`}
										color="transparent"
										disabled={toggleReadPending}
										onClick={() => onToggleReadStatus(notification)}
										size="icon"
										title={
											notification.is_read
												? "Marcar como não lida"
												: "Marcar como lida"
										}
										type="button"
									>
										<MaterialIcon
											name={notification.is_read ? "undo" : "done"}
										/>
									</Button>
									<Button
										aria-label="Remover notificacao"
										className="h-10 w-10 rounded-full text-error!"
										color="transparent"
										disabled={deletePending}
										onClick={() => onDeleteNotification(notification.id)}
										size="icon"
										title="Remover"
										type="button"
									>
										<MaterialIcon name="delete" />
									</Button>
								</div>
							</article>
						);
					})
				)}
			</div>
		</div>
	);
}