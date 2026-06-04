import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
  unreadBg: "#EEF2FF",
  unreadBorder: "#C7D2FE",
  green100: "#DCFCE7",
  green700: "#15803D",
  orange100: "#FEF3C7",
  orange700: "#B45309",
  slate100: "#F1F5F9",
  slate500: "#64748B",
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Notification = {
  id: number;
  user_id: number;
  type: string | null;
  message: string | null;
  is_read: boolean;
  reservation_id: number | null;
  occurrence_id: number | null;
  delivery_id: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type FilterOption = "Todas" | "Não lidas" | "Lidas";
const FILTER_OPTIONS: FilterOption[] = ["Todas", "Não lidas", "Lidas"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, "0"); }

function toUTC(iso: string): string {
  return /Z|[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + "Z";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(toUTC(iso));
  if (isNaN(d.getTime())) return "—";
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Agora mesmo";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ontem";
  if (days < 7) return `${days} dias atrás`;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function typeInfo(type: string | null): {
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  color: string;
  label: string;
} {
  const t = (type ?? "").toLowerCase();
  if (t.includes("encomenda") || t.includes("delivery") || t.includes("entrega")) {
    return { icon: "cube-outline", bg: C.orange100, color: C.orange700, label: "Encomenda" };
  }
  if (t.includes("nova reserva") || (t.includes("reserva") && t.includes("nova"))) {
    return { icon: "calendar-outline", bg: C.surface, color: C.primary, label: "Nova reserva" };
  }
  if (t.includes("reserva") && t.includes("confirm")) {
    return { icon: "calendar-outline", bg: C.green100, color: C.green700, label: "Reserva confirmada" };
  }
  if (t.includes("reserva") && t.includes("cancel")) {
    return { icon: "calendar-outline", bg: C.dangerBg, color: C.danger, label: "Reserva cancelada" };
  }
  if (t.includes("reserva")) {
    return { icon: "calendar-outline", bg: C.surface, color: C.primary, label: "Reserva" };
  }
  if (t.includes("nova ocorr") || (t.includes("ocorr") && t.includes("nova"))) {
    return { icon: "alert-circle-outline", bg: C.orange100, color: C.orange700, label: "Nova ocorrência" };
  }
  if (t.includes("ocorr")) {
    return { icon: "alert-circle-outline", bg: C.orange100, color: C.orange700, label: "Ocorrência" };
  }
  return { icon: "notifications-outline", bg: C.surface, color: C.primary, label: type ?? "Aviso" };
}

// ─── Card de notificação ──────────────────────────────────────────────────────

function NotificationCard({
  item,
  onPress,
  onDelete,
  onToggleRead,
}: {
  item: Notification;
  onPress: () => void;
  onDelete: () => void;
  onToggleRead: () => void;
}) {
  const { icon, bg, color } = typeInfo(item.type);

  return (
    <View style={[styles.card, !item.is_read && styles.cardUnread]}>
      {/* Área clicável — abre o detalhe */}
      <TouchableOpacity
        style={styles.cardPressable}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={[styles.cardIcon, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={20} color={color} />
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.cardType, !item.is_read && styles.cardTypeUnread]}>
            {typeInfo(item.type).label}
          </Text>
          <Text style={styles.cardMessage} numberOfLines={2}>
            {item.message ?? "Sem mensagem"}
          </Text>
          <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
        </View>
      </TouchableOpacity>

      {/* Botões fora do TouchableOpacity do card */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onToggleRead}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.is_read ? "mail-outline" : "mail-open-outline"}
            size={16}
            color={C.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnDanger]}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={C.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Modal de detalhe ─────────────────────────────────────────────────────────

function DetailModal({
  notification,
  onClose,
}: {
  notification: Notification | null;
  onClose: () => void;
}) {
  if (!notification) return null;
  const { icon, bg, color, label } = typeInfo(notification.type);

  const links = [];
  if (notification.delivery_id) links.push(`Entrega #${notification.delivery_id}`);
  if (notification.reservation_id) links.push(`Reserva #${notification.reservation_id}`);
  if (notification.occurrence_id) links.push(`Ocorrência #${notification.occurrence_id}`);

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { gap: 14 }]} onPress={() => {}}>
          <View style={styles.modalHandle} />

          <View style={styles.detailIconRow}>
            <View style={[styles.detailIconBig, { backgroundColor: bg }]}>
              <Ionicons name={icon} size={28} color={color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={styles.detailDate}>{formatDate(notification.created_at)}</Text>
            </View>
            <View style={[styles.readBadge, notification.is_read ? styles.readBadgeRead : styles.readBadgeUnread]}>
              <Text style={[styles.readBadgeText, notification.is_read ? styles.readBadgeTextRead : styles.readBadgeTextUnread]}>
                {notification.is_read ? "Lida" : "Não lida"}
              </Text>
            </View>
          </View>

          <Text style={styles.detailMessage}>
            {notification.message ?? "Sem mensagem."}
          </Text>

          {links.length > 0 && (
            <View style={styles.detailLinks}>
              <Text style={styles.detailLinksLabel}>Vinculado a:</Text>
              {links.map((l) => (
                <View key={l} style={styles.detailLinkChip}>
                  <Ionicons name="link-outline" size={12} color={C.primary} />
                  <Text style={styles.detailLinkText}>{l}</Text>
                </View>
              ))}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const { user } = useAuth();
  const isAdmin = user?.profile === "Administrador";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState<FilterOption>("Todas");
  const [detailTarget, setDetailTarget] = useState<Notification | null>(null);

  function reload() { setReloadKey((k) => k + 1); }

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = getAuthToken();
        const path = isAdmin
          ? "/api/notifications"
          : `/api/notifications?userId=${user?.id}`;

        const data = await apiRequest<Notification[]>(path, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (active) setNotifications(Array.isArray(data) ? data : []);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Erro ao carregar notificações.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [isAdmin, user?.id, reloadKey]);

  async function handleToggleRead(n: Notification) {
    try {
      const token = getAuthToken();
      await apiRequest(`/api/notifications/${n.id}/read-status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isRead: !n.is_read }),
      });
      setNotifications((prev) =>
        prev.map((x) => x.id === n.id ? { ...x, is_read: !n.is_read } : x)
      );
    } catch (e) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Não foi possível atualizar.");
    }
  }

  async function handleMarkAllRead() {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    const token = getAuthToken();
    await Promise.allSettled(
      unread.map((n) =>
        apiRequest(`/api/notifications/${n.id}/read-status`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ isRead: true }),
        })
      )
    );
    setNotifications((prev) => prev.map((x) => ({ ...x, is_read: true })));
  }

  async function handleDelete(n: Notification) {
    try {
      const token = getAuthToken();
      await apiRequest(`/api/notifications/${n.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((x) => x.id !== n.id));
    } catch (e) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Não foi possível excluir.");
    }
  }

  function handlePress(n: Notification) {
    setDetailTarget(n);
    if (!n.is_read) handleToggleRead(n);
  }

  const filtered = useMemo(() => {
    if (filter === "Não lidas") return notifications.filter((n) => !n.is_read);
    if (filter === "Lidas") return notifications.filter((n) => n.is_read);
    return notifications;
  }, [notifications, filter]);

  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter((n) => !n.is_read).length,
    read: notifications.filter((n) => n.is_read).length,
  }), [notifications]);

  return (
    <SafeAreaView style={styles.root}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Cabeçalho */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.kicker}>Condomínio</Text>
                <Text style={styles.title}>Notificações</Text>
                <Text style={styles.subtitle}>
                  {isAdmin ? "Todos os avisos do sistema." : "Seus avisos e atualizações."}
                </Text>
              </View>
              <View style={styles.headerRight}>
                {stats.unread > 0 && (
                  <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead} activeOpacity={0.8}>
                    <Ionicons name="mail-open-outline" size={15} color={C.primary} />
                    <Text style={styles.markAllText}>Marcar todas</Text>
                  </TouchableOpacity>
                )}
                <View style={styles.iconPill}>
                  <Ionicons name="notifications-outline" size={22} color={C.primary} />
                  {stats.unread > 0 && (
                    <View style={styles.badgeCount}>
                      <Text style={styles.badgeCountText}>
                        {stats.unread > 99 ? "99+" : stats.unread}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatCard label="Total" value={stats.total} color={C.primary} loading={loading} />
              <StatCard label="Não lidas" value={stats.unread} color={C.danger} loading={loading} accent />
              <StatCard label="Lidas" value={stats.read} color={C.slate500} loading={loading} />
            </View>

            {/* Filtros */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {FILTER_OPTIONS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, filter === f && styles.filterChipActive]}
                  onPress={() => setFilter(f)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Estados */}
            {loading && (
              <View style={styles.stateCard}>
                <ActivityIndicator color={C.primary} />
                <Text style={styles.stateText}>Carregando notificações...</Text>
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
                <Ionicons name="notifications-off-outline" size={28} color={C.muted} />
                <Text style={styles.stateText}>
                  {filter === "Todas" ? "Nenhuma notificação." : `Nenhuma notificação "${filter.toLowerCase()}".`}
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <NotificationCard
            item={item}
            onPress={() => handlePress(item)}
            onDelete={() => handleDelete(item)}
            onToggleRead={() => handleToggleRead(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

      <DetailModal
        notification={detailTarget}
        onClose={() => setDetailTarget(null)}
      />
    </SafeAreaView>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, color, loading, accent }: {
  label: string; value: number; color: string; loading: boolean; accent?: boolean;
}) {
  return (
    <View style={[styles.statCard, accent && value > 0 && styles.statCardAccent]}>
      {loading
        ? <ActivityIndicator size="small" color={color} />
        : <Text style={[styles.statValue, { color }]}>{value}</Text>
      }
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  listContent: { padding: 20, paddingBottom: 40 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  kicker: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, color: C.primary, textTransform: "uppercase" },
  title: { fontSize: 26, fontWeight: "800", color: C.text, marginTop: 2 },
  subtitle: { marginTop: 4, fontSize: 13, color: C.muted },
  headerRight: { alignItems: "flex-end", gap: 8 },
  markAllBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: C.surface },
  markAllText: { fontSize: 11, fontWeight: "700", color: C.primary },
  iconPill: { width: 48, height: 48, borderRadius: 16, backgroundColor: C.surface, alignItems: "center", justifyContent: "center" },
  badgeCount: { position: "absolute", top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: C.danger, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  badgeCountText: { fontSize: 9, fontWeight: "800", color: C.white },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: C.white, borderRadius: 16, padding: 14, alignItems: "center", gap: 4, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  statCardAccent: { backgroundColor: C.dangerBg },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, color: C.muted, fontWeight: "600" },

  filterScroll: { gap: 8, paddingBottom: 4, marginBottom: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: C.white, borderWidth: 1, borderColor: C.border },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterChipText: { fontSize: 13, fontWeight: "600", color: C.muted },
  filterChipTextActive: { color: C.white },

  // Card de notificação
  card: { flexDirection: "row", alignItems: "center", backgroundColor: C.white, borderRadius: 16, paddingRight: 10, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1, overflow: "hidden" },
  cardUnread: { backgroundColor: C.unreadBg, borderWidth: 1, borderColor: C.unreadBorder },
  cardPressable: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
  cardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  unreadDot: { position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: C.danger, borderWidth: 2, borderColor: C.white },
  cardContent: { flex: 1, gap: 3 },
  cardType: { fontSize: 11, fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  cardTypeUnread: { color: C.primary },
  cardMessage: { fontSize: 13, color: C.text, lineHeight: 18 },
  cardDate: { fontSize: 11, color: C.muted },
  cardActions: { gap: 6, flexShrink: 0 },
  actionBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: C.surface, alignItems: "center", justifyContent: "center" },
  actionBtnDanger: { backgroundColor: C.dangerBg },

  stateCard: { backgroundColor: C.white, borderRadius: 16, padding: 24, alignItems: "center", gap: 10, marginBottom: 8 },
  stateText: { fontSize: 13, color: C.muted, textAlign: "center" },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: C.primary },
  retryText: { fontSize: 12, fontWeight: "700", color: C.white },

  // Modal de detalhe
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: C.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 12 },
  detailIconRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  detailIconBig: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  detailLabel: { fontSize: 15, fontWeight: "700", color: C.text },
  detailDate: { fontSize: 12, color: C.muted, marginTop: 2 },
  readBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  readBadgeRead: { backgroundColor: C.green100 },
  readBadgeUnread: { backgroundColor: C.dangerBg },
  readBadgeText: { fontSize: 11, fontWeight: "700" },
  readBadgeTextRead: { color: C.green700 },
  readBadgeTextUnread: { color: C.danger },
  detailMessage: { fontSize: 15, color: C.text, lineHeight: 24, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.border },
  detailLinks: { gap: 8 },
  detailLinksLabel: { fontSize: 11, fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  detailLinkChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.surface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf: "flex-start" },
  detailLinkText: { fontSize: 12, fontWeight: "600", color: C.primary },
});
