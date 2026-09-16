import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { applicationsApi } from "./services/api";
import HomePage from "./components/home/HomePage";
import InstitutionApp from "./components/institution/InstitutionApp";
import UGCApp from "./components/ugc/UGCApp";

function filterActiveApps(appList) {
  if (!Array.isArray(appList)) return [];
  let declinedIds = [];
  try {
    const savedDeclined = localStorage.getItem("ugc_declined_app_ids");
    if (savedDeclined) declinedIds = JSON.parse(savedDeclined);
  } catch (e) {}

  return appList.filter((app) => {
    if (!app || !app.id) return false;
    if (declinedIds.includes(app.id)) return false;
    const status = (app.status || "").toLowerCase();
    if (status.includes("rejected") || status.includes("declined")) return false;
    return true;
  });
}

function MainAppContent() {
  const { user } = useAuth();

  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem("ugc_all_apps");
    const parsed = saved ? JSON.parse(saved) : [];
    return filterActiveApps(parsed);
  });

  const [myApplications, setMyApplications] = useState(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`ugc_user_my_apps_${user.email}`);
    const parsed = saved ? JSON.parse(saved) : [];
    return filterActiveApps(parsed);
  });

  // Sync myApplications whenever logged-in user changes
  useEffect(() => {
    if (user && user.email) {
      const key = `ugc_user_my_apps_${user.email}`;
      const saved = localStorage.getItem(key);
      const parsed = saved ? JSON.parse(saved) : [];
      setMyApplications(filterActiveApps(parsed));
    } else {
      setMyApplications([]);
    }
  }, [user?.email]);

  // Sync state to localStorage & listen for declination events
  useEffect(() => {
    const active = filterActiveApps(applications);
    localStorage.setItem("ugc_all_apps", JSON.stringify(active));
  }, [applications]);

  useEffect(() => {
    if (user && user.email) {
      const active = filterActiveApps(myApplications);
      localStorage.setItem(`ugc_user_my_apps_${user.email}`, JSON.stringify(active));
    }
  }, [myApplications, user]);

  useEffect(() => {
    const handleDeclinedSync = () => {
      setApplications((prev) => filterActiveApps(prev));
      setMyApplications((prev) => filterActiveApps(prev));
    };

    window.addEventListener("storage", handleDeclinedSync);
    window.addEventListener("ugc_application_promoted", handleDeclinedSync);
    return () => {
      window.removeEventListener("storage", handleDeclinedSync);
      window.removeEventListener("ugc_application_promoted", handleDeclinedSync);
    };
  }, []);

  // Fetch live applications from backend microservice
  useEffect(() => {
    applicationsApi
      .getAll()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const normalized = data.map((item) => ({
            id: item.id || item.applicationId || "APP-2025-001",
            name: item.institutionName || item.name || "Institutional Applicant",
            type: item.programmeType || item.type || "Engineering",
            nlpScore: item.nlpScore ?? 0,
            risk: item.riskTier || item.risk || "Pending",
            mlProb: item.approvalProbability || item.mlProb || 0,
            status: item.status || "New",
            state: item.state || "Karnataka",
          }));
          setApplications(filterActiveApps(normalized));
        }
      })
      .catch(() => {
        // Fallback silently if backend is offline
      });
  }, []);

  const handleSubmitApplication = (app, myApp) => {
    const newAppEntry = { ...app, nlpScore: 0, risk: "Pending", mlProb: 0, status: "New" };
    const newMyAppEntry = { ...myApp, status: "New", nlpScore: 0, stage: "Document Verification", daysElapsed: 0 };

    setApplications((prev) => filterActiveApps([newAppEntry, ...prev]));
    setMyApplications((prev) => filterActiveApps([newMyAppEntry, ...prev]));
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/institution" element={<Navigate to="/institution/dashboard" replace />} />
      <Route
        path="/institution/:view"
        element={
          <InstitutionApp
            myApplications={myApplications}
            onSubmitApplication={handleSubmitApplication}
          />
        }
      />

      <Route path="/ugc" element={<Navigate to="/ugc/dashboard" replace />} />
      <Route path="/ugc/:view/:sub?" element={<UGCApp applications={applications} />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
