namespace DeathMahjong.Api.Dtos;

public class KickPlayerRequest
{
    public string HostPlayerId { get; set; } = "";
    public string PlayerIdToKick { get; set; } = "";
}