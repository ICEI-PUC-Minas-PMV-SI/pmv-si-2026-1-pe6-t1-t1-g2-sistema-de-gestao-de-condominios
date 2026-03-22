using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

/// <summary>
/// Contexto EF Core para PostgreSQL (tabela public.reservas e demais entidades conforme evolução do projeto).
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<ReservaAreaComum> Reservas => Set<ReservaAreaComum>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ReservaAreaComum>(entity =>
        {
            entity.ToTable("reservas", "public");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();
            entity.Property(e => e.AreaComumId).HasColumnName("area_comum_id");
            entity.Property(e => e.MoradorId).HasColumnName("morador_id");
            entity.Property(e => e.DataHoraInicio).HasColumnName("data_hora_inicio");
            entity.Property(e => e.DataHoraFim).HasColumnName("data_hora_fim");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.Observacao).HasColumnName("observacao");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });
    }
}
