namespace DeathMahjong.Api.Models;

public class Player
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? UserId { get; set; }
    public string DisplayName { get; set; } = "";
    public string Color { get; set; } = "#FFFFFF"; // Default to white
}