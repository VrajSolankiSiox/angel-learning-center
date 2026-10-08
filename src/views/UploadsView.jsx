import React, { useState } from "react";
import ALC_CONFIG from "../config";
import { useEnrollment } from "../context/EnrollmentContext";
import { filesToUploadMeta, shouldRetainUploadData } from "../utils/uploadFileData";
import { useFormDraft } from "../hooks/useFormDraft";
import { completeFormAndGo } from "../utils/formNext";
import { missingRequiredUploads } from "../utils/requiredDocuments";

export function UploadsView() {
  const { state, saveForm, uploadFile, showToast, t, navigateTo } = useEnrollment();

  const savedData = state.data?.uploads || {};
  const [upConfirm, setUpConfirm] = useState(!!savedData.upConfirm);
  const [uploadError, setUploadError] = useState("");

  useFormDraft("uploads", { upConfirm });

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

  const handleNext = (e) => {
    const missing = missingRequiredUploads(state.data);
    if (!upConfirm || missing.length > 0) {
      const message = !upConfirm
        ? "Confirm that the required documents are complete before finishing."
        : `Upload every required document before finishing: ${missing.map((item) => item.label).join(", ")}`;
      setUploadError(message);
      showToast(message);
      return;
    }

    setUploadError("");
    completeFormAndGo({
      event: e,
      saveForm,
      formId: "uploads",
      getPayload: () => ({ upConfirm: true }),
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
        {def.note ? <p className="hint">{def.note}</p> : null}
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
