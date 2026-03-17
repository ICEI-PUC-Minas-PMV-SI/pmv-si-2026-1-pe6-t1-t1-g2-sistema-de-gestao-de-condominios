using System.Text.Json.Serialization;

namespace backend.Dtos
{
    public class DeliveryUpsertRequest
    {
        [JsonPropertyName("recipient_user_id")]
        public int? RecipientUserId { get; set; }

        [JsonPropertyName("registered_by_user_id")]
        public int? RegisteredByUserId { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("arrival_date")]
        public DateTime ArrivalDate { get; set; }

        [JsonPropertyName("pickup_date")]
        public DateTime? PickupDate { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }
    }
}