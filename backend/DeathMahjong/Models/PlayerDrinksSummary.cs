namespace DeathMahjong.Api.Models;

public class PlayerDrinksSummary
{
    public string PlayerId { get; set; } = "";
    public string PlayerName { get; set; } = "";
    public string? LatestTileName { get; set; }
    public int? LatestSips { get; set; }
    public int TotalSips { get; set; }

    public int DragonCount { get; set; }
}