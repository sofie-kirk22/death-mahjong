namespace DeathMahjong.Api.Data.Entities;

public class GameRoomEntity
{
    public string Id { get; set; } = "";
    public string JoinCode { get; set; } = "";
    public string HostPlayerId { get; set; } = "";

    public int CurrentPlayerIndex { get; set; }

    public bool HardCoreMode { get; set; }
    public bool FullDeckMode { get; set; }

    public bool HasStarted { get; set; }
    public DateTime StartedAt { get; set; }

    public bool HasEnded { get; set; }
    public string? EndReason { get; set; }
    public DateTime? EndedAt { get; set; }
    public string? EndedByPlayerId { get; set; }

    public int MaxPlayers { get; set; } = 12;
    public int MinPlayers { get; set; } = 2;

    public List<GamePlayerEntity> Players { get; set; } = new();
    public List<GameTileEntity> Tiles { get; set; } = new();
    public List<GameMoveEntity> Moves { get; set; } = new();
}