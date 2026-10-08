import ALC_CONFIG from "../config";
import {
  needsEmergencyMedicalForm,
  needsTransportForm,
  normalizePrograms,
} from "../utils/programSelection";

function isBlank(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === "boolean") return !value;
  if (Array.isArray(value)) return value.length === 0;
  return String(value).trim() === "";
}

function needsTransport(programs) {
  return needsTransportForm(programs);
}

const TEXT_FIELDS = [
  { form: "enrollment", section: "Enrollment", key: "childFirst", label: "Child First Name" },
  { form: "enrollment", section: "Enrollment", key: "childMI", label: "Child Middle Initial" },
  { form: "enrollment", section: "Enrollment", key: "childLast", label: "Child Last Name" },
  { form: "enrollment", section: "Enrollment", key: "childPreferred", label: "Child Preferred Name" },
  { form: "enrollment", section: "Enrollment", key: "startDate", label: "Enrollment Start Date" },
  { form: "enrollment", section: "Enrollment", key: "childDob", label: "Child Date of Birth" },
  { form: "enrollment", section: "Enrollment", key: "childGender", label: "Child Gender" },
  { form: "enrollment", section: "Enrollment", key: "childAddress", label: "Child Street Address" },
  { form: "enrollment", section: "Enrollment", key: "childCity", label: "Child City" },
  { form: "enrollment", section: "Enrollment", key: "childZip", label: "Child ZIP Code" },
  { form: "enrollment", section: "Enrollment", key: "medicalNotes", label: "Medical Conditions / Notes" },
  { form: "enrollment", section: "Enrollment", key: "momFirst", label: "Mother / Guardian First Name" },
  { form: "enrollment", section: "Enrollment", key: "momMI", label: "Mother / Guardian Middle Initial" },
  { form: "enrollment", section: "Enrollment", key: "momLast", label: "Mother / Guardian Last Name" },
  { form: "enrollment", section: "Enrollment", key: "momCell", label: "Mother / Guardian Cell Phone" },
  { form: "enrollment", section: "Enrollment", key: "momEmail", label: "Mother / Guardian Email" },
  { form: "enrollment", section: "Enrollment", key: "momEmployer", label: "Mother / Guardian Employer" },
  { form: "enrollment", section: "Enrollment", key: "momOccupation", label: "Mother / Guardian Occupation" },
  { form: "enrollment", section: "Enrollment", key: "momWorkAddress", label: "Mother / Guardian Work Address" },
  { form: "enrollment", section: "Enrollment", key: "dadFirst", label: "Father / Guardian First Name" },
  { form: "enrollment", section: "Enrollment", key: "dadMI", label: "Father / Guardian Middle Initial" },
  { form: "enrollment", section: "Enrollment", key: "dadLast", label: "Father / Guardian Last Name" },
  { form: "enrollment", section: "Enrollment", key: "dadCell", label: "Father / Guardian Cell Phone" },
  { form: "enrollment", section: "Enrollment", key: "dadEmail", label: "Father / Guardian Email" },
  { form: "enrollment", section: "Enrollment", key: "dadEmployer", label: "Father / Guardian Employer" },
  { form: "enrollment", section: "Enrollment", key: "dadOccupation", label: "Father / Guardian Occupation" },
  { form: "enrollment", section: "Enrollment", key: "dadWorkAddress", label: "Father / Guardian Work Address" },
  { form: "enrollment", section: "Enrollment", key: "ec1Name", label: "Emergency Contact 1 Name" },
  { form: "enrollment", section: "Enrollment", key: "ec1Home", label: "Emergency Contact 1 Home Phone" },
  { form: "enrollment", section: "Enrollment", key: "ec1Work", label: "Emergency Contact 1 Work Phone" },
  { form: "enrollment", section: "Enrollment", key: "ec1Cell", label: "Emergency Contact 1 Cell Phone" },
  { form: "enrollment", section: "Enrollment", key: "ec1Address", label: "Emergency Contact 1 Address" },
  { form: "enrollment", section: "Enrollment", key: "ec1Rel", label: "Emergency Contact 1 Relationship" },
  { form: "enrollment", section: "Enrollment", key: "ec2Name", label: "Emergency Contact 2 Name" },
  { form: "enrollment", section: "Enrollment", key: "ec2Home", label: "Emergency Contact 2 Home Phone" },
  { form: "enrollment", section: "Enrollment", key: "ec2Work", label: "Emergency Contact 2 Work Phone" },
  { form: "enrollment", section: "Enrollment", key: "ec2Cell", label: "Emergency Contact 2 Cell Phone" },
  { form: "enrollment", section: "Enrollment", key: "ec2Address", label: "Emergency Contact 2 Address" },
  { form: "enrollment", section: "Enrollment", key: "ec2Rel", label: "Emergency Contact 2 Relationship" },
  { form: "enrollment", section: "Enrollment", key: "careFrom", label: "Care Hours — From" },
  { form: "enrollment", section: "Enrollment", key: "careTo", label: "Care Hours — To" },
  { form: "enrollment", section: "Enrollment", key: "tuitionAmount", label: "Current Tuition Amount" },
  { form: "enrollment", section: "Enrollment", key: "previousDaycareName", label: "Daycare Name" },
  { form: "enrollment", section: "Enrollment", key: "previousHomeCareName", label: "Home Care Name" },

  { form: "financial", section: "Financial Agreement", key: "rpName", label: "Responsible Party Name" },
  { form: "financial", section: "Financial Agreement", key: "rpDob", label: "Responsible Party Date of Birth" },
  { form: "financial", section: "Financial Agreement", key: "rpDl", label: "Responsible Party Driver's License" },
  { form: "financial", section: "Financial Agreement", key: "rpState", label: "Responsible Party License State" },
  { form: "financial", section: "Financial Agreement", key: "rpAddress", label: "Responsible Party Address" },
  { form: "financial", section: "Financial Agreement", key: "rpCityStateZip", label: "Responsible Party City / State / ZIP" },
  { form: "financial", section: "Financial Agreement", key: "rpPhone", label: "Responsible Party Phone" },
  { form: "financial", section: "Financial Agreement", key: "rpEmail", label: "Responsible Party Email" },
  { form: "financial", section: "Financial Agreement", key: "rpEmployer", label: "Responsible Party Employer" },
  { form: "financial", section: "Financial Agreement", key: "rp2Name", label: "Second Party Name", optionalGroup: "secondParty" },
  { form: "financial", section: "Financial Agreement", key: "rp2Dob", label: "Second Party Date of Birth", optionalGroup: "secondParty" },
  { form: "financial", section: "Financial Agreement", key: "rp2Dl", label: "Second Party Driver's License", optionalGroup: "secondParty" },
  { form: "financial", section: "Financial Agreement", key: "rp2State", label: "Second Party License State", optionalGroup: "secondParty" },
  { form: "financial", section: "Financial Agreement", key: "rp2Address", label: "Second Party Address", optionalGroup: "secondParty" },
  { form: "financial", section: "Financial Agreement", key: "rp2CityStateZip", label: "Second Party City / State / ZIP", optionalGroup: "secondParty" },
  { form: "financial", section: "Financial Agreement", key: "rp2Employer", label: "Second Party Employer", optionalGroup: "secondParty" },
  { form: "financial", section: "Financial Agreement", key: "rp2Phone", label: "Second Party Phone", optionalGroup: "secondParty" },
  { form: "financial", section: "Financial Agreement", key: "rp2Email", label: "Second Party Email", optionalGroup: "secondParty" },
  { form: "financial", section: "Financial Agreement", key: "finChildName", label: "Enrolled Child Name" },
  { form: "financial", section: "Financial Agreement", key: "finEnrollDate", label: "Enrollment Date" },
  { form: "financial", section: "Financial Agreement", key: "finPrintName", label: "Financial Agreement Printed Name" },
  { form: "financial", section: "Financial Agreement", key: "finSignDate", label: "Financial Agreement Date" },
  { form: "financial", section: "Financial Agreement", key: "finSignature", label: "Financial Agreement Signature" },
  { form: "financial", section: "Financial Agreement", key: "finCardholderName", label: "Cardholder Name", optionalGroup: "card" },
  { form: "financial", section: "Financial Agreement", key: "finCardNumber", label: "Card Number", optionalGroup: "card" },
  { form: "financial", section: "Financial Agreement", key: "finCardExp", label: "Card Expiration", optionalGroup: "card" },
  { form: "financial", section: "Financial Agreement", key: "finCardCvv", label: "Card CVV", optionalGroup: "card" },

  { form: "transport", section: "Transportation", key: "trChild", label: "Transport Child Name", whenTransport: true },
  { form: "transport", section: "Transportation", key: "trSchoolChoice", label: "School Selection", whenTransport: true },
  { form: "transport", section: "Transportation", key: "trSchoolAddress", label: "School Address", whenTransport: true },
  { form: "transport", section: "Transportation", key: "trPickupTime", label: "Pickup Time", whenTransport: true },
  { form: "transport", section: "Transportation", key: "trArriveTime", label: "Arrival Time", whenTransport: true },
  { form: "transport", section: "Transportation", key: "trMiles", label: "Approximate Miles", whenTransport: true },
  { form: "transport", section: "Transportation", key: "trSignature", label: "Transport Signature", whenTransport: true },
  { form: "transport", section: "Transportation", key: "trDate", label: "Transport Date", whenTransport: true },

  { form: "emergency", section: "Emergency Medical", key: "emChild", label: "Emergency Form Child Name", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emDob", label: "Emergency Form Date of Birth", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emAddress", label: "Emergency Form Address", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emFather", label: "Father Name", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emMother", label: "Mother Name", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emFatherCell", label: "Father Cell Phone", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emMotherCell", label: "Mother Cell Phone", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emAltName", label: "Alternate Emergency Contact Name", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emAltPhone", label: "Alternate Emergency Contact Phone", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emDoctor", label: "Child's Doctor", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emDoctorPhone", label: "Doctor Phone", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emFacility", label: "Preferred Hospital / Facility", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emAllergies", label: "Allergies", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emMeds", label: "Current Medications", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emSpecial", label: "Special Medical Information", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emAuthChild", label: "Authorization Child Name", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emDate", label: "Emergency Form Date", whenEmergency: true },
  { form: "emergency", section: "Emergency Medical", key: "emSignature", label: "Emergency Form Signature", whenEmergency: true },

  { form: "ies", section: "Meal Benefit (IES)", key: "iesAckPrint", label: "IES Acknowledgment Printed Name" },
  { form: "ies", section: "Meal Benefit (IES)", key: "iesAckDate", label: "IES Acknowledgment Date" },

  { form: "handbook", section: "Parent Handbook", key: "hbPrint", label: "Handbook Printed Name" },
  { form: "handbook", section: "Parent Handbook", key: "hbDate", label: "Handbook Date" },
  { form: "handbook", section: "Parent Handbook", key: "hbSignature", label: "Handbook Signature" },
  { form: "handbook", section: "Parent Handbook", key: "hbChild", label: "Handbook Child Name" },

  { form: "photo", section: "Photo / Permissions", key: "photoChild", label: "Photo Permission Child Name" },
  { form: "photo", section: "Photo / Permissions", key: "photoPrint", label: "Photo Permission Printed Name" },
  { form: "photo", section: "Photo / Permissions", key: "photoDate", label: "Photo Permission Date" },
  { form: "photo", section: "Photo / Permissions", key: "photoSignature", label: "Photo Permission Signature" },

  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppChildName", label: "Child Name" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppChildDob", label: "Date of Birth" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppParentName", label: "Parent or Guardian Name" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppInitialsSleep", label: "Parent Initials — Safe Sleep" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppInitialsProhibited", label: "Parent Initials — Prohibited Behaviors" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppInitialsFamily", label: "Parent Initials — Family Participation" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppNeedsDiscussed", label: "Individual Care Needs Discussed" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppAgreedPractices", label: "Agreed Practices / Accommodations" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppParentQuestions", label: "Parent Questions or Concerns" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppPrintName", label: "Printed Name" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppSignDate", label: "Signature Date" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppSignature", label: "Parent or Guardian Signature" },
  { form: "safeSleep", section: "Parent Safe Sleep Procedure", key: "ssChildName", label: "Child Name" },
  { form: "safeSleep", section: "Parent Safe Sleep Procedure", key: "ssChildDob", label: "Date of Birth" },
  { form: "safeSleep", section: "Parent Safe Sleep Procedure", key: "ssPrintName", label: "Printed Name" },
  { form: "safeSleep", section: "Parent Safe Sleep Procedure", key: "ssSignDate", label: "Signature Date" },
  { form: "safeSleep", section: "Parent Safe Sleep Procedure", key: "ssSignature", label: "Parent or Guardian Signature" },
  { form: "strollerRide", section: "Stroller Ride & Nature Walk", key: "srChildName", label: "Child Name" },
  { form: "strollerRide", section: "Stroller Ride & Nature Walk", key: "srChildDob", label: "Date of Birth" },
  { form: "strollerRide", section: "Stroller Ride & Nature Walk", key: "srPrintName", label: "Printed Name" },
  { form: "strollerRide", section: "Stroller Ride & Nature Walk", key: "srSignDate", label: "Signature Date" },
  { form: "strollerRide", section: "Stroller Ride & Nature Walk", key: "srSignature", label: "Parent or Guardian Signature" },
  { form: "watchMeGrow", section: "Watch Me Grow Registration", key: "wmgChildName", label: "Child Name" },
  { form: "watchMeGrow", section: "Watch Me Grow Registration", key: "wmgPrintName", label: "Printed Name" },
  { form: "watchMeGrow", section: "Watch Me Grow Registration", key: "wmgSignDate", label: "Signature Date" },
  { form: "watchMeGrow", section: "Watch Me Grow Registration", key: "wmgSignature", label: "Parent or Guardian Signature" },
];

const CHECKBOX_FIELDS = [
  { form: "financial", section: "Financial Agreement", key: "finAgree", label: "Financial Agreement Acknowledgment" },
  { form: "ies", section: "Meal Benefit (IES)", key: "iesDownloadAck", label: "IES Download Acknowledgment" },
  { form: "handbook", section: "Parent Handbook", key: "hbAgree", label: "Parent Handbook Acknowledgment" },
  { form: "photo", section: "Photo / Permissions", key: "photoAgree", label: "Photo / Video Permission Agreement" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppAckPolicies", label: "Acknowledgment — Center Policies" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppAckSafeSleep", label: "Acknowledgment — Safe Sleep" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppAckProgress", label: "Acknowledgment — Child Progress" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppAckSpecialNeeds", label: "Acknowledgment — Special Needs" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppAckShakenBaby", label: "Acknowledgment — Shaken Baby Prevention" },
  { form: "policyAck", section: "Parent Policy Acknowledgment", key: "ppAckParticipation", label: "Acknowledgment — Family Participation" },
  { form: "safeSleep", section: "Parent Safe Sleep Procedure", key: "ssAckReceived", label: "Acknowledgment — Received Copy" },
  { form: "safeSleep", section: "Parent Safe Sleep Procedure", key: "ssAckQuestions", label: "Acknowledgment — Questions Opportunity" },
  { form: "watchMeGrow", section: "Watch Me Grow Registration", key: "wmgAckLiveFeed", label: "Acknowledgment — Live Feed Only" },
  { form: "watchMeGrow", section: "Watch Me Grow Registration", key: "wmgAckNoScreenshots", label: "Acknowledgment — No Screenshots" },
  { form: "watchMeGrow", section: "Watch Me Grow Registration", key: "wmgAckCameraExcludes", label: "Acknowledgment — Camera Access Exclusions" },
];

function collectCompositeBlanks(data, { transportNeeded }) {
  const blanks = [];
  const en = data?.enrollment || {};
  const ph = data?.photo || {};
  const programs = normalizePrograms(en.programs);

  if (isBlank(programs)) {
    blanks.push({ section: "Enrollment", label: "Care Program(s)" });
  }

  const photoSelected =
    ph.photoClassroom || ph.photoFamily || ph.photoWeb || ph.photoMarketing || ph.photoNone;
  if (!photoSelected) {
    blanks.push({ section: "Photo / Permissions", label: "Photo / Video Release Selection" });
  }

  const ss = data?.safeSleep || {};
  if (!ss.ssAckPhysician && !ss.ssAckPhysicianNA) {
    blanks.push({ section: "Parent Safe Sleep Procedure", label: "Physician Instructions Selection" });
  }

  const sr = data?.strollerRide || {};
  if (!sr.srPermYes && !sr.srPermNo) {
    blanks.push({ section: "Stroller Ride & Nature Walk", label: "Permission Selection" });
  }

  if (transportNeeded) {
    const tr = data?.transport || {};
    const anyDay = tr.trMon || tr.trTue || tr.trWed || tr.trThu || tr.trFri;
    if (!anyDay) {
      blanks.push({ section: "Transportation", label: "Transport Days (none selected)" });
    }
  }

  const files = data?.uploads?.files || {};
  (ALC_CONFIG.uploads || []).filter((def) => def.required).forEach((def) => {
    if (!(files[def.id] || []).length) {
      blanks.push({
        section: "Documents",
        label: def.label,
      });
    }
  });

  return blanks;
}

export function collectBlankFields(data = {}) {
  const en = data?.enrollment || {};
  const programs = en.programs;
  const transportNeeded = needsTransport(programs);
  const emergencyNeeded = needsEmergencyMedicalForm(programs);

  const blanks = [];

  TEXT_FIELDS.forEach((def) => {
    if (def.whenTransport && !transportNeeded) return;
    if (def.whenEmergency && !emergencyNeeded) return;
    const formData = data?.[def.form] || {};
    if (def.optionalGroup === "secondParty") {
      const secondPartyStarted = [
        "rp2Name", "rp2Dob", "rp2Dl", "rp2State", "rp2Address",
        "rp2CityStateZip", "rp2Employer", "rp2Phone", "rp2Email",
      ].some((key) => !isBlank(formData[key]));
      if (!secondPartyStarted) return;
    }
    if (def.optionalGroup === "card") {
      const cardStarted = ["finCardholderName", "finCardNumber", "finCardExp", "finCardCvv"]
        .some((key) => !isBlank(formData[key]));
      if (!cardStarted) return;
    }
    if (isBlank(formData[def.key])) {
      blanks.push({ section: def.section, label: def.label });
    }
  });

  CHECKBOX_FIELDS.forEach((def) => {
    if (def.whenTransport && !transportNeeded) return;
    const formData = data?.[def.form] || {};
    if (isBlank(formData[def.key])) {
      blanks.push({ section: def.section, label: def.label });
    }
  });

  blanks.push(...collectCompositeBlanks(data, { transportNeeded }));

  const seen = new Set();
  return blanks.filter((item) => {
    const id = `${item.section}::${item.label}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function groupBlankFields(blanks) {
  const SECTION_ORDER = [
    "Enrollment",
    "Financial Agreement",
    "Transportation",
    "Emergency Medical",
    "Meal Benefit (IES)",
    "Parent Handbook",
    "Photo / Permissions",
    "Parent Policy Acknowledgment",
    "Parent Safe Sleep Procedure",
    "Stroller Ride & Nature Walk",
    "Watch Me Grow Registration",
    "Documents",
  ];

  const groups = new Map();
  blanks.forEach((item) => {
    if (!groups.has(item.section)) {
      groups.set(item.section, []);
    }
    groups.get(item.section).push(item.label);
  });

  const ordered = SECTION_ORDER.filter((section) => groups.has(section)).map((section) => ({
    section,
    labels: groups.get(section),
  }));

  groups.forEach((labels, section) => {
    if (!SECTION_ORDER.includes(section)) {
      ordered.push({ section, labels });
    }
  });

  return ordered;
}
