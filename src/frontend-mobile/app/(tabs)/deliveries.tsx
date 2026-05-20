import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

const COLORS = {
  bg: "#F9F9FF",
  primary: "#40557B",
  secondary: "#5A5F63",
  text: "#111C2D",
  muted: "#44474E",
  white: "#FFFFFF",
  inputBg: "#E9EDF2",
  border: "#D8E3FB",
  containerBg: "#E7EEFF",
  orange100: "#FEF3C7",
  orange700: "#B45309",
  green100: "#DCFCE7",
  green700: "#15803D",
  red100: "#FEE2E2",
  red700: "#B91C1C",
};

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

type DeliveryStatus = "aguardando" | "retirada" | "entregue" | "desconhecido";

type DeliveryItem = {
  id: string;
  descricao: string;
  destinatario: string;
  dataChegada: string;
  dataRetirada: string;
  status: DeliveryStatus;
  icon: string;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parseStatus(status?: string | null): DeliveryStatus {
  const normalized = normalizeText(status ?? "");

  if (
    normalized.includes("aguard") ||
    normalized.includes("waiting") ||
    normalized.includes("pendente") ||
    normalized.includes("disponivel")
  ) {
    return "aguardando";
  }

  if (normalized.includes("retirada") || normalized.includes("picked")) {
    return "retirada";
  }

  if (normalized.includes("entreg") || normalized.includes("delivered")) {
    return "entregue";
  }

  return "desconhecido";
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Data indisponível";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Data indisponível";
  }

  return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function statusInfo(status: DeliveryStatus) {
  switch (status) {
    case "aguardando":
      return {
        bg: COLORS.orange100,
        text: COLORS.orange700,
        label: "Aguardando retirada",
        icon: "time-outline",
      };
    case "retirada":
      return {
        bg: COLORS.green100,
        text: COLORS.green700,
        label: "Retirada realizada",
        icon: "checkmark-circle-outline",
      };
    case "entregue":
      return {
        bg: COLORS.green100,
        text: COLORS.green700,
        label: "Entregue",
        icon: "archive-outline",
      };
    default:
      return {
        bg: COLORS.red100,
        text: COLORS.red700,
        label: "Status não informado",
        icon: "help-circle-outline",
      };
  }
}

function mapDelivery(item: ApiDelivery): DeliveryItem {
  const status = parseStatus(item.status);
  const recipient = item.recipient_username || item.recipient_email || "Morador não informado";

  return {
    id: String(item.id),
    descricao: item.description?.trim() || "Entrega sem descrição",
    destinatario: recipient,
    dataChegada: formatDateTime(item.arrival_date),
    dataRetirada: item.pickup_date ? formatDateTime(item.pickup_date) : "Aguardando retirada",
    status,
    icon: statusInfo(status).icon,
  };
}

type NewDeliveryForm = {
  description: string;
  recipientEmail: string;
  arrivalDate: string;
};

const EMPTY_FORM: NewDeliveryForm = {
  description: "",
  recipientEmail: "",
  arrivalDate: "",
};

export default function DeliveriesScreen() {
  const { user } = useAuth();
  const isAdmin = user?.profile === "Administrador";
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewDeliveryForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddDelivery() {
    if (!form.description.trim()) {
      setFormError("Informe a descrição da encomenda.");
      return;
    }
    if (!form.recipientEmail.trim()) {
      setFormError("Informe o e-mail do destinatário.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      const token = getAuthToken();
      await apiRequest("/api/deliveries", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          description: form.description.trim(),
          recipient_email: form.recipientEmail.trim(),
          arrival_date: form.arrivalDate.trim() || new Date().toISOString(),
          status: "Aguardando",
        }),
      });

      setShowModal(false);
      setForm(EMPTY_FORM);
      setReloadKey((k) => k + 1);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível registrar a entrega.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCloseModal() {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  useEffect(() => {
    let isActive = true;

    async function loadDeliveries() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error("Faça login novamente para visualizar as entregas.");
        }

        const response = await apiRequest<ApiDelivery[]>("/api/deliveries", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isActive) {
          return;
        }

        setDeliveries(response.map(mapDelivery));
      } catch (error) {
        if (!isActive) {
          return;
        }

        setDeliveries([]);
        setErrorMessage(error instanceof Error ? error.message : "Não foi possível carregar as entregas.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadDeliveries();

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const filteredDeliveries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return deliveries;
    }

    return deliveries.filter((item) => {
      return (
        item.descricao.toLowerCase().includes(query) ||
        item.destinatario.toLowerCase().includes(query) ||
        statusInfo(item.status).label.toLowerCase().includes(query)
      );
    });
  }, [deliveries, searchQuery]);

  const metrics = useMemo(() => {
    const total = deliveries.length;
    const aguardando = deliveries.filter((item) => item.status === "aguardando").length;
    const retirada = deliveries.filter((item) => item.status === "retirada").length;
    const entregues = deliveries.filter((item) => item.status === "entregue").length;
    const finalizadas = retirada + entregues;
    const filaPercentual = total > 0 ? Math.round((aguardando / total) * 100) : 0;

    return { total, aguardando, finalizadas, filaPercentual };
  }, [deliveries]);

  const renderDeliveryCard = ({ item }: { item: DeliveryItem }) => {
    const info = statusInfo(item.status);

    return (
      <View style={styles.deliveryCard}>
        <View style={styles.deliveryContent}>
          <View style={styles.iconBox}>
            <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
          </View>
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryName}>{item.descricao}</Text>
            <Text style={styles.deliverySubtitle}>{item.destinatario}</Text>
            <Text style={styles.deliveryMeta}>Chegada: {item.dataChegada}</Text>
            <Text style={styles.deliveryMeta}>Retirada: {item.dataRetirada}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: info.bg }]}> 
          <Text style={[styles.statusText, { color: info.text }]}>{info.label}</Text>
        </View>
      </View>
    );
  };

  const emptyMessage = errorMessage
    ? errorMessage
    : searchQuery.trim()
      ? "Nenhuma entrega encontrada para essa busca."
      : "Ainda não há entregas registradas.";

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Entregas</Text>
            <Text style={styles.subtitle}>Acompanhe as encomendas recebidas e pendentes.</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            style={styles.metricsContainer}
            contentContainerStyle={styles.metricsContent}
          >
            <View style={[styles.metricCard, styles.metricCardWhite]}>
              <Ionicons name="cube-outline" size={28} color={COLORS.primary} />
              <Text style={styles.metricLabel}>Total recebidas</Text>
              <Text style={styles.metricValue}>{metrics.total}</Text>
            </View>
            <View style={[styles.metricCard, styles.metricCardGray]}>
              <Ionicons name="time-outline" size={28} color={COLORS.primary} />
              <Text style={styles.metricLabel}>Aguardando retirada</Text>
              <Text style={styles.metricValue}>{metrics.aguardando}</Text>
            </View>
            <View style={[styles.metricCard, styles.metricCardWhite]}>
              <Ionicons name="checkmark-circle-outline" size={28} color={COLORS.primary} />
              <Text style={styles.metricLabel}>Finalizadas</Text>
              <Text style={styles.metricValue}>{metrics.finalizadas}</Text>
            </View>
          </ScrollView>

          <View style={styles.storageCard}>
            <View style={styles.storageHeader}>
              <Text style={styles.storageTitle}>Fila de retirada</Text>
              <Text style={styles.storagePercent}>{metrics.filaPercentual}% em espera</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${metrics.filaPercentual}%` }]} />
            </View>
            <View style={styles.storageStats}>
              <View style={styles.statItem}>
                <View style={styles.statDot} />
                <Text style={styles.statLabel}>Pendentes: {metrics.aguardando}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: COLORS.containerBg }]} />
                <Text style={styles.statLabel}>Total: {metrics.total}</Text>
              </View>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar por morador, descrição ou status..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.activitySection}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>Atividade recente</Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setReloadKey((current) => current + 1);
                }}
              >
                <Text style={styles.viewAllLink}>Atualizar</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.stateCard}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.stateTitle}>Carregando entregas...</Text>
              </View>
            ) : filteredDeliveries.length === 0 ? (
              <View style={styles.stateCard}>
                <Ionicons name="archive-outline" size={24} color={COLORS.primary} />
                <Text style={styles.stateTitle}>{emptyMessage}</Text>
              </View>
            ) : (
              <FlatList
                data={filteredDeliveries}
                renderItem={renderDeliveryCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            )}

            {errorMessage && !isLoading ? (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => setReloadKey((current) => current + 1)}
              >
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>

        {isAdmin && (
          <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
            <Ionicons name="add" size={32} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseModal}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Nova Encomenda</Text>
            <Text style={styles.modalSubtitle}>Preencha os dados para registrar uma entrega.</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Descrição *</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Ex: Caixa Amazon, encomenda Correios..."
                placeholderTextColor="#94A3B8"
                value={form.description}
                onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>E-mail do destinatário *</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="morador@email.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.recipientEmail}
                onChangeText={(v) => setForm((f) => ({ ...f, recipientEmail: v }))}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Data de chegada (opcional)</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Ex: 2025-05-19T10:00:00"
                placeholderTextColor="#94A3B8"
                value={form.arrivalDate}
                onChangeText={(v) => setForm((f) => ({ ...f, arrivalDate: v }))}
              />
            </View>

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitDisabled]}
              onPress={handleAddDelivery}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.submitText}>Registrar entrega</Text>
              }
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
  },
  metricsContainer: {
    marginBottom: 24,
    marginHorizontal: 0,
  },
  metricsContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  metricCard: {
    width: 160,
    borderRadius: 32,
    padding: 24,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.05,
    shadowRadius: 50,
    elevation: 3,
  },
  metricCardWhite: {
    backgroundColor: COLORS.white,
  },
  metricCardGray: {
    backgroundColor: COLORS.containerBg,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  storageCard: {
    marginHorizontal: 24,
    backgroundColor: COLORS.white,
    borderRadius: 32,
    padding: 32,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.05,
    shadowRadius: 50,
    elevation: 3,
  },
  storageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  storageTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  storagePercent: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: 16,
    backgroundColor: COLORS.containerBg,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  storageStats: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  searchContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  activitySection: {
    paddingHorizontal: 24,
    gap: 16,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  viewAllLink: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  listContent: {
    gap: 12,
  },
  deliveryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 30,
    elevation: 2,
  },
  deliveryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.containerBg,
    justifyContent: "center",
    alignItems: "center",
  },
  deliveryInfo: {
    gap: 2,
    flex: 1,
  },
  deliveryName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  deliverySubtitle: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  deliveryMeta: {
    fontSize: 11,
    color: COLORS.muted,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  stateCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  stateTitle: {
    fontSize: 14,
    color: COLORS.secondary,
    textAlign: "center",
  },
  retryButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    paddingBottom: 40,
    gap: 16,
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
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: -8,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  fieldInput: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.text,
  },
  formError: {
    fontSize: 12,
    color: COLORS.red700,
    textAlign: "center",
  },
  submitButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
});