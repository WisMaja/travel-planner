using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class Users
    {
        public Guid UsersId { get; set; }
        public bool IsGuest { get; set; }                              
        public string? SessionId { get; set; }  
        public string? Email { get; set; }                               
        private string? PasswordHash { get; set; }                                   
        public string? DisplayName  { get; set; }  
        public string? AvatarUrl  { get; set; }  
        public DateTime RegisteredAtUtc { get; set; }  
        public DateTime LastLoginAtUtc { get; set; }  
        public DateTime DeletedAtUtc { get; set; }  
    }
}