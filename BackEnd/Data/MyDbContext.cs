using Microsoft.EntityFrameworkCore;

public class MyDbContext : DbContext
{
    public MyDbContext(DbContextOptions<MyDbContext> options) : base(options)
    {
    }

    public DbSet<Reporte> Reportes { get; set; }

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