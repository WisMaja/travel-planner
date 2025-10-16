using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class PlansChecklist
    {
        public Guid ChecklistItemId { get; set; }  
        public Guid PlanId { get; set; }  
        public string? Category { get; set; }  
        public string? Title { get; set; }  
        public bool IsDone { get; set; }  
        public int Position { get; set; }  
        public string? Note  { get; set; }  
        public DateTime CreatedAtUtc { get; set; }  
        public DateTime CompletedAtUtc { get; set; }  
    }
}