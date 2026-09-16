import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

// Filter out non-critical browser extension errors (iframe_form_check.js, content_push_notification.js, etc.)
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason?.stack || event.reason?.message || String(event.reason || "");
  if (
    reason.includes("iframe_form_check") ||
    reason.includes("content_push_notification") ||
    reason.includes("tick extension") ||
    reason.includes("frameId") ||
    reason.includes("uuid")
  ) {
    event.preventDefault();
  }
});

window.addEventListener("error", (event) => {
  const filename = event.filename || "";
  const msg = event.message || "";
  if (
    filename.includes("iframe_form_check") ||
    filename.includes("content_push_notification") ||
    filename.includes("contentscript-webapp") ||
    msg.includes("frameId") ||
    msg.includes("uuid")
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
