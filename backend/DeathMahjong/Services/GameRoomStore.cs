using DeathMahjong.Api.Models;
using DeathMahjong.Api.Dtos;

namespace DeathMahjong.Api.Services;

public class GameRoomStore
{
    private readonly Dictionary<string, GameRoom> _roomsById = new();
    private readonly Dictionary<string, string> _roomIdsByCode = new();

    public GameRoom CreateGameRoom(string hostPlayerName, bool hardCoreMode)
    {
        var gameRoom = new GameRoom
        {
            JoinCode = GenerateJoinCode(),
            HardCoreMode = hardCoreMode,
        };
        
        gameRoom.Players.Add(new Player 
        { 
            DisplayName = hostPlayerName,
            Color = "#FF0000" // Host player gets red color
        });

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

    private static string GenerateJoinCode()
    {
        return Random.Shared.Next(100000, 999999).ToString(); // Generate a random 6-digit code
    }

    public void RemoveGameRoom(string roomId)
    {
        _roomsById.Remove(roomId);
    }
}