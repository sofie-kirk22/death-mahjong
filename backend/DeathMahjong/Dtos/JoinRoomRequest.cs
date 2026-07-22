namespace DeathMahjong.Api.Dtos;

public class JoinRoomRequest
{
    public string PlayerName { get; set; } = "";
    public string? UserId { get; set; }
}