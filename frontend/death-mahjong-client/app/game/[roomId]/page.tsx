"use client";

import { useEffect, useState, useRef } from "react";
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
import MobileGameView from "@/components/MobileGameView";

export default function GamePage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;
  const router = useRouter();

  const [gameRoom, setRoom] = useState<any>(null);
  const [latestMove, setLatestMove] = useState<any>(null);
  const [error, setError] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const [drawnTilePreview, setDrawnTilePreview] = useState<any>(null);
  const drawnTilePreviewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

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
    return () => {
      if (drawnTilePreviewTimeoutRef.current) {
        clearTimeout(drawnTilePreviewTimeoutRef.current);
      }
    };
  }, []);

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

  function showDrawnTilePreview(move: any) {
    if (!move?.tileName) return;

    if (drawnTilePreviewTimeoutRef.current) {
      clearTimeout(drawnTilePreviewTimeoutRef.current);
    }

    setDrawnTilePreview(move);

    drawnTilePreviewTimeoutRef.current = setTimeout(() => {
      setDrawnTilePreview(null);
    }, 500);
  }

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
      showDrawnTilePreview(move);

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

  const players = gameRoom.players ?? [];

  const playerSlots = players.map((player: any, index: number) => ({
    player,
    playerNumber: index + 1,
  }));

  const leftPlayerSlots = playerSlots.filter(
    (slot: any) => slot.playerNumber % 2 === 1
  );

  const rightPlayerSlots = playerSlots.filter(
    (slot: any) => slot.playerNumber % 2 === 0
  );

  const currentPlayer = players[gameRoom.currentPlayerIndex] ?? null;
  const currentPlayerId = currentPlayer?.id;

  const myPlayerID =
    typeof window !== "undefined" ? getPlayerIdForRoom(roomId) : null;

  const me = myPlayerID
    ? players.find((player: any) => player.id === myPlayerID)
    : null;

  const isHost = myPlayerID === gameRoom.hostPlayerId;

  const mySummary = myPlayerID
    ? gameRoom.playerDrinksSummaries?.find(
      (summary: any) => summary.playerId === myPlayerID
    )
    : null;

  const myMoves = myPlayerID
    ? gameRoom.moves?.filter((move: any) => move.playerId === myPlayerID) ?? []
    : [];

  const myPlayerIndex = myPlayerID
    ? players.findIndex((player: any) => player.id === myPlayerID)
    : -1;

  const playersBeforeMyTurn =
    myPlayerIndex === -1 || players.length === 0
      ? null
      : (myPlayerIndex - gameRoom.currentPlayerIndex + players.length) %
      players.length;

  return (
    <>
      <main
        className="min-h-screen bg-cover bg-center bg-no-repeat p-4 text-slate-950 dark:text-slate-100"
        style={{
          backgroundImage: "url('/images/backgrounds/DarkBackground.png')",
        }}
      >
        <section className="lg:hidden">
          <MobileGameView
            gameRoom={gameRoom}
            me={me}
            mySummary={mySummary}
            myMoves={myMoves}
            currentPlayer={currentPlayer}
            playersBeforeMyTurn={playersBeforeMyTurn}
            error={error}
            isHost={isHost}
            onDrawTile={handleDrawTile}
            onRandomDrawTile={handleRandomDrawTile}
            onAbortGame={handleAbortGame}
          />
        </section>

        <div className="hidden min-h-[calc(100vh-2rem)] gap-4 lg:grid lg:grid-cols-[18rem_1fr_18rem]">
          <PlayerColumn
            slots={leftPlayerSlots}
            gameRoom={gameRoom}
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

            {showDebug && (
              <DebugPanel
                tiles={gameRoom.tiles}
                hasEnded={gameRoom.hasEnded}
                onDrawTile={handleDrawTile}
              />
            )}
          </section>

          <PlayerColumn
            slots={rightPlayerSlots}
            gameRoom={gameRoom}
            currentPlayerId={currentPlayerId}
          />
        </div>
      </main>

      {drawnTilePreview?.tileName && (
        <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-black/20">
          <div className="animate-[tile-pop_500ms_ease-out_forwards] rounded-3xl bg-white/90 p-6 shadow-2xl dark:bg-slate-900/90">
            <img
              src={getTileImageSrc(drawnTilePreview.tileName)}
              alt={drawnTilePreview.tileName}
              className="h-48 w-auto"
            />

            <p className="mt-3 text-center text-lg font-bold text-slate-950 dark:text-slate-100">
              {drawnTilePreview.tileName}
            </p>
          </div>
        </div>
      )}
    </>
  );
}