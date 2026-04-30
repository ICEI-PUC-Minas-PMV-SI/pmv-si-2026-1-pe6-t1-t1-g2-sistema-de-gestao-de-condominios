import { CreateDeliveryModal } from "./components/CreateDeliveryModal";
import { DeliveriesTable } from "./components/DeliveriesTable";
import { DeliveryPageHeader } from "./components/DeliveryPageHeader";
import { DeliverySidebar } from "./components/DeliverySidebar";
import { DeliveryStatsGrid } from "./components/DeliveryStatsGrid";
import { DeliveryTopbar } from "./components/DeliveryTopbar";
import { FilterModal } from "./components/FilterModal";
import { ReportModal } from "./components/ReportModal";
import { useDeliveriesPage } from "./hooks/useDeliveriesPage";

export function DeliveriesPage() {
	const page = useDeliveriesPage();

	return (
		<div className="bg-background text-on-background min-h-screen font-sans">
			<DeliverySidebar
				authUser={page.authUser}
				avatarUrl={page.avatarUrl}
				displayName={page.displayName}
				onLogout={page.handleLogout}
				profileLabel={page.profileLabel}
			/>
			<DeliveryTopbar
				onSearchTermChange={page.setSearchTerm}
				searchTerm={page.searchTerm}
			/>

			<main className="ml-64 p-8 min-h-screen">
				<div className="max-w-7xl mx-auto space-y-8">
					<DeliveryPageHeader onCreateClick={() => page.setModalOpen(true)} />

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
						deletePending={page.deleteDeliveryMutation.isPending}
						deliveries={page.deliveries}
						errorMessage={page.deliveriesQuery.error?.message}
						filteredDeliveries={page.filteredDeliveries}
						isLoading={page.deliveriesQuery.isLoading}
						onClearFilters={() => page.setActiveFilters([])}
						onDeleteDelivery={page.handleDeleteDelivery}
						onOpenFilterModal={page.openFilterModal}
						onOpenReportModal={() => page.setReportModalOpen(true)}
						onRemoveFilter={page.removeFilter}
						showUsersWarning={Boolean(page.usersQuery.error)}
					/>

					<div className="fixed bottom-0 right-0 -z-10 w-96 h-96 opacity-30">
						<div className="absolute inset-0 bg-gradient-to-tr from-primary-fixed to-surface-dim blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />
					</div>
				</div>
			</main>
		</div>
	);
}
