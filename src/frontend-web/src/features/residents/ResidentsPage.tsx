import { AdminSidebar } from "#/components/layout/AdminSidebar";
import { AdminTopbar } from "#/components/layout/AdminTopbar";
import { CreateResidentModal } from "./components/CreateResidentModal";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import { EditResidentModal } from "./components/EditResidentModal";
import { ReportModal } from "./components/ReportModal";
import { ResidentsPageHeader } from "./components/ResidentsPageHeader";
import { ResidentsStatsGrid } from "./components/ResidentsStatsGrid";
import { ResidentsTable } from "./components/ResidentsTable";
import { useResidentsPage } from "./hooks/useResidentsPage";

export function ResidentsPage() {
	const page = useResidentsPage();

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
			<main className="ml-64 p-10 md:p-16 min-h-screen">
				<div className="max-w-6xl mx-auto space-y-8">
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
