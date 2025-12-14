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
        public int? TripTypeId { get; set; }
        
        /// <summary>
        /// URL do zdjęcia okładkowego planu
        /// </summary>
        public string? CoverImgUrl { get; set; }
        
        /// <summary>
        /// Budżet planu
        /// </summary>
        public decimal? BudgetAmount { get; set; }
        
        /// <summary>
        /// Dodatkowe notatki
        /// </summary>
        public string? Notes { get; set; }
    }
}