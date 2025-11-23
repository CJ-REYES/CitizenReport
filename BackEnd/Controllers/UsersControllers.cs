using Microsoft.AspNetCore.Mvc;
using BackEnd.Data;
using BackEnd.DTOs;
using BackEnd.Model;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("users")]
    public class UsersControllers : ControllerBase
    {
        private readonly MyDbContext _context;

        public UsersControllers(MyDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public IActionResult Register(UserRegisterDTO dto)
        {
            // Valida si el email ya está registrado
            var exists = _context.Users.Any(u => u.Email == dto.Email);

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
                FotoPerfilURL = ""
            };

            _context.Users.Add(user);
            _context.SaveChanges();

        
     return Ok("Usuario registrado correctamente.");
}

// GET users id
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
        user.FotoPerfilURL

    });
    
    
}
// get user todos los usuarios
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
            u.FotoPerfilURL
        })
        .ToList();

    return Ok(users);
}
// put editor
[HttpPut("{id}")]
public IActionResult UpdateUser(int id, UserUpdateDTO dto)
{
    var user = _context.Users.Find(id);

    if (user == null)
        return NotFound("Usuario no encontrado.");

    // Valida el email nuevo no exista
    var emailExists = _context.Users.Any(u => u.Email == dto.Email && u.Id != id);

    if (emailExists)
        return BadRequest("El correo ya está usado por otro usuario.");

    user.Nombre = dto.Nombre;
    user.Email = dto.Email;

    _context.SaveChanges();

    return Ok("Usuario actualizado correctamente.");
}
// delete para borrar usuarios
[HttpDelete("{id}")]
public IActionResult DeleteUser(int id)
{
    var user = _context.Users.Find(id);

    if (user == null)
        return NotFound("Usuario no encontrado.");

    _context.Users.Remove(user);
    _context.SaveChanges();

    return Ok("Usuario eliminado correctamente.");
}

[HttpPost("login")]
public IActionResult Login(UserLoginDTO dto)
{
    // Buscar usuario por email
    var user = _context.Users.SingleOrDefault(u => u.Email == dto.Email);

    // Verificar credenciales
    if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
    {
        return Unauthorized("CREDENCIALES INVALIDAS");
    }

    // Generar token
    var token = GenerateJwtToken(user);

    // Retornar respuesta
    return Ok(new
    {
        IdUser = user.Id,
        Email = user.Email,
        NombreUser = user.Nombre,
        TokenJWT = token
    });
}

private string GenerateJwtToken(User user)
{
    var configuration = new ConfigurationBuilder()
        .AddJsonFile("appsettings.json")
        .Build();
    
    var secretKey = configuration["Jwt:SecretKey"];
    var expireHours = int.Parse(configuration["Jwt:ExpireHours"] ?? "2");
    
    var key = Encoding.UTF8.GetBytes(secretKey);

    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Name, user.Nombre),
        new Claim(ClaimTypes.Role, user.Rol),
        new Claim("PhotoUrl", user.FotoPerfilURL ?? "")
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


    

