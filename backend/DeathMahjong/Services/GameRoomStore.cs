using DeathMahjong.Api.Models;
using DeathMahjong.Api.Dtos;

namespace DeathMahjong.Api.Services;

public class GameRoomStore
{
    private readonly Dictionary<string, GameRoom> _roomsById = new();
    private readonly Dictionary<string, string> _roomIdsByCode = new();

    public GameRoom CreateGameRoom(
        string hostPlayerName,
        bool hardCoreMode,
        bool fullDeckMode,
        string? userId = null
    )
    {
        Console.WriteLine($"Creating game room with host player: {hostPlayerName}, hardCoreMode: {hardCoreMode}, fullDeckMode: {fullDeckMode}");
        var hostPlayer = new Player
        {
            UserId = userId,
            DisplayName = hostPlayerName,
            Color = "#FF0000" // Host player gets red color
        };

        var gameRoom = new GameRoom
        {
            JoinCode = GenerateJoinCode(),
            HardCoreMode = hardCoreMode,
            FullDeckMode = fullDeckMode,
            HostPlayerId = hostPlayer.Id
        };
        
        gameRoom.Players.Add(hostPlayer);

        _roomsById[gameRoom.Id] = gameRoom;
        _roomIdsByCode[gameRoom.JoinCode] = gameRoom.Id;

        return gameRoom;
    }

    public GameRoom? GetByID(string roomId)
    {
        _roomsById.TryGetValue(roomId, out var gameRoom);
        return gameRoom;
    }

    public GameRoom? GetByCode(string joinCode)
    {
        if(!_roomIdsByCode.TryGetValue(joinCode.ToUpper(), out var roomId))
        {
            return null;
        }
            

        return GetByID(roomId);

    }

    public GameRoom? GetByJoinCode(string joinCode)
    {
        return _roomsById.Values.FirstOrDefault(r => r.JoinCode == joinCode);
    }

    private static string GenerateJoinCode()
    {
        return Random.Shared.Next(100000, 999999).ToString(); // Generate a random 6-digit code
    }

    public void RemoveGameRoom(string roomId)
    {
        // Remove the room entry
        _roomsById.Remove(roomId);

        // Also remove any join-code -> roomId mapping to avoid leaving stale entries
        string? codeKey = null;
        foreach (var kvp in _roomIdsByCode)
        {
            if (kvp.Value == roomId)
            {
                codeKey = kvp.Key;
                break;
            }
        }

        if (codeKey != null)
        {
            _roomIdsByCode.Remove(codeKey);
        }
    }
}