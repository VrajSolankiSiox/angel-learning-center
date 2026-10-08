import React from "react";
import { pdf } from "@react-pdf/renderer";
import PacketPdf from "./PacketPdf";
import WaitlistAgreementPdf from "./WaitlistPdf";
import { ensurePdfFonts } from "./PdfShared";
import { appendUploadsToPacketPdf, getUploadsForMerge, mergePdfBlobs } from "./mergePacketPdf";

const BLANK_IES_FILENAME = "IES2026-2027_ENGLISH.pdf";

function safeName(s) {
  return String(s || "child")
    .replace(/[^\w\-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 40);
}

export async function saveDocumentAsPdf(documentComponent, filename, { appendUploadsData } = {}) {
  try {
    ensurePdfFonts();
    let blob = await pdf(documentComponent).toBlob();
    if (appendUploadsData) {
      blob = await appendUploadsToPacketPdf(blob, appendUploadsData);
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return {
      appendedUploads: appendUploadsData ? getUploadsForMerge(appendUploadsData).length : 0,
    };
  } catch (err) {
    console.error("PDF generation failed:", filename, err);
    throw err;
  }
}

function getBlankIesAssetUrl() {
  if (typeof window !== "undefined" && window.location?.origin && window.location.protocol !== "file:") {
    return `${window.location.origin}/assets/${BLANK_IES_FILENAME}`;
  }
  return `/assets/${BLANK_IES_FILENAME}`;
}

export async function downloadBlankIesPdf() {
  const response = await fetch(getBlankIesAssetUrl());
  if (!response.ok) {
    throw new Error(`Could not load ${BLANK_IES_FILENAME}`);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = BLANK_IES_FILENAME;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
}

/**
 * Download a single combined PDF packet.
 * which = "packet"     → all forms (enrollment + financial + transport if applicable + emergency + ies + handbook + photo)
 * which = "enrollment" → enrollment + financial only
 * which = "financial"  → financial page only
 */
export function getPacketChildName(state) {
  const en = state?.data?.enrollment || {};
  return (
    [en.childFirst, en.childMI, en.childLast].filter(Boolean).join(" ").trim() ||
    en.childPreferred ||
    "Child"
  );
}

export function getSubmissionStorageKey(state, type = "packet") {
  const en = state?.data?.enrollment || {};
  const child = getPacketChildName(state).replace(/\s+/g, "_").toLowerCase();
  const loc = state?.locationId || en.enLocation || "center";
  return `alc-email-sent-${type}-${loc}-${child}`;
}

function readLatestPacketData(state) {
  const fromState = state?.data || {};
  let fromStore = {};
  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem("alc-enrollment-v1-multi") || "null");
      fromStore = stored?.data || {};
    } catch {
      // ignore
    }
  }
  return {
    ...fromStore,
    ...fromState,
    enrollment: { ...(fromStore.enrollment || {}), ...(fromState.enrollment || {}) },
    financial: { ...(fromStore.financial || {}), ...(fromState.financial || {}) },
    transport: { ...(fromStore.transport || {}), ...(fromState.transport || {}) },
    emergency: { ...(fromStore.emergency || {}), ...(fromState.emergency || {}) },
    ies: { ...(fromStore.ies || {}), ...(fromState.ies || {}) },
    handbook: { ...(fromStore.handbook || {}), ...(fromState.handbook || {}) },
    photo: { ...(fromStore.photo || {}), ...(fromState.photo || {}) },
    policyAck: { ...(fromStore.policyAck || {}), ...(fromState.policyAck || {}) },
    safeSleep: { ...(fromStore.safeSleep || {}), ...(fromState.safeSleep || {}) },
    strollerRide: { ...(fromStore.strollerRide || {}), ...(fromState.strollerRide || {}) },
    watchMeGrow: { ...(fromStore.watchMeGrow || {}), ...(fromState.watchMeGrow || {}) },
    uploads: {
      ...(fromStore.uploads || {}),
      ...(fromState.uploads || {}),
      files: {
        ...(fromStore.uploads?.files || {}),
        ...(fromState.uploads?.files || {}),
      },
    },
  };
}

function buildPacketFilename(data, loc, which) {
  const en = data.enrollment || {};
  const dateStr = new Date().toISOString().slice(0, 10);
  const base = `ALC_${safeName(en.childLast || loc.id)}_${safeName(en.childFirst)}_${dateStr}`;
  const filenameMap = {
    packet: `${base}_Enrollment_Packet.pdf`,
    enrollment: `${base}_Enrollment_Form.pdf`,
    financial: `${base}_Financial_Agreement.pdf`,
    waitlist: `${base}_Waitlist_Packet.pdf`,
  };
  return filenameMap[which] || filenameMap.packet;
}

export async function generatePdfBundleBlob({
  state,
  location,
  which = "packet",
  appendUploads = true,
}) {
  const data = readLatestPacketData(state);
  const loc = location || {};
  const filename = buildPacketFilename(data, loc, which);
  ensurePdfFonts();
  let blob = await pdf(<PacketPdf data={data} location={loc} which={which} />).toBlob();
  if (which === "packet" && appendUploads) {
    blob = await appendUploadsToPacketPdf(blob, data);
  }
  return { blob, filename, data };
}

export async function generateWaitlistPdfBlob({ state, location }) {
  const data = readLatestPacketData(state);
  const loc = location || {};
  const filename = buildPacketFilename(data, loc, "waitlist");
  ensurePdfFonts();
  const enrollmentBlob = await pdf(<PacketPdf data={data} location={loc} which="waitlist" />).toBlob();
  const agreementBlob = await pdf(<WaitlistAgreementPdf data={data} location={loc} />).toBlob();
  const blob = await mergePdfBlobs([agreementBlob, enrollmentBlob]);
  return { blob, filename, data };
}

export async function downloadPdfBundle({ state, location, which = "packet" }) {
  const { blob, filename } = await generatePdfBundleBlob({ state, location, which });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return { queued: 1 };
}

export async function downloadWaitlistPdf({ state, location }) {
  const { blob, filename } = await generateWaitlistPdfBlob({ state, location });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return { queued: 1 };
}
