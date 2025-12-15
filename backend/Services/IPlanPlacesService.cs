using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Connection;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    /// <summary>
    /// Interfejs serwisu do zarządzania miejscami powiązanymi z planem
    /// </summary>
    public interface IPlanPlacesService
    {
        /// <summary>
        /// Pobiera wszystkie miejsca powiązane z planem (nieusunięte).
        /// </summary>
        Task<List<PlanPlacesDto>> GetPlanPlacesAsync(Guid planId);

        /// <summary>
        /// Pobiera pojedyncze powiązanie miejsca z planem po ID.
        /// </summary>
        Task<PlanPlacesDto?> GetPlanPlaceByIdAsync(Guid plansPlacesId);

        /// <summary>
        /// Tworzy nowe powiązanie miejsca z planem.
        /// </summary>
        Task<PlanPlacesDto> CreatePlanPlaceAsync(CreatePlanPlacesDto dto);

        /// <summary>
        /// Aktualizuje istniejące powiązanie miejsca z planem.
        /// </summary>
        Task<PlanPlacesDto?> UpdatePlanPlaceAsync(Guid plansPlacesId, UpdatePlanPlacesDto dto);

        /// <summary>
        /// Usuwa (soft-delete) powiązanie miejsca z planem.
        /// </summary>
        Task<bool> DeletePlanPlaceAsync(Guid plansPlacesId);
    }

    /// <summary>
    /// Implementacja serwisu zarządzającego PlansPlaces.
    /// Styl i podejście zgodne z PlansBasicInfoService (walidacje, mapowanie, SaveChanges).
    /// </summary>
    public class PlanPlacesService : IPlanPlacesService
    {
        private readonly ApplicationDbContext _dbContext;

        public PlanPlacesService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<PlanPlacesDto>> GetPlanPlacesAsync(Guid planId)
        {
            var planExists = await _dbContext.Plans
                .AnyAsync(p => p.PlansId == planId && p.DeletedAtUtc == null);

            if (!planExists)
                return new List<PlanPlacesDto>();

            var planPlaces = await _dbContext.PlansPlaces
                .Where(pp => pp.PlansId == planId && pp.DeletedAtUtc == null)
                .OrderBy(pp => pp.Level)
                .ThenBy(pp => pp.CreatedAtUtc)
                .ToListAsync();

            if (!planPlaces.Any())
                return new List<PlanPlacesDto>();

            var placeIds = planPlaces.Select(pp => pp.PlacesId).Distinct().ToList();
            var placesDict = await _dbContext.Places
                .Where(p => placeIds.Contains(p.PlacesId) && p.DeletedAtUtc == null)
                .ToDictionaryAsync(p => p.PlacesId);

            return planPlaces.Select(pp => MapToDto(pp, placesDict.GetValueOrDefault(pp.PlacesId))).ToList();
        }

        public async Task<PlanPlacesDto?> GetPlanPlaceByIdAsync(Guid plansPlacesId)
        {
            var pp = await _dbContext.PlansPlaces
                .FirstOrDefaultAsync(x => x.PlansPlacesId == plansPlacesId && x.DeletedAtUtc == null);

            if (pp == null)
                return null;

            var place = await _dbContext.Places
                .FirstOrDefaultAsync(p => p.PlacesId == pp.PlacesId && p.DeletedAtUtc == null);

            return MapToDto(pp, place);
        }

        public async Task<PlanPlacesDto> CreatePlanPlaceAsync(CreatePlanPlacesDto dto)
        {
            // Walidacje: czy plan istnieje
            var plan = await _dbContext.Plans
                .FirstOrDefaultAsync(p => p.PlansId == dto.PlansId && p.DeletedAtUtc == null);

            if (plan == null)
                throw new ArgumentException($"Plan o ID {dto.PlansId} nie istnieje");

            // Walidacja: czy miejsce istnieje
            var place = await _dbContext.Places
                .FirstOrDefaultAsync(p => p.PlacesId == dto.PlacesId && p.DeletedAtUtc == null);

            if (place == null)
                throw new ArgumentException($"Miejsce o ID {dto.PlacesId} nie istnieje");

            // Walidacja: jeśli podano ParentId - upewnij się, że parent istnieje i należy do tego samego planu
            if (dto.ParentId.HasValue)
            {
                var parent = await _dbContext.PlansPlaces
                    .FirstOrDefaultAsync(pp => pp.PlansPlacesId == dto.ParentId.Value && pp.DeletedAtUtc == null);

                if (parent == null)
                    throw new ArgumentException($"Parent o ID {dto.ParentId.Value} nie istnieje");

                if (parent.PlansId != dto.PlansId)
                    throw new ArgumentException("Parent musi należeć do tego samego planu");
            }

            var ppEntity = new PlansPlaces
            {
                PlansPlacesId = Guid.NewGuid(),
                PlansId = dto.PlansId,
                PlacesId = dto.PlacesId,
                Name = dto.Name,
                Kind = dto.Kind,
                Level = dto.Level,
                ParentId = dto.ParentId,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow,
                DeletedAtUtc = null
            };

            _dbContext.PlansPlaces.Add(ppEntity);
            await _dbContext.SaveChangesAsync();

            var placeAfter = await _dbContext.Places
                .FirstOrDefaultAsync(p => p.PlacesId == ppEntity.PlacesId && p.DeletedAtUtc == null);

            return MapToDto(ppEntity, placeAfter);
        }

        public async Task<PlanPlacesDto?> UpdatePlanPlaceAsync(Guid plansPlacesId, UpdatePlanPlacesDto dto)
        {
            var pp = await _dbContext.PlansPlaces
                .FirstOrDefaultAsync(x => x.PlansPlacesId == plansPlacesId && x.DeletedAtUtc == null);

            if (pp == null)
                return null;

            // Aktualizuj tylko przekazane pola (konwencja podobna do PlansBasicInfoService)
            if (dto.Name != null)
                pp.Name = dto.Name;

            if (dto.Kind != null)
                pp.Kind = dto.Kind;

            if (dto.Level.HasValue)
                pp.Level = dto.Level.Value;

            // ParentId: traktujemy null jako "nie aktualizuj", Guid.Empty jako jawne wyczyszczenie,
            // a inny Guid jako przypisanie do wskazanego parenta.
            if (dto.ParentId != null)
            {
                if (dto.ParentId == Guid.Empty)
                {
                    // jawne wyczyszczenie parenta
                    pp.ParentId = null;
                }
                else
                {
                    var parent = await _dbContext.PlansPlaces
                        .FirstOrDefaultAsync(ppp => ppp.PlansPlacesId == dto.ParentId.Value && ppp.DeletedAtUtc == null);

                    if (parent == null)
                        throw new ArgumentException($"Parent o ID {dto.ParentId.Value} nie istnieje");

                    if (parent.PlansId != pp.PlansId)
                        throw new ArgumentException("Parent musi należeć do tego samego planu");

                    if (parent.PlansPlacesId == pp.PlansPlacesId)
                        throw new ArgumentException("Parent nie może być tym samym rekordem");

                    pp.ParentId = dto.ParentId;
                }
            }

            pp.UpdatedAtUtc = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            var place = await _dbContext.Places
                .FirstOrDefaultAsync(p => p.PlacesId == pp.PlacesId && p.DeletedAtUtc == null);

            return MapToDto(pp, place);
        }

        public async Task<bool> DeletePlanPlaceAsync(Guid plansPlacesId)
        {
            var pp = await _dbContext.PlansPlaces
                .FirstOrDefaultAsync(x => x.PlansPlacesId == plansPlacesId && x.DeletedAtUtc == null);

            if (pp == null)
                return false;

            // Soft delete
            pp.DeletedAtUtc = DateTime.UtcNow;
            pp.UpdatedAtUtc = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return true;
        }

        #region Helpers

        /// <summary>
        /// Mapowanie modelu PlansPlaces (i opcjonalnie Places) na PlanPlacesDto.
        /// </summary>
        private PlanPlacesDto MapToDto(PlansPlaces pp, Places? place = null)
        {
            var dto = new PlanPlacesDto
            {
                PlansPlacesId = pp.PlansPlacesId,
                PlansId = pp.PlansId,
                PlacesId = pp.PlacesId,
                Name = pp.Name,
                Kind = pp.Kind,
                Level = pp.Level,
                ParentId = pp.ParentId,
                CreatedAtUtc = pp.CreatedAtUtc,
                UpdatedAtUtc = pp.UpdatedAtUtc,
                DeletedAtUtc = pp.DeletedAtUtc,
                Children = null
            };

            if (place != null)
            {
                dto.Place = new PlaceInfoDto
                {
                    PlacesId = place.PlacesId,
                    Name = place.Name
                    // rozbuduj, jeśli masz dodatkowe pola w Places / DTO
                };
            }

            return dto;
        }

        #endregion
    }
}
