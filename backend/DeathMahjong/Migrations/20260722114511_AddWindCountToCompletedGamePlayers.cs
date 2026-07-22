using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeathMahjong.Migrations
{
    /// <inheritdoc />
    public partial class AddWindCountToCompletedGamePlayers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WindCount",
                table: "CompletedGamePlayers",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WindCount",
                table: "CompletedGamePlayers");
        }
    }
}
