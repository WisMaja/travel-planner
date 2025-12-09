using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.User
{
    public class RegisterRequestDto
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        public required string Password { get; set; }
    }
}
