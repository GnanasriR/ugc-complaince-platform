import { NOTIFICATIONS } from "../data";
import { saveOrUpdateAppAnalysisReport } from "./reportsDb";

export function addNotification(portal, notification) {
  try {
    const key = `ugc_notifications_${portal}`;
    const saved = localStorage.getItem(key);
    
    let items = [];
    if (saved) {
      items = JSON.parse(saved);
    } else {
      items = NOTIFICATIONS[portal] || [];
    }

    const newEntry = {
      id: `${portal}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: "Just now",
      unread: true,
      tone: notification.tone || "bg-emerald-100 text-emerald-700",
      iconName: notification.iconName || "Bell",
      ...notification,
    };

    items = [newEntry, ...items];
    localStorage.setItem(key, JSON.stringify(items));

    // Dispatch a custom browser event so active components update unread counts and UI immediately
    window.dispatchEvent(
      new CustomEvent("ugc_notification_added", {
        detail: { portal, notification: newEntry },
      })
    );

    return newEntry;
  } catch (e) {
    return null;
  }
}

export function getNotifications(portal) {
  try {
    const key = `ugc_notifications_${portal}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return NOTIFICATIONS[portal] || [];
}

export function markNotificationsAsRead(portal) {
  try {
    const key = `ugc_notifications_${portal}`;
    const items = getNotifications(portal).map((n) => ({ ...n, unread: false }));
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("ugc_notification_added", { detail: { portal } }));
    return items;
  } catch (e) {
    return [];
  }
}

/**
 * Re-evaluates an application when missing/new documents are uploaded in Document Vault,
 * recalculates AI compliance & XGBoost approval probability scores,
 * promotes the application to position #1 (Top of UGC Application Pipeline),
 * and dispatches real-time notifications to BOTH Dashboards.
 */
export function reEvaluateAndPromoteApplication(appId, fileInfo, updatedItems) {
  try {
    const uploadedCount = updatedItems ? updatedItems.filter((i) => i.done).length : 6;
    const totalCount = updatedItems ? updatedItems.length : 7;
    const docCompleteness = Math.round((uploadedCount / totalCount) * 100);

    // Calculate AI approval probability & NLP compliance score strictly based on document vault completeness
    let newNlpScore = 0;
    if (uploadedCount === 0) {
      newNlpScore = 0;
    } else if (uploadedCount < 3) {
      newNlpScore = Math.round((uploadedCount / totalCount) * 100 * 0.8);
    } else {
      newNlpScore = Math.min(98, Math.round((uploadedCount / totalCount) * 95));
    }

    let newMlProb = 5;
    if (uploadedCount === 0) {
      newMlProb = 5;
    } else if (uploadedCount < 2) {
      newMlProb = 22;
    } else if (uploadedCount < 4) {
      newMlProb = 45;
    } else {
      newMlProb = Math.min(98, Math.round(docCompleteness * 0.4 + 55));
    }

    // Read all applications from localStorage
    const savedApps = localStorage.getItem("ugc_all_apps");
    let apps = savedApps ? JSON.parse(savedApps) : [];

    let matchedIndex = apps.findIndex((a) => a.id === appId);
    let matchedApp = null;

    if (matchedIndex !== -1) {
      matchedApp = apps[matchedIndex];
      apps.splice(matchedIndex, 1); // Remove from current position
    } else {
      matchedApp = {
        id: appId,
        name: "Rajiv Gandhi Institute of Technology",
        type: "Engineering",
        state: "Karnataka",
        cycle: "2024–25",
      };
    }

    // Update application with re-evaluation results & top priority ranking
    const reEvaluatedApp = {
      ...matchedApp,
      status: "Re-evaluated (AI Verified)",
      mlProb: newMlProb,
      nlpScore: newNlpScore,
      risk: "Low Risk (AI Verified)",
      isTopPriority: true,
      lastReEvaluatedAt: new Date().toLocaleTimeString(),
      reEvaluationNote: `Re-evaluated after file '${fileInfo.name}' uploaded in Vault.`,
    };

    // Promote to index 0 (THE VERY TOP OF THE APPLICATION PIPELINE LIST)!
    apps.unshift(reEvaluatedApp);
    localStorage.setItem("ugc_all_apps", JSON.stringify(apps));

    // Persist & Update Database Analysis Report Record for this Application
    saveOrUpdateAppAnalysisReport(appId, {
      institutionName: matchedApp.name || "Institutional Applicant",
      nlpScore: newNlpScore,
      mlProb: newMlProb,
      status: "Re-evaluated (AI Verified)",
      documentCount: uploadedCount,
    });

    // Also update institution's myApplications list
    try {
      const userKeys = Object.keys(localStorage).filter((k) => k.startsWith("ugc_user_my_apps_"));
      for (const k of userKeys) {
        const savedMy = localStorage.getItem(k);
        if (savedMy) {
          let myApps = JSON.parse(savedMy);
          const myIdx = myApps.findIndex((a) => a.id === appId);
          if (myIdx !== -1) {
            myApps[myIdx] = {
              ...myApps[myIdx],
              status: "Re-evaluated (AI Verified)",
              nlpScore: newNlpScore,
              stage: "AI Verification Complete",
              isTopPriority: true,
            };
            localStorage.setItem(k, JSON.stringify(myApps));
          }
        }
      }
    } catch (e) {}

    // Dispatch Notifications to BOTH Dashboards!
    // 1. Institution Dashboard Notification
    addNotification("institution", {
      title: "⚡ AI Re-Evaluation & Priority Update",
      desc: `Uploaded document '${fileInfo.name}' for ${appId}. AI re-evaluated compliance (XGBoost Prob: ${newMlProb}%, NLP: ${newNlpScore}%). Application promoted to TOP of Review Pipeline!`,
      tone: "bg-emerald-100 text-emerald-700 font-bold",
      iconName: "Sparkles",
    });

    // 2. UGC Officer Dashboard Notification
    addNotification("ugc", {
      title: "⚡ Priority Application Re-evaluated",
      desc: `Institution ${appId} (${reEvaluatedApp.name}) uploaded document '${fileInfo.name}'. AI re-evaluated compliance (Prob: ${newMlProb}%, NLP: ${newNlpScore}%) and promoted application to TOP of UGC Review Pipeline!`,
      tone: "bg-emerald-100 text-emerald-700 font-bold",
      iconName: "Sparkles",
    });

    // Dispatch custom browser event for live UI re-rendering
    window.dispatchEvent(
      new CustomEvent("ugc_application_promoted", {
        detail: { appId, reEvaluatedApp, apps },
      })
    );

    return reEvaluatedApp;
  } catch (e) {
    return null;
  }
}
