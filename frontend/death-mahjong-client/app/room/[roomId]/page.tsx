"use client";

import { useEffect, useState } from "react";
import { getRoom, startGame } from "@/lib/api";
import { createGameHubConnection } from "@/lib/gameHub";
import { useParams, useRouter } from "next/navigation";

type RoomPageProps = {
  params: {
    roomId: string;
  };
};

export default function RoomPage() {
  const router = useRouter();
  const params = useParams<{ roomId: string }>();

  const roomId = params.roomId;

  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState("");

  console.log("roomId", roomId);

  useEffect(() => {
    async function loadRoom() {
      try {
        const data = await getRoom(roomId);
        setRoom(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load room");
      }
    }

    loadRoom();
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const connection = createGameHubConnection();
    let cancelled = false;

    async function connect() {
      try {
        connection.on("RoomUpdated", (updatedRoom) => {
          if (!cancelled) {
            setRoom(updatedRoom);
          }
        });

        connection.on("GameStarted", (startedRoom) => {
          if (!cancelled) {
            setRoom(startedRoom);
            router.push(`/game/${startedRoom.id}`);
          }
        });

        await connection.start();

        if (cancelled) {
          await connection.stop();
          return;
        }

        await connection.invoke("JoinRoomGroup", roomId);
      } catch (err) {
        if (!cancelled) {
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

  async function handleStartGame() {
    try {
      const playerId = localStorage.getItem("playerId");

      if (!playerId) {
        throw new Error("Missing playerId");
      }

      const startedRoom = await startGame(roomId, playerId);
      setRoom(startedRoom);
      router.push(`/game/${roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start game");
    }
  }

  if (!room) {
    return <main className="p-8">Loading room...</main>;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold">Lobby</h1>

      {error && (
        <div className="rounded-lg border border-red-300 p-3 text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border p-4">
        <p className="text-sm text-gray-500">Join code</p>
        <p className="text-4xl font-bold tracking-widest">{room.joinCode}</p>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="mb-3 text-xl font-semibold">Players</h2>

        <ul className="space-y-2">
          {room.players.map((player: any) => (
            <li key={player.id} className="flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: player.color }}
              />
              {player.displayName}
            </li>
          ))}
        </ul>
      </section>

      <button
        className="rounded bg-black px-4 py-2 border border-white text-white"
        onClick={handleStartGame}
      >
        Start game
      </button>
    </main>
  );
}