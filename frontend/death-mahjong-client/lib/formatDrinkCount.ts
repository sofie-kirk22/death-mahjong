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

export function formatDrinkCount(totalSips: number) {
  const safeTotalSips = Math.max(0, Math.round(totalSips ?? 0));

  const beers = Math.floor(safeTotalSips / 14);
  const remainingSips = safeTotalSips % 14;

  return `${beers}${sipSymbols[remainingSips]}`;
}

export function getDrinkCountParts(totalSips: number) {
  const safeTotalSips = Math.max(0, Math.round(Number(totalSips) || 0));

  const beers = Math.floor(safeTotalSips / 14);
  const remainingSips = safeTotalSips % 14;

  return {
    beers,
    remainingSips,
    remainingSipSymbol: sipSymbols[remainingSips],
  };
}