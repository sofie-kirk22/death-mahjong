import PlayerPanel from "./PlayerPanel";

export default function PlayerColumn({
    players,
    gameRoom,
    startNumber,
    currentPlayerId,
}: {
    players: any[];
    gameRoom: any;
    startNumber: number;
    currentPlayerId: string | null;
}) {
    return (
        <aside className="flex flex-col gap-3">
            {players.map((player, index) => (
                <PlayerPanel
                    key={player?.id ?? `empty-${startNumber + index}`}
                    player={player}
                    playerNumber={startNumber + index}
                    gameRoom={gameRoom}
                    isCurrentPlayer={player?.id === currentPlayerId}
                />
            ))}
        </aside>
    );
}