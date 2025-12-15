namespace backend.Models
{
    /// <summary>
    /// Model reprezentujący miejsce/pozycję geograficzną
    /// </summary>
    public class Places
    {
        /// <summary>
        /// Identyfikator miejsca (klucz główny)
        /// </summary>
        public Guid PlacesId { get; set; }
        
        /// <summary>
        /// Nazwa miejsca
        /// </summary>
        public string? Name { get; set; }
        
        /// <summary>
        /// Google Place ID - unikalny identyfikator z Google Places API
        /// </summary>
        public string? GooglePlaceId { get; set; }
        
        /// <summary>
        /// Adres miejsca
        /// </summary>
        public string? Address { get; set; }
        
        /// <summary>
        /// Szerokość geograficzna
        /// </summary>
        public double? Lat { get; set; }
        
        /// <summary>
        /// Długość geograficzna
        /// </summary>
        public double? Lng { get; set; }
        
        /// <summary>
        /// URL zdjęcia miejsca
        /// </summary>
        public string? ImageUrl { get; set; }
        
        /// <summary>
        /// Data utworzenia rekordu (UTC)
        /// </summary>
        public DateTime CreatedAtUtc { get; set; }
        
        /// <summary>
        /// Data ostatniej aktualizacji (UTC)
        /// </summary>
        public DateTime UpdatedAtUtc { get; set; }
        
        /// <summary>
        /// Data usunięcia rekordu (UTC) - null jeśli nie usunięty
        /// </summary>
        public DateTime? DeletedAtUtc { get; set; }
    }
}