"use client";

import { useEffect, useState } from "react";
import { getRoom, startGame } from "@/lib/api";
import { createGameHubConnection } from "@/lib/gameHub";
import { useParams, useRouter } from "next/navigation";
import { getPlayerIdForRoom } from "@/lib/gameSession";

type RoomPageProps = {
  params: {
    roomId: string;
  };
};

export default function RoomPage() {
  const router = useRouter();
  const params = useParams<{ roomId: string }>();

  const roomId = params.roomId;

  const [gameRoom, setRoom] = useState<any>(null);
  const [error, setError] = useState("");

  console.log("roomId", roomId);

  useEffect(() => {
    if (!roomId) return;

    async function loadRoom() {
      try {
        setError("");

        const data = await getRoom(roomId);
        const loadedRoom = data.gameRoom ?? data.room ?? data;

        if (!loadedRoom?.id) {
          throw new Error("Room response did not contain a valid room.");
        }

        setRoom(loadedRoom);
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
        connection.on("PlayerJoined", (payload) => {
          if (cancelled) return;

          console.log("PlayerJoined payload:", payload);

          const updatedRoom = payload.gameRoom ?? payload.room ?? payload;

          if (!updatedRoom?.id) {
            setError("PlayerJoined event did not contain a valid room.");
            return;
          }

          setRoom(updatedRoom);
        });

        connection.on("GameStarted", (payload) => {
          if (cancelled) return;

          const updatedRoom = payload.gameRoom ?? payload.room ?? payload;

          if (!updatedRoom?.id) {
            setError("GameStarted event did not contain a valid room.");
            return;
          }

          setRoom(updatedRoom);
          router.push(`/game/${updatedRoom.id}`);
        });

        connection.on("GameEnded", (payload) => {
          if (cancelled) return;

          const endedRoom = payload.gameRoom ?? payload.room ?? payload;

          if (endedRoom?.id) {
            setRoom(endedRoom);
            router.push("/");
          }
        });

        await connection.start();

        if (cancelled) {
          try {
            await connection.stop();
          } catch {
            // Ignore cleanup error
          }
          return;
        }

        await connection.invoke("JoinRoomGroup", roomId);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not connect to realtime updates"
          );
        }
      }
    }

    connect();

    return () => {
      cancelled = true;

      void (async () => {
        try {
          if (
            connection.state === "Connected" ||
            connection.state === "Connecting" ||
            connection.state === "Reconnecting"
          ) {
            await connection.stop();
          }
        } catch {
          // Ignore cleanup errors during navigation/dev reloads
        }
      })();
    };
  }, [roomId, router]);

  async function handleStartGame() {
    try {
      const playerId = getPlayerIdForRoom(roomId);

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

  if (!gameRoom) {
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
        <p className="text-4xl font-bold tracking-widest">{gameRoom.joinCode ?? "No join code available"}</p>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="mb-3 text-xl font-semibold">Players</h2>

        <ul className="space-y-2">
          {(gameRoom.players ?? []).map((player: any) => (
            <li key={player.id} className="flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: player.color }}
              />
              <span>{player.displayName}</span>
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