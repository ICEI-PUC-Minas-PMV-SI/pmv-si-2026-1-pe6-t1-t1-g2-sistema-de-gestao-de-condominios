import {
	clearAuthSession,
	getAuthToken,
	getAuthUser,
} from "#/services/auth-service";
import type { AuthUser } from "#/types/auth";
import { getAvatarUrl, getProfileLabel } from "#/utils/user-formatters";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { EMPTY_RESIDENT_FORM, RESIDENT_STATS } from "../constants";
import {
	createResident,
	deleteResident,
	fetchResidents,
	updateResident,
} from "../services/residents-service";
import type { EditResidentForm, Resident, ResidentFilter, ResidentForm } from "../types/resident";
import { calculateResidentStats } from "../utils/resident-stats";

export function useResidentsPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [authUser, setAuthUser] = useState<AuthUser | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [reportModalOpen, setReportModalOpen] = useState(false);
	const [reportCount, setReportCount] = useState(0);
	const [selectedFilter, setSelectedFilter] = useState<ResidentFilter>("all");
	const [editingResident, setEditingResident] = useState<Resident | null>(null);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
	const [editForm, setEditForm] = useState<EditResidentForm>({
		username: "",
		email: "",
		profile: "Morador",
	});
	const [form, setForm] = useState<ResidentForm>(EMPTY_RESIDENT_FORM);
	const authToken = getAuthToken();
	const reportCounterKey = "residents-report-count";

	useEffect(() => {
		setAuthUser(getAuthUser());
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const saved = window.localStorage.getItem(reportCounterKey);
		const parsed = saved ? Number.parseInt(saved, 10) : 0;
		setReportCount(Number.isNaN(parsed) ? 0 : parsed);
	}, [reportCounterKey]);

	const displayName = authUser?.username || authUser?.email || "Usuário";
	const profileLabel = getProfileLabel(authUser?.profile);
	const avatarUrl = getAvatarUrl(displayName, authUser?.profile);
	const canSeeAdmins =
		(authUser?.profile ?? "").toLowerCase() === "administrador";
	const isAdmin = canSeeAdmins;

	const residentsQuery = useQuery({
		queryKey: ["residents"],
		queryFn: fetchResidents,
		enabled: Boolean(authToken),
		retry: false,
	});

	const createResidentMutation = useMutation({
		mutationFn: () =>
			createResident({
				username: form.name.trim(),
				email: form.email.trim(),
				password: form.password,
			}),
		onSuccess: () => {
			setModalOpen(false);
			setForm(EMPTY_RESIDENT_FORM);
			queryClient.invalidateQueries({ queryKey: ["residents"] });
		},
	});

	const updateResidentMutation = useMutation({
		mutationFn: (id: number) => updateResident(id, editForm),
		onSuccess: () => {
			setEditModalOpen(false);
			setEditingResident(null);
			queryClient.invalidateQueries({ queryKey: ["residents"] });
		},
	});

	const deleteResidentMutation = useMutation({
		mutationFn: (id: number) => deleteResident(id),
		onSuccess: () => {
			setDeleteConfirmOpen(false);
			setDeleteTargetId(null);
			queryClient.invalidateQueries({ queryKey: ["residents"] });
		},
	});

	const residents = useMemo<Resident[]>(() => {
		const users = residentsQuery.data ?? [];

		return users
			.filter((user) => {
				const profile = (user.profile ?? "").toLowerCase();
				if (profile === "morador") return true;
				if (profile === "administrador") return canSeeAdmins;
				return false;
			})
			.map((user) => ({
				id: user.id,
				name: user.username || user.email || `ID ${user.id}`,
				memberSince: `Perfil: ${getProfileLabel(user.profile)}`,
				unit: "-",
				phone: "-",
				email: user.email ?? "-",
				status: "Ativo",
				profile: user.profile ?? undefined,
			}));
	}, [residentsQuery.data, canSeeAdmins]);

	const filteredResidents = useMemo(() => {
		let filtered = residents;

		if (selectedFilter === "admins") {
			filtered = residents.filter(
				(resident) =>
					(resident.profile ?? "").toLowerCase() === "administrador",
			);
		} else if (selectedFilter === "residents") {
			filtered = residents.filter(
				(resident) => (resident.profile ?? "").toLowerCase() === "morador",
			);
		} else if (selectedFilter === "active") {
			filtered = residents.filter((resident) => resident.status === "Ativo");
		} else if (selectedFilter === "inactive") {
			filtered = residents.filter((resident) => resident.status === "Inativo");
		}

		const term = searchTerm.trim().toLowerCase();
		if (!term) return filtered;

		return filtered.filter((resident) => {
			const haystack = [
				resident.name,
				resident.unit,
				resident.email,
			]
				.join(" ")
				.toLowerCase();

			return haystack.includes(term);
		});
	}, [residents, searchTerm, selectedFilter]);

	const stats = useMemo(() => {
		const metrics = residentsQuery.data
			? calculateResidentStats(residentsQuery.data)
			: null;
		return {
			totalResidents: metrics?.totalResidents ?? 0,
			newThisMonth: metrics?.newThisMonth ?? 0,
			pendingRequests: reportCount,
			totalCapacity: RESIDENT_STATS.totalCapacity,
		};
	}, [reportCount, residentsQuery.data]);

	const pagination = useMemo(
		() => ({
			currentPage: 1,
			totalPages: 1,
		}),
		[],
	);

	function handleLogout() {
		clearAuthSession();
		navigate({ to: "/login", replace: true });
	}

	function handleFormChange(event: React.ChangeEvent<HTMLInputElement>) {
		setForm((currentForm) => ({
			...currentForm,
			[event.target.name]: event.target.value,
		}));
	}

	function handleSubmitResident(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		createResidentMutation.mutate();
	}

	function handleEditFormChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
		setEditForm((current) => ({
			...current,
			[event.target.name]: event.target.value,
		}));
	}

	function handleOpenEditModal(resident: Resident) {
		setEditingResident(resident);
		setEditForm({
			username: resident.name,
			email: resident.email,
			profile: resident.profile ?? "Morador",
		});
		setEditModalOpen(true);
	}

	function handleSubmitEdit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (editingResident) {
			updateResidentMutation.mutate(editingResident.id);
		}
	}

	function handleOpenDeleteConfirm(residentId: number) {
		setDeleteTargetId(residentId);
		setDeleteConfirmOpen(true);
	}

	function handleConfirmDelete() {
		if (deleteTargetId !== null) {
			deleteResidentMutation.mutate(deleteTargetId);
		}
	}

	function handleReportGenerated() {
		setReportCount((current) => {
			const next = current + 1;
			if (typeof window !== "undefined") {
				window.localStorage.setItem(reportCounterKey, String(next));
			}
			return next;
		});
	}

	return {
		authUser,
		avatarUrl,
		deleteConfirmOpen,
		deleteResidentMutation,
		deleteTargetId,
		displayName,
		editForm,
		editingResident,
		editModalOpen,
		form,
		handleConfirmDelete,
		handleEditFormChange,
		handleFormChange,
		handleLogout,
		handleOpenDeleteConfirm,
		handleOpenEditModal,
		handleReportGenerated,
		handleSubmitEdit,
		handleSubmitResident,
		isAdmin,
		modalOpen,
		pagination,
		profileLabel,
		residents,
		filteredResidents,
		reportCount,
		reportModalOpen,
		searchTerm,
		selectedFilter,
		setDeleteConfirmOpen,
		setEditModalOpen,
		setModalOpen,
		setReportModalOpen,
		setSearchTerm,
		setSelectedFilter,
		stats,
		createResidentMutation,
		residentsQuery,
		updateResidentMutation,
	};
}
