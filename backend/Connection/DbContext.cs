using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Connection
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSet dla wszystkich modeli
        public DbSet<Users> Users { get; set; }
        public DbSet<Plans> Plans { get; set; }
        public DbSet<Places> Places { get; set; }
        public DbSet<PlanMembers> PlanMembers { get; set; }
        public DbSet<PlansPlaces> PlansPlaces { get; set; }
        public DbSet<PlansBookings> PlansBookings { get; set; }
        public DbSet<PlansChecklist> PlansChecklist { get; set; }
        public DbSet<PlansBasicInfo> PlansBasicInfo { get; set; }
        public DbSet<PlanStatus> PlanStatus { get; set; }
        public DbSet<TripType> TripType { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Users>()
                .HasKey(u => u.UsersId);

            modelBuilder.Entity<Plans>()
                .HasKey(p => p.PlansId);

            modelBuilder.Entity<Places>()
                .HasKey(p => p.PlacesId);

            modelBuilder.Entity<PlanMembers>()
                .HasKey(pm => new { pm.PlansId, pm.UsersId });

            modelBuilder.Entity<PlansPlaces>()
                .HasKey(pp => pp.PlansPlacesId);

            modelBuilder.Entity<PlansBookings>()
                .HasKey(pb => pb.PlansBookingsId);

            modelBuilder.Entity<PlansChecklist>()
                .HasKey(pc => pc.ChecklistItemId);

            modelBuilder.Entity<PlansBasicInfo>()
                .HasKey(pbi => pbi.PlanId);

            // Konfiguracja relacji PlansBasicInfo -> Plans
            modelBuilder.Entity<PlansBasicInfo>()
                .HasOne<Plans>()
                .WithOne()
                .HasForeignKey<PlansBasicInfo>(pbi => pbi.PlanId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PlanStatus>()
                .HasKey(ps => ps.StatusId);

            modelBuilder.Entity<TripType>()
                .HasKey(tt => tt.TripTypeId);

            // MAPOWANIE NAZW TABEL (jeśli różnią się od nazw klas)
  
            // Mapowanie PlansChecklist na tabelę PlanChecklist
            modelBuilder.Entity<PlansChecklist>()
                .ToTable("PlanChecklist");

            // Mapowanie PlansBasicInfo na tabelę PlanBasicInfo
            modelBuilder.Entity<PlansBasicInfo>()
                .ToTable("PlanBasicInfo");

            // KONFIGURACJA NULLABLE POL
            
            // Plans - DeletedAtUtc może być null
            modelBuilder.Entity<Plans>()
                .Property(p => p.DeletedAtUtc)
                .IsRequired(false);

            // Plans - RowVer (timestamp dla optymistycznej kontroli współbieżności)
            modelBuilder.Entity<Plans>()
                .Property(p => p.RowVer)
                .IsRowVersion()
                .IsRequired(false);

            // Users - DeletedAtUtc może być null
            modelBuilder.Entity<Users>()
                .Property(u => u.DeletedAtUtc)
                .IsRequired(false);

            // Places - DeletedAtUtc może być null
            modelBuilder.Entity<Places>()
                .Property(p => p.DeletedAtUtc)
                .IsRequired(false);

            // PlansPlaces - DeletedAtUtc i ParentId mogą być null
            modelBuilder.Entity<PlansPlaces>()
                .Property(pp => pp.DeletedAtUtc)
                .IsRequired(false);

            modelBuilder.Entity<PlansPlaces>()
                .Property(pp => pp.ParentId)
                .IsRequired(false);

            // PlansChecklist - CompletedAtUtc może być null
            modelBuilder.Entity<PlansChecklist>()
                .Property(pc => pc.CompletedAtUtc)
                .IsRequired(false);

            // PlansBookings - StartTime i EndTime mogą być null
            modelBuilder.Entity<PlansBookings>()
                .Property(pb => pb.StartTime)
                .IsRequired(false);

            modelBuilder.Entity<PlansBookings>()
                .Property(pb => pb.EndTime)
                .IsRequired(false);

            // KONFIGURACJA TYPÓW DANYCH  
            
            // PlansBookings - konfiguracja dat i czasu
            modelBuilder.Entity<PlansBookings>()
                .Property(pb => pb.StartDate)
                .HasColumnType("date");

            modelBuilder.Entity<PlansBookings>()
                .Property(pb => pb.EndDate)
                .HasColumnType("date");

            modelBuilder.Entity<PlansBookings>()
                .Property(pb => pb.StartTime)
                .HasColumnType("time");

            modelBuilder.Entity<PlansBookings>()
                .Property(pb => pb.EndTime)
                .HasColumnType("time");
        }
    }
}