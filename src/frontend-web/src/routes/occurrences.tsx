import { createFileRoute } from "@tanstack/react-router";

// Lembre-se de checar o caminho das importações!
import { AdminSidebar } from "#/components/layout/AdminSidebar";
import { AdminTopbar } from "#/components/layout/AdminTopbar";
import { Button } from "#/components/ui";
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

      <main className="min-h-screen p-4 md:ml-64 md:p-10 lg:p-16">
        <div className="mx-auto max-w-5xl space-y-6 md:space-y-10">
          {/* Cabeçalho da página (como na imagem) */}
          <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="bg-surface-container-high text-primary font-label-sm text-xs px-3 py-1 rounded-full tracking-wider">
                MANUTENÇÃO E LIMPEZA
              </span>
              <h1 className="text-headline-md font-headline-md text-slate-900 mt-2">
                Minhas Ocorrências
              </h1>
              <p className="text-slate-500 font-body-md text-sm mt-1">
                Acompanhe e registre solicitações de manutenção ou limpeza.
              </p>
            </div>
            <Button
              color="primary"
              size="md"
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
