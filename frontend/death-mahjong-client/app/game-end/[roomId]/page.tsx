"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRoom } from "@/lib/api";

export default function GameEndPage() {
    const params = useParams<{ roomId: string }>();
    const roomId = params.roomId;
    const router = useRouter();

    const [gameRoom, setGameRoom] = useState<any>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadRoom() {
            try {
                const data = await getRoom(roomId);
                setGameRoom(data.room ?? data.gameRoom ?? data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Could not load game end");
            }
        }

        if (roomId) {
            loadRoom();
        }
    }, [roomId]);

    if (error) {
        return (
            <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 bg-white p-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
                <h1 className="text-3xl font-bold">Game Ended</h1>
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                    {error}
                </div>
            </main>
        );
    }

    if (!gameRoom) {
        return (
            <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 bg-white p-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
                Loading game results...
            </main>
        );
    }

    const playerSummaries = gameRoom.playerDrinksSummaries ?? [];

    const durationHours = gameRoom.endedAt
        ? ((new Date(gameRoom.endedAt).getTime() - new Date(gameRoom.startedAt).getTime()) / 1000 / 60 / 60)
        : 0;

    const durationHoursRounded = durationHours.toFixed(2);

    const winner = [...playerSummaries].sort(
        (a: any, b: any) => b.totalSips - a.totalSips
    )[0];

    const loser = [...playerSummaries].sort(
        (a: any, b: any) => a.totalSips - b.totalSips
    )[0];

    return (
        <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 bg-white p-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
            <h1 className="text-3xl font-bold">Game Ended</h1>

            {winner && (
                <section className="rounded-2xl border border-green-300 bg-green-50 p-4 text-green-950 shadow-sm dark:border-green-700 dark:bg-green-950 dark:text-green-100">
                    <p className="text-sm opacity-80">Winner</p>
                    <p className="text-2xl font-bold">{winner.playerName}</p>
                    {/* <p>{winner.totalSips} total sips</p> */}
                </section>
            )}

            {loser && loser.playerId !== winner?.playerId && (
                <section className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-950 shadow-sm dark:border-red-700 dark:bg-red-950 dark:text-red-100">
                    <p className="text-sm opacity-80">Loser</p>
                    <p className="text-2xl font-bold">{loser.playerName}</p>
                    {/* <p>{loser.totalSips} total sips</p> */}
                </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-3 text-xl font-semibold">Final sip count</h2>

                <ul className="space-y-3">
                    {[...playerSummaries]
                        .sort((a: any, b: any) => b.totalSips - a.totalSips)
                        .map((summary: any, index: number) => (
                            <li
                                key={summary.playerId}
                                className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
                            >
                                <div>
                                    <p className="font-semibold">
                                        #{index + 1} {summary.playerName}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Latest:{" "}
                                        {summary.latestTileName
                                            ? `${summary.latestTileName} — ${summary.latestSips} sips`
                                            : "No tile drawn"}
                                    </p>
                                </div>

                                <p className="text-2xl font-bold">{summary.totalSips}</p>
                            </li>
                        ))}
                </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-3 text-xl font-semibold">Dragons drawn</h2>

                <ul className="space-y-3">
                    {[...playerSummaries]
                        .sort((a: any, b: any) => b.dragonCount - a.dragonCount)
                        .map((summary: any) => (
                            <li
                                key={summary.playerId}
                                className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
                            >
                                <p className="font-semibold">{summary.playerName}</p>

                                <p className="text-2xl font-bold">
                                    {summary.dragonCount ?? 0}
                                </p>
                            </li>
                        ))}
                </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-3 text-xl font-semibold">Game stats</h2>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Drawn tiles
                        </p>
                        <p className="text-2xl font-bold">{gameRoom.drawnTileCount ?? 0}</p>
                    </div>

                    <div className="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Total sips
                        </p>
                        <p className="text-2xl font-bold">
                            {playerSummaries.reduce(
                                (sum: number, player: any) => sum + player.totalSips,
                                0
                            )}
                        </p>
                    </div>

                    <div className="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Players
                        </p>
                        <p className="text-2xl font-bold">{gameRoom.players?.length ?? 0}</p>
                    </div>

                    <div className="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Duration
                        </p>
                        <p className="text-2xl font-bold">{durationHoursRounded}h</p>
                    </div>
                </div>
            </section>

            <button
                onClick={() => router.push("/")}
                className="mt-8 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
                Back to start page
            </button>
        </main>
    );
}