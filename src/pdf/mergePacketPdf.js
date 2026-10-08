import { PDFDocument } from "pdf-lib";
import ALC_CONFIG from "../config";
import { IES_UPLOAD_ID } from "../utils/uploadFileData";

function isPdfFile(meta) {
  const type = String(meta?.type || "").toLowerCase();
  const name = String(meta?.name || "").toLowerCase();
  return type === "application/pdf" || name.endsWith(".pdf");
}

function isImageFile(meta) {
  const type = String(meta?.type || "").toLowerCase();
  const name = String(meta?.name || "").toLowerCase();
  return (
    type.startsWith("image/") ||
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".webp")
  );
}

function imageMimeType(meta, bytes) {
  const type = String(meta?.type || "").toLowerCase();
  if (type === "image/png" || type === "image/jpeg" || type === "image/jpg") {
    return type === "image/jpg" ? "image/jpeg" : type;
  }
  const name = String(meta?.name || "").toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (bytes?.byteLength >= 4) {
    const view = new Uint8Array(bytes);
    if (view[0] === 0x89 && view[1] === 0x50) return "image/png";
    if (view[0] === 0xff && view[1] === 0xd8) return "image/jpeg";
  }
  return type || "image/jpeg";
}

/** @deprecated use getUploadsForMerge */
export function getCompletedIesUpload(data) {
  const files = data?.uploads?.files?.[IES_UPLOAD_ID] || [];
  return files.find((f) => f?.dataUrl) || null;
}

/** Uploaded files with bytes, ordered: IES first, then other documents per config. */
export function getUploadsForMerge(data) {
  const files = data?.uploads?.files || {};
  const defs = ALC_CONFIG.uploads || [];
  const ordered = [];

  const pushWithData = (list, def) => {
    (list || []).forEach((file) => {
      if (file?.dataUrl) ordered.push({ ...file, uploadId: def?.id || "", uploadLabel: def?.label || "" });
    });
  };

  const iesDef = defs.find((def) => def.id === IES_UPLOAD_ID);
  pushWithData(files[IES_UPLOAD_ID], iesDef);

  defs.forEach((def) => {
    if (def.id === IES_UPLOAD_ID) return;
    pushWithData(files[def.id], def);
  });

  return ordered;
}

async function dataUrlToBytes(dataUrl) {
  const response = await fetch(dataUrl);
  return response.arrayBuffer();
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read uploaded image"));
    img.src = src;
  });
}

/** Turn webp and other browser-readable images into a JPEG pdf-lib can embed. */
async function rasterToJpegBytes(dataUrl) {
  if (typeof document === "undefined") return null;
  const img = await loadImageElement(dataUrl);
  const canvas = document.createElement("canvas");
  const maxEdge = 2000;
  const scale = Math.min(1, maxEdge / Math.max(img.width || 1, img.height || 1));
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) return null;
  return blob.arrayBuffer();
}

async function appendImagePage(packetDoc, bytes, mimeType) {
  let image;
  if (mimeType === "image/png") {
    image = await packetDoc.embedPng(bytes);
  } else if (mimeType === "image/jpeg") {
    image = await packetDoc.embedJpg(bytes);
  } else {
    return false;
  }

  const page = packetDoc.addPage([612, 792]);
  const margin = 36;
  const maxW = page.getWidth() - margin * 2;
  const maxH = page.getHeight() - margin * 2;
  const scale = Math.min(maxW / image.width, maxH / image.height, 1);
  const width = image.width * scale;
  const height = image.height * scale;

  page.drawImage(image, {
    x: (page.getWidth() - width) / 2,
    y: (page.getHeight() - height) / 2,
    width,
    height,
  });

  return true;
}

async function appendUploadToPacket(packetDoc, upload) {
  const bytes = await dataUrlToBytes(upload.dataUrl);

  if (isPdfFile(upload)) {
    const doc = await PDFDocument.load(bytes);
    const pages = await packetDoc.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => packetDoc.addPage(page));
    return true;
  }

  if (isImageFile(upload)) {
    let mime = imageMimeType(upload, bytes);
    let imageBytes = bytes;
    if (mime !== "image/png" && mime !== "image/jpeg") {
      imageBytes = await rasterToJpegBytes(upload.dataUrl);
      mime = "image/jpeg";
      if (!imageBytes) return false;
    }
    return appendImagePage(packetDoc, imageBytes, mime);
  }

  return false;
}

export async function appendUploadsToPacketPdf(packetBlob, data) {
  const uploads = getUploadsForMerge(data);
  if (!uploads.length) {
    return packetBlob;
  }

  try {
    const packetDoc = await PDFDocument.load(await packetBlob.arrayBuffer());

    for (const upload of uploads) {
      try {
        await appendUploadToPacket(packetDoc, upload);
      } catch (err) {
        console.error("Failed to append upload to packet PDF:", upload?.name, err);
      }
    }

    const merged = await packetDoc.save();
    return new Blob([merged], { type: "application/pdf" });
  } catch (err) {
    console.error("Failed to merge uploaded documents into packet PDF:", err);
    return packetBlob;
  }
}

/** Merge multiple PDF blobs into one document, preserving page order. */
export async function mergePdfBlobs(blobs = []) {
  const out = await PDFDocument.create();
  for (const blob of blobs) {
    if (!blob) continue;
    const doc = await PDFDocument.load(await blob.arrayBuffer());
    const pages = await out.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => out.addPage(page));
  }
  const merged = await out.save();
  return new Blob([merged], { type: "application/pdf" });
}

/** @deprecated use appendUploadsToPacketPdf */
export async function appendIesToPacketPdf(packetBlob, data) {
  return appendUploadsToPacketPdf(packetBlob, data);
}
