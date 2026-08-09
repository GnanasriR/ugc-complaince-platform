import { STATUS_STYLES } from "../../data";

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"}`}
    >
      {status}
    </span>
  );
}
