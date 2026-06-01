import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  bg: "#F9F9FF",
  primary: "#40557B",
  text: "#111C2D",
  muted: "#5A5F63",
  white: "#FFFFFF",
  surface: "#E7EEFF",
};

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Condominio</Text>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>
              Visão geral rápida das áreas logadas.
            </Text>
          </View>
          <View style={styles.iconPill}>
            <Ionicons name="business-outline" size={22} color={COLORS.primary} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pendências</Text>
            <Text style={styles.statValue}>12</Text>
          </View>
          <View style={styles.statCardSoft}>
            <Text style={styles.statLabel}>Entregas</Text>
            <Text style={styles.statValue}>124</Text>
          </View>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.sectionTitle}>Atalhos</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/deliveries")}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.white} />
            <Text style={styles.actionText}>Abrir reservas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    marginTop: 4,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.muted,
    maxWidth: 250,
  },
  iconPill: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  statCardSoft: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 8,
  },
  actionCard: {
    padding: 20,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  actionButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
