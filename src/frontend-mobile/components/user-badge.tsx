import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

const PROFILE_CONFIG: Record<string, { label: string; bg: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Administrador: { label: "Administrador", bg: "#EEF2FF", color: "#3730A3", icon: "shield-checkmark-outline" },
  Morador:       { label: "Morador",       bg: "#F0FDF4", color: "#166534", icon: "person-outline" },
};

const DEFAULT_CONFIG = { label: "Usuário", bg: "#F1F5F9", color: "#475569", icon: "person-outline" as keyof typeof Ionicons.glyphMap };

export function UserBadge() {
  const { user } = useAuth();

  if (!user) return null;

  const profile = user.profile ?? "";
  const cfg = PROFILE_CONFIG[profile] ?? DEFAULT_CONFIG;
  const displayName = user.username ?? user.email ?? "Usuário";

  return (
    <View style={styles.container}>
      <View style={styles.nameRow}>
        <Ionicons name="person-circle-outline" size={18} color="#40557B" />
        <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={12} color={cfg.color} />
        <Text style={[styles.badgeLabel, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111C2D",
    flexShrink: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
