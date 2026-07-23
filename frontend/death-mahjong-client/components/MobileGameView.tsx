"use client";

import { useEffect, useState } from "react";

import { PyramidBoard } from "./PyramidBoard";
import { getTileImageSrc } from "@/lib/tileImages";
import { formatDrinkCount } from "@/lib/formatDrinkCount";

export default function MobileGameView({
    gameRoom,
    me,
    mySummary,
    myMoves,
    currentPlayer,
    playersBeforeMyTurn,
    error,
    isHost,
    onDrawTile,
    onRandomDrawTile,
    onAbortGame,
}: {
    gameRoom: any;
    me: any;
    mySummary: any;
    myMoves: any[];
    currentPlayer: any;
    playersBeforeMyTurn: number | null;
    error: string;
    isHost: boolean;
    onDrawTile: (tileId: string) => void;
    onRandomDrawTile: () => void;
    onAbortGame: () => void;
}) {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (gameRoom.endedAt) return;

        const intervalId = window.setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [gameRoom.endedAt]);

    const duration = formatDuration(gameRoom.startedAt, gameRoom.endedAt, now);

    const isMyTurn = playersBeforeMyTurn === 0;

    const turnText =
        playersBeforeMyTurn === null
            ? "Turn order unknown"
            : playersBeforeMyTurn === 0
                ? "Your turn"
                : `${playersBeforeMyTurn} player${playersBeforeMyTurn === 1 ? "" : "s"
                } before it is your turn`;

    return (
        <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-4 rounded-3xl bg-white/60 p-4 shadow-2xl backdrop-blur-sm dark:bg-slate-950/60">
            <header className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-red-700 dark:text-red-400">
                    Death Mahjong
                </p>

                <p className="mt-2 font-mono text-3xl font-bold">{duration}</p>

                <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                    <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: me?.color ?? "#94a3b8" }}
                    />
                    <span className="text-slate-500 dark:text-slate-400">You:</span>
                    <span className="font-semibold">{me?.displayName ?? "Unknown"}</span>
                </div>
            </header>

            {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                    {error}
                </div>
            )}

            <section
                className={[
                    "rounded-2xl border p-3 text-center shadow-sm",
                    isMyTurn
                        ? "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-100"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
                ].join(" ")}
            >
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Current player
                </p>

                <p className="text-xl font-bold">
                    {currentPlayer?.displayName ?? "Unknown"}
                </p>

                <p className="mt-1 text-sm font-medium">{turnText}</p>
            </section>

            <button
                onClick={onRandomDrawTile}
                disabled={!isMyTurn || gameRoom.hasEnded}
                className="rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-950 dark:text-emerald-100 dark:hover:bg-emerald-900"
            >
                Draw random free tile
            </button>

            <section className="rounded-3xl border border-emerald-700 bg-emerald-700 p-3 shadow-inner dark:border-emerald-950 dark:bg-emerald-950">
                <div className="overflow-auto">
                    <div className="min-w-[520px]">
                        <PyramidBoard
                            tiles={gameRoom.tiles}
                            onDrawTile={onDrawTile}
                            disabled={gameRoom.hasEnded}
                        />
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-3 text-lg font-semibold">Your statistics</h2>

                <div className="grid grid-cols-3 gap-2 text-center">
                    <MobileStatCard
                        label="Total"
                        value={formatDrinkCount(mySummary?.totalSips ?? 0)}
                        suffix="sips"
                    />
                    <MobileStatCard
                        label="Latest"
                        value={mySummary?.latestSips ?? 0}
                        suffix="sips"
                    />
                    <MobileStatCard
                        label="Dragons"
                        value={mySummary?.dragonCount ?? 0}
                    />
                </div>

                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Latest tile: {mySummary?.latestTileName ?? "No tile drawn yet"}
                </p>

                <details className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">
                    <summary className="cursor-pointer select-none text-sm font-medium text-slate-500 dark:text-slate-400">
                        Your drawn tiles ({myMoves.length})
                    </summary>

                    <div className="mt-2 flex max-h-32 flex-wrap gap-1 overflow-y-auto">
                        {myMoves.length === 0 ? (
                            <p className="text-xs text-slate-500">No tiles yet</p>
                        ) : (
                            myMoves.map((move: any) => (
                                <img
                                    key={move.id}
                                    src={getTileImageSrc(move.tileName)}
                                    alt={move.tileName}
                                    title={`${move.tileName} - ${move.drinks} sips`}
                                    className="h-12 w-8 object-contain"
                                    draggable={false}
                                />
                            ))
                        )}
                    </div>
                </details>
            </section>

            {isHost && !gameRoom.hasEnded && (
                <button
                    className="rounded border border-red-500 bg-red-100 px-4 py-2 text-red-900 hover:bg-red-200 dark:border-red-700 dark:bg-red-950 dark:text-red-100 dark:hover:bg-red-900"
                    onClick={onAbortGame}
                >
                    Abort game
                </button>
            )}
        </div>
    );
}

function MobileStatCard({
    label,
    value,
    suffix,
}: {
    label: string;
    value: string | number;
    suffix?: string;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-xl font-bold">{value}</p>
            {suffix && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {suffix}
                </p>
            )}
        </div>
    );
}

function formatDuration(
    startedAt?: string,
    endedAt?: string | null,
    now = Date.now()
) {
    if (!startedAt) return "00:00:00";

    const start = new Date(startedAt).getTime();
    const end = endedAt ? new Date(endedAt).getTime() : now;

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