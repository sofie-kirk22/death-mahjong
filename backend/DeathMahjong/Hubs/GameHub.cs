using Microsoft.AspNetCore.SignalR;

namespace DeathMahjong.Api.Hubs;

public class GameHub : Hub
{
    public async Task JoinRoomGroup(string roomId)
    {
        if (string.IsNullOrWhiteSpace(roomId))
        {
            throw new HubException("Room id is required.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
    }

    public async Task LeaveRoomGroup(string roomId)
    {
        if (string.IsNullOrWhiteSpace(roomId))
        {
            throw new HubException("Room id is required.");
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
    }
}