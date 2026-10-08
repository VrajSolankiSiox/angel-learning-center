export function joinPersonName(first, mi, last) {
  return [first, mi, last]
    .map((p) => String(p || "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Use enrollment parent full name when financial rpName is blank or still a first-name-only prefill.
 */
export function resolveResponsiblePartyName(financial = {}, enrollment = {}) {
  const mom = joinPersonName(enrollment.momFirst, enrollment.momMI, enrollment.momLast);
  const dad = joinPersonName(enrollment.dadFirst, enrollment.dadMI, enrollment.dadLast);
  const parentFull = mom || dad;
  const custom = String(financial.rpName || "").trim();

  if (!parentFull) return custom;
  if (!custom) return parentFull;

  const momFirst = String(enrollment.momFirst || "").trim();
  const dadFirst = String(enrollment.dadFirst || "").trim();
  if (custom === momFirst || custom === dadFirst) return parentFull;

  const parentLower = parentFull.toLowerCase();
  const customLower = custom.toLowerCase();
  if (parentLower === customLower) return parentFull;
  if (parentLower.startsWith(`${customLower} `)) return parentFull;

  const firstToken = parentFull.split(/\s+/)[0];
  if (firstToken && customLower === firstToken.toLowerCase()) return parentFull;

  return custom;
}

function initialsFromNameParts(first, mi, last) {
  return [first, mi, last]
    .map((p) => String(p || "").trim())
    .filter(Boolean)
    .map((p) => p.charAt(0))
    .join("")
    .toUpperCase();
}

/** e.g. Sofia + A + Rivera → SAR; Jane + Doe → JD */
export function initialsFromPersonName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  if (parts.length === 2) return `${first}${last}`.toUpperCase();
  const middles = parts.slice(1, -1).map((p) => p.charAt(0)).join("");
  return `${first}${middles}${last}`.toUpperCase();
}

export function parentInitialsFromEnrollment(enrollment = {}, financial = {}) {
  const mom = joinPersonName(enrollment.momFirst, enrollment.momMI, enrollment.momLast);
  const dad = joinPersonName(enrollment.dadFirst, enrollment.dadMI, enrollment.dadLast);
  const signer = resolveResponsiblePartyName(financial, enrollment);
  const signerLower = signer.toLowerCase();

  if (signer && mom && signerLower === mom.toLowerCase()) {
    return initialsFromNameParts(enrollment.momFirst, enrollment.momMI, enrollment.momLast);
  }
  if (signer && dad && signerLower === dad.toLowerCase()) {
    return initialsFromNameParts(enrollment.dadFirst, enrollment.dadMI, enrollment.dadLast);
  }
  if (mom && !dad) {
    return initialsFromNameParts(enrollment.momFirst, enrollment.momMI, enrollment.momLast);
  }
  if (dad && !mom) {
    return initialsFromNameParts(enrollment.dadFirst, enrollment.dadMI, enrollment.dadLast);
  }
  if (mom) {
    return initialsFromNameParts(enrollment.momFirst, enrollment.momMI, enrollment.momLast);
  }
  return initialsFromPersonName(signer);
}

export function isFirstNameOnlyPrefill(name, enrollment = {}) {
  const n = String(name || "").trim();
  if (!n) return false;
  const momFirst = String(enrollment.momFirst || "").trim();
  const dadFirst = String(enrollment.dadFirst || "").trim();
  return (momFirst && n === momFirst) || (dadFirst && n === dadFirst);
}

export function digitsOnly(value, maxLength) {
  const digits = String(value || "").replace(/\D/g, "");
  return maxLength ? digits.slice(0, maxLength) : digits;
}

export function normalizeChildGender(value) {
  const v = String(value || "").trim().toLowerCase();
  if (v === "boy" || v === "male") return "Boy";
  if (v === "girl" || v === "female") return "Girl";
  return "";
}

export function isChildGenderBoy(value) {
  const v = String(value || "").trim().toLowerCase();
  return v === "boy" || v === "male";
}

export function isChildGenderGirl(value) {
  const v = String(value || "").trim().toLowerCase();
  return v === "girl" || v === "female";
}

const TRANSPORT_DIRECTION_LABELS = {
  both: "School ↔ Center (both)",
  school_to_center: "School → Center only",
  center_to_school: "Center → School only",
};

const TRANSPORT_WHEN_LABELS = {
  both: "AM & PM",
  am: "AM (before school)",
  pm: "PM (after school)",
};

function labelFromMap(map, value) {
  const key = String(value || "").trim();
  if (!key) return "";
  return map[key] || key;
}

export function transportDirectionLabel(value) {
  return labelFromMap(TRANSPORT_DIRECTION_LABELS, value);
}

export function transportWhenLabel(value) {
  return labelFromMap(TRANSPORT_WHEN_LABELS, value);
}

export function transportSchoolLabel(locationId, schoolId, schoolsByLocation = {}) {
  const key = String(schoolId || "").trim();
  if (!key) return "";
  const list = schoolsByLocation?.[locationId] || [];
  const match = list.find((school) => school.id === key);
  return match?.name || key;
}

export function programSelectionLabel(programs, programDefs = []) {
  const ids = Array.isArray(programs)
    ? programs
    : String(programs || "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
  const byId = new Map((programDefs || []).map((program) => [program.id, program.label || program.id]));
  return ids.map((id) => byId.get(id) || id).join(", ");
}
