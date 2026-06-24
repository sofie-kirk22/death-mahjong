import { getBackTileImageSrc } from "@/lib/tileImages";

type PyramidBoardProps = {
  tiles: any[];
  onDrawTile: (tileId: string) => void;
  disabled?: boolean;
};

export function PyramidBoard({
  tiles,
  onDrawTile,
  disabled = false,
}: PyramidBoardProps) {
  const tileWidth = 48;
  const tileHeight = 64;

  const xSpacing = 23;
  const ySpacing = 31;
  const zOffset = 0;

  function isBlockedOnBottom(tile: any, tiles: any[]) {
    return tiles.some(
      (otherTile: any) =>
        !otherTile.isDrawn &&
        otherTile.z === tile.z &&
        otherTile.x === tile.x &&
        otherTile.y === tile.y + 2
    );
  }

  const visibleTiles = tiles
    .filter((tile: any) => !tile.isDrawn)
    .sort((a: any, b: any) => {
      if (a.z !== b.z) return a.z - b.z;
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

  return (
    <div className="flex min-h-[620px] items-center justify-center overflow-auto rounded-2xl border border-emerald-700 bg-emerald-800 p-4 shadow-inner dark:border-emerald-950 dark:bg-emerald-800">
      <div className="relative h-[520px] w-[520px]">
        {visibleTiles.map((tile: any) => {
          const blockedOnBottom = isBlockedOnBottom(tile, tiles);
          const imageSrc = getBackTileImageSrc(!blockedOnBottom);

          const boardOffsetX = 80;
          const boardOffsetY = 40;

          const left = tile.x * xSpacing - tile.z * zOffset + boardOffsetX;
          const top = tile.y * ySpacing - tile.z * zOffset + boardOffsetY;

          const isClickable = tile.isDrawable && !disabled;

          return (
            <button
              key={tile.id}
              type="button"
              disabled={!isClickable}
              onClick={() => onDrawTile(tile.id)}
              className={[
                "absolute transition",
                isClickable
                  ? "cursor-pointer hover:scale-105"
                  : "cursor-not-allowed opacity-100",
              ].join(" ")}
              style={{
                left,
                top,
                width: tileWidth,
                height: tileHeight,
                zIndex: tile.z * 1000 + tile.y * 10 + tile.x,
              }}
              title={`${tile.name} (${tile.x}, ${tile.y}, ${tile.z})`}
            >
              <img
                src={imageSrc}
                alt="Tile back"
                className="h-full w-full object-contain"
                draggable={false}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}