namespace backend.Models
{
    /// <summary>
    /// Model reprezentujący podstawowe informacje o planie podróży
    /// Relacja 1:1 z Plans
    /// </summary>
    public class PlansBasicInfo
    {
        /// <summary>
        /// Identyfikator planu (klucz główny i obcy do Plans)
        /// </summary>
        public Guid PlanId { get; set; }
        
        /// <summary>
        /// Opis planu
        /// </summary>
        public string? Description { get; set; }
        
        /// <summary>
        /// Lokalizacja startowa (np. "Warszawa, Polska")
        /// </summary>
        public string? Location { get; set; }
        
        /// <summary>
        /// Cel podróży (np. "Paryż, Francja")
        /// </summary>
        public string? Destination { get; set; }
        
        /// <summary>
        /// Data rozpoczęcia podróży
        /// </summary>
        public DateTime? StartDate { get; set; }
        
        /// <summary>
        /// Data zakończenia podróży
        /// </summary>
        public DateTime? EndDate { get; set; }
        
        /// <summary>
        /// Identyfikator typu podróży (klucz obcy do TripType)
        /// </summary>
        public Guid? TripTypeId { get; set; }
        
        /// <summary>
        /// URL do zdjęcia okładkowego planu
        /// </summary>
        public string? CoverImgUrl { get; set; }
        
        /// <summary>
        /// Budżet planu
        /// </summary>
        public decimal? BudgetAmount { get; set; }
        
        /// <summary>
        /// Waluta budżetu (np. "PLN", "EUR", "USD")
        /// </summary>
        public string? BudgetCurrency { get; set; }
        
        /// <summary>
        /// Dodatkowe notatki
        /// </summary>
        public string? Notes { get; set; }
    }
}