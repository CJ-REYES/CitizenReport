using System.Collections.Generic;
using System.Text.Json.Serialization; // Necesario para evitar ciclos en JSON

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

        // Propiedad de navegación (Un usuario tiene muchos reportes)
        [JsonIgnore] // Evita ciclos infinitos al serializar a JSON
        public ICollection<Reporte>? Reportes { get; set; }
    }
}