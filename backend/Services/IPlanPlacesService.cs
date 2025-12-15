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

            Guid placesId;
            Places? place;

            // Jeśli PlacesId jest podane, użyj istniejącego miejsca
            if (dto.PlacesId.HasValue)
            {
                place = await _dbContext.Places
                    .FirstOrDefaultAsync(p => p.PlacesId == dto.PlacesId.Value && p.DeletedAtUtc == null);

                if (place == null)
                    throw new ArgumentException($"Miejsce o ID {dto.PlacesId.Value} nie istnieje");

                // Sprawdź czy to miejsce już nie jest dodane do tego planu
                var existingPlanPlace = await _dbContext.PlansPlaces
                    .FirstOrDefaultAsync(pp => 
                        pp.PlansId == dto.PlansId && 
                        pp.PlacesId == dto.PlacesId.Value &&
                        pp.DeletedAtUtc == null);

                if (existingPlanPlace != null)
                {
                    throw new ArgumentException($"To miejsce jest już dodane do tego planu");
                }

                placesId = dto.PlacesId.Value;
            }
            // Jeśli PlacesId nie jest podane, ale GooglePlaceId jest podane, znajdź lub utwórz miejsce w tabeli Places
            else if (!string.IsNullOrEmpty(dto.GooglePlaceId))
            {
                if (string.IsNullOrEmpty(dto.Name))
                    throw new ArgumentException("Nazwa miejsca jest wymagana przy tworzeniu nowego miejsca");

                // KROK 1: Sprawdź czy miejsce z tym GooglePlaceId już istnieje w tabeli Places
                // (to zapobiega duplikatom miejsc - jedno miejsce może być w wielu planach)
                place = await _dbContext.Places
                    .FirstOrDefaultAsync(p => 
                        p.GooglePlaceId == dto.GooglePlaceId && 
                        p.DeletedAtUtc == null);

                if (place != null)
                {
                    // Miejsce już istnieje w Places - użyj istniejącego PlacesId
                    placesId = place.PlacesId;
                    
                    // Opcjonalnie: zaktualizuj dane jeśli są nowsze (np. zdjęcie, adres)
                    bool needsUpdate = false;
                    if (!string.IsNullOrEmpty(dto.Address) && place.Address != dto.Address)
                    {
                        place.Address = dto.Address;
                        needsUpdate = true;
                    }
                    if (dto.Lat.HasValue && place.Lat != dto.Lat)
                    {
                        place.Lat = dto.Lat;
                        needsUpdate = true;
                    }
                    if (dto.Lng.HasValue && place.Lng != dto.Lng)
                    {
                        place.Lng = dto.Lng;
                        needsUpdate = true;
                    }
                    if (!string.IsNullOrEmpty(dto.Name) && place.Name != dto.Name)
                    {
                        place.Name = dto.Name;
                        needsUpdate = true;
                    }
                    if (!string.IsNullOrEmpty(dto.ImageUrl) && place.ImageUrl != dto.ImageUrl)
                    {
                        place.ImageUrl = dto.ImageUrl;
                        needsUpdate = true;
                    }
                    
                    if (needsUpdate)
                    {
                        place.UpdatedAtUtc = DateTime.UtcNow;
                        await _dbContext.SaveChangesAsync();
                    }
                }
                else
                {
                    // KROK 2: Miejsce nie istnieje w Places - utwórz nowe z pełnymi danymi z Google Places API
                    // (zapisujemy szczegóły miejsca: lat, lng, nazwa, imageUrl, adres, GooglePlaceId)
                    place = new Places
                    {
                        PlacesId = Guid.NewGuid(),
                        Name = dto.Name,
                        GooglePlaceId = dto.GooglePlaceId,
                        Address = dto.Address,
                        Lat = dto.Lat,
                        Lng = dto.Lng,
                        ImageUrl = dto.ImageUrl,
                        CreatedAtUtc = DateTime.UtcNow,
                        UpdatedAtUtc = DateTime.UtcNow,
                        DeletedAtUtc = null
                    };

                    _dbContext.Places.Add(place);
                    await _dbContext.SaveChangesAsync(); // Zapisz miejsce w Places przed utworzeniem powiązania

                    placesId = place.PlacesId;
                }

                // KROK 3: Sprawdź czy to miejsce już nie jest dodane do tego konkretnego planu
                // (jeden plan nie może mieć tego samego miejsca dwa razy)
                var existingPlanPlace = await _dbContext.PlansPlaces
                    .FirstOrDefaultAsync(pp => 
                        pp.PlansId == dto.PlansId && 
                        pp.PlacesId == placesId &&
                        pp.DeletedAtUtc == null);

                if (existingPlanPlace != null)
                {
                    throw new ArgumentException($"Miejsce \"{dto.Name}\" jest już dodane do tego planu");
                }
            }
            else
            {
                throw new ArgumentException("Musi być podane PlacesId lub GooglePlaceId z Name");
            }

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

            // KROK 4: Utwórz powiązanie miejsca z planem w tabeli PlansPlaces
            // (tutaj przechowujemy: nazwa w kontekście planu, id planu, id miejsca, rodzaj miejsca)
            var ppEntity = new PlansPlaces
            {
                PlansPlacesId = Guid.NewGuid(),
                PlansId = dto.PlansId,           // ID planu, do którego dodajemy miejsce
                PlacesId = placesId,             // ID miejsca z tabeli Places (już istniejącego lub nowo utworzonego)
                Name = dto.Name,                 // Nazwa miejsca w kontekście tego planu
                Kind = dto.Kind,                 // Rodzaj miejsca (np. "Hotel", "Restaurant", "Attraction")
                Level = dto.Level,               // Poziom zagnieżdżenia w hierarchii
                ParentId = dto.ParentId,         // ID miejsca nadrzędnego (dla hierarchii)
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
                    Name = place.Name,
                    GooglePlaceId = place.GooglePlaceId,
                    Address = place.Address,
                    Lat = place.Lat,
                    Lng = place.Lng,
                    ImageUrl = place.ImageUrl
                };
            }

            return dto;
        }

        #endregion
    }
}
