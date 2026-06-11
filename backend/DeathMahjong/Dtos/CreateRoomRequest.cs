namespace DeathMahjong.Api.Dtos;

public class CreateRoomRequest
{
    public string HostPlayerName { get; set; } = "";
    public bool HardCoreMode { get; set; } = false;
    public bool FullDeckMode { get; set; } = false;
}