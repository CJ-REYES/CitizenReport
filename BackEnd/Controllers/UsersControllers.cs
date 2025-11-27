using Microsoft.AspNetCore.Mvc;
using BackEnd.Data;
using BackEnd.DTOs;
using BackEnd.Model;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using BackEnd.Services;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("users")]
    public class UsersControllers : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IUserRankService _rankService;

        public UsersControllers(MyDbContext context, IConfiguration configuration, IUserRankService rankService)
        {
            _context = context;
            _configuration = configuration;
            _rankService = rankService;
        }

        // --------------------------
        // ACTUALIZAR FOTO DE PERFIL
        // --------------------------
        [HttpPut("ActualizarFoto/{idUsuario}")]
        public async Task<IActionResult> ActualizarFoto(int idUsuario, IFormFile nuevaFoto)
        {
            if (nuevaFoto == null || nuevaFoto.Length == 0)
                return BadRequest("Debes enviar una imagen válida.");

            var user = await _context.Users.FindAsync(idUsuario);

            if (user == null)
                return NotFound("Usuario no encontrado.");

            string carpetaImagenes = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Images");

            if (!Directory.Exists(carpetaImagenes))
                Directory.CreateDirectory(carpetaImagenes);

            if (!string.IsNullOrEmpty(user.FotoPerfilURL))
            {
                string rutaVieja = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.FotoPerfilURL);

                if (System.IO.File.Exists(rutaVieja))
                    System.IO.File.Delete(rutaVieja);
            }

            string nombreArchivo = $"{Guid.NewGuid()}{Path.GetExtension(nuevaFoto.FileName)}";
            string rutaGuardar = Path.Combine(carpetaImagenes, nombreArchivo);

            using (var stream = new FileStream(rutaGuardar, FileMode.Create))
                await nuevaFoto.CopyToAsync(stream);

            user.FotoPerfilURL = Path.Combine("Images", nombreArchivo);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Foto actualizada correctamente.",
                ruta = user.FotoPerfilURL
            });
        }

        // --------------------------
        // REGISTRO
        // --------------------------
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(UserRegisterDTO dto)
        {
<<<<<<< Updated upstream
            try
            {
                // Valida si el email ya está registrado
                var exists = await _context.Users.AnyAsync(u => u.Email == dto.Email);

                if (exists)
                {
                    return BadRequest("El correo ya está registrado.");
                }
=======
            if (_context.Users.Any(u => u.Email == dto.Email))
                return BadRequest("El correo ya está registrado.");

            var user = new User
            {
                Nombre = dto.Nombre,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Rol = "Usuario",
                FotoPerfilURL = "",
                Puntos = 0
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok("Usuario registrado correctamente.");
        }

        // --------------------------
        // OBTENER USUARIO POR ID
        // --------------------------
        [HttpGet("{id}")]
        public IActionResult GetUserById(int id)
        {
            var user = _context.Users.Find(id);
            if (user == null)
                return NotFound("Usuario no encontrado.");

            return Ok(new
            {
                user.Id,
                user.Nombre,
                user.Email,
                user.Rol,
                user.FotoPerfilURL,
                user.Puntos
            });
        }

        // --------------------------
        // OBTENER TODOS LOS USUARIOS
        // --------------------------
        [HttpGet]
        public IActionResult GetAllUsers()
        {
            var users = _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Nombre,
                    u.Email,
                    u.Rol,
                    u.FotoPerfilURL,
                    u.Puntos
                })
                .ToList();
>>>>>>> Stashed changes

                // Crea usuario con contraseña encriptada
                var user = new User
                {
                    Nombre = dto.Nombre,
                    Email = dto.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    Rol = "Usuario",
                    FotoPerfilURL = "",
                    Puntos = 0,
                    Rango = "Ciudadano Novato"
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok("Usuario registrado correctamente.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
public async Task<IActionResult> GetUserById(int id)
{
    try
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound("Usuario no encontrado.");

        var rankInfo = _rankService.GetRankInfo(user.Puntos);

        return Ok(new
        {
            user.Id,
            user.Nombre,
            user.Email,
            user.Rol,
            user.FotoPerfilURL,
            user.Puntos,
            user.Rango,
            RankColor = rankInfo.color,
            RankIcon = rankInfo.icon,
            user.Monedas, // <--- AGREGADO
            user.Vidas    // <--- AGREGADO
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Error interno del servidor: {ex.Message}");
    }
}

       [HttpGet]
public async Task<IActionResult> GetAllUsers()
{
    try
    {
        var users = await _context.Users
            .Select(u => new
            {
                u.Id,
                u.Nombre,
                u.Email,
                u.Rol,
                u.FotoPerfilURL,
                u.Puntos,
                u.Rango,
                u.Monedas, // <--- AGREGADO
                u.Vidas    // <--- AGREGADO
            })
            .ToListAsync();

        return Ok(users);
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Error interno del servidor: {ex.Message}");
    }
}

        [HttpGet("ranking")]
        public async Task<IActionResult> GetRanking()
        {
            try
            {
                // Primero traemos la lista ordenada desde la base de datos
                var userList = await _context.Users
                    .OrderByDescending(u => u.Puntos)
                    .ToListAsync();

                // Luego proyectamos en memoria para usar el servicio de rangos y el índice como posición
                var users = userList
                    .Select((u, index) => {
                        var rankInfo = _rankService.GetRankInfo(u.Puntos);
                        return new
                        {
                            u.Id,
                            u.Nombre,
                            u.Email,
                            u.FotoPerfilURL,
                            u.Puntos,
                            u.Rango,
                            RankColor = rankInfo.color,
                            RankIcon = rankInfo.icon,
                            Posicion = index + 1
                        };
                    })
                    .ToList();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }
// En UsersControllers.cs - Agregar estos nuevos endpoints

[HttpGet("stats/{id}")]
public async Task<IActionResult> GetUserStats(int id)
{
    try
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound("Usuario no encontrado.");

        // Obtener el mejor score del usuario desde MinigameMatches
        var mejorScore = await _context.MinigameMatches
            .Where(m => m.UserId == id)
            .Select(m => m.Score)
            .DefaultIfEmpty(0)
            .MaxAsync();

        return Ok(new
        {
            Id = user.Id,
            Nombre = user.Nombre,
            Vidas = user.Vidas,
            Monedas = user.Monedas,
            MejorScore = mejorScore,
            UltimaRecarga = user.UltimaRecargaVidas
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Error interno del servidor: {ex.Message}");
    }
}

[HttpGet("minigame-stats/{id}")]
public async Task<IActionResult> GetUserMinigameStats(int id)
{
    try
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound("Usuario no encontrado.");

        // Obtener estadísticas del minijuego
        var partidas = await _context.MinigameMatches
            .Where(m => m.UserId == id)
            .OrderByDescending(m => m.Score)
            .ToListAsync();

        var mejorScore = partidas.Any() ? partidas.Max(m => m.Score) : 0;
        var totalPartidas = partidas.Count;
        var promedioScore = partidas.Any() ? (int)partidas.Average(m => m.Score) : 0;

        return Ok(new
        {
            Vidas = user.Vidas,
            Monedas = user.Monedas,
            MejorScore = mejorScore,
            TotalPartidas = totalPartidas,
            PromedioScore = promedioScore,
            UltimasPartidas = partidas.Take(5).Select(p => new { p.Score, p.PlayedAt })
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Error interno del servidor: {ex.Message}");
    }
}
        [HttpGet("top")]
        public async Task<IActionResult> GetTopUsers()
        {
            try
            {
                var topUsersList = await _context.Users
                    .OrderByDescending(u => u.Puntos)
                    .Take(10)
                    .ToListAsync();

                var topUsers = topUsersList
                    .Select(u =>
                    {
                        var rankInfo = _rankService.GetRankInfo(u.Puntos);
                        return new
                        {
                            u.Id,
                            u.Nombre,
                            u.FotoPerfilURL,
                            u.Puntos,
                            u.Rango,
                            RankColor = rankInfo.color,
                            RankIcon = rankInfo.icon
                        };
                    })
                    .ToList();

                return Ok(topUsers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

<<<<<<< Updated upstream
=======
        // --------------------------
        // EDITAR USUARIO
        // --------------------------
>>>>>>> Stashed changes
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserUpdateDTO dto)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);

                if (user == null)
                    return NotFound("Usuario no encontrado.");

<<<<<<< Updated upstream
                // Valida el email nuevo no exista
                var emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id);

                if (emailExists)
                    return BadRequest("El correo ya está usado por otro usuario.");
=======
            if (_context.Users.Any(u => u.Email == dto.Email && u.Id != id))
                return BadRequest("El correo ya está usado por otro usuario.");
>>>>>>> Stashed changes

                user.Nombre = dto.Nombre;
                user.Email = dto.Email;

                await _context.SaveChangesAsync();

                return Ok("Usuario actualizado correctamente.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

<<<<<<< Updated upstream
=======
        // --------------------------
        // ELIMINAR USUARIO
        // --------------------------
>>>>>>> Stashed changes
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);

                if (user == null)
                    return NotFound("Usuario no encontrado.");

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return Ok("Usuario eliminado correctamente.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // --------------------------
        // LOGIN
        // --------------------------
        [HttpPost("login")]
<<<<<<< Updated upstream
[AllowAnonymous]
public async Task<IActionResult> Login(UserLoginDTO dto)
{
    try
    {
        // Buscar usuario por email
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == dto.Email);

        // Verificar credenciales
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return Unauthorized("CREDENCIALES INVALIDAS");
        }

        // Actualizar rango antes de generar el token
        await _rankService.ActualizarRangoAsync(user.Id);
        
        // Refrescar el usuario para obtener el rango actualizado y los datos del minijuego
        user = await _context.Users.SingleOrDefaultAsync(u => u.Id == user.Id);
        var rankInfo = _rankService.GetRankInfo(user.Puntos);

        // Generar token
        var token = GenerateJwtToken(user);

        return Ok(new
        {
            IdUser = user.Id,
            Email = user.Email,
            NombreUser = user.Nombre,
            TokenJWT = token,
            Puntos = user.Puntos,
            Rango = user.Rango,
            RankColor = rankInfo.color,
            RankIcon = rankInfo.icon,
            Monedas = user.Monedas, // <--- AGREGADO
            Vidas = user.Vidas      // <--- AGREGADO
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Error interno del servidor: {ex.Message}");
    }
}
=======
        [AllowAnonymous]
        public IActionResult Login(UserLoginDTO dto)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("CREDENCIALES INVALIDAS");

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                IdUser = user.Id,
                Email = user.Email,
                NombreUser = user.Nombre,
                TokenJWT = token,
                Puntos = user.Puntos
            });
        }

>>>>>>> Stashed changes
        private string GenerateJwtToken(User user)
        {
            var secretKey = _configuration["Jwt:SecretKey"];
            var expireHours = int.Parse(_configuration["Jwt:ExpireHours"] ?? "2");
<<<<<<< Updated upstream
            
=======

>>>>>>> Stashed changes
            var key = Encoding.UTF8.GetBytes(secretKey);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Nombre),
                new Claim(ClaimTypes.Role, user.Rol),
                new Claim("PhotoUrl", user.FotoPerfilURL ?? ""),
<<<<<<< Updated upstream
                new Claim("Puntos", user.Puntos.ToString()),
                new Claim("Rango", user.Rango ?? "Ciudadano Novato")
=======
                new Claim("Puntos", user.Puntos.ToString())
>>>>>>> Stashed changes
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(expireHours),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}
