using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeathMahjong.Migrations
{
    /// <inheritdoc />
    public partial class ConnectTilesAndMovesToGameRooms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Type",
                table: "GameTiles",
                newName: "TileType");

            migrationBuilder.RenameColumn(
                name: "Drinks",
                table: "GameMoves",
                newName: "Sips");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "GameMoves",
                newName: "DrawnAt");

            migrationBuilder.AddColumn<string>(
                name: "PlayerName",
                table: "GameMoves",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "GameMoves",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PlayerName",
                table: "GameMoves");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "GameMoves");

            migrationBuilder.RenameColumn(
                name: "TileType",
                table: "GameTiles",
                newName: "Type");

            migrationBuilder.RenameColumn(
                name: "Sips",
                table: "GameMoves",
                newName: "Drinks");

            migrationBuilder.RenameColumn(
                name: "DrawnAt",
                table: "GameMoves",
                newName: "CreatedAt");
        }
    }
}
