import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/services/auth";
import { getAuthToken } from "@/services/authSession";

// ─── Cores ────────────────────────────────────────────────────────────────────

const C = {
  bg: "#F9F9FF",
  primary: "#40557B",
  text: "#111C2D",
  muted: "#5A5F63",
  white: "#FFFFFF",
  surface: "#E7EEFF",
  border: "#F1F5F9",
  inputBg: "#E9EDF2",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
  orange100: "#FEF3C7",
  orange700: "#B45309",
  blue100: "#DBEAFE",
  blue700: "#1D4ED8",
  green100: "#DCFCE7",
  green700: "#15803D",
  slate100: "#F1F5F9",
  slate500: "#64748B",
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Occurrence = {
  id: number;
  user_id: number | null;
  user_username: string | null;
  user_email: string | null;
  title: string | null;
  description: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  image_url: string | null;
};

type OccurrenceForm = {
  title: string;
  description: string;
  status: string;
};

const EMPTY_FORM: OccurrenceForm = { title: "", description: "", status: "Aberto" };

const STATUS_OPTIONS = ["Aberto", "Em Andamento", "Resolvido", "Cancelado"] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

const FILTER_OPTIONS: Array<StatusOption | "Todos"> = ["Todos", ...STATUS_OPTIONS];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeStatus(status: string | null): "aberto" | "andamento" | "resolvido" | "cancelado" | "outro" {
  const s = (status ?? "").toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (s === "aberto") return "aberto";
  if (s.includes("andamento") || s.includes("analise")) return "andamento";
  if (s === "resolvido" || s.includes("finaliz")) return "resolvido";
  if (s === "cancelado" || s === "fechado") return "cancelado";
  return "outro";
}

function statusInfo(status: string | null): { label: string; bg: string; color: string; icon: keyof typeof Ionicons.glyphMap } {
  switch (normalizeStatus(status)) {
    case "aberto":
      return { label: "Aberto",       bg: C.orange100, color: C.orange700, icon: "time-outline" };
    case "andamento":
      return { label: "Em Andamento", bg: C.blue100,   color: C.blue700,   icon: "search-outline" };
    case "resolvido":
      return { label: "Resolvido",    bg: C.green100,  color: C.green700,  icon: "checkmark-circle-outline" };
    case "cancelado":
      return { label: "Cancelado",    bg: C.dangerBg,  color: C.danger,    icon: "close-circle-outline" };
    default:
      return { label: status ?? "—",  bg: C.slate100,  color: C.slate500,  icon: "ellipse-outline" };
  }
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

// ─── Card de ocorrência ───────────────────────────────────────────────────────

function OccurrenceCard({
  item,
  onPress,
}: {
  item: Occurrence;
  onPress: (o: Occurrence) => void;
}) {
  const { label, bg, color, icon } = statusInfo(item.status);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title ?? "Sem título"}
          </Text>
          <View style={[styles.badge, { backgroundColor: bg }]}>
            <Ionicons name={icon} size={11} color={color} />
            <Text style={[styles.badgeText, { color }]}>{label}</Text>
          </View>
        </View>
        <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
      </View>

      {item.description ? (
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      <View style={styles.cardFooterHint}>
        <Text style={styles.cardHintText}>Toque para ver detalhes</Text>
        <Ionicons name="chevron-forward" size={14} color={C.muted} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Modal de detalhe ─────────────────────────────────────────────────────────

function DetailModal({
  occurrence,
  isAdmin,
  onClose,
  onEdit,
  onDelete,
  onChangeStatus,
}: {
  occurrence: Occurrence | null;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: (o: Occurrence) => void;
  onDelete: (o: Occurrence) => void;
  onChangeStatus: (o: Occurrence) => void;
}) {
  if (!occurrence) return null;
  const { label, bg, color, icon } = statusInfo(occurrence.status);
  const canEdit = !isAdmin && normalizeStatus(occurrence.status) === "aberto";

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { gap: 16 }]} onPress={() => {}}>
          <View style={styles.modalHandle} />

          {/* Status badge */}
          <View style={[styles.detailBadge, { backgroundColor: bg }]}>
            <Ionicons name={icon} size={14} color={color} />
            <Text style={[styles.detailBadgeText, { color }]}>{label}</Text>
          </View>

          {/* Título */}
          <Text style={styles.detailTitle}>{occurrence.title ?? "Sem título"}</Text>

          {/* Descrição */}
          <ScrollView style={styles.detailDescScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.detailDesc}>
              {occurrence.description ?? "Sem descrição."}
            </Text>
          </ScrollView>

          {/* Morador (só admin vê) */}
          {isAdmin && (
            <View style={styles.detailMoradorRow}>
              <Ionicons name="person-circle-outline" size={18} color={C.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailMoradorName}>
                  {occurrence.user_username ?? "Nome não informado"}
                </Text>
                {occurrence.user_email ? (
                  <Text style={styles.detailMoradorEmail}>{occurrence.user_email}</Text>
                ) : null}
              </View>
            </View>
          )}

          {/* Datas */}
          <View style={styles.detailMeta}>
            <View style={styles.detailMetaRow}>
              <Ionicons name="calendar-outline" size={14} color={C.muted} />
              <Text style={styles.detailMetaText}>
                Aberta em: {formatDateTime(occurrence.created_at)}
              </Text>
            </View>
            {occurrence.updated_at && occurrence.updated_at !== occurrence.created_at && (
              <View style={styles.detailMetaRow}>
                <Ionicons name="time-outline" size={14} color={C.muted} />
                <Text style={styles.detailMetaText}>
                  Atualizada em: {formatDateTime(occurrence.updated_at)}
                </Text>
              </View>
            )}
          </View>

          {/* Ações */}
          <View style={styles.detailActions}>
            {isAdmin && (
              <TouchableOpacity
                style={styles.detailActionBtn}
                onPress={() => { onClose(); onChangeStatus(occurrence); }}
                activeOpacity={0.8}
              >
                <Ionicons name="swap-horizontal-outline" size={18} color={C.primary} />
                <Text style={styles.detailActionText}>Alterar status</Text>
              </TouchableOpacity>
            )}
            {canEdit && (
              <TouchableOpacity
                style={styles.detailActionBtn}
                onPress={() => { onClose(); onEdit(occurrence); }}
                activeOpacity={0.8}
              >
                <Ionicons name="pencil-outline" size={18} color={C.primary} />
                <Text style={styles.detailActionText}>Editar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.detailActionBtn, styles.detailActionBtnDanger]}
              onPress={() => { onClose(); onDelete(occurrence); }}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color={C.danger} />
              <Text style={[styles.detailActionText, { color: C.danger }]}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Modal criar / editar ─────────────────────────────────────────────────────

function OccurrenceFormModal({
  visible,
  isEditing,
  form,
  onChange,
  onClose,
  onSubmit,
  loading,
  error,
}: {
  visible: boolean;
  isEditing: boolean;
  form: OccurrenceForm;
  onChange: (field: keyof OccurrenceForm, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%" }}
        >
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {isEditing ? "Editar Ocorrência" : "Nova Ocorrência"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isEditing ? "Atualize os dados da ocorrência." : "Descreva o problema para registro."}
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Título *</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Ex: Vazamento no corredor"
                placeholderTextColor="#94A3B8"
                value={form.title}
                onChangeText={(v) => onChange("title", v)}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Descrição *</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldTextarea]}
                placeholder="Descreva o problema com detalhes..."
                placeholderTextColor="#94A3B8"
                value={form.description}
                onChangeText={(v) => onChange("description", v)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {error ? <Text style={styles.formError}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitDisabled]}
              onPress={onSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={C.white} />
                : <Text style={styles.submitText}>
                    {isEditing ? "Salvar alterações" : "Registrar ocorrência"}
                  </Text>
              }
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

// ─── Modal alterar status (Admin) ─────────────────────────────────────────────

function ChangeStatusModal({
  visible,
  current,
  onClose,
  onSelect,
  loading,
}: {
  visible: boolean;
  current: string | null;
  onClose: () => void;
  onSelect: (s: StatusOption) => void;
  loading: boolean;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Alterar Status</Text>
          <Text style={styles.modalSubtitle}>Selecione o novo status da ocorrência.</Text>

          {STATUS_OPTIONS.map((s) => {
            const { label, bg, color, icon } = statusInfo(s);
            const isActive = s === current;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.statusOption, isActive && styles.statusOptionActive]}
                onPress={() => onSelect(s)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <View style={[styles.statusOptionIcon, { backgroundColor: bg }]}>
                  <Ionicons name={icon} size={18} color={color} />
                </View>
                <Text style={[styles.statusOptionLabel, isActive && { color: C.primary, fontWeight: "700" }]}>
                  {label}
                </Text>
                {isActive && <Ionicons name="checkmark" size={18} color={C.primary} />}
                {loading && isActive && <ActivityIndicator size="small" color={C.primary} style={{ marginLeft: 4 }} />}
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const PAGE_SIZE = 10;

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <View style={styles.pagination}>
      <TouchableOpacity
        style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
        onPress={onPrev}
        disabled={page === 1}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={18} color={page === 1 ? "#CBD5E1" : C.primary} />
      </TouchableOpacity>
      <Text style={styles.pageLabel}>{page} / {totalPages}</Text>
      <TouchableOpacity
        style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
        onPress={onNext}
        disabled={page === totalPages}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-forward" size={18} color={page === totalPages ? "#CBD5E1" : C.primary} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function OccurrencesScreen() {
  const { user } = useAuth();
  const isAdmin = user?.profile === "Administrador";

  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState<StatusOption | "Todos">("Todos");
  const [page, setPage] = useState(1);

  // Modal criar/editar
  const [formModal, setFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Occurrence | null>(null);
  const [form, setForm] = useState<OccurrenceForm>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Modal de detalhe
  const [detailTarget, setDetailTarget] = useState<Occurrence | null>(null);

  // Modal alterar status (admin)
  const [statusTarget, setStatusTarget] = useState<Occurrence | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  function reload() { setReloadKey((k) => k + 1); }

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormModal(true);
  }

  function openEdit(o: Occurrence) {
    setEditTarget(o);
    setForm({ title: o.title ?? "", description: o.description ?? "", status: o.status ?? "Aberto" });
    setFormError("");
    setFormModal(true);
  }

  function handleFormChange(field: keyof OccurrenceForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Busca ocorrências
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = getAuthToken();
        const path = isAdmin ? "/api/occurrences" : "/api/occurrences/meu";
        const data = await apiRequest<Occurrence[]>(path, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) setOccurrences(Array.isArray(data) ? data : []);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Erro ao carregar ocorrências.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [isAdmin, reloadKey]);

  // Criar ou editar
  async function handleSubmit() {
    if (!form.title.trim()) { setFormError("Informe o título."); return; }
    if (!form.description.trim()) { setFormError("Informe a descrição."); return; }

    setFormError("");
    setFormLoading(true);
    try {
      const token = getAuthToken();
      if (editTarget) {
        await apiRequest(`/api/occurrences/${editTarget.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: form.title.trim(), description: form.description.trim(), status: editTarget.status }),
        });
      } else {
        await apiRequest("/api/occurrences", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: form.title.trim(), description: form.description.trim() }),
        });
      }
      setFormModal(false);
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao salvar ocorrência.");
    } finally {
      setFormLoading(false);
    }
  }

  // Excluir
  function handleDelete(o: Occurrence) {
    Alert.alert(
      "Excluir ocorrência",
      `Tem certeza que deseja excluir "${o.title ?? "esta ocorrência"}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const token = getAuthToken();
              await apiRequest(`/api/occurrences/${o.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              reload();
            } catch (e) {
              Alert.alert("Erro", e instanceof Error ? e.message : "Não foi possível excluir.");
            }
          },
        },
      ]
    );
  }

  // Alterar status (admin)
  async function handleChangeStatus(newStatus: StatusOption) {
    if (!statusTarget) return;
    setStatusLoading(true);
    try {
      const token = getAuthToken();
      await apiRequest(`/api/occurrences/${statusTarget.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: statusTarget.title,
          description: statusTarget.description,
          status: newStatus,
        }),
      });
      setStatusTarget(null);
      reload();
    } catch (e) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Não foi possível alterar o status.");
    } finally {
      setStatusLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (filter === "Todos") return occurrences;
    const map: Record<string, ReturnType<typeof normalizeStatus>> = {
      "Aberto":       "aberto",
      "Em Andamento": "andamento",
      "Resolvido":    "resolvido",
      "Cancelado":    "cancelado",
    };
    const target = map[filter] ?? "outro";
    return occurrences.filter((o) => normalizeStatus(o.status) === target);
  }, [occurrences, filter]);

  useEffect(() => { setPage(1); }, [filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    total:      occurrences.length,
    abertas:    occurrences.filter((o) => normalizeStatus(o.status) === "aberto").length,
    andamento:  occurrences.filter((o) => normalizeStatus(o.status) === "andamento").length,
    resolvidas: occurrences.filter((o) => normalizeStatus(o.status) === "resolvido").length,
    canceladas: occurrences.filter((o) => normalizeStatus(o.status) === "cancelado").length,
  }), [occurrences]);

  return (
    <SafeAreaView style={styles.root}>
      <FlatList
        data={paginated}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        }
        ListHeaderComponent={
          <>
            {/* Cabeçalho */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.kicker}>Condomínio</Text>
                <Text style={styles.title}>
                  {isAdmin ? "Gestão de Ocorrências" : "Minhas Ocorrências"}
                </Text>
                <Text style={styles.subtitle}>
                  {isAdmin
                    ? "Gerencie todos os chamados abertos."
                    : "Registre e acompanhe seus chamados."}
                </Text>
              </View>
              <View style={styles.iconPill}>
                <Ionicons name="alert-circle-outline" size={22} color={C.primary} />
              </View>
            </View>

            {/* Stats */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsScroll}
            >
              <StatPill label="Total"        value={stats.total}      color={C.primary}    loading={loading} />
              <StatPill label="Abertas"      value={stats.abertas}    color={C.orange700}  loading={loading} />
              <StatPill label="Em andamento" value={stats.andamento}  color={C.blue700}    loading={loading} />
              <StatPill label="Resolvidas"   value={stats.resolvidas} color={C.green700}   loading={loading} />
              <StatPill label="Canceladas"   value={stats.canceladas} color={C.danger}     loading={loading} />
            </ScrollView>

            {/* Filtros */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {FILTER_OPTIONS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, filter === f && styles.filterChipActive]}
                  onPress={() => setFilter(f)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Estado loading / erro / vazio */}
            {loading && (
              <View style={styles.stateCard}>
                <ActivityIndicator color={C.primary} />
                <Text style={styles.stateText}>Carregando ocorrências...</Text>
              </View>
            )}
            {!loading && error ? (
              <View style={styles.stateCard}>
                <Ionicons name="alert-circle-outline" size={22} color={C.danger} />
                <Text style={[styles.stateText, { color: C.danger }]}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={reload}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {!loading && !error && filtered.length === 0 && (
              <View style={styles.stateCard}>
                <Ionicons name="document-outline" size={22} color={C.muted} />
                <Text style={styles.stateText}>
                  {filter === "Todos" ? "Nenhuma ocorrência registrada." : `Nenhuma ocorrência com status "${filter}".`}
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <OccurrenceCard
            item={item}
            onPress={(o) => setDetailTarget(o)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {/* FAB — só para Morador criar */}
      {!isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.85}>
          <Ionicons name="add" size={30} color={C.white} />
        </TouchableOpacity>
      )}

      <DetailModal
        occurrence={detailTarget}
        isAdmin={isAdmin}
        onClose={() => setDetailTarget(null)}
        onEdit={openEdit}
        onDelete={handleDelete}
        onChangeStatus={(o) => setStatusTarget(o)}
      />

      <OccurrenceFormModal
        visible={formModal}
        isEditing={editTarget !== null}
        form={form}
        onChange={handleFormChange}
        onClose={() => setFormModal(false)}
        onSubmit={handleSubmit}
        loading={formLoading}
        error={formError}
      />

      <ChangeStatusModal
        visible={statusTarget !== null}
        current={statusTarget?.status ?? null}
        onClose={() => setStatusTarget(null)}
        onSelect={handleChangeStatus}
        loading={statusLoading}
      />
    </SafeAreaView>
  );
}

// ─── Componente de stat pill ──────────────────────────────────────────────────

function StatPill({ label, value, color, loading }: { label: string; value: number; color: string; loading: boolean }) {
  return (
    <View style={styles.statPill}>
      {loading
        ? <ActivityIndicator size="small" color={color} />
        : <Text style={[styles.statPillValue, { color }]}>{value}</Text>
      }
      <Text style={styles.statPillLabel}>{label}</Text>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  listContent: { padding: 20, paddingBottom: 100 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  kicker: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, color: C.primary, textTransform: "uppercase" },
  title: { fontSize: 26, fontWeight: "800", color: C.text, marginTop: 2 },
  subtitle: { marginTop: 4, fontSize: 13, color: C.muted, maxWidth: 240 },
  iconPill: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: C.surface, alignItems: "center", justifyContent: "center",
  },

  // Stats
  statsScroll: { gap: 10, paddingBottom: 4, marginBottom: 12 },
  statPill: {
    backgroundColor: C.white, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 18,
    alignItems: "center", gap: 4, minWidth: 80,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  statPillValue: { fontSize: 22, fontWeight: "800" },
  statPillLabel: { fontSize: 11, color: C.muted, fontWeight: "600" },

  // Filtros
  filterScroll: { gap: 8, paddingBottom: 4, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
  },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterChipText: { fontSize: 13, fontWeight: "600", color: C.muted },
  filterChipTextActive: { color: C.white },

  // Card
  card: {
    backgroundColor: C.white, borderRadius: 20, padding: 16, gap: 10,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardHeader: { gap: 4 },
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: C.text, flex: 1 },
  cardDate: { fontSize: 11, color: C.muted },
  cardDesc: { fontSize: 13, color: C.muted, lineHeight: 18 },
  cardFooter: { flexDirection: "row", gap: 8, flexWrap: "wrap" },

  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: "700" },

  cardFooterHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  cardHintText: {
    fontSize: 11,
    color: C.muted,
  },

  // Modal detalhe
  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  detailBadgeText: { fontSize: 13, fontWeight: "700" },
  detailTitle: { fontSize: 20, fontWeight: "800", color: C.text, lineHeight: 26 },
  detailDescScroll: { maxHeight: 120 },
  detailDesc: { fontSize: 14, color: C.muted, lineHeight: 22 },
  detailMoradorRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  detailMoradorName: { fontSize: 14, fontWeight: "700", color: C.primary },
  detailMoradorEmail: { fontSize: 12, color: C.muted, marginTop: 1 },
  detailMeta: { gap: 6, paddingTop: 4, borderTopWidth: 1, borderTopColor: C.border },
  detailMetaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailMetaText: { fontSize: 12, color: C.muted },
  detailActions: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  detailActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.surface,
  },
  detailActionBtnDanger: { backgroundColor: C.dangerBg },
  detailActionText: { fontSize: 13, fontWeight: "700", color: C.primary },

  actionChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: C.surface,
  },
  actionChipDanger: { backgroundColor: C.dangerBg },
  actionChipText: { fontSize: 12, fontWeight: "600", color: C.primary },

  // FAB
  fab: {
    position: "absolute", bottom: 100, right: 24,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: C.primary, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },

  // Estado
  stateCard: {
    backgroundColor: C.white, borderRadius: 16, padding: 24,
    alignItems: "center", gap: 10, marginBottom: 8,
  },
  stateText: { fontSize: 13, color: C.muted, textAlign: "center" },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: C.primary },
  retryText: { fontSize: 12, fontWeight: "700", color: C.white },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: C.white, borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, paddingBottom: 40, gap: 14,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: C.text },
  modalSubtitle: { fontSize: 13, color: C.muted, marginTop: -6 },

  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: C.text },
  fieldInput: { height: 48, borderRadius: 12, backgroundColor: C.inputBg, paddingHorizontal: 14, fontSize: 14, color: C.text },
  fieldTextarea: { height: 100, paddingTop: 12 },

  formError: { fontSize: 12, color: C.danger, textAlign: "center" },
  submitButton: { height: 52, borderRadius: 16, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", marginTop: 4 },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: C.white, fontSize: 15, fontWeight: "700" },

  // Paginação
  pagination: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 16, paddingVertical: 20,
  },
  pageBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: C.white,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  pageBtnDisabled: { backgroundColor: C.border, shadowOpacity: 0, elevation: 0 },
  pageLabel: { fontSize: 14, fontWeight: "700", color: C.text, minWidth: 60, textAlign: "center" },

  // Modal status
  statusOption: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, backgroundColor: C.surface,
  },
  statusOptionActive: { borderWidth: 2, borderColor: C.primary, backgroundColor: C.white },
  statusOptionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statusOptionLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: C.text },
});
