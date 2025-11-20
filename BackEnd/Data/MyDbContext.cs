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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configuración de la relación 1:N (Uno a Muchos)
            modelBuilder.Entity<Reporte>()
                .HasOne(r => r.Ciudadano)       // Un reporte tiene un Ciudadano
                .WithMany(u => u.Reportes)      // Un usuario tiene muchos Reportes
                .HasForeignKey(r => r.CiudadanoId) // La llave foránea es CiudadanoId
                .OnDelete(DeleteBehavior.Restrict); // Opcional: Evita borrar usuario si tiene reportes

            // Configuración adicional existente
            modelBuilder.Entity<Reporte>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Estado).HasDefaultValue("Pendiente");
            });
        }
    }
}