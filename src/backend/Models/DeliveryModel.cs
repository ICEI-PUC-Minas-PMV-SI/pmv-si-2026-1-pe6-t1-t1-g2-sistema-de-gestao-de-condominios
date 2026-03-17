using System.Text.Json.Serialization;
using backend.Dtos;

namespace backend.Models
{
    public class Delivery
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

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

        [JsonPropertyName("created_at")]
        public DateTime? CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [JsonPropertyName("links")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public List<Link>? Links { get; set; }
    }
}