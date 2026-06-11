export function saveGameSession(roomId: string, playerId: string, joinCode?: string) {
    localStorage.setItem("roomId", roomId);
    localStorage.setItem(`playerId:${roomId}`, playerId);

    if (joinCode) {
        localStorage.setItem(`joinCode:${roomId}`, joinCode);
    }
}

export function getPlayerIdForRoom(roomId: string) {
    return localStorage.getItem(`playerId:${roomId}`);
}

export function clearGameSession(roomId: string) {
    localStorage.removeItem(`playerId:${roomId}`);
    localStorage.removeItem(`joinCode:${roomId}`);

    const currentRoomId = localStorage.getItem("roomId");
    if (currentRoomId === roomId) {
        localStorage.removeItem("roomId");
    }
}