import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AdminSidebar } from "#/components/layout/AdminSidebar";
import { AdminTopbar } from "#/components/layout/AdminTopbar";
import { MaterialIcon } from "#/components/ui";
import { ProfileConfigModal } from "#/components/modals/ProfileConfigModal";
import { useProfileModal } from "#/hooks/useProfileModal";
import { getAuthUser, getAuthToken, clearAuthSession } from "#/services/auth-service";

// ─── Tipos locais ────────────────────────────────────────────────────────────

interface Delivery {
  id: number;
  description: string;
  registeredBy: string;
  status: string;
  receivedAt: string;
  withdrawnAt: string | null;
}

interface Reservation {
  id: number;
  space: string;
  date: string;
  day: string;
  month: string;
  time: string;
  status: string;
}

interface Notice {
  id: number;
  title: string;
  description: string;
  type: "info" | "warning";
}

// ─── Badge de status de encomenda ────────────────────────────────────────────

function DeliveryStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    available_for_pickup: {
      label: "Disponível p/ retirada",
      cls: "bg-amber-100 text-amber-800",
    },
    registered: {
      label: "Registrada",
      cls: "bg-slate-100 text-slate-600",
    },
    withdrawn: {
      label: "Retirada",
      cls: "bg-green-100 text-green-800",
    },
  };

  const s = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-600" };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

// ─── Card de estatística ──────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: number | string;
  icon: string;
  highlight?: boolean;
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

// ─── Componente principal ─────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
  const profileModal = useProfileModal();

  const authUser = getAuthUser();
  const token = getAuthToken();

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);

  const displayName = authUser?.username ?? authUser?.email ?? "Usuário";
  const profileLabel = authUser?.profile ?? "Morador";
  const avatarUrl: string | undefined = undefined;

  const handleLogout = () => {
    clearAuthSession();
    navigate({ to: "/login" });
  };

  // Busca encomendas do usuário autenticado
  useEffect(() => {
    if (!token) return;

    async function fetchDeliveries() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/Deliveries`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
  }, [token]);

  // Dados derivados
  const pendingDeliveries = deliveries.filter(
    (d) => d.status === "available_for_pickup" || d.status === "registered"
  );
  const todayDeliveries = deliveries.filter((d) => {
    const today = new Date().toLocaleDateString("pt-BR");
    return new Date(d.receivedAt).toLocaleDateString("pt-BR") === today;
  });
  const recentDeliveries = [...deliveries]
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
    .slice(0, 5);

  // Reservas e avisos — dados estáticos de exemplo (substituir por fetch quando a API estiver pronta)
  const reservations: Reservation[] = [
    { id: 1, space: "Salão de Festas", date: "12/05/2026", day: "12", month: "Mai", time: "14:00 – 18:00", status: "Confirmada" },
    { id: 2, space: "Churrasqueira 2", date: "18/05/2026", day: "18", month: "Mai", time: "12:00 – 16:00", status: "Confirmada" },
  ];

  const notices: Notice[] = [
    { id: 1, title: "Manutenção da piscina", description: "Piscina fechada nos dias 14 e 15/05 para limpeza programada.", type: "info" },
    { id: 2, title: "Falta d'água prevista", description: "Possível interrupção no abastecimento em 16/05 das 08h às 12h.", type: "warning" },
    { id: 3, title: "Assembleia ordinária", description: "Reunião de condôminos em 20/05 às 19h no salão principal.", type: "info" },
  ];

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

          {/* Cabeçalho */}
          <header>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">
              Bem-vindo(a) de volta, {displayName}. Aqui está o resumo do seu condomínio.
            </p>
          </header>

          {/* Cards de resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Aguardando retirada"
              value={loadingDeliveries ? "…" : pendingDeliveries.length}
              icon="inventory_2"
            />
            <StatCard
              label="Reservas ativas"
              value={reservations.length}
              icon="event"
            />
            <StatCard
              label="Ocorrências abertas"
              value={0}
              icon="report_problem"
            />
            <StatCard
              label="Entregas hoje"
              value={loadingDeliveries ? "…" : todayDeliveries.length}
              icon="local_shipping"
              highlight
            />
          </div>

          {/* Tabela de encomendas recentes */}
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
            ) : recentDeliveries.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Nenhuma encomenda encontrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th className="text-left pb-3 font-medium">Descrição</th>
                      <th className="text-left pb-3 font-medium">Registrado por</th>
                      <th className="text-left pb-3 font-medium">Status</th>
                      <th className="text-left pb-3 font-medium">Recebimento</th>
                      <th className="text-left pb-3 font-medium">Retirada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDeliveries.map((d) => (
                      <tr key={d.id} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 text-slate-700">{d.description}</td>
                        <td className="py-3 text-slate-500">{d.registeredBy}</td>
                        <td className="py-3">
                          <DeliveryStatusBadge status={d.status} />
                        </td>
                        <td className="py-3 text-slate-500">
                          {new Date(d.receivedAt).toLocaleString("pt-BR")}
                        </td>
                        <td className="py-3 text-slate-400">
                          {d.withdrawnAt
                            ? new Date(d.withdrawnAt).toLocaleDateString("pt-BR")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Reservas + Avisos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Próximas reservas */}
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

              {reservations.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">Nenhuma reserva agendada.</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {reservations.map((r) => (
                    <div key={r.id} className="flex items-center gap-4 py-3">
                      <div className="bg-slate-50 rounded-xl px-3 py-2 text-center min-w-[48px]">
                        <p className="text-lg font-bold text-slate-800 leading-none">{r.day}</p>
                        <p className="text-[10px] uppercase text-slate-400 mt-0.5">{r.month}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{r.space}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{r.time}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Avisos do condomínio */}
            <section className="bg-white border border-slate-100 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-5">Avisos do condomínio</h2>
              <div className="divide-y divide-slate-50">
                {notices.map((n) => (
                  <div key={n.id} className="flex gap-3 py-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        n.type === "warning"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
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

          </div>
        </div>
      </main>
    </div>
  );
}
