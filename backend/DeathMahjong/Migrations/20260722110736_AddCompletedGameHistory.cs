using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeathMahjong.Migrations
{
    /// <inheritdoc />
    public partial class AddCompletedGameHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CompletedGames",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: false),
                    HardCoreMode = table.Column<bool>(type: "boolean", nullable: false),
                    FullDeckMode = table.Column<bool>(type: "boolean", nullable: false),
                    PlayerCount = table.Column<int>(type: "integer", nullable: false),
                    DrawnTileCount = table.Column<int>(type: "integer", nullable: false),
                    TotalSips = table.Column<int>(type: "integer", nullable: false),
                    WinnerPlayerId = table.Column<string>(type: "text", nullable: true),
                    WinnerPlayerName = table.Column<string>(type: "text", nullable: true),
                    EndReason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompletedGames", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CompletedGamePlayers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    CompletedGameId = table.Column<string>(type: "text", nullable: false),
                    PlayerId = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: true),
                    DisplayName = table.Column<string>(type: "text", nullable: false),
                    FinalRank = table.Column<int>(type: "integer", nullable: false),
                    TotalSips = table.Column<int>(type: "integer", nullable: false),
                    DragonCount = table.Column<int>(type: "integer", nullable: false),
                    LatestTileName = table.Column<string>(type: "text", nullable: true),
                    LatestSips = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompletedGamePlayers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompletedGamePlayers_CompletedGames_CompletedGameId",
                        column: x => x.CompletedGameId,
                        principalTable: "CompletedGames",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompletedGamePlayers_CompletedGameId",
                table: "CompletedGamePlayers",
                column: "CompletedGameId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompletedGamePlayers");

            migrationBuilder.DropTable(
                name: "CompletedGames");
        }
    }
}
