namespace DeathMahjong.Api.Models;

public class TileSetupConfig
{
    public int PlayerCount { get; set; }
    public int WindSuitCount { get; set; }
    public int WindCount { get; set; }
    public int DragonCount { get; set; }
    public int TotalSpecialTileCount => WindCount + DragonCount;
}