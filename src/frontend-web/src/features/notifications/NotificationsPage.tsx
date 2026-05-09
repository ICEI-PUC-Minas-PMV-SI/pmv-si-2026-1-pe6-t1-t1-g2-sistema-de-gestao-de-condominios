import { AdminSidebar } from "#/components/layout/AdminSidebar";
import { AdminTopbar } from "#/components/layout/AdminTopbar";
import { CreateNotificationModal } from "./components/CreateNotificationModal";
import { NotificationsList } from "./components/NotificationsList";
import { NotificationsPageHeader } from "./components/NotificationsPageHeader";
import { NotificationsStatsGrid } from "./components/NotificationsStatsGrid";
import { useNotificationsPage } from "./hooks/useNotificationsPage";

export function NotificationsPage() {
	const page = useNotificationsPage();

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
				onSearchTermChange={page.setSearchTerm}
				placeholder="Buscar por mensagem, morador ou vinculo..."
				profileLabel={page.profileLabel}
				searchTerm={page.searchTerm}
			/>

			<main className="ml-64 min-h-screen p-8">
				<div className="mx-auto max-w-6xl space-y-8">
					<NotificationsPageHeader
						onCreateClick={() => page.setModalOpen(true)}
						showCreate={page.isAdmin}
					/>
					<NotificationsStatsGrid stats={page.stats} />
					<NotificationsList
						deletePending={page.deleteNotificationMutation.isPending}
						errorMessage={
							page.hydrated ? page.notificationsQuery.error?.message : undefined
						}
						filteredNotifications={page.filteredNotifications}
						isLoading={
							page.hydrated ? page.notificationsQuery.isLoading : false
						}
						notifications={page.notifications}
						onDeleteNotification={page.handleDeleteNotification}
						onStatusFilterChange={page.setStatusFilter}
						onToggleReadStatus={page.handleToggleReadStatus}
						statusFilter={page.statusFilter}
						toggleReadPending={page.updateReadStatusMutation.isPending}
						usersById={page.usersById}
					/>
				</div>
			</main>

			{page.isAdmin && (
				<CreateNotificationModal
					errorMessage={page.createNotificationMutation.error?.message}
					form={page.form}
					isPending={page.createNotificationMutation.isPending}
					onChange={page.handleFormChange}
					onClose={() => page.setModalOpen(false)}
					onSubmit={page.handleSubmitNotification}
					open={page.modalOpen}
					users={page.usersQuery.data ?? []}
				/>
			)}
		</div>
	);
}
