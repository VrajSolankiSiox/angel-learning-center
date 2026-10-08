import ALC_CONFIG from "../config";
import { normalizePrograms } from "./programSelection";

const CC_EMAIL = "info@angellearningcenter.com";
const FROM_EMAIL = `Angel Learning Center <${CC_EMAIL}>`;

export function getEnrollmentCcEmail() {
  return CC_EMAIL;
}

export function getEnrollmentFromEmail() {
  return FROM_EMAIL;
}

export function getProgramLabels(programs) {
  const ids = normalizePrograms(programs);
  const defs = ALC_CONFIG.programs || [];
  return ids
    .map((id) => defs.find((p) => p.id === id)?.label || id)
    .filter(Boolean);
}

export function buildEnrollmentEmailSubject({ enrollment = {}, type = "packet" }) {
  const first = String(enrollment.childFirst || "").trim();
  const last = String(enrollment.childLast || "").trim();
  const name = [first, last].filter(Boolean).join(" ").trim() || "Child";
  const programs = getProgramLabels(enrollment.programs).join(" / ");
  const prefix = type === "waitlist" ? "Waitlist" : "Enrollment";

  if (programs) {
    return `${prefix} — ${name} — ${programs}`;
  }
  return `${prefix} — ${name}`;
}

export function buildEnrollmentEmailBody({ location = {}, type = "packet" }) {
  const locationName = location.name || location.legalName || "Angel Learning Center";
  if (type === "waitlist") {
    return `Waitlist packet received for ${locationName}.`;
  }
  return `Enrollment packet received for ${locationName}.`;
}

const DOCUMENT_EMAIL_LABELS = {
  parent_ssn_doc: "Parent / guardian SSN",
  child_ssn_doc: "Child SSN",
  birth_cert: "Birth certificate",
  ga_shot_records: "Immunization / shot records (GA Form 3231)",
  ga_residency: "Proof of GA residency",
  ga_parent_ids: "Parent / guardian photo ID",
  completed_ies: "Completed Meal Benefit (IES) form",
  credit_card_front: "Credit card, front",
  credit_card_back: "Credit card, back",
  health_form: "Child health form",
  custody: "Custody documentation",
  caps: "CAPS documentation",
};

export function documentEmailLabel(file = {}) {
  return DOCUMENT_EMAIL_LABELS[file.uploadId] || file.uploadLabel || "Document";
}

export function formatUploadedDocumentsSection(files = []) {
  if (!files.length) return "";

  const counts = new Map();
  files.forEach((file) => {
    const label = documentEmailLabel(file);
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  const seen = new Map();

  const lines = files.map((file, index) => {
    const label = documentEmailLabel(file);
    const total = counts.get(label) || 1;
    const n = (seen.get(label) || 0) + 1;
    seen.set(label, n);
    const title = total > 1 ? `${label} (${n} of ${total})` : label;
    const original = String(file.name || "").trim();
    return `${index + 1}. ${title}${original ? ` — ${original}` : ""}`;
  });

  return ["Documents attached with this packet:", "", ...lines].join("\n");
}

/** @deprecated kept for API import compatibility */
export function buildEnrollmentEmailHtml({ location = {}, type = "packet" }) {
  const message = buildEnrollmentEmailBody({ location, type });
  return `<p>${message}</p>`;
}

/** @deprecated kept for API import compatibility */
export function buildEnrollmentEmailText({ location = {}, type = "packet" }) {
  return buildEnrollmentEmailBody({ location, type });
}
