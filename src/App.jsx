import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { APPLICATIONS, MY_APPLICATIONS } from "./data";
import { AuthProvider } from "./context/AuthContext";
import { applicationsApi } from "./services/api";
import HomePage from "./components/home/HomePage";
import InstitutionApp from "./components/institution/InstitutionApp";
import UGCApp from "./components/ugc/UGCApp";

export default function App() {
  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem("ugc_all_apps");
    return saved ? JSON.parse(saved) : APPLICATIONS;
  });

  const [myApplications, setMyApplications] = useState(() => {
    const saved = localStorage.getItem("ugc_user_my_apps");
    return saved ? JSON.parse(saved) : MY_APPLICATIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("ugc_all_apps", JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem("ugc_user_my_apps", JSON.stringify(myApplications));
  }, [myApplications]);

  useEffect(() => {
    // Fetch live applications from microservices backend
    applicationsApi
      .getAll()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const normalized = data.map((item) => ({
            id: item.id || item.applicationId || "APP-2025-001",
            name: item.institutionName || item.name || "Institutional Applicant",
            type: item.programmeType || item.type || "Engineering",
            nlpScore: item.nlpScore ?? 84,
            risk: item.riskTier || item.risk || "Low",
            mlProb: item.approvalProbability || item.mlProb || 88,
            status: item.status || "Under Review",
            state: item.state || "Karnataka",
          }));
          setApplications(normalized);
        }
      })
      .catch((err) => {
        console.warn("[App] Using local application catalog:", err.message);
      });
  }, []);

  const handleSubmitApplication = (app, myApp) => {
    // Submit to microservice backend
    applicationsApi
      .create(app)
      .then(() => {
        console.log("[App] Application registered in backend service.");
      })
      .catch((e) => {
        console.warn("[App] Backend submission fallback:", e.message);
      });

    const newAppEntry = { ...app, nlpScore: 0, risk: "Pending", mlProb: 0, status: "New" };
    const newMyAppEntry = { ...myApp, status: "New", nlpScore: 0, stage: "Document Verification", daysElapsed: 0 };

    setApplications((prev) => [newAppEntry, ...prev]);
    setMyApplications((prev) => [newMyAppEntry, ...prev]);
  };

  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}
