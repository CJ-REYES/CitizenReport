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

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(UserRegisterDTO dto)
        {
            try
            {
                // Valida si el email ya está registrado
                var exists = await _context.Users.AnyAsync(u => u.Email == dto.Email);

                if (exists)
                {
                    return BadRequest("El correo ya está registrado.");
                }

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

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserUpdateDTO dto)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);

                if (user == null)
                    return NotFound("Usuario no encontrado.");

                // Valida el email nuevo no exista
                var emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id);

                if (emailExists)
                    return BadRequest("El correo ya está usado por otro usuario.");

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

        [HttpPost("login")]
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
        private string GenerateJwtToken(User user)
        {
            var secretKey = _configuration["Jwt:SecretKey"];
            var expireHours = int.Parse(_configuration["Jwt:ExpireHours"] ?? "2");
            
            var key = Encoding.UTF8.GetBytes(secretKey);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Nombre),
                new Claim(ClaimTypes.Role, user.Rol),
                new Claim("PhotoUrl", user.FotoPerfilURL ?? ""),
                new Claim("Puntos", user.Puntos.ToString()),
                new Claim("Rango", user.Rango ?? "Ciudadano Novato")
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