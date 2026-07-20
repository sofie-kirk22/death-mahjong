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

  const myPlayerId = getPlayerIdForRoom(roomId);

  const me = myPlayerId
    ? gameRoom?.players?.find((player: any) => player.id === myPlayerId)
    : null;

  const isHost = myPlayerId === gameRoom?.hostPlayerId;

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
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat p-4 text-slate-950 dark:text-slate-100"
        style={{
          backgroundImage: "url('/images/backgrounds/DarkBackground.png')",
        }}
      >
        <div className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-2xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/85">
          {error ? (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          ) : (
            "Loading room..."
          )}
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat p-4 text-slate-950 dark:text-slate-100"
      style={{
        backgroundImage: "url('/images/backgrounds/DarkBackground.png')",
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-3xl flex-col gap-6 rounded-3xl bg-white/85 p-6 shadow-2xl backdrop-blur-sm dark:bg-slate-950/85">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-red-700 dark:text-red-400">
            Lobby
          </p>

          <div className="mt-2 flex items-center justify-center gap-3">
            <h1 className="text-4xl font-bold tracking-wide">Death Mahjong</h1>

            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: me?.color ?? "#94a3b8" }}
              />
              <span>{me?.displayName ?? "Unknown"}</span>
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-2 text-xs">
            {gameRoom.hardCoreMode && (
              <span className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                Hardcore
              </span>
            )}

            {gameRoom.fullDeckMode && (
              <span className="rounded-full bg-purple-100 px-2 py-1 font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                Full deck
              </span>
            )}

            {isHost && (
              <span className="rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Host
              </span>
            )}
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Join code
          </p>

          <p className="mt-2 font-mono text-5xl font-bold tracking-[0.25em] text-slate-950 dark:text-slate-100">
            {gameRoom.joinCode ?? "------"}
          </p>

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Share this code with the other players.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Players</h2>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {(gameRoom.players ?? []).length}/{gameRoom.maxPlayers ?? 12}
            </span>
          </div>

          <ul className="space-y-2">
            {(gameRoom.players ?? []).map((player: any) => {
              const playerIsHost = player.id === gameRoom.hostPlayerId;
              const playerIsMe = player.id === myPlayerId;

              return (
                <li
                  key={player.id}
                  className={[
                    "flex items-center justify-between rounded-xl border p-3",
                    playerIsMe
                      ? "border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/40"
                      : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: player.color ?? "#94a3b8" }}
                    />

                    <span className="font-medium">{player.displayName}</span>
                  </div>

                  <div className="flex gap-1.5">
                    {playerIsMe && (
                      <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">
                        You
                      </span>
                    )}

                    {playerIsHost && (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        Host
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {isHost && !gameRoom.hasStarted && (
            <button
              onClick={handleStartGame}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              Start game
            </button>
          )}

          {!isHost && !gameRoom.hasStarted && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Waiting for the host to start the game.
            </p>
          )}

          {gameRoom.hasStarted && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              This game has already started.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}