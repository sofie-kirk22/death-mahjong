using DeathMahjong.Api.Dtos;
using DeathMahjong.Api.Models;
using DeathMahjong.Api.Services;
using DeathMahjong.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSingleton<GameRoomStore>();
builder.Services.AddSingleton<GameEngine>();

builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("frontend");

app.MapHub<GameHub>("hubs/gamehub");

app.MapPost("/api/gamerooms", (
    CreateRoomRequest request,
    GameRoomStore gameRoomStore
) =>
{
    if (string.IsNullOrWhiteSpace(request.HostPlayerName))
    {
        return Results.BadRequest("Host player name is required.");
    }
    var gameRoom = gameRoomStore.CreateGameRoom(request.HostPlayerName, request.HardCoreMode);
    return Results.Ok(gameRoom);
});

app.MapPost("/api/gamerooms/{roomId}/join", async (
    string roomId,
    JoinRoomRequest request,
    GameRoomStore gameRoomStore,
    IHubContext<GameHub> hubContext
) =>
{
    var gameRoom = gameRoomStore.GetByID(roomId);
    if (gameRoom == null)
    {
        return Results.NotFound("Game room not found.");
    }

    if (gameRoom.HasStarted)
    {
        return Results.BadRequest("Cannot join a game that has already started.");
    }

    if (string.IsNullOrWhiteSpace(request.PlayerName))
    {
        return Results.BadRequest("Player name is required.");
    }

    var player = new Player
    {
        DisplayName = request.PlayerName,
        Color = PickColor(gameRoom.Players.Count)
    };

    gameRoom.Players.Add(player);

    await hubContext.Clients.Group(roomId).SendAsync("PlayerJoined", player);

    return Results.Ok(new
    {
        gameRoom,
        player
    });
});

app.MapPost("/api/gamerooms/{roomId}/start", async (
    string roomId,
    StartGameRequest request,
    GameRoomStore gameRoomStore,
    GameEngine gameEngine,
     IHubContext<GameHub> hubContext

) =>
{
    var gameRoom = gameRoomStore.GetByID(roomId);
    if (gameRoom == null)
    {
        return Results.NotFound("Game room not found.");
    }

    if (gameRoom.HasStarted)
    {
        return Results.BadRequest("Game has already started.");
    }

    var player = gameRoom.Players.FirstOrDefault(p => p.Id == request.PlayerId);
    if (player == null)
    {
        return Results.BadRequest("Player not found in the game room.");
    }

    gameRoom.Tiles = gameEngine.GenerateTiles();
    gameRoom.HasStarted = true;
    gameRoom.StartedAt = DateTime.UtcNow;
    gameRoom.CurrentPlayerIndex = 0;

    await hubContext.Clients.Group(roomId).SendAsync("GameStarted", gameRoom);

    return Results.Ok(gameRoom);
});

app.MapPost("/api/gamerooms/{roomId}/draw", async (
    string roomId,
    DrawTileRequest request,
    GameRoomStore gameRoomStore,
    GameEngine gameEngine,
    IHubContext<GameHub> hubContext
) =>
{
    var gameRoom = gameRoomStore.GetByID(roomId);
    if (gameRoom == null)
    {
        return Results.NotFound("Game room not found.");
    }
    try
    {
        var move = gameEngine.DrawTile(gameRoom, request.PlayerId, request.TileId);

        await hubContext.Clients.Group(roomId).SendAsync("TileDrawn", new
        {
            gameRoom,
            move
        });

        return Results.Ok(new
        {
            gameRoom,
            move
        });
    }
    catch (InvalidOperationException ex)
    {
        await hubContext.Clients.Group(roomId).SendAsync("InvalidMove", ex.Message);

        return Results.BadRequest(ex.Message);
    }
});

app.MapGet("/api/gamerooms/{roomId}", (
    string roomId,
    GameRoomStore gameRoomStore
) =>
{
    var gameRoom = gameRoomStore.GetByID(roomId);
    if (gameRoom == null)
    {
        return Results.NotFound("Game room not found.");
    }

    return Results.Ok(gameRoom);
});

app.Run();

static string PickColor(int index)
{
    var colors = new[] 
    { 
        "#FF0000", 
        "#00FF00", 
        "#0000FF", 
        "#FFFF00", 
        "#FF00FF", 
        "#00FFFF" 
    };

    return colors[index % colors.Length];
}
