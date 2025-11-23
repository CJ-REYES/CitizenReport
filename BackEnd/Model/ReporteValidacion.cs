using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BackEnd.Model;

public class ReporteValidacion
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ReporteId { get; set; }
    [ForeignKey("ReporteId")]
    public Reporte? Reporte { get; set; }

    [Required]
    public int CiudadanoId { get; set; }
    [ForeignKey("CiudadanoId")]
    public User? Ciudadano { get; set; }

    // true: Positiva (Auténtico); false: Negativa (Falso)
    [Required]
    public bool EsPositiva { get; set; } 

    [Required]
    public DateTime FechaValidacion { get; set; } = DateTime.Now;
}