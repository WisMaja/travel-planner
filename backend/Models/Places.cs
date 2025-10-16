using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class Places
    {
        public Guid PlacesId { get; set; }
        public string? Name { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateTime  UpdatedAtUtc { get; set; }
        public DateTime DeletedAtUtc { get; set; }
    }
}