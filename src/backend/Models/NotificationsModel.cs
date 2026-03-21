using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Notification
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("user_id")]
        public int UserId { get; set; }

        [JsonPropertyName("type")]
        public string? Type { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }

        [JsonPropertyName("is_read")]
        public bool IsRead { get; set; }

        [JsonPropertyName("reservation_id")]
        public int? ReservationId { get; set; }

        [JsonPropertyName("occurrence_id")]
        public int? OccurrenceId { get; set; }

        [JsonPropertyName("delivery_id")]
        public int? DeliveryId { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime? CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
