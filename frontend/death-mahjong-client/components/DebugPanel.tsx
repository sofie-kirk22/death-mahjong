export default function DebugPanel({
  tiles,
  hasEnded,
  onDrawTile,
}: {
  tiles: any[];
  hasEnded: boolean;
  onDrawTile: (tileId: string) => void;
}) {
  return (
    <>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-xl font-semibold">Tile debug view</h2>

        <div className="max-h-96 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-700 p-2">Name</th>
                <th className="border-b border-slate-700 p-2">Type</th>
                <th className="border-b border-slate-700 p-2">X</th>
                <th className="border-b border-slate-700 p-2">Y</th>
                <th className="border-b border-slate-700 p-2">Z</th>
                <th className="border-b border-slate-700 p-2">Drawn</th>
                <th className="border-b border-slate-700 p-2">Drawable</th>
              </tr>
            </thead>

            <tbody>
              {tiles.map((tile: any) => (
                <tr key={tile.id}>
                  <td className="border-b border-slate-800 p-2">{tile.name}</td>
                  <td className="border-b border-slate-800 p-2">{tile.type}</td>
                  <td className="border-b border-slate-800 p-2">{tile.x}</td>
                  <td className="border-b border-slate-800 p-2">{tile.y}</td>
                  <td className="border-b border-slate-800 p-2">{tile.z}</td>
                  <td className="border-b border-slate-800 p-2">
                    {tile.isDrawn ? "Yes" : "No"}
                  </td>
                  <td className="border-b border-slate-800 p-2">
                    {tile.isDrawable ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
        {tiles.map((tile: any) => {
          const isDisabled = hasEnded || tile.isDrawn || !tile.isDrawable;

          return (
            <button
              key={tile.id}
              disabled={isDisabled}
              className={[
                "rounded border p-3 text-left transition",
                hasEnded
                  ? "cursor-not-allowed border-slate-800 bg-slate-900 text-slate-600 opacity-50"
                  : tile.isDrawn
                    ? "border-slate-800 bg-slate-900 text-slate-600 opacity-40"
                    : tile.isDrawable
                      ? "border-green-500 bg-green-950 text-green-100 hover:bg-green-900"
                      : "cursor-not-allowed border-red-700 bg-red-950 text-red-200 opacity-50",
              ].join(" ")}
              onClick={() => onDrawTile(tile.id)}
            >
              <div className="font-semibold">{tile.name}</div>

              <div className="text-sm text-slate-300">
                Value: {tile.value}
              </div>

              <div className="text-xs text-slate-400">
                x:{tile.x} y:{tile.y} z:{tile.z}
              </div>
            </button>
          );
        })}
      </section>
    </>
  );
}