namespace DeathMahjong.Api.Models;

public class Move
{   
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string PlayerId { get; set; } = "";
    public string TileId { get; set; } = "";
    public string TileName { get; set; } = "";

    public int TileValue { get; set; }
    public int SameTileDrawCount { get; set; }
    public int Drinks { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}