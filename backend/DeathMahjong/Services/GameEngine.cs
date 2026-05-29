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
        * Actual tile generation logic. 
        * This method will read the tile definitions from the JSON file, 
        * Create Tile objects, shuffle them 
        * Assign their positions based on the standard Mahjong layout.
    */
    public List<Tile> GenerateTiles()
    {
        Console.WriteLine("Generating tiles...");
        var tiles = GetTilesFromJson();

        //Shuffle tiles
        ShuffleTiles(tiles);

        // Assign temporary grid positions
        //AssignTemporaryGridPositions(tiles);

        // Assign actual grid positions based on the standard Mahjong layout
        AssignActualGridPositions(tiles);

        return tiles;
    }

    /*
        * This is a tiny placeholder layout. 
        * Need to be replaced with the actual layout of the Mahjong tiles.
    */
    public List<Tile> GenerateTilesBeta()
    {
        Console.WriteLine("Generating tiles...");
        var tiles = GetTilesFromJson();

        //Shuffle tiles
        tiles = tiles.OrderBy(t => Random.Shared.Next()).ToList();

        for (int i = 0; i < tiles.Count; i++)
        {
            tiles[i].X = (i % 12) * 2;
            tiles[i].Y = ((i / 12) % 12) * 2;
            tiles[i].Z = i / 144;
        }

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

        return tiles;
    }

    public List<Tile> GetTilesFromJson()
    {
        var filePath = Path.Combine(AppContext.BaseDirectory, "Data", "tiles.json");

        if (!File.Exists(filePath))
            throw new FileNotFoundException("Tiles JSON file not found.", filePath);
        
        var jsonContent = File.ReadAllText(filePath);
        var tileDtos = System.Text.Json.JsonSerializer.Deserialize<List<TileJsonDto>>(
            jsonContent,
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );

        if (tileDtos == null)
            throw new InvalidOperationException("Failed to deserialize tiles from JSON.");
        
        return tileDtos.Select(dto => new Tile
        {
            Id = dto.Id,
            Name = dto.Name,
            Type = Enum.Parse<TileType>(dto.TileType, ignoreCase: true),
            Value = dto.Value,
            X = 0, // Placeholder, actual X coordinate should be set based on the layout
            Y = 0, // Placeholder, actual Y coordinate should be set based on the layout
            Z = 0,  // Placeholder, actual Z coordinate should be set based on the layout
            IsDrawn = false
        }).ToList();
    }

    private void ShuffleTiles(List<Tile> tiles)
    {
        for (int i = 0; i < tiles.Count; i++)
        {
            var randomIndex = Random.Shared.Next(i, tiles.Count);

            (tiles[i], tiles[randomIndex]) = (tiles[randomIndex], tiles[i]);
        }
    }

    private void AssignTemporaryGridPositions(List<Tile> tiles)
    {
        for (int i = 0; i < tiles.Count; i++)
        {
            tiles[i].X = (i % 12) * 2;
            tiles[i].Y = ((i / 12) % 12) * 2;
            tiles[i].Z = i / 144;
        }
    }

    private void AssignActualGridPositions(List<Tile> tiles)
    {
        // This method should assign the actual X, Y, Z coordinates to each tile based on the standard Mahjong layout.
        // The implementation will depend on the specific layout you want to use.
        var index = 0;

        for (int z = 0; z < 5; z++)
        {
            for (int y = 0; y < 7-z; y++)
            {
                for (int x = 0; x < 7-z; x++)
                {
                    if (index >= tiles.Count)
                        return;

                    tiles[index].X = (2 * x) + z;
                    tiles[index].Y = (2 * y) + z;
                    tiles[index].Z = z;

                    index++;
                }
            }
        }

        tiles[index].X = 6;
        tiles[index].Y = 6;
        tiles[index].Z = 6;

        Console.WriteLine("Number of assigned tiles: " + index);

    }

    public void UpdateDrawableTiles(GameRoom gameRoom)
    {
        foreach (var tile in gameRoom.Tiles)
        {
            tile.IsDrawable = CanDrawTile(gameRoom, tile.Id);
        }
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