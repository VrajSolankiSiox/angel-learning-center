import React, { useState } from "react";
import ALC_CONFIG from "../config";
import { useEnrollment } from "../context/EnrollmentContext";
import { filesToUploadMeta, IES_UPLOAD_ID, shouldRetainUploadData } from "../utils/uploadFileData";
import { useFormDraft } from "../hooks/useFormDraft";
import { completeFormAndGo } from "../utils/formNext";
import { missingRequiredUploads } from "../utils/requiredDocuments";
import { downloadBlankIesPdf } from "../pdf/pdfGenerator";

export function UploadsView() {
  const { state, saveForm, uploadFile, showToast, t, navigateTo } = useEnrollment();

  const savedData = state.data?.uploads || {};
  const [upConfirm, setUpConfirm] = useState(!!savedData.upConfirm);
  const [iesNotEligible, setIesNotEligible] = useState(!!savedData.iesNotEligible);
  const [uploadError, setUploadError] = useState("");
  const [iesError, setIesError] = useState("");

  useFormDraft("uploads", { upConfirm, iesNotEligible });

  const files = state.data?.uploads?.files || {};
  const uploadDefs = ALC_CONFIG.uploads || [];
  const requiredList = uploadDefs.filter((u) => u.required);
  const optionalList = uploadDefs.filter((u) => !u.required);

  const handleFileChange = async (e, def) => {
    const inputFiles = e.target.files;
    if (!inputFiles || inputFiles.length === 0) return;

    try {
      const metaList = await filesToUploadMeta(inputFiles, {
        uploadedBy: "parent",
        retainData: shouldRetainUploadData(def.id),
      });
      uploadFile(def.id, metaList, "parent");
    } catch (err) {
      console.error("Upload failed:", err);
    }

    e.target.value = "";
  };

  const iesUploaded = (files[IES_UPLOAD_ID] || []).length > 0;
  const iesSatisfied = iesUploaded || iesNotEligible;

  const handleDownloadIes = async () => {
    try {
      await downloadBlankIesPdf();
      showToast("Meal Benefit form downloaded");
    } catch (err) {
      console.error(err);
      showToast("Meal Benefit form download failed");
    }
  };

  const handleNext = (e) => {
    const missing = missingRequiredUploads(state.data);
    if (missing.length > 0) {
      const message = `Upload every required document before finishing: ${missing.map((item) => item.label).join(", ")}`;
      setUploadError(message);
      setIesError("");
      showToast(message);
      return;
    }
    if (!upConfirm) {
      const message = "Confirm that the required documents are complete before finishing.";
      setUploadError(message);
      setIesError("");
      showToast(message);
      return;
    }
    if (!iesSatisfied) {
      const message =
        "Upload the completed Meal Benefit form, or check “I am not eligible for this” to continue without meal benefits.";
      setUploadError("");
      setIesError(message);
      showToast(message);
      return;
    }

    setUploadError("");
    setIesError("");
    completeFormAndGo({
      event: e,
      saveForm,
      formId: "uploads",
      getPayload: () => ({ upConfirm: true, iesNotEligible: iesUploaded ? false : iesNotEligible }),
      navigateTo,
      target: "done",
    });
  };

  const renderSlot = (def) => {
    const saved = files[def.id] || [];
    const hasFiles = saved.length > 0;

    let statusContent;
    if (hasFiles) {
      statusContent = (
        <span className="upload-status done">
          On file: {saved.map((f) => f.name).join(", ")}
        </span>
      );
    } else if (def.required) {
      statusContent = <span className="upload-status todo">Required</span>;
    } else {
      statusContent = <span className="upload-status">Optional</span>;
    }

    return (
      <div key={def.id} className="upload-row" data-upload-id={def.id}>
        <div className="upload-row-head">
          <strong>
            {def.label}
            {def.required ? " *" : ""}
          </strong>
          {statusContent}
        </div>
        {def.id === IES_UPLOAD_ID && !hasFiles ? (
          <div className="ies-benefit-warning" role="alert">
            <p>
              You will not receive meal benefits if you do not upload the completed Meal Benefit (IES) form.
            </p>
            <button type="button" className="btn btn-secondary" onClick={handleDownloadIes}>
              Download form
            </button>
          </div>
        ) : null}
        {def.note && def.id !== IES_UPLOAD_ID ? <p className="hint">{def.note}</p> : null}
        {def.id === IES_UPLOAD_ID && !hasFiles ? (
          <label className="check">
            <input
              type="checkbox"
              name="iesNotEligible"
              checked={iesNotEligible}
              onChange={(e) => setIesNotEligible(e.target.checked)}
            />
            I am not eligible for this
          </label>
        ) : null}
        {def.id === IES_UPLOAD_ID && iesError ? (
          <p className="hint" role="alert">
            {iesError}
          </p>
        ) : null}
        <label className="upload-file-label">
          <span>Choose file{def.multiple ? "(s)" : ""}</span>
          <input
            type="file"
            name={`up_${def.id}`}
            data-upload-id={def.id}
            accept=".pdf,image/*"
            multiple={!!def.multiple}
            onChange={(e) => handleFileChange(e, def)}
          />
        </label>
      </div>
    );
  };

  return (
    <section id="view-uploads" className="view is-active">
      <form className="form-shell" data-form="uploads" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="page-head">
          <a
            href="#packet"
            className="back"
            data-nav="packet"
            data-i18n="backPacket"
            onClick={(e) => {
              e.preventDefault();
              navigateTo("packet");
            }}
          >
            {t("backPacket") || "← Back to packet"}
          </a>
          <p className="eyebrow">Documents</p>
          <h2>Required uploads</h2>
          <p className="section-lead">
            These documents are required before the packet can be completed: parent SSN, child SSN, birth certificate,
            immunization / shot records, proof of GA residency, and parent/guardian photo ID. Optional items can be
            added if they apply.
          </p>
        </div>

        <fieldset>
          <legend>Required for enrollment</legend>
          <div id="uploadSlots" className="upload-slots">
            {requiredList.map(renderSlot)}
          </div>
          <label className="check">
            <input
              type="checkbox"
              name="upConfirm"
              checked={upConfirm}
              onChange={(e) => setUpConfirm(e.target.checked)}
              required
            />
            I confirm the required documents above are uploaded and ready for enrollment review.
          </label>
          {uploadError ? (
            <p className="hint" role="alert">
              {uploadError}
            </p>
          ) : null}
        </fieldset>

        <fieldset>
          <legend>Optional / if applicable</legend>
          <div id="uploadSlotsOptional" className="upload-slots">
            {optionalList.map(renderSlot)}
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="button" className="btn btn-primary" data-i18n="finishPacket" onClick={handleNext}>
            {t("finishPacket") || "Finish packet →"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default UploadsView;
