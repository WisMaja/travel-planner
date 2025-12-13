using backend.Connection;
using backend.DTOs.User;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Pobiera dane aktualnie zalogowanego użytkownika
        /// </summary>
        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetCurrentUserAsync()
        {
            // Pobierz ID użytkownika z tokena JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Nieprawidłowy token użytkownika");
            }

            // Pobierz użytkownika z bazy danych
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return Unauthorized("Użytkownik nie został znaleziony");
            }

            // Mapuj dane użytkownika do DTO
            var userDto = new UserDto
            {
                Id = user.UsersId,
                FullName = user.DisplayName, // Mapowanie DisplayName na FullName
                Email = user.Email,
                ProfileImageUrl = user.AvatarUrl // Mapowanie AvatarUrl na ProfileImageUrl
            };

            return Ok(userDto);
        }
    }
}

