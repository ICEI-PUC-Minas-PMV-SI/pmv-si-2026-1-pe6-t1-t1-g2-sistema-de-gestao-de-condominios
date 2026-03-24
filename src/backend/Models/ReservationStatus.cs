using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.Models;

/// <summary>
/// Valores alinhados ao enum PostgreSQL <c>public.reservation_status</c> no Supabase
/// (confirmado via MCP: Pendente, Aprovada, Rejeitada, Cancelada).
/// </summary>
public enum ReservationStatus
{
    Pendente,
    Aprovada,
    Rejeitada,
    Cancelada
}

/// <summary>
/// Aceita os mesmos rótulos com qualquer capitalização (ex.: <c>pendente</c> ou <c>Pendente</c>).
/// </summary>
public sealed class ReservationStatusJsonConverter : JsonConverter<ReservationStatus>
{
    public override ReservationStatus Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.String)
        {
            throw new JsonException("O campo status deve ser uma string.");
        }

        var s = reader.GetString();
        if (string.IsNullOrWhiteSpace(s))
        {
            throw new JsonException("O campo status não pode ser vazio.");
        }

        // Compat: API antiga usava "Confirmada"; no BD o rótulo é "Aprovada".
        if (string.Equals(s, "Confirmada", StringComparison.OrdinalIgnoreCase))
        {
            return ReservationStatus.Aprovada;
        }

        if (Enum.TryParse<ReservationStatus>(s, ignoreCase: true, out var value))
        {
            return value;
        }

        throw new JsonException("Status inválido. Valores aceitos: Pendente, Aprovada, Rejeitada, Cancelada.");
    }

    public override void Write(Utf8JsonWriter writer, ReservationStatus value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString());
    }
}
