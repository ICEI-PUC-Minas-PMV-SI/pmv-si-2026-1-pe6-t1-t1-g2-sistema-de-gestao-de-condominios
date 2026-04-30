import type { Delivery } from "../types/delivery";
import { isPickedUp, isToday, isWaitingPickup } from "./delivery-formatters";

export function calculateDeliveryStats(deliveries: Delivery[]) {
	return {
		receivedToday: deliveries.filter((delivery) =>
			isToday(delivery.arrival_date),
		).length,
		waitingPickup: deliveries.filter(
			(delivery) => !delivery.pickup_date && isWaitingPickup(delivery.status),
		).length,
		pickedUpToday: deliveries.filter(
			(delivery) => isPickedUp(delivery) && isToday(delivery.pickup_date),
		).length,
		inStorage: deliveries.filter((delivery) => !delivery.pickup_date).length,
	};
}
