using System.Text.Json.Serialization;

namespace backend.Models
{
    [JsonConverter(typeof(IgnoreIdConverter<Delivery>))]
    public class Delivery
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("recipient_user_id")]
        public int? RecipientUserId { get; set; }

        [JsonPropertyName("recipient_username")]
        public string? RecipientUsername { get; set; }

        [JsonPropertyName("recipient_email")]
        public string? RecipientEmail { get; set; }

        [JsonPropertyName("registered_by_user_id")]
        public int? RegisteredByUserId { get; set; }

        [JsonPropertyName("registered_by_username")]
        public string? RegisteredByUsername { get; set; }

        [JsonPropertyName("registered_by_email")]
        public string? RegisteredByEmail { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("arrival_date")]
        public DateTime ArrivalDate { get; set; }

        [JsonPropertyName("pickup_date")]
        public DateTime? PickupDate { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("created_at")]
        [JsonIgnore]
        public DateTime? CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        [JsonIgnore]
        public DateTime? UpdatedAt { get; set; }
    }
}
