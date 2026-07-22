namespace DeathMahjong.Api.Data.Entities;

public class GameMoveEntity
{
    public string Id { get; set; } = "";

    public string GameRoomId { get; set; } = "";
    public GameRoomEntity GameRoom { get; set; } = null!;

    public string PlayerId { get; set; } = "";
    public string TileId { get; set; } = "";

    public string TileName { get; set; } = "";
    public string TileType { get; set; } = "";

    public int TileValue { get; set; }
    public int Drinks { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}