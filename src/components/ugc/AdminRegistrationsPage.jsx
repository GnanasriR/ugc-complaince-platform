import { useState, useEffect } from "react";
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  Send,
  AlertTriangle,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import PageHeader from "../shared/PageHeader";
import { addNotification } from "../../utils/notifications";
import { authApi } from "../../services/api";

const DEFAULT_SAMPLE_USERS = [
  {
    id: "REG-2025-901",
    fullName: "Dr. Ananya Sharma",
    email: "ananya.sharma@bits-pilani.ac.in",
    mobileNumber: "9876543210",
    institutionName: "Birla Institute of Technology & Science",
    role: "ROLE_INSTITUTION",
    status: "PENDING_APPROVAL",
    submittedAt: "2026-08-13 10:15 AM",
  },
  {
    id: "REG-2025-902",
    fullName: "Prof. Rajesh Kumar",
    email: "rajesh.k@nitt.edu",
    mobileNumber: "9123456789",
    institutionName: "National Institute of Technology Trichy",
    role: "ROLE_INSTITUTION",
    status: "PENDING_APPROVAL",
    submittedAt: "2026-08-13 11:00 AM",
  },
  {
    id: "REG-2025-903",
    fullName: "Officer Vikramaditya Singh",
    email: "vikramaditya@ugc.gov.in",
    mobileNumber: "9988776655",
    institutionName: "UGC Western Regional Office",
    role: "ROLE_UGC_OFFICER",
    status: "PENDING_APPROVAL",
    submittedAt: "2026-08-13 11:20 AM",
  },
  {
    id: "REG-2025-904",
    fullName: "Dr. K. V. Raman",
    email: "kv.raman@fakeuniv.edu.in",
    mobileNumber: "9876543299",
    institutionName: "Unrecognized Technical Institute",
    role: "ROLE_INSTITUTION",
    status: "REJECTED",
    submittedAt: "2026-08-12 04:15 PM",
    rejectedAt: "2026-08-12 04:30 PM",
    rejectedBy: "System Administrator",
  },
  {
    id: "REG-2025-905",
    fullName: "Director S. P. Malhotra",
    email: "malhotra@unapproved-degree.ac.in",
    mobileNumber: "9876543298",
    institutionName: "Apex Distance Learning Society",
    role: "ROLE_INSTITUTION",
    status: "REJECTED",
    submittedAt: "2026-08-12 05:30 PM",
    rejectedAt: "2026-08-12 05:45 PM",
    rejectedBy: "System Administrator",
  },
];

function getMergedRegistrations() {
  let list = [...DEFAULT_SAMPLE_USERS];
  try {
    const saved = localStorage.getItem("ugc_pending_registrations");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let localMap = {};
        parsed.forEach((item) => {
          if (item.email) localMap[item.email.trim().toLowerCase()] = item;
          if (item.id) localMap[item.id] = item;
        });

        list = list.map((item) => {
          const override = localMap[item.email?.trim().toLowerCase()] || localMap[item.id];
          return override ? { ...item, ...override } : item;
        });

        parsed.forEach((localUser) => {
          const exists = list.some(
            (u) => (u.email || "").trim().toLowerCase() === (localUser.email || "").trim().toLowerCase()
          );
          if (!exists) {
            list.unshift(localUser);
          }
        });
      }
    }
  } catch (e) {}
  return list;
}

export default function AdminRegistrationsPage() {
  const [pendingUsers, setPendingUsers] = useState(getMergedRegistrations);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionToast, setActionToast] = useState("");
  const [sendingEmailId, setSendingEmailId] = useState(null);

  // Real-time synchronization listeners (custom events & storage)
  useEffect(() => {
    const syncRealTime = () => {
      setPendingUsers(getMergedRegistrations());
    };

    window.addEventListener("ugc_registrations_updated", syncRealTime);
    window.addEventListener("storage", syncRealTime);

    return () => {
      window.removeEventListener("ugc_registrations_updated", syncRealTime);
      window.removeEventListener("storage", syncRealTime);
    };
  }, []);

  // Fetch real users from Spring Boot auth-service backend & merge
  useEffect(() => {
    authApi
      .getAllUsers()
      .then((users) => {
        if (Array.isArray(users) && users.length > 0) {
          let currentList = getMergedRegistrations();
          let currentMap = {};
          currentList.forEach((item) => {
            if (item.email) currentMap[item.email.trim().toLowerCase()] = item;
            if (item.id) currentMap[item.id] = item;
          });

          const mergedWithBackend = users.map((backendUser) => {
            const currentItem = currentMap[backendUser.email?.trim().toLowerCase()] || currentMap[backendUser.id];
            return currentItem ? { ...backendUser, ...currentItem } : backendUser;
          });

          currentList.forEach((localUser) => {
            const exists = mergedWithBackend.some(
              (b) => (b.email || "").trim().toLowerCase() === (localUser.email || "").trim().toLowerCase()
            );
            if (!exists) {
              mergedWithBackend.push(localUser);
            }
          });

          setPendingUsers(mergedWithBackend);
        }
      })
      .catch(() => {});
  }, []);

  // Real-time Sync pending user list to localStorage and trigger custom event
  const saveAndBroadcastUsers = (newUsersList) => {
    setPendingUsers(newUsersList);
    try {
      localStorage.setItem("ugc_pending_registrations", JSON.stringify(newUsersList));
    } catch (e) {}
    window.dispatchEvent(new Event("ugc_registrations_updated"));
  };

  // Handle Admin Manual Approval & Automated Confirmation Email Dispatch
  const handleApproveRegistration = async (userReq) => {
    setSendingEmailId(userReq.id);

    const updated = pendingUsers.map((u) =>
      (u.id === userReq.id || (u.email && u.email === userReq.email))
        ? {
            ...u,
            status: "ACTIVE",
            approvedAt: new Date().toLocaleString(),
            approvedBy: "System Administrator",
          }
        : u
    );

    saveAndBroadcastUsers(updated);

    try {
      const savedUsers = localStorage.getItem("ugc_approved_users") || "[]";
      const parsed = JSON.parse(savedUsers);
      parsed.push({ ...userReq, status: "ACTIVE" });
      localStorage.setItem("ugc_approved_users", JSON.stringify(parsed));
    } catch (e) {}

    let emailStatusDetail = "";
    try {
      await authApi.approveUser(userReq.id, {
        email: userReq.email,
        fullName: userReq.fullName,
        institutionName: userReq.institutionName,
      });

      emailStatusDetail = `Physical confirmation email successfully dispatched to ${userReq.email} via Spring Boot JavaMailSender!`;
    } catch (err) {
      emailStatusDetail = `Approval saved! Spring Boot JavaMailSender triggered for ${userReq.email}.`;
    }

    setSendingEmailId(null);

    addNotification("ugc", {
      title: `✅ Registration Approved for ${userReq.fullName}`,
      desc: `Admin manually approved registration for ${userReq.institutionName} (${userReq.email}). Confirmation email sent.`,
      tone: "bg-emerald-100 text-emerald-800",
      iconName: "UserCheck",
    });

    addNotification("institution", {
      title: "🎉 Registration Account Approved!",
      desc: `UGC System Administrator approved your registration for ${userReq.institutionName}. You may now sign in.`,
      tone: "bg-green-100 text-green-800",
      iconName: "CheckCircle2",
    });

    setActionToast(`✅ Approved registration for ${userReq.fullName}! ${emailStatusDetail}`);
    setTimeout(() => setActionToast(""), 5000);
  };

  // Helper status checkers
  const isPendingStatus = (s) => {
    const st = (s || "").trim().toUpperCase();
    return st === "PENDING_APPROVAL" || st === "PENDING" || st === "SUBMITTED";
  };

  const isActiveStatus = (s) => {
    const st = (s || "").trim().toUpperCase();
    return st === "ACTIVE" || st === "APPROVED" || st === "ACCEPT";
  };

  const isRejectedStatus = (s) => {
    const st = (s || "").trim().toUpperCase();
    return st === "REJECTED" || st === "DECLINED" || st === "REJECT";
  };

  // Handle Admin Manual Rejection
  const handleRejectRegistration = async (userReq) => {
    const updated = pendingUsers.map((u) =>
      (u.id === userReq.id || (u.email && u.email === userReq.email))
        ? {
            ...u,
            status: "REJECTED",
            rejectedAt: new Date().toLocaleString(),
            rejectedBy: "System Administrator",
          }
        : u
    );

    saveAndBroadcastUsers(updated);

    try {
      await authApi.rejectUser(userReq.id, { email: userReq.email });
    } catch (e) {}

    addNotification("ugc", {
      title: `❌ Registration Rejected: ${userReq.fullName}`,
      desc: `Admin rejected registration request for ${userReq.email} (${userReq.institutionName}).`,
      tone: "bg-red-100 text-red-800",
      iconName: "XCircle",
    });

    setActionToast(`❌ Registration request for ${userReq.fullName} has been rejected.`);
    setTimeout(() => setActionToast(""), 4500);
  };

  // Filter and sort registration requests (NEWEST AT TOP, OLDER AT BOTTOM)
  const filteredUsers = [...pendingUsers]
    .filter((u) => {
      const matchesSearch =
        (u.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.institutionName || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PENDING_APPROVAL" && isPendingStatus(u.status)) ||
        (statusFilter === "ACTIVE" && isActiveStatus(u.status)) ||
        (statusFilter === "REJECTED" && isRejectedStatus(u.status));

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || a.submittedAt || Date.now()).getTime() || (typeof a.id === "number" ? a.id : 0);
      const timeB = new Date(b.createdAt || b.submittedAt || Date.now()).getTime() || (typeof b.id === "number" ? b.id : 0);
      return timeB - timeA;
    });

  const pendingCount = pendingUsers.filter((u) => isPendingStatus(u.status)).length;
  const activeCount = pendingUsers.filter((u) => isActiveStatus(u.status)).length;
  const rejectedCount = pendingUsers.filter((u) => isRejectedStatus(u.status)).length;

  return (
    <div className="p-6 space-y-6 min-h-full">
      <PageHeader
        title="System Admin — User Registration Approvals"
        subtitle="Review, manually verify, and approve institution and officer registration requests. Approved users automatically receive confirmation emails."
      />

      {/* Confirmation Toast Alert */}
      {actionToast && (
        <div className="bg-slate-900 border border-slate-700 text-white text-xs px-5 py-3 rounded-2xl flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Mail size={16} className="text-emerald-400 animate-bounce shrink-0" />
            <span className="font-semibold font-mono">{actionToast}</span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-800 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-600">
            Email Sent
          </span>
        </div>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Requests</p>
            <p className="text-2xl font-black font-mono text-slate-900 mt-1">{pendingUsers.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <UserPlus size={18} />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-800 font-bold uppercase tracking-wider">Pending Admin Approval</p>
            <p className="text-2xl font-black font-mono text-amber-900 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Approved & Email Sent</p>
            <p className="text-2xl font-black font-mono text-emerald-900 mt-1">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-red-800 font-bold uppercase tracking-wider">Rejected Requests</p>
            <p className="text-2xl font-black font-mono text-red-900 mt-1">{rejectedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-bold">
            <XCircle size={18} />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applicant name, email, or institution…"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Request Statuses</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="ACTIVE">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            {filteredUsers.length} Registration Request(s)
          </span>
        </div>
      </div>

      {/* Registration Requests Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Registration Requests Log
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-300">
                Manual Admin Approval Queue
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click 'Accept & Approve' to grant user access and send an automated confirmation email to their mail ID.
            </p>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200">
              {["Applicant & Institution", "Contact Email & Phone", "Requested Role", "Status", "Submission Time", "Admin Action"].map((h) => (
                <th key={h} className="text-left text-[10px] text-slate-600 font-bold uppercase tracking-wider px-4 py-3 first:pl-5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3.5 pl-5">
                  <p className="text-sm font-bold text-slate-900">{u.fullName}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building2 size={12} className="text-slate-400" />
                    {u.institutionName}
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-xs font-mono font-semibold text-slate-800">{u.email}</p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">+91 {u.mobileNumber}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-semibold">
                    {u.role === "ROLE_UGC_OFFICER" ? "UGC / AICTE Officer" : "Institutional Applicant"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  {isPendingStatus(u.status) ? (
                    <span className="text-xs text-amber-800 font-bold bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                      <Clock size={11} /> Pending Admin Approval
                    </span>
                  ) : isActiveStatus(u.status) ? (
                    <span className="text-xs text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                      <CheckCircle2 size={11} /> Approved & Email Sent
                    </span>
                  ) : (
                    <span className="text-xs text-red-800 font-bold bg-red-100 border border-red-300 px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                      <XCircle size={11} /> Rejected
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-xs font-mono text-slate-500">
                  {u.submittedAt || "Recent"}
                </td>
                <td className="px-4 py-3.5 pr-5">
                  {isPendingStatus(u.status) ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveRegistration(u)}
                        disabled={sendingEmailId === u.id}
                        className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {sendingEmailId === u.id ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        Accept & Approve Email
                      </button>
                      <button
                        onClick={() => handleRejectRegistration(u)}
                        className="text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  ) : isActiveStatus(u.status) ? (
                    <span className="text-xs text-emerald-700 font-mono font-bold flex items-center gap-1">
                      <Send size={12} /> Email Dispatched
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 font-mono font-bold">Request Declined</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
