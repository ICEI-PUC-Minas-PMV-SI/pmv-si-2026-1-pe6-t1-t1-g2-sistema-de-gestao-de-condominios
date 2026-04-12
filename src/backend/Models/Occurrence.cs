using System.Text.Json.Serialization;

namespace backend.Models
{
    [JsonConverter(typeof(IgnoreIdConverter<Occurrence>))]
    public class Occurrence
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("user_id")]
        public int? UserId { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

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