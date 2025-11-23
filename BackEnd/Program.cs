using BackEnd.Controllers;
using BackEnd.Data;                // <-- ESTA ES LA LÍNEA QUE FALTABA
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            WebRootPath = "wwwroot" // Asegurar que WebRootPath esté configurado
        });

        // Configurar MySQL
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        builder.Services.AddDbContext<MyDbContext>(options =>
            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

        // Add services to the container.
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddControllers();

        // Configurar logging para ver errores detallados
        builder.Services.AddLogging(logging =>
        {
            logging.AddConsole();
            logging.AddDebug();
            logging.SetMinimumLevel(LogLevel.Debug);
        });

        // Registrar el servicio de archivos
        builder.Services.AddScoped<ArchivoService>();

        // Configuración de JWT
// En Program.cs - forma correcta
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"];

if (string.IsNullOrEmpty(secretKey) || secretKey.Length < 32)
{
    throw new InvalidOperationException("JWT Secret Key no está configurada correctamente");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();

        var app = builder.Build();

        // Crear wwwroot y uploads si no existen
        var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        if (!Directory.Exists(webRootPath))
        {
            Directory.CreateDirectory(webRootPath);
            Console.WriteLine($"Carpeta wwwroot creada en: {webRootPath}");
        }

        var uploadsPath = Path.Combine(webRootPath, "uploads");
        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
            Console.WriteLine($"Carpeta uploads creada en: {uploadsPath}");
        }

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();


        // Configuración del pipeline

        // Configurar servicio de archivos estáticos - DEBE ir antes de MapControllers
        app.UseStaticFiles(); // Esto permite servir archivos desde wwwroot

app.UseAuthentication(); // ¡Importante: debe ir antes de UseAuthorization!
app.UseAuthorization();

        app.UseAuthorization();
        app.MapControllers();

        app.Run();
    }
}