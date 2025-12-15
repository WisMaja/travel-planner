namespace backend.DTOs
{
    /// <summary>
    /// DTO używane do zwracania miejsc powiązanych z planem (SELECT).
    /// Zawiera pola z tabeli PlansPlaces oraz opcjonalne metadane miejsca (z tabeli Places lub z zewnętrznych źródeł).
    /// </summary>
    public class PlanPlacesDto
    {
        public Guid PlansPlacesId { get; set; }
        public Guid PlansId { get; set; }
        public Guid PlacesId { get; set; }

        /// <summary>
        /// Nazwa miejsca w kontekście planu (może nadpisywać nazwę z tabeli Places)
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// Rodzaj/typ miejsca w kontekście planu (np. "Hotel", "Restaurant", "Attraction")
        /// </summary>
        public string? Kind { get; set; }

        /// <summary>
        /// Poziom zagnieżdżenia w hierarchii miejsc (przydatne do budowy drzewa)
        /// </summary>
        public int Level { get; set; }

        /// <summary>
        /// Id miejsca nadrzędnego (jeśli istnieje)
        /// </summary>
        public Guid? ParentId { get; set; }

        public DateTime CreatedAtUtc { get; set; }
        public DateTime UpdatedAtUtc { get; set; }
        public DateTime? DeletedAtUtc { get; set; }

        /// <summary>
        /// Opcjonalne dodatkowe informacje o miejscu (z tabeli Places lub z zewnętrznego źródła)
        /// Możesz wypełniać tylko potrzebne pola.
        /// </summary>
        public PlaceInfoDto? Place { get; set; }

        /// <summary>
        /// Pomocne pole do zwrócenia hierarchii (dzieci) bezpośrednio w DTO,
        /// jeśli chcesz zbudować drzewo na serwerze i zwrócić je w jednym zapytaniu.
        /// </summary>
        public List<PlanPlacesDto>? Children { get; set; }
    }

    /// <summary>
    /// Lekki DTO z metadanymi miejsca (opcjonalne, wypełniać tylko jeśli dostępne)
    /// </summary>
    public class PlaceInfoDto
    {
        public Guid PlacesId { get; set; }
        public string? Name { get; set; }

        // Pola opcjonalne — uzupełnij jeśli masz dane w DB / z zewnętrznego API
        public string? Address { get; set; }
        public string? ImageUrl { get; set; }
        public double? Lat { get; set; }
        public double? Lng { get; set; }
    }

    /// <summary>
    /// DTO do tworzenia powiązania miejsca z planem
    /// </summary>
    public class CreatePlanPlacesDto
    {
        public Guid PlansId { get; set; }
        public Guid PlacesId { get; set; }
        public string? Name { get; set; }
        public string? Kind { get; set; }
        public int Level { get; set; }
        public Guid? ParentId { get; set; }
    }

    /// <summary>
    /// DTO do aktualizacji powiązania miejsca z planem (pola opcjonalne)
    /// </summary>
    public class UpdatePlanPlacesDto
    {
        public string? Name { get; set; }
        public string? Kind { get; set; }
        public int? Level { get; set; }
        public Guid? ParentId { get; set; }
    }
}
