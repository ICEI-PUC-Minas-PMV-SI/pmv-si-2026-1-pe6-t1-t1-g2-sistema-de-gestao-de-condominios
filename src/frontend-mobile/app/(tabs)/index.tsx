import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
  orange100: "#FEF3C7",
  orange700: "#B45309",
  green100: "#DCFCE7",
  green700: "#15803D",
  red100: "#FEE2E2",
  red700: "#B91C1C",
  amber100: "#FEF3C7",
  amber700: "#92400E",
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Delivery = {
  id: number;
  description: string | null;
  status: string | null;
  arrival_date: string;
  pickup_date: string | null;
  recipient_user_id: number | null;
  recipient_username: string | null;
  registered_by_username: string | null;
};

type Reservation = {
  id: number;
  common_area_id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  status: string;
};

type CommonArea = {
  id: number;
  name: string;
};

type ResidentUser = {
  id: number;
  username: string | null;
  email: string | null;
};

type Notice = {
  id: number;
  title: string;
  description: string;
  type: "info" | "warning";
};

// ─── Dados estáticos ──────────────────────────────────────────────────────────

const NOTICES: Notice[] = [
  {
    id: 1,
    title: "Manutenção da piscina",
    description: "Piscina fechada nos dias 14 e 15/05 para limpeza programada.",
    type: "info",
  },
  {
    id: 2,
    title: "Falta d'água prevista",
    description: "Possível interrupção no abastecimento em 16/05 das 08h às 12h.",
    type: "warning",
  },
  {
    id: 3,
    title: "Assembleia ordinária",
    description: "Reunião de condôminos em 20/05 às 19h no salão principal.",
    type: "info",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

function formatTime(value: string): string {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isPending(status: string | null): boolean {
  const s = (status ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return (
    s.includes("aguard") ||
    s.includes("disponiv") ||   // "Disponível para Retirada"
    s.includes("available") ||  // "available_for_pickup"
    s.includes("registered") ||
    s.includes("pendente")
  );
}

function deliveryStatusInfo(status: string | null): { label: string; bg: string; color: string } {
  const s = (status ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (s.includes("concluida") || s === "retirada" || s.includes("picked") || s.includes("withdrawn")) {
    return { label: "Concluída", bg: C.green100, color: C.green700 };
  }
  if (s.includes("aguard") || s.includes("disponiv") || s.includes("available")) {
    return { label: "Aguardando retirada", bg: C.orange100, color: C.orange700 };
  }
  if (s.includes("registr") || s.includes("registered")) {
    return { label: "Registrada", bg: C.surface, color: C.muted };
  }
  return { label: status ?? "—", bg: C.surface, color: C.muted };
}

function reservationStatusInfo(status: string): { bg: string; color: string } {
  switch (status) {
    case "Aprovada":
    case "Confirmada":
      return { bg: C.green100, color: C.green700 };
    case "Pendente":
      return { bg: C.amber100, color: C.amber700 };
    case "Cancelada":
    case "Rejeitada":
      return { bg: C.red100, color: C.red700 };
    default:
      return { bg: C.surface, color: C.muted };
  }
}

// ─── Componentes menores ──────────────────────────────────────────────────────

function SectionHeader({
  title,
  onPress,
  linkLabel = "Ver tudo",
}: {
  title: string;
  onPress?: () => void;
  linkLabel?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPress && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.sectionLink}>{linkLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight = false,
  loading = false,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  highlight?: boolean;
  loading?: boolean;
}) {
  return (
    <View style={[styles.statCard, highlight && styles.statCardHighlight]}>
      <Ionicons name={icon} size={24} color={highlight ? C.white : C.primary} />
      <Text style={[styles.statLabel, highlight && styles.statLabelHighlight]}>{label}</Text>
      {loading ? (
        <ActivityIndicator size="small" color={highlight ? C.white : C.primary} />
      ) : (
        <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</Text>
      )}
    </View>
  );
}

function DeliveryRow({ item }: { item: Delivery }) {
  const { label, bg, color } = deliveryStatusInfo(item.status);
  return (
    <View style={styles.listRow}>
      <View style={styles.listRowContent}>
        <Text style={styles.listRowTitle} numberOfLines={1}>
          {item.description ?? "Sem descrição"}
        </Text>
        <Text style={styles.listRowSub}>{formatDate(item.arrival_date)}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color }]}>{label}</Text>
      </View>
    </View>
  );
}

function ReservationRow({
  item,
  areas,
  userName,
}: {
  item: Reservation;
  areas: CommonArea[];
  userName?: string;
}) {
  const area = areas.find((a) => a.id === item.common_area_id);
  const spaceName = area?.name ?? `Área ${item.common_area_id}`;
  const start = new Date(item.start_time);
  const end = new Date(item.end_time);
  const { bg, color } = reservationStatusInfo(item.status);

  return (
    <View style={styles.listRow}>
      <View style={styles.reservationDateBox}>
        <Text style={styles.reservationDay}>
          {start.toLocaleDateString("pt-BR", { day: "2-digit" })}
        </Text>
        <Text style={styles.reservationMonth}>
          {start.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
        </Text>
      </View>
      <View style={styles.listRowContent}>
        <Text style={styles.listRowTitle} numberOfLines={1}>{spaceName}</Text>
        <Text style={styles.listRowSub}>
          {formatTime(item.start_time)} – {formatTime(item.end_time)}
          {userName ? `  ·  ${userName}` : ""}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color }]}>{item.status}</Text>
      </View>
    </View>
  );
}

function NoticeRow({ item }: { item: Notice }) {
  const isWarning = item.type === "warning";
  return (
    <View style={styles.noticeRow}>
      <View style={[styles.noticeIcon, { backgroundColor: isWarning ? C.amber100 : C.surface }]}>
        <Ionicons
          name={isWarning ? "warning-outline" : "information-circle-outline"}
          size={18}
          color={isWarning ? C.amber700 : C.primary}
        />
      </View>
      <View style={styles.noticeText}>
        <Text style={styles.noticeTitle}>{item.title}</Text>
        <Text style={styles.noticeSub}>{item.description}</Text>
      </View>
    </View>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ─── Dashboard do Morador ─────────────────────────────────────────────────────

function MoradorDashboard({
  deliveries,
  reservations,
  areas,
  loadingDeliveries,
  loadingReservations,
  router,
}: {
  deliveries: Delivery[];
  reservations: Reservation[];
  areas: CommonArea[];
  loadingDeliveries: boolean;
  loadingReservations: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  const todayStr = new Date().toLocaleDateString("pt-BR");

  const pending = deliveries.filter((d) => isPending(d.status));
  const todayDeliveries = deliveries.filter(
    (d) => new Date(d.arrival_date).toLocaleDateString("pt-BR") === todayStr
  );
  const recentDeliveries = [...deliveries]
    .sort((a, b) => new Date(b.arrival_date).getTime() - new Date(a.arrival_date).getTime())
    .slice(0, 3);

  const upcomingReservations = [...reservations]
    .filter(
      (r) =>
        r.status !== "Cancelada" &&
        new Date(r.start_time) >= new Date(new Date().setHours(0, 0, 0, 0))
    )
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 3);

  return (
    <>
      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Aguardando retirada"
          value={pending.length}
          icon="cube-outline"
          loading={loadingDeliveries}
        />
        <StatCard
          label="Minhas reservas"
          value={upcomingReservations.length}
          icon="calendar-outline"
          loading={loadingReservations}
        />
        <StatCard
          label="Entregas hoje"
          value={todayDeliveries.length}
          icon="bicycle-outline"
          highlight
          loading={loadingDeliveries}
        />
      </View>

      {/* Encomendas recentes */}
      <View style={styles.card}>
        <SectionHeader
          title="Minhas encomendas recentes"
          onPress={() => router.push("/(tabs)/deliveries")}
        />
        {loadingDeliveries ? (
          <ActivityIndicator color={C.primary} style={{ marginVertical: 16 }} />
        ) : recentDeliveries.length === 0 ? (
          <EmptyCard message="Nenhuma encomenda encontrada." />
        ) : (
          <FlatList
            data={recentDeliveries}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <DeliveryRow item={item} />}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      {/* Próximas reservas */}
      <View style={styles.card}>
        <SectionHeader
          title="Minhas próximas reservas"
          linkLabel="Nova reserva"
          onPress={() => router.push("/(tabs)/reservations")}
        />
        {loadingReservations ? (
          <ActivityIndicator color={C.primary} style={{ marginVertical: 16 }} />
        ) : upcomingReservations.length === 0 ? (
          <EmptyCard message="Nenhuma reserva agendada." />
        ) : (
          <FlatList
            data={upcomingReservations}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <ReservationRow item={item} areas={areas} />}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      {/* Avisos */}
      <View style={styles.card}>
        <SectionHeader title="Avisos do condomínio" />
        <FlatList
          data={NOTICES}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <NoticeRow item={item} />}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </>
  );
}

// ─── Dashboard do Administrador ───────────────────────────────────────────────

function AdminDashboard({
  deliveries,
  reservations,
  areas,
  users,
  loadingDeliveries,
  loadingReservations,
  occurrencesCount,
  loadingOccurrences,
  router,
}: {
  deliveries: Delivery[];
  reservations: Reservation[];
  areas: CommonArea[];
  users: ResidentUser[];
  loadingDeliveries: boolean;
  loadingReservations: boolean;
  occurrencesCount: number;
  loadingOccurrences: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  const usersMap = Object.fromEntries(
    users.map((u) => [u.id, u.username ?? u.email ?? `#${u.id}`])
  );
  const todayStr = new Date().toLocaleDateString("pt-BR");

  const pending = deliveries.filter((d) => isPending(d.status));
  const todayDeliveries = deliveries.filter(
    (d) => new Date(d.arrival_date).toLocaleDateString("pt-BR") === todayStr
  );
  const recentDeliveries = [...deliveries]
    .sort((a, b) => new Date(b.arrival_date).getTime() - new Date(a.arrival_date).getTime())
    .slice(0, 5);

  const upcomingReservations = [...reservations]
    .filter(
      (r) =>
        r.status !== "Cancelada" &&
        new Date(r.start_time) >= new Date(new Date().setHours(0, 0, 0, 0))
    )
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5);

  return (
    <>
      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Encomendas pendentes"
          value={pending.length}
          icon="cube-outline"
          loading={loadingDeliveries}
        />
        <StatCard
          label="Reservas ativas"
          value={upcomingReservations.length}
          icon="calendar-outline"
          loading={loadingReservations}
        />
        <StatCard
          label="Ocorrências abertas"
          value={occurrencesCount}
          icon="alert-circle-outline"
          loading={loadingOccurrences}
        />
        <StatCard
          label="Entregas hoje"
          value={todayDeliveries.length}
          icon="bicycle-outline"
          highlight
          loading={loadingDeliveries}
        />
      </View>

      {/* Encomendas recentes — todos os moradores */}
      <View style={styles.card}>
        <SectionHeader
          title="Encomendas recentes"
          onPress={() => router.push("/(tabs)/deliveries")}
          linkLabel="Gerenciar"
        />
        <Text style={styles.cardSubtitle}>Visão geral do condomínio</Text>
        {loadingDeliveries ? (
          <ActivityIndicator color={C.primary} style={{ marginVertical: 16 }} />
        ) : recentDeliveries.length === 0 ? (
          <EmptyCard message="Nenhuma encomenda encontrada." />
        ) : (
          <FlatList
            data={recentDeliveries}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <DeliveryRow item={item} />}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      {/* Próximas reservas — todos os moradores */}
      <View style={styles.card}>
        <SectionHeader
          title="Próximas reservas"
          onPress={() => router.push("/(tabs)/reservations")}
          linkLabel="Ver todas"
        />
        <Text style={styles.cardSubtitle}>Todos os moradores</Text>
        {loadingReservations ? (
          <ActivityIndicator color={C.primary} style={{ marginVertical: 16 }} />
        ) : upcomingReservations.length === 0 ? (
          <EmptyCard message="Nenhuma reserva agendada." />
        ) : (
          <FlatList
            data={upcomingReservations}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ReservationRow
                item={item}
                areas={areas}
                userName={usersMap[item.user_id]}
              />
            )}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      {/* Avisos */}
      <View style={styles.card}>
        <SectionHeader title="Avisos do condomínio" />
        <FlatList
          data={NOTICES}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <NoticeRow item={item} />}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.profile === "Administrador";

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [areas, setAreas] = useState<CommonArea[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);

  const [occurrencesCount, setOccurrencesCount] = useState(0);
  const [loadingOccurrences, setLoadingOccurrences] = useState(true);

  const [users, setUsers] = useState<ResidentUser[]>([]);

  // Busca encomendas — admin vê todas, morador vê só as suas
  useEffect(() => {
    let active = true;

    async function load() {
      setLoadingDeliveries(true);
      try {
        const token = getAuthToken();
        if (!token) return;

        const path = isAdmin
          ? "/api/deliveries"
          : `/api/deliveries?recipientUserId=${user?.id}`;

        const data = await apiRequest<Delivery[]>(path, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (active) setDeliveries(Array.isArray(data) ? data : []);
      } catch {
        if (active) setDeliveries([]);
      } finally {
        if (active) setLoadingDeliveries(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [isAdmin, user?.id]);

  // Busca reservas + áreas comuns em paralelo
  useEffect(() => {
    let active = true;

    async function load() {
      setLoadingReservations(true);
      try {
        const token = getAuthToken();
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        const [rawReservations, rawAreas] = await Promise.all([
          apiRequest<Reservation[]>("/api/reservas", { headers }),
          apiRequest<CommonArea[]>("/api/areas-comuns", { headers }),
        ]);

        if (!active) return;

        setAreas(Array.isArray(rawAreas) ? rawAreas : []);

        const filtered = isAdmin
          ? rawReservations
          : rawReservations.filter((r) => r.user_id === user?.id);

        setReservations(Array.isArray(filtered) ? filtered : []);
      } catch {
        if (active) setReservations([]);
      } finally {
        if (active) setLoadingReservations(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [isAdmin, user?.id]);

  // Busca contagem de ocorrências abertas — apenas para admin
  useEffect(() => {
    if (!isAdmin) { setLoadingOccurrences(false); return; }
    let active = true;

    async function load() {
      setLoadingOccurrences(true);
      try {
        const token = getAuthToken();
        if (!token) return;

        const data = await apiRequest<{ id: number; status: string | null }[]>("/api/occurrences", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (active) {
          const count = Array.isArray(data)
            ? data.filter((o) => (o.status ?? "").toLowerCase() === "aberto").length
            : 0;
          setOccurrencesCount(count);
        }
      } catch {
        if (active) setOccurrencesCount(0);
      } finally {
        if (active) setLoadingOccurrences(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [isAdmin]);

  // Busca lista de usuários — apenas para o admin montar o mapa userId → nome
  useEffect(() => {
    if (!isAdmin) return;
    let active = true;

    async function load() {
      try {
        const token = getAuthToken();
        if (!token) return;

        const data = await apiRequest<ResidentUser[]>("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (active) setUsers(Array.isArray(data) ? data : []);
      } catch {
        // falha silenciosa: a UI mostra "#ID" como fallback
      }
    }

    void load();
    return () => { active = false; };
  }, [isAdmin]);

  const displayName = user?.username ?? user?.email ?? "Usuário";

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Condomínio</Text>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>
              Bem-vindo(a), {displayName}.{" "}
              {isAdmin
                ? "Visão geral do condomínio."
                : "Aqui está o resumo das suas informações."}
            </Text>
          </View>
          <View style={styles.iconPill}>
            <Ionicons name="business-outline" size={22} color={C.primary} />
          </View>
        </View>

        {isAdmin ? (
          <AdminDashboard
            deliveries={deliveries}
            reservations={reservations}
            areas={areas}
            users={users}
            loadingDeliveries={loadingDeliveries}
            loadingReservations={loadingReservations}
            occurrencesCount={occurrencesCount}
            loadingOccurrences={loadingOccurrences}
            router={router}
          />
        ) : (
          <MoradorDashboard
            deliveries={deliveries}
            reservations={reservations}
            areas={areas}
            loadingDeliveries={loadingDeliveries}
            loadingReservations={loadingReservations}
            router={router}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 32,
  },

  // Cabeçalho
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
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
    maxWidth: 240,
  },
  iconPill: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  // Grid de stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statCardHighlight: {
    backgroundColor: C.primary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
  },
  statLabelHighlight: {
    color: "rgba(255,255,255,0.75)",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: C.text,
  },
  statValueHighlight: {
    color: C.white,
  },

  // Cards de seção
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: C.muted,
    marginTop: -8,
  },

  // Cabeçalho de seção
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: "700",
    color: C.primary,
  },

  // Linhas de lista
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  listRowContent: {
    flex: 1,
    gap: 2,
  },
  listRowTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
  },
  listRowSub: {
    fontSize: 11,
    color: C.muted,
  },

  // Reserva — caixa de data
  reservationDateBox: {
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 40,
  },
  reservationDay: {
    fontSize: 16,
    fontWeight: "800",
    color: C.text,
    lineHeight: 18,
  },
  reservationMonth: {
    fontSize: 9,
    fontWeight: "600",
    color: C.muted,
    textTransform: "uppercase",
    marginTop: 1,
  },

  // Badge de status
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  // Avisos
  noticeRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 6,
    alignItems: "flex-start",
  },
  noticeIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeText: {
    flex: 1,
    gap: 2,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
  },
  noticeSub: {
    fontSize: 11,
    color: C.muted,
    lineHeight: 16,
  },

  // Separador
  separator: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 2,
  },

  // Estado vazio
  emptyCard: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
  },
});
