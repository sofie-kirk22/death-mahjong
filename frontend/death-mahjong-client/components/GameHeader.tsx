import { useEffect, useState } from "react";

export default function GameHeader({
    me,
    currentPlayer,
    gameRoom,
    error,
}: {
    me: any;
    currentPlayer: any;
    gameRoom: any;
    error: string;
}) {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (gameRoom.endedAt) return;

        const intervalId = window.setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [gameRoom.endedAt]);

    return (
        <header className="rounded-2xl border border-emerald-700 bg-emerald-700 p-4 text-center shadow-sm dark:border-emerald-950 dark:bg-emerald-950">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-red-400 dark:text-red-400">
                Death Mahjong
            </p>

            <p className="mt-2 font-mono text-3xl font-bold">
                {formatDuration(gameRoom.startedAt, gameRoom.endedAt, now)}
            </p>

            <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: me?.color ?? "#94a3b8" }}
                />

                <span className="text-slate-950 dark:text-slate-400">You:</span>

                <span className="font-semibold">
                    {me?.displayName ?? "Unknown"}
                </span>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
                {currentPlayer && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Current: {currentPlayer.displayName}
                    </span>
                )}

                {gameRoom.hardCoreMode && (
                    <span className="rounded-full bg-red-100 px-2.5 py-1 font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                        Hardcore
                    </span>
                )}

                {gameRoom.fullDeckMode && (
                    <span className="rounded-full bg-purple-100 px-2.5 py-1 font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        Full deck
                    </span>
                )}
            </div>

            {error && (
                <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                    {error}
                </div>
            )}
        </header>
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