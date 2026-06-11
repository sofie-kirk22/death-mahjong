import { TileImage } from "@/components/TileImage";

type PlayerDrawnTilesProps = {
    gameRoom: any;
    player: any;
};

export function PlayerDrawnTiles({ gameRoom, player }: PlayerDrawnTilesProps) {
    const playerMoves = gameRoom.moves.filter((move: any) => move.playerId === player.id);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">{player.displayName}</h2>

            {playerMoves.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    No tiles drawn yet.
                </p>
            ) : (
                <ul className="flex flex-wrap gap-2">
                    {playerMoves.map((move: any) => (
                        <li
                            key={move.id}
                            className="flex flex-col items-center rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800"
                        >
                            <TileImage tileName={move.tileName} className="h-14 w-10" />

                            <p className="mt-1 text-xs font-medium">{move.tileName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {move.drinks} sips
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}