using backend.Connection;
using backend.DTOs.User;
using backend.Services;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;


namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // �cie�ka: /api/user
    public class AuthController : ControllerBase
    {
        private ITokenService _tokenService;
        private readonly ApplicationDbContext _context;

        public AuthController(ITokenService tokenService, ApplicationDbContext context)
        {
            _tokenService = tokenService;
            _context = context;
        }

        #region Rejestracja z Tworzeniem Main wallet
        [HttpPost("register")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequestDto dto)
        {
            var isEmailTaken = _context.Set<Users>().Any(u => u.Email != null && u.Email.Equals(dto.Email));
            if (isEmailTaken) return Conflict("U�ytkownik o tym emailu ju� istnieje");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = new Users
                {
                    Email = dto.Email,
                    DisplayName = dto.Email.Split('@')[0], // Użyj części przed @ jako DisplayName
                    RegisteredAtUtc = DateTime.UtcNow,
                    LastLoginAtUtc = DateTime.UtcNow
                };
                user.PasswordHash = new PasswordHasher<Users>().HashPassword(user, dto.Password);

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return NoContent();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(StatusCodes.Status500InternalServerError, "B��d serwera");
            }
        }

        #endregion

        #region Logowanie

        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]

        public async Task<IActionResult> LoginAsync([FromBody] LoginRequestDto dto)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email!.Equals(dto.Email));
            if (user == null) return Unauthorized();

            var passwordHasher = new PasswordHasher<Users>();
            var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash!, dto.Password);
            if (result == PasswordVerificationResult.Failed) return Unauthorized();

            var refreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshToken = refreshToken.token;
            user.RefreshTokenExpiration = refreshToken.expiration;

            await _context.SaveChangesAsync();

            var response = new TokenResponseDto
            {
                AccessToken = _tokenService.GenerateAccessToken(user),
                RefreshToken = refreshToken.token,
            };

            return Ok(response);

        }
        #endregion

        #region RefreshToken
        [HttpPost("refresh")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> RefreshTokenAsync([FromBody] RefreshTokenRequestDto dto)
        {
            var principal = _tokenService.ValidateAndGetPrincipalFromJwt(dto.AccessToken, false);
            if (principal is null) return Unauthorized();

            var claimIdUser = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (claimIdUser is null || !int.TryParse(claimIdUser, out _))
                return Unauthorized();

            var user = _context.Users.FirstOrDefault(u => u.UsersId == Guid.Parse(claimIdUser));
            if (user is null || user.RefreshToken != dto.RefreshToken || user.RefreshTokenExpiration < DateTime.UtcNow)
                return Unauthorized();

            var refreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshToken = refreshToken.token;
            user.RefreshTokenExpiration = refreshToken.expiration;

            await _context.SaveChangesAsync();

            var response = new TokenResponseDto
            {
                AccessToken = _tokenService.GenerateAccessToken(user),
                RefreshToken = refreshToken.token,
            };

            return Ok(response);
        }
        #endregion


        #region Zmiana has�a
        [Authorize]
        [HttpPut("change-password")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return Unauthorized();

            var hasher = new PasswordHasher<Users>();
            var result = hasher.VerifyHashedPassword(user, user.PasswordHash!, dto.CurrentPassword);
            if (result == PasswordVerificationResult.Failed)
                return BadRequest("Nieprawid�owe aktualne has�o.");

            // Walidacja nowego has�a
            var passwordValidationError = ValidatePassword(dto.NewPassword);
            if (!string.IsNullOrEmpty(passwordValidationError))
                return BadRequest(passwordValidationError);

            user.PasswordHash = hasher.HashPassword(user, dto.NewPassword);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Funkcja waliduj�ca nowe has�o pod k�tem bezpiecze�stwa
        private string ValidatePassword(string password)
        {
            if (password.Length < 8)
                return "Password must be at least 8 characters long";

            if (!password.Any(char.IsDigit))
                return "Password must contain at least one number";

            if (!password.Any(char.IsUpper))
                return "Password must contain at least one uppercase letter";

            if (!password.Any(char.IsLower))
                return "Password must contain at least one lowercase letter";

            if (!password.Any(ch => "!@#$%^&*(),.?\":{}|<>".Contains(ch)))
                return "Password must contain at least one special character";

            return null; // brak b��d�w
        }



        #endregion


    }
}