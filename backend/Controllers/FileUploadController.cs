using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace backend.Controllers
{
    /// <summary>
    /// Kontroler do zarządzania uploadem plików (zdjęć)
    /// </summary>
    [ApiController]
    [Route("api/files")]
    [Authorize]
    public class FileUploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<FileUploadController> _logger;
        private const string UploadsFolder = "uploads";
        private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

        public FileUploadController(IWebHostEnvironment environment, ILogger<FileUploadController> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        /// <summary>
        /// Uploaduje plik obrazu dla planu podróży
        /// </summary>
        [HttpPost("upload")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<FileUploadResponse>> UploadFile(IFormFile file)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });
                }

                // Walidacja pliku
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "Plik jest pusty" });
                }

                if (file.Length > MaxFileSize)
                {
                    return BadRequest(new { message = $"Plik jest za duży. Maksymalny rozmiar to {MaxFileSize / (1024 * 1024)} MB" });
                }

                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!AllowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { message = $"Nieobsługiwany format pliku. Dozwolone formaty: {string.Join(", ", AllowedExtensions)}" });
                }

                // Utwórz folder uploads jeśli nie istnieje
                var uploadsPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, UploadsFolder);
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                // Generuj unikalną nazwę pliku
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Zapisz plik
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Zwróć URL do pliku
                var fileUrl = $"/{UploadsFolder}/{fileName}";
                
                _logger.LogInformation($"Plik {fileName} został przesłany przez użytkownika {userId}");

                return Ok(new FileUploadResponse
                {
                    FileName = fileName,
                    FileUrl = fileUrl,
                    FileSize = file.Length,
                    ContentType = file.ContentType
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas uploadu pliku");
                return StatusCode(500, new { message = "Błąd podczas przesyłania pliku", error = ex.Message });
            }
        }

        /// <summary>
        /// Usuwa plik
        /// </summary>
        [HttpDelete("delete/{fileName}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult DeleteFile(string fileName)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });
                }

                // Zabezpieczenie przed path traversal
                if (fileName.Contains("..") || fileName.Contains("/") || fileName.Contains("\\"))
                {
                    return BadRequest(new { message = "Nieprawidłowa nazwa pliku" });
                }

                var uploadsPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, UploadsFolder);
                var filePath = Path.Combine(uploadsPath, fileName);

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = "Plik nie został znaleziony" });
                }

                System.IO.File.Delete(filePath);
                
                _logger.LogInformation($"Plik {fileName} został usunięty przez użytkownika {userId}");

                return Ok(new { message = "Plik został usunięty" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas usuwania pliku");
                return StatusCode(500, new { message = "Błąd podczas usuwania pliku", error = ex.Message });
            }
        }
    }

    /// <summary>
    /// Odpowiedź po uploadzie pliku
    /// </summary>
    public class FileUploadResponse
    {
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string ContentType { get; set; } = string.Empty;
    }
}



