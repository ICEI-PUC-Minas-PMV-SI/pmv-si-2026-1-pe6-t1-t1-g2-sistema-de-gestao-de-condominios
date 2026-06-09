import { clearAuthSession, getAuthToken, getAuthUser } from "#/services/auth-service";
import type { AuthUser } from "#/types/auth";
import { getAvatarUrl, getProfileLabel } from "#/utils/user-formatters";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { 
    createOccurrence, 
    fetchMyOccurrences, 
    fetchAllOccurrences, 
    updateOccurrence, 
    deleteOccurrence, 
    uploadOccurrenceImage 
} from "../services/occurrences-service";
import type { CreateOccurrenceForm, Occurrence, OccurrenceStats } from "../types/occurrence";

// 1. CORREÇÃO: Adicionado imageUrl ao estado inicial do formulário
const EMPTY_FORM: CreateOccurrenceForm = { 
    title: "", 
    description: "", 
    status: "Aberto",
    imageUrl: "" 
};

export function useOccurrencesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<CreateOccurrenceForm>(EMPTY_FORM);
    const [hydrated, setHydrated] = useState(false);
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    
    const authToken = getAuthToken();

    useEffect(() => {
        setAuthUser(getAuthUser());
        setHydrated(true);
    }, []);

    const isAdmin = authUser?.profile === "Administrador";
    const displayName = authUser?.username || authUser?.email || "Usuário";
    const profileLabel = getProfileLabel(authUser?.profile);
    const avatarUrl = getAvatarUrl(displayName, authUser?.profile);

    const occurrencesQuery = useQuery({
        queryKey: [isAdmin ? "all-occurrences" : "my-occurrences"],
        queryFn: isAdmin ? fetchAllOccurrences : fetchMyOccurrences,
        enabled: hydrated && Boolean(authToken),
        retry: false,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: [isAdmin ? "all-occurrences" : "my-occurrences"] });
    };

    const createMutation = useMutation({
        mutationFn: async () => {
            const newOcc = await createOccurrence(form);
            const id = (newOcc as any).id || (newOcc as any).Id;
            if (selectedFile && id) {
                await uploadOccurrenceImage(id, selectedFile);
            }
            return newOcc;
        },
        onSuccess: () => {
            handleCloseModal();
            invalidate();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload?: CreateOccurrenceForm) => 
            updateOccurrence(editingId!, payload || form),
        onSuccess: () => {
            handleCloseModal();
            invalidate();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteOccurrence(id),
        onSuccess: invalidate,
    });

    // 2. OCORRÊNCIAS: Mapeamento garantindo consistência entre CamelCase e PascalCase do C#
    const occurrences = useMemo<Occurrence[]>(() => {
        const records = (occurrencesQuery.data as any[]) ?? [];
        const term = searchTerm.trim().toLowerCase();
        
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
                // CORREÇÃO: Garante que a ImageUrl seja mapeada para a lista
                imageUrl: rec.imageUrl || rec.ImageUrl || rec.file_path, 
                createdAt: rec.createdAt || rec.CreatedAt || rec.created_at || rec.Created_at,
            }));
    }, [occurrencesQuery.data, searchTerm]);

    // 3. ESTATÍSTICAS
    const stats = useMemo<OccurrenceStats>(() => {
        const records = (occurrencesQuery.data as any[]) ?? [];
        const getS = (r: any) => (r.status || r.Status || "");
        
        return {
            totalAberto: records.filter((r) => getS(r) === "Aberto").length,
            emAnalise: records.filter((r) => getS(r) === "Em Andamento").length,
            resolvidos: records.filter((r) => getS(r) === "Resolvido" || getS(r) === "Cancelado").length,
        };
    }, [occurrencesQuery.data]);

    function handleLogout() {
        clearAuthSession();
        navigate({ to: "/login", replace: true });
    }

    function handleFormChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
    }

    function handleFileChange(file: File | null) {
        setSelectedFile(file);
    }

    // 4. CORREÇÃO: Agora passamos a imageUrl da ocorrência para o formulário de edição
    function openEditModal(occ: Occurrence) {
        setEditingId(occ.id);
        setForm({ 
            title: occ.title, 
            description: occ.description,
            status: occ.status,
            imageUrl: occ.imageUrl // Fundamental para a foto aparecer no modal
        });
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
            updateMutation.mutate(undefined); 
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
        setModalOpen: (open: boolean) => !open ? handleCloseModal() : setModalOpen(open),
        form,
        handleFormChange,
        handleFileChange,
        handleSubmit,
        createMutation,
        updateMutation,
        deleteMutation,
        isEditing: !!editingId,
        isAdmin,
        openEditModal,
        handleDelete,
        hydrated,
        occurrencesQuery,
        occurrences,
        stats,
        isPending: createMutation.isPending || updateMutation.isPending
    };
}