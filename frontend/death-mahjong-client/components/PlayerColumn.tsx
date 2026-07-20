import PlayerPanel from "./PlayerPanel";

type PlayerSlot = {
    player: any;
    playerNumber: number;
};

type PlayerColumnProps = {
    slots: PlayerSlot[];
    gameRoom: any;
    currentPlayerId?: string;
};

export default function PlayerColumn({
    slots,
    gameRoom,
    currentPlayerId,
}: PlayerColumnProps) {
    return (
        <aside className="flex flex-col gap-3">
            {slots.map((slot) => (
                <PlayerPanel
                    key={slot.player.id}
                    player={slot.player}
                    playerNumber={slot.playerNumber}
                    gameRoom={gameRoom}
                    isCurrentPlayer={slot.player.id === currentPlayerId}
                />
            ))}
        </aside>
    );
}