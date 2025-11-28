namespace backend.Models
{
    /// <summary>
    /// Model reprezentujący plan podróży
    /// </summary>
    public class Plans
    {
        /// <summary>
        /// Identyfikator planu (klucz główny)
        /// </summary>
        public Guid PlansId { get; set; }
        
        /// <summary>
        /// Identyfikator właściciela planu (klucz obcy do Users)
        /// </summary>
        public Guid OwnerId { get; set; }
        
        /// <summary>
        /// Tytuł planu
        /// </summary>
        public string? Title { get; set; }
        
        /// <summary>
        /// Identyfikator statusu planu (klucz obcy do PlanStatus)
        /// </summary>
        public Guid StatusId { get; set; }
        
        /// <summary>
        /// Czy plan jest publiczny
        /// </summary>
        public bool IsPublic { get; set; }
        
        /// <summary>
        /// Data utworzenia planu (UTC)
        /// </summary>
        public DateTime CreatedAtUtc { get; set; }
        
        /// <summary>
        /// Data ostatniej aktualizacji planu (UTC)
        /// </summary>
        public DateTime UpdatedAtUtc { get; set; }
        
        /// <summary>
        /// Data usunięcia planu (UTC) - null jeśli nie usunięty
        /// </summary>
        public DateTime? DeletedAtUtc { get; set; }
        
        /// <summary>
        /// Wersja wiersza dla optymistycznej kontroli współbieżności
        /// </summary>
        public byte[]? RowVer { get; set; }
    }
}