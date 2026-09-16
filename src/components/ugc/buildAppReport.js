import { getNlpParametersForApp } from "../../utils/nlpModelEngine";

/** Deterministically derive an accurate per-application NLP parameter report. */
export default function buildAppReport(app) {
  if (!app) return getNlpParametersForApp("APP-2024-0891", "Rajiv Gandhi Institute of Technology", "Engineering");
  return getNlpParametersForApp(app.id, app.name, app.type);
}
