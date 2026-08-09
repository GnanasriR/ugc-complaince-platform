import { GOV_NAVY_DARK } from "./constants";
import TricolorBar from "./TricolorBar";

export default function GovFooter() {
  const cols = [
    { h: "About", items: ["About UGC/AICTE", "Organisation Chart", "Right to Information", "Tenders"] },
    { h: "Citizen Services", items: ["Grievance Redressal", "Institution Login", "Track Application", "Downloads"] },
    { h: "Policies", items: ["Terms of Use", "Privacy Policy", "Hyperlinking Policy", "Copyright Policy"] },
    { h: "Help", items: ["Sitemap", "FAQs", "Contact Us", "Feedback"] },
  ];

  return (
    <footer className="text-white shrink-0" style={{ background: GOV_NAVY_DARK }}>
      <div className="px-8 py-8 grid grid-cols-4 gap-8">
        {cols.map((c) => (
          <div key={c.h}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3 opacity-90">{c.h}</p>
            <ul className="space-y-1.5">
              {c.items.map((it) => (
                <li key={it} className="text-[11px] opacity-60 hover:opacity-100 hover:underline cursor-pointer transition-opacity">
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <TricolorBar />
      <div className="px-8 py-3 flex items-center justify-between text-[10px] opacity-60">
        <p>© 2024 University Grants Commission / AICTE. Content owned and maintained by the Government of India.</p>
        <p className="font-mono">Last Updated: 14-Nov-2024 · Best viewed 1920×1080</p>
      </div>
    </footer>
  );
}
