export function getTileImageSrc(tileName: string) {
    const normalizedName = tileName.trim().replaceAll(" ", "-");

    return `/images/tiles/${normalizedName}.png`;
}

export function getBackTileImageSrc(isBottomRow: boolean) {
    return isBottomRow
        ? "/images/tiles/Back-ButtomRow.png"
        : "/images/tiles/Back.png";
}