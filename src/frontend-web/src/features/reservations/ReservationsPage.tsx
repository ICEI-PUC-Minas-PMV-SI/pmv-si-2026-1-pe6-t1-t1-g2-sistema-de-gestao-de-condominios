import { AdminSidebar } from "#/components/layout/AdminSidebar";
import { AdminTopbar } from "#/components/layout/AdminTopbar";
import { ProfileConfigModal } from "#/components/modals/ProfileConfigModal";
import { Button, MaterialIcon } from "#/components/ui";
import { useProfileModal } from "#/hooks/useProfileModal";
import { CreateReservationModal } from "./components/CreateReservationModal";
import { ReservationsList } from "./components/ReservationsList";
import { ReservationsStatsGrid } from "./components/ReservationsStatsGrid";
import { useReservationsPage } from "./hooks/useReservationsPage";

export function ReservationsPage() {
  const page = useReservationsPage();
  const profileModal = useProfileModal();

  return (
    <div className="bg-[#FAFAFA] text-on-background min-h-screen font-sans">
      <AdminSidebar
        authUser={page.authUser}
        avatarUrl={page.avatarUrl}
        displayName={page.displayName}
        onLogout={page.handleLogout}
        onProfileClick={profileModal.open}
        profileLabel={page.profileLabel}
      />

      <ProfileConfigModal
        authUser={page.authUser}
        isOpen={profileModal.isOpen}
        onClose={profileModal.close}
      />

      <AdminTopbar
        authUser={page.authUser}
        avatarUrl={page.avatarUrl}
        displayName={page.displayName}
        profileLabel={page.profileLabel}
        onSearchTermChange={page.setSearchTerm}
        searchTerm={page.searchTerm}
        placeholder="Filtrar por status ou area..."
      />

      <main className="min-h-screen p-4 md:ml-64 md:p-10 lg:p-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                {page.isAdmin ? "Gestao de Reservas" : "Minhas Reservas"}
              </h1>
              <p className="text-slate-500 mt-1">
                {page.isAdmin
                  ? "Analise e gerencie as reservas das areas comuns."
                  : "Solicite e acompanhe suas reservas de areas comuns."}
              </p>
            </div>

            <Button
              color="modern"
              icon={<MaterialIcon name="add_circle" />}
              onClick={page.openCreateModal}
            >
              Nova reserva
            </Button>
          </header>

          {page.isAdmin && <ReservationsStatsGrid stats={page.approvedStats} />}

          {page.isUsingMockAreas && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Areas comuns em modo mock (fallback local). Quando a API retornar dados,
              esta lista sera substituida automaticamente.
            </div>
          )}

          <ReservationsList
            reservations={page.reservations}
            commonAreas={page.commonAreas}
            isLoading={page.reservationsQuery.isLoading}
            errorMessage={page.reservationsQuery.error?.message}
            isAdmin={page.isAdmin}
            onEdit={page.openEditModal}
            onDelete={page.handleDelete}
          />
        </div>
      </main>

      <CreateReservationModal
        open={page.modalOpen}
        isPending={page.isPending}
        isAdmin={page.isAdmin}
        form={page.form}
        areas={page.commonAreas}
        errorMessage={
          page.createMutation.error?.message ?? page.updateMutation.error?.message
        }
        onClose={page.handleCloseModal}
        onSubmit={page.handleSubmit}
        onChange={page.handleFormChange}
        onSlotChange={page.handleSlotChange}
      />
    </div>
  );
}
