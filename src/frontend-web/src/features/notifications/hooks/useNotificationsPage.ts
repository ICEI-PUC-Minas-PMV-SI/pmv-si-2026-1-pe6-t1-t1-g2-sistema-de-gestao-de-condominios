import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import {
	clearAuthSession,
	getAuthToken,
	getAuthUser,
} from "#/services/auth-service";
import type { AuthUser } from "#/types/auth";
import { getAvatarUrl, getProfileLabel } from "#/utils/user-formatters";
import { EMPTY_NOTIFICATION_FORM } from "../constants";
import {
	createNotification,
	deleteNotification,
	fetchNotifications,
	fetchNotificationUsers,
	updateNotificationReadStatus,
} from "../services/notifications-service";
import type {
	Notification,
	NotificationForm,
	NotificationStatusFilter,
} from "../types/notification";
import { calculateNotificationStats } from "../utils/notification-stats";

export function useNotificationsPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const authToken = getAuthToken();
	const [authUser, setAuthUser] = useState<AuthUser | null>(null);
	const [hydrated, setHydrated] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] =
		useState<NotificationStatusFilter>("all");
	const [modalOpen, setModalOpen] = useState(false);
	const [form, setForm] = useState<NotificationForm>(EMPTY_NOTIFICATION_FORM);

	useEffect(() => {
		setAuthUser(getAuthUser());
		setHydrated(true);
	}, []);

	const isAdmin = (authUser?.profile ?? "").toLowerCase() === "administrador";
	const displayName = authUser?.username || authUser?.email || "Usuario";
	const profileLabel = getProfileLabel(authUser?.profile);
	const avatarUrl = getAvatarUrl(displayName, authUser?.profile);

	const notificationsQuery = useQuery({
		queryKey: ["notifications", isAdmin ? "all" : authUser?.id],
		queryFn: () => fetchNotifications(isAdmin ? undefined : authUser?.id),
		enabled: hydrated && Boolean(authToken) && (isAdmin || Boolean(authUser?.id)),
		retry: false,
	});

	const usersQuery = useQuery({
		queryKey: ["users"],
		queryFn: fetchNotificationUsers,
		enabled: hydrated && Boolean(authToken),
		retry: false,
	});

	const notifications = useMemo(() => {
		const data = notificationsQuery.data ?? [];
		// Admins acompanham apenas ocorrências e reservas, não encomendas dos moradores.
		return isAdmin ? data.filter((item) => item.delivery_id === null) : data;
	}, [notificationsQuery.data, isAdmin]);
	const usersById = useMemo(
		() => new Map((usersQuery.data ?? []).map((user) => [user.id, user])),
		[usersQuery.data],
	);
	const filteredNotifications = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();

		return notifications.filter((notification) => {
			const matchesStatus =
				statusFilter === "all" ||
				(statusFilter === "read" && notification.is_read) ||
				(statusFilter === "unread" && !notification.is_read);

			if (!matchesStatus) return false;
			if (!term) return true;

			const user = usersById.get(notification.user_id);
			return [
				notification.id,
				notification.type,
				notification.message,
				notification.user_id,
				user?.username,
				user?.email,
				notification.delivery_id,
				notification.reservation_id,
				notification.occurrence_id,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase()
				.includes(term);
		});
	}, [notifications, searchTerm, statusFilter, usersById]);
	const stats = useMemo(
		() => calculateNotificationStats(notifications),
		[notifications],
	);

	const createNotificationMutation = useMutation({
		mutationFn: () =>
			createNotification({
				user_id: Number(form.userId),
				type: form.type,
				message: form.message.trim(),
				is_read: false,
				reservation_id: form.reservationId ? Number(form.reservationId) : null,
				occurrence_id: form.occurrenceId ? Number(form.occurrenceId) : null,
				delivery_id: form.deliveryId ? Number(form.deliveryId) : null,
			}),
		onSuccess: () => {
			setModalOpen(false);
			setForm(EMPTY_NOTIFICATION_FORM);
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});

	const deleteNotificationMutation = useMutation({
		mutationFn: deleteNotification,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});

	const updateReadStatusMutation = useMutation({
		mutationFn: ({ id, isRead }: { id: number; isRead: boolean }) =>
			updateNotificationReadStatus(id, isRead),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});

	function handleLogout() {
		clearAuthSession();
		navigate({ to: "/login", replace: true });
	}

	function handleFormChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) {
		setForm((currentForm) => ({
			...currentForm,
			[event.target.name]: event.target.value,
		}));
	}

	function handleSubmitNotification(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		createNotificationMutation.mutate();
	}

	function handleDeleteNotification(id: number) {
		const shouldDelete = window.confirm("Remover esta notificacao?");
		if (shouldDelete) {
			deleteNotificationMutation.mutate(id);
		}
	}

	function handleToggleReadStatus(notification: Notification) {
		updateReadStatusMutation.mutate({
			id: notification.id,
			isRead: !notification.is_read,
		});
	}

	return {
		authUser,
		avatarUrl,
		createNotificationMutation,
		deleteNotificationMutation,
		displayName,
		filteredNotifications,
		form,
		handleDeleteNotification,
		handleFormChange,
		handleLogout,
		handleSubmitNotification,
		handleToggleReadStatus,
		hydrated,
		isAdmin,
		modalOpen,
		notifications,
		notificationsQuery,
		profileLabel,
		searchTerm,
		setModalOpen,
		setSearchTerm,
		setStatusFilter,
		stats,
		statusFilter,
		updateReadStatusMutation,
		usersById,
		usersQuery,
	};
}
