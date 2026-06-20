import { Link } from "react-router-dom";
import { Check, X, Ban, Trash2, MoreVertical, Eye } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate } from "@/utils/formatDate";

const C = { forest:"#1B3A2D", sage:"#7BAF8A", gold:"#C8923A" };

/**
 * Single row in the volunteers table. Row-level actions adapt to current status:
 * pending → Approve / Reject
 * approved → Suspend / Delete
 * rejected/suspended → Reactivate / Delete
 */
const VolunteerRow = ({ volunteer: v, onApprove, onReject, onSuspend, onReactivate, onDelete, isSuperAdmin, isPending }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = v.fullName?.charAt(0).toUpperCase() || "V";

  return (
    <tr className="group hover:bg-gray-50/80 transition-colors">
      {/* Volunteer identity */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          {v.profilePhoto ? (
            <img src={v.profilePhoto} alt={v.fullName} className="w-9 h-9 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: C.forest }}>
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <Link to={`/admin/volunteers/${v._id}`} className="text-sm font-semibold text-gray-800 hover:underline truncate block">
              {v.fullName}
            </Link>
            <p className="text-xs text-gray-400 truncate">{v.email}</p>
          </div>
        </div>
      </td>

      {/* Volunteer ID */}
      <td className="px-4 py-3.5">
        <span className="text-xs font-mono text-gray-500">{v.volunteerId || "—"}</span>
      </td>

      {/* Location */}
      <td className="px-4 py-3.5 text-sm text-gray-600">
        {[v.city, v.state].filter(Boolean).join(", ") || "—"}
      </td>

      {/* Skills */}
      <td className="px-4 py-3.5">
        <div className="flex flex-wrap gap-1 max-w-[160px]">
          {(v.skills || []).slice(0, 2).map(s => (
            <span key={s} className="px-1.5 py-0.5 rounded text-2xs font-medium" style={{ background: `${C.sage}18`, color: C.forest, fontSize: "10px" }}>
              {s}
            </span>
          ))}
          {(v.skills?.length || 0) > 2 && (
            <span className="text-2xs text-gray-400" style={{ fontSize: "10px" }}>+{v.skills.length - 2}</span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <StatusBadge status={v.status} />
      </td>

      {/* Joined */}
      <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
        {formatDate(v.joinedAt)}
      </td>

      {/* Hours */}
      <td className="px-4 py-3.5 text-sm font-medium text-gray-700 text-right">
        {v.totalHours ?? 0}h
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1.5">
          {v.status === "pending" && (
            <>
              <button onClick={() => onApprove(v)} disabled={isPending}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: `${C.sage}18`, color: C.forest }}
                title="Approve volunteer">
                {isPending
                  ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <Check size={12} />
                }
                {isPending ? "Approving…" : "Approve"}
              </button>
              <button onClick={() => onReject(v)} disabled={isPending}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                title="Reject volunteer">
                <X size={12} /> Reject
              </button>
            </>
          )}

          {/* Overflow menu for secondary actions */}
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen(o => !o)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-card-lg border border-gray-100 py-1 z-20 animate-slide-up">
                <Link to={`/admin/volunteers/${v._id}`}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Eye size={14} /> View profile
                </Link>
                {v.status === "approved" && (
                  <button onClick={() => { setMenuOpen(false); onSuspend(v); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors text-left">
                    <Ban size={14} /> Suspend
                  </button>
                )}
                {(v.status === "rejected" || v.status === "suspended") && (
                  <button onClick={() => { setMenuOpen(false); onReactivate(v); }} disabled={isPending}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors text-left disabled:opacity-60 disabled:cursor-not-allowed">
                    <Check size={14} /> {isPending ? "Reactivating…" : "Reactivate"}
                  </button>
                )}
                {isSuperAdmin && (
                  <>
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={() => { setMenuOpen(false); onDelete(v); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                      <Trash2 size={14} /> Delete permanently
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default VolunteerRow;
