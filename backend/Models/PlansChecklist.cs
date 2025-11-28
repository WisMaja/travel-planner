namespace backend.Models
{
    /// <summary>
    /// Model reprezentujący elementy checklisty planu podróży
    /// </summary>
    public class PlansChecklist
    {
        /// <summary>
        /// Identyfikator elementu checklisty (klucz główny)
        /// </summary>
        public Guid ChecklistItemId { get; set; }
        
        /// <summary>
        /// Identyfikator planu (klucz obcy do Plans)
        /// </summary>
        public Guid PlanId { get; set; }
        
        /// <summary>
        /// Kategoria elementu checklisty
        /// </summary>
        public string? Category { get; set; }
        
        /// <summary>
        /// Tytuł elementu checklisty
        /// </summary>
        public string? Title { get; set; }
        
        /// <summary>
        /// Czy element jest wykonany
        /// </summary>
        public bool IsDone { get; set; }
        
        /// <summary>
        /// Pozycja elementu na liście
        /// </summary>
        public int Position { get; set; }
        
        /// <summary>
        /// Notatka do elementu
        /// </summary>
        public string? Note { get; set; }
        
        /// <summary>
        /// Data utworzenia elementu (UTC)
        /// </summary>
        public DateTime CreatedAtUtc { get; set; }
        
        /// <summary>
        /// Data ukończenia elementu (UTC) - null jeśli nie ukończony
        /// </summary>
        public DateTime? CompletedAtUtc { get; set; }
    }
}