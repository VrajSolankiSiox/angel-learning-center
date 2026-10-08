import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FormList from "../components/FormList";
import { downloadPdfBundle, getSubmissionStorageKey } from "../pdf/pdfGenerator";
import { useEnrollment } from "../context/EnrollmentContext";
import { useSubmitEnrollmentEmail } from "../hooks/useSubmitEnrollmentEmail";
import { getNotificationEmail } from "../utils/submitEnrollmentEmail";

const SEND_MODAL_DISCLAIMER =
  "Because space in our programs can fill up fast, completing this form doesn't automatically secure an immediate spot. Please connect directly with your chosen center location to discuss start dates and confirm your seat.";

function packetEmailAlreadySent(state) {
  if (!state) return false;
  const key = getSubmissionStorageKey(state, "packet");
  const value = sessionStorage.getItem(key);
  return Boolean(value && value !== "__sending__");
}

export function DoneView() {
  const { state, activeLocation, showToast, t, navigateTo, clearPacket } = useEnrollment();
  const alreadySent = useMemo(() => packetEmailAlreadySent(state), [state]);
  const [userConfirmed, setUserConfirmed] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [formCleared, setFormCleared] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const sendModalCancelRef = useRef(null);
  const clearedRef = useRef(false);
  const packetSnapshotRef = useRef(null);

  const { status: emailStatus, error: emailError, sentTo, documentCount, submit } = useSubmitEnrollmentEmail({
    type: "packet",
    state,
    location: activeLocation,
    autoSend: false,
  });

  const showCompleteUi =
    formCleared || alreadySent || userConfirmed || emailStatus === "sent" || emailStatus === "skipped";

  const emailDelivered =
    alreadySent || emailStatus === "sent" || emailStatus === "skipped";

  const handleSendFromModal = () => {
    setSendModalOpen(false);
    setUserConfirmed(true);
    submit();
  };

  const handleSendAgain = () => {
    const key = getSubmissionStorageKey(state, "packet");
    sessionStorage.removeItem(key);
    setUserConfirmed(true);
    submit();
  };

  useEffect(() => {
    if (clearedRef.current) return;
    const justSent = emailStatus === "sent";
    const previouslySent = alreadySent && emailStatus !== "sending" && emailStatus !== "error";
    if (!justSent && !previouslySent) return;

    const enNow = state.data?.enrollment || {};
    const name =
      [enNow.childFirst, enNow.childMI, enNow.childLast].filter(Boolean).join(" ").trim() ||
      enNow.childPreferred ||
      "Child";
    clearedRef.current = true;
    packetSnapshotRef.current = { data: state.data, location: activeLocation };
    setReceipt({
      childName: name,
      subject: `Enrollment Packet for ${name}`,
      inbox: sentTo || getNotificationEmail(activeLocation),
    });
    setFormCleared(true);
    clearPacket();
  }, [emailStatus, alreadySent, state, activeLocation, sentTo, clearPacket]);

  useEffect(() => {
    if (!sendModalOpen) return undefined;

    const previousFocus = document.activeElement;
    sendModalCancelRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") setSendModalOpen(false);
    };

    const html = document.documentElement;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyPadding = document.body.style.paddingRight;

    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.paddingRight = prevBodyPadding;
      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
    };
  }, [sendModalOpen]);

  const handleDownloadPdfs = async (which) => {
    const snapshot = packetSnapshotRef.current;
    try {
      await downloadPdfBundle({
        state: snapshot ? { data: snapshot.data, locationId: snapshot.location?.id } : state,
        location: snapshot?.location || activeLocation,
        which,
      });
      showToast(
        which === "financial"
          ? "Financial PDF downloading…"
          : which === "enrollment"
            ? "Enrollment PDF downloading…"
            : "Full packet PDF downloading…"
      );
    } catch (err) {
      console.error(err);
      showToast("PDF generation failed — see console");
    }
  };

  const en = state.data?.enrollment || {};
  const liveChildName =
    [en.childFirst, en.childMI, en.childLast].filter(Boolean).join(" ").trim() ||
    en.childPreferred ||
    "Child";
  const inbox = receipt?.inbox || sentTo || getNotificationEmail(activeLocation);
  const childName = receipt?.childName || liveChildName;
  const subject = receipt?.subject || `Enrollment Packet for ${childName}`;

  return (
    <section id="view-done" className="view is-active">
      <div className="done-panel">
        {showCompleteUi ? (
          <div className="success-banner">
            <div>
              <strong data-i18n="doneStrong">Enrollment packet complete</strong>
              <span data-i18n="doneText">
                Download your completed forms below and bring them to your center.
              </span>
            </div>
          </div>
        ) : null}

        {!showCompleteUi ? (
          <section className="done-ready-card" aria-labelledby="doneReadyTitle">
            <p className="eyebrow" data-i18n="doneEyebrow">
              {t("doneEyebrow") || "What happens next"}
            </p>
            <h2 id="doneReadyTitle" data-i18n="doneTitle">
              {t("doneTitle") || "You're all set"}
            </h2>
            <p className="section-lead done-confirm-intro">
              When you&apos;re ready, send your completed packet to your Angel Learning Center location.
            </p>
            <div className="done-send-cta">
              <button
                type="button"
                className="btn btn-confirm-send"
                id="openEnrollmentSendModal"
                onClick={() => setSendModalOpen(true)}
              >
                Confirm and send to center
              </button>
            </div>
          </section>
        ) : (
          <>
            <p className="eyebrow" data-i18n="doneEyebrow">
              {t("doneEyebrow") || "What happens next"}
            </p>
            <h2 data-i18n="doneTitle">{t("doneTitle") || "You're all set"}</h2>
            <p className="section-lead" data-i18n="doneLead">
              {emailStatus === "sending"
                ? "Sending your completed forms and PDF…"
                : emailStatus === "error"
                  ? "Your packet is complete. Download the PDF below. We could not send the email automatically — see the message below."
                  : emailDelivered
                    ? "Your completed forms and PDF have been sent to the center. You can also download a copy below."
                    : "Confirming your packet…"}
            </p>

            {emailStatus === "error" && emailError ? (
              <p className="hint" role="alert">
                {emailError}
                {import.meta.env.DEV ? (
                  <>
                    {" "}
                    Local dev: add <code>RESEND_API_KEY</code> to a <code>.env</code> file in the project root,
                    restart <code>npm run dev</code>, then confirm again. Mail should go to {inbox}.
                  </>
                ) : null}
              </p>
            ) : null}

            <div className="mail-summary" id="mailSummary">
              <div className="mail-row">
                <small data-i18n="emailToCenter">{t("emailToCenter") || "SENT TO CENTER"}</small>
                <strong id="doneInbox">{inbox}</strong>
              </div>
              <div className="mail-row">
                <small>SUBJECT</small>
                <strong id="doneSubject">{subject}</strong>
              </div>
              <div className="mail-row">
                <small data-i18n="emailAttachments">{t("emailAttachments") || "ATTACHMENTS"}</small>
                <strong id="doneAttachNote">
                  {emailDelivered
                    ? documentCount
                      ? `Enrollment packet PDF and ${documentCount} uploaded document${documentCount === 1 ? "" : "s"} emailed`
                      : "Enrollment packet PDF emailed"
                    : emailStatus === "sending"
                      ? "Preparing enrollment packet PDF and uploaded documents…"
                      : t("emailAttachmentList") || "Enrollment packet PDF and uploaded documents"}
                </strong>
              </div>
            </div>
          </>
        )}

        <div className="pdf-actions hero-cta" style={{ marginBottom: "1.25rem" }}>
          <button
            type="button"
            className="btn btn-primary"
            id="downloadPacketPdfs"
            onClick={() => handleDownloadPdfs("packet")}
          >
            Download full packet PDF
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            id="downloadEnrollmentPdf"
            onClick={() => handleDownloadPdfs("enrollment")}
          >
            Enrollment PDF
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            id="downloadFinancialPdf"
            onClick={() => handleDownloadPdfs("financial")}
          >
            Financial PDF (full legal text)
          </button>
        </div>

        <p className="hint" id="pdfHint">
          {formCleared
            ? "The form has been reset and is ready for the next enrollment. Downloads below are the packet that was just sent."
            : "PDFs are generated in your browser from the filled answers. The email includes the packet PDF and each file from Documents as its own attachment. The full packet download also appends those files after the forms."}
        </p>

        {showCompleteUi && !formCleared ? (
          <div className="hero-cta" style={{ marginBottom: "1.25rem" }}>
            <button type="button" className="btn btn-secondary" onClick={handleSendAgain} disabled={emailStatus === "sending"}>
              {emailStatus === "sending" ? "Sending…" : "Send packet again"}
            </button>
          </div>
        ) : null}

        {formCleared ? null : <FormList asLink={false} compact={true} id="doneList" />}

        <div className="hero-cta">
          <a
            href="#packet"
            className="btn btn-secondary"
            data-nav="packet"
            data-i18n="reviewChecklist"
            onClick={(e) => {
              e.preventDefault();
              navigateTo("packet");
            }}
          >
            {t("reviewChecklist") || "Review checklist"}
          </a>
        </div>
      </div>

      {sendModalOpen
        ? createPortal(
            <div
              className="modal-overlay enrollment-send-overlay"
              onClick={() => setSendModalOpen(false)}
              role="presentation"
            >
              <div
                className="modal-dialog modal-dialog--enrollment-send"
                role="dialog"
                aria-modal="true"
                aria-labelledby="enrollmentSendModalTitle"
                aria-describedby="enrollmentSendModalMessage"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="done-confirm-kicker">Before you send</p>
                <h2 id="enrollmentSendModalTitle" className="modal-title">
                  A Quick Note on Your Enrollment!
                </h2>
                <p className="modal-message modal-message--lead">We&apos;re Excited to Welcome You!</p>
                <p id="enrollmentSendModalMessage" className="modal-message modal-message--disclaimer">
                  {SEND_MODAL_DISCLAIMER}
                </p>
                <div className="modal-actions modal-actions--send">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    ref={sendModalCancelRef}
                    onClick={() => setSendModalOpen(false)}
                  >
                    Go back
                  </button>
                  <button
                    type="button"
                    className="btn btn-confirm-send"
                    id="confirmEnrollmentSubmit"
                    onClick={handleSendFromModal}
                  >
                    Confirm and send
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}

export default DoneView;
