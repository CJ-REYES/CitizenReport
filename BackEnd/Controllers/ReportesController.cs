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
                var reportesDb = await _context.Reportes
                    .Include(r => r.Ciudadano)
                    .OrderByDescending(r => r.FechaCreacion)
                    .ToListAsync();

                var reportesConUrl = reportesDb.Select(r => new
                {
                    r.Id,
                    r.TipoIncidente,
                    r.Colonia, // Agregado al GET
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

                // --- VALIDACIÓN DE COLONIA ---
                if (string.IsNullOrWhiteSpace(crearReporteDto.Colonia))
                    return BadRequest("La colonia es obligatoria");
                // -----------------------------

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

                // 5. CREACIÓN DEL OBJETO
                var reporte = new Reporte
                {
                    CiudadanoId = crearReporteDto.CiudadanoId,
                    TipoIncidente = crearReporteDto.TipoIncidente,
                    Colonia = crearReporteDto.Colonia, // Guardar Colonia
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
                var reportesYaValidados = await _context.ReporteValidaciones
                    .Where(rv => rv.CiudadanoId == idCiudadano)
                    .Select(rv => rv.ReporteId)
                    .ToListAsync();

                var reportesDb = await _context.Reportes
                    .Include(r => r.Ciudadano)
                    .Where(r => r.Estado == "EnValidacion" && 
                           r.CiudadanoId != idCiudadano &&
                           !reportesYaValidados.Contains(r.Id))
                    .OrderByDescending(r => r.FechaCreacion)
                    .ToListAsync();

                var reportesConUrl = reportesDb.Select(r => new
                {
                    r.Id,
                    r.TipoIncidente,
                    r.Colonia, // Agregado
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
                var reporte = await _context.Reportes
                    .FirstOrDefaultAsync(r => r.Id == validacionDto.ReporteId && r.Estado == "EnValidacion");
                
                if (reporte == null)
                    return BadRequest("El reporte no existe o no está en validación.");

                if (reporte.CiudadanoId == validacionDto.CiudadanoId)
                    return BadRequest("No puedes validar tu propio reporte.");

                var validacionExistente = await _context.ReporteValidaciones
                    .FirstOrDefaultAsync(rv => rv.ReporteId == validacionDto.ReporteId && 
                                            rv.CiudadanoId == validacionDto.CiudadanoId);
                
                if (validacionExistente != null)
                    return BadRequest("Ya has validado este reporte.");

                var validacion = new ReporteValidacion
                {
                    ReporteId = validacionDto.ReporteId,
                    CiudadanoId = validacionDto.CiudadanoId,
                    EsPositiva = validacionDto.EsPositiva,
                    FechaValidacion = DateTime.Now
                };
                _context.ReporteValidaciones.Add(validacion);

                var ciudadanoValidador = await _context.Users.FindAsync(validacionDto.CiudadanoId);
                if (ciudadanoValidador != null)
                {
                    ciudadanoValidador.Puntos += 5;
                }

                await _context.SaveChangesAsync();

                var validacionesReporte = await _context.ReporteValidaciones
                    .Where(rv => rv.ReporteId == validacionDto.ReporteId)
                    .ToListAsync();

                int validacionesPositivas = validacionesReporte.Count(v => v.EsPositiva);
                int validacionesNegativas = validacionesReporte.Count(v => !v.EsPositiva);

                bool cambioEstado = false;
                if (validacionesPositivas >= 10)
                {
                    reporte.Estado = "Validado";
                    cambioEstado = true;
                    var creadorReporte = await _context.Users.FindAsync(reporte.CiudadanoId);
                    if (creadorReporte != null) creadorReporte.Puntos += 5;
                }
                else if (validacionesNegativas >= 10)
                {
                    reporte.Estado = "Rechazado";
                    cambioEstado = true;
                    var creadorReporte = await _context.Users.FindAsync(reporte.CiudadanoId);
                    if (creadorReporte != null)
                    {
                        creadorReporte.Puntos -= 10;
                        if (creadorReporte.Puntos < 0) creadorReporte.Puntos = 0;
                    }
                }

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
                if (reporte == null) return NotFound();

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
                if (reporte == null) return NotFound();

                // Nota: Asumiendo que validas el usuario en otro lado o middleware
                // if (reporte.CiudadanoId != usuarioAutenticadoId) return Forbid();

                if (reporte.Estado != "Pendiente" && reporte.Estado != "EnValidacion")
                    return BadRequest("Solo se pueden eliminar reportes en estado 'Pendiente' o 'EnValidacion'");

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
// GET: api/reportes/colonia-mas-alumbrado
[HttpGet("colonia-mas-alumbrado")]
public async Task<ActionResult<object>> GetColoniaConMasAlumbradoPublico()
{
    try
    {
        var coloniasAlumbrado = await _context.Reportes
            .Where(r => r.TipoIncidente == "Alumbrado público" || r.TipoIncidente == "Alumbrado")
            .Where(r => !string.IsNullOrEmpty(r.Colonia)) // Solo colonias con nombre
            .GroupBy(r => r.Colonia)
            .Select(g => new
            {
                Colonia = g.Key,
                TotalReportes = g.Count()
            })
            .OrderByDescending(x => x.TotalReportes)
            .ToListAsync();

        var coloniaMasAlumbrado = coloniasAlumbrado.FirstOrDefault();

        if (coloniaMasAlumbrado == null)
        {
            // Verificar si hay reportes de alumbrado pero sin colonia asignada
            var totalAlumbradoSinColonia = await _context.Reportes
                .CountAsync(r => (r.TipoIncidente == "Alumbrado público" || r.TipoIncidente == "Alumbrado") 
                              && string.IsNullOrEmpty(r.Colonia));

            if (totalAlumbradoSinColonia > 0)
            {
                return Ok(new
                {
                    ColoniaMasAlumbrado = "Colonia no especificada",
                    TotalReportesAlumbrado = totalAlumbradoSinColonia
                });
            }

            return Ok(new
            {
                ColoniaMasAlumbrado = "Sin reportes",
                TotalReportesAlumbrado = 0
            });
        }

        return Ok(new
        {
            ColoniaMasAlumbrado = coloniaMasAlumbrado.Colonia,
            TotalReportesAlumbrado = coloniaMasAlumbrado.TotalReportes
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error al obtener la colonia con más alumbrado público");
        return StatusCode(500, "Error interno del servidor");
    }
}

// GET: api/reportes/colonia-mas-baches
[HttpGet("colonia-mas-baches")]
public async Task<ActionResult<object>> GetColoniaConMasBaches()
{
    try
    {
        var coloniasBaches = await _context.Reportes
            .Where(r => r.TipoIncidente == "Baches")
            .Where(r => !string.IsNullOrEmpty(r.Colonia)) // Solo colonias con nombre
            .GroupBy(r => r.Colonia)
            .Select(g => new
            {
                Colonia = g.Key,
                TotalReportes = g.Count()
            })
            .OrderByDescending(x => x.TotalReportes)
            .ToListAsync();

        var coloniaMasBaches = coloniasBaches.FirstOrDefault();

        if (coloniaMasBaches == null)
        {
            // Verificar si hay reportes de baches pero sin colonia asignada
            var totalBachesSinColonia = await _context.Reportes
                .CountAsync(r => r.TipoIncidente == "Baches" && string.IsNullOrEmpty(r.Colonia));

            if (totalBachesSinColonia > 0)
            {
                return Ok(new
                {
                    ColoniaMasBaches = "Colonia no especificada",
                    TotalReportesBaches = totalBachesSinColonia
                });
            }

            return Ok(new
            {
                ColoniaMasBaches = "Sin reportes",
                TotalReportesBaches = 0
            });
        }

        return Ok(new
        {
            ColoniaMasBaches = coloniaMasBaches.Colonia,
            TotalReportesBaches = coloniaMasBaches.TotalReportes
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error al obtener la colonia con más baches");
        return StatusCode(500, "Error interno del servidor");
    }
}

// GET: api/reportes/colonia-mas-danos
[HttpGet("colonia-mas-danos")]
public async Task<ActionResult<object>> GetColoniaConMasDanos()
{
    try
    {
        var todasLasColonias = await _context.Reportes
            .Where(r => !string.IsNullOrEmpty(r.Colonia)) // Solo colonias con nombre
            .GroupBy(r => r.Colonia)
            .Select(g => new
            {
                Colonia = g.Key,
                TotalReportes = g.Count()
            })
            .OrderByDescending(x => x.TotalReportes)
            .ToListAsync();

        var coloniaMasDanos = todasLasColonias.FirstOrDefault();

        if (coloniaMasDanos == null)
        {
            // Verificar si hay reportes pero sin colonia asignada
            var totalReportesSinColonia = await _context.Reportes
                .CountAsync(r => string.IsNullOrEmpty(r.Colonia));

            if (totalReportesSinColonia > 0)
            {
                return Ok(new
                {
                    ColoniaMasDanos = "Colonia no especificada",
                    TotalReportes = totalReportesSinColonia
                });
            }

            return Ok(new
            {
                ColoniaMasDanos = "Sin reportes",
                TotalReportes = 0
            });
        }

        return Ok(new
        {
            ColoniaMasDanos = coloniaMasDanos.Colonia,
            TotalReportes = coloniaMasDanos.TotalReportes
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error al obtener la colonia con más daños");
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

                const double GRADOS_POR_KILOMETRO = 0.009;
                var radioGrados = radioMetros / 1000 * GRADOS_POR_KILOMETRO;

                var reportesEnArea = await _context.Reportes
                    .Include(r => r.Ciudadano)
                    .Where(r => 
                        r.Latitud >= userLatitud - radioGrados &&
                        r.Latitud <= userLatitud + radioGrados &&
                        r.Longitud >= userLongitud - radioGrados &&
                        r.Longitud <= userLongitud + radioGrados)
                    .ToListAsync();

                var reportesCercanos = reportesEnArea
                    .Select(r => new
                    {
                        r.Id,
                        r.TipoIncidente,
                        r.Colonia, // Agregado
                        r.Estado,
                        r.Latitud,
                        r.Longitud,
                        r.DescripcionDetallada,
                        r.FechaCreacion,
                        UrlFoto = GenerarUrlCompleta(r.UrlFoto), 
                        Usuario = new {
                            Id = r.CiudadanoId,
                            Nombre = r.Ciudadano?.Nombre ?? "Desconocido",
                            FotoPerfil = GenerarUrlCompleta(r.Ciudadano?.FotoPerfilURL),
                            Puntos = r.Ciudadano?.Puntos ?? 0
                        },
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
                var usuarioExiste = await _context.Users.AnyAsync(u => u.Id == id);
                if (!usuarioExiste) return NotFound($"No se encontró usuario con ID {id}");

                var reportesDb = await _context.Reportes
                    .Include(r => r.Ciudadano)
                    .Where(r => r.CiudadanoId == id)
                    .OrderByDescending(r => r.FechaCreacion)
                    .ToListAsync();

                var misReportes = reportesDb.Select(r => new
                {
                    r.Id,
                    r.TipoIncidente,
                    r.Colonia, // Agregado
                    r.DescripcionDetallada,
                    r.Latitud,
                    r.Longitud,
                    r.Estado,
                    r.FechaCreacion,
                    UrlFoto = GenerarUrlCompleta(r.UrlFoto),
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
                var query = _context.Reportes
                    .Include(r => r.Ciudadano)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(tipo))
                    query = query.Where(r => r.TipoIncidente == tipo);

                if (!string.IsNullOrEmpty(estado))
                    query = query.Where(r => r.Estado == estado);

                var reportesDb = await query
                    .OrderByDescending(r => r.FechaCreacion)
                    .ToListAsync();

                var resultado = reportesDb.Select(r => new 
                {
                    r.Id,
                    r.TipoIncidente,
                    r.Colonia, // Agregado
                    r.DescripcionDetallada,
                    r.Estado,
                    r.Latitud,
                    r.Longitud,
                    r.FechaCreacion,
                    UrlFoto = GenerarUrlCompleta(r.UrlFoto),
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

                if (r == null) return NotFound("Reporte no encontrado");

                return Ok(new 
                {
                    r.Id,
                    r.TipoIncidente,
                    r.Colonia, // Agregado
                    r.DescripcionDetallada,
                    r.Latitud,
                    r.Longitud,
                    r.Estado,
                    r.FechaCreacion,
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
                return new
                {
                    WebRootPath = webRootPath,
                    UploadsPath = uploadsPath,
                    UploadsExists = Directory.Exists(uploadsPath),
                    CurrentDirectory = Directory.GetCurrentDirectory(),
                    CanWrite = CanWriteToDirectory(uploadsPath)
                };
            }
            catch (Exception ex)
            {
                return new { Error = ex.Message };
            }
        }

        // --- MÉTODOS PRIVADOS AUXILIARES ---
        private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            try
            {
                if (double.IsNaN(lat1) || double.IsNaN(lon1) || double.IsNaN(lat2) || double.IsNaN(lon2))
                    return double.MaxValue;

                const double R = 6371000;
                var dLat = ToRadians(lat2 - lat1);
                var dLon = ToRadians(lon2 - lon1);
                var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                        Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                        Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
                var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
                return R * c;
            }
            catch { return double.MaxValue; }
        }

        private string? GenerarUrlCompleta(string? rutaRelativa)
        {
            if (string.IsNullOrEmpty(rutaRelativa)) return null;
            var rutaLimpia = rutaRelativa.Replace("~/", "").Replace("\\", "/");
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            return $"{baseUrl}/{rutaLimpia}";
        }

        private static double ToRadians(double degrees) => degrees * Math.PI / 180;

        private bool CanWriteToDirectory(string path)
        {
            try
            {
                if (!Directory.Exists(path)) Directory.CreateDirectory(path);
                var testFile = Path.Combine(path, "test.txt");
                System.IO.File.WriteAllText(testFile, "test");
                System.IO.File.Delete(testFile);
                return true;
            }
            catch { return false; }
        }

        private async Task<Ubicacion?> ObtenerUbicacionDesdeRequest()
        {
            try
            {
                if (Request.Headers.TryGetValue("X-User-Latitude", out var latHeader) &&
                    Request.Headers.TryGetValue("X-User-Longitude", out var lonHeader))
                {
                    if (double.TryParse(latHeader, out double lat) && double.TryParse(lonHeader, out double lon))
                        return new Ubicacion { Latitud = lat, Longitud = lon };
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

    // --- SERVICIOS Y DTOS ---

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
                if (!Directory.Exists(uploadsPath)) Directory.CreateDirectory(uploadsPath);
            }
            catch (Exception ex) { _logger.LogError(ex, "Error al crear carpeta uploads"); }
        }

        public string GetWebRootPath()
        {
            var webRootPath = _environment.WebRootPath;
            if (string.IsNullOrEmpty(webRootPath))
                webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            return webRootPath;
        }

        public async Task<string?> SubirArchivoAsync(IFormFile archivo, string carpetaDestino = "uploads")
        {
            if (archivo == null || archivo.Length == 0) return null;
            try
            {
                var webRootPath = GetWebRootPath();
                var rutaCarpeta = Path.Combine(webRootPath, carpetaDestino);
                if (!Directory.Exists(rutaCarpeta)) Directory.CreateDirectory(rutaCarpeta);

                var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
                var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
                if (string.IsNullOrEmpty(extension) || !extensionesPermitidas.Contains(extension)) return null;

                if (archivo.Length > 5 * 1024 * 1024) return null;

                var nombreUnico = $"{Guid.NewGuid()}{extension}";
                var rutaCompleta = Path.Combine(rutaCarpeta, nombreUnico);

                using (var stream = new FileStream(rutaCompleta, FileMode.Create))
                {
                    await archivo.CopyToAsync(stream);
                }
                return $"~/{carpetaDestino}/{nombreUnico}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al subir archivo");
                return null;
            }
        }

        public async Task<bool> EliminarArchivoAsync(string rutaRelativa)
        {
            try
            {
                if (string.IsNullOrEmpty(rutaRelativa)) return false;
                var rutaArchivo = rutaRelativa.Replace("~/", "");
                var rutaCompleta = Path.Combine(GetWebRootPath(), rutaArchivo);
                if (File.Exists(rutaCompleta))
                {
                    File.Delete(rutaCompleta);
                    return true;
                }
                return false;
            }
            catch { return false; }
        }
    }

    public class CrearReporteDto
    {
        public int CiudadanoId { get; set; }
        public string TipoIncidente { get; set; } = string.Empty;
        
        // --- NUEVO CAMPO EN DTO ---
        public string Colonia { get; set; } = string.Empty;
        // --------------------------

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

    public class ValidacionDto
    {
        public int ReporteId { get; set; }
        public int CiudadanoId { get; set; }
        public bool EsPositiva { get; set; } 
    }
}