namespace DeathMahjong.Api.Data.Entities;

public class CompletedGameEntity
{
    public string Id { get; set; } = "";

    public DateTime StartedAt { get; set; }
    public DateTime EndedAt { get; set; }

    public int DurationSeconds { get; set; }

    public bool HardCoreMode { get; set; }
    public bool FullDeckMode { get; set; }

    public int PlayerCount { get; set; }
    public int DrawnTileCount { get; set; }
    public int TotalSips { get; set; }

    public string? WinnerPlayerId { get; set; }
    public string? WinnerPlayerName { get; set; }

    public string? EndReason { get; set; }

    public List<CompletedGamePlayerEntity> Players { get; set; } = new();
}