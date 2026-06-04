import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const C = {
  bg: "#F9F9FF",
  primary: "#40557B",
  text: "#111C2D",
  muted: "#5A5F63",
  white: "#FFFFFF",
  surface: "#E7EEFF",
  inputBg: "#E9EDF2",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  border: "#F1F5F9",
};

const PROFILE_CONFIG: Record<string, { label: string; bg: string; color: string; icon: "shield-checkmark" | "home" }> = {
  Administrador: { label: "Administrador", bg: "#EEF2FF", color: "#3730A3", icon: "shield-checkmark" },
  Morador:       { label: "Morador",       bg: "#F0FDF4", color: "#166534", icon: "home" },
};

type EditForm = { username: string; email: string; password: string };

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<EditForm>({ username: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const profile = user?.profile ?? "";
  const profileCfg = PROFILE_CONFIG[profile] ?? { label: profile || "Usuário", bg: "#F1F5F9", color: "#475569", icon: "person" as const };
  const initials = (user?.username ?? user?.email ?? "?")[0].toUpperCase();

  function openEdit() {
    setForm({ username: user?.username ?? "", email: user?.email ?? "", password: "" });
    setError("");
    setShowPassword(false);
    setEditOpen(true);
  }

  async function handleSave() {
    if (!form.username.trim()) { setError("Informe o nome."); return; }
    if (!form.email.trim()) { setError("Informe o e-mail."); return; }

    setSaving(true);
    setError("");
    try {
      const token = getAuthToken();
      const body: Record<string, string> = {
        username: form.username.trim(),
        email: form.email.trim(),
      };
      if (form.password.trim()) body.password = form.password.trim();

      const updated = await apiRequest<{ username: string | null; email: string | null }>("/api/users/me", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      updateUser({ username: updated.username, email: updated.email });
      setEditOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Conta</Text>
            <Text style={styles.title}>Meu Perfil</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={openEdit} activeOpacity={0.8}>
            <Ionicons name="pencil-outline" size={18} color={C.primary} />
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.username ?? "—"}</Text>
          <View style={[styles.profileBadge, { backgroundColor: profileCfg.bg }]}>
            <Ionicons name={profileCfg.icon} size={14} color={profileCfg.color} />
            <Text style={[styles.profileLabel, { color: profileCfg.color }]}>{profileCfg.label}</Text>
          </View>
        </View>

        {/* Informações */}
        <View style={styles.infoCard}>
          <InfoRow icon="mail-outline" label="E-mail" value={user?.email ?? "—"} />
          <View style={styles.divider} />
          <InfoRow icon="person-outline" label="Nome" value={user?.username ?? "—"} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={C.danger} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de edição */}
      <Modal visible={editOpen} animationType="slide" transparent onRequestClose={() => setEditOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEditOpen(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ width: "100%" }}
          >
            <Pressable style={styles.modalSheet} onPress={() => {}}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <Text style={styles.modalSubtitle}>Atualize seus dados de acesso.</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Nome</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Seu nome"
                  placeholderTextColor="#94A3B8"
                  value={form.username}
                  onChangeText={(v) => setForm((f) => ({ ...f, username: v }))}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>E-mail</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="seu@email.com"
                  placeholderTextColor="#94A3B8"
                  value={form.email}
                  onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Nova senha <Text style={styles.optional}>(opcional)</Text></Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Deixe em branco para manter"
                    placeholderTextColor="#94A3B8"
                    value={form.password}
                    onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword((p) => !p)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={C.muted} />
                  </TouchableOpacity>
                </View>
              </View>

              {error ? <Text style={styles.formError}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveDisabled]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving
                  ? <ActivityIndicator color={C.white} />
                  : <Text style={styles.saveText}>Salvar alterações</Text>
                }
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={C.muted} />
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, gap: 20, paddingBottom: 40 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  kicker: { fontSize: 12, fontWeight: "800", letterSpacing: 1.4, color: C.primary, textTransform: "uppercase" },
  title: { fontSize: 30, fontWeight: "800", color: C.text, marginTop: 2 },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: C.surface,
  },
  editBtnText: { fontSize: 13, fontWeight: "700", color: C.primary },

  avatarCard: {
    backgroundColor: C.white, borderRadius: 28, padding: 28,
    alignItems: "center", gap: 12,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 2,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.surface, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 28, fontWeight: "800", color: C.primary },
  name: { fontSize: 20, fontWeight: "700", color: C.text },
  profileBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  profileLabel: { fontSize: 13, fontWeight: "700" },

  infoCard: {
    backgroundColor: C.white, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 8,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 2,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16 },
  infoText: { flex: 1, gap: 2 },
  infoLabel: { fontSize: 11, fontWeight: "600", color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  infoValue: { fontSize: 15, fontWeight: "600", color: C.text },
  divider: { height: 1, backgroundColor: C.border },

  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, borderRadius: 16, backgroundColor: C.dangerBg },
  logoutText: { fontSize: 15, fontWeight: "700", color: C.danger },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: C.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, paddingBottom: 40, gap: 16 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: C.text },
  modalSubtitle: { fontSize: 13, color: C.muted, marginTop: -8 },

  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: C.text },
  optional: { fontSize: 12, fontWeight: "400", color: C.muted },
  fieldInput: { height: 48, borderRadius: 12, backgroundColor: C.inputBg, paddingHorizontal: 14, fontSize: 14, color: C.text },
  passwordRow: { flexDirection: "row", alignItems: "center", backgroundColor: C.inputBg, borderRadius: 12, paddingHorizontal: 14, height: 48, gap: 8 },
  passwordInput: { flex: 1, fontSize: 14, color: C.text },

  formError: { fontSize: 12, color: C.danger, textAlign: "center" },
  saveButton: { height: 52, borderRadius: 16, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  saveDisabled: { opacity: 0.7 },
  saveText: { color: C.white, fontSize: 15, fontWeight: "700" },
});
