using System.Text.Json.Serialization;

namespace backend.Models
{
    public class ApiError
    {
        [JsonPropertyName("message")]
        public string Message { get; set; }

        public ApiError(string message)
        {
            Message = message;
        }
    }
}
