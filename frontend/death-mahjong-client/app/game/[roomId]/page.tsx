"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { abortGame, drawTile, getRoom } from "@/lib/api";
import { createGameHubConnection } from "@/lib/gameHub";
import { getTileImageSrc } from "@/lib/tileImages";
import { clearGameSession, getPlayerIdForRoom } from "@/lib/gameSession";

import { PlayerDrawnTiles } from "@/components/PlayerDrawnTiles";
import { PyramidBoard } from "@/components/PyramidBoard";
import DebugPanel from "@/components/DebugPanel";
import GameHeader from "@/components/GameHeader";
import RemainingTilesBar from "@/components/RemainingTilesBar";
import PlayerColumn from "@/components/PlayerColumn";

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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code !== "Space") return;

      const target = event.target as HTMLElement;

      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if (isTyping) return;

      if (event.repeat) return;

      event.preventDefault();

      void handleRandomDrawTile();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameRoom, roomId]);

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

  async function handleRandomDrawTile() {
    if (!gameRoom) return;

    if (gameRoom.hasEnded) {
      setError("Game has already ended.");
      return;
    }

    const playerId = getPlayerIdForRoom(roomId);

    if (!playerId) {
      setError("Missing playerId");
      return;
    }

    const currentPlayerId = gameRoom.currentPlayerId ?? gameRoom.players[gameRoom.currentPlayerIndex]?.id;

    if (playerId !== currentPlayerId) {
      setError("It's not your turn to draw a tile.");
      return;
    }

    const freeTiles = gameRoom.tiles.filter((tile: any) => !tile.isDrawn && tile.isDrawable);

    if (freeTiles.length === 0) {
      setError("No drawable tiles left.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * freeTiles.length);
    const randomTile = freeTiles[randomIndex];

    await handleDrawTile(randomTile.id);
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

  const players = gameRoom.players ?? [];

  const playerSlots = Array.from({ length: 12 }, (_, index) => { return players[index] ?? null });

  const leftPlayerSlots = playerSlots.slice(0, 6);
  const rightPlayerSlots = playerSlots.slice(6, 12);

  const currentPlayer = gameRoom.players?.[gameRoom.currentPlayerIndex] ?? null;

  const currentPlayerId = currentPlayer?.id;

  const myPlayerID =
    typeof window !== "undefined" ? getPlayerIdForRoom(roomId) : null;

  const isHost = myPlayerID === gameRoom.hostPlayerId;

  const latestMovePlayer =
    latestMove && gameRoom?.players
      ? gameRoom.players.find((player: any) => player.id === latestMove.playerId)
      : null;

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat p-4 text-slate-950 dark:text-slate-100"
      style={{
        backgroundImage: "url('/images/backgrounds/DarkBackground.png')",
      }}
    >
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 lg:grid-cols-[18rem_1fr_18rem]">
        <PlayerColumn
          players={leftPlayerSlots}
          gameRoom={gameRoom}
          startNumber={1}
          currentPlayerId={currentPlayerId}
        />

        <section className="flex min-h-full flex-col gap-4">
          <GameHeader
            me={me}
            currentPlayer={currentPlayer}
            gameRoom={gameRoom}
            error={error}
          />

          <div className="flex flex-1 items-center justify-center rounded-3xl border border-emerald-700 bg-emerald-700 p-6 shadow-inner dark:border-emerald-950 dark:bg-emerald-950">
            <PyramidBoard
              tiles={gameRoom.tiles}
              onDrawTile={handleDrawTile}
              disabled={gameRoom.hasEnded}
            />
          </div>

          <RemainingTilesBar summary={gameRoom.remainingTileSummary} />

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

          {/* Debug panel toggle button 
          <button
            className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 bg-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? "Hide debug" : "Show debug"}
          </button>
          */}

          {showDebug && (
            <DebugPanel
              tiles={gameRoom.tiles}
              hasEnded={gameRoom.hasEnded}
              onDrawTile={handleDrawTile}
            />
          )}
        </section>

        <PlayerColumn
          players={rightPlayerSlots}
          gameRoom={gameRoom}
          startNumber={7}
          currentPlayerId={currentPlayerId}
        />
      </div>
    </main>
  );
}