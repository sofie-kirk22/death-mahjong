namespace DeathMahjong.Api.Data.Entities;

public class GamePlayerEntity
{
    public string Id { get; set; } = "";

    public string GameRoomId { get; set; } = "";
    public GameRoomEntity GameRoom { get; set; } = null!;

    // Future user account link.
    // For now this stays null because players are guests.
    public string? UserId { get; set; }

    public string DisplayName { get; set; } = "";
    public string Color { get; set; } = "";

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}