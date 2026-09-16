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
  AlertTriangle,
  CheckCircle2,
  FileText,
  Bell,
  ShieldAlert,
  Clock,
  MessageSquare,
  Info,
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

export const EVALUATOR_CONSISTENCY = [
  { evaluatorPair: "Panel Alpha (Engg)", category: "Engineering", cohensKappa: 0.88, status: "CALIBRATED" },
  { evaluatorPair: "Panel Beta (Medical)", category: "Medical", cohensKappa: 0.92, status: "CALIBRATED" },
  { evaluatorPair: "Panel Gamma (Management)", category: "Management", cohensKappa: 0.74, status: "CALIBRATION_REQUIRED" },
  { evaluatorPair: "Panel Delta (Law)", category: "Law", cohensKappa: 0.85, status: "CALIBRATED" },
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
];

export const UGC_TAXONOMY_STRUCTURE = {
  general: {
    id: "general-category",
    title: "General Category",
    description: "Standard University & Institutional Compliance Filing",
    sections: [
      { id: "eligibility", name: "Eligibility", desc: "Regulatory Standing & State/Central Gazette Establishment Act" },
      { id: "accreditation", name: "Accreditation / Ranking", desc: "NAAC Grade (A++/A+), NIRF National Ranking, NBA Status" },
      { id: "faculty_students", name: "Faculty & Students", desc: "Faculty Headcount, PhD Pct (>=70%), Student Intake & Cadre Ratio (1:15)" },
      { id: "infrastructure", name: "Infrastructure", desc: "Land Area (Acres), Built-Up Sq. Ft, Labs, Library Volumes & IT NOC" },
      { id: "financial_corpus", name: "Financial / Corpus", desc: "Corpus Fund Reserve (₹5.0 Cr), Audited Financial Balance Sheet" },
      { id: "documents", name: "Documents", desc: "Mandatory Category Annexures & Regulatory Certificates" },
    ],
  },
  distinct: {
    id: "distinct-category",
    title: "Distinct Category",
    description: "Specialized, Niche & Deemed University Category Filings",
    subCategories: [
      {
        id: "new-institution",
        title: "New Institution",
        description: "Fresh Distinct Category University / Deemed Institution Proposal",
        sections: [
          { id: "distinct_discipline", name: "Distinct Discipline", desc: "Niche Academic Domain (e.g. AI, Renewable Energy, Quantum Tech)" },
          { id: "academic_programmes", name: "5 Academic Programmes", desc: "Mandatory Proposal for 5 Distinct Degree/Diploma Programmes" },
          { id: "infrastructure", name: "Infrastructure", desc: "Purpose-Built Campus Land, Advanced Labs & Research Facilities" },
          { id: "financial_corpus", name: "Financial / Corpus", desc: "Dedicated Corpus Reserve Deposit (₹10.0 Cr - ₹25.0 Cr)" },
          { id: "documents", name: "Documents", desc: "DPR Project Report, Statutory Council NOCs & Annexures" },
        ],
      },
      {
        id: "existing-institution",
        title: "Existing Institution",
        description: "Expansion / Addition of Distinct Category Discipline in Active University",
        sections: [
          { id: "distinct_discipline", name: "Distinct Discipline", desc: "New Specialized Department / Discipline Addition" },
          { id: "existing_infrastructure", name: "Existing Infrastructure", desc: "Audit of Existing Campus Wings, Shared Labs & Facility Expansion" },
          { id: "financial_corpus", name: "Financial / Corpus", desc: "Supplemental Corpus Fund Allocation & Parent Institution Audits" },
          { id: "documents", name: "Documents", desc: "Parent University Charter, Academic Council Minutes & Annexures" },
        ],
      },
    ],
  },
};

export const APPLICATION_CATALOGUE = {
  UGC: [
    { id: "ugc-general-category", label: "General Category Application", desc: "Eligibility, NAAC/NIRF Ranking, Faculty-Student Ratio, Infrastructure & Corpus.", categoryGroup: "General Category", icon: Landmark },
    { id: "ugc-distinct-new", label: "Distinct Category — New Institution", desc: "Niche Discipline, 5 Academic Programmes, Purpose-Built Campus & Corpus.", categoryGroup: "Distinct Category", icon: BadgeCheck },
    { id: "ugc-distinct-existing", label: "Distinct Category — Existing Institution", desc: "Niche Discipline Addition, Shared Campus Audit & Supplemental Corpus.", categoryGroup: "Distinct Category", icon: Star },
    { id: "ugc-university-recognition", label: "University Recognition Section 2(f)/12(B)", desc: "Recognition under Section 2(f) / 12(B) of the UGC Act.", categoryGroup: "General Category", icon: Landmark },
    { id: "ugc-deemed-university", label: "Deemed-to-be University Application", desc: "Grant of Deemed University status under UGC Regulations.", categoryGroup: "Distinct Category", icon: BadgeCheck },
    { id: "ugc-autonomous-college", label: "Autonomous College Application", desc: "Grant of autonomous status to an affiliated college.", categoryGroup: "General Category", icon: Star },
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
  "ugc-general-category": "General Category Eligibility & NAAC/NIRF Certificate",
  "ugc-distinct-new": "Distinct Category DPR Project Proposal & Statutory Council NOC",
  "ugc-distinct-existing": "Distinct Category Expansion Plan & Parent University Charter",
  "ugc-university-recognition": "Act / Statute of the University",
  "ugc-deemed-university": "UGC (Deemed to be Universities) Regulations Compliance Report",
  "ugc-autonomous-college": "Academic Audit Report",
  "ugc-odl-online": "DEB Recognition Letter",
  "ugc-regulation-compliance": "Regulation Specific Self-Assessment Affidavit",
  "aicte-new-institution": "State Government NOC",
  "aicte-eoa": "Previous Year EOA Letter",
  "aicte-new-course": "Curriculum & Syllabus Document",
  "aicte-intake-increase": "Infrastructure Adequacy Certificate",
  "aicte-location-change": "New Site NOC & Land Documents",
  "aicte-programme-closure": "Teach-Out Plan for Enrolled Students",
};

export const MY_APPLICATIONS = [];

export const CHECKLIST_ITEMS = [
  { id: "chk-1", name: "Faculty Register (Annexure I)", item: "Faculty Register (Annexure I)", done: false },
  { id: "chk-2", name: "Fee Structure (Annexure II)", item: "Fee Structure (Annexure II)", done: false },
  { id: "chk-3", name: "Land Documents (Annexure III)", item: "Land Documents (Annexure III)", done: false },
  { id: "chk-4", name: "Building Plan (Annexure IV)", item: "Building Plan (Annexure IV)", done: false },
  { id: "chk-5", name: "Library Register (Annexure V)", item: "Library Register (Annexure V)", done: false },
  { id: "chk-6", name: "Lab Inventory (Annexure VI)", item: "Lab Inventory (Annexure VI)", done: false },
  { id: "chk-7", name: "Payroll Register (Annexure VII)", item: "Payroll Register (Annexure VII)", done: false },
  { id: "chk-8", name: "Audit Report (Annexure VIII)", item: "Audit Report (Annexure VIII)", done: false },
];

export const STATUS_STYLES = {
  Approved: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  "Under Review": "bg-blue-100 text-blue-800 border border-blue-200",
  Flagged: "bg-amber-100 text-amber-800 border border-amber-200",
  Rejected: "bg-red-100 text-red-800 border border-red-200",
  Escalated: "bg-purple-100 text-purple-800 border border-purple-200",
  New: "bg-sky-100 text-sky-800 border border-sky-200",
  Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  "No Active Application": "bg-slate-100 text-slate-600 border border-slate-200",
};

export const NOTIFICATIONS = {
  institution: [
    {
      id: "inst-1",
      title: "Document Verification Action Required",
      desc: "Annexure III (Faculty List) for APP-2024-0894 requires re-upload due to metadata discrepancy.",
      time: "15 mins ago",
      unread: true,
      tone: "bg-amber-100 text-amber-700",
      icon: AlertTriangle,
    },
    {
      id: "inst-2",
      title: "Application Approved",
      desc: "Rajiv Gandhi Institute of Technology (APP-2024-0891) compliance review completed successfully.",
      time: "2 hours ago",
      unread: true,
      tone: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle2,
    },
    {
      id: "inst-3",
      title: "New Reviewer Comment",
      desc: "UGC Evaluation Committee added a remark on your Fee Structure declaration.",
      time: "5 hours ago",
      unread: false,
      tone: "bg-blue-100 text-blue-700",
      icon: MessageSquare,
    },
    {
      id: "inst-4",
      title: "Submission Deadline Reminder",
      desc: "Annual Compliance Return (2024-25) submission window closes in 5 days.",
      time: "1 day ago",
      unread: false,
      tone: "bg-purple-100 text-purple-700",
      icon: Clock,
    },
    {
      id: "inst-5",
      title: "System Update",
      desc: "UGC AI Portal upgraded to v2.4 with automated cross-annexure validation engine.",
      time: "2 days ago",
      unread: false,
      tone: "bg-slate-100 text-slate-700",
      icon: Info,
    },
  ],
  ugc: [
    {
      id: "ugc-1",
      title: "Critical Anomaly Detected",
      desc: "AI Anomaly Engine flagged Document Forgery Signal for Sunrise Polytechnic College (APP-2024-0894).",
      time: "8 mins ago",
      unread: true,
      tone: "bg-red-100 text-red-700",
      icon: ShieldAlert,
    },
    {
      id: "ugc-2",
      title: "New Batch Submission",
      desc: "14 new university recognition filings uploaded for batch evaluation.",
      time: "1 hour ago",
      unread: true,
      tone: "bg-blue-100 text-blue-700",
      icon: FileText,
    },
    {
      id: "ugc-3",
      title: "Committee Hearing Scheduled",
      desc: "Standing Appellate Committee review set for Vidyapith Engineering College on Nov 18.",
      time: "3 hours ago",
      unread: true,
      tone: "bg-amber-100 text-amber-700",
      icon: Clock,
    },
    {
      id: "ugc-4",
      title: "NLP Verification Complete",
      desc: "Automated extraction and parameter comparison finished for 42 pending applications.",
      time: "6 hours ago",
      unread: false,
      tone: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle2,
    },
    {
      id: "ugc-5",
      title: "State Compliance Summary",
      desc: "Monthly AI compliance metrics generated for Karnataka and Maharashtra zones.",
      time: "1 day ago",
      unread: false,
      tone: "bg-slate-100 text-slate-700",
      icon: Bell,
    },
  ],
};
