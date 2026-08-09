import {
  Landmark,
  BadgeCheck,
  Star,
  Globe,
  ClipboardList,
  Building2,
  RefreshCw,
  BookOpen,
  TrendingUp,
  MapPin,
  Lock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  FileCheck,
  Bell,
  FileSearch,
  Users,
  BarChart3,
} from "lucide-react";

export const PIPELINE_STAGES = [
  { stage: "Submission", count: 4812, pct: 100, color: "#0D9488" },
  { stage: "Doc Verification", count: 3891, pct: 80.8, color: "#10B981" },
  { stage: "Expert Review", count: 2743, pct: 57.0, color: "#0F766E" },
  { stage: "Committee", count: 1561, pct: 32.4, color: "#D97706" },
  { stage: "Final Decision", count: 1204, pct: 25.0, color: "#059669" },
];

export const COMPLIANCE_BY_TYPE = [
  { type: "Engineering", rate: 71 },
  { type: "Medical", rate: 88 },
  { type: "Management", rate: 74 },
  { type: "Pharmacy", rate: 79 },
  { type: "Architecture", rate: 65 },
  { type: "Law", rate: 82 },
  { type: "Polytechnic", rate: 58 },
  { type: "Nursing", rate: 85 },
];

export const TREND_DATA = [
  { month: "Jul", apps: 680, approved: 498 },
  { month: "Aug", apps: 720, approved: 531 },
  { month: "Sep", apps: 810, approved: 584 },
  { month: "Oct", apps: 890, approved: 632 },
  { month: "Nov", apps: 760, approved: 561 },
  { month: "Dec", apps: 952, approved: 724 },
];

export const ANOMALY_CATEGORIES = [
  { category: "Cross-Annexure Conflict", count: 211, severity: "High" },
  { category: "Faculty Ratio Fraud", count: 187, severity: "Critical" },
  { category: "Infrastructure Mismatch", count: 143, severity: "High" },
  { category: "Document Forgery Signal", count: 98, severity: "Critical" },
  { category: "Financial Cap Violation", count: 76, severity: "High" },
  { category: "Metadata Tampering", count: 54, severity: "Medium" },
];

export const APPLICATIONS = [
  { id: "APP-2024-0891", name: "Rajiv Gandhi Institute of Technology", type: "Engineering", nlpScore: 84, risk: "Low", mlProb: 91, status: "Approved", state: "Karnataka" },
  { id: "APP-2024-0892", name: "Sri Venkateshwara College of Medicine", type: "Medical", nlpScore: 92, risk: "Low", mlProb: 96, status: "Approved", state: "Tamil Nadu" },
  { id: "APP-2024-0893", name: "Deccan Institute of Management", type: "Management", nlpScore: 61, risk: "Medium", mlProb: 58, status: "Under Review", state: "Telangana" },
  { id: "APP-2024-0894", name: "Sunrise Polytechnic College", type: "Polytechnic", nlpScore: 34, risk: "High", mlProb: 22, status: "Flagged", state: "Maharashtra" },
  { id: "APP-2024-0895", name: "Jawaharlal Institute of Sciences", type: "Engineering", nlpScore: 78, risk: "Low", mlProb: 83, status: "Under Review", state: "Delhi" },
  { id: "APP-2024-0896", name: "Karnataka Medical Academy", type: "Medical", nlpScore: 88, risk: "Low", mlProb: 94, status: "Approved", state: "Karnataka" },
  { id: "APP-2024-0897", name: "Coastal Business School", type: "Management", nlpScore: 51, risk: "High", mlProb: 31, status: "Rejected", state: "Kerala" },
  { id: "APP-2024-0898", name: "Vidyapith Engineering College", type: "Engineering", nlpScore: 43, risk: "High", mlProb: 29, status: "Escalated", state: "Rajasthan" },
  { id: "APP-2024-0899", name: "All India Institute of Pharmacy", type: "Pharmacy", nlpScore: 76, risk: "Medium", mlProb: 74, status: "Under Review", state: "Maharashtra" },
  { id: "APP-2024-0900", name: "Eastern Law University", type: "Law", nlpScore: 69, risk: "Medium", mlProb: 67, status: "Under Review", state: "West Bengal" },
  { id: "APP-2024-0901", name: "Pioneer Architecture School", type: "Architecture", nlpScore: 55, risk: "High", mlProb: 38, status: "Flagged", state: "Gujarat" },
  { id: "APP-2024-0902", name: "Bharat College of Nursing", type: "Nursing", nlpScore: 81, risk: "Low", mlProb: 87, status: "Approved", state: "Uttar Pradesh" },
];

export const NLP_PARAMETERS = [
  { param: "Faculty–Student Ratio", declared: "1:12", verified: "1:19", status: "MISMATCH", confidence: 97, critical: true },
  { param: "PhD Faculty Percentage", declared: "68%", verified: "71%", status: "PASS", confidence: 94, critical: false },
  { param: "Built-up Area (sq. ft.)", declared: "85,000", verified: "61,200", status: "MISMATCH", confidence: 89, critical: true },
  { param: "Library Holdings (vols.)", declared: "45,000", verified: "28,340", status: "MISMATCH", confidence: 92, critical: true },
  { param: "Computer Lab Capacity", declared: "480 seats", verified: "480 seats", status: "PASS", confidence: 98, critical: false },
  { param: "Annual Fee Structure", declared: "₹1,40,000", verified: "₹1,40,000", status: "PASS", confidence: 99, critical: false },
  { param: "Hostel Capacity", declared: "800 beds", verified: "612 beds", status: "MISMATCH", confidence: 85, critical: false },
  { param: "Sports Facilities", declared: "Yes (Ann.D)", verified: "Unverifiable", status: "UNCERTAIN", confidence: 51, critical: false },
  { param: "Lab Equipment Value", declared: "₹4.2 Cr", verified: "₹4.2 Cr", status: "PASS", confidence: 88, critical: false },
  { param: "Administrative Staff", declared: "142", verified: "138", status: "PASS", confidence: 96, critical: false },
  { param: "Research Publications", declared: "87 (2023)", verified: "91 (2023)", status: "PASS", confidence: 93, critical: false },
  { param: "Industry Partnerships", declared: "24 MoUs", verified: "24 MoUs", status: "PASS", confidence: 91, critical: false },
  { param: "Placement Rate", declared: "88%", verified: "82%", status: "MISMATCH", confidence: 79, critical: false },
  { param: "Financial Solvency Ratio", declared: "2.4", verified: "1.8", status: "MISMATCH", confidence: 84, critical: true },
];

export const ANOMALIES = [
  {
    id: "ANO-2024-0041",
    title: "Cross-Annexure Data Inconsistency",
    description: "Faculty headcount in Annexure III (68 staff) contradicts Annexure VII payroll register (38 confirmed). Discrepancy of 30 faculty members with no explanatory note.",
    apps: ["APP-2024-0894", "APP-2024-0898", "APP-2024-0901"],
    severity: "Critical",
    category: "Data Integrity",
    detectedAt: "2024-11-14 09:23",
    confidence: 97,
  },
  {
    id: "ANO-2024-0042",
    title: "Document Metadata Forgery Signal",
    description: "PDF creation timestamp (2024-09-03) predates the notarisation date (2024-09-10). File hash mismatch detected against registry submission.",
    apps: ["APP-2024-0898"],
    severity: "Critical",
    category: "Document Integrity",
    detectedAt: "2024-11-14 10:41",
    confidence: 94,
  },
  {
    id: "ANO-2024-0043",
    title: "Financial Cap Violation (Fee Regulation Act)",
    description: "Fee structure declared in Form-7 (₹1,95,000/yr) exceeds the state-regulated cap of ₹1,40,000/yr for management programmes without NAAC A+.",
    apps: ["APP-2024-0897"],
    severity: "High",
    category: "Regulatory Breach",
    detectedAt: "2024-11-14 11:02",
    confidence: 99,
  },
  {
    id: "ANO-2024-0044",
    title: "Faculty Ratio Deterioration (3-Year Trend)",
    description: "Year-on-year faculty headcount declining: 2022 → 71, 2023 → 55, 2024 → 38 (declared 60). Pattern consistent with artificial inflation.",
    apps: ["APP-2024-0894", "APP-2024-0898"],
    severity: "High",
    category: "Trend Analysis",
    detectedAt: "2024-11-14 11:47",
    confidence: 88,
  },
  {
    id: "ANO-2024-0045",
    title: "Infrastructure Declaration vs. Satellite Verification",
    description: "Declared built-up area of 85,000 sq. ft. inconsistent with satellite imagery (~61,200 sq. ft.). Delta of 23,800 sq. ft. unexplained.",
    apps: ["APP-2024-0901"],
    severity: "High",
    category: "Infrastructure",
    detectedAt: "2024-11-14 12:15",
    confidence: 89,
  },
];

export const APPLICATION_CATALOGUE = {
  UGC: [
    { id: "ugc-university-recognition", label: "University Recognition", desc: "Recognition under Section 2(f) / 12(B) of the UGC Act.", icon: Landmark },
    { id: "ugc-deemed-university", label: "Deemed-to-be University Application", desc: "Grant of Deemed University status under UGC Regulations.", icon: BadgeCheck },
    { id: "ugc-autonomous-college", label: "Autonomous College Application", desc: "Grant of autonomous status to an affiliated college.", icon: Star },
    { id: "ugc-odl-online", label: "ODL / Online Programme Recognition", desc: "Recognition of Open & Distance Learning or Online programmes.", icon: Globe },
    { id: "ugc-regulation-compliance", label: "UGC Regulation Compliance", desc: "Compliance filing against a specific UGC regulation.", icon: ClipboardList },
  ],
  AICTE: [
    { id: "aicte-new-institution", label: "New Institution Approval", desc: "Approval to establish a new technical institution.", icon: Building2 },
    { id: "aicte-eoa", label: "Extension of Approval (EOA)", desc: "Annual extension of approval for an existing institution.", icon: RefreshCw },
    { id: "aicte-new-course", label: "New Course Approval", desc: "Approval to introduce a new course or programme.", icon: BookOpen },
    { id: "aicte-intake-increase", label: "Increase in Intake", desc: "Approval to increase sanctioned intake for a programme.", icon: TrendingUp },
    { id: "aicte-location-change", label: "Change of Location", desc: "Approval to shift the institution/campus to a new location.", icon: MapPin },
    { id: "aicte-programme-closure", label: "Programme Closure", desc: "Formal closure of an approved programme.", icon: Lock },
  ],
};

export const BASE_REQUIRED_DOCS = [
  "Institution Registration Certificate",
  "Governing Body Resolution",
  "Land & Building Documents",
  "Financial Statements (Last 3 Years)",
];

export const EXTRA_REQUIRED_DOC = {
  "ugc-university-recognition": "Act / Statute of the University",
  "ugc-deemed-university": "UGC (Deemed to be Universities) Regulations Compliance Report",
  "ugc-autonomous-college": "Academic Audit Report",
  "ugc-odl-online": "SWAYAM / UGC-DEB Approval Letter",
  "ugc-regulation-compliance": "Regulation-Specific Compliance Certificate",
  "aicte-new-institution": "State Government NOC",
  "aicte-eoa": "Previous Year EOA Letter",
  "aicte-new-course": "Curriculum & Syllabus Document",
  "aicte-intake-increase": "Infrastructure Adequacy Certificate",
  "aicte-location-change": "New Site NOC & Land Documents",
  "aicte-programme-closure": "Teach-Out Plan for Enrolled Students",
};

export const MY_APPLICATIONS = [
  { id: "APP-2024-0893", cycle: "2024–25", type: "Management", submitted: "2024-10-03", status: "Under Review", nlpScore: 61, stage: "Expert Review", daysElapsed: 42 },
  { id: "APP-2022-0441", cycle: "2022–23", type: "Management", submitted: "2022-09-14", status: "Approved", nlpScore: 77, stage: "Completed", daysElapsed: 58 },
  { id: "APP-2020-0213", cycle: "2020–21", type: "Management", submitted: "2020-09-01", status: "Approved", nlpScore: 74, stage: "Completed", daysElapsed: 64 },
];

export const CHECKLIST_ITEMS = [
  { item: "Faculty Register (Annexure I)", done: true },
  { item: "Fee Structure (Annexure II)", done: true },
  { item: "Land Documents (Annexure III)", done: true },
  { item: "Building Plan (Annexure IV)", done: true },
  { item: "Library Register (Annexure V)", done: false },
  { item: "Lab Inventory (Annexure VI)", done: true },
  { item: "Payroll Register (Annexure VII)", done: true },
  { item: "Audit Report (Annexure VIII)", done: false },
];

export const STATUS_STYLES = {
  Approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Rejected: "bg-red-50 text-red-700 ring-1 ring-red-200",
  "Under Review": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Flagged: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Escalated: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  New: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
};

export const NOTIFICATIONS = {
  institution: [
    { id: "n1", icon: CheckCircle, tone: "text-emerald-600 bg-emerald-50", title: "Document verification passed", desc: "Annexure IV (Faculty List) cleared NLP cross-check.", time: "12m ago", unread: true },
    { id: "n2", icon: AlertTriangle, tone: "text-amber-600 bg-amber-50", title: "Action required on Annexure VII", desc: "Land ownership document needs a clearer scan — resubmit.", time: "1h ago", unread: true },
    { id: "n3", icon: MessageSquare, tone: "text-teal-600 bg-teal-50", title: "New reviewer comment", desc: '"Please clarify the lab equipment valuation for FY24."', time: "3h ago", unread: true },
    { id: "n4", icon: FileCheck, tone: "text-emerald-600 bg-emerald-50", title: "Application moved to Expert Review", desc: "APP-2024-0893 has cleared document verification.", time: "Yesterday", unread: false },
    { id: "n5", icon: Bell, tone: "text-slate-500 bg-slate-100", title: "Compliance cycle reminder", desc: "Self-assessment for 2024–25 cycle closes in 9 days.", time: "2d ago", unread: false },
  ],
  ugc: [
    { id: "n1", icon: AlertTriangle, tone: "text-red-600 bg-red-50", title: "Critical anomaly flagged", desc: "Coastal Business School — faculty shortfall of 36.7% detected.", time: "8m ago", unread: true },
    { id: "n2", icon: FileSearch, tone: "text-teal-600 bg-teal-50", title: "NLP scan completed", desc: "14/14 parameters processed for APP-2024-0901.", time: "45m ago", unread: true },
    { id: "n3", icon: Users, tone: "text-emerald-600 bg-emerald-50", title: "Reviewer assigned", desc: "Dr. Rao assigned to Deccan Inst. of Mgmt. expert review.", time: "2h ago", unread: true },
    { id: "n4", icon: BarChart3, tone: "text-emerald-600 bg-emerald-50", title: "Weekly compliance report ready", desc: "Cycle 2024–25 throughput summary generated.", time: "Yesterday", unread: false },
    { id: "n5", icon: Bell, tone: "text-slate-500 bg-slate-100", title: "System maintenance", desc: "NLP engine will briefly restart tonight at 2:00 AM IST.", time: "3d ago", unread: false },
  ],
};
