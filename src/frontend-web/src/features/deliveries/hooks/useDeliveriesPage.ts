import {
    clearAuthSession,
    getAuthToken,
    getAuthUser,
} from "#/services/auth-service";
import type { AuthUser } from "#/types/auth";
import { getAvatarUrl, getProfileLabel } from "#/utils/user-formatters";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { EMPTY_DELIVERY_FORM, EMPTY_FILTER_FORM } from "../constants";
import {
	createDelivery,
	deleteDelivery,
	fetchDeliveries,
	fetchDeliveryUsers,
	updateDelivery,
} from "../services/deliveries-service";
import type { ActiveFilter, Delivery, DeliveryForm, FilterForm } from "../types/delivery";
import {
    buildActiveFilters,
    filterDeliveries,
    getFilterFormFromActiveFilters,
} from "../utils/delivery-filters";
import { calculateDeliveryStats } from "../utils/delivery-stats";

export function useDeliveriesPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const authToken = getAuthToken();
	const [authUser, setAuthUser] = useState<AuthUser | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [reportModalOpen, setReportModalOpen] = useState(false);
	const [filterModalOpen, setFilterModalOpen] = useState(false);
	const [profileModalOpen, setProfileModalOpen] = useState(false);
	const [filterForm, setFilterForm] = useState<FilterForm>(EMPTY_FILTER_FORM);
	const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [form, setForm] = useState<DeliveryForm>(EMPTY_DELIVERY_FORM);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
	const [formData, setFormData] = useState<Record<string, string>>({});

	useEffect(() => {
		setAuthUser(getAuthUser());
	}, []);

	const displayName = authUser?.username || authUser?.email || "Usuário";
	const profileLabel = getProfileLabel(authUser?.profile);
	const avatarUrl = getAvatarUrl(displayName, authUser?.profile);

	const deliveriesQuery = useQuery({
		queryKey: ["deliveries"],
		queryFn: fetchDeliveries,
		enabled: Boolean(authToken),
	});

	const usersQuery = useQuery({
		queryKey: ["users"],
		queryFn: fetchDeliveryUsers,
		enabled: Boolean(authToken),
		retry: false,
	});

	const deliveries = deliveriesQuery.data ?? [];
	const filteredDeliveries = useMemo(
		() => filterDeliveries(deliveries, searchTerm, activeFilters),
		[deliveries, searchTerm, activeFilters],
	);
	const stats = useMemo(() => calculateDeliveryStats(deliveries), [deliveries]);

	const createDeliveryMutation = useMutation({
		mutationFn: () =>
			createDelivery({
				recipient_user_id: form.recipientUserId
					? Number(form.recipientUserId)
					: null,
				registered_by_user_id: authUser?.id ?? null,
				description: form.description.trim(),
				arrival_date: new Date().toISOString(),
				pickup_date: null,
				status: form.status,
			}),
		onSuccess: () => {
			setModalOpen(false);
			setForm(EMPTY_DELIVERY_FORM);
			queryClient.invalidateQueries({ queryKey: ["deliveries"] });
		},
	});

	const deleteDeliveryMutation = useMutation({
		mutationFn: deleteDelivery,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deliveries"] });
		},
	});

	const updateDeliveryMutation = useMutation({
		mutationFn: (payload: { id: number; data: Parameters<typeof updateDelivery>[1] }) =>
			updateDelivery(payload.id, payload.data),
		onSuccess: () => {
			setEditModalOpen(false);
			setEditingDelivery(null);
			queryClient.invalidateQueries({ queryKey: ["deliveries"] });
		},
	});

	function handleLogout() {
		clearAuthSession();
		navigate({ to: "/login", replace: true });
	}

	function handleProfileClick() {
		setProfileModalOpen(true);
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

	function handleSubmitDelivery(event: React.FormEvent) {
		event.preventDefault();
		createDeliveryMutation.mutate();
	}

	function openFilterModal() {
		setFilterForm(getFilterFormFromActiveFilters(activeFilters));
		setFilterModalOpen(true);
	}

	function applyFilters() {
		setActiveFilters(buildActiveFilters(filterForm));
		setFilterModalOpen(false);
	}

	function removeFilter(id: string) {
		setActiveFilters((currentFilters) =>
			currentFilters.filter((filter) => filter.id !== id),
		);
	}

	function handleDeleteDelivery(id: number) {
		const shouldDelete = window.confirm("Remover esta encomenda?");
		if (shouldDelete) {
			deleteDeliveryMutation.mutate(id);
		}
	}

	function handleEditDelivery(delivery: Delivery) {
		setEditingDelivery(delivery);
		setEditModalOpen(true);
	}

	return {
		activeFilters,
		applyFilters,
		authUser,
		avatarUrl,
		createDeliveryMutation,
		deleteDeliveryMutation,
		deliveries,
		deliveriesQuery,
		displayName,
		editModalOpen,
		editingDelivery,
		filterForm,
		filterModalOpen,
		filteredDeliveries,
		form,
		formData,
		setFormData,
		handleDeleteDelivery,
		handleEditDelivery,
		handleFormChange,
		handleLogout,
		handleProfileClick,
		handleSubmitDelivery,
		modalOpen,
		openFilterModal,
		profileLabel,
		profileModalOpen,
		removeFilter,
		reportModalOpen,
		searchTerm,
		setActiveFilters,
		setEditModalOpen,
		setEditingDelivery,
		setFilterForm,
		setFilterModalOpen,
		setModalOpen,
		setProfileModalOpen,
		setReportModalOpen,
		setSearchTerm,
		stats,
		updateDeliveryMutation,
		usersQuery,
	};
}
