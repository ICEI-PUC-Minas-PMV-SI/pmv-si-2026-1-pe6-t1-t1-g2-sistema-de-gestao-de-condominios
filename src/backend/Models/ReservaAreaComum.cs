using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    [JsonConverter(typeof(IgnoreIdConverter<ReservaAreaComum>))]
    public class ReservaAreaComum
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("common_area_id")]
        public int AreaComumId { get; set; }

        [JsonPropertyName("user_id")]
        public int MoradorId { get; set; }

        [JsonPropertyName("start_time")]
        public DateTime DataHoraInicio { get; set; }

        [JsonPropertyName("end_time")]
        public DateTime DataHoraFim { get; set; }

        [JsonPropertyName("status")]
        [JsonRequired]
        [JsonConverter(typeof(ReservationStatusJsonConverter))]
        public ReservationStatus Status { get; set; }

        /// <summary>
        /// Opcional na API; não há coluna correspondente em <c>public.reservations</c> no Supabase (não persistido).
        /// </summary>
        [NotMapped]
        [JsonPropertyName("notes")]
        public string? Observacao { get; set; }

        [JsonPropertyName("created_at")]
        [JsonIgnore]
        public DateTime? CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        [JsonIgnore]
        public DateTime? UpdatedAt { get; set; }
    }
}
