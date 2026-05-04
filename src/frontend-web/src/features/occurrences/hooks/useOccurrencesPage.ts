import { clearAuthSession, getAuthToken, getAuthUser } from "#/services/auth-service";
import type { AuthUser } from "#/types/auth";
import { getAvatarUrl, getProfileLabel } from "#/utils/user-formatters";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { createOccurrence, fetchMyOccurrences } from "../services/occurrences-service";
import type { CreateOccurrenceForm, Occurrence, OccurrenceStats } from "../types/occurrence";

const EMPTY_FORM: CreateOccurrenceForm = { title: "", description: "" };

export function useOccurrencesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<CreateOccurrenceForm>(EMPTY_FORM);
    const [hydrated, setHydrated] = useState(false);
    const authToken = getAuthToken();

    useEffect(() => {
        setAuthUser(getAuthUser());
        setHydrated(true);
    }, []);

    const displayName = authUser?.username || authUser?.email || "Morador";
    const profileLabel = getProfileLabel(authUser?.profile);
    const avatarUrl = getAvatarUrl(displayName, authUser?.profile);

    // Busca as ocorrências do morador (só funciona com token vindo do backend C#)
    const occurrencesQuery = useQuery({
        queryKey: ["my-occurrences"],
        queryFn: fetchMyOccurrences,
        enabled: hydrated && Boolean(authToken),
        retry: false,
    });

    // Mutação para criar nova ocorrência
    const createMutation = useMutation({
        mutationFn: () => createOccurrence(form),
        onSuccess: () => {
            setModalOpen(false);
            setForm(EMPTY_FORM);
            queryClient.invalidateQueries({ queryKey: ["my-occurrences"] });
        },
    });

    // Transforma o que vem da API no formato para a UI
    const occurrences = useMemo<Occurrence[]>(() => {
        const records = occurrencesQuery.data ?? [];
        // Filtragem local bem simples pelo termo de busca
        const term = searchTerm.trim().toLowerCase();
        
        return records
            .filter((rec) => rec.title.toLowerCase().includes(term) || rec.description.toLowerCase().includes(term))
            .map((rec) => ({
                id: rec.id,
                title: rec.title,
                description: rec.description,
                status: rec.status,
                createdAt: rec.createdAt,
            }));
    }, [occurrencesQuery.data, searchTerm]);

    // Conta quantos tem de cada status para o topo da página
    const stats = useMemo<OccurrenceStats>(() => {
        const records = occurrencesQuery.data ?? [];
        return {
            totalAberto: records.filter((r) => r.status.toLowerCase() === "aberto").length,
            emAnalise: records.filter((r) => r.status.toLowerCase() === "em análise" || r.status.toLowerCase() === "em analise").length,
            resolvidos: records.filter((r) => r.status.toLowerCase() === "finalizado" || r.status.toLowerCase() === "resolvido").length,
        };
    }, [occurrencesQuery.data]);

    function handleLogout() {
        clearAuthSession();
        navigate({ to: "/login", replace: true });
    }

    function handleFormChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        createMutation.mutate();
    }

    return {
        authUser,
        avatarUrl,
        displayName,
        profileLabel,
        searchTerm,
        setSearchTerm,
        handleLogout,
        
        modalOpen,
        setModalOpen,
        form,
        handleFormChange,
        handleSubmit,
        createMutation,

        hydrated,
        occurrencesQuery,
        occurrences,
        stats,
    };
}
