import { AdminSidebar } from "#/components/layout/AdminSidebar";
import { AdminTopbar } from "#/components/layout/AdminTopbar";
import { ProfileConfigModal } from "#/components/modals/ProfileConfigModal";
import { CreateResidentModal } from "./components/CreateResidentModal";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import { EditResidentModal } from "./components/EditResidentModal";
import { ReportModal } from "./components/ReportModal";
import { ResidentsPageHeader } from "./components/ResidentsPageHeader";
import { ResidentsStatsGrid } from "./components/ResidentsStatsGrid";
import { ResidentsTable } from "./components/ResidentsTable";
import { useProfileModal } from "#/hooks/useProfileModal";
import { useResidentsPage } from "./hooks/useResidentsPage";

export function ResidentsPage() {
  const page = useResidentsPage();
  const profileModal = useProfileModal();

  const deleteTargetResident = page.residents.find(
    (r) => r.id === page.deleteTargetId,
  );

  return (
    <div className="bg-background text-on-background min-h-screen font-sans">
      <AdminSidebar
        authUser={page.authUser}
        avatarUrl={page.avatarUrl}
        displayName={page.displayName}
        onLogout={page.handleLogout}
        onProfileClick={profileModal.open}
        profileLabel={page.profileLabel}
      />
      <AdminTopbar
        authUser={page.authUser}
        avatarUrl={page.avatarUrl}
        displayName={page.displayName}
        profileLabel={page.profileLabel}
        onSearchTermChange={page.setSearchTerm}
        placeholder="Filtrar por nome, unidade ou email..."
        searchTerm={page.searchTerm}
      />
      <ProfileConfigModal
        authUser={page.authUser}
        isOpen={profileModal.isOpen}
        onClose={profileModal.close}
      />
      <main className="min-h-screen p-4 md:ml-64 md:p-10 lg:p-16">
        <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
          <ResidentsPageHeader
            onCreateClick={() => page.setModalOpen(true)}
            showCreate={page.isAdmin}
          />
          <ResidentsStatsGrid
            stats={page.stats}
            onReportClick={() => page.setReportModalOpen(true)}
          />
          <ResidentsTable
            errorMessage={
              page.hydrated ? page.residentsQuery.error?.message : undefined
            }
            filteredResidents={page.filteredResidents}
            isLoading={page.hydrated ? page.residentsQuery.isLoading : false}
            pagination={page.pagination}
            residents={page.residents}
            selectedFilter={page.selectedFilter}
            totalResidents={page.stats.totalResidents}
            onOpenReportModal={() => page.setReportModalOpen(true)}
            onFilterChange={page.setSelectedFilter}
            onOpenEditModal={page.handleOpenEditModal}
            onOpenDeleteConfirm={page.handleOpenDeleteConfirm}
          />
        </div>
      </main>
      {page.isAdmin && (
        <CreateResidentModal
          errorMessage={page.createResidentMutation.error?.message}
          form={page.form}
          isPending={page.createResidentMutation.isPending}
          onChange={page.handleFormChange}
          onClose={() => page.setModalOpen(false)}
          onSubmit={page.handleSubmitResident}
          open={page.modalOpen}
        />
      )}
      {page.isAdmin && (
        <EditResidentModal
          form={page.editForm}
          isLoading={page.updateResidentMutation.isPending}
          onChange={page.handleEditFormChange}
          onClose={() => page.setEditModalOpen(false)}
          onSubmit={page.handleSubmitEdit}
          open={page.editModalOpen}
          resident={page.editingResident}
        />
      )}
      {page.isAdmin && (
        <DeleteConfirmationModal
          isLoading={page.deleteResidentMutation.isPending}
          onClose={() => page.setDeleteConfirmOpen(false)}
          onConfirm={page.handleConfirmDelete}
          open={page.deleteConfirmOpen}
          residentName={deleteTargetResident?.name}
        />
      )}
      <ReportModal
        residents={page.residents}
        totalResidents={page.stats.totalResidents}
        onReportGenerated={page.handleReportGenerated}
        onClose={() => page.setReportModalOpen(false)}
        open={page.reportModalOpen}
      />
    </div>
  );
}
