namespace backend.Models
{
    /// <summary>
    /// Model reprezentujący użytkownika systemu
    /// </summary>
    public class Users
    {
        /// <summary>
        /// Identyfikator użytkownika (klucz główny)
        /// </summary>
        public Guid UsersId { get; set; }
        
        /// <summary>
        /// Czy użytkownik jest gościem
        /// </summary>
        public bool IsGuest { get; set; }
        
        /// <summary>
        /// Identyfikator sesji (dla użytkowników gości)
        /// </summary>
        public string? SessionId { get; set; }
        
        /// <summary>
        /// Adres email użytkownika
        /// </summary>
        public string? Email { get; set; }
        
        /// <summary>
        /// Hash hasła użytkownika
        /// </summary>
        public string? PasswordHash { get; set; }
        
        /// <summary>
        /// Wyświetlana nazwa użytkownika
        /// </summary>
        public string? DisplayName { get; set; }
        
        /// <summary>
        /// URL do awatara użytkownika
        /// </summary>
        public string? AvatarUrl { get; set; }
        
        /// <summary>
        /// Data rejestracji użytkownika (UTC)
        /// </summary>
        public DateTime RegisteredAtUtc { get; set; }
        
        /// <summary>
        /// Data ostatniego logowania (UTC)
        /// </summary>
        public DateTime LastLoginAtUtc { get; set; }
        
        /// <summary>
        /// Data usunięcia konta (UTC) - null jeśli nie usunięty
        /// </summary>
        public DateTime? DeletedAtUtc { get; set; }
    }
}