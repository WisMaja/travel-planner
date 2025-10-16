using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class PlansBasicInfo
    {
        public Guid PlanId { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Guid TripTypeId { get; set; }
        public string? CoverImgUrl { get; set; }
        public decimal BudgetAmount;
        public string? Notes { get; set; }
    }
}