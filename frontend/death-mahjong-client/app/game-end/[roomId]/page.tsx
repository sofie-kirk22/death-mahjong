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
            <main
                className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat p-4 text-slate-950 dark:text-slate-100"
                style={{
                    backgroundImage: "url('/images/backgrounds/DarkBackground.png')",
                }}
            >
                <div className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-2xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/85">
                    Loading game results...
                </div>
            </main>
        );
    }

    const playerSummaries = gameRoom.playerDrinksSummaries ?? [];

    const duration = formatDuration(gameRoom.startedAt, gameRoom.endedAt);

    const winner = [...playerSummaries].sort(
        (a: any, b: any) => b.totalSips - a.totalSips
    )[0];

    const loser = [...playerSummaries].sort(
        (a: any, b: any) => a.totalSips - b.totalSips
    )[0];

    return (
        <main
            className="min-h-screen bg-cover bg-center bg-no-repeat p-4 text-slate-950 dark:text-slate-100"
            style={{
                backgroundImage: "url('/images/backgrounds/DarkBackground.png')",
            }}
        >
            <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col gap-6 rounded-3xl bg-white/85 p-6 shadow-2xl backdrop-blur-sm dark:bg-slate-950/85">
                <header className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm font-medium uppercase tracking-[0.3em] text-red-700 dark:text-red-400">
                        Game over
                    </p>

                    <h1 className="mt-2 text-4xl font-bold tracking-wide">
                        Death Mahjong
                    </h1>

                    <div className="mx-auto mt-4 max-w-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-950">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Duration
                        </p>
                        <p className="font-mono text-2xl font-semibold">{duration}</p>
                    </div>
                </header>

                <section className="grid gap-4 md:grid-cols-2">
                    {winner && (
                        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950 shadow-sm dark:border-amber-600 dark:bg-amber-950/50 dark:text-amber-100">
                            <p className="text-sm font-medium uppercase tracking-wide opacity-80">
                                Winner
                            </p>
                            <p className="mt-1 text-3xl font-bold">{winner.playerName}</p>
                            <p className="mt-2 text-sm opacity-80">
                                {winner.totalSips} total sips
                            </p>
                        </section>
                    )}

                    {loser && loser.playerId !== winner?.playerId && (
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                            <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Lowest sip count
                            </p>
                            <p className="mt-1 text-3xl font-bold">{loser.playerName}</p>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                {loser.totalSips} total sips
                            </p>
                        </section>
                    )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-4 text-xl font-semibold">Final sip count</h2>

                    <ul className="space-y-3">
                        {[...playerSummaries]
                            .sort((a: any, b: any) => b.totalSips - a.totalSips)
                            .map((summary: any, index: number) => (
                                <li
                                    key={summary.playerId}
                                    className={[
                                        "flex items-center justify-between rounded-xl border p-3 transition",
                                        index === 0
                                            ? "border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/40"
                                            : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800",
                                    ].join(" ")}
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

                <section className="grid gap-4 md:grid-cols-2">
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-xl font-semibold">Dragons drawn</h2>

                        <ul className="space-y-3">
                            {[...playerSummaries]
                                .sort((a: any, b: any) => b.dragonCount - a.dragonCount)
                                .map((summary: any) => (
                                    <li
                                        key={summary.playerId}
                                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
                                    >
                                        <p className="font-semibold">{summary.playerName}</p>
                                        <p className="text-2xl font-bold">
                                            {summary.dragonCount ?? 0}
                                        </p>
                                    </li>
                                ))}
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-xl font-semibold">Game stats</h2>

                        <div className="grid grid-cols-2 gap-3">
                            <StatCard label="Drawn tiles" value={gameRoom.drawnTileCount ?? 0} />

                            <StatCard
                                label="Total sips"
                                value={playerSummaries.reduce(
                                    (sum: number, player: any) => sum + player.totalSips,
                                    0
                                )}
                            />

                            <StatCard label="Players" value={gameRoom.players?.length ?? 0} />

                            <StatCard label="Duration" value={duration} mono />
                        </div>
                    </section>
                </section>

                <button
                    onClick={() => router.push("/")}
                    className="mx-auto mt-2 rounded-xl border border-slate-300 bg-white/90 px-5 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    Back to start page
                </button>
            </div>
        </main>
    );
}

function formatDuration(startedAt?: string, endedAt?: string | null) {
    if (!startedAt || !endedAt) return "00:00:00";

    const start = new Date(startedAt).getTime();
    const end = new Date(endedAt).getTime();

    const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
    ].join(":");
}

function StatCard({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string | number;
    mono?: boolean;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className={["text-2xl font-bold", mono ? "font-mono" : ""].join(" ")}>
                {value}
            </p>
        </div>
    );
}