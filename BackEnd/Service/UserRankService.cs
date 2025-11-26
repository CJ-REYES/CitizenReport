using BackEnd.Data;
using BackEnd.Model;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Services
{
    public interface IUserRankService
    {
        Task ActualizarRangoAsync(int userId);
        Task<string> ObtenerRangoPorPuntosAsync(int puntos);
        (string rank, string color, string icon) GetRankInfo(int points);
    }

    public class UserRankService : IUserRankService
    {
        private readonly MyDbContext _context;

        public UserRankService(MyDbContext context)
        {
            _context = context;
        }

        public async Task ActualizarRangoAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            var nuevoRango = await ObtenerRangoPorPuntosAsync(user.Puntos);
            
            if (user.Rango != nuevoRango)
            {
                user.Rango = nuevoRango;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<string> ObtenerRangoPorPuntosAsync(int puntos)
        {
            var rankInfo = GetRankInfo(puntos);
            return await Task.FromResult(rankInfo.rank);
        }

        public (string rank, string color, string icon) GetRankInfo(int points)
        {
            if (points >= 1050) return ("Ciudadano Héroe", "from-cyan-400 to-teal-500", "🏆");
            if (points >= 650) return ("Ciudadano Ejemplar", "from-sky-400 to-blue-500", "⭐");
            if (points >= 250) return ("Ciudadano Vigía", "from-emerald-400 to-green-500", "👁️");
            if (points >= 100) return ("Ciudadano Activo", "from-violet-400 to-purple-500", "🎯");
            return ("Ciudadano Novato", "bg-muted text-muted-foreground", "🌱");
        }
    }
}