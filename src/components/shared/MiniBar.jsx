export default function MiniBar({ value, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono text-[11px] text-slate-500 tabular-nums">{value}%</span>
    </div>
  );
}
