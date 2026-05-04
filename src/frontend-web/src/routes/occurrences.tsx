import { createFileRoute } from "@tanstack/react-router";

// Lembre-se de checar o caminho das importações!
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
      {/* Esse é o menu lateral de navegação */}
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

      {/* E essa é a barra de cima de pesquisa */}
      <AdminTopbar
        authUser={page.authUser}
        avatarUrl={page.avatarUrl}
        displayName={page.displayName}
        profileLabel={page.profileLabel}
        onSearchTermChange={page.setSearchTerm}
        placeholder="Buscar ocorrências..."
        searchTerm={page.searchTerm}
      />

      <main className="ml-64 p-10 md:p-16 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Cabeçalho da página (como na imagem) */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                Minhas Ocorrências
              </h1>
              <p className="text-slate-500 mt-1">
                Acompanhe e registre solicitações de manutenção ou limpeza.
              </p>
            </div>
            <Button
              color="modern"
              icon={<MaterialIcon name="add_circle" />}
              onClick={() => page.setModalOpen(true)}
            >
              Nova Ocorrência
            </Button>
          </header>

          {/* Componentes separados que criamos */}
          <OccurrencesStatsGrid stats={page.stats} />

          <OccurrencesList
            occurrences={page.occurrences}
            isLoading={page.hydrated ? page.occurrencesQuery.isLoading : false}
            errorMessage={
              page.hydrated ? page.occurrencesQuery.error?.message : undefined
            }
          />
        </div>
      </main>

      <CreateOccurrenceModal
        open={page.modalOpen}
        form={page.form}
        isPending={page.createMutation.isPending}
        onChange={page.handleFormChange}
        onClose={() => page.setModalOpen(false)}
        onSubmit={page.handleSubmit}
        errorMessage={page.createMutation.error?.message}
      />
    </div>
  );
}
