import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";

const COLORS = {
  bg: "#F9F9FF",
  primary: "#40557B",
  text: "#111C2D",
  muted: "#5A5F63",
  white: "#FFFFFF",
  surface: "#E7EEFF",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
};

const PROFILE_CONFIG: Record<string, { label: string; bg: string; color: string; icon: "shield-checkmark" | "home" }> = {
  Administrador: { label: "Administrador", bg: "#EEF2FF", color: "#3730A3", icon: "shield-checkmark" },
  Morador:       { label: "Morador",       bg: "#F0FDF4", color: "#166534", icon: "home" },
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const profile = user?.profile ?? "";
  const profileCfg = PROFILE_CONFIG[profile] ?? { label: profile || "Usuário", bg: "#F1F5F9", color: "#475569", icon: "person" as const };
  const initials = (user?.username ?? user?.email ?? "?")[0].toUpperCase();

  function handleLogout() {
    logout();
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Conta</Text>
          <Text style={styles.title}>Meu Perfil</Text>
        </View>

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

        <View style={styles.infoCard}>
          <InfoRow icon="mail-outline" label="E-mail" value={user?.email ?? "—"} />
          <View style={styles.divider} />
          <InfoRow icon="person-outline" label="Usuário" value={user?.username ?? "—"} />
          <View style={styles.divider} />
          <InfoRow icon="id-card-outline" label="ID" value={user?.id != null ? String(user.id) : "—"} />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={COLORS.muted} />
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 20,
  },
  header: {
    gap: 4,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: COLORS.primary,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.text,
  },
  avatarCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  profileLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.dangerBg,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.danger,
  },
});
