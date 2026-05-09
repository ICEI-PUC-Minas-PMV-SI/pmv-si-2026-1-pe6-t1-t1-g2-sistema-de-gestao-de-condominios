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
import type {
  ActiveFilter,
  Delivery,
  DeliveryForm,
  FilterForm,
} from "../types/delivery";
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
  const [hydrated, setHydrated] = useState(false);
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
    setHydrated(true);
  }, []);

  const isAdmin = (authUser?.profile ?? "").toLowerCase() === "administrador";
  const displayName = authUser?.username || authUser?.email || "Usuário";
  const profileLabel = getProfileLabel(authUser?.profile);
  const avatarUrl = getAvatarUrl(displayName, authUser?.profile);

  const deliveriesQuery = useQuery({
    queryKey: ["deliveries", isAdmin ? "all" : authUser?.id],
    queryFn: () => fetchDeliveries(isAdmin ? undefined : authUser?.id ?? undefined),
    enabled: hydrated && Boolean(authToken) && (isAdmin || Boolean(authUser?.id)),
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: fetchDeliveryUsers,
    enabled: hydrated && Boolean(authToken),
    retry: false,
  });

  const deliveries = deliveriesQuery.data ?? [];
  const filteredDeliveries = useMemo(
    () => filterDeliveries(deliveries, searchTerm, activeFilters),
    [deliveries, searchTerm, activeFilters],
  );
  const stats = useMemo(() => calculateDeliveryStats(deliveries), [deliveries]);

  const createDeliveryMutation = useMutation({
    mutationFn: () => {
      const arrivalDateTime = new Date(
        `${form.arrivalDate}T${form.arrivalTime}:00`,
      ).toISOString();
      return createDelivery({
        recipient_user_id: form.recipientUserId
          ? Number(form.recipientUserId)
          : null,
        registered_by_user_id:
          authUser?.id && authUser.id > 0 ? authUser.id : undefined,
        description: form.description.trim(),
        arrival_date: arrivalDateTime,
        pickup_date: null,
        status: form.status,
      });
    },
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
    mutationFn: (payload: {
      id: number;
      data: Parameters<typeof updateDelivery>[1];
    }) => updateDelivery(payload.id, payload.data),
    onSuccess: () => {
      setEditModalOpen(false);
      setEditingDelivery(null);
      setFormData({});
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

  function handleEditFormChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    setFormData((currentData) => ({
      ...currentData,
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
    const arrivalDate = new Date(delivery.arrival_date)
      .toISOString()
      .split("T")[0];
    const arrivalTime = new Date(delivery.arrival_date)
      .toTimeString()
      .slice(0, 5);

    setFormData({
      recipientUserId: delivery.recipient_user_id?.toString() ?? "",
      description: delivery.description ?? "",
      status: delivery.status ?? "",
      arrivalDate,
      arrivalTime,
    });
    setEditingDelivery(delivery);
    setEditModalOpen(true);
  }

  function handleSubmitEditDelivery(event: React.FormEvent) {
    event.preventDefault();
    if (!editingDelivery) return;

    const arrivalDateTime = new Date(
      `${formData.arrivalDate}T${formData.arrivalTime}:00`,
    ).toISOString();

    updateDeliveryMutation.mutate({
      id: editingDelivery.id,
      data: {
        recipient_user_id: formData.recipientUserId
          ? Number(formData.recipientUserId)
          : null,
        registered_by_user_id:
          authUser?.id && authUser.id > 0 ? authUser.id : undefined,
        description: formData.description.trim(),
        arrival_date: arrivalDateTime,
        pickup_date: editingDelivery.pickup_date ?? null,
        status: formData.status,
      },
    });
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
    handleEditFormChange,
    handleFormChange,
    handleLogout,
    handleProfileClick,
    handleSubmitDelivery,
    handleSubmitEditDelivery,
    isAdmin,
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