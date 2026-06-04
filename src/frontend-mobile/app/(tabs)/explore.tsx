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
  green100: "#DCFCE7",
  green700: "#15803D",
  indigo100: "#EEF2FF",
  indigo700: "#3730A3",
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Resident = {
  id: number;
  username: string | null;
  email: string | null;
  profile: string | null;
};

type ResidentForm = {
  username: string;
  email: string;
  password: string;
  profile: "Morador" | "Administrador";
};

const EMPTY_FORM: ResidentForm = {
  username: "",
  email: "",
  password: "",
  profile: "Morador",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitial(resident: Resident): string {
  return (resident.username ?? resident.email ?? "?")[0].toUpperCase();
}

function profileConfig(profile: string | null) {
  if (profile === "Administrador") {
    return { label: "Administrador", bg: C.indigo100, color: C.indigo700, icon: "shield-checkmark" as const };
  }
  return { label: "Morador", bg: C.green100, color: C.green700, icon: "home" as const };
}

// ─── Componentes menores ──────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ResidentCard({
  item,
  isAdmin,
  onEdit,
  onDelete,
}: {
  item: Resident;
  isAdmin: boolean;
  onEdit: (r: Resident) => void;
  onDelete: (r: Resident) => void;
}) {
  const cfg = profileConfig(item.profile);

  return (
    <View style={styles.residentCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitial(item)}</Text>
      </View>

      <View style={styles.residentInfo}>
        <Text style={styles.residentName} numberOfLines={1}>
          {item.username ?? "—"}
        </Text>
        <Text style={styles.residentEmail} numberOfLines={1}>
          {item.email ?? "—"}
        </Text>
        <View style={[styles.profileBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={11} color={cfg.color} />
          <Text style={[styles.profileBadgeText, { color: cfg.color }]}>
            {cfg.label}
          </Text>
        </View>
      </View>

      {isAdmin && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onEdit(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil-outline" size={16} color={C.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={() => onDelete(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color={C.danger} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Modal: Criar residente ───────────────────────────────────────────────────

function CreateResidentModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<ResidentForm>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleClose() {
    setForm(EMPTY_FORM);
    setError("");
    onClose();
  }

  async function handleSubmit() {
    if (!form.username.trim()) { setError("Informe o nome."); return; }
    if (!form.email.trim()) { setError("Informe o e-mail."); return; }
    if (!form.password.trim()) { setError("Informe a senha."); return; }

    setError("");
    setLoading(true);
    try {
      const token = getAuthToken();
      await apiRequest("/api/users", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password_hash: form.password.trim(),
          profile: form.profile,
        }),
      });
      handleClose();
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar residente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Novo Residente</Text>
          <Text style={styles.modalSubtitle}>Preencha os dados para cadastrar.</Text>

          <FieldInput
            label="Nome *"
            placeholder="Nome completo"
            value={form.username}
            onChangeText={(v) => setForm((f) => ({ ...f, username: v }))}
          />
          <FieldInput
            label="E-mail *"
            placeholder="email@exemplo.com"
            value={form.email}
            onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
            keyboardType="email-address"
          />
          <FieldInput
            label="Senha *"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
            secureTextEntry
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Perfil</Text>
            <View style={styles.toggleRow}>
              {(["Morador", "Administrador"] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.toggleBtn, form.profile === p && styles.toggleBtnActive]}
                  onPress={() => setForm((f) => ({ ...f, profile: p }))}
                >
                  <Text style={[styles.toggleText, form.profile === p && styles.toggleTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {error ? <Text style={styles.formError}>{error}</Text> : null}

          <SubmitButton label="Cadastrar residente" onPress={handleSubmit} loading={loading} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Modal: Editar residente ──────────────────────────────────────────────────

function EditResidentModal({
  visible,
  resident,
  onClose,
  onUpdated,
}: {
  visible: boolean;
  resident: Resident | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [form, setForm] = useState<ResidentForm>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resident) {
      setForm({
        username: resident.username ?? "",
        email: resident.email ?? "",
        password: "",
        profile: (resident.profile as ResidentForm["profile"]) ?? "Morador",
      });
    }
  }, [resident]);

  function handleClose() {
    setError("");
    onClose();
  }

  async function handleSubmit() {
    if (!form.username.trim()) { setError("Informe o nome."); return; }
    if (!form.email.trim()) { setError("Informe o e-mail."); return; }

    setError("");
    setLoading(true);
    try {
      const token = getAuthToken();
      await apiRequest(`/api/users/${resident?.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password_hash: form.password.trim() || undefined,
          profile: form.profile,
        }),
      });
      handleClose();
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao atualizar residente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Editar Residente</Text>
          <Text style={styles.modalSubtitle}>Atualize os dados do residente.</Text>

          <FieldInput
            label="Nome *"
            placeholder="Nome completo"
            value={form.username}
            onChangeText={(v) => setForm((f) => ({ ...f, username: v }))}
          />
          <FieldInput
            label="E-mail *"
            placeholder="email@exemplo.com"
            value={form.email}
            onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
            keyboardType="email-address"
          />
          <FieldInput
            label="Nova senha (opcional)"
            placeholder="Deixe em branco para manter"
            value={form.password}
            onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
            secureTextEntry
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Perfil</Text>
            <View style={styles.toggleRow}>
              {(["Morador", "Administrador"] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.toggleBtn, form.profile === p && styles.toggleBtnActive]}
                  onPress={() => setForm((f) => ({ ...f, profile: p }))}
                >
                  <Text style={[styles.toggleText, form.profile === p && styles.toggleTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {error ? <Text style={styles.formError}>{error}</Text> : null}

          <SubmitButton label="Salvar alterações" onPress={handleSubmit} loading={loading} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Componentes reutilizáveis de formulário ──────────────────────────────────

function FieldInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: "email-address" | "default";
  secureTextEntry?: boolean;
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
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

function SubmitButton({
  label,
  onPress,
  loading,
}: {
  label: string;
  onPress: () => void;
  loading: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.submitButton, loading && styles.submitDisabled]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color={C.white} />
        : <Text style={styles.submitText}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const PAGE_SIZE = 8;

// ─── Componente de paginação ──────────────────────────────────────────────────

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
      <Text style={styles.pageLabel}>
        {page} / {totalPages}
      </Text>
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

export default function ResidentsScreen() {
  const { user } = useAuth();
  const isAdmin = user?.profile === "Administrador";

  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Resident | null>(null);

  function reload() {
    setReloadKey((k) => k + 1);
  }

  function handleDeleteConfirm(resident: Resident) {
    Alert.alert(
      "Excluir residente",
      `Tem certeza que deseja excluir "${resident.username ?? resident.email}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const token = getAuthToken();
              await apiRequest(`/api/users/${resident.id}`, {
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

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = getAuthToken();
        const data = await apiRequest<Resident[]>("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) setResidents(Array.isArray(data) ? data : []);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Erro ao carregar residentes.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [isAdmin, reloadKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return residents;
    return residents.filter(
      (r) =>
        (r.username ?? "").toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q) ||
        (r.profile ?? "").toLowerCase().includes(q)
    );
  }, [residents, search]);

  // Reseta para página 1 quando a busca muda
  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: residents.length,
    admins: residents.filter((r) => r.profile === "Administrador").length,
    moradores: residents.filter((r) => r.profile === "Morador").length,
  }), [residents]);

  // ── Vista do Morador (sem acesso) ─────────────────────────────────────────
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.restrictedContainer}>
          <View style={styles.restrictedIcon}>
            <Ionicons name="lock-closed-outline" size={40} color={C.primary} />
          </View>
          <Text style={styles.restrictedTitle}>Acesso restrito</Text>
          <Text style={styles.restrictedSub}>
            A listagem de residentes é exclusiva para administradores do condomínio.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Vista do Administrador ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          data={paginated}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              {/* Cabeçalho */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.kicker}>Condomínio</Text>
                  <Text style={styles.title}>Residentes</Text>
                  <Text style={styles.subtitle}>Gerencie os moradores cadastrados.</Text>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <StatCard label="Total" value={stats.total} />
                <StatCard label="Moradores" value={stats.moradores} />
                <StatCard label="Admins" value={stats.admins} />
              </View>

              {/* Busca */}
              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={18} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por nome, e-mail ou perfil..."
                  placeholderTextColor="#94A3B8"
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Estado de loading / erro */}
              {loading && (
                <View style={styles.stateCard}>
                  <ActivityIndicator color={C.primary} />
                  <Text style={styles.stateText}>Carregando residentes...</Text>
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
                  <Ionicons name="people-outline" size={22} color={C.muted} />
                  <Text style={styles.stateText}>
                    {search ? "Nenhum residente encontrado." : "Nenhum residente cadastrado."}
                  </Text>
                </View>
              )}
            </>
          }
          renderItem={({ item }) => (
            <ResidentCard
              item={item}
              isAdmin={isAdmin}
              onEdit={(r) => setEditTarget(r)}
              onDelete={handleDeleteConfirm}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListFooterComponent={
            <Pagination
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          }
        />
      </KeyboardAvoidingView>

      <TouchableOpacity style={styles.fab} onPress={() => setCreateOpen(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={30} color={C.white} />
      </TouchableOpacity>

      <CreateResidentModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={reload}
      />

      <EditResidentModal
        visible={editTarget !== null}
        resident={editTarget}
        onClose={() => setEditTarget(null)}
        onUpdated={() => { setEditTarget(null); reload(); }}
      />
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 0,
  },

  // Cabeçalho
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: C.primary,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: C.text,
    marginTop: 2,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: C.muted,
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: C.text,
  },
  statLabel: {
    fontSize: 11,
    color: C.muted,
    fontWeight: "600",
  },

  // Busca
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.text,
  },

  // Card de residente
  residentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: C.primary,
  },
  residentInfo: {
    flex: 1,
    gap: 3,
  },
  residentName: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
  },
  residentEmail: {
    fontSize: 12,
    color: C.muted,
  },
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  profileBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnDanger: {
    backgroundColor: C.dangerBg,
  },

  // Estado (loading/erro/vazio)
  stateCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  stateText: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: C.primary,
  },
  retryText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.white,
  },

  // Vista restrita (Morador)
  restrictedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  restrictedIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.text,
  },
  restrictedSub: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    lineHeight: 22,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    paddingBottom: 40,
    gap: 14,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: -6,
  },

  // Formulário
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
  },
  fieldInput: {
    height: 48,
    borderRadius: 12,
    backgroundColor: C.inputBg,
    paddingHorizontal: 14,
    fontSize: 14,
    color: C.text,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBtnActive: {
    backgroundColor: C.primary,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.muted,
  },
  toggleTextActive: {
    color: C.white,
  },
  formError: {
    fontSize: 12,
    color: C.danger,
    textAlign: "center",
  },
  submitButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "700",
  },

  // Paginação
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 20,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pageBtnDisabled: {
    backgroundColor: C.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  pageLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    minWidth: 60,
    textAlign: "center",
  },
});
