namespace backend.Models
{
    /// <summary>
    /// Model reprezentujący powiązanie miejsca z planem podróży
    /// </summary>
    public class PlansPlaces
    {
        /// <summary>
        /// Identyfikator powiązania (klucz główny)
        /// </summary>
        public Guid PlansPlacesId { get; set; }
        
        /// <summary>
        /// Identyfikator planu (klucz obcy do Plans)
        /// </summary>
        public Guid PlansId { get; set; }
        
        /// <summary>
        /// Identyfikator miejsca (klucz obcy do Places)
        /// </summary>
        public Guid PlacesId { get; set; }
        
        /// <summary>
        /// Nazwa miejsca w kontekście planu
        /// </summary>
        public string? Name { get; set; }
        
        /// <summary>
        /// Rodzaj miejsca (np. "Hotel", "Restaurant", "Attraction")
        /// </summary>
        public string? Kind { get; set; }
        
        /// <summary>
        /// Poziom zagnieżdżenia w hierarchii miejsc
        /// </summary>
        public int Level { get; set; }
        
        /// <summary>
        /// Identyfikator miejsca nadrzędnego (dla hierarchii)
        /// </summary>
        public Guid? ParentId { get; set; }
        
        /// <summary>
        /// Data utworzenia powiązania (UTC)
        /// </summary>
        public DateTime CreatedAtUtc { get; set; }
        
        /// <summary>
        /// Data ostatniej aktualizacji (UTC)
        /// </summary>
        public DateTime UpdatedAtUtc { get; set; }
        
        /// <summary>
        /// Data usunięcia powiązania (UTC) - null jeśli nie usunięty
        /// </summary>
        public DateTime? DeletedAtUtc { get; set; }
    }
}