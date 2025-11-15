using System.ComponentModel.DataAnnotations;

public class Reporte
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int CiudadanoId { get; set; }

    [Required]
    [MaxLength(100)]
    public string TipoIncidente { get; set; } = string.Empty;

    [Required]
    public string DescripcionDetallada { get; set; } = string.Empty;

    [Required]
    public double Latitud { get; set; }

    [Required]
    public double Longitud { get; set; }

    // Opcional
    public string? UrlFoto { get; set; }

    [Required]
    [MaxLength(50)]
    public string Estado { get; set; } = "Pendiente";

    [Required]
    public DateTime FechaCreacion { get; set; } = DateTime.Now;
}