using DeathMahjong.Api.Models;
using DeathMahjong.Api.Services;
using Xunit;

namespace DeathMahjong.Tests;

public class GameEngineTests
{
    private readonly GameEngine _engine = new();

    [Fact]
    public void CanDrawTile_ReturnsFalse_WhenTileDoesNotExist()
    {
        var room = new GameRoom
        {
            Tiles = new List<Tile>()
        };

        var result = _engine.CanDrawTile(room, "missing-tile-id");

        Assert.False(result);
    }

    [Fact]
    public void CanDrawTile_ReturnsFalse_WhenTileIsAlreadyDrawn()
    {
        var tile = CreateTile(
            id: "tile-1",
            name: "Bamboo 1",
            x: 0,
            y: 0,
            z: 0,
            isDrawn: true
        );

        var room = new GameRoom
        {
            Tiles = new List<Tile> { tile }
        };

        var result = _engine.CanDrawTile(room, tile.Id);

        Assert.False(result);
    }

    [Fact]
    public void CanDrawTile_ReturnsFalse_WhenTileHasTileAbove()
    {
        var bottomTile = CreateTile(
            id: "bottom",
            name: "Bottom Tile",
            x: 0,
            y: 0,
            z: 0
        );

        // Your current engine checks upper-layer blockers at:
        // X +/- 1, Y +/- 1, Z + 1
        var aboveTile = CreateTile(
            id: "above",
            name: "Above Tile",
            type: TileType.Dragon,
            x: 1,
            y: 1,
            z: 1
        );

        var room = new GameRoom
        {
            Tiles = new List<Tile> { bottomTile, aboveTile }
        };

        var result = _engine.CanDrawTile(room, bottomTile.Id);

        Assert.False(result);
    }

    [Fact]
    public void CanDrawTile_ReturnsTrue_WhenTileHasFourFreeSidesAndNoTileAbove()
    {
        var tile = CreateTile(
            id: "free",
            name: "Free Tile",
            x: 0,
            y: 0,
            z: 0
        );

        var room = new GameRoom
        {
            Tiles = new List<Tile> { tile }
        };

        var result = _engine.CanDrawTile(room, tile.Id);

        Assert.True(result);
    }

    [Fact]
    public void CanDrawTile_ReturnsFalse_WhenOnlyOneSideIsFree()
    {
        var tile = CreateTile(
            id: "middle",
            name: "Middle Tile",
            x: 2,
            y: 2,
            z: 0
        );

        var leftTile = CreateTile(
            id: "left",
            name: "Left Tile",
            x: 0,
            y: 2,
            z: 0
        );

        var rightTile = CreateTile(
            id: "right",
            name: "Right Tile",
            x: 4,
            y: 2,
            z: 0
        );

        var topTile = CreateTile(
            id: "top",
            name: "Top Tile",
            x: 2,
            y: 4,
            z: 0
        );

        // Left, right, and top are blocked.
        // Bottom is the only free side.
        // Since the rule requires 2 free sides, this should be false.
        var room = new GameRoom
        {
            Tiles = new List<Tile> { tile, leftTile, rightTile, topTile }
        };

        var result = _engine.CanDrawTile(room, tile.Id);

        Assert.False(result);
    }

    [Fact]
    public void CanDrawTile_ReturnsFalse_WhenNoSidesAreFree()
    {
        var tile = CreateTile(
            id: "middle",
            name: "Middle Tile",
            x: 2,
            y: 2,
            z: 0
        );

        var leftTile = CreateTile("left", "Left Tile", x: 0, y: 2, z: 0);
        var rightTile = CreateTile("right", "Right Tile", x: 4, y: 2, z: 0);
        var topTile = CreateTile("top", "Top Tile", x: 2, y: 4, z: 0);
        var bottomTile = CreateTile("bottom", "Bottom Tile", x: 2, y: 0, z: 0);

        var room = new GameRoom
        {
            Tiles = new List<Tile>
            {
                tile,
                leftTile,
                rightTile,
                topTile,
                bottomTile
            }
        };

        var result = _engine.CanDrawTile(room, tile.Id);

        Assert.False(result);
    }

    [Fact]
    public void UpdateDrawableTiles_SetsIsDrawableForEachTile()
    {
        var freeTile = CreateTile(
            id: "free",
            name: "Free Tile",
            x: 0,
            y: 0,
            z: 0
        );

        var blockedTile = CreateTile(
            id: "blocked",
            name: "Blocked Tile",
            x: 2,
            y: 2,
            z: 0
        );

        var leftTile = CreateTile("left", "Left Tile", x: 0, y: 2, z: 0);
        var rightTile = CreateTile("right", "Right Tile", x: 4, y: 2, z: 0);
        var topTile = CreateTile("top", "Top Tile", x: 2, y: 4, z: 0);

        var room = new GameRoom
        {
            Tiles = new List<Tile>
            {
                freeTile,
                blockedTile,
                leftTile,
                rightTile,
                topTile
            }
        };

        _engine.UpdateDrawableTiles(room);

        Assert.True(freeTile.IsDrawable);
        Assert.False(blockedTile.IsDrawable);
    }

    [Fact]
    public void DrawTile_MarksTileAsDrawn_AddsMove_AndAdvancesTurn()
    {
        var playerOne = new Player
        {
            Id = "player-1",
            DisplayName = "Sofie"
        };

        var playerTwo = new Player
        {
            Id = "player-2",
            DisplayName = "Philip"
        };

        var tile = CreateTile(
            id: "tile-1",
            name: "Bamboo 4",
            type: TileType.Bamboo,
            value: 4,
            x: 0,
            y: 0,
            z: 0
        );

        var room = new GameRoom
        {
            HasStarted = true,
            Players = new List<Player> { playerOne, playerTwo },
            CurrentPlayerIndex = 0,
            Tiles = new List<Tile> { tile },
            HardCoreMode = false
        };

        var move = _engine.DrawTile(room, playerOne.Id, tile.Id);

        Assert.True(tile.IsDrawn);
        Assert.Single(room.Moves);
        Assert.Equal(playerOne.Id, move.PlayerId);
        Assert.Equal(tile.Id, move.TileId);
        Assert.Equal("Bamboo 4", move.TileName);
        Assert.Equal(2, move.Drinks);
        Assert.Equal(1, room.CurrentPlayerIndex);
    }

    [Fact]
    public void DrawTile_Throws_WhenItIsNotPlayersTurn()
    {
        var playerOne = new Player
        {
            Id = "player-1",
            DisplayName = "Sofie"
        };

        var playerTwo = new Player
        {
            Id = "player-2",
            DisplayName = "Philip"
        };

        var tile = CreateTile(
            id: "tile-1",
            name: "Bamboo 4",
            x: 0,
            y: 0,
            z: 0
        );

        var room = new GameRoom
        {
            HasStarted = true,
            Players = new List<Player> { playerOne, playerTwo },
            CurrentPlayerIndex = 0,
            Tiles = new List<Tile> { tile }
        };

        var exception = Assert.Throws<InvalidOperationException>(() =>
            _engine.DrawTile(room, playerTwo.Id, tile.Id)
        );

        Assert.Equal("It's not the player's turn.", exception.Message);
    }

    [Theory]
    [InlineData(1, 1, false, 1)]
    [InlineData(4, 1, false, 2)]
    [InlineData(9, 2, false, 9)]
    [InlineData(28, 1, false, 14)]
    [InlineData(28, 2, false, 14)]
    [InlineData(28, 2, true, 28)]
    public void CalculateDrinks_ReturnsExpectedValue(
        int value,
        int sameTileDrawCount,
        bool hardCoreMode,
        int expected
    )
    {
        var result = _engine.CalculateDrinks(
            value,
            sameTileDrawCount,
            hardCoreMode
        );

        Assert.Equal(expected, result);
    }

    private static Tile CreateTile(
        string id,
        string name,
        int x,
        int y,
        int z,
        TileType type = TileType.Bamboo,
        int value = 1,
        bool isDrawn = false
    )
    {
        return new Tile
        {
            Id = id,
            Name = name,
            Type = type,
            Value = value,
            X = x,
            Y = y,
            Z = z,
            IsDrawn = isDrawn
        };
    }
}