# Death Mahjong

Death Mahjong is an online multiplayer drinking game inspired by Solitaire Mahjong. Players join a shared room, take turns drawing available Mahjong tiles, and receive sips based on tile value and how many times they personally have drawn the same tile.

The game is currently built as a full-stack web app with a C# ASP.NET Core backend and a Next.js frontend.

## Current Features

- Create a game room
- Join a room using a join code
- Multiplayer lobby with live player updates
- Host-only game start
- Host-only game abort
- Real-time game updates using SignalR
- Turn-based tile drawing
- Drawable and blocked tile states
- Drink calculation based on tile value
- Hardcore mode with no sip cap
- Full deck mode toggle
- Dynamic tile setup based on player count
- Game end screen with player statistics
- Player-specific drink totals
- Dragon count per player
- Room/player reconnect handling using localStorage

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- SignalR client

### Backend

- ASP.NET Core Minimal API
- C#
- SignalR
- In-memory room store

## Game Concept

Players create or join a room. When enough players have joined, the host starts the game.

The game generates a Mahjong-inspired tile layout. Players take turns drawing available tiles. Each drawn tile gives the player a number of sips.

The goal is not to avoid drinking. In Death Mahjong, the winner is the player who drinks the most.

## Game Rules

A tile can only be drawn if it is drawable according to the backend game logic.

Each tile has a drink value:

| Tile type | Value |
|---|---:|
| Bamboo | 1-9 |
| Character | 1-9 |
| Dot | 1-9 |
| Wind | 14 |
| Dragon | 28 |

The drink calculation is:

```txt
ceil((tile value * same tile draw count) / 2)
```

In normal mode, drinks are capped at 14:

```txt
min(calculated drinks, 14)
```

In hardcore mode, there is no cap.

The `sameTileDrawCount` is counted per individual player, not globally. This means a player is punished more when they personally draw the same tile repeatedly.

Example:

```txt
Sofie draws Bamboo 1 for the first time  -> sameTileDrawCount = 1
Philip draws Bamboo 1 for the first time -> sameTileDrawCount = 1
Sofie draws Bamboo 1 again               -> sameTileDrawCount = 2
```

## Game Modes

### Hardcore Mode

Hardcore mode removes the normal 14-sip cap.

### Full Deck Mode

Full deck mode uses the whole tile deck no matter how many players are in the room.

When full deck mode is disabled, the tile deck is scaled based on the number of players.

## Dynamic Tile Setup

When full deck mode is disabled, the game adjusts the number of winds and dragons based on player count.

### Dragons

The number of dragons is based on the number of players.

```txt
dragonCount = playerCount
```

### Winds

Winds are selected in full suits of the same wind type to maximize repeatability and drink stacking.

Example wind setup:

| Players | Wind setup |
|---:|---|
| 2-3 | 1 full wind suit |
| 4-5 | 2 full wind suits |
| 6-7 | 3 full wind suits |
| 8+ | all wind suits |

This means:

```txt
2 players -> 4 of the same wind
4 players -> 2 full wind suits
6 players -> 3 full wind suits
8 players -> all wind suits
```

The maximum number of wind tiles is 16.

The maximum number of players is currently 12.

## Room Safeguards

The backend currently includes several room and player safeguards:

- Prevent duplicate display names in the same room
- Prevent joining after a game has started
- Prevent joining after a game has ended
- Maximum player count
- Only the host can start the game
- Only the host can abort the game

## Project Structure

Example structure:

```txt
backend/
└── DeathMahjong/
    ├── Dtos/
    ├── Hubs/
    ├── Models/
    ├── Services/
    ├── Data/
    │   ├── tiles.json
    │   └── tilesTest.json
    └── Program.cs

frontend/
└── death-mahjong-client/
    ├── app/
    │   ├── page.tsx
    │   ├── room/[roomId]/page.tsx
    │   ├── game/[roomId]/page.tsx
    │   └── game-end/[roomId]/page.tsx
    ├── lib/
    │   ├── api.ts
    │   ├── gameHub.ts
    │   └── gameSession.ts
    └── components/
```

## Backend Setup

From the backend project folder:

```bash
dotnet run
```

The backend exposes REST endpoints for room creation, joining, starting, drawing tiles, aborting games, and fetching room state.

SignalR is available at:

```txt
/hubs/gamehub
```

## Frontend Setup

From the frontend project folder:

```bash
npm install
npm run dev
```

The frontend expects these environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5156
NEXT_PUBLIC_SIGNALR_URL=http://localhost:5156/hubs/gamehub
```

Adjust the port if the backend runs on a different port.

## Main API Endpoints

```txt
POST /api/gamerooms
POST /api/gamerooms/{joinCode}/join
POST /api/gamerooms/{roomId}/start
POST /api/gamerooms/{roomId}/draw-tile
POST /api/gamerooms/{roomId}/abort
GET  /api/gamerooms/{roomId}
```

## Real-Time Events

The app currently uses SignalR for real-time updates.

Events include:

```txt
PlayerJoined
GameStarted
TileDrawn
GameEnded
InvalidMove
InvalidAbort
```

## Local Storage Session Handling

The frontend stores room-specific player identity in localStorage. This allows players to refresh the page and remain connected to the correct room/player.

Example:

```txt
roomId
playerId:{roomId}
joinCode:{roomId}
```

This avoids overwriting player IDs when testing multiple rooms or players in the same browser.

## Current Statistics

The game currently tracks:

- Total sips per player
- Latest tile drawn per player
- Latest sips per player
- Number of dragons drawn per player
- Drawn tile count
- Remaining tile count
- Remaining tile summary by tile type
- Game duration on the game end screen

## Game End

A game can end in different ways:

- Normal end: all tiles have been drawn
- Blocked end: no drawable tiles remain
- Abort end: host aborts the game

When the game ends normally or by blocked state, players are redirected to the game end page.

When the game is aborted, players are redirected back to the start page.

## Test Tiles

A smaller `tilesTest.json` file can be used during manual testing to make games shorter and easier to debug.

To use it, update the file name inside `GameEngine.GetTilesFromJson()`:

```csharp
var fileName = "tilesTest.json";
```

For the full game, use:

```csharp
var fileName = "tiles.json";
```

## Current Development Notes

The project currently uses an in-memory backend store. This means rooms disappear when the backend restarts.

The frontend and backend response shapes should stay consistent. Most real-time events send payloads shaped like:

```ts
{
  gameRoom,
  move
}
```

or:

```ts
{
  gameRoom,
  player
}
```

The frontend often unwraps responses defensively using:

```ts
const updatedRoom = payload.gameRoom ?? payload.room ?? payload;
```

## Planned Improvements

- Improve visual tile layout
- Add better tile graphics
- Improve mobile layout
- Add persistent database storage
- Add completed game history
- Add more detailed statistics
- Add better reconnect handling
- Add clearer game state messages
- Add deployment setup
- Add automated backend tests
- Add frontend component cleanup
