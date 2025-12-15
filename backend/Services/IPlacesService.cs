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
    /// Interfejs serwisu do zarządzania miejscami (Places)
    /// </summary>
    public interface IPlacesService
    {
        /// <summary>
        /// Pobiera wszystkie miejsca (nieusunięte)
        /// </summary>
        Task<List<PlaceDto>> GetAllPlacesAsync();

        /// <summary>
        /// Pobiera miejsce po ID
        /// </summary>
        Task<PlaceDto?> GetPlaceByIdAsync(Guid placesId);

        /// <summary>
        /// Pobiera miejsce po GooglePlaceId
        /// </summary>
        Task<PlaceDto?> GetPlaceByGooglePlaceIdAsync(string googlePlaceId);

        /// <summary>
        /// Tworzy nowe miejsce
        /// </summary>
        Task<PlaceDto> CreatePlaceAsync(CreatePlaceDto dto);

        /// <summary>
        /// Aktualizuje istniejące miejsce
        /// </summary>
        Task<PlaceDto?> UpdatePlaceAsync(Guid placesId, UpdatePlaceDto dto);

        /// <summary>
        /// Usuwa (soft-delete) miejsce
        /// </summary>
        Task<bool> DeletePlaceAsync(Guid placesId);
    }

    /// <summary>
    /// Implementacja serwisu zarządzającego Places
    /// </summary>
    public class PlacesService : IPlacesService
    {
        private readonly ApplicationDbContext _dbContext;

        public PlacesService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<PlaceDto>> GetAllPlacesAsync()
        {
            var places = await _dbContext.Places
                .Where(p => p.DeletedAtUtc == null)
                .OrderBy(p => p.Name)
                .ToListAsync();

            return places.Select(MapToDto).ToList();
        }

        public async Task<PlaceDto?> GetPlaceByIdAsync(Guid placesId)
        {
            var place = await _dbContext.Places
                .FirstOrDefaultAsync(p => p.PlacesId == placesId && p.DeletedAtUtc == null);

            return place != null ? MapToDto(place) : null;
        }

        public async Task<PlaceDto?> GetPlaceByGooglePlaceIdAsync(string googlePlaceId)
        {
            var place = await _dbContext.Places
                .FirstOrDefaultAsync(p => p.GooglePlaceId == googlePlaceId && p.DeletedAtUtc == null);

            return place != null ? MapToDto(place) : null;
        }

        public async Task<PlaceDto> CreatePlaceAsync(CreatePlaceDto dto)
        {
            // Walidacja: jeśli podano GooglePlaceId, sprawdź czy już nie istnieje
            if (!string.IsNullOrEmpty(dto.GooglePlaceId))
            {
                var existing = await _dbContext.Places
                    .FirstOrDefaultAsync(p => p.GooglePlaceId == dto.GooglePlaceId && p.DeletedAtUtc == null);

                if (existing != null)
                    throw new ArgumentException($"Miejsce z GooglePlaceId '{dto.GooglePlaceId}' już istnieje");
            }

            var place = new Places
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
            await _dbContext.SaveChangesAsync();

            return MapToDto(place);
        }

        public async Task<PlaceDto?> UpdatePlaceAsync(Guid placesId, UpdatePlaceDto dto)
        {
            var place = await _dbContext.Places
                .FirstOrDefaultAsync(p => p.PlacesId == placesId && p.DeletedAtUtc == null);

            if (place == null)
                return null;

            // Walidacja: jeśli zmieniamy GooglePlaceId, sprawdź czy nowy nie istnieje już
            if (!string.IsNullOrEmpty(dto.GooglePlaceId) && place.GooglePlaceId != dto.GooglePlaceId)
            {
                var existing = await _dbContext.Places
                    .FirstOrDefaultAsync(p => p.GooglePlaceId == dto.GooglePlaceId && p.DeletedAtUtc == null && p.PlacesId != placesId);

                if (existing != null)
                    throw new ArgumentException($"Miejsce z GooglePlaceId '{dto.GooglePlaceId}' już istnieje");
            }

            // Aktualizuj tylko przekazane pola
            if (dto.Name != null)
                place.Name = dto.Name;

            if (dto.GooglePlaceId != null)
                place.GooglePlaceId = dto.GooglePlaceId;

            if (dto.Address != null)
                place.Address = dto.Address;

            if (dto.Lat.HasValue)
                place.Lat = dto.Lat;

            if (dto.Lng.HasValue)
                place.Lng = dto.Lng;

            if (dto.ImageUrl != null)
                place.ImageUrl = dto.ImageUrl;

            place.UpdatedAtUtc = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return MapToDto(place);
        }

        public async Task<bool> DeletePlaceAsync(Guid placesId)
        {
            var place = await _dbContext.Places
                .FirstOrDefaultAsync(p => p.PlacesId == placesId && p.DeletedAtUtc == null);

            if (place == null)
                return false;

            // Soft delete
            place.DeletedAtUtc = DateTime.UtcNow;
            place.UpdatedAtUtc = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return true;
        }

        private PlaceDto MapToDto(Places place)
        {
            return new PlaceDto
            {
                PlacesId = place.PlacesId,
                Name = place.Name,
                GooglePlaceId = place.GooglePlaceId,
                Address = place.Address,
                Lat = place.Lat,
                Lng = place.Lng,
                ImageUrl = place.ImageUrl,
                CreatedAtUtc = place.CreatedAtUtc,
                UpdatedAtUtc = place.UpdatedAtUtc,
                DeletedAtUtc = place.DeletedAtUtc
            };
        }
    }
}
