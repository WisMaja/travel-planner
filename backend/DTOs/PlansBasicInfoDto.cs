namespace backend.DTOs
{
    /// <summary>
    /// DTO dla podstawowych informacji planu podróży
    /// Zawiera pola z Plans (Title, CoverImageUrl) i PlansBasicInfo
    /// </summary>
    public class PlansBasicInfoDto
    {
        public Guid PlanId { get; set; }
        
        // Z tabeli Plans
        public string? Title { get; set; }
        public string? CoverImageUrl { get; set; }
        
        // Z tabeli PlansBasicInfo
        public string? Description { get; set; }
        public string? Location { get; set; }
        public string? Destination { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? TripTypeId { get; set; }
        public string? CoverImgUrl { get; set; } // Z PlansBasicInfo (może być różne od CoverImageUrl w Plans)
        public decimal? BudgetAmount { get; set; }
        public string? BudgetCurrency { get; set; }
        public string? Notes { get; set; }
    }

    /// <summary>
    /// DTO do aktualizacji podstawowych informacji planu
    /// </summary>
    public class UpdatePlansBasicInfoDto
    {
        public string? Title { get; set; }
        public string? CoverImageUrl { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
        public string? Destination { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? TripTypeId { get; set; }
        public string? CoverImgUrl { get; set; }
        public decimal? BudgetAmount { get; set; }
        public string? BudgetCurrency { get; set; }
        public string? Notes { get; set; }
    }
}

