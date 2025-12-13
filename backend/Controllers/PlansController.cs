using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    /// <summary>
    /// Kontroler do zarządzania planami podróży
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PlansController : ControllerBase
    {
        private readonly IPlansService _plansService;

        public PlansController(IPlansService plansService)
        {
            _plansService = plansService;
        }

        /// <summary>
        /// Pobiera wszystkie plany aktualnie zalogowanego użytkownika
        /// </summary>
        [Authorize]
        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<PlansDto>>> GetMyPlans()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });
                }

                var plans = await _plansService.GetUserPlansAsync(userId);
                return Ok(plans);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas pobierania planów", error = ex.Message });
            }
        }

        /// <summary>
        /// Pobiera wszystkie plany użytkownika
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<PlansDto>>> GetUserPlans(Guid userId)
        {
            try
            {
                var plans = await _plansService.GetUserPlansAsync(userId);
                return Ok(plans);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas pobierania planów", error = ex.Message });
            }
        }

        /// <summary>
        /// Pobiera wszystkie publiczne plany
        /// </summary>
        [HttpGet("public")]
        public async Task<ActionResult<List<PlansDto>>> GetPublicPlans()
        {
            try
            {
                var plans = await _plansService.GetPublicPlansAsync();
                return Ok(plans);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas pobierania publicznych planów", error = ex.Message });
            }
        }

        /// <summary>
        /// Pobiera pojedynczy plan po ID
        /// </summary>
        [HttpGet("{planId}")]
        public async Task<ActionResult<PlansDto>> GetPlanById(Guid planId)
        {
            try
            {
                var plan = await _plansService.GetPlanByIdAsync(planId);

                if (plan == null)
                    return NotFound(new { message = "Plan nie został znaleziony" });

                return Ok(plan);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas pobierania planu", error = ex.Message });
            }
        }

        /// <summary>
        /// Tworzy nowy pusty plan dla zalogowanego użytkownika
        /// </summary>
        [Authorize]
        [HttpPost("create-empty")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<PlansDto>> CreateEmptyPlan()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Nieprawidłowy token użytkownika" });
                }

                var plan = await _plansService.CreateEmptyPlanAsync(userId);
                return CreatedAtAction(nameof(GetPlanById), new { planId = plan.PlansId }, plan);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas tworzenia planu", error = ex.Message });
            }
        }

        /// <summary>
        /// Tworzy nowy plan
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<PlansDto>> CreatePlan([FromBody] CreatePlansDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var plan = await _plansService.CreatePlanAsync(dto);
                return CreatedAtAction(nameof(GetPlanById), new { planId = plan.PlansId }, plan);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas tworzenia planu", error = ex.Message });
            }
        }

        /// <summary>
        /// Aktualizuje istniejący plan
        /// </summary>
        [HttpPut("{planId}")]
        public async Task<ActionResult<PlansDto>> UpdatePlan(Guid planId, [FromBody] UpdatePlansDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var plan = await _plansService.UpdatePlanAsync(planId, dto);

                if (plan == null)
                    return NotFound(new { message = "Plan nie został znaleziony" });

                return Ok(plan);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas aktualizacji planu", error = ex.Message });
            }
        }

        /// <summary>
        /// Usuwa plan (soft delete)
        /// </summary>
        [HttpDelete("{planId}")]
        public async Task<ActionResult> DeletePlan(Guid planId)
        {
            try
            {
                var deleted = await _plansService.DeletePlanAsync(planId);

                if (!deleted)
                    return NotFound(new { message = "Plan nie został znaleziony" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas usuwania planu", error = ex.Message });
            }
        }

        /// <summary>
        /// Sprawdza czy użytkownik jest właścicielem planu
        /// </summary>
        [HttpGet("{planId}/owner/{userId}")]
        public async Task<ActionResult<bool>> IsPlanOwner(Guid planId, Guid userId)
        {
            try
            {
                var isOwner = await _plansService.IsPlanOwnerAsync(planId, userId);
                return Ok(new { isOwner });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Błąd podczas sprawdzania właściciela", error = ex.Message });
            }
        }
    }
}

