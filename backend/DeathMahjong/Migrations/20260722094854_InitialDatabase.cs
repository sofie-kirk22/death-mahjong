using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeathMahjong.Migrations
{
    /// <inheritdoc />
    public partial class InitialDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GameRooms",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    JoinCode = table.Column<string>(type: "text", nullable: false),
                    HostPlayerId = table.Column<string>(type: "text", nullable: false),
                    CurrentPlayerIndex = table.Column<int>(type: "integer", nullable: false),
                    HardCoreMode = table.Column<bool>(type: "boolean", nullable: false),
                    FullDeckMode = table.Column<bool>(type: "boolean", nullable: false),
                    HasStarted = table.Column<bool>(type: "boolean", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    HasEnded = table.Column<bool>(type: "boolean", nullable: false),
                    EndReason = table.Column<string>(type: "text", nullable: true),
                    EndedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndedByPlayerId = table.Column<string>(type: "text", nullable: true),
                    MaxPlayers = table.Column<int>(type: "integer", nullable: false),
                    MinPlayers = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameRooms", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GameRooms");
        }
    }
}
