import React, { useState } from "react";
import ALC_CONFIG from "../config";
import { useEnrollment } from "../context/EnrollmentContext";
import { filesToUploadMeta, shouldRetainUploadData } from "../utils/uploadFileData";

export function StaffView() {
  const { state, uploadFile, showToast, navigateTo } = useEnrollment();

  const [selectedType, setSelectedType] = useState(() => {
    return (ALC_CONFIG.uploads || [])[0]?.id || "parent_ssn_doc";
  });
  const [fileInputKey, setFileInputKey] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [staffNote, setStaffNote] = useState("");

  const uploadDefs = ALC_CONFIG.uploads || [];
  const files = state.data?.uploads?.files || {};
  const staffLog = state.data?.uploads?.staffLog || [];

  const handleStaffUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      showToast("Choose a file to upload");
      return;
    }

    try {
      const metaList = await filesToUploadMeta(selectedFiles, {
        uploadedBy: "staff",
        note: staffNote,
        retainData: shouldRetainUploadData(selectedType),
      });
      uploadFile(selectedType, metaList, "staff", staffNote);
      setSelectedFiles([]);
      setStaffNote("");
      setFileInputKey((prev) => prev + 1);
      showToast("Document added to packet");
    } catch (err) {
      console.error("Staff upload failed:", err);
      showToast("Upload failed — try again");
    }
  };

  return (
    <section id="view-staff" className="view is-active">
      <div className="staff-panel form-shell">
        <div className="page-head">
          <a
            href="#home"
            className="back"
            data-nav="home"
            onClick={(e) => {
              e.preventDefault();
              navigateTo("home");
            }}
          >
            ← Back to home
          </a>
          <p className="eyebrow">Center operations</p>
          <h2>Staff · packet documents</h2>
          <p className="section-lead">
            Review document status for the current packet and upload any missing files at a later date.
          </p>
        </div>

        <div id="staffDocStatus" className="staff-doc-status">
          {uploadDefs.map((def) => {
            const saved = files[def.id] || [];
            const isOk = saved.length > 0;
            const rowClass = isOk ? "ok" : def.required ? "missing" : "";

            return (
              <div key={def.id} className={`staff-doc-row ${rowClass}`}>
                <strong>{def.label}</strong>
                <span>
                  {isOk ? (
                    saved.map((f, i) => (
                      <React.Fragment key={i}>
                        {f.name} <small>({f.uploadedBy || "parent"}{f.note ? ` · ${f.note}` : ""})</small>
                        {i < saved.length - 1 ? <br /> : null}
                      </React.Fragment>
                    ))
                  ) : def.required ? (
                    "Missing — staff can upload"
                  ) : (
                    "Not provided"
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <fieldset>
          <legend>Upload missing document to packet</legend>
          <div className="grid-2">
            <label>
              Document type
              <select
                id="staffDocType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {uploadDefs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                    {d.required ? " *" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              File
              <input
                key={fileInputKey}
                type="file"
                id="staffDocFile"
                accept=".pdf,image/*"
                onChange={(e) => setSelectedFiles(e.target.files)}
              />
            </label>
          </div>
          <label>
            Staff note (optional)
            <input
              type="text"
              id="staffDocNote"
              placeholder="e.g. Received at front desk 8/11"
              value={staffNote}
              onChange={(e) => setStaffNote(e.target.value)}
            />
          </label>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-primary"
              id="staffUploadBtn"
              onClick={handleStaffUpload}
            >
              Add to packet
            </button>
          </div>
        </fieldset>

        <div id="staffUploadLog" className="upload-log">
          {staffLog.length > 0 ? (
            <>
              <h3>Staff upload history</h3>
              <ul>
                {staffLog.map((e, idx) => (
                  <li key={idx}>
                    <strong>{e.label}</strong> — {e.name}{" "}
                    <small>
                      {new Date(e.uploadedAt).toLocaleString()}
                      {e.note ? ` · ${e.note}` : ""}
                    </small>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="hint">No staff uploads yet for this packet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default StaffView;
