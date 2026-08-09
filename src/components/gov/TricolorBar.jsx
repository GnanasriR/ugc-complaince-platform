import { SAFFRON, INDIA_GREEN } from "./constants";

export default function TricolorBar() {
  return (
    <div className="flex h-[4px] w-full shrink-0">
      <div className="flex-1" style={{ background: SAFFRON }} />
      <div className="flex-1" style={{ background: "#FFFFFF" }} />
      <div className="flex-1" style={{ background: INDIA_GREEN }} />
    </div>
  );
}
