import { getTileImageSrc, getBackTileImageSrc } from "../lib/tileImages";

type TileImageProps = {
    tileName: string;
    className?: string;
};

export function TileImage({ tileName, className = "" }: TileImageProps) {
    return (
        <img
            src={getTileImageSrc(tileName)}
            alt={tileName}
            className={`object-contain ${className}`}
            draggable={false}
        />
    );
}