using Microsoft.AspNetCore.Mvc;
using BackEnd.Data;
using BackEnd.DTOs;
using BackEnd.Model;
using BCrypt.Net;

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



}
}


    

