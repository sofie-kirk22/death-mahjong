"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { drawTile, getRoom } from "@/lib/api";
import { createGameHubConnection } from "@/lib/gameHub";

export default function GamePage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;
  
  const [room, setRoom] = useState<any>(null);
  const [latestMove, setLatestMove] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRoom() {
      try {
        const data = await getRoom(roomId);
        setRoom(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load game");
      }
    }

    loadRoom();
  }, [roomId]);

  useEffect(() => {
    const connection = createGameHubConnection();

    async function connect() {
      await connection.start();

      if(!roomId) {
        throw new Error("Missing roomId");
      }
      
      await connection.invoke("JoinRoomGroup", roomId);

      connection.on("TileDrawn", (payload) => {
        setRoom(payload.room);
        setLatestMove(payload.move);
      });

      connection.on("InvalidMove", (message) => {
        setError(message);
      });
    }

    connect();

    return () => {
      connection.stop();
    };
  }, [roomId]);

  async function handleDrawTile(tileId: string) {
    try {
      setError("");

      const playerId = localStorage.getItem("playerId");

      if (!playerId) {
        throw new Error("Missing playerId");
      }

      const result = await drawTile(roomId, playerId, tileId);

      setRoom(result.room);
      setLatestMove(result.move);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draw tile");
    }
  }

  if (!room) {
    return <main className="p-8">Loading game...</main>;
  }

  const currentPlayer = room.players[room.currentPlayerIndex];

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold">Game</h1>

      {error && (
        <div className="rounded-lg border border-red-300 p-3 text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border p-4">
        <p className="text-sm text-gray-500">Current player</p>
        <p className="text-xl font-semibold">{currentPlayer.displayName}</p>
      </section>

      {latestMove && (
        <section className="rounded-2xl border p-4">
          <h2 className="text-xl font-semibold">Drink result</h2>
          <p>
            {latestMove.tileName}: {latestMove.drinks} sips
          </p>
          <p className="text-sm text-gray-500">
            Drawn {latestMove.sameTileDrawCount} time(s)
          </p>
        </section>
      )}

      <section className="grid grid-cols-4 gap-3 rounded-2xl border p-4">
        {room.tiles.map((tile: any) => (
          <button
            key={tile.id}
            disabled={tile.isDrawn}
            className="rounded border p-3 text-left disabled:opacity-20"
            onClick={() => handleDrawTile(tile.id)}
          >
            <div className="font-semibold">{tile.name}</div>
            <div className="text-sm text-gray-500">Value: {tile.value}</div>
            <div className="text-xs text-gray-400">
              x:{tile.x} y:{tile.y} z:{tile.z}
            </div>
          </button>
        ))}
      </section>
    </main>
  );
}