import { NLP_PARAMETERS } from "../../data";

/** Deterministically derive a per-application NLP parameter report. */
export default function buildAppReport(app) {
  let seed = 0;
  for (let i = 0; i < app.id.length; i++) seed = (seed * 31 + app.id.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return (seed >>> 8) / 16777216;
  };
  const mismatchProb = Math.max(0.05, Math.min(0.85, (100 - app.nlpScore) / 100));
  return NLP_PARAMETERS.map((p) => {
    const r = rand();
    const status = r < mismatchProb * 0.6 ? "MISMATCH" : r < mismatchProb * 0.6 + 0.08 ? "UNCERTAIN" : "PASS";
    const confidence = Math.round(55 + rand() * 43);
    return { ...p, status, confidence, critical: p.critical && status === "MISMATCH" };
  });
}
