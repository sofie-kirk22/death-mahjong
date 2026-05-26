namespace DeathMahjong.Api.Models;

public class GameRoom
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string JoinCode { get; set; } = "";

    public List<Player> Players { get; set; } = new List<Player>();
    public List<Tile> Tiles { get; set; } = new List<Tile>();
    public List<Move> Moves { get; set; } = new List<Move>();

    public int CurrentPlayerIndex { get; set; } = 0;

    public bool HardCoreMode { get; set; } = false;
    public bool HasStarted { get; set; } = false;

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    public string? CurrentPlayerId => Players.Count > 0 ? Players[CurrentPlayerIndex].Id : null;
}