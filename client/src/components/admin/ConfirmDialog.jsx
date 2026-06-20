import Modal from "@/components/common/Modal";
import { AlertTriangle } from "lucide-react";

const C = { forest:"#1B3A2D" };

/**
 * Generic confirmation modal for destructive or important actions
 * (delete volunteer, reject application, revoke certificate, etc.)
 */
const ConfirmDialog = ({
  isOpen, onClose, onConfirm, title, description,
  confirmLabel = "Confirm", danger = false, loading = false,
  children, // optional extra form content (e.g. rejection reason textarea)
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="flex items-start gap-3 mb-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${danger ? "bg-red-50" : "bg-amber-50"}`}>
        <AlertTriangle size={16} className={danger ? "text-red-500" : "text-amber-500"} />
      </div>
      <p className="text-sm text-gray-500 leading-relaxed pt-1">{description}</p>
    </div>

    {children}

    <div className="flex items-center justify-end gap-2 mt-6">
      <button
        onClick={onClose}
        className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
        style={{ background: danger ? "#DC2626" : C.forest, color: "white" }}
      >
        {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
