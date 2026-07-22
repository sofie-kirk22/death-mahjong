using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeathMahjong.Migrations
{
    /// <inheritdoc />
    public partial class AddGameStateTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GameMoves",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    GameRoomId = table.Column<string>(type: "text", nullable: false),
                    PlayerId = table.Column<string>(type: "text", nullable: false),
                    TileId = table.Column<string>(type: "text", nullable: false),
                    TileName = table.Column<string>(type: "text", nullable: false),
                    TileType = table.Column<string>(type: "text", nullable: false),
                    TileValue = table.Column<int>(type: "integer", nullable: false),
                    Drinks = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameMoves", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GameMoves_GameRooms_GameRoomId",
                        column: x => x.GameRoomId,
                        principalTable: "GameRooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GamePlayers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    GameRoomId = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: true),
                    DisplayName = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GamePlayers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GamePlayers_GameRooms_GameRoomId",
                        column: x => x.GameRoomId,
                        principalTable: "GameRooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GameTiles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    GameRoomId = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<int>(type: "integer", nullable: false),
                    X = table.Column<int>(type: "integer", nullable: false),
                    Y = table.Column<int>(type: "integer", nullable: false),
                    Z = table.Column<int>(type: "integer", nullable: false),
                    IsDrawn = table.Column<bool>(type: "boolean", nullable: false),
                    IsDrawable = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameTiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GameTiles_GameRooms_GameRoomId",
                        column: x => x.GameRoomId,
                        principalTable: "GameRooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GameRooms_JoinCode",
                table: "GameRooms",
                column: "JoinCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GameMoves_GameRoomId",
                table: "GameMoves",
                column: "GameRoomId");

            migrationBuilder.CreateIndex(
                name: "IX_GamePlayers_GameRoomId",
                table: "GamePlayers",
                column: "GameRoomId");

            migrationBuilder.CreateIndex(
                name: "IX_GameTiles_GameRoomId",
                table: "GameTiles",
                column: "GameRoomId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GameMoves");

            migrationBuilder.DropTable(
                name: "GamePlayers");

            migrationBuilder.DropTable(
                name: "GameTiles");

            migrationBuilder.DropIndex(
                name: "IX_GameRooms_JoinCode",
                table: "GameRooms");
        }
    }
}
