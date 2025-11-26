namespace BackEnd.DTOs
{
   public class UserResponseDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Email { get; set; }
        public string Rol { get; set; }
        public string FotoPerfilURL { get; set; }
        public int Puntos { get; set; }
        public string Rango { get; set; }
        public string RankColor { get; set; }
        public string RankIcon { get; set; }
    }
}