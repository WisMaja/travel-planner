using Microsoft.EntityFrameworkCore;
using backend.Connection;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    /// <summary>
    /// Serwis do zarządzania planami podróży - zawiera logikę biznesową
    /// </summary>
    public class PlansService : IPlansService
    {
        private readonly ApplicationDbContext _dbContext;

        public PlansService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<PlansDto>> GetUserPlansAsync(Guid userId)
        {
            var plans = await _dbContext.Plans
                .Where(p => p.OwnerId == userId && p.DeletedAtUtc == null)
                .OrderByDescending(p => p.CreatedAtUtc)
                .ToListAsync();

            var statusIds = plans.Select(p => p.StatusId).Distinct().ToList();
            var statuses = await _dbContext.PlanStatus
                .Where(s => statusIds.Contains(s.StatusId))
                .ToDictionaryAsync(s => s.StatusId);

            return plans.Select(p => MapToDto(p, statuses.GetValueOrDefault(p.StatusId))).ToList();
        }

        public async Task<List<PlansDto>> GetPublicPlansAsync()
        {
            var plans = await _dbContext.Plans
                .Where(p => p.IsPublic && p.DeletedAtUtc == null)
                .OrderByDescending(p => p.CreatedAtUtc)
                .ToListAsync();

            var statusIds = plans.Select(p => p.StatusId).Distinct().ToList();
            var statuses = await _dbContext.PlanStatus
                .Where(s => statusIds.Contains(s.StatusId))
                .ToDictionaryAsync(s => s.StatusId);

            return plans.Select(p => MapToDto(p, statuses.GetValueOrDefault(p.StatusId))).ToList();
        }

        public async Task<PlansDto?> GetPlanByIdAsync(Guid planId)
        {
            var plan = await _dbContext.Plans
                .FirstOrDefaultAsync(p => p.PlansId == planId && p.DeletedAtUtc == null);

            if (plan == null)
                return null;

            var status = await _dbContext.PlanStatus
                .FirstOrDefaultAsync(s => s.StatusId == plan.StatusId);

            return MapToDto(plan, status);
        }

        public async Task<PlansDto> CreateEmptyPlanAsync(Guid userId)
        {
            // Sprawdzenie czy użytkownik istnieje
            var userExists = await _dbContext.Users
                .AnyAsync(u => u.UsersId == userId && u.DeletedAtUtc == null);

            if (!userExists)
            {
                throw new ArgumentException($"Użytkownik o ID {userId} nie istnieje");
            }

            // Pobierz pierwszy dostępny status (lub domyślny "Draft")
            var defaultStatus = await _dbContext.PlanStatus
                .FirstOrDefaultAsync(s => s.Name != null && s.Name.ToLower() == "draft");

            // Jeśli nie ma statusu "Draft", weź pierwszy dostępny
            if (defaultStatus == null)
            {
                defaultStatus = await _dbContext.PlanStatus.FirstOrDefaultAsync();
            }

            if (defaultStatus == null)
            {
                throw new ArgumentException("Brak dostępnych statusów planów w bazie danych");
            }

            var plan = new Plans
            {
                PlansId = Guid.NewGuid(),
                OwnerId = userId,
                Title = null, // Pusty plan - tytuł będzie ustawiony później
                StatusId = defaultStatus.StatusId,
                IsPublic = false, // Domyślnie prywatny
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow,
                DeletedAtUtc = null
            };

            _dbContext.Plans.Add(plan);
            await _dbContext.SaveChangesAsync();

            return MapToDto(plan, defaultStatus);
        }

        public async Task<PlansDto> CreatePlanAsync(CreatePlansDto dto)
        {
            // Sprawdzenie czy status istnieje
            var statusExists = await _dbContext.PlanStatus
                .AnyAsync(s => s.StatusId == dto.StatusId);

            if (!statusExists)
            {
                throw new ArgumentException($"Status o ID {dto.StatusId} nie istnieje");
            }

            // Sprawdzenie czy użytkownik istnieje
            var userExists = await _dbContext.Users
                .AnyAsync(u => u.UsersId == dto.OwnerId && u.DeletedAtUtc == null);

            if (!userExists)
            {
                throw new ArgumentException($"Użytkownik o ID {dto.OwnerId} nie istnieje");
            }

            var plan = new Plans
            {
                PlansId = Guid.NewGuid(),
                OwnerId = dto.OwnerId,
                Title = dto.Title,
                StatusId = dto.StatusId,
                IsPublic = dto.IsPublic,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow,
                DeletedAtUtc = null
            };

            _dbContext.Plans.Add(plan);
            await _dbContext.SaveChangesAsync();

            var status = await _dbContext.PlanStatus
                .FirstOrDefaultAsync(s => s.StatusId == plan.StatusId);

            return MapToDto(plan, status);
        }

        public async Task<PlansDto?> UpdatePlanAsync(Guid planId, UpdatePlansDto dto)
        {
            var plan = await _dbContext.Plans
                .FirstOrDefaultAsync(p => p.PlansId == planId && p.DeletedAtUtc == null);

            if (plan == null)
                return null;

            // Aktualizacja tylko podanych pól
            if (dto.Title != null)
                plan.Title = dto.Title;

            if (dto.StatusId.HasValue)
            {
                // Sprawdzenie czy status istnieje
                var statusExists = await _dbContext.PlanStatus
                    .AnyAsync(s => s.StatusId == dto.StatusId.Value);

                if (!statusExists)
                {
                    throw new ArgumentException($"Status o ID {dto.StatusId.Value} nie istnieje");
                }

                plan.StatusId = dto.StatusId.Value;
            }

            if (dto.IsPublic.HasValue)
                plan.IsPublic = dto.IsPublic.Value;

            if (dto.CoverImageUrl != null)
                plan.CoverImageUrl = dto.CoverImageUrl;

            plan.UpdatedAtUtc = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            var status = await _dbContext.PlanStatus
                .FirstOrDefaultAsync(s => s.StatusId == plan.StatusId);

            return MapToDto(plan, status);
        }

        public async Task<bool> DeletePlanAsync(Guid planId)
        {
            var plan = await _dbContext.Plans
                .FirstOrDefaultAsync(p => p.PlansId == planId && p.DeletedAtUtc == null);

            if (plan == null)
                return false;

            // Soft delete
            plan.DeletedAtUtc = DateTime.UtcNow;
            plan.UpdatedAtUtc = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return true;
        }

        public async Task<bool> IsPlanOwnerAsync(Guid planId, Guid userId)
        {
            var plan = await _dbContext.Plans
                .FirstOrDefaultAsync(p => p.PlansId == planId && p.DeletedAtUtc == null);

            return plan != null && plan.OwnerId == userId;
        }

        /// <summary>
        /// Mapuje model bazy danych na DTO
        /// </summary>
        private PlansDto MapToDto(Plans plan, PlanStatus? status = null)
        {
            return new PlansDto
            {
                PlansId = plan.PlansId,
                OwnerId = plan.OwnerId,
                Title = plan.Title,
                StatusId = plan.StatusId,
                StatusName = status?.Name,
                IsPublic = plan.IsPublic,
                CoverImageUrl = plan.CoverImageUrl,
                CreatedAtUtc = plan.CreatedAtUtc,
                UpdatedAtUtc = plan.UpdatedAtUtc,
                DeletedAtUtc = plan.DeletedAtUtc
            };
        }
    }
}

