import { getUploadsForMerge } from "../pdf/mergePacketPdf";
import {
  generatePdfBundleBlob,
  generateWaitlistPdfBlob,
  getSubmissionStorageKey,
} from "../pdf/pdfGenerator";
import {
  buildEnrollmentEmailBody,
  buildEnrollmentEmailSubject,
  documentEmailLabel,
  formatUploadedDocumentsSection,
} from "./enrollmentEmailSummary";

const API_PATH = "/api/submit-enrollment";
const CC_EMAIL = "info@angellearningcenter.com";
export const LOCAL_DEV_NOTIFICATION_EMAIL = "dev4@sioxglobal.com";
const SEND_PENDING = "__sending__";
/** Coalesce parallel calls (e.g. React Strict Mode) before sessionStorage is set. */
const inFlightByStorageKey = new Map();

export function isLocalEnrollmentDev() {
  if (import.meta.env.DEV) return true;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1";
  }
  return false;
}
/** Keep under Vercel ~4.5 MB request limit (multipart = raw bytes, no base64 overhead). */
const MAX_EMAIL_BYTES = 3.8 * 1024 * 1024;
/** Local Vite has no 4.5 MB body cap. Stay under Resend's attachment limit. */
const MAX_LOCAL_EMAIL_BYTES = 22 * 1024 * 1024;

function maxEmailBytes() {
  return isLocalEnrollmentDev() ? MAX_LOCAL_EMAIL_BYTES : MAX_EMAIL_BYTES;
}

function safeAttachmentName(file, index) {
  const label = documentEmailLabel(file).replace(/[^\w\- ]+/g, " ").replace(/\s+/g, " ").trim();
  const original = String(file.name || `file-${index + 1}`);
  const ext = (original.match(/(\.[a-z0-9]{1,8})$/i) || [""])[0];
  const base = original.replace(/\.[^.]+$/, "").replace(/[^\w.\- ]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 50);
  return `${String(index + 1).padStart(2, "0")} ${label}${base ? ` - ${base}` : ""}${ext}`;
}

async function blobFromDataUrl(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}

function countStoredUploadFiles(data) {
  const files = data?.uploads?.files || {};
  return Object.values(files).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
}

async function shrinkImageBlob(blob, maxBytes) {
  if (!blob || blob.size <= maxBytes || !String(blob.type || "").startsWith("image/")) return blob;
  if (typeof document === "undefined") return blob;

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Could not read image for email"));
    el.src = dataUrl;
  });

  let quality = 0.72;
  let scale = Math.min(1, 1600 / Math.max(img.width || 1, img.height || 1));
  let next = blob;

  for (let attempt = 0; attempt < 6 && next.size > maxBytes; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const jpeg = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!jpeg) break;
    next = jpeg;
    quality -= 0.12;
    scale *= 0.75;
  }

  return next.size < blob.size ? next : blob;
}

async function buildDocumentAttachments(data, byteBudget) {
  const uploads = getUploadsForMerge(data);
  const storedCount = countStoredUploadFiles(data);
  if (storedCount > uploads.length) {
    throw new Error(
      "Some uploaded documents are missing their file data. Open Documents, re-upload each file, then send again."
    );
  }

  const documents = [];
  for (let index = 0; index < uploads.length; index += 1) {
    const file = uploads[index];
    let blob = await blobFromDataUrl(file.dataUrl);
    if (byteBudget > 0 && blob.size > byteBudget) {
      blob = await shrinkImageBlob(blob, byteBudget);
    }
    const name = safeAttachmentName(file, index);
    const filename = blob.type === "image/jpeg" && !/\.jpe?g$/i.test(name) ? `${name}.jpg` : name;
    documents.push({
      filename,
      blob,
      name: file.name,
      uploadId: file.uploadId,
      uploadLabel: file.uploadLabel,
    });
  }
  return documents;
}

function totalAttachmentBytes(packetBlob, documents) {
  return packetBlob.size + documents.reduce((sum, doc) => sum + doc.blob.size, 0);
}

export function getNotificationEmail(location) {
  if (isLocalEnrollmentDev()) {
    return import.meta.env.VITE_LOCAL_DEV_NOTIFICATION_EMAIL || LOCAL_DEV_NOTIFICATION_EMAIL;
  }
  return location?.inbox || import.meta.env.VITE_ENROLLMENT_NOTIFICATION_EMAIL || CC_EMAIL;
}

export function getEnrollmentCcEmail() {
  return CC_EMAIL;
}

async function buildPdfForEmail({ type, state, location, appendUploads = true }) {
  if (type === "waitlist") {
    return generateWaitlistPdfBlob({ state, location });
  }

  return generatePdfBundleBlob({
    state,
    location,
    which: "packet",
    appendUploads,
  });
}

export async function submitEnrollmentEmail({ type = "packet", state, location }) {
  const storageKey = getSubmissionStorageKey(state, type);
  const localDev = isLocalEnrollmentDev();
  const existing = sessionStorage.getItem(storageKey);
  if (existing === SEND_PENDING && inFlightByStorageKey.has(storageKey)) {
    return inFlightByStorageKey.get(storageKey);
  }
  if (existing === SEND_PENDING && !inFlightByStorageKey.has(storageKey)) {
    sessionStorage.removeItem(storageKey);
  }
  if (existing && existing !== SEND_PENDING) {
    return { ok: true, skipped: true, to: getNotificationEmail(location) };
  }
  if (inFlightByStorageKey.has(storageKey)) {
    return inFlightByStorageKey.get(storageKey);
  }

  const sendPromise = (async () => {
    sessionStorage.setItem(storageKey, SEND_PENDING);

    try {
      const limit = maxEmailBytes();
      let pdfResult = await buildPdfForEmail({ type, state, location, appendUploads: type !== "waitlist" });
      let documents = type === "waitlist" ? [] : await buildDocumentAttachments(pdfResult.data, 0);

      if (type !== "waitlist" && totalAttachmentBytes(pdfResult.blob, documents) > limit) {
        pdfResult = await buildPdfForEmail({ type, state, location, appendUploads: false });
        const room = Math.max(limit - pdfResult.blob.size, 0);
        const perFile = documents.length ? Math.floor(room / documents.length) : room;
        documents = await buildDocumentAttachments(pdfResult.data, perFile);
      }

      if (totalAttachmentBytes(pdfResult.blob, documents) > limit) {
        const mb = (totalAttachmentBytes(pdfResult.blob, documents) / (1024 * 1024)).toFixed(1);
        throw new Error(
          `The packet and uploaded documents are too large to email (${mb} MB). Download the full packet PDF and send it to the center.`
        );
      }

      const enrollment = pdfResult.data?.enrollment || {};
      const subject = buildEnrollmentEmailSubject({ enrollment, type });
      const message = [buildEnrollmentEmailBody({ location, type }), formatUploadedDocumentsSection(documents)]
        .filter(Boolean)
        .join("\n\n");

      const form = new FormData();
      form.append(
        "meta",
        JSON.stringify({
          type,
          location,
          subject,
          message,
          packetFilename: pdfResult.filename,
          documentCount: documents.length,
          ...(localDev
            ? {
                localDev: true,
                devNotificationEmail:
                  import.meta.env.VITE_LOCAL_DEV_NOTIFICATION_EMAIL || LOCAL_DEV_NOTIFICATION_EMAIL,
              }
            : {}),
        })
      );
      form.append("packet", pdfResult.blob, pdfResult.filename);
      documents.forEach((doc, index) => {
        form.append(`document_${index}`, doc.blob, doc.filename);
      });

      const response = await fetch(API_PATH, {
        method: "POST",
        body: form,
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Email submission failed (${response.status})`);
      }

      sessionStorage.setItem(storageKey, new Date().toISOString());
      return {
        ok: true,
        to: result.to || getNotificationEmail(location),
        id: result.id,
        localDev: !!result.localDev,
        cc: result.cc ?? null,
        documentCount: documents.length,
      };
    } catch (err) {
      sessionStorage.removeItem(storageKey);
      throw err;
    } finally {
      inFlightByStorageKey.delete(storageKey);
    }
  })();

  inFlightByStorageKey.set(storageKey, sendPromise);
  return sendPromise;
}
