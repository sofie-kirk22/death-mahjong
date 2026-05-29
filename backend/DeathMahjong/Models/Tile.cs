namespace DeathMahjong.Api.Models;

public class Tile
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = "";
    public TileType Type { get; set; }
    public int Value { get; set; }
    public int X { get; set; }
    public int Y { get; set; }  
    public int Z { get; set; }
    public bool IsDrawn { get; set; } = false;
    public bool IsDrawable { get; set; }
}