import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AdminSidebar } from "#/components/layout/AdminSidebar";
import { AdminTopbar } from "#/components/layout/AdminTopbar";
import { ProfileConfigModal } from "#/components/modals/ProfileConfigModal";
import { useProfileModal } from "#/hooks/useProfileModal";
import { getAuthUser, getAuthToken, clearAuthSession } from "#/services/auth-service";

// ─── Tipos locais ────────────────────────────────────────────────────────────

// Campos nomeados conforme [JsonPropertyName] do modelo C# Delivery
interface Delivery {
  id: number;
  description: string | null;
  registered_by_username: string | null;
  registered_by_email: string | null;
  status: string | null;
  arrival_date: string;
  pickup_date: string | null;
  recipient_user_id: number | null;
  recipient_username: string | null;
}

// Campos nomeados conforme [JsonPropertyName] do modelo C# ReservaAreaComum
interface Reservation {
  id: number;
  common_area_id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  status: string;       // "Pendente" | "Aprovada" | "Cancelada" | "Rejeitada"
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface CommonArea {
  id: number;
  name: string;
}

interface Notice {
  id: number;
  title: string;
  description: string;
  type: "info" | "warning";
}

// ─── Avisos do condomínio (estáticos — visíveis para todos) ──────────────────

const notices: Notice[] = [
  { id: 1, title: "Manutenção da piscina",  description: "Piscina fechada nos dias 14 e 15/05 para limpeza programada.", type: "info" },
  { id: 2, title: "Falta d'água prevista",  description: "Possível interrupção no abastecimento em 16/05 das 08h às 12h.", type: "warning" },
  { id: 3, title: "Assembleia ordinária",   description: "Reunião de condôminos em 20/05 às 19h no salão principal.",    type: "info" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR");
}

function parseDateObj(dateStr: string): Date {
  return new Date(dateStr);
}

function buildReservationDisplay(r: Reservation, areas: CommonArea[]): {
  day: string; month: string; time: string; spaceName: string;
} {
  const start = parseDateObj(r.start_time);
  const end   = parseDateObj(r.end_time);
  const day   = start.toLocaleDateString("pt-BR", { day: "2-digit" });
  const month = start.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  const pad   = (n: number) => String(n).padStart(2, "0");
  const time  = `${pad(start.getHours())}:${pad(start.getMinutes())} – ${pad(end.getHours())}:${pad(end.getMinutes())}`;
  const area  = areas.find((a) => a.id === r.common_area_id);
  return { day, month, time, spaceName: area?.name ?? `Área ${r.common_area_id}` };
}

// ─── Badge de status de encomenda ─────────────────────────────────────────────

function DeliveryStatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { label: string; cls: string }> = {
    available_for_pickup: { label: "Disponível p/ retirada", cls: "bg-amber-100 text-amber-800" },
    registered:           { label: "Registrada",             cls: "bg-slate-100 text-slate-600" },
    withdrawn:            { label: "Retirada",               cls: "bg-green-100 text-green-800" },
  };
  const key = status ?? "";
  const s = map[key] ?? { label: key || "—", cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

// ─── Badge de status de reserva ───────────────────────────────────────────────

function ReservationStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Aprovada:   "bg-green-100 text-green-800",
    Confirmada: "bg-green-100 text-green-800",
    Pendente:   "bg-amber-100 text-amber-800",
    Cancelada:  "bg-red-100 text-red-700",
  };
  const cls = map[status] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${cls}`}>{status}</span>
  );
}

// ─── Card de estatística ──────────────────────────────────────────────────────

function StatCard({
  label, value, icon, highlight = false,
}: {
  label: string; value: number | string; icon: string; highlight?: boolean;
}) {
  if (highlight) {
    return (
      <div className="rounded-2xl bg-slate-800 text-white p-5 flex flex-col gap-3">
        <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-4xl font-bold">{value}</p>
        <div className="h-0.5 bg-white/20 rounded-full">
          <div className="h-0.5 bg-white rounded-full w-3/4" />
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-5 flex flex-col gap-3">
      <span className="material-symbols-outlined text-2xl text-slate-400">{icon}</span>
      <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-4xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

// ─── Avisos — visível para todos ──────────────────────────────────────────────

function NoticesSection() {
  return (
    <section className="bg-white border border-slate-100 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-5">Avisos do condomínio</h2>
      <div className="divide-y divide-slate-50">
        {notices.map((n) => (
          <div key={n.id} className="flex gap-3 py-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              n.type === "warning" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
            }`}>
              <span className="material-symbols-outlined text-base">
                {n.type === "warning" ? "warning" : "info"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{n.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{n.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Visão do MORADOR ─────────────────────────────────────────────────────────
// Encomendas: apenas as do próprio usuário (filtradas por recipientUserId)
// Reservas:   apenas as do próprio usuário (filtradas por userId)

function MoradorDashboard({
  deliveries,
  loadingDeliveries,
  reservations,
  loadingReservations,
  areas,
  navigate,
}: {
  deliveries: Delivery[];
  loadingDeliveries: boolean;
  reservations: Reservation[];
  loadingReservations: boolean;
  areas: CommonArea[];
  navigate: ReturnType<typeof useNavigate>;
}) {
  const pending = deliveries.filter(
    (d) => d.status === "available_for_pickup" || d.status === "registered"
  );
  const todayStr = new Date().toLocaleDateString("pt-BR");
  const today = deliveries.filter(
    (d) => new Date(d.arrival_date).toLocaleDateString("pt-BR") === todayStr
  );
  const recent = [...deliveries]
    .sort((a, b) => new Date(b.arrival_date).getTime() - new Date(a.arrival_date).getTime())
    .slice(0, 5);

  // Apenas reservas futuras ou de hoje, ordenadas por data
  const upcoming = [...reservations]
    .filter((r) => r.status !== "Cancelada" && new Date(r.start_time) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5);

  return (
    <>
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Aguardando retirada" value={loadingDeliveries ? "…" : pending.length}    icon="inventory_2" />
        <StatCard label="Minhas reservas"     value={loadingReservations ? "…" : upcoming.length} icon="event" />
        <StatCard label="Entregas hoje"       value={loadingDeliveries ? "…" : today.length}      icon="local_shipping" highlight />
      </div>

      {/* ── Encomendas recentes ── */}
      <section className="bg-white border border-slate-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-800">Minhas encomendas recentes</h2>
          <button
            className="text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition"
            onClick={() => navigate({ to: "/deliveries" })}
          >
            Ver todas
          </button>
        </div>
        {loadingDeliveries ? (
          <p className="text-slate-400 text-sm text-center py-8">Carregando encomendas…</p>
        ) : recent.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Nenhuma encomenda encontrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="text-left pb-3 font-medium">Descrição</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Recebimento</th>
                  <th className="text-left pb-3 font-medium">Retirada</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((d) => (
                  <tr key={d.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 text-slate-700">{d.description ?? "—"}</td>
                    <td className="py-3"><DeliveryStatusBadge status={d.status} /></td>
                    <td className="py-3 text-slate-500">{formatDateBR(d.arrival_date)}</td>
                    <td className="py-3 text-slate-400">{formatDateBR(d.pickup_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Próximas reservas + Avisos ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-slate-800">Minhas próximas reservas</h2>
            <button
              className="text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition"
              onClick={() => navigate({ to: "/reservations" })}
            >
              Nova reserva
            </button>
          </div>
          {loadingReservations ? (
            <p className="text-slate-400 text-sm text-center py-6">Carregando reservas…</p>
          ) : upcoming.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Nenhuma reserva agendada.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {upcoming.map((r) => {
                const { day, month, time, spaceName } = buildReservationDisplay(r, areas);
                return (
                  <div key={r.id} className="flex items-center gap-4 py-3">
                    <div className="bg-slate-50 rounded-xl px-3 py-2 text-center min-w-[48px]">
                      <p className="text-lg font-bold text-slate-800 leading-none">{day}</p>
                      <p className="text-[10px] uppercase text-slate-400 mt-0.5">{month}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{spaceName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{time}</p>
                    </div>
                    <ReservationStatusBadge status={r.status} />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <NoticesSection />
      </div>
    </>
  );
}

// ─── Visão do ADMINISTRADOR ───────────────────────────────────────────────────
// Encomendas: todas do condomínio
// Reservas:   todas do condomínio (com nome do morador quando disponível)

function AdminDashboard({
  deliveries,
  loadingDeliveries,
  reservations,
  loadingReservations,
  areas,
  navigate,
}: {
  deliveries: Delivery[];
  loadingDeliveries: boolean;
  reservations: Reservation[];
  loadingReservations: boolean;
  areas: CommonArea[];
  navigate: ReturnType<typeof useNavigate>;
}) {
  const pending = deliveries.filter(
    (d) => d.status === "available_for_pickup" || d.status === "registered"
  );
  const todayStr = new Date().toLocaleDateString("pt-BR");
  const today = deliveries.filter(
    (d) => new Date(d.arrival_date).toLocaleDateString("pt-BR") === todayStr
  );
  const recent = [...deliveries]
    .sort((a, b) => new Date(b.arrival_date).getTime() - new Date(a.arrival_date).getTime())
    .slice(0, 8);

  const upcoming = [...reservations]
    .filter((r) => r.status !== "Cancelada" && new Date(r.start_time) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5);

  return (
    <>
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Encomendas pendentes" value={loadingDeliveries ? "…" : pending.length}    icon="inventory_2" />
        <StatCard label="Reservas ativas"      value={loadingReservations ? "…" : upcoming.length} icon="event" />
        <StatCard label="Ocorrências abertas"  value={0}                                            icon="report_problem" />
        <StatCard label="Entregas hoje"        value={loadingDeliveries ? "…" : today.length}      icon="local_shipping" highlight />
      </div>

      {/* ── Encomendas recentes — todos os moradores ── */}
      <section className="bg-white border border-slate-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Encomendas recentes — todos os moradores</h2>
            <p className="text-xs text-slate-400 mt-0.5">Visão geral do condomínio</p>
          </div>
          <button
            className="text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition"
            onClick={() => navigate({ to: "/deliveries" })}
          >
            Gerenciar
          </button>
        </div>
        {loadingDeliveries ? (
          <p className="text-slate-400 text-sm text-center py-8">Carregando encomendas…</p>
        ) : recent.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Nenhuma encomenda encontrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="text-left pb-3 font-medium">Destinatário</th>
                  <th className="text-left pb-3 font-medium">Descrição</th>
                  <th className="text-left pb-3 font-medium">Registrado por</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Recebimento</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((d) => (
                  <tr key={d.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 text-slate-700 font-medium">{d.recipient_username ?? "—"}</td>
                    <td className="py-3 text-slate-600">{d.description ?? "—"}</td>
                    <td className="py-3 text-slate-500">{d.registered_by_username ?? d.registered_by_email ?? "—"}</td>
                    <td className="py-3"><DeliveryStatusBadge status={d.status} /></td>
                    <td className="py-3 text-slate-500">{formatDateBR(d.arrival_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Próximas reservas (todos) + Avisos ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Próximas reservas</h2>
              <p className="text-xs text-slate-400 mt-0.5">Todos os moradores</p>
            </div>
            <button
              className="text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition"
              onClick={() => navigate({ to: "/reservations" })}
            >
              Ver todas
            </button>
          </div>
          {loadingReservations ? (
            <p className="text-slate-400 text-sm text-center py-6">Carregando reservas…</p>
          ) : upcoming.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Nenhuma reserva agendada.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {upcoming.map((r) => {
                const { day, month, time, spaceName } = buildReservationDisplay(r, areas);
                return (
                  <div key={r.id} className="flex items-center gap-4 py-3">
                    <div className="bg-slate-50 rounded-xl px-3 py-2 text-center min-w-[48px]">
                      <p className="text-lg font-bold text-slate-800 leading-none">{day}</p>
                      <p className="text-[10px] uppercase text-slate-400 mt-0.5">{month}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{spaceName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {time}
                        {r.residentName && <span className="ml-2 text-slate-500">· {r.residentName}</span>}
                      </p>
                    </div>
                    <ReservationStatusBadge status={r.status} />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <NoticesSection />
      </div>
    </>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
  const profileModal = useProfileModal();

  const authUser  = getAuthUser();
  const token     = getAuthToken();
  const isAdmin   = authUser?.profile?.toLowerCase() === "administrador";
  const userId    = authUser?.id as number | undefined;

  const displayName  = authUser?.username ?? authUser?.email ?? "Usuário";
  const profileLabel = authUser?.profile ?? "Morador";
  const avatarUrl: string | undefined = undefined;

  // ── Estado ────────────────────────────────────────────────────────────────
  const [deliveries,          setDeliveries]          = useState<Delivery[]>([]);
  const [loadingDeliveries,   setLoadingDeliveries]   = useState(true);

  const [reservations,        setReservations]        = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);

  const [areas, setAreas] = useState<CommonArea[]>([]);

  // ── Auth helpers ──────────────────────────────────────────────────────────
  const handleLogout = () => {
    clearAuthSession();
    navigate({ to: "/login" });
  };

  const headers = { Authorization: `Bearer ${token}` };
  const base    = import.meta.env.VITE_BACKEND_URL;

  // ── Fetch encomendas ──────────────────────────────────────────────────────
  // Admin → todas   |   Morador → apenas as suas (recipientUserId)
  useEffect(() => {
    if (!token) { setLoadingDeliveries(false); return; }

    async function fetchDeliveries() {
      try {
        const url = isAdmin
          ? `${base}/api/Deliveries`
          : `${base}/api/Deliveries?recipientUserId=${userId}`;

        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error("Erro ao buscar encomendas");
        const data = await res.json();
        setDeliveries(Array.isArray(data) ? data : []);
      } catch {
        setDeliveries([]);
      } finally {
        setLoadingDeliveries(false);
      }
    }

    void fetchDeliveries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAdmin, userId]);

  // ── Fetch reservas + áreas comuns ─────────────────────────────────────────
  // A API de reservas retorna todas — filtramos no cliente para o morador.
  // As áreas comuns são necessárias para exibir o nome do espaço.
  useEffect(() => {
    if (!token) { setLoadingReservations(false); return; }

    async function fetchReservationsAndAreas() {
      try {
        const [resReservations, resAreas] = await Promise.all([
          fetch(`${base}/api/reservas`,      { headers }),
          fetch(`${base}/api/areas-comuns`,  { headers }),
        ]);

        const rawReservations: Reservation[] = resReservations.ok
          ? await resReservations.json()
          : [];

        const rawAreas: CommonArea[] = resAreas.ok ? await resAreas.json() : [];

        setAreas(rawAreas);

        // Morador vê apenas as suas próprias reservas (campo user_id conforme JsonPropertyName do modelo)
        const filtered = isAdmin
          ? rawReservations
          : rawReservations.filter((r) => r.user_id === userId);

        setReservations(filtered);
      } catch {
        setReservations([]);
      } finally {
        setLoadingReservations(false);
      }
    }

    void fetchReservationsAndAreas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAdmin, userId]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#FAFAFA] text-on-background min-h-screen font-sans">
      <AdminSidebar
        authUser={authUser}
        avatarUrl={avatarUrl}
        displayName={displayName}
        onLogout={handleLogout}
        onProfileClick={profileModal.open}
        profileLabel={profileLabel}
      />

      <ProfileConfigModal
        authUser={authUser}
        isOpen={profileModal.isOpen}
        onClose={profileModal.close}
      />

      <AdminTopbar
        authUser={authUser}
        avatarUrl={avatarUrl}
        displayName={displayName}
        profileLabel={profileLabel}
        searchTerm=""
        onSearchTermChange={() => {}}
        placeholder="Buscar no condomínio..."
      />

      <main className="ml-64 p-10 md:p-16 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-10">

          <header>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">
              Bem-vindo(a) de volta, {displayName}.{" "}
              {isAdmin
                ? "Aqui está a visão geral do condomínio."
                : "Aqui está o resumo das suas informações."}
            </p>
          </header>

          {isAdmin ? (
            <AdminDashboard
              deliveries={deliveries}
              loadingDeliveries={loadingDeliveries}
              reservations={reservations}
              loadingReservations={loadingReservations}
              areas={areas}
              navigate={navigate}
            />
          ) : (
            <MoradorDashboard
              deliveries={deliveries}
              loadingDeliveries={loadingDeliveries}
              reservations={reservations}
              loadingReservations={loadingReservations}
              areas={areas}
              navigate={navigate}
            />
          )}

        </div>
      </main>
    </div>
  );
}
