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
        public string Rango { get; set; } = "Ciudadano Novato"; // Nueva propiedad de rango

        // Propiedad de navegación (Un usuario tiene muchos reportes)
        [JsonIgnore]
        public ICollection<Reporte>? Reportes { get; set; }

        // Nueva propiedad de navegación (Un usuario tiene muchas validaciones realizadas)
        [JsonIgnore]
        public ICollection<ReporteValidacion>? ValidacionesRealizadas { get; set; }
    }
}