import React, { useEffect, useRef } from "react";
import { useEnrollment } from "../context/EnrollmentContext";

export function ConfirmModal() {
  const { confirmDialog, closeConfirm, confirmDialogAction, t } = useEnrollment();
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!confirmDialog?.open) return undefined;

    const previousFocus = document.activeElement;
    cancelRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeConfirm();
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
    };
  }, [confirmDialog?.open, closeConfirm]);

  if (!confirmDialog?.open) return null;

  const title = confirmDialog.title || t("resetPacketTitle") || "Start over?";
  const message = confirmDialog.message || t("confirmReset");
  const confirmLabel = confirmDialog.confirmLabel || t("resetPacketConfirm") || "Yes, start over";
  const cancelLabel = confirmDialog.cancelLabel || t("cancel") || "Cancel";

  return (
    <div className="modal-overlay" onClick={closeConfirm} role="presentation">
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmModalTitle"
        aria-describedby="confirmModalMessage"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirmModalTitle" className="modal-title">{title}</h2>
        <p id="confirmModalMessage" className="modal-message">{message}</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" ref={cancelRef} onClick={closeConfirm}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-primary" onClick={confirmDialogAction}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
