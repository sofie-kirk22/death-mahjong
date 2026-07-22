namespace DeathMahjong.Api.Data.Entities;

public class CompletedGamePlayerEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string CompletedGameId { get; set; } = "";
    public CompletedGameEntity CompletedGame { get; set; } = null!;

    public string PlayerId { get; set; } = "";

    // Future account link
    public string? UserId { get; set; }

    public string DisplayName { get; set; } = "";

    public int FinalRank { get; set; }
    public int TotalSips { get; set; }
    public int DragonCount { get; set; }

    public string? LatestTileName { get; set; }
    public int? LatestSips { get; set; }
}