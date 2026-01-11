using BackEnd.Controllers;
using BackEnd.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using BackEnd.Services;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    WebRootPath = "wwwroot"
});

// --- 1. CONFIGURACIÓN DE CORS ---
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? ["*"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin() 
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Configurar MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddEndpointsApiExplorer();

// --- 2. CONFIGURACIÓN DE SWAGGER CON SEGURIDAD (JWT) ---
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "BackEnd", Version = "v1" });

    // PASO A: Define el esquema de seguridad (Bearer)
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Autorización JWT usando el esquema Bearer. Solo pega el token puro (sin Bearer).",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer" 
    });

    // PASO B: Aplica este esquema a todos los endpoints en Swagger UI
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "Bearer"
            },
            new string[] {}
        }
    });
});

builder.Services.AddControllers();

// Registrar el servicio de archivos
builder.Services.AddScoped<ArchivoService>();
builder.Services.AddScoped<IUserRankService, UserRankService>();
builder.Services.AddScoped<IMinigameService, MinigameService>();

// --- 3. CONFIGURACIÓN DE JWT AUTENTICACIÓN Y AUTORIZACIÓN ---
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT Secret Key no configurada.");

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

// Configuración de políticas de autorización
builder.Services.AddAuthorization(options =>
{
    // Política "RegisteredUser" - Solo usuarios con ID positivo (no invitados)
    options.AddPolicy("RegisteredUser", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == ClaimTypes.NameIdentifier) &&
            int.TryParse(context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out int userId) &&
            userId > 0 // Solo IDs positivos (usuarios registrados)
        ));
    
    // Fallback Policy: CUALQUIER solicitud a un endpoint DEBE estar autenticada
    // Esto se puede ajustar según sea necesario, pero los endpoints con [AllowAnonymous] ignorarán esta política
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

var app = builder.Build();

// Configurar carpeta uploads si no existe
var uploadsPath = Path.Combine(app.Environment.WebRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

// Configurar carpeta Images si no existe
var imagesPath = Path.Combine(app.Environment.WebRootPath, "Images");
if (!Directory.Exists(imagesPath))
{
    Directory.CreateDirectory(imagesPath);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); 
}

app.UseHttpsRedirection();

// HABILITAR CORS Y ESTÁTICOS
app.UseCors("AllowAll"); 
app.UseStaticFiles(); 

// AUTENTICACIÓN Y AUTORIZACIÓN
app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();

app.Run();