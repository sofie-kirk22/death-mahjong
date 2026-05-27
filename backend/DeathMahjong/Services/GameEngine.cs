using Microsoft.AspNetCore.Components.Endpoints;
using DeathMahjong.Api.Models;

namespace DeathMahjong.Api.Services;

public class GameEngine
{
    public void StartGame(GameRoom gameRoom)
    {
        if (gameRoom.HasStarted)
            throw new InvalidOperationException("Game has already started.");

        gameRoom.HasStarted = true;
        // Additional logic to initialize the game can be added here
    }

    /*
        * This is a tiny placeholder layout. 
        * Need to be replaced with the actual layout of the Mahjong tiles.
    */
    public List<Tile> GenerateTiles()
    {
        Console.WriteLine("Generating tiles...");
        var tiles = new List<Tile>();

        tiles.Add(new Tile
        {
            Name = "Bamboo 1",
            Type = TileType.Bamboo,
            X = 0,
            Y = 0,
            Z = 0
        });

        tiles.Add(new Tile
        {
            Name = "Bamboo 2",
            Type = TileType.Bamboo,
            X = 2,
            Y = 0,
            Z = 0
        });

        tiles.Add(new Tile
        {
            Name = "Dragon Red",
            Type = TileType.Dragon,
            Value = 28,
            X = 0,
            Y = 2,
            Z = 0
        });

        tiles.Add(new Tile
        {
            Name = "Dragon Green",
            Type = TileType.Dragon,
            Value = 28,
            X = 2,
            Y = 2,
            Z = 0
        });

        tiles.Add(new Tile
        {
            Name = "Wind East",
            Type = TileType.Wind,
            Value = 14,
            X = 1,
            Y = 1,
            Z = 1
        });

        /*
        for (int i = 0; i < 144; i++)
        {
            tiles.Add(new Tile
            {
                X = i % 12,
                Y = (i / 12) % 12,
                Z = i / 144
            });
        }
        */

        return tiles;
    }

    public bool CanDrawTile(GameRoom gameRoom, string tileId)
    {
        Console.WriteLine($"Checking if tile {tileId} can be drawn.");
        var tile = gameRoom.Tiles.FirstOrDefault(t => t.Id == tileId);

        if (tile == null || tile.IsDrawn)
            return false; // Tile does not exist or has already been drawn
        
        bool hasTileAbove = gameRoom.Tiles.Any(t => 
            !t.IsDrawn && 
            t.Z == tile.Z+1 &&
            (
                ( t.X == tile.X+1 && t.Y == tile.Y+1 ) || 
                ( t.X == tile.X-1 && t.Y == tile.Y+1 ) || 
                ( t.X == tile.X+1 && t.Y == tile.Y-1 ) || 
                ( t.X == tile.X-1 && t.Y == tile.Y-1 )
            )
        );

        Console.WriteLine($"Checking above for tile {tile.Name} at X:{tile.X}, Y:{tile.Y}, Z:{tile.Z}");

        foreach (var t in gameRoom.Tiles.Where(t => !t.IsDrawn && t.Z == tile.Z + 1))
        {
            Console.WriteLine($"Upper tile candidate: {t.Name} at X:{t.X}, Y:{t.Y}, Z:{t.Z}");
        }

        if (hasTileAbove)
        {
            Console.WriteLine($"Tile {tile.Name} has a tile above it.");
            return false; // Cannot draw tile because there is a tile above it
        }

        bool blockedOnBottom = gameRoom.Tiles.Any(t => 
            !t.IsDrawn && t.Z == tile.Z && 
            (
                t.X == tile.X && t.Y == tile.Y-2 
            )
        );

        bool blockedOnTop = gameRoom.Tiles.Any(t => 
            !t.IsDrawn && t.Z == tile.Z && 
            (
                t.X == tile.X &&  t.Y == tile.Y+2 
            )
        );

        bool blockedOnLeft = gameRoom.Tiles.Any(t => 
            !t.IsDrawn && t.Z == tile.Z && 
            (
                t.Y == tile.Y && t.X == tile.X-2
            )
        );

        bool blockedOnRight = gameRoom.Tiles.Any(t => 
            !t.IsDrawn && t.Z == tile.Z && 
            (
                t.Y == tile.Y && t.X == tile.X+2
            )
        );

        if ((blockedOnBottom && blockedOnTop) || (blockedOnLeft && blockedOnRight))
        {
            Console.WriteLine($"Tile {tile.Name} is blocked. blockedOnBottom: {blockedOnBottom}, blockedOnTop: {blockedOnTop}, blockedOnLeft: {blockedOnLeft}, blockedOnRight: {blockedOnRight}");
            return false; // Cannot draw tile because it is not free on either horizontal or vertical side
        }

        return true; // Player can draw a tile
    }

    public Move DrawTile(GameRoom gameRoom, string playerId, string tileId)
    {
        if (!gameRoom.HasStarted)
            throw new InvalidOperationException("Game has not started yet.");

        if (gameRoom.CurrentPlayerId != playerId)
            throw new InvalidOperationException("It's not the player's turn.");
        
        
        var tile = gameRoom.Tiles.FirstOrDefault(t => t.Id == tileId);

        if (tile == null)
            throw new InvalidOperationException("Tile does not exist.");

        if (!CanDrawTile(gameRoom, tileId))
            throw new InvalidOperationException("Cannot draw this tile.");

        tile.IsDrawn = true;

        var sameTileDrawCount = gameRoom.Moves.Count(m => m.TileName == tile.Name) + 1; // Count how many times this tile has been drawn, including the current draw
        var drinks = CalculateDrinks(
            value: tile.Value, 
            sameTileDrawCount: sameTileDrawCount, 
            hardCoreMode: gameRoom.HardCoreMode
        );

        var move = new Move
        {
            PlayerId = playerId,
            TileId = tile.Id,
            TileName = tile.Name,
            TileValue = tile.Value,
            SameTileDrawCount = sameTileDrawCount,
            Drinks = drinks
        };

        gameRoom.Moves.Add(move);

        AdvanceTurn(gameRoom);

        return move;
    }

    public int CalculateDrinks(int value, int sameTileDrawCount, bool hardCoreMode)
    {
        var drinks = (int)Math.Ceiling((value * sameTileDrawCount) / 2.0); 

        return hardCoreMode 
            ? drinks 
            : Math.Min(drinks, 14);
    }

    private static void AdvanceTurn(GameRoom gameRoom)
    {
        if (gameRoom.Players.Count == 0)
            return;

        gameRoom.CurrentPlayerIndex = 
            (gameRoom.CurrentPlayerIndex + 1) % gameRoom.Players.Count;
    }
}