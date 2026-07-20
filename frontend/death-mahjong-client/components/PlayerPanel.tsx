import { getTileImageSrc } from "@/lib/tileImages";

export default function PlayerPanel({
    player,
    playerNumber,
    gameRoom,
    isCurrentPlayer,
}: {
    player: any;
    playerNumber: number;
    gameRoom: any;
    isCurrentPlayer: boolean;
}) {
    const summary = gameRoom.playerDrinksSummaries?.find(
        (summary: any) => summary.playerId === player.id
    );

    const playerMoves =
        gameRoom.moves?.filter((move: any) => move.playerId === player.id) ?? [];

    return (
        <section className={`rounded-2xl border p-3 shadow-sm ${isCurrentPlayer ? 'border-emerald-500 bg-emerald-100/80 dark:border-emerald-400 dark:bg-emerald-900/80' : 'border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/80'}`}>
            <div className="mb-2 flex items-center gap-2">
                <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: player.color ?? "#94a3b8" }}
                />
                <h2 className="font-semibold">{player.displayName}</h2>
            </div>

            <div className="mb-3 text-xs text-slate-900 dark:text-slate-400">
                <p>
                    Latest:{" "}
                    {summary?.latestTileName
                        ? `${summary.latestTileName} — ${summary.latestSips} sips`
                        : "-"}
                </p>
                <p>Dragons: {summary?.dragonCount ?? 0}</p>
                <p>Total: {summary?.totalSips ?? 0} sips</p>
            </div>

            <details className="border-t border-slate-200 pt-2 dark:border-slate-800">
                <summary className="cursor-pointer select-none text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
                    Drawn tiles ({playerMoves.length})
                </summary>

                <div className="mt-2 flex max-h-28 flex-wrap gap-1 overflow-y-auto">
                    {playerMoves.length === 0 ? (
                        <p className="text-xs text-slate-600 dark:text-slate-500">
                            No tiles yet
                        </p>
                    ) : (
                        playerMoves.map((move: any) => (
                            <img
                                key={move.id}
                                src={getTileImageSrc(move.tileName)}
                                alt={move.tileName}
                                title={`${move.tileName} - ${move.drinks} sips`}
                                className="h-10 w-7 object-contain"
                                draggable={false}
                            />
                        ))
                    )}
                </div>
            </details>
        </section>
    );
}