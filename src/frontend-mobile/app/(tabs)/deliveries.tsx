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
  inputBg: "#E9EDF2",
  surface: "#E7EEFF",
  border: "#F1F5F9",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
  orange100: "#FEF3C7",
  orange700: "#B45309",
  green100: "#DCFCE7",
  green700: "#15803D",
  slate100: "#F1F5F9",
  slate500: "#64748B",
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ApiDelivery = {
  id: number;
  recipient_user_id?: number | null;
  recipient_username?: string | null;
  recipient_email?: string | null;
  registered_by_user_id?: number | null;
  registered_by_username?: string | null;
  registered_by_email?: string | null;
  description?: string | null;
  arrival_date?: string | null;
  pickup_date?: string | null;
  status?: string | null;
};

type Resident = { id: number; username: string | null; email: string | null };

type DeliveryForm = {
  description: string;
  recipientUserId: string;
  status: string;
};

const EMPTY_FORM: DeliveryForm = {
  description: "",
  recipientUserId: "",
  status: "Disponível para Retirada",
};

const STATUS_OPTIONS = ["Disponível para Retirada", "Entrega Concluída"] as const;

const FILTER_OPTIONS = ["Todos", "Registrada", "Aguardando retirada", "Entrega Concluída"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusInfo(status: string | null): { label: string; bg: string; color: string; icon: keyof typeof Ionicons.glyphMap } {
  const s = (status ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (s.includes("concluida") || s === "retirada" || s.includes("picked") || s.includes("entregue")) {
    return { label: "Entrega Concluída", bg: C.green100, color: C.green700, icon: "checkmark-circle-outline" };
  }
  if (s.includes("disponiv") || s.includes("aguard")) {
    return { label: "Aguardando retirada", bg: C.orange100, color: C.orange700, icon: "time-outline" };
  }
  if (s.includes("registr")) {
    return { label: "Registrada", bg: C.slate100, color: C.slate500, icon: "cube-outline" };
  }
  return { label: status ?? "—", bg: C.slate100, color: C.slate500, icon: "ellipse-outline" };
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

function recipientLabel(d: ApiDelivery): string {
  return d.recipient_username ?? d.recipient_email ?? "Morador não informado";
}

function registeredByLabel(d: ApiDelivery): string {
  return d.registered_by_username ?? d.registered_by_email ?? "Não informado";
}

// ─── Card de entrega ──────────────────────────────────────────────────────────

function DeliveryCard({ item, onPress }: { item: ApiDelivery; onPress: () => void }) {
  const { label, bg, color, icon } = statusInfo(item.status);

  return (
    <TouchableOpacity style={styles.deliveryCard} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.deliveryContent}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={22} color={C.primary} />
        </View>
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryName} numberOfLines={1}>
            {item.description?.trim() || "Entrega sem descrição"}
          </Text>
          <Text style={styles.deliverySub} numberOfLines={1}>{recipientLabel(item)}</Text>
          <Text style={styles.deliveryMeta}>Chegada: {formatDate(item.arrival_date)}</Text>
        </View>
      </View>
      <View style={styles.deliveryRight}>
        <View style={[styles.badge, { backgroundColor: bg }]}>
          <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={C.muted} style={{ marginTop: 6 }} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Modal de detalhe ─────────────────────────────────────────────────────────

function DetailModal({
  delivery,
  isAdmin,
  onClose,
  onEdit,
  onDelete,
}: {
  delivery: ApiDelivery | null;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: (d: ApiDelivery) => void;
  onDelete: (d: ApiDelivery) => void;
}) {
  if (!delivery) return null;
  const { label, bg, color, icon } = statusInfo(delivery.status);

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { gap: 14 }]} onPress={() => {}}>
          <View style={styles.modalHandle} />

          <View style={[styles.detailBadge, { backgroundColor: bg }]}>
            <Ionicons name={icon} size={14} color={color} />
            <Text style={[styles.detailBadgeText, { color }]}>{label}</Text>
          </View>

          <Text style={styles.detailTitle}>
            {delivery.description?.trim() || "Entrega sem descrição"}
          </Text>

          <View style={styles.detailMeta}>
            <DetailRow icon="person-outline" label="Destinatário" value={recipientLabel(delivery)} />
            <DetailRow icon="person-add-outline" label="Registrado por" value={registeredByLabel(delivery)} />
            <DetailRow icon="calendar-outline" label="Chegada" value={formatDateTime(delivery.arrival_date)} />
            <DetailRow
              icon="checkmark-done-outline"
              label="Retirada"
              value={delivery.pickup_date ? formatDateTime(delivery.pickup_date) : "Aguardando retirada"}
            />
          </View>

          {isAdmin && (
            <View style={styles.detailActions}>
              <TouchableOpacity
                style={styles.detailActionBtn}
                onPress={() => { onClose(); onEdit(delivery); }}
                activeOpacity={0.8}
              >
                <Ionicons name="pencil-outline" size={18} color={C.primary} />
                <Text style={styles.detailActionText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.detailActionBtn, styles.detailActionBtnDanger]}
                onPress={() => { onClose(); onDelete(delivery); }}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={18} color={C.danger} />
                <Text style={[styles.detailActionText, { color: C.danger }]}>Excluir</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={15} color={C.muted} />
      <View style={{ flex: 1 }}>
        <Text style={styles.detailRowLabel}>{label}</Text>
        <Text style={styles.detailRowValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Picker de destinatário ───────────────────────────────────────────────────

function RecipientPicker({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string, label: string) => void;
}) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const token = getAuthToken();
        const data = await apiRequest<Resident[]>("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResidents(Array.isArray(data) ? data : []);
      } catch { /* silencia erro */ }
    }
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return residents;
    return residents.filter(
      (r) =>
        (r.username ?? "").toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q)
    );
  }, [residents, search]);

  function handleSelect(r: Resident) {
    const label = `${r.username ?? r.email}${r.username && r.email ? ` (${r.email})` : ""}`;
    setSelectedLabel(label);
    setSearch("");
    onSelect(String(r.id), label);
  }

  function handleClear() {
    setSelectedLabel("");
    setSearch("");
    onSelect("", "");
  }

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>Destinatário *</Text>

      {selectedLabel ? (
        <View style={styles.selectedChip}>
          <Ionicons name="person-circle-outline" size={16} color={C.primary} />
          <Text style={styles.selectedChipText} numberOfLines={1}>{selectedLabel}</Text>
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={C.muted} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInputInline}
              placeholder="Buscar por nome ou e-mail..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
          </View>
          {search.trim().length > 0 && (
            <View style={styles.dropdownList}>
              {filtered.length === 0 ? (
                <Text style={styles.dropdownEmpty}>Nenhum morador encontrado.</Text>
              ) : (
                filtered.slice(0, 8).map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={styles.dropdownItem}
                    onPress={() => handleSelect(r)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownAvatar}>
                      <Text style={styles.dropdownAvatarText}>
                        {(r.username ?? r.email ?? "?")[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownName}>{r.username ?? "—"}</Text>
                      <Text style={styles.dropdownEmail}>{r.email ?? "—"}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
}

// ─── Modal criar / editar ─────────────────────────────────────────────────────

function DeliveryFormModal({
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
  form: DeliveryForm;
  onChange: (field: keyof DeliveryForm, value: string) => void;
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
              {isEditing ? "Editar Entrega" : "Nova Encomenda"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isEditing ? "Atualize os dados da entrega." : "Preencha os dados para registrar."}
            </Text>

            <FieldInput
              label="Descrição *"
              placeholder="Ex: Caixa Amazon, encomenda Correios..."
              value={form.description}
              onChangeText={(v) => onChange("description", v)}
            />

            <RecipientPicker
              selectedId={form.recipientUserId}
              onSelect={(id) => onChange("recipientUserId", id)}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Status</Text>
              <View style={styles.toggleRow}>
                {STATUS_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.toggleBtn, form.status === s && styles.toggleBtnActive]}
                    onPress={() => onChange("status", s)}
                  >
                    <Text style={[styles.toggleText, form.status === s && styles.toggleTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
                    {isEditing ? "Salvar alterações" : "Registrar entrega"}
                  </Text>
              }
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

function FieldInput({
  label, placeholder, value, onChangeText, keyboardType,
}: {
  label: string; placeholder: string; value: string;
  onChangeText: (v: string) => void; keyboardType?: "email-address" | "default";
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize="none"
      />
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function DeliveriesScreen() {
  const { user } = useAuth();
  const isAdmin = user?.profile === "Administrador";

  const [deliveries, setDeliveries] = useState<ApiDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterOption>("Todos");

  // Modal detalhe
  const [detailTarget, setDetailTarget] = useState<ApiDelivery | null>(null);

  // Modal criar / editar
  const [formModal, setFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ApiDelivery | null>(null);
  const [form, setForm] = useState<DeliveryForm>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  function reload() { setReloadKey((k) => k + 1); }

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormModal(true);
  }

  function openEdit(d: ApiDelivery) {
    setEditTarget(d);
    setForm({
      description: d.description ?? "",
      recipientUserId: d.recipient_user_id ? String(d.recipient_user_id) : "",
      status: d.status ?? "Registrada",
    });
    setFormError("");
    setFormModal(true);
  }

  function handleFormChange(field: keyof DeliveryForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Busca entregas
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setErrorMessage("");
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Faça login novamente.");
        const data = await apiRequest<ApiDelivery[]>("/api/deliveries", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) setDeliveries(Array.isArray(data) ? data : []);
      } catch (e) {
        if (active) setErrorMessage(e instanceof Error ? e.message : "Erro ao carregar entregas.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [reloadKey]);

  // Criar ou editar
  async function handleSubmit() {
    if (!form.description.trim()) { setFormError("Informe a descrição."); return; }
    if (!form.recipientUserId) { setFormError("Selecione o destinatário."); return; }

    setFormError("");
    setFormLoading(true);
    try {
      const token = getAuthToken();
      const body = {
        description: form.description.trim(),
        recipient_user_id: Number(form.recipientUserId),
        arrival_date: editTarget?.arrival_date ?? new Date().toISOString(),
        status: form.status,
      };
      if (editTarget) {
        await apiRequest(`/api/deliveries/${editTarget.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
      } else {
        await apiRequest("/api/deliveries", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
      }
      setFormModal(false);
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao salvar entrega.");
    } finally {
      setFormLoading(false);
    }
  }

  // Excluir
  function handleDelete(d: ApiDelivery) {
    Alert.alert(
      "Excluir entrega",
      `Excluir a entrega "${d.description?.trim() || "sem descrição"}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir", style: "destructive",
          onPress: async () => {
            try {
              const token = getAuthToken();
              await apiRequest(`/api/deliveries/${d.id}`, {
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

  const filtered = useMemo(() => {
    let result = deliveries;

    if (filter !== "Todos") {
      result = result.filter((d) => {
        const info = statusInfo(d.status);
        return info.label === filter;
      });
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((d) =>
        (d.recipient_username ?? "").toLowerCase().includes(q) ||
        (d.recipient_email ?? "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [deliveries, filter, searchQuery]);

  const metrics = useMemo(() => {
    const total = deliveries.length;
    const aguardando = deliveries.filter((d) => {
      const s = (d.status ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      return s.includes("disponiv") || s.includes("aguard");
    }).length;
    const retiradas = deliveries.filter((d) => {
      const s = (d.status ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      return s.includes("concluida") || s === "retirada" || s.includes("picked") || s.includes("entregue");
    }).length;
    const pct = total > 0 ? Math.round((aguardando / total) * 100) : 0;
    return { total, aguardando, retiradas, pct };
  }, [deliveries]);

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              {/* Cabeçalho */}
              <View style={styles.header}>
                <Text style={styles.title}>Entregas</Text>
                <Text style={styles.subtitle}>Acompanhe as encomendas recebidas.</Text>
              </View>

              {/* Métricas */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsRow}>
                <MetricCard label="Total recebidas" value={metrics.total} icon="cube-outline" light />
                <MetricCard label="Aguardando retirada" value={metrics.aguardando} icon="time-outline" />
                <MetricCard label="Concluídas" value={metrics.retiradas} icon="checkmark-circle-outline" light />
              </ScrollView>

              {/* Barra de fila */}
              <View style={styles.queueCard}>
                <View style={styles.queueHeader}>
                  <Text style={styles.queueTitle}>Fila de retirada</Text>
                  <Text style={styles.queuePct}>{metrics.pct}% em espera</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${metrics.pct}%` as any }]} />
                </View>
              </View>

              {/* Busca */}
              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={18} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Pesquisar por morador..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

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

              {/* Cabeçalho lista */}
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Atividade recente</Text>
                <TouchableOpacity onPress={reload}>
                  <Text style={styles.listRefresh}>Atualizar</Text>
                </TouchableOpacity>
              </View>

              {loading && (
                <View style={styles.stateCard}>
                  <ActivityIndicator color={C.primary} />
                  <Text style={styles.stateText}>Carregando entregas...</Text>
                </View>
              )}
              {!loading && errorMessage ? (
                <View style={styles.stateCard}>
                  <Ionicons name="alert-circle-outline" size={22} color={C.danger} />
                  <Text style={[styles.stateText, { color: C.danger }]}>{errorMessage}</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={reload}>
                    <Text style={styles.retryText}>Tentar novamente</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {!loading && !errorMessage && filtered.length === 0 && (
                <View style={styles.stateCard}>
                  <Ionicons name="archive-outline" size={22} color={C.muted} />
                  <Text style={styles.stateText}>
                    {searchQuery ? "Nenhuma entrega encontrada." : "Ainda não há entregas registradas."}
                  </Text>
                </View>
              )}
            </>
          }
          renderItem={({ item }) => (
            <DeliveryCard item={item} onPress={() => setDetailTarget(item)} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />

        {isAdmin && (
          <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.85}>
            <Ionicons name="add" size={30} color={C.white} />
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>

      <DetailModal
        delivery={detailTarget}
        isAdmin={isAdmin}
        onClose={() => setDetailTarget(null)}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <DeliveryFormModal
        visible={formModal}
        isEditing={editTarget !== null}
        form={form}
        onChange={handleFormChange}
        onClose={() => setFormModal(false)}
        onSubmit={handleSubmit}
        loading={formLoading}
        error={formError}
      />
    </SafeAreaView>
  );
}

// ─── Componente de métrica ────────────────────────────────────────────────────

function MetricCard({ label, value, icon, light }: {
  label: string; value: number; icon: keyof typeof Ionicons.glyphMap; light?: boolean;
}) {
  return (
    <View style={[styles.metricCard, light ? styles.metricCardLight : styles.metricCardSurface]}>
      <Ionicons name={icon} size={26} color={C.primary} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  listContent: { padding: 20, paddingBottom: 100 },

  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "800", color: C.text },
  subtitle: { fontSize: 14, color: C.muted, marginTop: 4 },

  metricsRow: { gap: 12, paddingBottom: 4, marginBottom: 16 },
  metricCard: {
    width: 160, borderRadius: 28, padding: 20, gap: 8,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 2,
  },
  metricCardLight: { backgroundColor: C.white },
  metricCardSurface: { backgroundColor: C.surface },
  metricLabel: { fontSize: 12, color: C.muted, fontWeight: "500" },
  metricValue: { fontSize: 24, fontWeight: "800", color: C.text },

  queueCard: {
    backgroundColor: C.white, borderRadius: 24, padding: 20, marginBottom: 16,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 2,
  },
  queueHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  queueTitle: { fontSize: 13, fontWeight: "600", color: C.text },
  queuePct: { fontSize: 12, fontWeight: "700", color: C.primary },
  progressBg: { height: 14, backgroundColor: C.surface, borderRadius: 7, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: C.primary, borderRadius: 7 },

  searchContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.inputBg,
    borderRadius: 12, paddingHorizontal: 12, height: 48, gap: 8, marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  filterScroll: { gap: 8, paddingBottom: 4, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
  },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterChipText: { fontSize: 13, fontWeight: "600", color: C.muted },
  filterChipTextActive: { color: C.white },

  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  listTitle: { fontSize: 12, fontWeight: "700", color: C.text, textTransform: "uppercase", letterSpacing: 0.8 },
  listRefresh: { fontSize: 12, fontWeight: "700", color: C.primary },

  deliveryCard: {
    backgroundColor: C.white, borderRadius: 20, padding: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  deliveryContent: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.surface, alignItems: "center", justifyContent: "center",
  },
  deliveryInfo: { flex: 1, gap: 2 },
  deliveryName: { fontSize: 13, fontWeight: "700", color: C.text },
  deliverySub: { fontSize: 12, color: C.muted },
  deliveryMeta: { fontSize: 11, color: C.muted },
  deliveryRight: { alignItems: "flex-end", gap: 2 },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: "700" },

  stateCard: {
    backgroundColor: C.white, borderRadius: 16, padding: 24,
    alignItems: "center", gap: 10, marginBottom: 8,
  },
  stateText: { fontSize: 13, color: C.muted, textAlign: "center" },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: C.primary },
  retryText: { fontSize: 12, fontWeight: "700", color: C.white },

  fab: {
    position: "absolute", bottom: 100, right: 24,
    width: 60, height: 60, borderRadius: 30, backgroundColor: C.primary,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: C.white, borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, paddingBottom: 40, gap: 14,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: C.text },
  modalSubtitle: { fontSize: 13, color: C.muted, marginTop: -6 },

  // Detalhe
  detailBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, alignSelf: "flex-start",
  },
  detailBadgeText: { fontSize: 13, fontWeight: "700" },
  detailTitle: { fontSize: 20, fontWeight: "800", color: C.text, lineHeight: 26 },
  detailMeta: { gap: 10, paddingTop: 4, borderTopWidth: 1, borderTopColor: C.border },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  detailRowLabel: { fontSize: 10, fontWeight: "600", color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  detailRowValue: { fontSize: 13, fontWeight: "600", color: C.text, marginTop: 1 },
  detailActions: { flexDirection: "row", gap: 10 },
  detailActionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, borderRadius: 14, backgroundColor: C.surface,
  },
  detailActionBtnDanger: { backgroundColor: C.dangerBg },
  detailActionText: { fontSize: 13, fontWeight: "700", color: C.primary },

  // Formulário
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: C.text },
  fieldInput: { height: 48, borderRadius: 12, backgroundColor: C.inputBg, paddingHorizontal: 14, fontSize: 14, color: C.text },

  // Picker de destinatário
  selectedChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
  },
  selectedChipText: { flex: 1, fontSize: 14, color: C.text, fontWeight: "600" },
  searchRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.inputBg, borderRadius: 12, paddingHorizontal: 12, height: 48,
  },
  searchInputInline: { flex: 1, fontSize: 14, color: C.text },
  dropdownList: {
    backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.border,
    marginTop: 4, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  dropdownItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  dropdownAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surface, alignItems: "center", justifyContent: "center",
  },
  dropdownAvatarText: { fontSize: 15, fontWeight: "800", color: C.primary },
  dropdownName: { fontSize: 13, fontWeight: "700", color: C.text },
  dropdownEmail: { fontSize: 11, color: C.muted },
  dropdownEmpty: { padding: 12, fontSize: 13, color: C.muted, textAlign: "center" },
  toggleRow: { flexDirection: "row", gap: 8 },
  toggleBtn: {
    flex: 1, height: 40, borderRadius: 10,
    backgroundColor: C.inputBg, alignItems: "center", justifyContent: "center",
  },
  toggleBtnActive: { backgroundColor: C.primary },
  toggleText: { fontSize: 12, fontWeight: "600", color: C.muted },
  toggleTextActive: { color: C.white },
  formError: { fontSize: 12, color: C.danger, textAlign: "center" },
  submitButton: {
    height: 52, borderRadius: 16, backgroundColor: C.primary,
    alignItems: "center", justifyContent: "center", marginTop: 4,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: C.white, fontSize: 15, fontWeight: "700" },
});
