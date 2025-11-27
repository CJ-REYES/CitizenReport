using System;
using System.Text.Json.Serialization;

namespace BackEnd.Model
{
    public class MinigameMatch
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int Score { get; set; }
        public DateTime PlayedAt { get; set; } = DateTime.UtcNow;

        // Relación con Usuario
        [JsonIgnore]
        public User User { get; set; }
    }
}