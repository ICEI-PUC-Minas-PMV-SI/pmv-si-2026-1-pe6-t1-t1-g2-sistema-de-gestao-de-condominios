import type { ResidentApiUser } from "../types/resident";

export type ResidentMetrics = {
	totalResidents: number;
	newThisMonth: number;
};

export function calculateResidentStats(users: ResidentApiUser[]): ResidentMetrics {
	const moradores = users.filter(
		(user) => (user.profile ?? "").toLowerCase() === "morador",
	);

	const now = new Date();
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();

	const newThisMonth = moradores.filter((user) => {
		return true;
	}).length;

	return {
		totalResidents: moradores.length,
		newThisMonth,
	};
}
