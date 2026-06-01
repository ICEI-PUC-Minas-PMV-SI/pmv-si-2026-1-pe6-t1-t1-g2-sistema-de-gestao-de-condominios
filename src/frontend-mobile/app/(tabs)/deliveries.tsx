import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  createReservation,
  fetchBusySlots,
  fetchCommonAreas,
  type BusySlot,
  type CommonArea,
} from "@/services/reservations";
import { getAuthUserId } from "@/services/authSession";

const COLORS = {
  bg: "#F9F9FF",
  primary: "#40557B",
  text: "#111C2D",
  muted: "#5A5F63",
  white: "#FFFFFF",
  inputBg: "#E9EDF2",
  border: "#D8E3FB",
  surface: "#E7EEFF",
  success: "#166534",
  error: "#B91C1C",
};

const TIME_SLOTS = [
  { id: "morning", label: "09:00 - 13:00", startHour: 9, endHour: 13 },
  { id: "afternoon", label: "14:00 - 18:00", startHour: 14, endHour: 18 },
  { id: "night", label: "19:00 - 23:00", startHour: 19, endHour: 23 },
] as const;

function toDateAtHour(dateText: string, hour: number) {
  const date = new Date(`${dateText}T00:00:00`);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function isDateInputValid(dateText: string) {
  const parsed = new Date(`${dateText}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
}

function hasOverlap(start: Date, end: Date, busySlots: BusySlot[]) {
  return busySlots.some((slot) => start < slot.end && end > slot.start);
}

export default function ReservationsScreen() {
  const [areas, setAreas] = useState<CommonArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSlotId, setSelectedSlotId] = useState<(typeof TIME_SLOTS)[number]["id"] | null>(null);
  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"error" | "success" | "info">("info");

  useEffect(() => {
    let active = true;

    async function loadAreas() {
      setIsLoadingAreas(true);
      setFeedback("");

      try {
        const response = await fetchCommonAreas();
        if (!active) return;

        setAreas(response);
        setSelectedAreaId(response[0]?.id ?? null);
      } catch (error) {
        if (!active) return;
        setFeedbackType("error");
        setFeedback(error instanceof Error ? error.message : "Não foi possível carregar as áreas comuns.");
      } finally {
        if (active) {
          setIsLoadingAreas(false);
        }
      }
    }

    loadAreas();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAvailability() {
      if (!selectedAreaId || !isDateInputValid(selectedDate)) {
        setBusySlots([]);
        return;
      }

      setIsLoadingAvailability(true);
      setFeedback("");
      setSelectedSlotId(null);

      try {
        const slots = await fetchBusySlots(selectedAreaId, new Date(`${selectedDate}T00:00:00`).toISOString());
        if (!active) return;
        setBusySlots(slots);
      } catch (error) {
        if (!active) return;
        setBusySlots([]);
        setFeedbackType("error");
        setFeedback(error instanceof Error ? error.message : "Não foi possível consultar os horários.");
      } finally {
        if (active) {
          setIsLoadingAvailability(false);
        }
      }
    }

    loadAvailability();
    return () => {
      active = false;
    };
  }, [selectedAreaId, selectedDate]);

  const slotsWithAvailability = useMemo(() => {
    if (!isDateInputValid(selectedDate)) {
      return TIME_SLOTS.map((slot) => ({ ...slot, isBusy: true }));
    }

    return TIME_SLOTS.map((slot) => {
      const start = toDateAtHour(selectedDate, slot.startHour);
      const end = toDateAtHour(selectedDate, slot.endHour);
      return {
        ...slot,
        isBusy: hasOverlap(start, end, busySlots),
      };
    });
  }, [selectedDate, busySlots]);

  async function handleSubmit() {
    const userId = getAuthUserId();
    if (!userId) {
      setFeedbackType("error");
      setFeedback("Sessão sem usuário válido. Faça login novamente.");
      return;
    }

    if (!selectedAreaId || !selectedSlotId || !isDateInputValid(selectedDate)) {
      setFeedbackType("error");
      setFeedback("Selecione área, data e horário para confirmar a reserva.");
      return;
    }

    const selectedSlot = TIME_SLOTS.find((slot) => slot.id === selectedSlotId);
    if (!selectedSlot) {
      setFeedbackType("error");
      setFeedback("Horário inválido. Selecione outro horário.");
      return;
    }

    const start = toDateAtHour(selectedDate, selectedSlot.startHour);
    const end = toDateAtHour(selectedDate, selectedSlot.endHour);

    if (hasOverlap(start, end, busySlots)) {
      setFeedbackType("error");
      setFeedback("Este horário já está ocupado para a data selecionada.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      await createReservation({
        areaId: selectedAreaId,
        userId,
        startIso: start.toISOString(),
        endIso: end.toISOString(),
        status: "Pendente",
      });

      setFeedbackType("success");
      setFeedback("Reserva registrada com sucesso.");
      setSelectedSlotId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível registrar a reserva.";
      setFeedbackType("error");
      if (message.toLowerCase().includes("já existe reserva ativa")) {
        setFeedback("Conflito de horário: já existe reserva ativa para esse período.");
      } else {
        setFeedback(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.kicker}>Reserve o seu momento</Text>
            <Text style={styles.title}>Reservas</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Área Comum</Text>
            {isLoadingAreas ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.loadingText}>Carregando áreas...</Text>
              </View>
            ) : areas.length === 0 ? (
              <View style={styles.loadingCard}>
                <Text style={styles.loadingText}>Nenhuma área comum disponível.</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.areaList}>
                {areas.map((area) => {
                  const selected = selectedAreaId === area.id;
                  return (
                    <TouchableOpacity
                      key={area.id}
                      style={[styles.areaCard, selected ? styles.areaCardSelected : null]}
                      onPress={() => setSelectedAreaId(area.id)}
                    >
                      <Ionicons
                        name="business-outline"
                        size={18}
                        color={selected ? COLORS.white : COLORS.primary}
                      />
                      <Text style={[styles.areaName, selected ? styles.areaNameSelected : null]}>{area.name}</Text>
                      <Text style={[styles.areaMeta, selected ? styles.areaMetaSelected : null]}>
                        Capacidade: {area.capacity || "N/A"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data da Reserva</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="AAAA-MM-DD"
              placeholderTextColor="#94A3B8"
              value={selectedDate}
              onChangeText={setSelectedDate}
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
            />
            <Text style={styles.helperText}>Formato: AAAA-MM-DD (ex.: 2026-06-15)</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.inlineHeader}>
              <Text style={styles.sectionTitle}>Horários Disponíveis</Text>
              {isLoadingAvailability ? <ActivityIndicator size="small" color={COLORS.primary} /> : null}
            </View>
            <View style={styles.slotGrid}>
              {slotsWithAvailability.map((slot) => {
                const selected = selectedSlotId === slot.id;
                const disabled = slot.isBusy || isLoadingAvailability;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotButton,
                      selected ? styles.slotButtonSelected : null,
                      disabled ? styles.slotButtonDisabled : null,
                    ]}
                    disabled={disabled}
                    onPress={() => setSelectedSlotId(slot.id)}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        selected ? styles.slotTextSelected : null,
                        disabled ? styles.slotTextDisabled : null,
                      ]}
                    >
                      {slot.isBusy ? `${slot.label} (Ocupado)` : slot.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {feedback ? (
            <View
              style={[
                styles.feedbackBox,
                feedbackType === "error" ? styles.feedbackError : styles.feedbackSuccess,
              ]}
            >
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting ? styles.submitButtonDisabled : null]}
            disabled={isSubmitting}
            onPress={handleSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Confirmar Reserva</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
    gap: 18,
  },
  header: { marginBottom: 8 },
  kicker: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: COLORS.muted,
    fontWeight: "600",
  },
  title: {
    marginTop: 2,
    fontSize: 34,
    color: COLORS.primary,
    fontWeight: "800",
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EDF2F7",
  },
  sectionTitle: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: 10,
  },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  loadingCard: {
    minHeight: 72,
    borderRadius: 14,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  loadingText: { fontSize: 13, color: COLORS.muted, textAlign: "center" },
  areaList: { gap: 12, paddingRight: 4 },
  areaCard: {
    width: 190,
    borderRadius: 16,
    padding: 14,
    backgroundColor: COLORS.surface,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  areaCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  areaName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  areaNameSelected: { color: COLORS.white },
  areaMeta: { fontSize: 12, color: COLORS.muted },
  areaMetaSelected: { color: "#DEE7FB" },
  dateInput: {
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.muted,
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  slotButton: {
    minWidth: "48%",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: "transparent",
  },
  slotButtonSelected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
  },
  slotButtonDisabled: {
    opacity: 0.6,
  },
  slotText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  slotTextSelected: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  slotTextDisabled: {
    color: "#7C8490",
  },
  feedbackBox: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  feedbackError: {
    backgroundColor: "#FEE2E2",
  },
  feedbackSuccess: {
    backgroundColor: "#DCFCE7",
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  submitButton: {
    marginTop: 4,
    height: 56,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#23355C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
  },
});