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
}