using backend.DTOs;

namespace backend.Services
{
    /// <summary>
    /// Interfejs serwisu do zarządzania planami podróży
    /// </summary>
    public interface IPlansService
    {
        /// <summary>
        /// Pobiera wszystkie plany użytkownika (nieusunięte)
        /// </summary>
        Task<List<PlansDto>> GetUserPlansAsync(Guid userId);

        /// <summary>
        /// Pobiera wszystkie publiczne plany
        /// </summary>
        Task<List<PlansDto>> GetPublicPlansAsync();

        /// <summary>
        /// Pobiera pojedynczy plan po ID
        /// </summary>
        Task<PlansDto?> GetPlanByIdAsync(Guid planId);

        /// <summary>
        /// Tworzy nowy plan
        /// </summary>
        Task<PlansDto> CreatePlanAsync(CreatePlansDto dto);

        /// <summary>
        /// Tworzy nowy pusty plan dla użytkownika (tylko wymagane pola)
        /// </summary>
        Task<PlansDto> CreateEmptyPlanAsync(Guid userId);

        /// <summary>
        /// Aktualizuje istniejący plan
        /// </summary>
        Task<PlansDto?> UpdatePlanAsync(Guid planId, UpdatePlansDto dto);

        /// <summary>
        /// Usuwa plan (soft delete)
        /// </summary>
        Task<bool> DeletePlanAsync(Guid planId);

        /// <summary>
        /// Sprawdza czy użytkownik jest właścicielem planu
        /// </summary>
        Task<bool> IsPlanOwnerAsync(Guid planId, Guid userId);
    }
}

