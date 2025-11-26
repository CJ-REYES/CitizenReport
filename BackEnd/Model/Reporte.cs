using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BackEnd.Model;

public class Reporte
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int CiudadanoId { get; set; }

    // Propiedad de navegación
    [ForeignKey("CiudadanoId")]
    public User? Ciudadano { get; set; }

    [Required]
    [MaxLength(100)]
    public string TipoIncidente { get; set; } = string.Empty;

    // --- NUEVO CAMPO ---
    [Required]
    [MaxLength(100)]
    public string Colonia { get; set; } = string.Empty;
    // -------------------

    [Required]
    public string DescripcionDetallada { get; set; } = string.Empty;

    [Required]
    public double Latitud { get; set; }

    [Required]
    public double Longitud { get; set; }

    public string? UrlFoto { get; set; }

    [Required]
    [MaxLength(50)]
    public string Estado { get; set; } = "Pendiente";

    [Required]
    public DateTime FechaCreacion { get; set; } = DateTime.Now;
}