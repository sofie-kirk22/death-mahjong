"use client";

import { FormEvent, useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { getProfileStats } from "@/lib/api";
import { getUser, saveUser } from "@/lib/userSession";
import { formatDrinkCount } from "@/lib/formatDrinkCount";

type ProfileGame = {
    playerId: string;
    displayName: string;
    finalRank: number;
    totalSips: number;
    dragonCount: number;
    windCount: number;
    latestTileName?: string | null;
    latestSips?: number | null;

    completedGameId: string;
    startedAt: string;
    endedAt: string;
    durationSeconds: number;
    playerCount: number;
    drawnTileCount: number;
    winnerPlayerId?: string | null;
    winnerPlayerName?: string | null;
    hardCoreMode: boolean;
    fullDeckMode: boolean;
    endReason?: string | null;
};

type ProfileStats = {
    user: {
        id: string;
        displayName: string;
        createdAt: string;
    };
    summary: {
        gamesPlayed: number;
        wins: number;
        totalSips: number;
        averageSips: number;
        totalDragons: number;
        totalWinds: number;
    };
    bestSingleGame?: ProfileGame | null;
    worstSingleGame?: ProfileGame | null;
    recentGames: ProfileGame[];
};

export default function ProfilePage() {
    const [displayName, setDisplayName] = useState("");
    const [profile, setProfile] = useState<ProfileStats | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const existingUser = getUser();

        if (existingUser?.displayName) {
            setDisplayName(existingUser.displayName);
        }
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedDisplayName = displayName.trim();

        if (!trimmedDisplayName) {
            setError("Please enter a display name.");
            return;
        }

        try {
            setError("");
            setIsLoading(true);

            const data = await getProfileStats(trimmedDisplayName);

            setProfile(data);

            saveUser({
                id: data.user.id,
                displayName: data.user.displayName,
            });
        } catch (err) {
            setProfile(null);
            setError(err instanceof Error ? err.message : "Could not load profile.");
        } finally {
            setIsLoading(false);
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
                <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-6xl flex-col gap-6 rounded-3xl bg-white/85 p-6 shadow-2xl backdrop-blur-sm dark:bg-slate-950/85">
                    <header className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm font-medium uppercase tracking-[0.3em] text-red-700 dark:text-red-400">
                            Death Mahjong
                        </p>

                        <h1 className="mt-2 text-4xl font-bold tracking-wide">Profile</h1>

                        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                            Enter a display name to see saved statistics for that player.
                        </p>
                    </header>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                            <label className="flex-1">
                                <span className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
                                    Display name
                                </span>

                                <input
                                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    placeholder="Sofie"
                                    value={displayName}
                                    onChange={(event) => setDisplayName(event.target.value)}
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={isLoading || !displayName.trim()}
                                className="mt-auto rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                            >
                                {isLoading ? "Loading..." : "View profile"}
                            </button>
                        </form>
                    </section>

                    {error && (
                        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                            {error}
                        </div>
                    )}

                    {profile && (
                        <>
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Player profile
                                        </p>
                                        <h2 className="text-3xl font-bold">
                                            {profile.user.displayName}
                                        </h2>
                                    </div>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Created {formatDate(profile.user.createdAt)}
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                                    <ProfileStatCard
                                        label="Games"
                                        value={profile.summary.gamesPlayed}
                                    />
                                    <ProfileStatCard label="Wins" value={profile.summary.wins} />
                                    <ProfileStatCard
                                        label="Total sips"
                                        value={profile.summary.totalSips}
                                    />
                                    <ProfileStatCard
                                        label="Average game"
                                        value={profile.summary.averageSips}
                                        suffix="sips"
                                    />
                                    <ProfileStatCard
                                        label="Dragons"
                                        value={profile.summary.totalDragons}
                                    />
                                    <ProfileStatCard
                                        label="Winds"
                                        value={profile.summary.totalWinds}
                                    />
                                </div>
                            </section>

                            <section className="grid gap-4 md:grid-cols-2">
                                <SingleGameCard
                                    title="Best single game"
                                    subtitle="Highest sip count"
                                    game={profile.bestSingleGame}
                                    highlight="good"
                                />

                                <SingleGameCard
                                    title="Worst single game"
                                    subtitle="Lowest sip count"
                                    game={profile.worstSingleGame}
                                    highlight="neutral"
                                />
                            </section>

                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="mb-4">
                                    <h2 className="text-xl font-semibold">Recent games</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Latest completed games for this display name.
                                    </p>
                                </div>

                                {profile.recentGames.length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        No completed games yet.
                                    </p>
                                ) : (
                                    <ul className="space-y-3">
                                        {profile.recentGames.map((game) => (
                                            <ProfileGameRow key={game.completedGameId} game={game} />
                                        ))}
                                    </ul>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </main>
        </>
    );
}

function ProfileStatCard({
    label,
    value,
    suffix,
}: {
    label: string;
    value: string | number;
    suffix?: string;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {suffix && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{suffix}</p>
            )}
        </div>
    );
}

function SingleGameCard({
    title,
    subtitle,
    game,
    highlight,
}: {
    title: string;
    subtitle: string;
    game?: ProfileGame | null;
    highlight: "good" | "neutral";
}) {
    if (!game) {
        return (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    No data yet.
                </p>
            </section>
        );
    }

    return (
        <section
            className={[
                "rounded-2xl border p-5 shadow-sm",
                highlight === "good"
                    ? "border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/40"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
            ].join(" ")}
        >
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {subtitle}
            </p>

            <h2 className="mt-1 text-xl font-semibold">{title}</h2>

            <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                    <p className="font-mono text-4xl font-bold">
                        {formatDrinkCount(game.totalSips)}
                    </p>
                </div>

                <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                    <p>Rank #{game.finalRank}</p>
                    <p>{formatDate(game.endedAt)}</p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {game.dragonCount} dragons
                </span>

                <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {game.windCount} winds
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
        </section>
    );
}

function ProfileGameRow({ game }: { game: ProfileGame }) {
    return (
        <li className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-semibold">
                        {game.winnerPlayerId === game.playerId ? "Won" : "Lost"} · Rank #
                        {game.finalRank}
                    </p>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(game.endedAt)} · {game.playerCount} players ·{" "}
                        {formatDuration(game.durationSeconds)}
                    </p>
                </div>

                <div className="text-right">
                    <p className="font-mono text-2xl font-bold">
                        {formatDrinkCount(game.totalSips)}
                    </p>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {game.dragonCount} dragons
                </span>

                <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {game.windCount} winds
                </span>

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