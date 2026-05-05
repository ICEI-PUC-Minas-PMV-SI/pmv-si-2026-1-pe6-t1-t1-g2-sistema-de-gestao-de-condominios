import { clearAuthSession, getAuthToken, getAuthUser } from "#/services/auth-service";
import type { AuthUser } from "#/types/auth";
import { getAvatarUrl, getProfileLabel } from "#/utils/user-formatters";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { 
    createOccurrence, 
    fetchMyOccurrences, 
    updateOccurrence, 
    deleteOccurrence, 
    uploadOccurrenceImage 
} from "../services/occurrences-service";
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
    
    // Novos estados para arquivo e edição
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    
    const authToken = getAuthToken();

    useEffect(() => {
        setAuthUser(getAuthUser());
        setHydrated(true);
    }, []);

    const displayName = authUser?.username || authUser?.email || "Morador";
    const profileLabel = getProfileLabel(authUser?.profile);
    const avatarUrl = getAvatarUrl(displayName, authUser?.profile);

    const occurrencesQuery = useQuery({
        queryKey: ["my-occurrences"],
        queryFn: fetchMyOccurrences,
        enabled: hydrated && Boolean(authToken),
        retry: false,
    });

    // Mutação para CRIAR (com suporte a upload de arquivo)
    const createMutation = useMutation({
        mutationFn: async () => {
            const newOcc = await createOccurrence(form);
            if (selectedFile && newOcc.id) {
                await uploadOccurrenceImage(newOcc.id, selectedFile);
            }
            return newOcc;
        },
        onSuccess: () => {
            handleCloseModal();
            queryClient.invalidateQueries({ queryKey: ["my-occurrences"] });
        },
    });

    // Mutação para EDITAR
    const updateMutation = useMutation({
        mutationFn: () => updateOccurrence(editingId!, form),
        onSuccess: () => {
            handleCloseModal();
            queryClient.invalidateQueries({ queryKey: ["my-occurrences"] });
        },
    });

    // Mutação para EXCLUIR
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteOccurrence(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-occurrences"] });
        },
    });

    const occurrences = useMemo<Occurrence[]>(() => {
    const records = (occurrencesQuery.data as any[]) ?? [];
    const term = searchTerm.trim().toLowerCase();
    
    // DEBUG: Abra o console do navegador (F12) e veja o que aparece aqui
    if (records.length > 0) console.log("Exemplo de ocorrência vinda do banco:", records[0]);

    return records
        .filter((rec) => {
            const title = (rec.title || rec.Title || "").toLowerCase();
            const desc = (rec.description || rec.Description || "").toLowerCase();
            return title.includes(term) || desc.includes(term);
        })
        .map((rec) => ({
            id: rec.id || rec.Id,
            title: rec.title || rec.Title,
            description: rec.description || rec.Description,
            status: rec.status || rec.Status,
            // Tenta todas as combinações possíveis de nome de campo de data
            createdAt: rec.createdAt || rec.CreatedAt || rec.created_at || rec.Created_at,
        }));
}, [occurrencesQuery.data, searchTerm]);

    const stats = useMemo<OccurrenceStats>(() => {
        const records = occurrencesQuery.data ?? [];
        return {
            totalAberto: records.filter((r) => r.status.toLowerCase() === "aberto").length,
            emAnalise: records.filter((r) => r.status.toLowerCase().includes("análise") || r.status.toLowerCase().includes("analise")).length,
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

    // Função para capturar o arquivo do input
    function handleFileChange(file: File | null) {
        setSelectedFile(file);
    }

    // Abre modal em modo de edição
    function openEditModal(occ: Occurrence) {
        setEditingId(occ.id);
        setForm({ title: occ.title, description: occ.description });
        setModalOpen(true);
    }

    function handleCloseModal() {
        setModalOpen(false);
        setEditingId(null);
        setSelectedFile(null);
        setForm(EMPTY_FORM);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (editingId) {
            updateMutation.mutate();
        } else {
            createMutation.mutate();
        }
    }

    function handleDelete(id: number) {
        if (window.confirm("Deseja realmente excluir esta ocorrência?")) {
            deleteMutation.mutate(id);
        }
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
        setModalOpen: (open: boolean) => !open && handleCloseModal() || setModalOpen(open),
        form,
        handleFormChange,
        handleFileChange,
        handleSubmit,
        createMutation,
        updateMutation,
        deleteMutation,
        
        isEditing: !!editingId,
        openEditModal,
        handleDelete,

        hydrated,
        occurrencesQuery,
        occurrences,
        stats,
    };
}