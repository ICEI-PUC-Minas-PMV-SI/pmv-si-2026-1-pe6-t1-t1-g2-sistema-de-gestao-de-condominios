using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

/// <summary>
/// Contexto EF Core para PostgreSQL. Tabela <c>public.reservations</c> (Supabase / schema em inglês).
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
            entity.ToTable("reservations", "public");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();
            entity.Property(e => e.AreaComumId).HasColumnName("common_area_id");
            entity.Property(e => e.MoradorId).HasColumnName("user_id");
            entity.Property(e => e.DataHoraInicio).HasColumnName("start_time");
            entity.Property(e => e.DataHoraFim).HasColumnName("end_time");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.Observacao).HasColumnName("notes");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });
    }
}
