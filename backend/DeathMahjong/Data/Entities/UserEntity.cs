namespace DeathMahjong.Api.Data.Entities;

public class UserEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string DisplayName { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}