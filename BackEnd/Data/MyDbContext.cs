using Microsoft.EntityFrameworkCore;
using BackEnd.Model;

namespace BackEnd.Data
{
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options) : base(options)
        {
        }

        public DbSet<Reporte> Reportes { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<ReporteValidacion> ReporteValidaciones { get; set; } // NUEVO DbSet

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configuración de la relación 1:N (Uno a Muchos) para Reportes
            modelBuilder.Entity<Reporte>()
                .HasOne(r => r.Ciudadano)
                .WithMany(u => u.Reportes)
                .HasForeignKey(r => r.CiudadanoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuración adicional existente para Reporte
            modelBuilder.Entity<Reporte>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Estado).HasDefaultValue("EnValidacion"); // Cambiado de "Pendiente" a "EnValidacion"
            });

            // Configuración para el nuevo modelo ReporteValidacion
            modelBuilder.Entity<ReporteValidacion>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                // Relación con Reporte
                entity.HasOne(rv => rv.Reporte)
                    .WithMany() // Un reporte puede tener muchas validaciones
                    .HasForeignKey(rv => rv.ReporteId)
                    .OnDelete(DeleteBehavior.Cascade); // Si se elimina el reporte, se eliminan sus validaciones
                
                // Relación con User (Ciudadano que valida)
                entity.HasOne(rv => rv.Ciudadano)
                    .WithMany(u => u.ValidacionesRealizadas)
                    .HasForeignKey(rv => rv.CiudadanoId)
                    .OnDelete(DeleteBehavior.Restrict); // No eliminar usuario si tiene validaciones
                
                // Índice único para evitar validaciones duplicadas
                entity.HasIndex(rv => new { rv.ReporteId, rv.CiudadanoId })
                    .IsUnique();
            });

            // Configuración para User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Puntos).HasDefaultValue(0); // Valor por defecto para puntos
            });
        }
    }
}