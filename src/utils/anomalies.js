import { ANOMALIES } from "../data";

export function getLiveAnomalies() {
  try {
    const stored = localStorage.getItem("ugc_db_anomalies");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return ANOMALIES;
}

export function saveAnomalyToDb(newAnomaly) {
  const current = getLiveAnomalies();
  const updated = [newAnomaly, ...current];
  try {
    localStorage.setItem("ugc_db_anomalies", JSON.stringify(updated));
  } catch (e) {}
  window.dispatchEvent(new CustomEvent("ugc_anomaly_updated"));
  return updated;
}

export function getResolvedAnomalyIds() {
  try {
    const stored = localStorage.getItem("ugc_db_resolved_anomaly_ids");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {}
  return new Set();
}

export function saveResolvedAnomalyId(anomalyId) {
  const current = getResolvedAnomalyIds();
  current.add(anomalyId);
  try {
    localStorage.setItem("ugc_db_resolved_anomaly_ids", JSON.stringify(Array.from(current)));
  } catch (e) {}
  window.dispatchEvent(new CustomEvent("ugc_anomaly_updated"));
  return current;
}

export function getDispatchedNotices() {
  try {
    const stored = localStorage.getItem("ugc_db_dispatched_notices");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed === "object" && parsed !== null) return parsed;
    }
  } catch (e) {}
  return {};
}

export function saveDispatchedNotice(anomalyId, noticeData) {
  const current = getDispatchedNotices();
  current[anomalyId] = noticeData;
  try {
    localStorage.setItem("ugc_db_dispatched_notices", JSON.stringify(current));
  } catch (e) {}
  window.dispatchEvent(new CustomEvent("ugc_anomaly_updated"));
  return current;
}

export function removeDispatchedNotice(anomalyId) {
  const current = getDispatchedNotices();
  delete current[anomalyId];
  try {
    localStorage.setItem("ugc_db_dispatched_notices", JSON.stringify(current));
  } catch (e) {}
  window.dispatchEvent(new CustomEvent("ugc_anomaly_updated"));
  return current;
}

export function removeResolvedAnomalyId(anomalyId) {
  const current = getResolvedAnomalyIds();
  current.delete(anomalyId);
  try {
    localStorage.setItem("ugc_db_resolved_anomaly_ids", JSON.stringify(Array.from(current)));
  } catch (e) {}
  removeDispatchedNotice(anomalyId);
  window.dispatchEvent(new CustomEvent("ugc_anomaly_updated"));
  return current;
}
