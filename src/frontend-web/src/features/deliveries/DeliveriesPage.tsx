import { AdminSidebar } from "#/components/layout/AdminSidebar";
import { AdminTopbar } from "#/components/layout/AdminTopbar";
import { ProfileConfigModal } from "#/components/modals/ProfileConfigModal";
import { useProfileModal } from "#/hooks/useProfileModal";
import { CreateDeliveryModal } from "./components/CreateDeliveryModal";
import { DeliveriesTable } from "./components/DeliveriesTable";
import { DeliveryPageHeader } from "./components/DeliveryPageHeader";
import { DeliveryStatsGrid } from "./components/DeliveryStatsGrid";
import { EditDeliveryModal } from "./components/EditDeliveryModal";
import { FilterModal } from "./components/FilterModal";
import { ReportModal } from "./components/ReportModal";
import { useDeliveriesPage } from "./hooks/useDeliveriesPage";

function canCreateDeliveries(profile: string | null | undefined): boolean {
  const normalizedProfile = profile?.toLowerCase();
  return (
    normalizedProfile === "administrador" || normalizedProfile === "porteiro"
  );
}

export function DeliveriesPage() {
	const page = useDeliveriesPage();
	const profileModal = useProfileModal();

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
        searchTerm={page.searchTerm}
      />

      <main className="min-h-screen p-4 md:ml-64 md:p-8">
        <ProfileConfigModal
          authUser={page.authUser}
          isOpen={profileModal.isOpen}
          onClose={profileModal.close}
        />
        <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
          <DeliveryPageHeader
            onCreateClick={() => page.setModalOpen(true)}
            canCreate={canCreateDeliveries(page.authUser?.profile)}
          />

          {canCreateDeliveries(page.authUser?.profile) && (
            <CreateDeliveryModal
              errorMessage={page.createDeliveryMutation.error?.message}
              form={page.form}
              isPending={page.createDeliveryMutation.isPending}
              onChange={page.handleFormChange}
              onClose={() => page.setModalOpen(false)}
              onSubmit={page.handleSubmitDelivery}
              open={page.modalOpen}
              users={page.usersQuery.data ?? []}
            />
          )}

          <ReportModal
            deliveries={page.deliveries}
            onClose={() => page.setReportModalOpen(false)}
            open={page.reportModalOpen}
            stats={page.stats}
          />

          <FilterModal
            filterForm={page.filterForm}
            onApply={page.applyFilters}
            onChange={page.setFilterForm}
            onClose={() => page.setFilterModalOpen(false)}
            open={page.filterModalOpen}
          />

          <DeliveryStatsGrid
            stats={page.stats}
            totalDeliveries={page.deliveries.length}
          />

          <DeliveriesTable
            activeFilters={page.activeFilters}
            authUser={page.authUser}
            deletePending={page.deleteDeliveryMutation.isPending}
            deliveries={page.deliveries}
            errorMessage={page.deliveriesQuery.error?.message}
            filteredDeliveries={page.filteredDeliveries}
            isLoading={page.deliveriesQuery.isLoading}
            onClearFilters={() => page.setActiveFilters([])}
            onDeleteDelivery={page.handleDeleteDelivery}
            onEditDelivery={page.handleEditDelivery}
            onOpenFilterModal={page.openFilterModal}
            onOpenReportModal={() => page.setReportModalOpen(true)}
            onRemoveFilter={page.removeFilter}
            showUsersWarning={Boolean(page.usersQuery.error)}
          />

          {page.editModalOpen && page.editingDelivery && (
            <EditDeliveryModal
              delivery={page.editingDelivery}
              errorMessage={page.updateDeliveryMutation.error?.message}
              formData={page.formData}
              isPending={page.updateDeliveryMutation.isPending}
              onChange={page.handleEditFormChange}
              onClose={() => page.setEditModalOpen(false)}
              onSubmit={page.handleSubmitEditDelivery}
              open={page.editModalOpen}
              users={page.usersQuery.data ?? []}
            />
          )}

          <div className="fixed bottom-0 right-0 -z-10 w-96 h-96 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-fixed to-surface-dim blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />
          </div>
        </div>
      </main>
    </div>
  );
}
