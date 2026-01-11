using Microsoft.AspNetCore.Mvc;
using BackEnd.Data;
using BackEnd.Model;
using BackEnd.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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

        // ============ ENDPOINTS SOLO PARA USUARIOS REGISTRADOS ============
        [HttpPost("save-score")]
        [Authorize(Policy = "RegisteredUser")]
        public async Task<IActionResult> SaveScore([FromBody] SaveScoreDTO dto)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.PartidasMinijuego)
                    .FirstOrDefaultAsync(u => u.Id == dto.UserId);

                if (user == null) return NotFound("Usuario no encontrado.");

                // Verificar que el usuario del token coincide
                var tokenUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (tokenUserId != dto.UserId)
                {
                    return Forbid("No puedes guardar puntuación para otro usuario.");
                }

                // 1. Calcular Monedas Ganadas
                int monedasGanadas = _minigameService.CalcularMonedas(dto.Score);
                user.Monedas += monedasGanadas;

                // 2. Lógica del Historial (Top 3)
                var historial = user.PartidasMinijuego.OrderByDescending(p => p.Score).ToList();
                bool guardadoEnHistorial = false;

                if (historial.Count < 3)
                {
                    var match = new MinigameMatch { UserId = user.Id, Score = dto.Score, PlayedAt = DateTime.UtcNow };
                    _context.MinigameMatches.Add(match);
                    guardadoEnHistorial = true;
                }
                else
                {
                    var peorPartidaTop3 = historial.Last();

                    if (dto.Score > peorPartidaTop3.Score)
                    {
                        _context.MinigameMatches.Remove(peorPartidaTop3);
                        
                        var newMatch = new MinigameMatch { UserId = user.Id, Score = dto.Score, PlayedAt = DateTime.UtcNow };
                        _context.MinigameMatches.Add(newMatch);
                        guardadoEnHistorial = true;
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Message = guardadoEnHistorial ? "Partida guardada en Top 3." : "Puntuación no supera Top 3.",
                    MonedasGanadas = monedasGanadas,
                    TotalMonedas = user.Monedas,
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost("start-game/{userId}")]
        [Authorize(Policy = "RegisteredUser")]
        public async Task<IActionResult> StartGame(int userId)
        {
            try
            {
                // Verificar que el usuario del token coincide con el userId
                var tokenUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (tokenUserId != userId)
                {
                    return Forbid("No puedes iniciar partidas para otros usuarios.");
                }

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null) return NotFound("Usuario no encontrado.");

                // 1. Verificar y actualizar Vidas Diarias
                _minigameService.ProcesarVidasDiarias(user);
                
                // 2. Intentar consumir 1 vida
                if (user.Vidas <= 0)
                {
                    await _context.SaveChangesAsync();
                    return BadRequest(new
                    {
                        Message = "No tienes vidas suficientes para iniciar una nueva partida.",
                        VidasActuales = user.Vidas
                    });
                }

                // Consumimos una vida
                user.Vidas -= 1;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Partida iniciada. Una vida ha sido consumida.",
                    VidasRestantes = user.Vidas
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // ============ ENDPOINTS PARA TODOS LOS USUARIOS AUTENTICADOS ============
        [HttpGet("history/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetUserHistory(string userId)
        {
            try
            {
                // Verificar si es invitado
                var currentUserIsGuest = User.IsInRole("Guest") || 
                                       User.Claims.FirstOrDefault(c => c.Type == "IsGuest")?.Value == "true";
                
                if (currentUserIsGuest)
                {
                    return Ok(new { 
                        Vidas = 0,
                        Monedas = 0,
                        Historial = new List<MatchHistoryDTO>()
                    });
                }

                // Convertir a int para usuarios normales
                if (!int.TryParse(userId, out int id))
                {
                    return BadRequest("ID de usuario inválido.");
                }

                // Verificar que el usuario del token coincide con el userId solicitado
                var tokenUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (tokenUserId != id)
                {
                    return Forbid("No puedes ver el historial de otro usuario.");
                }

                var user = await _context.Users.FindAsync(id);
                if (user == null) return NotFound("Usuario no encontrado");
                
                // Si es un nuevo día, actualiza vidas
                _minigameService.ProcesarVidasDiarias(user);
                await _context.SaveChangesAsync();

                var history = await _context.MinigameMatches
                    .Where(m => m.UserId == id)
                    .OrderByDescending(m => m.Score)
                    .Select(m => new MatchHistoryDTO(m.Score, m.PlayedAt))
                    .ToListAsync();

                return Ok(new { 
                    Vidas = user.Vidas,
                    Monedas = user.Monedas,
                    Historial = history 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // ============ ENDPOINTS PÚBLICOS ============
        [HttpGet("ranking")]
        [AllowAnonymous]
        public async Task<IActionResult> GetGlobalRanking()
        {
            try
            {
                // Solución 1: Usar una subconsulta más simple y luego traer los datos del usuario
                // Primero, obtenemos los mejores scores por usuario
                var topScoresQuery = await _context.MinigameMatches
                    .Where(m => m.User.Rol != "Guest")
                    .GroupBy(m => m.UserId)
                    .Select(g => new
                    {
                        UserId = g.Key,
                        HighScore = g.Max(m => m.Score)
                    })
                    .OrderByDescending(x => x.HighScore)
                    .Take(10)
                    .ToListAsync();

                // Luego, obtenemos los datos de los usuarios correspondientes
                var userIds = topScoresQuery.Select(x => x.UserId).ToList();
                
                var users = await _context.Users
                    .Where(u => userIds.Contains(u.Id))
                    .Select(u => new
                    {
                        u.Id,
                        u.Nombre,
                        u.FotoPerfilURL
                    })
                    .ToListAsync();

                // Combinamos los resultados
                var ranking = topScoresQuery
                    .Join(users,
                        score => score.UserId,
                        user => user.Id,
                        (score, user) => new RankingDTO(
                            user.Nombre,
                            user.FotoPerfilURL,
                            score.HighScore
                        ))
                    .OrderByDescending(x => x.HighScore)
                    .ToList();

                return Ok(ranking);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // Alternativa: Versión más optimizada con una sola consulta
        [HttpGet("ranking-optimized")]
        [AllowAnonymous]
        public async Task<IActionResult> GetGlobalRankingOptimized()
        {
            try
            {
                // Solución 2: Usar una consulta más directa
                var ranking = await _context.MinigameMatches
                    .Include(m => m.User)
                    .Where(m => m.User.Rol != "Guest")
                    .GroupBy(m => new { m.UserId, m.User.Nombre, m.User.FotoPerfilURL })
                    .Select(g => new RankingDTO(
                        g.Key.Nombre,
                        g.Key.FotoPerfilURL,
                        g.Max(m => m.Score)
                    ))
                    .OrderByDescending(x => x.HighScore)
                    .Take(10)
                    .ToListAsync();

                return Ok(ranking);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }
    }

    public record SaveScoreDTO(int UserId, int Score);
    public record MatchHistoryDTO(int Score, DateTime PlayedAt);
    public record RankingDTO(string UserName, string? FotoPerfil, int HighScore);
}