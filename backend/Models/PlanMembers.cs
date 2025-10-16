using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class PlanMembers
    {
        public Guid PlansId { get; set; }
        public Guid UsersId { get; set; }
        public string? Role { get; set; }
        public DateTime AddedAtUtc { get; set; }
    }
}