using System.Text.Json.Serialization;

namespace backend.Models
{
    [JsonConverter(typeof(IgnoreIdConverter<CommonArea>))]
    public class CommonArea
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("capacity")]
        public int Capacity { get; set; }

        [JsonPropertyName("rules")]
        public string? Rules { get; set; }

        [JsonPropertyName("created_at")]
        [JsonIgnore]
        public DateTime? CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        [JsonIgnore]
        public DateTime? UpdatedAt { get; set; }
    }
}
