"use client";

import { useEffect, useState } from "react";
import { getRoom, startGame } from "@/lib/api";
import { createGameHubConnection } from "@/lib/gameHub";
import { useRouter } from "next/navigation";

type RoomPageProps = {
  params: {
    roomId: string;
  };
};

export default function RoomPage({ params }: RoomPageProps) {
  const router = useRouter();

  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRoom() {
      try {
        const data = await getRoom(params.roomId);
        setRoom(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load room");
      }
    }

    loadRoom();
  }, [params.roomId]);

  useEffect(() => {
    const connection = createGameHubConnection();

    async function connect() {
      await connection.start();
      await connection.invoke("JoinRoomGroup", params.roomId);

      connection.on("RoomUpdated", (updatedRoom) => {
        setRoom(updatedRoom);
      });

      connection.on("GameStarted", (startedRoom) => {
        setRoom(startedRoom);
        router.push(`/game/${startedRoom.id}`);
      });
    }

    connect();

    return () => {
      connection.stop();
    };
  }, [params.roomId, router]);

  async function handleStartGame() {
    try {
      const playerId = localStorage.getItem("playerId");

      if (!playerId) {
        throw new Error("Missing playerId");
      }

      const startedRoom = await startGame(params.roomId, playerId);
      setRoom(startedRoom);
      router.push(`/game/${params.roomId}`);
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
        className="rounded bg-black px-4 py-2 text-white"
        onClick={handleStartGame}
      >
        Start game
      </button>
    </main>
  );
}