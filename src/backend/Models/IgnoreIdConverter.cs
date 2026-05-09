using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;

#nullable disable

namespace backend.Models
{
    /// <summary>
    /// Conversor que ignora o campo 'id' durante desserialização,
    /// permitindo que seja serializado normalmente nas respostas.
    /// </summary>
    public class IgnoreIdConverter<T> : JsonConverter<T> where T : new()
    {
        private static readonly PropertyInfo[] Props =
            typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

        public override T? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            using (var doc = JsonDocument.ParseValue(ref reader))
            {
                var obj = new T();
                var element = doc.RootElement;

                foreach (var property in Props)
                {
                    // Ignorar ID na entrada
                    if (property.Name.Equals("Id", StringComparison.OrdinalIgnoreCase))
                        continue;

                    if (!property.CanWrite)
                        continue;

                    var jsonPropertyAttr = property.GetCustomAttribute<JsonPropertyNameAttribute>();
                    var jsonName = jsonPropertyAttr?.Name ?? property.Name;

                    if (!element.TryGetProperty(jsonName, out var prop))
                        continue;

                    try
                    {
                        var value = JsonSerializer.Deserialize(prop.GetRawText(), property.PropertyType, options);
                        property.SetValue(obj, value);
                    }
                    catch { /* Ignorar falhas de deserialização */ }
                }

                return obj;
            }
        }

        public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
        {
            if (value == null)
            {
                writer.WriteNullValue();
                return;
            }

            writer.WriteStartObject();

            foreach (var property in Props)
            {
                if (!property.CanRead)
                    continue;

                var jsonPropertyAttr = property.GetCustomAttribute<JsonPropertyNameAttribute>();
                var jsonName = jsonPropertyAttr?.Name ?? property.Name;
                var propValue = property.GetValue(value);

                writer.WritePropertyName(jsonName);

                if (propValue == null)
                {
                    writer.WriteNullValue();
                }
                else if (propValue is string str)
                {
                    writer.WriteStringValue(str);
                }
                else if (propValue is int intVal)
                {
                    writer.WriteNumberValue(intVal);
                }
                else if (propValue is bool boolVal)
                {
                    writer.WriteBooleanValue(boolVal);
                }
                else if (propValue is DateTime dt)
                {
                    writer.WriteStringValue(dt);
                }
                else if (propValue is Enum enumVal)
                {
                    writer.WriteStringValue(enumVal.ToString());
                }
                else
                {
                    var jsonStr = JsonSerializer.Serialize(propValue, propValue.GetType(), new JsonSerializerOptions(options) { WriteIndented = false });
                    using (var jsonDoc = JsonDocument.Parse(jsonStr))
                    {
                        jsonDoc.RootElement.WriteTo(writer);
                    }
                }
            }

            writer.WriteEndObject();
        }
    }
}