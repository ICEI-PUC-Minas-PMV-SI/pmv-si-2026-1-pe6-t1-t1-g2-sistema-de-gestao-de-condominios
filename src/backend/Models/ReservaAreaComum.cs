using System.Text.Json.Serialization;

namespace backend.Models
{
    public class ReservaAreaComum
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("area_comum_id")]
        public int AreaComumId { get; set; }

        [JsonPropertyName("morador_id")]
        public int MoradorId { get; set; }

        [JsonPropertyName("data_hora_inicio")]
        public DateTime DataHoraInicio { get; set; }

        [JsonPropertyName("data_hora_fim")]
        public DateTime DataHoraFim { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("observacao")]
        public string? Observacao { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime? CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
