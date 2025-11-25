using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using BackEnd.Model;
using System.Security.Claims;

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
                var reportesDb = await _context.Reportes
                    .Include(r => r.Ciudadano)
                    .OrderByDescending(r => r.FechaCreacion)
                    .ToListAsync();

                var reportesConUrl = reportesDb.Select(r => new
                {
                    r.Id,
                    r.TipoIncidente,
                    r.DescripcionDetallada,
                    r.Latitud,
                    r.Longitud,
                    r.Estado,
                    r.FechaCreacion,
                    UrlFoto = GenerarUrlCompleta(r.UrlFoto),
                    Usuario = new {
                        Id = r.CiudadanoId,
                        Nombre = r.Ciudadano?.Nombre ?? "Usuario Desconocido",
                        FotoPerfil = GenerarUrlCompleta(r.Ciudadano?.FotoPerfilURL),
                        Puntos = r.Ciudadano?.Puntos ?? 0
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

                // 2. VALIDACIÓN DE USUARIO
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
                const double GRADOS_APROX_50M = 0.00045;
                
                var reportesCercanosDB = await _context.Reportes
                    .Where(r => 
                        r.Latitud >= latitud - GRADOS_APROX_50M &&
                        r.Latitud <= latitud + GRADOS_APROX_50M &&
                        r.Longitud >= longitud - GRADOS_APROX_50M &&
                        r.Longitud <= longitud + GRADOS_APROX_50M &&
                        r.Estado != "Resuelto")
                    .ToListAsync();

                foreach (var rep in reportesCercanosDB)
                {
                    var distancia = CalculateDistance(latitud, longitud, rep.Latitud, rep.Longitud);
                    if (distancia <= 50)
                    {
                        return Conflict(new { 
                            mensaje = "Ya existe un reporte similar en esta ubicación (radio de 50m).",
                            reporteExistenteId = rep.Id 
                        });
                    }
                }

                // 5. CREACIÓN DEL OBJETO - CAMBIO DE ESTADO A "EnValidacion"
                var reporte = new Reporte
                {
                    CiudadanoId = crearReporteDto.CiudadanoId,
                    TipoIncidente = crearReporteDto.TipoIncidente,
                    DescripcionDetallada = crearReporteDto.DescripcionDetallada,
                    Latitud = latitud,
                    Longitud = longitud,
                    Estado = "EnValidacion",
                    FechaCreacion = DateTime.Now
                };

                // 6. LÓGICA DE IMAGEN
                if (crearReporteDto.ArchivoFoto != null && crearReporteDto.ArchivoFoto.Length > 0)
                {
                    var rutaRelativa = await _archivoService.SubirArchivoAsync(crearReporteDto.ArchivoFoto, "uploads");
                    if (!string.IsNullOrEmpty(rutaRelativa)) reporte.UrlFoto = rutaRelativa;
                }

                _context.Reportes.Add(reporte);
                // Otorgar +10 puntos al creador del reporte
var creadorReporte = await _context.Users.FindAsync(crearReporteDto.CiudadanoId);
if (creadorReporte != null)
{
    creadorReporte.Puntos += 10;
}
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

        // GET: api/reportes/porvalidar/{idCiudadano}
        [HttpGet("porvalidar/{idCiudadano}")]
        public async Task<ActionResult<IEnumerable<object>>> GetReportesPorValidar(int idCiudadano)
        {
            try
            {
                // 1. Obtener IDs de reportes que el ciudadano ya validó
                var reportesYaValidados = await _context.ReporteValidaciones
                    .Where(rv => rv.CiudadanoId == idCiudadano)
                    .Select(rv => rv.ReporteId)
                    .ToListAsync();

                // 2. Traer reportes en validación que no sean del usuario y que no haya validado
                var reportesDb = await _context.Reportes
                    .Include(r => r.Ciudadano)
                    .Where(r => r.Estado == "EnValidacion" && 
                           r.CiudadanoId != idCiudadano &&
                           !reportesYaValidados.Contains(r.Id))
                    .OrderByDescending(r => r.FechaCreacion)
                    .ToListAsync();

                // 3. Formatear respuesta
                var reportesConUrl = reportesDb.Select(r => new
                {
                    r.Id,
                    r.TipoIncidente,
                    r.DescripcionDetallada,
                    r.Latitud,
                    r.Longitud,
                    r.Estado,
                    r.FechaCreacion,
                    UrlFoto = GenerarUrlCompleta(r.UrlFoto),
                    Usuario = new {
                        Id = r.CiudadanoId,
                        Nombre = r.Ciudadano?.Nombre ?? "Usuario Desconocido",
                        FotoPerfil = GenerarUrlCompleta(r.Ciudadano?.FotoPerfilURL),
                        Puntos = r.Ciudadano?.Puntos ?? 0
                    }
                });

                return Ok(reportesConUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener reportes por validar");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // POST: api/reportes/validar
[HttpPost("validar")]
public async Task<IActionResult> ValidarReporte([FromBody] ValidacionDto validacionDto)
{
    try
    {
        // 1. Verificar que el reporte exista y esté en validación
        var reporte = await _context.Reportes
            .FirstOrDefaultAsync(r => r.Id == validacionDto.ReporteId && r.Estado == "EnValidacion");
        
        if (reporte == null)
            return BadRequest("El reporte no existe o no está en validación.");

        // 2. Verificar que el ciudadano no sea el creador del reporte
        if (reporte.CiudadanoId == validacionDto.CiudadanoId)
            return BadRequest("No puedes validar tu propio reporte.");

        // 3. Verificar que el ciudadano no haya validado previamente este reporte
        var validacionExistente = await _context.ReporteValidaciones
            .FirstOrDefaultAsync(rv => rv.ReporteId == validacionDto.ReporteId && 
                                    rv.CiudadanoId == validacionDto.CiudadanoId);
        
        if (validacionExistente != null)
            return BadRequest("Ya has validado este reporte.");

        // 4. Registrar la nueva validación
        var validacion = new ReporteValidacion
        {
            ReporteId = validacionDto.ReporteId,
            CiudadanoId = validacionDto.CiudadanoId,
            EsPositiva = validacionDto.EsPositiva,
            FechaValidacion = DateTime.Now
        };
        _context.ReporteValidaciones.Add(validacion);

        // 5. Otorgar +5 puntos al ciudadano que valida
        var ciudadanoValidador = await _context.Users.FindAsync(validacionDto.CiudadanoId);
        if (ciudadanoValidador != null)
        {
            ciudadanoValidador.Puntos += 5;
        }

        // **CORRECCIÓN: Guardar cambios ANTES de contar las validaciones**
        await _context.SaveChangesAsync();

        // 6. Contar validaciones positivas y negativas (AHORA INCLUYE LA NUEVA VALIDACIÓN)
        var validacionesReporte = await _context.ReporteValidaciones
            .Where(rv => rv.ReporteId == validacionDto.ReporteId)
            .ToListAsync();

        int validacionesPositivas = validacionesReporte.Count(v => v.EsPositiva);
        int validacionesNegativas = validacionesReporte.Count(v => !v.EsPositiva);

        // 7. Aplicar lógica de cambio de estado y puntos
        bool cambioEstado = false;
        if (validacionesPositivas >= 10)
        {
            reporte.Estado = "Validado";
            cambioEstado = true;
            // Otorgar +10 puntos al creador del reporte
            var creadorReporte = await _context.Users.FindAsync(reporte.CiudadanoId);
            if (creadorReporte != null)
            {
                creadorReporte.Puntos += 5;
            }
        }
        else if (validacionesNegativas >= 10)
        {
            reporte.Estado = "Rechazado";
            cambioEstado = true;
            // Restar -15 puntos al creador del reporte
            var creadorReporte = await _context.Users.FindAsync(reporte.CiudadanoId);
            if (creadorReporte != null)
            {
                creadorReporte.Puntos -= 10;
                if (creadorReporte.Puntos < 0) creadorReporte.Puntos = 0;
            }
        }

        // **CORRECCIÓN: Guardar cambios solo si hubo cambio de estado**
        if (cambioEstado)
        {
            await _context.SaveChangesAsync();
        }

        return Ok(new { 
            Mensaje = "Validación registrada correctamente",
            PuntosOtorgados = 5,
            EstadoActual = reporte.Estado,
            ValidacionesPositivas = validacionesPositivas,
            ValidacionesNegativas = validacionesNegativas
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error al validar reporte");
        return StatusCode(500, "Error interno del servidor");
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

                // Solo permitir edición si el estado es "Pendiente" o "EnValidacion"
                if (reporte.Estado != "Pendiente" && reporte.Estado != "EnValidacion")
                    return BadRequest("Solo se pueden editar reportes en estado 'Pendiente' o 'EnValidacion'");

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

var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
if (reporte.CiudadanoId != userId)
    return Forbid("No tiene permisos para eliminar este reporte");

                if (reporte.Estado != "Pendiente" && reporte.Estado != "EnValidacion")
                    return BadRequest("Solo se pueden eliminar reportes en estado 'Pendiente' o 'EnValidacion'");

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
                // 1. Determinar ubicación del usuario
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
                    .Include(r => r.Ciudadano)
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
                            FotoPerfil = GenerarUrlCompleta(r.Ciudadano?.FotoPerfilURL),
                            Puntos = r.Ciudadano?.Puntos ?? 0
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

        // GET: api/reportes/misreportes/{id}
        [HttpGet("misreportes/{id}")]
        public async Task<ActionResult<IEnumerable<object>>> GetMisReportes(int id)
        {
            try
            {
                // 1. Verificar primero si el usuario existe
                var usuarioExiste = await _context.Users.AnyAsync(u => u.Id == id);
                if (!usuarioExiste)
                {
                    return NotFound($"No se encontró ningún usuario con el ID {id}");
                }

                // 2. Buscar los reportes vinculados a esa ID
                var reportesDb = await _context.Reportes
                    .Include(r => r.Ciudadano)
                    .Where(r => r.CiudadanoId == id)
                    .OrderByDescending(r => r.FechaCreacion)
                    .ToListAsync();

                // 3. Formatear la respuesta con URLs completas
                var misReportes = reportesDb.Select(r => new
                {
                    r.Id,
                    r.TipoIncidente,
                    r.DescripcionDetallada,
                    r.Latitud,
                    r.Longitud,
                    r.Estado,
                    r.FechaCreacion,
                    
                    // Generar URL completa para la imagen
                    UrlFoto = GenerarUrlCompleta(r.UrlFoto),

                    // Datos del usuario
                    Usuario = new {
                        Id = r.CiudadanoId,
                        Nombre = r.Ciudadano?.Nombre ?? "Usuario",
                        FotoPerfil = GenerarUrlCompleta(r.Ciudadano?.FotoPerfilURL),
                        Puntos = r.Ciudadano?.Puntos ?? 0
                    }
                });

                return Ok(misReportes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los reportes del usuario {Id}", id);
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
                    .Include(r => r.Ciudadano)
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
                        FotoPerfil = GenerarUrlCompleta(r.Ciudadano?.FotoPerfilURL),
                        Puntos = r.Ciudadano?.Puntos ?? 0
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
                    .Include(reporte => reporte.Ciudadano)
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
                        FotoPerfil = GenerarUrlCompleta(r.Ciudadano?.FotoPerfilURL),
                        Puntos = r.Ciudadano?.Puntos ?? 0
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

        // MÉTODOS AUXILIARES
        private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            try
            {
                if (double.IsNaN(lat1) || double.IsNaN(lon1) || double.IsNaN(lat2) || double.IsNaN(lon2))
                {
                    return double.MaxValue;
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

        private string? GenerarUrlCompleta(string? rutaRelativa)
        {
            if (string.IsNullOrEmpty(rutaRelativa)) return null;

            var rutaLimpia = rutaRelativa.Replace("~/", "").Replace("\\", "/");
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            return $"{baseUrl}/{rutaLimpia}";
        }

        private static double ToRadians(double degrees)
        {
            return degrees * Math.PI / 180;
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

        private async Task<Ubicacion?> ObtenerUbicacionDesdeRequest()
        {
            try
            {
                // Opción 1: Desde headers personalizados
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
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener ubicación desde request");
                return null;
            }
        }
    }

    // SERVICIO DE ARCHIVOS
    public class ArchivoService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ArchivoService> _logger;

        public ArchivoService(IWebHostEnvironment environment, ILogger<ArchivoService> logger)
        {
            _environment = environment;
            _logger = logger;
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
                var webRootPath = GetWebRootPath();
                if (string.IsNullOrEmpty(webRootPath))
                {
                    _logger.LogError("WebRootPath no está configurado");
                    return null;
                }

                var rutaCarpeta = Path.Combine(webRootPath, carpetaDestino);
                
                if (!Directory.Exists(rutaCarpeta))
                {
                    Directory.CreateDirectory(rutaCarpeta);
                    _logger.LogInformation($"Carpeta creada: {rutaCarpeta}");
                }

                var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
                var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
                
                if (string.IsNullOrEmpty(extension) || !extensionesPermitidas.Contains(extension))
                {
                    _logger.LogWarning($"Extensión no permitida: {extension}");
                    return null;
                }

                const long maxFileSize = 5 * 1024 * 1024;
                if (archivo.Length > maxFileSize)
                {
                    _logger.LogWarning($"Archivo demasiado grande: {archivo.Length} bytes");
                    return null;
                }

                var nombreUnico = $"{Guid.NewGuid()}{extension}";
                var rutaCompleta = Path.Combine(rutaCarpeta, nombreUnico);

                _logger.LogInformation($"Intentando guardar archivo en: {rutaCompleta}");

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

    // DTOs Y CLASES AUXILIARES
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

    // NUEVO DTO PARA VALIDACIÓN
    public class ValidacionDto
    {
        public int ReporteId { get; set; }
        public int CiudadanoId { get; set; }
        public bool EsPositiva { get; set; } // true = Positiva, false = Negativa
    }
}