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
        <header className="rounded-2xl border border-emerald-700 bg-emerald-700 p-4 shadow-sm dark:border-emerald-950 dark:bg-emerald-950">
            <div className="mb-4 flex items-center justify-center gap-3">
                <h1 className="text-3xl font-bold tracking-wide">Death Mahjong</h1>

                <div className="flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                    <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: me?.color ?? "#94a3b8" }}
                    />
                    <span>{me?.displayName ?? "Unknown"}</span>
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-red-800 bg-red-950 p-3 text-red-200">
                    {error}
                </div>
            )}

            <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2 text-center dark:border-slate-700 dark:bg-slate-950/80">
                <p className="text-sm text-slate-600">Duration</p>
                <p className="font-mono text-xl font-semibold">
                    {formatDuration(gameRoom.startedAt, gameRoom.endedAt, now)}
                </p>
            </div>

            <div className="mt-3 flex justify-center gap-2 text-xs">
                {gameRoom.hardCoreMode && (
                    <span className="rounded-full bg-red-950 px-2 py-1 font-medium text-red-300">
                        Hardcore
                    </span>
                )}

                {gameRoom.fullDeckMode && (
                    <span className="rounded-full bg-purple-950 px-2 py-1 font-medium text-purple-300">
                        Full deck
                    </span>
                )}
            </div>
        </header>
    );
}

function formatDuration(startedAt?: string, endedAt?: string | null, now = Date.now()) {
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