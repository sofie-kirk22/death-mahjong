export default function RemainingTilesBar({ summary }: { summary: any }) {
  return (
    <section className="rounded-2xl border border-emerald-700 bg-emerald-700 p-4 shadow-sm dark:border-emerald-950 dark:bg-emerald-950">
      <h2 className="mb-3 text-center text-lg font-semibold">
        Tiles Remaining
      </h2>

      <div className="grid grid-cols-5 divide-x divide-white overflow-hidden rounded-xl border border-slate-200 text-center dark:divide-slate-700 dark:border-slate-700">
        <RemainingTileCell label="Bamboo" value={summary?.bambooCount ?? 0} />
        <RemainingTileCell label="Dots" value={summary?.dotCount ?? 0} />
        <RemainingTileCell
          label="Characters"
          value={summary?.characterCount ?? 0}
        />
        <RemainingTileCell label="Winds" value={summary?.windCount ?? 0} />
        <RemainingTileCell label="Dragons" value={summary?.dragonCount ?? 0} />
      </div>
    </section>
  );
}

function RemainingTileCell({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-slate-50/80 p-3 dark:bg-slate-950">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}