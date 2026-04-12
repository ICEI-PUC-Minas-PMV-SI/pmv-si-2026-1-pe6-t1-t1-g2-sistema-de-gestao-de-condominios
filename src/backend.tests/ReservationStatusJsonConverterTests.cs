using System.Text.Json;
using backend.Models;

namespace backend.tests;

public class ReservationStatusJsonConverterTests
{
    private static readonly JsonSerializerOptions Options = new()
    {
        Converters = { new ReservationStatusJsonConverter() }
    };

    [Theory]
    [InlineData("Pendente", ReservationStatus.Pendente)]
    [InlineData("pendente", ReservationStatus.Pendente)]
    [InlineData("Aprovada", ReservationStatus.Aprovada)]
    [InlineData("Confirmada", ReservationStatus.Aprovada)]
    [InlineData("Confirmado", ReservationStatus.Aprovada)]
    public void Read_AceitaValoresValidos(string input, ReservationStatus expected)
    {
        var json = $"\"{input}\"";
        var value = JsonSerializer.Deserialize<ReservationStatus>(json, Options);

        Assert.Equal(expected, value);
    }

    [Fact]
    public void Read_ValorInvalido_LancaJsonException()
    {
        var ex = Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<ReservationStatus>("\"Inexistente\"", Options));

        Assert.Contains("Status inválido", ex.Message);
    }

    [Fact]
    public void Write_SerializaComoStringDoEnum()
    {
        var json = JsonSerializer.Serialize(ReservationStatus.Cancelada, Options);

        Assert.Equal("\"Cancelada\"", json);
    }
}
