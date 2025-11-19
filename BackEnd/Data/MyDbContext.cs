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
        // Configuración adicional del modelo si es necesario
        modelBuilder.Entity<Reporte>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Estado).HasDefaultValue("Pendiente");
        });
        }
    }
}
