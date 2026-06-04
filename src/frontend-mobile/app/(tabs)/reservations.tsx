import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
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
  inputBg: "#E9EDF2",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
  orange100: "#FEF3C7",
  orange700: "#B45309",
  green100: "#DCFCE7",
  green700: "#15803D",
  red100: "#FEE2E2",
  red700: "#B91C1C",
  slate100: "#F1F5F9",
  slate500: "#64748B",
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Reservation = {
  id: number;
  common_area_id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type CommonArea = { id: number; name: string };

type ResidentUser = { id: number; username: string | null; email: string | null };

type OccupiedSlot = { inicio: string; fim: string };

type ReservationForm = {
  common_area_id: string;
  selectedDate: string; // YYYY-MM-DD
  startHour: number | null; // 0-23
  endHour: number | null;   // 1-24 (hora final, exclusive)
  status: string;
};

const EMPTY_FORM: ReservationForm = {
  common_area_id: "",
  selectedDate: "",
  startHour: null,
  endHour: null,
  status: "Pendente",
};

const STATUS_OPTIONS = ["Pendente", "Aprovada", "Rejeitada", "Cancelada"] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];
const FILTER_OPTIONS: Array<StatusOption | "Todos"> = ["Todos", ...STATUS_OPTIONS];

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i); // 0..23

function getLocalTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getAvailableHours(selectedDate: string): number[] {
  if (selectedDate !== getLocalTodayISO()) return ALL_HOURS;
  const currentHour = new Date().getHours();
  return ALL_HOURS.filter((h) => h > currentHour);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, "0"); }

function isoToDisplay(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function extractTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function areaName(areas: CommonArea[], id: number): string {
  return areas.find((a) => a.id === id)?.name ?? `Área ${id}`;
}

function buildISO(date: string, hour: number): string {
  return `${date}T${pad(hour)}:00:00`;
}

function buildDaysArray(count = 60): Array<{ iso: string; dayNum: number; dayName: string; monthLabel: string }> {
  const days = [];
  const now = new Date();
  // Usar data local, não UTC
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    days.push({
      iso,
      dayNum: d.getDate(),
      dayName: DAYS_PT[d.getDay()],
      monthLabel: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    });
  }
  return days;
}

function getOccupiedHours(slots: OccupiedSlot[]): Set<number> {
  const occupied = new Set<number>();
  for (const slot of slots) {
    const start = new Date(slot.inicio);
    const end = new Date(slot.fim);
    for (let h = start.getHours(); h < end.getHours() || (end.getMinutes() > 0 && h <= end.getHours()); h++) {
      if (h < 24) occupied.add(h);
    }
  }
  return occupied;
}

function statusInfo(status: string | null): { label: string; bg: string; color: string; icon: keyof typeof Ionicons.glyphMap } {
  switch ((status ?? "").toLowerCase()) {
    case "pendente":
      return { label: "Pendente",  bg: C.orange100, color: C.orange700, icon: "time-outline" };
    case "aprovada":
    case "confirmada":
      return { label: "Aprovada",  bg: C.green100,  color: C.green700,  icon: "checkmark-circle-outline" };
    case "rejeitada":
      return { label: "Rejeitada", bg: C.red100,    color: C.red700,    icon: "close-circle-outline" };
    case "cancelada":
      return { label: "Cancelada", bg: C.slate100,  color: C.slate500,  icon: "ban-outline" };
    default:
      return { label: status ?? "—", bg: C.slate100, color: C.slate500, icon: "ellipse-outline" };
  }
}

// ─── Tira de dias ─────────────────────────────────────────────────────────────

function DateStrip({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (iso: string) => void;
}) {
  const days = useMemo(() => buildDaysArray(60), []);
  const scrollRef = useRef<ScrollView>(null);
  const todayISO = getLocalTodayISO();
  const todayIdx = 0;

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ x: 0, animated: false }), 50);
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, typeof days> = {};
    for (const d of days) {
      if (!map[d.monthLabel]) map[d.monthLabel] = [];
      map[d.monthLabel].push(d);
    }
    return map;
  }, [days]);

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateStripContent}
      >
        {days.map((d, i) => {
          const isSelected = d.iso === selected;
          const isToday = d.iso === todayISO;
          return (
            <TouchableOpacity
              key={d.iso}
              style={[styles.dayCell, isSelected && styles.dayCellActive]}
              onPress={() => onSelect(d.iso)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>{d.dayName}</Text>
              <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>{d.dayNum}</Text>
              {isToday && !isSelected && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {selected && (
        <Text style={styles.selectedDateLabel}>
          {(() => {
            const d = new Date(selected + "T12:00:00");
            return `${DAYS_PT[d.getDay()]}, ${pad(d.getDate())} de ${d.toLocaleDateString("pt-BR", { month: "long" })} de ${d.getFullYear()}`;
          })()}
        </Text>
      )}
    </View>
  );
}

// ─── Grade de slots ───────────────────────────────────────────────────────────

function SlotGrid({
  occupiedHours,
  availableHours,
  startHour,
  endHour,
  loading,
  onSelectHour,
}: {
  occupiedHours: Set<number>;
  availableHours: number[];
  startHour: number | null;
  endHour: number | null;
  loading: boolean;
  onSelectHour: (h: number) => void;
}) {
  function slotState(h: number): "occupied" | "selected-start" | "selected-end" | "selected-range" | "free" {
    if (occupiedHours.has(h)) return "occupied";
    if (startHour !== null && endHour !== null) {
      if (h === startHour) return "selected-start";
      if (h === endHour - 1) return "selected-end";
      if (h > startHour && h < endHour - 1) return "selected-range";
    } else if (startHour !== null && h === startHour) {
      return "selected-start";
    }
    return "free";
  }

  return (
    <View style={styles.slotSection}>
      <View style={styles.slotLegendRow}>
        <LegendDot color={C.primary} label="Selecionado" />
        <LegendDot color={C.slate100} label="Livre" border />
        <LegendDot color="#CBD5E1" label="Ocupado" />
      </View>

      {loading ? (
        <View style={styles.slotLoading}>
          <ActivityIndicator color={C.primary} />
          <Text style={styles.slotLoadingText}>Verificando disponibilidade...</Text>
        </View>
      ) : (
        <View style={styles.slotGrid}>
          {availableHours.length === 0 && (
            <Text style={[styles.slotLoadingText, { padding: 16 }]}>
              Não há mais horários disponíveis hoje.
            </Text>
          )}
          {availableHours.map((h) => {
            const state = slotState(h);
            const isOccupied = state === "occupied";
            const isActive = state !== "free" && state !== "occupied";

            return (
              <TouchableOpacity
                key={h}
                style={[
                  styles.slotCell,
                  isActive && styles.slotCellActive,
                  isOccupied && styles.slotCellOccupied,
                  state === "selected-start" && styles.slotCellStart,
                  state === "selected-end" && styles.slotCellEnd,
                ]}
                onPress={() => !isOccupied && onSelectHour(h)}
                activeOpacity={isOccupied ? 1 : 0.7}
                disabled={isOccupied}
              >
                <Text style={[
                  styles.slotText,
                  isActive && styles.slotTextActive,
                  isOccupied && styles.slotTextOccupied,
                ]}>
                  {pad(h)}:00
                </Text>
                {isOccupied && <Ionicons name="lock-closed" size={8} color="#94A3B8" />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {startHour !== null && endHour !== null && (
        <View style={styles.selectionSummary}>
          <Ionicons name="time-outline" size={14} color={C.primary} />
          <Text style={styles.selectionSummaryText}>
            {pad(startHour)}:00 – {pad(endHour)}:00 · {endHour - startHour}h de duração
          </Text>
        </View>
      )}
      {startHour !== null && endHour === null && (
        <Text style={styles.selectionHint}>Toque em outro horário para definir o término</Text>
      )}
      {startHour === null && (
        <Text style={styles.selectionHint}>Toque em um horário para iniciar a seleção</Text>
      )}
    </View>
  );
}

function LegendDot({ color, label, border }: { color: string; label: string; border?: boolean }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }, border && { borderWidth: 1, borderColor: C.border }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

// ─── Card de reserva ──────────────────────────────────────────────────────────

function ReservationCard({ item, areas, onPress }: { item: Reservation; areas: CommonArea[]; onPress: () => void }) {
  const { label, bg, color, icon } = statusInfo(item.status);
  const startD = new Date(item.start_time);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardDateBox}>
        <Text style={styles.cardDay}>{pad(startD.getDate())}</Text>
        <Text style={styles.cardMonth}>{startD.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardAreaName} numberOfLines={1}>{areaName(areas, item.common_area_id)}</Text>
        <Text style={styles.cardTime}>{extractTime(item.start_time)} – {extractTime(item.end_time)}</Text>
        <View style={[styles.badge, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={10} color={color} />
          <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={C.muted} />
    </TouchableOpacity>
  );
}

// ─── Modal de detalhe ─────────────────────────────────────────────────────────

function DetailModal({ reservation, areas, getUserLabel, onClose, onEdit, onDelete }: {
  reservation: Reservation | null; areas: CommonArea[];
  getUserLabel: (id: number) => string;
  onClose: () => void; onEdit: (r: Reservation) => void; onDelete: (r: Reservation) => void;
}) {
  if (!reservation) return null;
  const { label, bg, color, icon } = statusInfo(reservation.status);
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { gap: 14 }]} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <View style={[styles.detailBadge, { backgroundColor: bg }]}>
            <Ionicons name={icon} size={14} color={color} />
            <Text style={[styles.detailBadgeText, { color }]}>{label}</Text>
          </View>
          <Text style={styles.detailTitle}>{areaName(areas, reservation.common_area_id)}</Text>
          <View style={styles.detailMeta}>
            <DetailRow icon="calendar-outline"       label="Início"   value={isoToDisplay(reservation.start_time)} />
            <DetailRow icon="calendar-clear-outline" label="Término"  value={isoToDisplay(reservation.end_time)} />
            <DetailRow icon="person-outline"         label="Morador"  value={getUserLabel(reservation.user_id)} />
            {reservation.created_at && <DetailRow icon="time-outline" label="Criada em" value={isoToDisplay(reservation.created_at)} />}
          </View>
          <View style={styles.detailActions}>
            <TouchableOpacity style={styles.detailActionBtn} onPress={() => { onClose(); onEdit(reservation); }} activeOpacity={0.8}>
              <Ionicons name="pencil-outline" size={18} color={C.primary} />
              <Text style={styles.detailActionText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.detailActionBtn, styles.detailActionBtnDanger]} onPress={() => { onClose(); onDelete(reservation); }} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={18} color={C.danger} />
              <Text style={[styles.detailActionText, { color: C.danger }]}>Excluir</Text>
            </TouchableOpacity>
          </View>
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

// ─── Modal criar / editar ─────────────────────────────────────────────────────

function ReservationFormModal({
  visible, isEditing, isAdmin, form, areas, onChange, onClose, onSubmit, loading, error,
}: {
  visible: boolean; isEditing: boolean; isAdmin: boolean;
  form: ReservationForm; areas: CommonArea[];
  onChange: (field: keyof ReservationForm, value: any) => void;
  onClose: () => void; onSubmit: () => void; loading: boolean; error: string;
}) {
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [checkingSlots, setCheckingSlots] = useState(false);

  useEffect(() => {
    if (!form.common_area_id || !form.selectedDate) { setOccupiedSlots([]); return; }
    let active = true;
    setCheckingSlots(true);
    apiRequest<OccupiedSlot[]>(
      `/api/reservas/disponibilidade?areaId=${form.common_area_id}&data=${form.selectedDate}`,
      { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    )
      .then((s) => { if (active) setOccupiedSlots(Array.isArray(s) ? s : []); })
      .catch(() => { if (active) setOccupiedSlots([]); })
      .finally(() => { if (active) setCheckingSlots(false); });
    return () => { active = false; };
  }, [form.common_area_id, form.selectedDate]);

  const occupiedHours = useMemo(() => getOccupiedHours(occupiedSlots), [occupiedSlots]);

  function handleSelectHour(h: number) {
    if (form.startHour === null) {
      onChange("startHour", h);
      onChange("endHour", null);
      return;
    }
    if (form.endHour === null) {
      if (h <= form.startHour) {
        onChange("startHour", h);
        return;
      }
      const end = h + 1;
      // Verificar se alguma hora no intervalo está ocupada
      for (let i = form.startHour; i < end; i++) {
        if (occupiedHours.has(i)) {
          Alert.alert("Horário ocupado", `O horário ${pad(i)}:00 está reservado. Escolha outro intervalo.`);
          return;
        }
      }
      onChange("endHour", end);
      return;
    }
    // Já tem início e fim — reinicia
    onChange("startHour", h);
    onChange("endHour", null);
  }

  const canSubmit = form.common_area_id && form.selectedDate && form.startHour !== null && form.endHour !== null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheetTall} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{isEditing ? "Editar Reserva" : "Nova Reserva"}</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

            {/* Área */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Área comum</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.areaScroll}>
                {areas.map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    style={[styles.areaChip, form.common_area_id === String(a.id) && styles.areaChipActive]}
                    onPress={() => { onChange("common_area_id", String(a.id)); onChange("startHour", null); onChange("endHour", null); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.areaChipText, form.common_area_id === String(a.id) && styles.areaChipTextActive]}>{a.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Data */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Data</Text>
              <DateStrip
                selected={form.selectedDate}
                onSelect={(iso) => { onChange("selectedDate", iso); onChange("startHour", null); onChange("endHour", null); }}
              />
            </View>

            {/* Slots */}
            {form.selectedDate ? (
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Horários</Text>
                <SlotGrid
                  occupiedHours={occupiedHours}
                  availableHours={getAvailableHours(form.selectedDate)}
                  startHour={form.startHour}
                  endHour={form.endHour}
                  loading={checkingSlots}
                  onSelectHour={handleSelectHour}
                />
              </View>
            ) : (
              <View style={styles.slotPlaceholder}>
                <Ionicons name="calendar-outline" size={28} color={C.border} />
                <Text style={styles.slotPlaceholderText}>Selecione uma data para ver os horários</Text>
              </View>
            )}

            {/* Status — só admin */}
            {isAdmin && (
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Status</Text>
                <View style={styles.toggleRow}>
                  {STATUS_OPTIONS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.toggleBtn, form.status === s && styles.toggleBtnActive]}
                      onPress={() => onChange("status", s)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.toggleText, form.status === s && styles.toggleTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {error ? <Text style={styles.formError}>{error}</Text> : null}
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitButton, (!canSubmit || loading) && styles.submitDisabled]}
            onPress={onSubmit}
            disabled={!canSubmit || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={C.white} />
              : <Text style={styles.submitText}>{isEditing ? "Salvar alterações" : "Confirmar reserva"}</Text>
            }
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function ReservationsScreen() {
  const { user } = useAuth();
  const isAdmin = user?.profile === "Administrador";

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [areas, setAreas] = useState<CommonArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState<StatusOption | "Todos">("Todos");

  const [users, setUsers] = useState<ResidentUser[]>([]);

  const [detailTarget, setDetailTarget] = useState<Reservation | null>(null);
  const [formModal, setFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Reservation | null>(null);
  const [form, setForm] = useState<ReservationForm>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  function reload() { setReloadKey((k) => k + 1); }

  function handleFormChange(field: keyof ReservationForm, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormModal(true);
  }

  function openEdit(r: Reservation) {
    setEditTarget(r);
    const startD = new Date(r.start_time);
    const endD = new Date(r.end_time);
    const iso = `${startD.getFullYear()}-${pad(startD.getMonth() + 1)}-${pad(startD.getDate())}`;
    setForm({
      common_area_id: String(r.common_area_id),
      selectedDate: iso,
      startHour: startD.getHours(),
      endHour: endD.getHours() === 0 && endD.getMinutes() === 0 ? 24 : endD.getHours(),
      status: r.status,
    });
    setFormError("");
    setFormModal(true);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = getAuthToken();
        const headers = { Authorization: `Bearer ${token}` };
        const [rawR, rawA] = await Promise.all([
          apiRequest<Reservation[]>("/api/reservas", { headers }),
          apiRequest<CommonArea[]>("/api/areas-comuns", { headers }),
        ]);
        if (!active) return;
        const all = Array.isArray(rawR) ? rawR : [];
        setReservations(isAdmin ? all : all.filter((r) => r.user_id === user?.id));
        setAreas(Array.isArray(rawA) ? rawA : []);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Erro ao carregar reservas.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [isAdmin, user?.id, reloadKey]);

  // Busca usuários para o admin exibir o nome do morador no detalhe
  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    async function load() {
      try {
        const token = getAuthToken();
        const data = await apiRequest<ResidentUser[]>("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) setUsers(Array.isArray(data) ? data : []);
      } catch { /* silencioso */ }
    }
    void load();
    return () => { active = false; };
  }, [isAdmin]);

  function getUserLabel(userId: number): string {
    if (!isAdmin) {
      return user?.username ?? user?.email ?? `#${userId}`;
    }
    const found = users.find((u) => u.id === userId);
    if (!found) return `#${userId}`;
    return found.username ?? found.email ?? `#${userId}`;
  }

  async function handleSubmit() {
    if (!form.common_area_id) { setFormError("Selecione a área comum."); return; }
    if (!form.selectedDate) { setFormError("Selecione uma data."); return; }
    if (form.startHour === null || form.endHour === null) { setFormError("Selecione o horário de início e fim."); return; }

    setFormError("");
    setFormLoading(true);
    try {
      const token = getAuthToken();
      const body = {
        common_area_id: Number(form.common_area_id),
        user_id: editTarget ? editTarget.user_id : user?.id,
        start_time: buildISO(form.selectedDate, form.startHour),
        end_time: buildISO(form.selectedDate, form.endHour === 24 ? 0 : form.endHour) + (form.endHour === 24 ? "" : ""),
        status: form.status,
      };

      // Ajuste para meia-noite do dia seguinte quando endHour = 24
      const endISO = form.endHour === 24
        ? (() => {
            const d = new Date(form.selectedDate + "T00:00:00");
            d.setDate(d.getDate() + 1);
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00:00`;
          })()
        : buildISO(form.selectedDate, form.endHour);

      const finalBody = { ...body, end_time: endISO };

      if (editTarget) {
        await apiRequest(`/api/reservas/${editTarget.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(finalBody),
        });
      } else {
        await apiRequest("/api/reservas", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(finalBody),
        });
      }
      setFormModal(false);
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erro ao salvar reserva.");
    } finally {
      setFormLoading(false);
    }
  }

  function handleDelete(r: Reservation) {
    Alert.alert("Excluir reserva", `Excluir a reserva de "${areaName(areas, r.common_area_id)}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir", style: "destructive",
        onPress: async () => {
          try {
            await apiRequest(`/api/reservas/${r.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            reload();
          } catch (e) { Alert.alert("Erro", e instanceof Error ? e.message : "Não foi possível excluir."); }
        },
      },
    ]);
  }

  const filtered = useMemo(() => {
    if (filter === "Todos") return reservations;
    return reservations.filter((r) => r.status.toLowerCase() === filter.toLowerCase());
  }, [reservations, filter]);

  const stats = useMemo(() => ({
    total:      reservations.length,
    pendentes:  reservations.filter((r) => r.status.toLowerCase() === "pendente").length,
    aprovadas:  reservations.filter((r) => r.status.toLowerCase() === "aprovada").length,
    canceladas: reservations.filter((r) => r.status.toLowerCase() === "cancelada").length,
  }), [reservations]);

  return (
    <SafeAreaView style={styles.root}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.kicker}>Condomínio</Text>
                <Text style={styles.title}>{isAdmin ? "Gestão de Reservas" : "Minhas Reservas"}</Text>
                <Text style={styles.subtitle}>{isAdmin ? "Gerencie as reservas das áreas comuns." : "Solicite e acompanhe suas reservas."}</Text>
              </View>
              <View style={styles.iconPill}>
                <Ionicons name="calendar-outline" size={22} color={C.primary} />
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
              <StatPill label="Total"      value={stats.total}      color={C.primary}   loading={loading} />
              <StatPill label="Pendentes"  value={stats.pendentes}  color={C.orange700} loading={loading} />
              <StatPill label="Aprovadas"  value={stats.aprovadas}  color={C.green700}  loading={loading} />
              <StatPill label="Canceladas" value={stats.canceladas} color={C.slate500}  loading={loading} />
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {FILTER_OPTIONS.map((f) => (
                <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)} activeOpacity={0.7}>
                  <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {loading && <View style={styles.stateCard}><ActivityIndicator color={C.primary} /><Text style={styles.stateText}>Carregando reservas...</Text></View>}
            {!loading && error ? (
              <View style={styles.stateCard}>
                <Ionicons name="alert-circle-outline" size={22} color={C.danger} />
                <Text style={[styles.stateText, { color: C.danger }]}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={reload}><Text style={styles.retryText}>Tentar novamente</Text></TouchableOpacity>
              </View>
            ) : null}
            {!loading && !error && filtered.length === 0 && (
              <View style={styles.stateCard}>
                <Ionicons name="calendar-outline" size={22} color={C.muted} />
                <Text style={styles.stateText}>{filter === "Todos" ? "Nenhuma reserva encontrada." : `Nenhuma reserva "${filter}".`}</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => <ReservationCard item={item} areas={areas} onPress={() => setDetailTarget(item)} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.85}>
        <Ionicons name="add" size={30} color={C.white} />
      </TouchableOpacity>

      <DetailModal reservation={detailTarget} areas={areas} getUserLabel={getUserLabel} onClose={() => setDetailTarget(null)} onEdit={openEdit} onDelete={handleDelete} />

      <ReservationFormModal
        visible={formModal} isEditing={editTarget !== null} isAdmin={isAdmin}
        form={form} areas={areas} onChange={handleFormChange}
        onClose={() => setFormModal(false)} onSubmit={handleSubmit}
        loading={formLoading} error={formError}
      />
    </SafeAreaView>
  );
}

function StatPill({ label, value, color, loading }: { label: string; value: number; color: string; loading: boolean }) {
  return (
    <View style={styles.statPill}>
      {loading ? <ActivityIndicator size="small" color={color} /> : <Text style={[styles.statPillValue, { color }]}>{value}</Text>}
      <Text style={styles.statPillLabel}>{label}</Text>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  listContent: { padding: 20, paddingBottom: 100 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  kicker: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4, color: C.primary, textTransform: "uppercase" },
  title: { fontSize: 26, fontWeight: "800", color: C.text, marginTop: 2 },
  subtitle: { marginTop: 4, fontSize: 13, color: C.muted, maxWidth: 240 },
  iconPill: { width: 48, height: 48, borderRadius: 16, backgroundColor: C.surface, alignItems: "center", justifyContent: "center" },

  statsScroll: { gap: 10, paddingBottom: 4, marginBottom: 12 },
  statPill: { backgroundColor: C.white, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 18, alignItems: "center", gap: 4, minWidth: 80, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  statPillValue: { fontSize: 22, fontWeight: "800" },
  statPillLabel: { fontSize: 11, color: C.muted, fontWeight: "600" },

  filterScroll: { gap: 8, paddingBottom: 4, marginBottom: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: C.white, borderWidth: 1, borderColor: C.border },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterChipText: { fontSize: 13, fontWeight: "600", color: C.muted },
  filterChipTextActive: { color: C.white },

  card: { backgroundColor: C.white, borderRadius: 20, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  cardDateBox: { backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, alignItems: "center", minWidth: 44 },
  cardDay: { fontSize: 18, fontWeight: "800", color: C.text, lineHeight: 20 },
  cardMonth: { fontSize: 9, fontWeight: "700", color: C.muted, textTransform: "uppercase", marginTop: 1 },
  cardInfo: { flex: 1, gap: 4 },
  cardAreaName: { fontSize: 14, fontWeight: "700", color: C.text },
  cardTime: { fontSize: 12, color: C.muted },

  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: "flex-start" },
  badgeText: { fontSize: 10, fontWeight: "700" },

  stateCard: { backgroundColor: C.white, borderRadius: 16, padding: 24, alignItems: "center", gap: 10, marginBottom: 8 },
  stateText: { fontSize: 13, color: C.muted, textAlign: "center" },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: C.primary },
  retryText: { fontSize: 12, fontWeight: "700", color: C.white },

  fab: { position: "absolute", bottom: 100, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: C.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, paddingBottom: 40, gap: 14 },
  modalSheetTall: { backgroundColor: C.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 32, height: "90%", gap: 12 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: C.text },

  // Detalhe
  detailBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, alignSelf: "flex-start" },
  detailBadgeText: { fontSize: 13, fontWeight: "700" },
  detailTitle: { fontSize: 20, fontWeight: "800", color: C.text, lineHeight: 26 },
  detailMeta: { gap: 10, paddingTop: 4, borderTopWidth: 1, borderTopColor: C.border },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  detailRowLabel: { fontSize: 10, fontWeight: "600", color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  detailRowValue: { fontSize: 13, fontWeight: "600", color: C.text, marginTop: 1 },
  detailActions: { flexDirection: "row", gap: 10 },
  detailActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 14, backgroundColor: C.surface },
  detailActionBtnDanger: { backgroundColor: C.dangerBg },
  detailActionText: { fontSize: 13, fontWeight: "700", color: C.primary },

  // Formulário
  formSection: { marginBottom: 20 },
  formSectionTitle: { fontSize: 13, fontWeight: "700", color: C.text, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.6 },

  // Tira de dias
  dateStripContent: { gap: 6, paddingBottom: 4 },
  dayCell: { width: 52, height: 64, borderRadius: 16, backgroundColor: C.inputBg, alignItems: "center", justifyContent: "center", gap: 2 },
  dayCellActive: { backgroundColor: C.primary },
  dayName: { fontSize: 10, fontWeight: "600", color: C.muted, textTransform: "uppercase" },
  dayNameActive: { color: "rgba(255,255,255,0.8)" },
  dayNum: { fontSize: 20, fontWeight: "800", color: C.text },
  dayNumActive: { color: C.white },
  todayDot: { width: 5, height: 5, borderRadius: 999, backgroundColor: C.primary },
  selectedDateLabel: { fontSize: 12, color: C.muted, marginTop: 8, fontWeight: "500" },

  // Grade de slots
  slotSection: { gap: 10 },
  slotLegendRow: { flexDirection: "row", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 12, height: 12, borderRadius: 3 },
  legendLabel: { fontSize: 11, color: C.muted },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  slotCell: {
    width: "22%", paddingVertical: 10, borderRadius: 10,
    backgroundColor: C.slate100, alignItems: "center", justifyContent: "center", gap: 2,
  },
  slotCellActive: { backgroundColor: C.primary },
  slotCellStart: { backgroundColor: C.primary, borderWidth: 2, borderColor: "#243B6B" },
  slotCellEnd: { backgroundColor: C.primary, borderWidth: 2, borderColor: "#243B6B" },
  slotCellOccupied: { backgroundColor: "#E2E8F0" },
  slotText: { fontSize: 12, fontWeight: "700", color: C.text },
  slotTextActive: { color: C.white },
  slotTextOccupied: { color: "#94A3B8", textDecorationLine: "line-through" },
  slotLoading: { alignItems: "center", gap: 8, paddingVertical: 16 },
  slotLoadingText: { fontSize: 12, color: C.muted },
  selectionSummary: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.surface, borderRadius: 10, padding: 10 },
  selectionSummaryText: { fontSize: 13, fontWeight: "700", color: C.primary },
  selectionHint: { fontSize: 12, color: C.muted, textAlign: "center" },
  slotPlaceholder: { alignItems: "center", gap: 8, paddingVertical: 24 },
  slotPlaceholderText: { fontSize: 13, color: C.muted, textAlign: "center" },

  areaScroll: { gap: 8, paddingVertical: 4 },
  areaChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: C.inputBg, borderWidth: 1, borderColor: "transparent" },
  areaChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  areaChipText: { fontSize: 13, fontWeight: "600", color: C.muted },
  areaChipTextActive: { color: C.white },

  toggleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: C.inputBg, alignItems: "center", justifyContent: "center" },
  toggleBtnActive: { backgroundColor: C.primary },
  toggleText: { fontSize: 12, fontWeight: "600", color: C.muted },
  toggleTextActive: { color: C.white },
  formError: { fontSize: 12, color: C.danger, textAlign: "center" },
  submitButton: { height: 52, borderRadius: 16, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", marginTop: 8 },
  submitDisabled: { opacity: 0.45 },
  submitText: { color: C.white, fontSize: 15, fontWeight: "700" },
});
