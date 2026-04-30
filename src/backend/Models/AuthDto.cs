using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class AuthDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
