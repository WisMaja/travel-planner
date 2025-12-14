using Microsoft.EntityFrameworkCore;
using backend.Connection;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    /// <summary>
    /// Serwis do zarządzania podstawowymi informacjami planu podróży
    /// </summary>
    public class PlansBasicInfoService : IPlansBasicInfoService
    {
        private readonly ApplicationDbContext _dbContext;

        public PlansBasicInfoService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<PlansBasicInfoDto?> GetBasicInfoAsync(Guid planId)
        {
            // Pobierz plan i podstawowe informacje
            var plan = await _dbContext.Plans
                .FirstOrDefaultAsync(p => p.PlansId == planId && p.DeletedAtUtc == null);

            if (plan == null)
                return null;

            var basicInfo = await _dbContext.PlansBasicInfo
                .FirstOrDefaultAsync(b => b.PlanId == planId);

            // Jeśli nie ma PlansBasicInfo, zwróć tylko dane z Plans
            if (basicInfo == null)
            {
                return new PlansBasicInfoDto
                {
                    PlanId = plan.PlansId,
                    Title = plan.Title,
                    CoverImageUrl = plan.CoverImageUrl,
                    Description = null,
                    Location = null,
                    Destination = null,
                    StartDate = null,
                    EndDate = null,
                    TripTypeId = null,
                    CoverImgUrl = null,
                    BudgetAmount = null,
                    BudgetCurrency = null,
                    Notes = null
                };
            }

            return new PlansBasicInfoDto
            {
                PlanId = plan.PlansId,
                Title = plan.Title,
                CoverImageUrl = plan.CoverImageUrl,
                Description = basicInfo.Description,
                Location = basicInfo.Location,
                Destination = basicInfo.Destination,
                StartDate = basicInfo.StartDate,
                EndDate = basicInfo.EndDate,
                TripTypeId = basicInfo.TripTypeId,
                CoverImgUrl = basicInfo.CoverImgUrl,
                BudgetAmount = basicInfo.BudgetAmount,
                BudgetCurrency = basicInfo.BudgetCurrency,
                Notes = basicInfo.Notes
            };
        }

        public async Task<PlansBasicInfoDto?> UpdateBasicInfoAsync(Guid planId, UpdatePlansBasicInfoDto dto)
        {
            var plan = await _dbContext.Plans
                .FirstOrDefaultAsync(p => p.PlansId == planId && p.DeletedAtUtc == null);

            if (plan == null)
                return null;

            // Aktualizuj pola w Plans
            // Aktualizujemy tylko jeśli wartość jest przekazana (nie null)
            if (dto.Title != null)
                plan.Title = dto.Title;

            // Aktualizuj Destination w Plans - zapisz do obu tabel
            if (dto.Destination != null)
                plan.Destination = dto.Destination;

            // Zawsze synchronizuj CoverImageUrl - użyj CoverImageUrl jeśli jest podane, w przeciwnym razie CoverImgUrl
            // Oba pola powinny mieć tę samą wartość
            var coverImageUrl = dto.CoverImageUrl ?? dto.CoverImgUrl;
            plan.CoverImageUrl = coverImageUrl;

            plan.UpdatedAtUtc = DateTime.UtcNow;

            // Pobierz lub utwórz PlansBasicInfo
            var basicInfo = await _dbContext.PlansBasicInfo
                .FirstOrDefaultAsync(b => b.PlanId == planId);

            if (basicInfo == null)
            {
                // Sprawdź czy TripTypeId jest podane i istnieje
                if (dto.TripTypeId.HasValue)
                {
                    var tripTypeExists = await _dbContext.TripType
                        .AnyAsync(t => t.TripTypeId == dto.TripTypeId.Value);

                    if (!tripTypeExists)
                        throw new ArgumentException($"TripType o ID {dto.TripTypeId.Value} nie istnieje");
                }

                // Użyj CoverImageUrl jeśli jest podane, w przeciwnym razie CoverImgUrl
                var coverImgUrl = dto.CoverImageUrl ?? dto.CoverImgUrl;
                
                basicInfo = new PlansBasicInfo
                {
                    PlanId = planId,
                    Description = dto.Description,
                    Location = dto.Location,
                    Destination = dto.Destination,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    TripTypeId = dto.TripTypeId,
                    CoverImgUrl = coverImgUrl,
                    BudgetAmount = dto.BudgetAmount,
                    BudgetCurrency = dto.BudgetCurrency,
                    Notes = dto.Notes
                };
                
                // Również zaktualizuj Plans.CoverImageUrl i Plans.Destination
                if (coverImgUrl != null)
                    plan.CoverImageUrl = coverImgUrl;
                
                if (dto.Destination != null)
                    plan.Destination = dto.Destination;

                _dbContext.PlansBasicInfo.Add(basicInfo);
            }
            else
            {
                // Aktualizuj istniejące PlansBasicInfo
                // Aktualizujemy tylko pola które są przekazane (nie null)
                if (dto.Description != null)
                    basicInfo.Description = dto.Description;

                if (dto.Location != null)
                    basicInfo.Location = dto.Location;

                if (dto.Destination != null)
                {
                    basicInfo.Destination = dto.Destination;
                    // Również zaktualizuj Plans.Destination
                    plan.Destination = dto.Destination;
                }

                if (dto.StartDate.HasValue)
                    basicInfo.StartDate = dto.StartDate.Value;

                if (dto.EndDate.HasValue)
                    basicInfo.EndDate = dto.EndDate.Value;

                // Obsługa TripTypeId - jeśli jest null, ustawiamy na null; jeśli ma wartość, sprawdzamy czy istnieje
                if (dto.TripTypeId.HasValue)
                {
                    // Jeśli jest Guid.Empty, ustawiamy na null (wyczyszczenie wartości)
                    if (dto.TripTypeId.Value == Guid.Empty)
                    {
                        basicInfo.TripTypeId = null;
                    }
                    else
                    {
                        // Sprawdź czy TripType istnieje
                        var tripTypeExists = await _dbContext.TripType
                            .AnyAsync(t => t.TripTypeId == dto.TripTypeId.Value);

                        if (!tripTypeExists)
                            throw new ArgumentException($"TripType o ID {dto.TripTypeId.Value} nie istnieje");

                        basicInfo.TripTypeId = dto.TripTypeId.Value;
                    }
                }
                // Jeśli TripTypeId nie jest wysłane (null), nie aktualizujemy pola

                // Aktualizuj CoverImgUrl - użyj CoverImageUrl jeśli jest podane, w przeciwnym razie CoverImgUrl
                var coverImgUrl = dto.CoverImageUrl ?? dto.CoverImgUrl;
                if (coverImgUrl != null)
                {
                    basicInfo.CoverImgUrl = coverImgUrl;
                }
                else
                {
                    // Jeśli oba są null, wyczyść CoverImgUrl (użytkownik usunął zdjęcie)
                    basicInfo.CoverImgUrl = null;
                }

                if (dto.BudgetAmount.HasValue)
                    basicInfo.BudgetAmount = dto.BudgetAmount.Value;

                if (dto.BudgetCurrency != null)
                    basicInfo.BudgetCurrency = dto.BudgetCurrency;

                if (dto.Notes != null)
                    basicInfo.Notes = dto.Notes;
            }

            await _dbContext.SaveChangesAsync();

            return await GetBasicInfoAsync(planId);
        }
    }
}

