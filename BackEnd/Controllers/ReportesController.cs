using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TuProyecto.Controllers
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

        // POST: api/reportes
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Reporte>> CrearReporte([FromForm] CrearReporteConArchivoDto crearReporteDto)
        {
            try
            {
                _logger.LogInformation("Iniciando creación de reporte...");

                // Validación de campos obligatorios
                if (string.IsNullOrWhiteSpace(crearReporteDto.TipoIncidente))
                    return BadRequest("El tipo de incidente es obligatorio");

                if (string.IsNullOrWhiteSpace(crearReporteDto.DescripcionDetallada))
                    return BadRequest("La descripción detallada es obligatoria");

                // Si no se proporcionan coordenadas, intentar obtener la ubicación automática
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
                        return BadRequest("No se pudo obtener la ubicación automática. Por favor, proporcione coordenadas manualmente.");
                    }
                }

                var reporte = new Reporte
                {
                    CiudadanoId = 1, // TODO: Reemplazar con ID del usuario autenticado
                    TipoIncidente = crearReporteDto.TipoIncidente,
                    DescripcionDetallada = crearReporteDto.DescripcionDetallada,
                    Latitud = latitud,
                    Longitud = longitud,
                    Estado = "Pendiente",
                    FechaCreacion = DateTime.Now
                };

                // Lógica de carga de imagen real
                if (crearReporteDto.ArchivoFoto != null && crearReporteDto.ArchivoFoto.Length > 0)
                {
                    _logger.LogInformation($"Procesando archivo: {crearReporteDto.ArchivoFoto.FileName}, Tamaño: {crearReporteDto.ArchivoFoto.Length} bytes");

                    // Validar que sea una imagen
                    var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
                    var extension = Path.GetExtension(crearReporteDto.ArchivoFoto.FileName).ToLowerInvariant();
                    
                    if (!extensionesPermitidas.Contains(extension))
                        return BadRequest("Formato de archivo no permitido. Solo se permiten imágenes JPG, JPEG, PNG, GIF, BMP o WebP.");

                    // Validar tamaño máximo (5MB)
                    const int maxFileSize = 5 * 1024 * 1024;
                    if (crearReporteDto.ArchivoFoto.Length > maxFileSize)
                        return BadRequest("El archivo es demasiado grande. El tamaño máximo permitido es 5MB.");

                    // Subir archivo usando el servicio
                    var rutaRelativa = await _archivoService.SubirArchivoAsync(crearReporteDto.ArchivoFoto, "uploads");
                    
                    if (!string.IsNullOrEmpty(rutaRelativa))
                    {
                        reporte.UrlFoto = rutaRelativa;
                        _logger.LogInformation($"Archivo subido exitosamente: {rutaRelativa}");
                    }
                    else
                    {
                        _logger.LogError("El servicio de archivos devolvió una ruta nula o vacía");
                        return StatusCode(500, "Error al subir la imagen - No se pudo guardar el archivo en el servidor");
                    }
                }
                else
                {
                    _logger.LogInformation("No se proporcionó archivo o está vacío");
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
[HttpGet("cercanos")]
public async Task<ActionResult<IEnumerable<object>>> GetReportesCercanos(
    [FromQuery] double? latitud = null, 
    [FromQuery] double? longitud = null, 
    [FromQuery] double radioMetros = 500)
{
    try
    {
        _logger.LogInformation("Buscando reportes cercanos...");

        // Si no se proporcionan coordenadas, usar la ubicación actual del usuario
        double userLatitud = latitud ?? 0;
        double userLongitud = longitud ?? 0;

        if (userLatitud == 0 || userLongitud == 0)
        {
            var ubicacionActual = await ObtenerUbicacionDesdeRequest();
            if (ubicacionActual != null)
            {
                userLatitud = ubicacionActual.Latitud;
                userLongitud = ubicacionActual.Longitud;
                _logger.LogInformation($"Usando ubicación automática: {userLatitud}, {userLongitud}");
            }
            else
            {
                _logger.LogWarning("No se pudo determinar la ubicación actual");
                return BadRequest("No se pudo determinar la ubicación actual. Proporcione coordenadas manualmente.");
            }
        }
        else
        {
            _logger.LogInformation($"Usando coordenadas proporcionadas: {userLatitud}, {userLongitud}");
        }

        // Fórmula Haversine aproximada para filtrar reportes cercanos
        const double GRADOS_POR_KILOMETRO = 0.009;
        var radioGrados = radioMetros / 1000 * GRADOS_POR_KILOMETRO;

        _logger.LogInformation($"Radio de búsqueda: {radioMetros} metros ({radioGrados} grados)");

        // Primero obtener todos los reportes en el área aproximada
        var reportesEnArea = await _context.Reportes
            .Where(r => 
                r.Latitud >= userLatitud - radioGrados &&
                r.Latitud <= userLatitud + radioGrados &&
                r.Longitud >= userLongitud - radioGrados &&
                r.Longitud <= userLongitud + radioGrados)
            .Select(r => new
            {
                r.Id,
                r.TipoIncidente,
                r.Estado,
                r.Latitud,
                r.Longitud,
                r.UrlFoto,
                r.FechaCreacion
            })
            .ToListAsync();

        _logger.LogInformation($"Encontrados {reportesEnArea.Count} reportes en área aproximada");

        // Luego calcular distancias exactas en memoria
        var reportesCercanos = reportesEnArea
            .Select(r => new
            {
                r.Id,
                r.TipoIncidente,
                r.Estado,
                r.Latitud,
                r.Longitud,
                r.UrlFoto,
                r.FechaCreacion,
                DistanciaMetros = CalculateDistance(userLatitud, userLongitud, r.Latitud, r.Longitud)
            })
            .Where(r => r.DistanciaMetros <= radioMetros)
            .OrderBy(r => r.DistanciaMetros)
            .ToList();

        _logger.LogInformation($"Encontrados {reportesCercanos.Count} reportes dentro del radio de {radioMetros} metros");

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
        _logger.LogError(ex, "Error al obtener reportes cercanos. Detalles: {Message}", ex.Message);
        return StatusCode(500, $"Error interno del servidor: {ex.Message}");
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
                var ciudadanoId = 1; // TODO: Reemplazar con ID del usuario autenticado

                var misReportes = await _context.Reportes
                    .Where(r => r.CiudadanoId == ciudadanoId)
                    .OrderByDescending(r => r.FechaCreacion)
                    .Select(r => new
                    {
                        r.Id,
                        r.DescripcionDetallada,
                        r.FechaCreacion,
                        r.Estado,
                        r.TipoIncidente,
                        r.Latitud,
                        r.Longitud,
                        r.UrlFoto
                    })
                    .ToListAsync();

                return Ok(misReportes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener mis reportes");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // GET: api/reportes/filtrar?tipo=Bache&estado=Pendiente
        [HttpGet("filtrar")]
        public async Task<ActionResult<IEnumerable<Reporte>>> FiltrarReportes(
            [FromQuery] string? tipo = null, 
            [FromQuery] string? estado = null)
        {
            try
            {
                var query = _context.Reportes.AsQueryable();

                if (!string.IsNullOrEmpty(tipo))
                    query = query.Where(r => r.TipoIncidente == tipo);

                if (!string.IsNullOrEmpty(estado))
                    query = query.Where(r => r.Estado == estado);

                var reportesFiltrados = await query
                    .OrderByDescending(r => r.FechaCreacion)
                    .ToListAsync();

                return Ok(reportesFiltrados);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al filtrar reportes");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // GET: api/reportes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Reporte>> GetReporte(int id)
        {
            try
            {
                var reporte = await _context.Reportes.FindAsync(id);
                if (reporte == null)
                    return NotFound();

                return reporte;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener reporte {Id}", id);
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