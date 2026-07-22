using DeathMahjong.Api.Dtos;
using DeathMahjong.Api.Models;
using DeathMahjong.Api.Services;
using DeathMahjong.Api.Hubs;
using Microsoft.AspNetCore.SignalR;
using DeathMahjong.Api.Data;
using DeathMahjong.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration.UserSecrets;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSingleton<GameRoomStore>();
builder.Services.AddSingleton<GameEngine>();

builder.Services.AddSignalR();

var port = Environment.GetEnvironmentVariable("PORT");

if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Missing database connection string.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

var allowedOrigins =
    builder.Configuration
        .GetSection("AllowedOrigins")
        .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("frontend");

app.MapHub<GameHub>("/hubs/gamehub");

app.MapGet("/", () => Results.Ok("Death Mahjong backend is running"));

app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        status = "ok",
        app = "Death Mahjong"
    });
});

app.MapGet("/health/db", async (AppDbContext db) =>
{
    var canConnect = await db.Database.CanConnectAsync();

    return Results.Ok(new
    {
        status = canConnect ? "ok" : "error",
        database = canConnect ? "connected" : "not connected"
    });
});

if (app.Environment.IsDevelopment())
{
    app.MapGet("/debug/db/completed-games", async (AppDbContext db) =>
    {
        var games = await db.CompletedGames
        .Include(game => game.Players)
        .OrderByDescending(game => game.EndedAt)
        .Take(10)
        .Select(game => new
        {
            game.Id,
            game.StartedAt,
            game.EndedAt,
            game.DurationSeconds,
            game.HardCoreMode,
            game.FullDeckMode,
            game.PlayerCount,
            game.DrawnTileCount,
            game.TotalSips,
            game.WinnerPlayerName,
            game.EndReason,
            Players = game.Players
                .OrderBy(player => player.FinalRank)
                .Select(player => new
                {
                    player.FinalRank,
                    player.DisplayName,
                    player.TotalSips,
                    player.DragonCount,
                    player.WindCount,
                    player.LatestTileName,
                    player.LatestSips
                })
        })
        .ToListAsync();

    return Results.Ok(games);    
    });
}

app.MapPost("/api/gamerooms", async (
    CreateRoomRequest request,
    GameRoomStore gameRoomStore,
    AppDbContext db
) =>
{

    if (string.IsNullOrWhiteSpace(request.HostPlayerName))
    {
        return Results.BadRequest("Host player name is required.");
    }
    var gameRoom = gameRoomStore.CreateGameRoom(
        request.HostPlayerName, 
        request.HardCoreMode, 
        request.FullDeckMode
    );

    var hostPlayer = gameRoom.Players.First();

    var GameRoomEntity = new GameRoomEntity
    {
        Id = gameRoom.Id,
        JoinCode = gameRoom.JoinCode,
        HostPlayerId = gameRoom.HostPlayerId,

        CurrentPlayerIndex = gameRoom.CurrentPlayerIndex,

        HardCoreMode = gameRoom.HardCoreMode,
        FullDeckMode = gameRoom.FullDeckMode,

        HasStarted = gameRoom.HasStarted,
        StartedAt = gameRoom.StartedAt,

        HasEnded = gameRoom.HasEnded,
        EndReason = gameRoom.EndReason?.ToString(),
        EndedAt = gameRoom.EndedAt,
        EndedByPlayerId = gameRoom.EndedByPlayerId,

        MaxPlayers = gameRoom.MaxPlayers,
        MinPlayers = gameRoom.MinPlayers,

        Players =
        [
            new GamePlayerEntity
            {
                Id = hostPlayer.Id,
                GameRoomId = gameRoom.Id,
                UserId = null,
                DisplayName = hostPlayer.DisplayName,
                Color = hostPlayer.Color,
                JoinedAt = DateTime.UtcNow
            }
        ]
    };

    db.GameRooms.Add(GameRoomEntity);
    await db.SaveChangesAsync();

    return Results.Ok(gameRoom);
});

app.MapPost("/api/gamerooms/{joinCode}/join", async (
    string joinCode,
    JoinRoomRequest request,
    GameRoomStore gameRoomStore,
    IHubContext<GameHub> hubContext,
    AppDbContext db
) =>
{
    var gameRoom = gameRoomStore.GetByJoinCode(joinCode);
    if (gameRoom == null)
    {
        return Results.NotFound("Game room not found.");
    }

    if (gameRoom.HasStarted)
    {
        return Results.BadRequest("Cannot join a game that has already started.");
    }

    if (gameRoom.HasEnded)
    {
        return Results.BadRequest("Cannot join a game that has already ended.");
    }

    if (gameRoom.Players.Count >= gameRoom.MaxPlayers)
    {
        return Results.BadRequest($"Game room is full. Maximum players allowed: {gameRoom.MaxPlayers}.");
    }

    var requestedName = request.PlayerName?.Trim();

    if (string.IsNullOrWhiteSpace(requestedName))
    {
        return Results.BadRequest("Player name is required.");
    }

    var nameAlreadyTaken = gameRoom.Players.Any(p => p.DisplayName.Trim().Equals(requestedName, StringComparison.OrdinalIgnoreCase));
    if (nameAlreadyTaken)    {
        return Results.BadRequest("A player with that name has already joined this room. Please choose a different name.");
    }

    var player = new Player
    {
        DisplayName = requestedName,
        Color = PickColor(gameRoom.Players.Count)
    };

    var roomExistsInDatabase = await db.GameRooms
        .AnyAsync(room => room.Id == gameRoom.Id);

    if (!roomExistsInDatabase)
    {
        return Results.BadRequest("Game room exists in memory, but was not found in the database.");
    }

    var playerEntity = new GamePlayerEntity
    {
        Id = player.Id,
        GameRoomId = gameRoom.Id,
        UserId = null,
        DisplayName = player.DisplayName,
        Color = player.Color,
        JoinedAt = DateTime.UtcNow
    };

    db.GamePlayers.Add(playerEntity);
    await db.SaveChangesAsync();

    gameRoom.Players.Add(player);

    await hubContext.Clients.Group(gameRoom.Id).SendAsync("PlayerJoined", new
    {
        gameRoom,
        player
    });

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
     IHubContext<GameHub> hubContext) =>
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

    if (gameRoom.HasEnded)
    {
        return Results.BadRequest("Game has already ended.");
    }

    var player = gameRoom.Players.FirstOrDefault(p => p.Id == request.PlayerId);
    if (player == null)
    {
        return Results.BadRequest("Player not found in the game room.");
    }

    if (gameRoom.HostPlayerId != request.PlayerId)
    {
        return Results.BadRequest("Only the host player can start the game.");
    }

    gameRoom.Tiles = gameEngine.GenerateTiles(gameRoom.Players.Count, gameRoom.FullDeckMode);
    gameEngine.UpdateDrawableTiles(gameRoom);
    gameRoom.HasStarted = true;
    gameRoom.StartedAt = DateTime.UtcNow;
    gameRoom.CurrentPlayerIndex = 0;

    await hubContext.Clients.Group(roomId).SendAsync("GameStarted", new
    {
        gameRoom
    });

    return Results.Ok(gameRoom);
});

app.MapPost("/api/gamerooms/{roomId}/draw-tile", async (
    string roomId,
    DrawTileRequest request,
    GameRoomStore gameRoomStore,
    GameEngine gameEngine,
    IHubContext<GameHub> hubContext,
    AppDbContext db
) =>
{
    var gameRoom = gameRoomStore.GetByID(roomId);
    if (gameRoom == null)
    {
        return Results.NotFound("Game room not found.");
    }
    try
    {
        Console.WriteLine("---- DRAW REQUEST ----");
        Console.WriteLine($"Room ID: {roomId}");
        Console.WriteLine($"Request Player ID: {request.PlayerId}");
        Console.WriteLine($"Current Player Index: {gameRoom.CurrentPlayerIndex}");
        Console.WriteLine($"Current Player ID: {gameRoom.CurrentPlayerId}");
        Console.WriteLine("Players:");
        foreach (var player in gameRoom.Players)
        {
            Console.WriteLine($"- {player.DisplayName}: {player.Id}");
        }
        Console.WriteLine("----------------------");
        var move = gameEngine.DrawTile(gameRoom, request.PlayerId, request.TileId);

        gameEngine.UpdateDrawableTiles(gameRoom);
        gameEngine.IsGameOver(gameRoom);

        await hubContext.Clients.Group(roomId).SendAsync("TileDrawn", new
        {
            gameRoom,
            move
        });

        if (gameRoom.HasEnded)
        {
            await SaveCompletedGameAsync(gameRoom, db);

            await hubContext.Clients
                .Group(gameRoom.Id)
                .SendAsync("GameEnded", new { gameRoom });
        }

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

app.MapPost("/api/gamerooms/{roomId}/abort", async (
    string roomId,
    AbortGameRequest request,
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
        gameEngine.AbortGame(gameRoom, request.PlayerId);

        await hubContext.Clients.Group(roomId).SendAsync("GameEnded", new
        {
            gameRoom
        });
    }
    catch (InvalidOperationException ex)
    {
        await hubContext.Clients.Group(roomId).SendAsync("InvalidAbort", ex.Message);

        return Results.BadRequest(ex.Message);
    }

    return Results.Ok(new
    {
        gameRoom
    });
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

static async Task SaveCompletedGameAsync(GameRoom gameRoom, AppDbContext db)
{
    var alreadySaved = await db.CompletedGames
        .AnyAsync(game => game.Id == gameRoom.Id);

    if (alreadySaved)
    {
        return;
    }

    var endedAt = gameRoom.EndedAt ?? DateTime.UtcNow;

    var durationSeconds = Math.Max(
        0,
        (int)(endedAt - gameRoom.StartedAt).TotalSeconds
    );

    var playerSummaries = gameRoom.PlayerDrinksSummaries
        .OrderByDescending(summary => summary.TotalSips)
        .ToList();

    var winner = playerSummaries.FirstOrDefault();

    var completedGame = new CompletedGameEntity
    {
        Id = gameRoom.Id,
        StartedAt = gameRoom.StartedAt,
        EndedAt = endedAt,
        DurationSeconds = durationSeconds,

        HardCoreMode = gameRoom.HardCoreMode,
        FullDeckMode = gameRoom.FullDeckMode,

        PlayerCount = gameRoom.Players.Count,
        DrawnTileCount = gameRoom.DrawnTileCount,
        TotalSips = playerSummaries.Sum(summary => summary.TotalSips),

        WinnerPlayerId = winner?.PlayerId,
        WinnerPlayerName = winner?.PlayerName,

        EndReason = gameRoom.EndReason?.ToString(),

        Players = playerSummaries.Select((summary, index) =>
        {
            var playerWindCount = gameRoom.Moves.Count(move =>
                move.PlayerId == summary.PlayerId &&
                move.TileType.ToString().Equals("Wind", StringComparison.OrdinalIgnoreCase)
            );

            return new CompletedGamePlayerEntity
            {
                PlayerId = summary.PlayerId,
                UserId = null,
                DisplayName = summary.PlayerName,

                FinalRank = index + 1,
                TotalSips = summary.TotalSips,
                DragonCount = summary.DragonCount,
                WindCount = playerWindCount,

                LatestTileName = summary.LatestTileName,
                LatestSips = summary.LatestSips
            };
        }).ToList()
    };

    db.CompletedGames.Add(completedGame);
    await db.SaveChangesAsync();
}
