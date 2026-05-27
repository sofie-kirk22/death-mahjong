"use client";

import { useState } from "react";
import { createRoom, joinRoom } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const [hostName, setHostName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [hardcoreMode, setHardcoreMode] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateRoom() {
    try {
      setError("");

      const room = await createRoom(hostName, hardcoreMode);

      const hostPlayer = room.players[0];

      localStorage.setItem("roomId", room.id);
      localStorage.setItem("playerId", hostPlayer.id);
      localStorage.setItem("joinCode", room.joinCode);

      router.push(`/room/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create room");
    }
  }

  async function handleJoinRoom() {
    try {
      setError("");

      const result = await joinRoom(joinCode, joinName);

      localStorage.setItem("roomId", result.gameRoom.id);
      localStorage.setItem("playerId", result.player.id);
      localStorage.setItem("joinCode", result.gameRoom.joinCode);

      router.push(`/room/${result.gameRoom.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join room");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-8 p-8">
      <h1 className="text-3xl font-bold">Death Mahjong</h1>

      {error && (
        <div className="rounded-lg border border-red-300 p-3 text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border p-4">
        <h2 className="mb-4 text-xl font-semibold">Create room</h2>

        <input
          className="mb-3 w-full rounded border p-2"
          placeholder="Your name"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
        />

        <label className="mb-3 flex gap-2">
          <input
            type="checkbox"
            checked={hardcoreMode}
            onChange={(e) => setHardcoreMode(e.target.checked)}
          />
          Hardcore mode
        </label>

        <button
          className="rounded bg-black px-4 py-2 border border-white text-white"
          onClick={handleCreateRoom}
        >
          Create room
        </button>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="mb-4 text-xl font-semibold">Join room</h2>

        <input
          className="mb-3 w-full rounded border p-2"
          placeholder="Room code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />

        <input
          className="mb-3 w-full rounded border p-2"
          placeholder="Your name"
          value={joinName}
          onChange={(e) => setJoinName(e.target.value)}
        />

        <button
          className="rounded bg-black px-4 py-2 border border-white text-white"
          onClick={handleJoinRoom}
        >
          Join room
        </button>
      </section>
    </main>
  );
}