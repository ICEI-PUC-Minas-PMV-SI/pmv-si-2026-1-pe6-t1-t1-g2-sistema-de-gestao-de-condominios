import { createFileRoute } from "@tanstack/react-router";
import { AdminSidebar } from "#/components/layout/AdminSidebar";
import { AdminTopbar } from "#/components/layout/AdminTopbar";
import { useOccurrencesPage } from "../features/occurrences/hooks/useOccurrencesPage";
import { OccurrencesList } from "../features/occurrences/components/OccurrencesList";

export const Route = createFileRoute("/admin-occurrences")({
  component: AdminOccurrencesPage,
});

export function AdminOccurrencesPage() {
  const page = useOccurrencesPage(); 

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <AdminSidebar
        authUser={page.authUser}
        avatarUrl={page.avatarUrl}
        displayName={page.displayName}
        onLogout={page.handleLogout}
        profileLabel="Administrador"
      />

      <AdminTopbar
        onSearchTermChange={page.setSearchTerm}
        searchTerm={page.searchTerm}
      />

      <main className="min-h-screen p-4 md:ml-64 md:p-10 lg:p-16">
        <div className="max-w-5xl mx-auto space-y-10">
          <header>
            <h1 className="text-3xl font-bold text-slate-800">Gestão de Ocorrências</h1>
            <p className="text-slate-500">Visão geral de todos os chamados do condomínio.</p>
          </header>

          <OccurrencesList
            occurrences={page.occurrences}
            isLoading={page.occurrencesQuery.isLoading}
            isAdmin={page.isAdmin}
            onEdit={page.openEditModal}
            onDelete={page.handleDelete}
          />
        </div>
      </main>
    </div>
  );
}