using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.User
{
    public class RefreshTokenRequestDto
    {
        [Required]
        public required string AccessToken { get; set; }
        [Required]
        public required string RefreshToken { get; set; }
    }
}
