namespace backend.DTOs
{
    /// <summary>
    /// DTO (Data Transfer Object) dla planu podróży - używane do komunikacji z frontendem
    /// </summary>
    public class PlansDto
    {
        public Guid PlansId { get; set; }
        public Guid OwnerId { get; set; }
        public string? Title { get; set; }
        public string? Destination { get; set; }
        public int StatusId { get; set; }
        public string? StatusName { get; set; }
        public bool IsPublic { get; set; }
        public string? CoverImageUrl { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateTime UpdatedAtUtc { get; set; }
        public DateTime? DeletedAtUtc { get; set; }
    }

    /// <summary>
    /// DTO do tworzenia nowego planu
    /// </summary>
    public class CreatePlansDto
    {
        public Guid OwnerId { get; set; }
        public string? Title { get; set; }
        public int StatusId { get; set; }
        public bool IsPublic { get; set; }
    }

    /// <summary>
    /// DTO do aktualizacji planu
    /// </summary>
    public class UpdatePlansDto
    {
        public string? Title { get; set; }
        public int? StatusId { get; set; }
        public bool? IsPublic { get; set; }
        public string? CoverImageUrl { get; set; }
    }
}

