namespace DeathMahjong.Api.Models;

public class GameRoom
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string JoinCode { get; set; } = "";

    public List<Player> Players { get; set; } = new List<Player>();
    public List<Tile> Tiles { get; set; } = new List<Tile>();
    public List<Move> Moves { get; set; } = new List<Move>();

    public int CurrentPlayerIndex { get; set; } = 0;

    public bool HardCoreMode { get; set; } = false;
    public bool HasStarted { get; set; } = false;

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    public string? CurrentPlayerId => Players.Count > 0 ? Players[CurrentPlayerIndex].Id : null;

    public List<Tile> RemainingTiles => Tiles.Where(t => !t.IsDrawn).ToList();

    public List<Tile> DrawnTiles => Tiles.Where(t => t.IsDrawn).ToList();

    public int DrawnTileCount => Tiles.Count(t => t.IsDrawn);

    public int RemainingTileCount => Tiles.Count(t => !t.IsDrawn);

    public List<PlayerDrinksSummary> PlayerDrinksSummaries => 
        Players.Select(p =>
        {
            var playerMoves = Moves
                .Where(m => m.PlayerId == p.Id)
                .ToList();

            var latestMove = playerMoves.LastOrDefault();

            Console.WriteLine($"Showing latest move for player {p.DisplayName}: {(latestMove != null ? $"{latestMove.TileName} with {latestMove.Drinks} drinks" : "No moves yet")}");

            return new PlayerDrinksSummary
            {
                PlayerId = p.Id,
                PlayerName = p.DisplayName,
                LatestTileName = latestMove?.TileName,
                LatestSips = latestMove?.Drinks,
                TotalSips = playerMoves.Sum(m => m.Drinks)
            };
        }).ToList();

        

    public RemainingTileSummary RemainingTileSummary =>
        new RemainingTileSummary
        {
            BambooCount = RemainingTiles.Count(t => !t.IsDrawn && t.Type == TileType.Bamboo),
            CharacterCount = RemainingTiles.Count(t => !t.IsDrawn && t.Type == TileType.Character),
            DotCount = RemainingTiles.Count(t => !t.IsDrawn && t.Type == TileType.Dot),
            WindCount = RemainingTiles.Count(t => !t.IsDrawn && t.Type == TileType.Wind),
            DragonCount = RemainingTiles.Count(t => !t.IsDrawn && t.Type == TileType.Dragon)
        };
}