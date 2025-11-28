namespace backend.Models
{
    /// <summary>
    /// Model reprezentujący członków planu podróży
    /// Tabela łącząca Plans i Users (relacja wiele-do-wielu)
    /// </summary>
    public class PlanMembers
    {
        /// <summary>
        /// Identyfikator planu (część klucza złożonego, klucz obcy do Plans)
        /// </summary>
        public Guid PlansId { get; set; }
        
        /// <summary>
        /// Identyfikator użytkownika (część klucza złożonego, klucz obcy do Users)
        /// </summary>
        public Guid UsersId { get; set; }
        
        /// <summary>
        /// Rola użytkownika w planie (np. "Owner", "Editor", "Viewer")
        /// </summary>
        public string? Role { get; set; }
        
        /// <summary>
        /// Data dodania użytkownika do planu (UTC)
        /// </summary>
        public DateTime AddedAtUtc { get; set; }
    }
}