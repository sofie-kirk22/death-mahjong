"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLeaderboards, getRecentGames } from "@/lib/api";
import AppNav from "@/components/AppNav";

type LeaderboardRow = {
    displayName: string;
    gamesPlayed?: number;
    totalSips?: number;
    totalDragons?: number;
    totalWinds?: number;
    completedGameId?: string;
    dragonCount?: number;
    windCount?: number;
    finalRank?: number;
    endedAt?: string;
    hardCoreMode?: boolean;
    fullDeckMode?: boolean;
};

type RecentGame = {
    id: string;
    endedAt: string;
    durationSeconds: number;
    playerCount: number;
    drawnTileCount: number;
    totalSips: number;
    winnerPlayerName?: string;
    hardCoreMode: boolean;
    fullDeckMode: boolean;
    endReason?: string;
};

type LeaderboardsResponse = {
    totalSips: LeaderboardRow[];
    totalDragons: LeaderboardRow[];
    totalWinds: LeaderboardRow[];
    bestSingleGame: LeaderboardRow[];
    worstSingleGame: LeaderboardRow[];
};

export default function StatsPage() {
    const [leaderboards, setLeaderboards] = useState<LeaderboardsResponse | null>(
        null
    );
    const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                setError("");
                setIsLoading(true);

                const [leaderboardsData, recentGamesData] = await Promise.all([
                    getLeaderboards(10),
                    getRecentGames(8),
                ]);

                setLeaderboards(leaderboardsData);
                setRecentGames(recentGamesData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Could not load stats");
            } finally {
                setIsLoading(false);
            }
        }

        loadStats();
    }, []);

    return (
        <>
            <AppNav />

            <main
                className="min-h-screen bg-cover bg-center bg-no-repeat px-4 pb-4 pt-24 text-slate-950 dark:text-slate-100"
                style={{
                    backgroundImage: "url('/images/backgrounds/DarkBackground.png')",
                }}
            >
                <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-6xl flex-col gap-6 rounded-3xl bg-white/85 p-6 shadow-2xl backdrop-blur-sm dark:bg-slate-950/85">
                    <header className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm font-medium uppercase tracking-[0.3em] text-red-700 dark:text-red-400">
                            Death Mahjong
                        </p>

                        <h1 className="mt-2 text-4xl font-bold tracking-wide">Statistics</h1>
                    </header>

                    {error && (
                        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                            {error}
                        </div>
                    )}

                    {isLoading && (
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            Loading statistics...
                        </section>
                    )}

                    {!isLoading && leaderboards && (
                        <>
                            <section className="grid gap-4 lg:grid-cols-2">
                                <LeaderboardCard
                                    title="Total sips"
                                    subtitle="Most sips across all games"
                                    rows={leaderboards.totalSips}
                                    valueLabel="sips"
                                    getValue={(row) => row.totalSips ?? 0}
                                />

                                <LeaderboardCard
                                    title="Total dragons"
                                    subtitle="Most dragons drawn"
                                    rows={leaderboards.totalDragons}
                                    valueLabel="dragons"
                                    getValue={(row) => row.totalDragons ?? 0}
                                />

                                <LeaderboardCard
                                    title="Total winds"
                                    subtitle="Most winds drawn"
                                    rows={leaderboards.totalWinds}
                                    valueLabel="winds"
                                    getValue={(row) => row.totalWinds ?? 0}
                                />

                                <LeaderboardCard
                                    title="Best single game"
                                    subtitle="Highest sip count in one game"
                                    rows={leaderboards.bestSingleGame}
                                    valueLabel="sips"
                                    getValue={(row) => row.totalSips ?? 0}
                                    showSingleGameDetails
                                />

                                <div className="lg:col-span-2">
                                    <LeaderboardCard
                                        title="Worst single game"
                                        subtitle="Lowest sip count in one game"
                                        rows={leaderboards.worstSingleGame}
                                        valueLabel="sips"
                                        getValue={(row) => row.totalSips ?? 0}
                                        showSingleGameDetails
                                    />
                                </div>
                            </section>

                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-xl font-semibold">Recent games</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Latest completed games saved to the database.
                                        </p>
                                    </div>
                                </div>

                                {recentGames.length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        No completed games yet.
                                    </p>
                                ) : (
                                    <ul className="space-y-3">
                                        {recentGames.map((game) => (
                                            <RecentGameRow key={game.id} game={game} />
                                        ))}
                                    </ul>
                                )}
                            </section>
                        </>
                    )}

                    <Link
                        href="/"
                        className="mx-auto rounded-xl border border-slate-300 bg-white/90 px-5 py-2 text-center font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        Back to start page
                    </Link>
                </div>
            </main>
        </>
    );
}

function LeaderboardCard({
    title,
    subtitle,
    rows,
    valueLabel,
    getValue,
    showSingleGameDetails = false,
}: {
    title: string;
    subtitle: string;
    rows: LeaderboardRow[];
    valueLabel: string;
    getValue: (row: LeaderboardRow) => number;
    showSingleGameDetails?: boolean;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4">
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {subtitle}
                </p>
            </div>

            {rows.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    No data yet.
                </p>
            ) : (
                <ol className="space-y-2">
                    {rows.map((row, index) => (
                        <li
                            key={`${title}-${row.displayName}-${index}`}
                            className={[
                                "flex items-center justify-between gap-3 rounded-xl border p-3",
                                index === 0
                                    ? "border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/40"
                                    : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800",
                            ].join(" ")}
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="w-7 text-sm font-bold text-slate-400">
                                        {getRankLabel(index)}
                                    </span>

                                    <p className="truncate font-semibold">{row.displayName}</p>
                                </div>

                                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {showSingleGameDetails ? (
                                        <span>
                                            {row.dragonCount ?? 0} dragons · {row.windCount ?? 0}{" "}
                                            winds
                                            {row.endedAt ? ` · ${formatDate(row.endedAt)}` : ""}
                                            {row.hardCoreMode ? " · Hardcore" : ""}
                                            {row.fullDeckMode ? " · Full deck" : ""}
                                        </span>
                                    ) : (
                                        <span>{row.gamesPlayed ?? 0} games played</span>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-2xl font-bold">{getValue(row)}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {valueLabel}
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}

function RecentGameRow({ game }: { game: RecentGame }) {
    return (
        <li className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-semibold">
                        Winner: {game.winnerPlayerName ?? "Unknown"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(game.endedAt)} · {game.playerCount} players ·{" "}
                        {formatDuration(game.durationSeconds)}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-2xl font-bold">{game.totalSips}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        total sips
                    </p>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {game.drawnTileCount} tiles drawn
                </span>

                {game.hardCoreMode && (
                    <span className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                        Hardcore
                    </span>
                )}

                {game.fullDeckMode && (
                    <span className="rounded-full bg-purple-100 px-2 py-1 font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        Full deck
                    </span>
                )}
            </div>
        </li>
    );
}

function getRankLabel(index: number) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";

    return `#${index + 1}`;
}

function formatDuration(durationSeconds: number) {
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = durationSeconds % 60;

    return [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
    ].join(":");
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}