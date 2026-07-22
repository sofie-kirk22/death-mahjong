using DeathMahjong.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace DeathMahjong.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<GameRoomEntity> GameRooms => Set<GameRoomEntity>();
    public DbSet<GamePlayerEntity> GamePlayers => Set<GamePlayerEntity>();
    public DbSet<GameTileEntity> GameTiles => Set<GameTileEntity>();
    public DbSet<GameMoveEntity> GameMoves => Set<GameMoveEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<GameRoomEntity>(entity =>
        {
            entity.HasKey(room => room.Id);

            entity.HasIndex(room => room.JoinCode)
                .IsUnique();

            entity.Property(room => room.JoinCode)
                .IsRequired();

            entity.Property(room => room.HostPlayerId)
                .IsRequired();
        });

        modelBuilder.Entity<GamePlayerEntity>(entity =>
        {
            entity.HasKey(player => player.Id);

            entity.HasOne(player => player.GameRoom)
                .WithMany(room => room.Players)
                .HasForeignKey(player => player.GameRoomId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(player => player.DisplayName)
                .IsRequired();

            entity.Property(player => player.Color)
                .IsRequired();
        });

        modelBuilder.Entity<GameTileEntity>(entity =>
        {
            entity.HasKey(tile => tile.Id);

            entity.HasOne(tile => tile.GameRoom)
                .WithMany(room => room.Tiles)
                .HasForeignKey(tile => tile.GameRoomId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(tile => tile.Name)
                .IsRequired();

            entity.Property(tile => tile.Type)
                .IsRequired();
        });

        modelBuilder.Entity<GameMoveEntity>(entity =>
        {
            entity.HasKey(move => move.Id);

            entity.HasOne(move => move.GameRoom)
                .WithMany(room => room.Moves)
                .HasForeignKey(move => move.GameRoomId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(move => move.PlayerId)
                .IsRequired();

            entity.Property(move => move.TileId)
                .IsRequired();

            entity.Property(move => move.TileName)
                .IsRequired();

            entity.Property(move => move.TileType)
                .IsRequired();
        });
    }
}