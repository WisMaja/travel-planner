using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class PlansBookings
    {
        public Guid PlansBookingsId { get; set; }  
        public Guid PlansId { get; set; }  
        public Guid KindId { get; set; }  
        public string? Name { get; set; }  
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }  
        public TimeOnly StartTime { get; set; }  
        public TimeOnly EndTime { get; set; }  
        public float Amount { get; set; }  
        public Guid CurrencyId  { get; set; }
        public string? LinkUrl  { get; set; }
        public string? RezervationPdf { get; set; }
    }
}