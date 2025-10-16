using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class Plans
    {
        public Guid PlansId { get; set; }
        public Guid OwnerId { get; set; }
        public string? Title { get; set; }
        public Guid StatusId  { get; set; }
        public bool IsPublic { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateTime UpdatedAtUtc { get; set; }
        public DateTime DeletedAtUtc { get; set; }
    }
}