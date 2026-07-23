const sipSymbols = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
];

type DrinkCountDisplayProps = {
  totalSips: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  prefix?: string;
};

export default function DrinkCountDisplay({
  totalSips,
  size = "md",
  prefix,
}: DrinkCountDisplayProps) {
  const safeTotalSips = Math.max(0, Math.round(Number(totalSips) || 0));

  const beers = Math.floor(safeTotalSips / 14);
  const remainingSips = safeTotalSips % 14;
  const remainingSipSymbol = sipSymbols[remainingSips];

  const beerSize = {
    xs: "text-lg",
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-5xl",
    xl: "text-6xl",
  }[size];

  const sipSize = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl",
  }[size];

  return (
    <span className="inline-flex items-baseline gap-0.5 font-mono font-bold leading-none">
      {prefix && (
        <span className="mr-1 text-base font-sans font-normal">{prefix}</span>
      )}
      <span className={beerSize}>{beers}</span>
      <span className={sipSize}>{remainingSipSymbol}</span>
    </span>
  );
}