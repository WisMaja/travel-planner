namespace backend.Models
{
    /// <summary>
    /// Model reprezentujący rezerwacje/bilety w planie podróży
    /// </summary>
    public class PlansBookings
    {
        /// <summary>
        /// Identyfikator rezerwacji (klucz główny)
        /// </summary>
        public Guid PlansBookingsId { get; set; }
        
        /// <summary>
        /// Identyfikator planu (klucz obcy do Plans)
        /// </summary>
        public Guid PlansId { get; set; }
        
        /// <summary>
        /// Identyfikator rodzaju rezerwacji
        /// </summary>
        public Guid KindId { get; set; }
        
        /// <summary>
        /// Nazwa rezerwacji
        /// </summary>
        public string? Name { get; set; }
        
        /// <summary>
        /// Data rozpoczęcia rezerwacji
        /// </summary>
        public DateTime StartDate { get; set; }
        
        /// <summary>
        /// Data zakończenia rezerwacji
        /// </summary>
        public DateTime EndDate { get; set; }
        
        /// <summary>
        /// Godzina rozpoczęcia rezerwacji
        /// </summary>
        public TimeSpan? StartTime { get; set; }
        
        /// <summary>
        /// Godzina zakończenia rezerwacji
        /// </summary>
        public TimeSpan? EndTime { get; set; }
        
        /// <summary>
        /// Kwota rezerwacji
        /// </summary>
        public float Amount { get; set; }
        
        /// <summary>
        /// Identyfikator waluty
        /// </summary>
        public Guid CurrencyId { get; set; }
        
        /// <summary>
        /// URL do linku rezerwacji
        /// </summary>
        public string? LinkUrl { get; set; }
        
        /// <summary>
        /// Ścieżka do PDF z rezerwacją
        /// </summary>
        public string? RezervationPdf { get; set; }
    }
}