import React, { useEffect, useRef, useState } from "react";
import { downloadPdfBundle, downloadWaitlistPdf } from "../pdf/pdfGenerator";
import { useEnrollment } from "../context/EnrollmentContext";
import { useSubmitEnrollmentEmail } from "../hooks/useSubmitEnrollmentEmail";
import { getNotificationEmail } from "../utils/submitEnrollmentEmail";

export function WaitlistDoneView() {
  const { state, activeLocation, showToast, navigateTo, clearPacket } = useEnrollment();
  const { status: emailStatus, error: emailError, sentTo } = useSubmitEnrollmentEmail({
    type: "waitlist",
    state,
    location: activeLocation,
    autoSend: true,
  });
  const [receiptName, setReceiptName] = useState("");
  const clearedRef = useRef(false);
  const packetSnapshotRef = useRef(null);

  useEffect(() => {
    if (emailStatus !== "sent" || clearedRef.current) return;
    const enNow = state.data?.enrollment || {};
    const name =
      [enNow.childFirst, enNow.childMI, enNow.childLast].filter(Boolean).join(" ").trim() ||
      enNow.childPreferred ||
      "Child";
    clearedRef.current = true;
    packetSnapshotRef.current = { data: state.data, location: activeLocation };
    setReceiptName(name);
    clearPacket();
  }, [emailStatus, state, activeLocation, clearPacket]);

  const en = state.data?.enrollment || {};
  const childName =
    receiptName ||
    [en.childFirst, en.childMI, en.childLast].filter(Boolean).join(" ").trim() ||
    en.childPreferred ||
    "Child";
  const inbox = sentTo || getNotificationEmail(activeLocation);

  const handleDownload = async (type) => {
    const snapshot = packetSnapshotRef.current;
    const downloadState = snapshot ? { data: snapshot.data, locationId: snapshot.location?.id } : state;
    const downloadLocation = snapshot?.location || activeLocation;
    try {
      if (type === "waitlist") {
        await downloadWaitlistPdf({ state: downloadState, location: downloadLocation });
        showToast("Waitlist packet PDF downloading…");
      } else {
        await downloadPdfBundle({ state: downloadState, location: downloadLocation, which: "enrollment" });
        showToast("Enrollment PDF downloading…");
      }
    } catch (err) {
      console.error(err);
      showToast("PDF generation failed — see console");
    }
  };

  return (
    <section id="view-waitlist-done" className="view is-active">
      <div className="done-panel">
        <div className="success-banner">
          <div>
            <strong>Waitlist agreement ready</strong>
            <span>
              Your waitlist enrollment form is complete. Download and print the agreement below, or email it to the
              center.
            </span>
          </div>
        </div>

        <p className="eyebrow">Waitlist · next steps</p>
        <h2>Secure your future seat</h2>
        <p className="section-lead">
          {emailStatus === "sending"
            ? `Sending your waitlist agreement and enrollment details for ${childName}…`
            : emailStatus === "error"
              ? `Your waitlist forms for ${childName} are complete. Download the PDF below. We could not email the center automatically.`
              : `Your waitlist agreement and enrollment details for ${childName} have been emailed to Angel Learning Center. You can also download a copy below.`}
        </p>

        {emailStatus === "error" && emailError ? <p className="hint" role="alert">{emailError}</p> : null}

        <div className="mail-summary" id="waitlistMailSummary">
          <div className="mail-row">
            <small>SENT TO CENTER</small>
            <strong>{inbox}</strong>
          </div>
          <div className="mail-row">
            <small>SUBJECT</small>
            <strong>Waitlist Agreement for {childName}</strong>
          </div>
        </div>

        <div className="pdf-actions hero-cta" style={{ marginBottom: "1.25rem" }}>
          <button type="button" className="btn btn-primary" onClick={() => handleDownload("waitlist")}>
            Download waitlist packet PDF
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => handleDownload("enrollment")}>
            Download enrollment form only
          </button>
        </div>

        <p className="hint">
          {receiptName
            ? "The form has been reset and is ready for the next enrollment. Downloads below are the packet that was just sent."
            : "The waitlist packet PDF includes your completed enrollment form first, followed by the waitlist agreement. Bring the signed packet and payment to the center to secure your place on the waitlist."}
        </p>

        <div className="hero-cta">
          <a
            href="#home"
            className="btn btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              navigateTo("home");
            }}
          >
            Back to home
          </a>
        </div>
      </div>
    </section>
  );
}

export default WaitlistDoneView;
