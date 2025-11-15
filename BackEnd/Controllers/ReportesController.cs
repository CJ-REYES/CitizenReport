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

        public ReportesController(MyDbContext context, ILogger<ReportesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // POST: api/reportes
        [HttpPost]
        public async Task<ActionResult<Reporte>> CrearReporte(CrearReporteDto crearReporteDto)
        {
            try
            {
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
                    // En una implementación real, esto vendría del frontend via headers o DTO
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

                // TODO: Aquí se ejecutaría la lógica de carga de imagen a AWS S3
                // if (!string.IsNullOrEmpty(crearReporteDto.UrlFotoTemp))
                // {
                //     reporte.UrlFoto = await _s3Service.UploadImageAsync(crearReporteDto.UrlFotoTemp);
                // }

                _context.Reportes.Add(reporte);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetReporte), new { id = reporte.Id }, reporte);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear reporte");
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
                    }
                    else
                    {
                        return BadRequest("No se pudo determinar la ubicación actual. Proporcione coordenadas manualmente.");
                    }
                }

                // Fórmula Haversine aproximada para filtrar reportes cercanos
                const double GRADOS_POR_KILOMETRO = 0.009;

                var radioGrados = radioMetros / 1000 * GRADOS_POR_KILOMETRO;

                var reportesCercanos = await _context.Reportes
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
                        DistanciaMetros = CalculateDistance(userLatitud, userLongitud, r.Latitud, r.Longitud)
                    })
                    .Where(r => r.DistanciaMetros <= radioMetros)
                    .OrderBy(r => r.DistanciaMetros)
                    .ToListAsync();

                return Ok(new 
                { 
                    UbicacionConsulta = new { Latitud = userLatitud, Longitud = userLongitud },
                    RadioMetros = radioMetros,
                    Reportes = reportesCercanos 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener reportes cercanos");
                return StatusCode(500, "Error interno del servidor");
            }
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
                        r.Longitud
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

        // Método auxiliar para calcular distancia usando fórmula Haversine
        private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371000; // Radio de la Tierra en metros
            var dLat = (lat2 - lat1) * Math.PI / 180;
            var dLon = (lon2 - lon1) * Math.PI / 180;
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }
    }

    // DTOs y clases auxiliares
    public class CrearReporteDto
    {
        public string TipoIncidente { get; set; } = string.Empty;
        public string DescripcionDetallada { get; set; } = string.Empty;
        public double Latitud { get; set; }
        public double Longitud { get; set; }
        public string? UrlFoto { get; set; }
        public string? UrlFotoTemp { get; set; }
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