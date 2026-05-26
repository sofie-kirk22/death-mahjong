using Microsoft.AspNetCore.SignalR;
using DeathMahjong.Api.Services;

namespace DeathMahjong.Api.Hubs;

public class GameHub : Hub
{
    public async Task JoinRoomGroup(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
    }

    public async Task LeaveRoomGroup(string roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
    }
}