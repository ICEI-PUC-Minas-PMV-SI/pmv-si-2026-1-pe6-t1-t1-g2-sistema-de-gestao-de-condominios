using System.Text.Json.Serialization;

namespace backend.Models
{
    public class OccurrenceImage
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("occurrence_id")]
        public int OccurrenceId { get; set; }

        [JsonPropertyName("file_path")]
        public string? FilePath { get; set; }

        [JsonPropertyName("file_name")]
        public string? FileName { get; set; }

        [JsonPropertyName("mime_type")]
        public string? MimeType { get; set; }

        [JsonPropertyName("file_size")]
        public int? FileSize { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime? CreatedAt { get; set; }
    }
}
