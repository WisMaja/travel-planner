using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    /// <summary>
    /// Kontroler do zarządzania podstawowymi informacjami planu podróży
    /// </summary>
    [ApiController]
    [Route("api/plans/{planId}/basic-info")]
    [Authorize]
    public class PlansBasicInfoController : ControllerBase
    {
        private readonly IPlansBasicInfoService _basicInfoService;
        private readonly IPlansService _plansService;

        public PlansBasicInfoController(
            IPlansBasicInfoService basicInfoService,
            IPlansService plansService)
        {
            _basicInfoService = basicInfoService;
            _plansService = plansService;
        }

        /// <summary>
        /// Pobiera podstawowe informacje planu
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PlansBasicInfoDto>> GetBasicInfo(Guid planId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });
                }

                // Sprawdź czy użytkownik jest właścicielem planu
                var isOwner = await _plansService.IsPlanOwnerAsync(planId, userId);
                if (!isOwner)
                {
                    return StatusCode(403, new { message = "Nie masz uprawnień do tego planu" });
                }

                var basicInfo = await _basicInfoService.GetBasicInfoAsync(planId);
                if (basicInfo == null)
                {
                    return NotFound(new { message = "Plan nie został znaleziony" });
                }

                return Ok(basicInfo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas pobierania podstawowych informacji", error = ex.Message });
            }
        }

        /// <summary>
        /// Aktualizuje podstawowe informacje planu
        /// </summary>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PlansBasicInfoDto>> UpdateBasicInfo(Guid planId, [FromBody] UpdatePlansBasicInfoDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });
                }

                // Sprawdź czy użytkownik jest właścicielem planu
                var isOwner = await _plansService.IsPlanOwnerAsync(planId, userId);
                if (!isOwner)
                {
                    return StatusCode(403, new { message = "Nie masz uprawnień do tego planu" });
                }

                var updatedBasicInfo = await _basicInfoService.UpdateBasicInfoAsync(planId, dto);
                if (updatedBasicInfo == null)
                {
                    return NotFound(new { message = "Plan nie został znaleziony" });
                }

                return Ok(updatedBasicInfo);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas aktualizacji podstawowych informacji", error = ex.Message });
            }
        }
    }
}

