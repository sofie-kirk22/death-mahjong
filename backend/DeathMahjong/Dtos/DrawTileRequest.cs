namespace DeathMahjong.Api.Dtos;

public class DrawTileRequest
{
    public string PlayerId { get; set; } = "";
    public string TileId { get; set; } = "";
}