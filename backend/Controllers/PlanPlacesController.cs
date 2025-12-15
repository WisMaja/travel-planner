using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    /// <summary>
    /// Kontroler do zarządzania miejscami powiązanymi z planem (dodawanie / edycja / usuwanie / pobieranie)
    /// </summary>
    [ApiController]
    [Route("api/plans/{planId:guid}/places")]
    [Authorize]
    public class PlanPlacesController : ControllerBase
    {
        private readonly IPlanPlacesService _planPlacesService;
        private readonly IPlansService _plansService;

        public PlanPlacesController(
            IPlanPlacesService planPlacesService,
            IPlansService plansService)
        {
            _planPlacesService = planPlacesService;
            _plansService = plansService;
        }

        /// <summary>
        /// Pobiera wszystkie miejsca powiązane z planem
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<List<PlanPlacesDto>>> GetPlaces(Guid planId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });

                var isOwner = await _plansService.IsPlanOwnerAsync(planId, userId);
                if (!isOwner)
                    return StatusCode(403, new { message = "Nie masz uprawnień do tego planu" });

                var places = await _planPlacesService.GetPlanPlacesAsync(planId);
                return Ok(places);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas pobierania miejsc", error = ex.Message });
            }
        }

        /// <summary>
        /// Pobiera jedno powiązanie miejsca z planem po ID (PlansPlacesId)
        /// </summary>
        [HttpGet("{plansPlacesId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PlanPlacesDto>> GetPlace(Guid planId, Guid plansPlacesId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });

                var isOwner = await _plansService.IsPlanOwnerAsync(planId, userId);
                if (!isOwner)
                    return StatusCode(403, new { message = "Nie masz uprawnień do tego planu" });

                var place = await _planPlacesService.GetPlanPlaceByIdAsync(plansPlacesId);
                if (place == null)
                    return NotFound(new { message = "Miejsce w planie nie zostało znalezione" });

                return Ok(place);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas pobierania miejsca", error = ex.Message });
            }
        }

        /// <summary>
        /// Tworzy nowe powiązanie miejsca z planem
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<PlanPlacesDto>> CreatePlace(Guid planId, [FromBody] CreatePlanPlacesDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });

                var isOwner = await _plansService.IsPlanOwnerAsync(planId, userId);
                if (!isOwner)
                    return StatusCode(403, new { message = "Nie masz uprawnień do tego planu" });

                // Upewnij się, że dto.PlansId odpowiada planId z trasy (bezpieczeństwo)
                dto.PlansId = planId;

                var created = await _planPlacesService.CreatePlanPlaceAsync(dto);

                return CreatedAtAction(nameof(GetPlace),
                    new { planId = planId, plansPlacesId = created.PlansPlacesId },
                    created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas tworzenia miejsca w planie", error = ex.Message });
            }
        }

        /// <summary>
        /// Aktualizuje istniejące powiązanie miejsca z planem
        /// </summary>
        [HttpPut("{plansPlacesId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PlanPlacesDto>> UpdatePlace(Guid planId, Guid plansPlacesId, [FromBody] UpdatePlanPlacesDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });

                var isOwner = await _plansService.IsPlanOwnerAsync(planId, userId);
                if (!isOwner)
                    return StatusCode(403, new { message = "Nie masz uprawnień do tego planu" });

                var updated = await _planPlacesService.UpdatePlanPlaceAsync(plansPlacesId, dto);
                if (updated == null)
                    return NotFound(new { message = "Miejsce w planie nie zostało znalezione" });

                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas aktualizacji miejsca w planie", error = ex.Message });
            }
        }

        /// <summary>
        /// Usuwa (soft-delete) powiązanie miejsca z planem
        /// </summary>
        [HttpDelete("{plansPlacesId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletePlace(Guid planId, Guid plansPlacesId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });

                var isOwner = await _plansService.IsPlanOwnerAsync(planId, userId);
                if (!isOwner)
                    return StatusCode(403, new { message = "Nie masz uprawnień do tego planu" });

                var deleted = await _planPlacesService.DeletePlanPlaceAsync(plansPlacesId);
                if (!deleted)
                    return NotFound(new { message = "Miejsce w planie nie zostało znalezione" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas usuwania miejsca z planu", error = ex.Message });
            }
        }
    }
}
