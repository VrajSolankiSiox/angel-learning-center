import React from "react";
import FormList from "../components/FormList";
import { downloadPdfBundle } from "../pdf/pdfGenerator";
import { useEnrollment } from "../context/EnrollmentContext";

export function DoneView() {
  const { state, activeLocation, showToast, t, navigateTo } = useEnrollment();

  const handleDownloadPdfs = async (which) => {
    try {
      await downloadPdfBundle({ state, location: activeLocation, which });
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

  const inbox = activeLocation?.inbox || "savannah@angellearningcenter.com";
  const en = state.data?.enrollment || {};
  const childName =
    [en.childFirst, en.childMI, en.childLast].filter(Boolean).join(" ").trim() ||
    en.childPreferred ||
    "Child";
  const subject = `Enrollment Packet for ${childName}`;

  return (
    <section id="view-done" className="view is-active">
      <div className="done-panel">
        <div className="success-banner">
          <div>
            <strong data-i18n="doneStrong">{t("doneStrong") || "Packet ready for the center"}</strong>
            <span data-i18n="doneText">
              {t("doneText") || "Download your completed forms below and bring them to your center."}
            </span>
          </div>
        </div>

        <p className="eyebrow" data-i18n="doneEyebrow">
          {t("doneEyebrow") || "What happens next"}
        </p>
        <h2 data-i18n="doneTitle">{t("doneTitle") || "You’re all set"}</h2>
        <p className="section-lead" data-i18n="doneLead">
          {t("doneLead") ||
            "Review your checklist, download the packet PDF, and submit it to your Angel Learning Center location."}
        </p>

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
              {t("emailAttachmentList") || "Download your completed enrollment packet PDF below"}
            </strong>
          </div>
        </div>

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
          PDFs are generated in your browser from the filled answers. The full packet appends uploaded documents after the forms: completed Meal Benefit (IES) first, then your other uploaded files (PDF or image). Re-upload in Documents if a file was added before this update.
        </p>

        <FormList asLink={false} compact={true} id="doneList" />

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
    </section>
  );
}

export default DoneView;
