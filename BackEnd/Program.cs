using BackEnd.Controllers;
using BackEnd.Data;                // <-- ESTA ES LA LÍNEA QUE FALTABA
using Microsoft.EntityFrameworkCore;

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


        app.UseAuthorization();
        app.MapControllers();

        app.Run();
    }
}