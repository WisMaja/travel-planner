using backend.DTOs;

namespace backend.Services
{
    /// <summary>
    /// Interfejs serwisu do zarządzania podstawowymi informacjami planu podróży
    /// </summary>
    public interface IPlansBasicInfoService
    {
        /// <summary>
        /// Pobiera podstawowe informacje planu po ID
        /// </summary>
        Task<PlansBasicInfoDto?> GetBasicInfoAsync(Guid planId);

        /// <summary>
        /// Aktualizuje podstawowe informacje planu
        /// </summary>
        Task<PlansBasicInfoDto?> UpdateBasicInfoAsync(Guid planId, UpdatePlansBasicInfoDto dto);
    }
}

