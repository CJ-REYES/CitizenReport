using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using BackEnd.Model;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportesController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly ILogger<ReportesController> _logger;
        private readonly ArchivoService _archivoService;

        public ReportesController(MyDbContext context, ILogger<ReportesController> logger, ArchivoService archivoService)
        {
            _context = context;
            _logger = logger;
            _archivoService = archivoService;
        }
// GET: api/reportes
[HttpGet]
public async Task<ActionResult<IEnumerable<object>>> GetAllReportes()
{
    try
    {
        // 1. Traer datos crudos de la base de datos
        var reportesDb = await _context.Reportes
            .Include(r => r.Ciudadano) // Traemos datos del usuario
            .OrderByDescending(r => r.FechaCreacion)
            .ToListAsync();

        // 2. Transformar los datos en memoria para generar las URLs completas
        var reportesConUrl = reportesDb.Select(r => new
        {
            r.Id,
            r.TipoIncidente,
            r.DescripcionDetallada,
            r.Latitud,
            r.Longitud,
            r.Estado,
            r.FechaCreacion,
            
            // Generamos la URL completa para la foto del reporte
            UrlFoto = GenerarUrlCompleta(r.UrlFoto),

            // Datos del Usuario con su foto también procesada
            Usuario = new {
                Id = r.CiudadanoId,
                Nombre = r.Ciudadano?.Nombre ?? "Usuario Desconocido",
                FotoPerfil = GenerarUrlCompleta(r.Ciudadano?.FotoPerfilURL)
            }
        });

        return Ok(reportesConUrl);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error al obtener reportes");
        return StatusCode(500, "Error interno del servidor");
    }
}

       // POST: api/reportes
[HttpPost]
[Consumes("multipart/form-data")]
public async Task<ActionResult<Reporte>> CrearReporte([FromForm] CrearReporteConArchivoDto crearReporteDto)
{
    try
    {
        _logger.LogInformation("Iniciando creación de reporte...");

        // 1. VALIDACIÓN DE CAMPOS BÁSICOS
        if (string.IsNullOrWhiteSpace(crearReporteDto.TipoIncidente))
            return BadRequest("El tipo de incidente es obligatorio");

        if (string.IsNullOrWhiteSpace(crearReporteDto.DescripcionDetallada))
            return BadRequest("La descripción detallada es obligatoria");

        // 2. VALIDACIÓN DE USUARIO (Relación)
        // Verificamos si el usuario existe antes de crear el reporte
        var usuarioExiste = await _context.Users.AnyAsync(u => u.Id == crearReporteDto.CiudadanoId);
        if (!usuarioExiste)
        {
            return BadRequest($"El usuario con ID {crearReporteDto.CiudadanoId} no existe.");
        }

        // 3. GESTIÓN DE UBICACIÓN
        double latitud = crearReporteDto.Latitud;
        double longitud = crearReporteDto.Longitud;

        if (latitud == 0 || longitud == 0)
        {
            var ubicacionAutomatica = await ObtenerUbicacionDesdeRequest();
            if (ubicacionAutomatica != null)
            {
                latitud = ubicacionAutomatica.Latitud;
                longitud = ubicacionAutomatica.Longitud;
            }
            else
            {
                return BadRequest("No se pudo obtener la ubicación. Proporcione coordenadas manualmente.");
            }
        }

        // 4. VALIDACIÓN DE DUPLICADOS POR CERCANÍA (50 metros)
        // Primero filtramos crudamente por un cuadro pequeño para no traer toda la base de datos (optimización)
        const double GRADOS_APROX_50M = 0.00045; // ~50 metros en grados
        
        var reportesCercanosDB = await _context.Reportes
            .Where(r => 
                r.Latitud >= latitud - GRADOS_APROX_50M &&
                r.Latitud <= latitud + GRADOS_APROX_50M &&
                r.Longitud >= longitud - GRADOS_APROX_50M &&
                r.Longitud <= longitud + GRADOS_APROX_50M &&
                r.Estado != "Resuelto") // Opcional: Si quieres permitir reportar si el anterior ya se arregló
            .ToListAsync();

        // Verificación fina usando la fórmula de Haversine
        foreach (var rep in reportesCercanosDB)
        {
            var distancia = CalculateDistance(latitud, longitud, rep.Latitud, rep.Longitud);
            if (distancia <= 50) // 50 metros
            {
                return Conflict(new { 
                    mensaje = "Ya existe un reporte similar en esta ubicación (radio de 50m).",
                    reporteExistenteId = rep.Id 
                });
            }
        }

        // 5. CREACIÓN DEL OBJETO
        var reporte = new Reporte
        {
            CiudadanoId = crearReporteDto.CiudadanoId, // Usamos el ID enviado
            TipoIncidente = crearReporteDto.TipoIncidente,
            DescripcionDetallada = crearReporteDto.DescripcionDetallada,
            Latitud = latitud,
            Longitud = longitud,
            Estado = "Pendiente",
            FechaCreacion = DateTime.Now
        };

        // 6. LÓGICA DE IMAGEN (Sin cambios mayores, solo se mantiene)
        if (crearReporteDto.ArchivoFoto != null && crearReporteDto.ArchivoFoto.Length > 0)
        {
            // ... (Tu lógica de validación de imagen existente va aquí) ...
            // ... (Para ahorrar espacio asumo que mantienes tu bloque de código de subida) ...
            
            // Validar extensiones, tamaño y subir archivo con _archivoService...
             var rutaRelativa = await _archivoService.SubirArchivoAsync(crearReporteDto.ArchivoFoto, "uploads");
             if (!string.IsNullOrEmpty(rutaRelativa)) reporte.UrlFoto = rutaRelativa;
        }

        _context.Reportes.Add(reporte);
        await _context.SaveChangesAsync();

        _logger.LogInformation($"Reporte creado exitosamente con ID: {reporte.Id}");
        return CreatedAtAction(nameof(GetReporte), new { id = reporte.Id }, reporte);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error crítico al crear reporte");
        return StatusCode(500, $"Error interno del servidor: {ex.Message}");
    }
}
        // PUT: api/reportes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarReporte(int id, ActualizarReporteDto actualizarReporteDto)
        {
            try
            {
                var reporte = await _context.Reportes.FindAsync(id);
                if (reporte == null)
                    return NotFound();

                // Solo permitir edición si el estado es "Pendiente"
                if (reporte.Estado != "Pendiente")
                    return BadRequest("Solo se pueden editar reportes en estado 'Pendiente'");

                reporte.DescripcionDetallada = actualizarReporteDto.DescripcionDetallada;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar reporte {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // DELETE: api/reportes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarReporte(int id)
        {
            try
            {
                var reporte = await _context.Reportes.FindAsync(id);
                if (reporte == null)
                    return NotFound();

                // Verificar que el reporte pertenezca al usuario actual y esté en estado "Pendiente"
                if (reporte.CiudadanoId != 1) // TODO: Reemplazar con ID del usuario autenticado
                    return Forbid("No tiene permisos para eliminar este reporte");

                if (reporte.Estado != "Pendiente")
                    return BadRequest("Solo se pueden eliminar reportes en estado 'Pendiente'");

                // Eliminar archivo físico si existe
                if (!string.IsNullOrEmpty(reporte.UrlFoto))
                {
                    await _archivoService.EliminarArchivoAsync(reporte.UrlFoto);
                }

                _context.Reportes.Remove(reporte);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar reporte {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

       // GET: api/reportes/cercanos
// GET: api/reportes/cercanos
[HttpGet("cercanos")]
public async Task<ActionResult<IEnumerable<object>>> GetReportesCercanos(
    [FromQuery] double? latitud = null, 
    [FromQuery] double? longitud = null, 
    [FromQuery] double radioMetros = 500)
{
    try
    {
        // 1. Determinar ubicación del usuario (Lógica original conservada)
        double userLatitud = latitud ?? 0;
        double userLongitud = longitud ?? 0;

        if (userLatitud == 0 || userLongitud == 0)
        {
            var ubicacionActual = await ObtenerUbicacionDesdeRequest();
            if (ubicacionActual != null)
            {
                userLatitud = ubicacionActual.Latitud;
                userLongitud = ubicacionActual.Longitud;
            }
            else
            {
                return BadRequest("No se pudo determinar la ubicación actual.");
            }
        }

        // 2. Filtrado inicial (Bounding Box) en Base de Datos
        const double GRADOS_POR_KILOMETRO = 0.009;
        var radioGrados = radioMetros / 1000 * GRADOS_POR_KILOMETRO;

        // Traemos las entidades completas con sus relaciones
        var reportesEnArea = await _context.Reportes
            .Include(r => r.Ciudadano) // <--- IMPORTANTE: Incluir Usuario
            .Where(r => 
                r.Latitud >= userLatitud - radioGrados &&
                r.Latitud <= userLatitud + radioGrados &&
                r.Longitud >= userLongitud - radioGrados &&
                r.Longitud <= userLongitud + radioGrados)
            .ToListAsync();

        // 3. Procesamiento en Memoria (Cálculo exacto y URLs)
        var reportesCercanos = reportesEnArea
            .Select(r => new
            {
                r.Id,
                r.TipoIncidente,
                r.Estado,
                r.Latitud,
                r.Longitud,
                r.DescripcionDetallada,
                r.FechaCreacion,
                
                // Convertimos URL relativa a absoluta
                UrlFoto = GenerarUrlCompleta(r.UrlFoto), 

                // Datos del Usuario
                Usuario = new {
                    Id = r.CiudadanoId,
                    Nombre = r.Ciudadano?.Nombre ?? "Desconocido",
                    FotoPerfil = GenerarUrlCompleta(r.Ciudadano?.FotoPerfilURL)
                },

                // Cálculo de distancia
                DistanciaMetros = CalculateDistance(userLatitud, userLongitud, r.Latitud, r.Longitud)
            })
            .Where(r => r.DistanciaMetros <= radioMetros)
            .OrderBy(r => r.DistanciaMetros)
            .ToList();

        return Ok(new 
        { 
            UbicacionConsulta = new { Latitud = userLatitud, Longitud = userLongitud },
            RadioMetros = radioMetros,
            TotalEncontrados = reportesCercanos.Count,
            Reportes = reportesCercanos 
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error al obtener reportes cercanos");
        return StatusCode(500, $"Error interno: {ex.Message}");
    }
}
// Método auxiliar para calcular distancia usando fórmula Haversine (CORREGIDO)
private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
{
    try
    {
        if (double.IsNaN(lat1) || double.IsNaN(lon1) || double.IsNaN(lat2) || double.IsNaN(lon2))
        {
            return double.MaxValue; // Retornar un valor grande si hay coordenadas inválidas
        }

        const double R = 6371000; // Radio de la Tierra en metros
        
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);
        
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }
    catch (Exception)
    {
        return double.MaxValue;
    }
}
// Método auxiliar para convertir ruta relativa (~/uploads/...) a URL absoluta (https://...)
private string? GenerarUrlCompleta(string? rutaRelativa)
{
    if (string.IsNullOrEmpty(rutaRelativa)) return null;

    // 1. Quitamos el "~/" del inicio si existe
    var rutaLimpia = rutaRelativa.Replace("~/", "").Replace("\\", "/");

    // 2. Obtenemos la base de la URL (ej: https://localhost:5001)
    var baseUrl = $"{Request.Scheme}://{Request.Host}";

    // 3. Combinamos
    return $"{baseUrl}/{rutaLimpia}";
}

// Método auxiliar para convertir grados a radianes
private static double ToRadians(double degrees)
{
    return degrees * Math.PI / 180;
}
       // GET: api/reportes/misreportes
[HttpGet("misreportes")]
public async Task<ActionResult<IEnumerable<object>>> GetMisReportes()
{
    try
    {
        // TODO: Aquí deberías obtener el ID del token JWT o de la sesión
        // Por ahora mantenemos el ID 1 fijo para pruebas
        var ciudadanoId = 1; 

        // 1. Obtener datos de la base de datos
        var reportesDb = await _context.Reportes
            .Include(r => r.Ciudadano) // Incluimos datos del usuario para obtener su foto/nombre
            .Where(r => r.CiudadanoId == ciudadanoId)
            .OrderByDescending(r => r.FechaCreacion)
            .ToListAsync();

        // 2. Transformar datos y generar URLs absolutas
        var misReportes = reportesDb.Select(r => new
        {
            r.Id,
            r.TipoIncidente,
            r.DescripcionDetallada,
            r.Latitud,
            r.Longitud,
            r.Estado,
            r.FechaCreacion,
            
            // URL completa de la evidencia
            UrlFoto = GenerarUrlCompleta(r.UrlFoto),

            // Datos del usuario (aunque sea el mismo, mantenemos consistencia de estructura)
            Usuario = new {
                Id = r.CiudadanoId,
                Nombre = r.Ciudadano?.Nombre ?? "Usuario",
                FotoPerfil = GenerarUrlCompleta(r.Ciudadano?.FotoPerfilURL)
            }
        });

        return Ok(misReportes);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error al obtener mis reportes");
        return StatusCode(500, "Error interno del servidor");
    }
}

       // GET: api/reportes/filtrar
[HttpGet("filtrar")]
public async Task<ActionResult<IEnumerable<object>>> FiltrarReportes(
    [FromQuery] string? tipo = null, 
    [FromQuery] string? estado = null)
{
    try
    {
        // 1. Construir la query
        var query = _context.Reportes
            .Include(r => r.Ciudadano) // <--- Incluir Usuario
            .AsQueryable();

        if (!string.IsNullOrEmpty(tipo))
            query = query.Where(r => r.TipoIncidente == tipo);

        if (!string.IsNullOrEmpty(estado))
            query = query.Where(r => r.Estado == estado);

        // 2. Ejecutar query en BD
        var reportesDb = await query
            .OrderByDescending(r => r.FechaCreacion)
            .ToListAsync();

        // 3. Transformar resultados (URLs completas y datos de usuario)
        var resultado = reportesDb.Select(r => new 
        {
            r.Id,
            r.TipoIncidente,
            r.DescripcionDetallada,
            r.Estado,
            r.Latitud,
            r.Longitud,
            r.FechaCreacion,

            // URL Foto Reporte
            UrlFoto = GenerarUrlCompleta(r.UrlFoto),

            // Datos Usuario
            Usuario = new {
                Id = r.CiudadanoId,
                Nombre = r.Ciudadano?.Nombre ?? "Desconocido",
                FotoPerfil = GenerarUrlCompleta(r.Ciudadano?.FotoPerfilURL)
            }
        });

        return Ok(resultado);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error al filtrar reportes");
        return StatusCode(500, "Error interno del servidor");
    }
}
       // GET: api/reportes/{id}
[HttpGet("{id}")]
public async Task<ActionResult<object>> GetReporte(int id)
{
    try
    {
        var r = await _context.Reportes
            .Include(reporte => reporte.Ciudadano) // Incluir datos del usuario
            .FirstOrDefaultAsync(m => m.Id == id);

        if (r == null)
            return NotFound("Reporte no encontrado");

        // Retornamos un objeto anónimo con las URLs procesadas
        return Ok(new 
        {
            r.Id,
            r.TipoIncidente,
            r.DescripcionDetallada,
            r.Latitud,
            r.Longitud,
            r.Estado,
            r.FechaCreacion,
            
            // URL procesada
            UrlFoto = GenerarUrlCompleta(r.UrlFoto),

            Usuario = new {
                Id = r.CiudadanoId,
                Nombre = r.Ciudadano?.Nombre ?? "Desconocido",
                FotoPerfil = GenerarUrlCompleta(r.Ciudadano?.FotoPerfilURL)
            }
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error al obtener el reporte {Id}", id);
        return StatusCode(500, "Error interno del servidor");
    }
}

        // GET: api/reportes/configuracion
        [HttpGet("configuracion")]
        public ActionResult<object> VerificarConfiguracion()
        {
            try
            {
                var webRootPath = _archivoService.GetWebRootPath();
                var uploadsPath = Path.Combine(webRootPath, "uploads");
                var uploadsExists = Directory.Exists(uploadsPath);
                
                return new
                {
                    WebRootPath = webRootPath,
                    UploadsPath = uploadsPath,
                    UploadsExists = uploadsExists,
                    CurrentDirectory = Directory.GetCurrentDirectory(),
                    CanWrite = CanWriteToDirectory(uploadsPath)
                };
            }
            catch (Exception ex)
            {
                return new { Error = ex.Message };
            }
        }

        private bool CanWriteToDirectory(string path)
        {
            try
            {
                if (!Directory.Exists(path))
                    Directory.CreateDirectory(path);
                    
                var testFile = Path.Combine(path, "test.txt");
                System.IO.File.WriteAllText(testFile, "test");
                System.IO.File.Delete(testFile);
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Método auxiliar para obtener ubicación desde el request
        private async Task<Ubicacion?> ObtenerUbicacionDesdeRequest()
        {
            try
            {
                // Opción 1: Desde headers personalizados (común en apps móviles)
                if (Request.Headers.TryGetValue("X-User-Latitude", out var latHeader) &&
                    Request.Headers.TryGetValue("X-User-Longitude", out var lonHeader))
                {
                    if (double.TryParse(latHeader, out double lat) && double.TryParse(lonHeader, out double lon))
                    {
                        return new Ubicacion { Latitud = lat, Longitud = lon };
                    }
                }

                // Opción 2: Desde IP (menos preciso, fallback)
                var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
                if (!string.IsNullOrEmpty(ip) && ip != "::1")
                {
                    // TODO: Implementar servicio de geolocalización por IP
                    // var ubicacion = await _ipGeolocationService.GetLocationAsync(ip);
                    // return ubicacion;
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener ubicación desde request");
                return null;
            }
        }

        // Eliminado duplicado de CalculateDistance; se utiliza la única implementación "CORREGIDO" definida anteriormente.
    }

    // Servicio de archivos
    public class ArchivoService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ArchivoService> _logger;

        public ArchivoService(IWebHostEnvironment environment, ILogger<ArchivoService> logger)
        {
            _environment = environment;
            _logger = logger;
            
            // Asegurar que la carpeta existe al inicializar el servicio
            EnsureUploadDirectoryExists();
        }

        private void EnsureUploadDirectoryExists()
        {
            try
            {
                var uploadsPath = Path.Combine(GetWebRootPath(), "uploads");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                    _logger.LogInformation($"Carpeta uploads creada en: {uploadsPath}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear carpeta uploads");
            }
        }

        public string GetWebRootPath()
        {
            var webRootPath = _environment.WebRootPath;
            if (string.IsNullOrEmpty(webRootPath))
            {
                webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }
            return webRootPath;
        }

        public async Task<string?> SubirArchivoAsync(IFormFile archivo, string carpetaDestino = "uploads")
        {
            if (archivo == null || archivo.Length == 0)
            {
                _logger.LogWarning("Archivo nulo o vacío");
                return null;
            }

            try
            {
                // Verificar que WebRootPath existe
                var webRootPath = GetWebRootPath();
                if (string.IsNullOrEmpty(webRootPath))
                {
                    _logger.LogError("WebRootPath no está configurado");
                    return null;
                }

                var rutaCarpeta = Path.Combine(webRootPath, carpetaDestino);
                
                // Asegurar que la carpeta existe
                if (!Directory.Exists(rutaCarpeta))
                {
                    Directory.CreateDirectory(rutaCarpeta);
                    _logger.LogInformation($"Carpeta creada: {rutaCarpeta}");
                }

                // Validar extensión del archivo
                var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
                var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
                
                if (string.IsNullOrEmpty(extension) || !extensionesPermitidas.Contains(extension))
                {
                    _logger.LogWarning($"Extensión no permitida: {extension}");
                    return null;
                }

                // Validar tamaño del archivo (5MB máximo)
                const long maxFileSize = 5 * 1024 * 1024;
                if (archivo.Length > maxFileSize)
                {
                    _logger.LogWarning($"Archivo demasiado grande: {archivo.Length} bytes");
                    return null;
                }

                // Generar nombre único
                var nombreUnico = $"{Guid.NewGuid()}{extension}";
                var rutaCompleta = Path.Combine(rutaCarpeta, nombreUnico);

                _logger.LogInformation($"Intentando guardar archivo en: {rutaCompleta}");

                // Guardar el archivo
                using (var stream = new FileStream(rutaCompleta, FileMode.Create))
                {
                    await archivo.CopyToAsync(stream);
                }

                _logger.LogInformation($"Archivo guardado exitosamente: {nombreUnico}");
                
                return $"~/{carpetaDestino}/{nombreUnico}";
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "Error de permisos al escribir en el directorio");
                return null;
            }
            catch (IOException ex)
            {
                _logger.LogError(ex, "Error de E/S al guardar el archivo");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al subir archivo");
                return null;
            }
        }

        public async Task<bool> EliminarArchivoAsync(string rutaRelativa)
        {
            try
            {
                if (string.IsNullOrEmpty(rutaRelativa))
                    return false;

                // Convertir ruta relativa a ruta física
                var rutaArchivo = rutaRelativa.Replace("~/", "");
                var rutaCompleta = Path.Combine(GetWebRootPath(), rutaArchivo);

                if (File.Exists(rutaCompleta))
                {
                    File.Delete(rutaCompleta);
                    _logger.LogInformation($"Archivo eliminado: {rutaCompleta}");
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar archivo: {Ruta}", rutaRelativa);
                return false;
            }
        }
    }

    // DTOs y clases auxiliares
    public class CrearReporteDto
    {
        public int CiudadanoId { get; set; }
        public string TipoIncidente { get; set; } = string.Empty;
        public string DescripcionDetallada { get; set; } = string.Empty;
        public double Latitud { get; set; }
        public double Longitud { get; set; }
    }

    public class CrearReporteConArchivoDto : CrearReporteDto
    {
        public IFormFile? ArchivoFoto { get; set; }
    }

    public class ActualizarReporteDto
    {
        public string DescripcionDetallada { get; set; } = string.Empty;
    }

    public class Ubicacion
    {
        public double Latitud { get; set; }
        public double Longitud { get; set; }
    }
}