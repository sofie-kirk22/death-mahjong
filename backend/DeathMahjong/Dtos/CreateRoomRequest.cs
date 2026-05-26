namespace DeathMahjong.Api.Dtos;

public class CreateRoomRequest
{
    public string HostPlayerName { get; set; } = "";
    public bool HardCoreMode { get; set; } = false;
}