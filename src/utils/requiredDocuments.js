import ALC_CONFIG from "../config";

export function requiredUploadDefs() {
  return (ALC_CONFIG.uploads || []).filter((item) => item.required);
}

export function missingRequiredUploads(data = {}) {
  const files = data?.uploads?.files || {};
  return requiredUploadDefs().filter((item) => !(files[item.id] || []).length);
}

/** First packet step that still has to be submitted, or null when the packet can open #done. */
export function firstIncompletePacketStep(activeForms = [], completed = {}, data = {}) {
  const missingDocs = missingRequiredUploads(data);

  for (const form of activeForms) {
    if (form.id === "uploads") {
      if (!completed.uploads || missingDocs.length > 0) {
        return { id: "uploads", missingDocs };
      }
      continue;
    }
    if (!completed[form.id]) {
      return { id: form.id, missingDocs };
    }
  }

  if (missingDocs.length > 0) {
    return { id: "uploads", missingDocs };
  }

  return null;
}
