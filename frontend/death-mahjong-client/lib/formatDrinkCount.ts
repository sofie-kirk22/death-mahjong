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

const base14Digits = "0123456789ABCD";

export function formatBase14(totalSips: number) {
  const safeTotalSips = Math.max(0, Math.round(Number(totalSips) || 0));

  if (safeTotalSips === 0) {
    return "0₁₄";
  }

  let value = safeTotalSips;
  let result = "";

  while (value > 0) {
    result = base14Digits[value % 14] + result;
    value = Math.floor(value / 14);
  }

  return `${result}₁₄`;
}