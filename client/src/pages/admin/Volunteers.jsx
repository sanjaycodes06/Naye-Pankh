import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search, Filter, Download, ChevronDown, X, Users, UserCheck,
  User, UserX, FileSpreadsheet,
} from "lucide-react";
import { adminAPI } from "@/api/admin.api";
import { useAuthStore } from "@/store/authStore";
import VolunteerRow from "@/components/admin/VolunteerRow";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Pagination from "@/components/common/Pagination";
import EmptyState from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Loader";
import { downloadFile, extractBlobErrorMessage } from "@/utils/downloadFile";
import toast from "react-hot-toast";

const C = { forest:"#1B3A2D", sage:"#7BAF8A", gold:"#C8923A" };

const STATUS_TABS = [
  { value: "",          label: "All" },
  { value: "pending",   label: "Pending" },
  { value: "approved",  label: "Approved" },
  { value: "rejected",  label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

const SKILLS_OPTIONS = ["Teaching","Medical","Technology","Logistics","Fundraising","Design","Photography","Music","Sports","Counselling"];

/* ── Debounce hook for the search box ─────────────────────────────── */
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

export default function Volunteers() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "superadmin";

  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [exporting, setExporting]   = useState(false);
  const [pendingRowId, setPendingRowId] = useState(null); // tracks in-flight approve/reactivate to prevent double-submit

  const [search, setSearch]         = useState("");
  const debouncedSearch              = useDebounce(search);
  const [status, setStatus]         = useState("");
  const [skillFilter, setSkillFilter] = useState([]);
  const [skillMenuOpen, setSkillMenuOpen] = useState(false);
  const skillMenuRef = useRef(null);

  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 });

  /* Action dialogs */
  const [dialog, setDialog] = useState({ type: null, volunteer: null });
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  /* Close skill dropdown on outside click */
  useEffect(() => {
    const handler = (e) => { if (!skillMenuRef.current?.contains(e.target)) setSkillMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Fetch volunteers whenever filters or page change */
  const fetchVolunteers = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (status)          params.status = status;
    if (skillFilter.length) params.skills = skillFilter.join(",");

    adminAPI.getVolunteers(params)
      .then(({ data }) => {
        setVolunteers(data.data.volunteers);
        setPagination(data.data.pagination);
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load volunteers."))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, status, skillFilter]);

  useEffect(() => { fetchVolunteers(); }, [fetchVolunteers]);

  /*
   * Reset to page 1 whenever filters change — guarded so it only fires
   * a setState when page actually needs to move, avoiding a redundant
   * second fetch (the previous version unconditionally called setPage(1)
   * on every filter change, firing fetchVolunteers twice: once with the
   * stale page via the effect above, and again once page settled to 1).
   */
  useEffect(() => {
    setPage((prev) => (prev !== 1 ? 1 : prev));
  }, [debouncedSearch, status, skillFilter]);

  /* ── Action handlers ── */
  const openDialog = (type, volunteer) => { setDialog({ type, volunteer }); setRejectReason(""); };
  const closeDialog = () => setDialog({ type: null, volunteer: null });

  const handleApprove = async (v) => {
    if (pendingRowId) return; // a row action is already in flight
    setPendingRowId(v._id);
    try {
      await adminAPI.updateVolunteerStatus(v._id, { status: "approved" });
      toast.success(`${v.fullName} approved.`);
      fetchVolunteers();
    } catch (err) { toast.error(err.response?.data?.message || "Approval failed."); }
    finally { setPendingRowId(null); }
  };

  const confirmReject = async () => {
    setActionLoading(true);
    try {
      await adminAPI.updateVolunteerStatus(dialog.volunteer._id, { status: "rejected", reason: rejectReason });
      toast.success(`${dialog.volunteer.fullName} rejected.`);
      closeDialog();
      fetchVolunteers();
    } catch (err) { toast.error(err.response?.data?.message || "Rejection failed."); }
    finally { setActionLoading(false); }
  };

  const confirmSuspend = async () => {
    setActionLoading(true);
    try {
      await adminAPI.updateVolunteerStatus(dialog.volunteer._id, { status: "suspended" });
      toast.success(`${dialog.volunteer.fullName} suspended.`);
      closeDialog();
      fetchVolunteers();
    } catch (err) { toast.error(err.response?.data?.message || "Action failed."); }
    finally { setActionLoading(false); }
  };

  const handleReactivate = async (v) => {
    if (pendingRowId) return;
    setPendingRowId(v._id);
    try {
      await adminAPI.updateVolunteerStatus(v._id, { status: "approved" });
      toast.success(`${v.fullName} reactivated.`);
      fetchVolunteers();
    } catch (err) { toast.error(err.response?.data?.message || "Action failed."); }
    finally { setPendingRowId(null); }
  };

  const confirmDelete = async () => {
    setActionLoading(true);
    try {
      await adminAPI.deleteVolunteer(dialog.volunteer._id);
      toast.success(`${dialog.volunteer.fullName} deleted permanently.`);
      closeDialog();
      fetchVolunteers();
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed."); }
    finally { setActionLoading(false); }
  };

  /* ── CSV export ── */
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await adminAPI.exportVolunteers(params);
      const filename = `volunteers_${status || "all"}_${new Date().toISOString().split("T")[0]}.csv`;
      downloadFile(data, filename);
      toast.success("CSV downloaded.");
    } catch (err) {
      const message = await extractBlobErrorMessage(err, "Export failed. Please try again.");
      toast.error(message);
    } finally { setExporting(false); }
  };

  const toggleSkill = (skill) =>
    setSkillFilter(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);

  const activeFilterCount = (status ? 1 : 0) + skillFilter.length;

  /* ── Counts for tab badges (derived from current page load, refined via dashboard stats ideally) ── */
  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>Volunteers</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {pagination.total} total · manage applications, status, and records
          </p>
        </div>
        <button onClick={handleExport} disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 shrink-0">
          {exporting
            ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            : <FileSpreadsheet size={15} />
          }
          Export CSV
        </button>
      </div>

      {/* ── Status tabs ── */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit overflow-x-auto">
        {STATUS_TABS.map(tab => (
          <button key={tab.value} onClick={() => setStatus(tab.value)}
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            style={status === tab.value
              ? { background: C.forest, color: "white" }
              : { color: "#6B7280" }
            }>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Search + filter bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, city, ID…"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Skill filter dropdown */}
        <div ref={skillMenuRef} className="relative">
          <button onClick={() => setSkillMenuOpen(o => !o)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter size={14} />
            Skills{skillFilter.length > 0 && <span className="text-xs font-bold" style={{ color: C.forest }}>({skillFilter.length})</span>}
            <ChevronDown size={13} className={skillMenuOpen ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
          {skillMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-56 bg-white rounded-xl shadow-card-lg border border-gray-100 p-2 z-20 animate-slide-up">
              {SKILLS_OPTIONS.map(skill => (
                <label key={skill} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={skillFilter.includes(skill)} onChange={() => toggleSkill(skill)}
                    className="w-3.5 h-3.5 accent-green-700" />
                  {skill}
                </label>
              ))}
            </div>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button onClick={() => { setStatus(""); setSkillFilter([]); }}
            className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
            Clear filters
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {["Volunteer","ID","Location","Skills","Status","Joined","Hours",""].map((h, i) => (
                  <th key={i} className={`px-4 py-3 text-2xs font-semibold text-gray-400 uppercase tracking-wider ${i === 6 ? "text-right" : "text-left"}`} style={{ fontSize: "10px" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3.5"><Skeleton className="h-9 w-full" /></td></tr>
                ))
              ) : volunteers.length === 0 ? (
                <tr><td colSpan={8}>
                  <EmptyState icon={Users} title="No volunteers found"
                    description="Try adjusting your search or filters." />
                </td></tr>
              ) : (
                volunteers.map(v => (
                  <VolunteerRow key={v._id} volunteer={v} isSuperAdmin={isSuperAdmin}
                    isPending={pendingRowId === v._id}
                    onApprove={handleApprove}
                    onReject={(v) => openDialog("reject", v)}
                    onSuspend={(v) => openDialog("suspend", v)}
                    onReactivate={handleReactivate}
                    onDelete={(v) => openDialog("delete", v)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && volunteers.length > 0 && (
          <div className="px-4 pb-4">
            <Pagination page={page} pages={pagination.pages} total={pagination.total} limit={pagination.limit} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* ── Reject dialog ── */}
      <ConfirmDialog
        isOpen={dialog.type === "reject"} onClose={closeDialog} onConfirm={confirmReject}
        title="Reject application" danger loading={actionLoading} confirmLabel="Reject volunteer"
        description={`${dialog.volunteer?.fullName} will be notified by email. You can optionally include a reason.`}
      >
        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
          placeholder="Reason (optional)…" rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-red-300 resize-none" />
      </ConfirmDialog>

      {/* ── Suspend dialog ── */}
      <ConfirmDialog
        isOpen={dialog.type === "suspend"} onClose={closeDialog} onConfirm={confirmSuspend}
        title="Suspend volunteer" loading={actionLoading} confirmLabel="Suspend"
        description={`${dialog.volunteer?.fullName} will lose access to their dashboard until reactivated.`}
      />

      {/* ── Delete dialog ── */}
      <ConfirmDialog
        isOpen={dialog.type === "delete"} onClose={closeDialog} onConfirm={confirmDelete}
        title="Delete permanently" danger loading={actionLoading} confirmLabel="Delete forever"
        description={`This permanently removes ${dialog.volunteer?.fullName}'s account and all records. This cannot be undone.`}
      />
    </div>
  );
}
