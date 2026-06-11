"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { abortGame, drawTile, getRoom } from "@/lib/api";
import { createGameHubConnection } from "@/lib/gameHub";
import { clearGameSession, getPlayerIdForRoom } from "@/lib/gameSession";
import { PlayerDrawnTiles } from "@/components/PlayerDrawnTiles";
import { PyramidBoard } from "@/components/PyramidBoard";

export default function GamePage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;
  const router = useRouter();

  console.log("roomId", roomId);
  console.log("params", params);

  const [gameRoom, setRoom] = useState<any>(null);
  const [latestMove, setLatestMove] = useState<any>(null);
  const [error, setError] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  const myPlayerId = getPlayerIdForRoom(roomId);
  const me = gameRoom?.players?.find((p: any) => p.id === myPlayerId);

  useEffect(() => {
    async function loadRoom() {
      try {
        const data = await getRoom(roomId);
        setRoom(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load game end");
      }
    }

    if (roomId) {
      loadRoom();
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const connection = createGameHubConnection();
    let cancelled = false;

    async function connect() {
      try {
        connection.on("TileDrawn", (payload) => {
          if (!cancelled) {
            setRoom(payload.gameRoom);
            setLatestMove(payload.move);
          }
        });

        connection.on("InvalidMove", (message) => {
          if (!cancelled) {
            setError(message);
          }
        });

        connection.on("GameEnded", (payload) => {
          if (!cancelled) {
            const endedRoom = payload.gameRoom ?? payload.room ?? payload;

            if (!endedRoom?.id) {
              setError("GameEnded event did not contain a valid game room.");
              return;
            }

            setRoom(endedRoom);

            const isAbortEnd =
              endedRoom.endReason === "AbortEnd" ||
              endedRoom.endReason === 2;

            if (isAbortEnd) {
              clearGameSession(endedRoom.id);
              router.push("/");
            } else {
              router.push(`/game-end/${endedRoom.id}`);
            }
          }
        });

        await connection.start();

        if (cancelled) {
          if (connection.state === "Connected") {
            await connection.stop();
          }
          return;
        }

        await connection.invoke("JoinRoomGroup", roomId);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(
            err instanceof Error
              ? err.message
              : "Could not connect to realtime server"
          );
        }
      }
    }

    connect();

    return () => {
      cancelled = true;

      if (connection.state === "Connected") {
        connection.stop();
      }
    };
  }, [roomId, router]);

  async function handleDrawTile(tileId: string) {
    try {
      setError("");

      if (gameRoom?.hasEnded) {
        setError("Game has already ended.");
        return;
      }

      const playerId = getPlayerIdForRoom(roomId);

      if (!playerId) {
        throw new Error("Missing playerId");
      }

      const result = await drawTile(roomId, playerId, tileId);

      const updatedRoom = result.gameRoom;
      const move = result.move;

      if (!updatedRoom) {
        throw new Error("Draw response did not contain a gameRoom.");
      }

      setRoom(updatedRoom);
      setLatestMove(move);

      if (updatedRoom.hasEnded) {
        const isAbortEnd =
          updatedRoom.endReason === "AbortEnd" ||
          updatedRoom.endReason === 2;

        if (isAbortEnd) {
          clearGameSession(updatedRoom.id);
          router.push("/");
        } else {
          router.push(`/game-end/${updatedRoom.id}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draw tile");
    }
  }

  async function handleAbortGame() {
    try {
      setError("");

      const playerId = getPlayerIdForRoom(roomId);

      if (!playerId) {
        throw new Error("Missing playerId");
      }

      const result = await abortGame(roomId, playerId);

      console.log("abort result:", result);

      const updatedRoom = result.gameRoom ?? result.room ?? result;

      if (!updatedRoom?.id) {
        throw new Error("Abort response did not contain a valid game room.");
      }

      setRoom(updatedRoom);
      clearGameSession(updatedRoom.id);
      router.push(`/`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not abort game");
    }
  }

  if (!gameRoom) {
    return <main className="p-8">Loading game...</main>;
  }

  console.log("room:", gameRoom);
  console.log("playerDrinkSummaries:", gameRoom.playerDrinkSummaries);
  console.log("remainingTileSummary:", gameRoom.remainingTileSummary);

  const myPlayerID =
    typeof window !== "undefined" ? getPlayerIdForRoom(roomId) : null;

  const isHost = myPlayerID === gameRoom.hostPlayerId;

  const latestMovePlayer =
    latestMove && gameRoom?.players
      ? gameRoom.players.find((player: any) => player.id === latestMove.playerId)
      : null;

  const currentPlayer = gameRoom.players[gameRoom.currentPlayerIndex];

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 bg-white p-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-3xl font-bold">Death Mahjong</h1>

        <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: me?.color ?? "#94a3b8" }}
          />
          <span>{me?.displayName ?? "Unknown"}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Current player
        </p>
        <p className="text-xl font-semibold">{currentPlayer.displayName}</p>
      </section>

      <section className="grid gap-4">
        {gameRoom.players.map((player: any) => (
          <PlayerDrawnTiles
            key={player.id}
            gameRoom={gameRoom}
            player={player}
          />
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-xl font-semibold">Player history</h2>

        <ul className="space-y-3">
          {gameRoom.playerDrinksSummaries?.map((summary: any) => (
            <li
              key={summary.playerId}
              className="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <p className="font-semibold">{summary.playerName}</p>

              <p className="text-slate-700 dark:text-slate-200">
                Latest:{" "}
                {summary.latestTileName
                  ? `${summary.latestTileName} — ${summary.latestSips} sips`
                  : "No tile drawn yet"}
              </p>

              <p className="text-slate-700 dark:text-slate-200">
                Total: {summary.totalSips} sips
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-xl font-semibold">Tiles left</h2>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <div className="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Bamboo</p>
            <p className="text-2xl font-bold">
              {gameRoom.remainingTileSummary?.bambooCount ?? 0}
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Dots</p>
            <p className="text-2xl font-bold">
              {gameRoom.remainingTileSummary?.dotCount ?? 0}
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Characters
            </p>
            <p className="text-2xl font-bold">
              {gameRoom.remainingTileSummary?.characterCount ?? 0}
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Winds</p>
            <p className="text-2xl font-bold">
              {gameRoom.remainingTileSummary?.windCount ?? 0}
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Dragons</p>
            <p className="text-2xl font-bold">
              {gameRoom.remainingTileSummary?.dragonCount ?? 0}
            </p>
          </div>
        </div>
      </section>

      <PyramidBoard 
        tiles={gameRoom.tiles} 
        onDrawTile={handleDrawTile} 
        disabled={gameRoom.hasEnded} 
      />

      {gameRoom.hasEnded && (
        <section className="rounded-2xl border border-yellow-300 bg-yellow-50 p-4 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-100">
          <h2 className="text-xl font-semibold">Game ended</h2>
          <p>Reason: {gameRoom.endReason}</p>
        </section>
      )}

      {isHost && !gameRoom.hasEnded && (
        <button
          className="rounded border border-red-500 bg-red-100 px-4 py-2 text-red-900 hover:bg-red-200 dark:border-red-700 dark:bg-red-950 dark:text-red-100 dark:hover:bg-red-900"
          onClick={handleAbortGame}
        >
          Abort game
        </button>
      )}

      <button
        className="rounded border px-3 py-2"
        onClick={() => setShowDebug(!showDebug)}
      >
        {showDebug ? "Hide debug" : "Show debug"}
      </button>

      {showDebug && (
        <>
          <section className="rounded-2xl border p-4">
            <h2 className="mb-3 text-xl font-semibold">Tile debug view</h2>

            <div className="max-h-96 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="border-b p-2">Name</th>
                    <th className="border-b p-2">Type</th>
                    <th className="border-b p-2">X</th>
                    <th className="border-b p-2">Y</th>
                    <th className="border-b p-2">Z</th>
                    <th className="border-b p-2">Drawn</th>
                    <th className="border-b p-2">Drawable</th>
                  </tr>
                </thead>

                <tbody>
                  {gameRoom.tiles.map((tile: any) => (
                    <tr key={tile.id}>
                      <td className="border-b p-2">{tile.name}</td>
                      <td className="border-b p-2">{tile.type}</td>
                      <td className="border-b p-2">{tile.x}</td>
                      <td className="border-b p-2">{tile.y}</td>
                      <td className="border-b p-2">{tile.z}</td>
                      <td className="border-b p-2">
                        {tile.isDrawn ? "Yes" : "No"}
                      </td>
                      <td className="border-b p-2">
                        {tile.isDrawable ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid grid-cols-4 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {gameRoom.tiles.map((tile: any) => {
              const gameHasEnded = gameRoom.hasEnded;
              const isDisabled = gameHasEnded || tile.isDrawn || !tile.isDrawable;

              return (
                <button
                  key={tile.id}
                  disabled={isDisabled}
                  className={[
                    "rounded border p-3 text-left transition",
                    gameHasEnded
                      ? "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400 opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600"
                      : tile.isDrawn
                        ? "border-slate-200 bg-slate-100 text-slate-400 opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600"
                        : tile.isDrawable
                          ? "border-green-500 bg-green-100 text-green-950 hover:bg-green-200 dark:border-green-500 dark:bg-green-950 dark:text-green-100 dark:hover:bg-green-900"
                          : "cursor-not-allowed border-red-500 bg-red-100 text-red-950 opacity-60 dark:border-red-700 dark:bg-red-950 dark:text-red-200 dark:opacity-50",
                  ].join(" ")}
                  onClick={() => handleDrawTile(tile.id)}
                >
                  <div className="font-semibold">{tile.name}</div>

                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Value: {tile.value}
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    x:{tile.x} y:{tile.y} z:{tile.z}
                  </div>
                </button>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
}