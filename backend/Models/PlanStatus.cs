namespace backend.Models
{
    /// <summary>
    /// Model reprezentujący status planu podróży
    /// </summary>
    public class PlanStatus
    {
        /// <summary>
        /// Identyfikator statusu (klucz główny)
        /// </summary>
        public int StatusId { get; set; }
        
        /// <summary>
        /// Nazwa statusu (np. "Draft", "Active", "Completed")
        /// </summary>
        public string? Name { get; set; }
    }
}