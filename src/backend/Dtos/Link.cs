using System.Text.Json.Serialization;

namespace backend.Dtos
{
    public record Link(
        [property: JsonPropertyName("href")] string Href,
        [property: JsonPropertyName("rel")] string Rel,
        [property: JsonPropertyName("method")] string Method
    );
}
