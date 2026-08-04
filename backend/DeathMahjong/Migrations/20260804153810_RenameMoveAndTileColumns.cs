using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeathMahjong.Migrations
{
    /// <inheritdoc />
    public partial class RenameMoveAndTileColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Sips",
                table: "GameMoves",
                newName: "Drinks");

            migrationBuilder.RenameColumn(
                name: "DrawnAt",
                table: "GameMoves",
                newName: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Drinks",
                table: "GameMoves",
                newName: "Sips");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "GameMoves",
                newName: "DrawnAt");
        }
    }
}
