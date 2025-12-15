using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    /// <summary>
    /// Kontroler do zarządzania miejscami (Places) - CRUD operacje
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PlacesController : ControllerBase
    {
        private readonly IPlacesService _placesService;

        public PlacesController(IPlacesService placesService)
        {
            _placesService = placesService;
        }

        /// <summary>
        /// Pobiera wszystkie miejsca (nieusunięte)
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<PlaceDto>>> GetAllPlaces()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });

                var places = await _placesService.GetAllPlacesAsync();
                return Ok(places);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas pobierania miejsc", error = ex.Message });
            }
        }

        /// <summary>
        /// Pobiera miejsce po ID
        /// </summary>
        [HttpGet("{placesId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PlaceDto>> GetPlaceById(Guid placesId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });

                var place = await _placesService.GetPlaceByIdAsync(placesId);
                if (place == null)
                    return NotFound(new { message = "Miejsce nie zostało znalezione" });

                return Ok(place);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas pobierania miejsca", error = ex.Message });
            }
        }

        /// <summary>
        /// Pobiera miejsce po GooglePlaceId
        /// </summary>
        [HttpGet("google/{googlePlaceId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PlaceDto>> GetPlaceByGooglePlaceId(string googlePlaceId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });

                var place = await _placesService.GetPlaceByGooglePlaceIdAsync(googlePlaceId);
                if (place == null)
                    return NotFound(new { message = "Miejsce nie zostało znalezione" });

                return Ok(place);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas pobierania miejsca", error = ex.Message });
            }
        }

        /// <summary>
        /// Tworzy nowe miejsce
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<PlaceDto>> CreatePlace([FromBody] CreatePlaceDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });

                var created = await _placesService.CreatePlaceAsync(dto);

                return CreatedAtAction(nameof(GetPlaceById),
                    new { placesId = created.PlacesId },
                    created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas tworzenia miejsca", error = ex.Message });
            }
        }

        /// <summary>
        /// Aktualizuje istniejące miejsce
        /// </summary>
        [HttpPut("{placesId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PlaceDto>> UpdatePlace(Guid placesId, [FromBody] UpdatePlaceDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });

                var updated = await _placesService.UpdatePlaceAsync(placesId, dto);
                if (updated == null)
                    return NotFound(new { message = "Miejsce nie zostało znalezione" });

                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas aktualizacji miejsca", error = ex.Message });
            }
        }

        /// <summary>
        /// Usuwa (soft-delete) miejsce
        /// </summary>
        [HttpDelete("{placesId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletePlace(Guid placesId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });

                var deleted = await _placesService.DeletePlaceAsync(placesId);
                if (!deleted)
                    return NotFound(new { message = "Miejsce nie zostało znalezione" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas usuwania miejsca", error = ex.Message });
            }
        }
    }
}
