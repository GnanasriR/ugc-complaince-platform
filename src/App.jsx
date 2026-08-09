import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { APPLICATIONS, MY_APPLICATIONS } from "./data";
import HomePage from "./components/home/HomePage";
import InstitutionApp from "./components/institution/InstitutionApp";
import UGCApp from "./components/ugc/UGCApp";

export default function App() {
  const [applications, setApplications] = useState(APPLICATIONS);
  const [myApplications, setMyApplications] = useState(MY_APPLICATIONS);

  const handleSubmitApplication = (app, myApp) => {
    setApplications((prev) => [
      { ...app, nlpScore: 0, risk: "Pending", mlProb: 0, status: "New" },
      ...prev,
    ]);
    setMyApplications((prev) => [
      { ...myApp, status: "New", nlpScore: 0, stage: "Document Verification", daysElapsed: 0 },
      ...prev,
    ]);
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
