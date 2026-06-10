import { createFileRoute } from "@tanstack/react-router";
import { AdminSidebar } from "#/components/layout/AdminSidebar";
import { AdminTopbar } from "#/components/layout/AdminTopbar";
import { Button, MaterialIcon } from "#/components/ui";
import { ProfileConfigModal } from "#/components/modals/ProfileConfigModal";
import { useProfileModal } from "#/hooks/useProfileModal";

import { useOccurrencesPage } from "../features/occurrences/hooks/useOccurrencesPage";
import { OccurrencesStatsGrid } from "../features/occurrences/components/OccurrencesStatsGrid";
import { OccurrencesList } from "../features/occurrences/components/OccurrencesList";
import { CreateOccurrenceModal } from "../features/occurrences/components/CreateOccurrenceModal";

export const Route = createFileRoute("/occurrences")({
  component: OccurrencesPage,
});

export function OccurrencesPage() {
  const page = useOccurrencesPage();
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
        placeholder="Buscar ocorrências..."
        searchTerm={page.searchTerm}
      />

      <main className="min-h-screen p-4 md:ml-64 md:p-10 lg:p-16">
        <div className="max-w-5xl mx-auto space-y-10">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                {page.isAdmin ? "Gestão de Ocorrências" : "Minhas Ocorrências"}
              </h1>
              <p className="text-slate-500 mt-1">
                {page.isAdmin
                  ? "Visualize e gerencie todos os chamados abertos pelos moradores."
                  : "Acompanhe e registre solicitações de manutenção ou limpeza."}
              </p>
            </div>

            {/* Oculta o botão de "Nova Ocorrência" para o Admin, já que ele apenas gerencia */}
            {!page.isAdmin && (
              <Button
                color="modern"
                icon={<MaterialIcon name="add_circle" />}
                onClick={() => page.setModalOpen(true)}
              >
                Nova Ocorrência
              </Button>
            )}
          </header>

          <OccurrencesStatsGrid stats={page.stats} />

          <OccurrencesList
            occurrences={page.occurrences}
            isLoading={page.occurrencesQuery.isLoading}
            isAdmin={page.isAdmin}
            onEdit={page.openEditModal}
            onDelete={page.handleDelete}
          />
        </div>
      </main>

      <CreateOccurrenceModal
        open={page.modalOpen}
        form={page.form}
        isPending={page.isPending}
        isEditing={page.isEditing}
        isAdmin={page.isAdmin} // NOVO: Para mostrar o status no modal de edição
        onChange={page.handleFormChange}
        onFileChange={page.handleFileChange}
        onClose={() => page.setModalOpen(false)}
        onSubmit={page.handleSubmit}
        errorMessage={
          page.createMutation.error?.message ||
          page.updateMutation.error?.message
        }
      />
    </div>
  );
}
