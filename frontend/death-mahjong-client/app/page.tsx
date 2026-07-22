"use client";

import { useState } from "react";
import { createRoom, joinRoom } from "@/lib/api";
import { useRouter } from "next/navigation";
import { saveGameSession } from "@/lib/gameSession";

import AppNav from "@/components/AppNav";

export default function HomePage() {
  const router = useRouter();

  const [hostName, setHostName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [hardcoreMode, setHardcoreMode] = useState(false);
  const [fullDeckMode, setFullDeckMode] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateRoom() {
    try {
      setError("");

      const room = await createRoom(hostName, hardcoreMode, fullDeckMode);

      const hostPlayer = room.players[0];

      saveGameSession(room.id, hostPlayer.id, room.joinCode);

      router.push(`/room/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create room");
    }
  }

  async function handleJoinRoom() {
    try {
      setError("");

      const result = await joinRoom(joinCode, joinName);

      saveGameSession(
        result.gameRoom.id,
        result.player.id,
        result.gameRoom.joinCode
      );

      router.push(`/room/${result.gameRoom.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join room");
    }
  }

  return (
    <>
      <AppNav />

      <main
        className="min-h-screen bg-cover bg-center bg-no-repeat px-4 pb-4 pt-24 text-slate-950 dark:text-slate-100"
        style={{
          backgroundImage: "url('/images/backgrounds/DarkBackground.png')",
        }}
      >
        <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-4xl flex-col justify-center gap-6 rounded-3xl bg-white/85 p-6 shadow-2xl backdrop-blur-sm dark:bg-slate-950/85">
          <header className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-red-700 dark:text-red-400">
              Welcome to
            </p>

            <h1 className="mt-2 text-5xl font-bold tracking-wide">
              Death Mahjong
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 dark:text-slate-400">
              Create a room, invite your friends, and draw your way through the
              deadliest Mahjong table.
            </p>
          </header>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-xl font-semibold">Create room</h2>

              <label className="mb-3 block">
                <span className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
                  Your name
                </span>

                <input
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Enter your name"
                  value={hostName}
                  onChange={(event) => setHostName(event.target.value)}
                />
              </label>

              <div className="mb-4 space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={hardcoreMode}
                    onChange={(event) => setHardcoreMode(event.target.checked)}
                    className="mt-1 h-4 w-4"
                  />

                  <div>
                    <p className="font-medium">Hardcore mode</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Removes the normal sip cap.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={fullDeckMode}
                    onChange={(event) => setFullDeckMode(event.target.checked)}
                    className="mt-1 h-4 w-4"
                  />

                  <div>
                    <p className="font-medium">Full deck mode</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Uses the full tile deck regardless of player count.
                    </p>
                  </div>
                </label>
              </div>

              <button
                className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                onClick={handleCreateRoom}
                disabled={!hostName.trim()}
              >
                Create room
              </button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-xl font-semibold">Join room</h2>

              <label className="mb-3 block">
                <span className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
                  Room code
                </span>

                <input
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-slate-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="123456"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value)}
                />
              </label>

              <label className="mb-4 block">
                <span className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
                  Your name
                </span>

                <input
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Enter your name"
                  value={joinName}
                  onChange={(event) => setJoinName(event.target.value)}
                />
              </label>

              <button
                className="w-full rounded-xl bg-red-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
                onClick={handleJoinRoom}
                disabled={!joinCode.trim() || !joinName.trim()}
              >
                Join room
              </button>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}