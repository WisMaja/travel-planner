namespace backend.Models
{
    /// <summary>
    /// Model reprezentujący typ podróży
    /// </summary>
    public class TripType
    {
        /// <summary>
        /// Identyfikator typu podróży (klucz główny)
        /// </summary>
        public Guid TripTypeId { get; set; }
        
        /// <summary>
        /// Nazwa typu podróży (np. "Business", "Vacation", "Adventure")
        /// </summary>
        public string? Name { get; set; }
    }
}