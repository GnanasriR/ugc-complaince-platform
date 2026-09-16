export function getRequiredAnnexuresList() {
  try {
    const saved = localStorage.getItem("ugc_db_required_annexures");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return [
    { id: "chk-1", name: "Faculty Register (Annexure I)", item: "Faculty Register (Annexure I)", done: false },
    { id: "chk-2", name: "Fee Structure & Salary Payroll (Annexure II)", item: "Fee Structure & Salary Payroll (Annexure II)", done: false },
    { id: "chk-3", name: "Land Ownership Title Deed & Site NOC (Annexure III)", item: "Land Ownership Title Deed & Site NOC (Annexure III)", done: false },
    { id: "chk-4", name: "Building Plan & Safety Clearance (Annexure IV)", item: "Building Plan & Safety Clearance (Annexure IV)", done: false },
    { id: "chk-5", name: "Library Register & Digital Journals (Annexure V)", item: "Library Register & Digital Journals (Annexure V)", done: false },
    { id: "chk-6", name: "Laboratory Inventory & Equipment Log (Annexure VI)", item: "Laboratory Inventory & Equipment Log (Annexure VI)", done: false },
    { id: "chk-7", name: "Fire Safety NOC & Municipal Clearance (Annexure VII)", item: "Fire Safety NOC & Municipal Clearance (Annexure VII)", done: false },
    { id: "chk-8", name: "Audited Financial Report & Corpus Deposit (Annexure VIII)", item: "Audited Financial Report & Corpus Deposit (Annexure VIII)", done: false },
  ];
}

export function updateRequiredAnnexuresFromNorms(activeNorms = {}) {
  const appType = activeNorms.applicationType || "GENERAL_REGULATIONS";
  const filename = activeNorms.filename || "Uploaded Regulatory PDF";

  let newChecklist = [];

  if (activeNorms.requiredDocumentChecklist && Array.isArray(activeNorms.requiredDocumentChecklist) && activeNorms.requiredDocumentChecklist.length > 0) {
    newChecklist = activeNorms.requiredDocumentChecklist.map((item, idx) => ({
      id: `chk-norm-${idx + 1}`,
      name: typeof item === "string" ? item : (item.name || `Required Document ${idx + 1}`),
      item: typeof item === "string" ? item : (item.name || `Required Document ${idx + 1}`),
      done: false,
      normReference: filename,
    }));
  } else {
    newChecklist = getRequiredAnnexuresList();
  }

  try {
    localStorage.setItem("ugc_db_required_annexures", JSON.stringify(newChecklist));
  } catch (e) {}

  window.dispatchEvent(new CustomEvent("ugc_required_docs_updated", { detail: { activeNorms, newChecklist } }));
  return newChecklist;
}

export function getAppUploadedDocs(appId) {
  if (!appId) return [];

  // 1. Check specific localStorage key ugc_uploaded_docs_${appId}
  try {
    const saved = localStorage.getItem(`ugc_uploaded_docs_${appId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  // 2. Check ugc_vault_items_${appId} saved by InstDocVault.jsx
  try {
    const savedVaultItems = localStorage.getItem(`ugc_vault_items_${appId}`);
    if (savedVaultItems) {
      const parsed = JSON.parse(savedVaultItems);
      if (Array.isArray(parsed)) {
        const doneItems = parsed.filter((item) => item.done && (item.fileName || item.item || item.name));
        if (doneItems.length > 0) {
          return doneItems.map((item) => ({
            id: item.id || `doc-${Math.random()}`,
            name: item.fileName || item.item || item.name || "Uploaded Annexure.pdf",
            size: item.fileSizeMb ? `${item.fileSizeMb} MB` : "2.5 MB",
            type: "PDF",
            uploadedAt: item.uploadedAt || "Recently Uploaded",
          }));
        }
      }
    }
  } catch (e) {}

  // 3. Check global ugc_doc_vault_items
  try {
    const globalVault = localStorage.getItem("ugc_doc_vault_items");
    if (globalVault) {
      const parsed = JSON.parse(globalVault);
      if (Array.isArray(parsed)) {
        const doneItems = parsed.filter((item) => item.done && (item.fileName || item.item || item.name));
        if (doneItems.length > 0) {
          return doneItems.map((item) => ({
            id: item.id || `doc-${Math.random()}`,
            name: item.fileName || item.item || item.name || "Uploaded Annexure.pdf",
            size: item.fileSizeMb ? `${item.fileSizeMb} MB` : "2.5 MB",
            type: "PDF",
            uploadedAt: item.uploadedAt || "Recently Uploaded",
          }));
        }
      }
    }
  } catch (e) {}

  // 4. Check global uploaded docs store
  try {
    const savedAll = localStorage.getItem("ugc_all_uploaded_docs");
    if (savedAll) {
      const parsed = JSON.parse(savedAll);
      if (parsed && Array.isArray(parsed[appId]) && parsed[appId].length > 0) {
        return parsed[appId];
      }
    }
  } catch (e) {}

  // 5. Pre-seeded sample applications that have pre-existing documents
  const sampleAppsWithDocs = [
    "APP-2024-0891",
    "APP-2024-0892",
    "APP-2024-0896",
    "APP-2024-0894",
    "APP-2024-0898",
  ];

  if (sampleAppsWithDocs.includes(appId)) {
    return [
      { name: "Annexure_I_Faculty_Register.pdf", size: "2.4 MB", type: "PDF" },
      { name: "Annexure_II_Land_Title_Deed.pdf", size: "4.1 MB", type: "PDF" },
      { name: "Annexure_III_Fire_Safety_NOC.pdf", size: "1.8 MB", type: "PDF" },
      { name: "Annexure_IV_Building_Plan.pdf", size: "5.2 MB", type: "PDF" },
    ];
  }

  return [];
}

export function saveAppUploadedDoc(appId, docFile) {
  const currentDocs = getAppUploadedDocs(appId);
  const newDocItem = {
    id: `doc-${Date.now()}`,
    name: docFile.name,
    size: `${(docFile.size / (1024 * 1024)).toFixed(2)} MB`,
    type: docFile.type || "Document",
    uploadedAt: new Date().toLocaleTimeString(),
  };

  const updated = [...currentDocs, newDocItem];
  try {
    localStorage.setItem(`ugc_uploaded_docs_${appId}`, JSON.stringify(updated));
  } catch (e) {}

  window.dispatchEvent(new CustomEvent("ugc_application_promoted"));
  return updated;
}
