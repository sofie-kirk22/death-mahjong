namespace DeathMahjong.Api.Data.Entities;

public class GameTileEntity
{
    public string Id { get; set; } = "";

    public string GameRoomId { get; set; } = "";
    public GameRoomEntity GameRoom { get; set; } = null!;

    public string Name { get; set; } = "";
    public string Type { get; set; } = "";

    public int Value { get; set; }

    public int X { get; set; }
    public int Y { get; set; }
    public int Z { get; set; }

    public bool IsDrawn { get; set; }
    public bool IsDrawable { get; set; }
}