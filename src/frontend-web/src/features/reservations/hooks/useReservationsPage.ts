import { clearAuthSession, getAuthToken, getAuthUser } from "#/services/auth-service";
import type { AuthUser } from "#/types/auth";
import { getAvatarUrl, getProfileLabel } from "#/utils/user-formatters";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { fetchCommonAreasWithFallback } from "../services/common-areas-service";
import {
  createReservation,
  deleteReservation,
  fetchReservations,
  updateReservation,
} from "../services/reservations-service";
import type { Reservation, ReservationForm } from "../types/reservation";

const EMPTY_FORM: ReservationForm = {
  areaComumId: "",
  dataInicio: "",
  horaInicio: "",
  dataFim: "",
  horaFim: "",
  status: "Pendente",
};

function toInputDateTime(isoDateTime: string) {
  const date = new Date(isoDateTime);
  // Extract UTC components to avoid timezone conversion issues
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function combineDateTime(date: string, time: string): string {
  const normalizedTime = time.substring(0, 5);
  const isoString = `${date}T${normalizedTime}:00`; // sem Z
  const result = new Date(isoString);

  if (isNaN(result.getTime())) {
    throw new Error(`Data inválida: ${isoString}`);
  }

  return result.toISOString();
}

export function useReservationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authToken = getAuthToken();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ReservationForm>(EMPTY_FORM);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAuthUser(getAuthUser());
    setHydrated(true);
  }, []);

  const isAdmin = (authUser?.profile ?? "").toLowerCase() === "administrador";
  const displayName = authUser?.username || authUser?.email || "Usuário";
  const profileLabel = getProfileLabel(authUser?.profile);
  const avatarUrl = getAvatarUrl(displayName, authUser?.profile);

  const reservationsQuery = useQuery({
    queryKey: ["reservations"],
    queryFn: fetchReservations,
    enabled: hydrated && Boolean(authToken),
    retry: false,
  });

  const commonAreasQuery = useQuery({
    queryKey: ["common-areas-with-fallback"],
    queryFn: fetchCommonAreasWithFallback,
    enabled: hydrated && Boolean(authToken),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!authUser?.id) {
        throw new Error("Usuário não autenticado.");
      }
      return createReservation(form, authUser.id);
    },
    onSuccess: () => {
      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });

const updateMutation = useMutation({
  mutationFn: async () => {
    if (!editingReservation) {
      throw new Error("Nenhuma reserva selecionada para edição.");
    }

    const payload = {
      id: editingReservation.id,
      areaComumId: Number(form.areaComumId),
      moradorId: editingReservation.moradorId,
      dataHoraInicio: combineDateTime(form.dataInicio, form.horaInicio),
      dataHoraFim: combineDateTime(form.dataFim, form.horaFim),
      status: form.status,
      createdAt: editingReservation.createdAt,
      updatedAt: editingReservation.updatedAt,
    };

    return updateReservation(editingReservation.id, payload);
  },
  onSuccess: () => {
    handleCloseModal();
    queryClient.invalidateQueries({ queryKey: ["reservations"] });
  },
  onError: (error) => {
    console.error("Erro ao atualizar:", error);
  },
});

  const deleteMutation = useMutation({
    mutationFn: deleteReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });

  const reservations = useMemo(() => {
    const records = reservationsQuery.data ?? [];
    const term = searchTerm.trim().toLowerCase();

    const byRole = isAdmin
      ? records
      : records.filter((item) => item.moradorId === authUser?.id);

    if (!term) {
      return byRole;
    }

    return byRole.filter((item) => {
      const status = item.status.toLowerCase();
      const areaId = String(item.areaComumId);
      return status.includes(term) || areaId.includes(term);
    });
  }, [reservationsQuery.data, isAdmin, authUser?.id, searchTerm]);

  function handleLogout() {
    clearAuthSession();
    navigate({ to: "/login", replace: true });
  }

  function handleFormChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditingReservation(null);
    setForm(EMPTY_FORM);
  }

  function openCreateModal() {
    setEditingReservation(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(reservation: Reservation) {
    const start = toInputDateTime(reservation.dataHoraInicio).split("T");
    const end = toInputDateTime(reservation.dataHoraFim).split("T");

    setEditingReservation(reservation);
    setForm({
      areaComumId: String(reservation.areaComumId),
      dataInicio: start[0],
      horaInicio: start[1],
      dataFim: end[0],
      horaFim: end[1],
      status: reservation.status,
    });
    setModalOpen(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingReservation) {
      updateMutation.mutate();
      return;
    }

    createMutation.mutate();
  }

  function handleDelete(id: number) {
    if (window.confirm("Deseja remover esta reserva?")) {
      deleteMutation.mutate(id);
    }
  }

  return {
    authUser,
    avatarUrl,
    displayName,
    profileLabel,
    isAdmin,
    searchTerm,
    setSearchTerm,
    handleLogout,
    reservationsQuery,
    reservations,
    commonAreasQuery,
    modalOpen,
    form,
    handleFormChange,
    handleSubmit,
    openCreateModal,
    openEditModal,
    handleDelete,
    createMutation,
    updateMutation,
    editingReservation,
    handleCloseModal,
    isPending: createMutation.isPending || updateMutation.isPending,
    isUsingMockAreas: commonAreasQuery.data?.isMock ?? false,
    commonAreas: commonAreasQuery.data?.areas ?? [],
  };
}
