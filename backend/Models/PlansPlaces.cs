using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class PlansPlaces
    {
        public Guid PlansPlacesId { get; set; }  
        public Guid PlansId { get; set; }  
        public Guid PlacesId { get; set; }  
        public string? Name { get; set; }  
        public string? Kind { get; set; }  
        public int Level { get; set; }  
        public Guid ParentId { get; set; }  
        public DateTime CreatedAtUtc { get; set; }  
        public DateTime UpdatedAtUtc { get; set; }  
        public DateTime DeletedAtUtc { get; set; }  
    }
}