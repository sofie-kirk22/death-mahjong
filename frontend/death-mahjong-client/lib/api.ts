const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export async function createRoom(hostName: string, hardcoreMode: boolean) {
  const response = await fetch(`${API_URL}/api/gamerooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      hostplayername: hostName,
      hardcoreMode
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function joinRoom(code: string, displayName: string) {
  const response = await fetch(`${API_URL}/api/gamerooms/${code}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      playerName: displayName
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function startGame(roomId: string, playerId: string) {
  const response = await fetch(`${API_URL}/api/gamerooms/${roomId}/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ playerId }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function drawTile(roomId: string, playerId: string, tileId: string) {
  const response = await fetch(`${API_URL}/api/gamerooms/${roomId}/draw-tile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ playerId, tileId }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function getRoom(roomId: string) {
  const response = await fetch(`${API_URL}/api/gamerooms/${roomId}`);

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }
