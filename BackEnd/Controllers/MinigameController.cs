using Microsoft.AspNetCore.Mvc;
using BackEnd.Data;
using BackEnd.Model;
using BackEnd.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("minigame")]
    public class MinigameController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IMinigameService _minigameService;

        public MinigameController(MyDbContext context, IMinigameService minigameService)
        {
            _context = context;
            _minigameService = minigameService;
        }

        // DTOs definidos aquí como pediste
public record SaveScoreDTO(int UserId, int Score);
public record MatchHistoryDTO(int Score, DateTime PlayedAt);
        public record RankingDTO(string UserName, string? FotoPerfil, int HighScore);

[HttpPost("save-score")]
public async Task<IActionResult> SaveScore([FromBody] SaveScoreDTO dto)
{
    var user = await _context.Users
        .Include(u => u.PartidasMinijuego)
        .FirstOrDefaultAsync(u => u.Id == dto.UserId);

    if (user == null) return NotFound("Usuario no encontrado.");

    // 1. Calcular Monedas Ganadas
    int monedasGanadas = _minigameService.CalcularMonedas(dto.Score);
    user.Monedas += monedasGanadas; // Se otorgan las monedas al usuario

    // 2. Lógica del Historial (Top 3)
    var historial = user.PartidasMinijuego.OrderByDescending(p => p.Score).ToList();
    bool guardadoEnHistorial = false;

    if (historial.Count < 3)
    {
        // Si tiene menos de 3 partidas, guardamos esta sí o sí
        var match = new MinigameMatch { UserId = user.Id, Score = dto.Score, PlayedAt = DateTime.UtcNow };
        _context.MinigameMatches.Add(match);
        guardadoEnHistorial = true;
    }
    else
    {
        // Si ya tiene 3, comparamos con la peor de las 3
        var peorPartidaTop3 = historial.Last();

        if (dto.Score > peorPartidaTop3.Score)
        {
            // Nuevo récord: Eliminamos la vieja y guardamos la nueva
            _context.MinigameMatches.Remove(peorPartidaTop3);
            
            var newMatch = new MinigameMatch { UserId = user.Id, Score = dto.Score, PlayedAt = DateTime.UtcNow };
            _context.MinigameMatches.Add(newMatch);
            guardadoEnHistorial = true;
        }
    }

    // 3. Guardamos los cambios (Monedas y Historial)
    await _context.SaveChangesAsync();

    return Ok(new
    {
        Message = guardadoEnHistorial ? "Partida guardada en Top 3." : "Puntuación no supera Top 3.",
        MonedasGanadas = monedasGanadas,
        TotalMonedas = user.Monedas,
        // No devolvemos vidas aquí, el front-end ya debe tener el conteo de la llamada a 'start-game'
    });
}
[HttpPost("start-game/{userId}")]
public async Task<IActionResult> StartGame(int userId)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Id == userId);

    if (user == null) return NotFound("Usuario no encontrado.");

    // 1. Verificar y actualizar Vidas Diarias (Recarga a 5 si aplica)
    _minigameService.ProcesarVidasDiarias(user);
    
    // 2. Intentar consumir 1 vida (sin depender de un método de servicio inexistente)
    if (user.Vidas <= 0)
    {
        // Guardamos la posible recarga de vidas antes de fallar
        await _context.SaveChangesAsync();
        return BadRequest(new
        {
            Message = "No tienes vidas suficientes para iniciar una nueva partida.",
            VidasActuales = user.Vidas
        });
    }

    // Consumimos una vida
    user.Vidas -= 1;

    // 3. Guardar la deducción de la vida
    await _context.SaveChangesAsync();

    return Ok(new
    {
        Message = "Partida iniciada. Una vida ha sido consumida.",
        VidasRestantes = user.Vidas
    });
}

        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetUserHistory(int userId)
        {
            // Verifica vidas al consultar (opcional, pero útil para refrescar la UI)
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("Usuario no encontrado");
            
            // Si es un nuevo día, actualiza vidas visualmente aunque no juegue
            _minigameService.ProcesarVidasDiarias(user);
            await _context.SaveChangesAsync();

            var history = await _context.MinigameMatches
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.Score)
                .Select(m => new MatchHistoryDTO(m.Score, m.PlayedAt))
                .ToListAsync();

            return Ok(new { 
                Vidas = user.Vidas,
                Monedas = user.Monedas,
                Historial = history 
            });
        }

        [HttpGet("ranking")]
        public async Task<IActionResult> GetGlobalRanking()
        {
            // Obtener el ranking global basado en la puntuación más alta de cada usuario
            var ranking = await _context.MinigameMatches
                // Removimos .Include(m => m.User) ya que la proyección explícita no lo necesita
                .GroupBy(m => m.UserId) // Agrupamos por usuario
                .Select(g => new
                {
                    // CORRECCIÓN: Proyectamos las propiedades escalares (Nombre, FotoPerfilURL)
                    // en lugar de intentar proyectar el objeto 'User' completo.
                    UserName = g.First().User.Nombre, 
                    UserFotoPerfilURL = g.First().User.FotoPerfilURL,
                    MaxScore = g.Max(m => m.Score)
                })
                .OrderByDescending(x => x.MaxScore)
                .Take(10) // Top 10 mundial
                .Select(x => new RankingDTO(x.UserName, x.UserFotoPerfilURL, x.MaxScore))
                .ToListAsync();

            return Ok(ranking);
        }
    }
}