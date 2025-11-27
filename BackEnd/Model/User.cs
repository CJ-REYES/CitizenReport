using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace BackEnd.Model
{
    public class User
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Rol { get; set; }
        public string FotoPerfilURL { get; set; }
        public int Puntos { get; set; } = 0;
        public string Rango { get; set; } = "Ciudadano Novato";

        // --- NUEVOS CAMPOS MINIJUEGO ---
        public int Monedas { get; set; } = 0;
        public int Vidas { get; set; } = 5; // Empiezan con 5
        public DateTime? UltimaRecargaVidas { get; set; } // Para controlar la recarga diaria
        // -------------------------------

        [JsonIgnore]
        public ICollection<Reporte>? Reportes { get; set; }
        [JsonIgnore]
        public ICollection<ReporteValidacion>? ValidacionesRealizadas { get; set; }
        
        // Relación con Minijuego
        [JsonIgnore]
        public ICollection<MinigameMatch>? PartidasMinijuego { get; set; }
    }
}