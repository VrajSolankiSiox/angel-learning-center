import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import ALC_CONFIG from "../config";
import {
  FONT,
  COLORS,
  PdfHeader,
  PdfFooter,
  getLogoUrl,
  getWatchMeGrowUrl,
  getProCareLogoUrl,
  formatPdfValue,
  isSignatureFieldLabel,
  formatSignatureValue,
  PdfSignatureOnLine,
} from "./PdfShared";
import { collectBlankFields, groupBlankFields } from "./pdfBlankFields";
import {
  normalizeChildGender,
  programSelectionLabel,
  resolveResponsiblePartyName,
  transportSchoolLabel,
} from "../utils/formValues";
import { FinancialAgreementPage } from "./FinancialPdf";
import {
  ParentPolicyAckPage1,
  ParentPolicyAckPage2,
  ParentPolicyAckPage3,
} from "./ParentPolicyAckPdf";
import { SafeSleepPage1, SafeSleepPage2 } from "./SafeSleepPdf";
import { StrollerRidePage1, StrollerRidePage2 } from "./StrollerRidePdf";
import { PdfCheckMark } from "./PdfCheckbox";
import { WATCH_ME_GROW_ACK_ITEMS } from "../constants/watchMeGrowAck";

const TODAY = new Date().toISOString().slice(0, 10);

const WATER_PERMISSION_FIELDS = [
  { label: "Sprinkler", field: "permWaterSprinkler" },
  { label: "Play Splashing", field: "permWaterSplashing" },
  { label: "Swimming Pools", field: "permWaterPools" },
  { label: "Water Table Play", field: "permWaterTable" },
];

const TRANSPORT_PERMISSION_FIELDS = [
  { label: "Emergency Care", field: "trPermEmergency" },
  { label: "Field Trips", field: "trPermFieldTrips" },
  { label: "To and From Elementary School", field: "trPermSchool" },
];

const PREP_PERMISSION_FIELDS = [
  { label: "baby wipes", field: "prepBabyWipes", key: "Baby Wipes" },
  { label: "Band-Aids", field: "prepBandAids", key: "Band-Aids" },
  { label: "Neosporin or similar ointment", field: "prepNeosporin", key: "Neosporin" },
  { label: "Bactine or similar first aid spray", field: "prepBactine", key: "Bactine" },
  { label: "Sunscreen", field: "prepSunscreen", key: "Sunscreen" },
  { label: "insect repellent", field: "prepInsectRepellent", key: "Insect Repellent" },
  { label: "non-prescription ointment (such as A&D, Desitin, Vaseline, etc....)", field: "prepNonRxOintment", key: "Non-prescription Ointment" },
  { label: "Baby Powder", field: "prepBabyPowder", key: "Baby Powder" },
];

function asBool(value) {
  if (value === false || value === "false" || value === 0 || value === "0") return false;
  if (value === true || value === "true" || value === 1 || value === "1") return true;
  if (typeof value === "string" && /^(yes|y|on)$/i.test(value.trim())) return true;
  return false;
}

function permissionItemsFromFields(source = {}, defs = [], fallbackLabels = []) {
  const selected = new Set((fallbackLabels || []).map(String));
  return defs.map(({ label, field }) => ({
    text: label,
    checked: asBool(source[field]) || selected.has(label),
  }));
}

function transportPermissionSource(tr = {}) {
  const hasExplicitPerms =
    "trPermEmergency" in tr || "trPermFieldTrips" in tr || "trPermSchool" in tr;

  if (hasExplicitPerms) {
    return {
      trPermEmergency: asBool(tr.trPermEmergency),
      trPermFieldTrips: asBool(tr.trPermFieldTrips),
      trPermSchool: asBool(tr.trPermSchool),
    };
  }

  return {
    trPermEmergency: asBool(tr.trStaffAuth),
    trPermFieldTrips: asBool(tr.trStaffAuth),
    trPermSchool: asBool(tr.trStaffAuth) && !!tr.trSchoolChoice,
  };
}

const s = StyleSheet.create({
  pageTitle: {
    fontFamily: FONT,
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  section: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionHeading: {
    fontFamily: FONT,
    fontWeight: "bold",
    fontSize: 11,
    borderBottomWidth: 0.6,
    borderBottomColor: "#555",
    paddingBottom: 2,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    width: "100%",
    marginBottom: 5,
  },
  col: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  label: {
    fontFamily: FONT,
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.ink,
    marginBottom: 1,
    flexShrink: 0,
  },
  value: {
    minHeight: 12,
    borderBottomWidth: 0.75,
    borderBottomColor: COLORS.line,
    paddingHorizontal: 2,
    paddingBottom: 1,
    minWidth: 0,
  },
  multiline: {
    minHeight: 28,
  },
  body: {
    fontFamily: FONT,
    fontSize: 9,
    lineHeight: 1.3,
    marginBottom: 5,
    textAlign: "justify",
  },
  small: {
    fontFamily: FONT,
    fontSize: 8.5,
    lineHeight: 1.25,
  },
  warning: {
    backgroundColor: COLORS.yellow,
    borderWidth: 0.8,
    borderColor: COLORS.yellowBorder,
    padding: 8,
    fontFamily: FONT,
    fontWeight: "bold",
    fontSize: 9,
    marginBottom: 10,
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  checkboxBox: {
    width: 9,
    height: 9,
    borderWidth: 0.85,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  checkText: {
    fontFamily: FONT,
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.value,
    lineHeight: 1,
  },
  checkboxLabel: {
    fontFamily: FONT,
    fontSize: 9,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 3.5,
    alignItems: "flex-start",
  },
  bulletMark: {
    width: 14,
    fontFamily: FONT,
    fontSize: 9,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontFamily: FONT,
    fontSize: 9,
    lineHeight: 1.28,
  },
  redTable: {
    borderWidth: 1.1,
    borderColor: COLORS.red,
    marginTop: 6,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    flex: 1,
    minHeight: 52,
    minWidth: 0,
    borderRightWidth: 1.1,
    borderRightColor: COLORS.red,
    padding: 6,
  },
  tableHead: {
    fontFamily: FONT,
    fontWeight: "bold",
    color: COLORS.red,
    fontSize: 9.5,
    marginBottom: 5,
  },
  officialBox: {
    borderWidth: 1,
    borderColor: "#333",
    padding: 8,
    marginTop: 10,
  },
  placeholder: {
    borderWidth: 1,
    borderColor: "#777",
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  redItalic: {
    fontFamily: FONT,
    color: COLORS.red,
    fontStyle: "italic",
    fontSize: 9,
    marginBottom: 4,
  },
});

function val(v) {
  return formatPdfValue(v);
}

function fullName(p = {}) {
  return [p.firstName, p.mi, p.lastName].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function oldFull(en = {}, prefix) {
  return [en[`${prefix}First`], en[`${prefix}MI`], en[`${prefix}Last`]]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(data = {}, location = {}) {
  const en = data.enrollment || {};
  const fin = data.financial || {};
  const tr = data.transport || {};
  const em = data.emergency || {};
  const ies = data.ies || {};
  const hb = data.handbook || {};
  const ph = data.photo || {};
  const pa = data.policyAck || {};
  const transportPerms = transportPermissionSource(tr);
  const loc = location || {};
  const motherName = oldFull(en, "mom");
  const fatherName = oldFull(en, "dad");
  const childName = oldFull(en, "child");
  const addressLine = [en.childAddress, en.childCity, en.childZip].filter(Boolean).join(", ");
  const meals = [
    en.mealBreakfast && "Breakfast",
    en.mealLunch && "Lunch",
    en.mealSnack && "PM Snack",
  ].filter(Boolean);

  return {
    startDate: en.startDate,
    child: {
      firstName: en.childFirst,
      mi: en.childMI,
      lastName: en.childLast,
      preferredName: en.childPreferred,
      gradeClass: en.childGrade,
      gender: en.childGender,
      dob: en.childDob,
      ssn: "",
      address: en.childAddress,
      city: en.childCity,
      zip: en.childZip,
      medicalConditions: en.medicalNotes,
    },
    mother: {
      firstName: en.momFirst,
      mi: en.momMI,
      lastName: en.momLast,
      address: en.childAddress,
      city: en.childCity,
      zip: en.childZip,
      homePhone: "",
      cellPhone: en.momCell,
      employer: en.momEmployer,
      occupation: en.momOccupation,
      workPhone: "",
      workAddress: en.momWorkAddress,
      workHours: "",
      custodial: !!en.momCustodial,
      ssn: "",
      email: en.momEmail,
      driversLicense: "",
      birthday: "",
      maritalStatus: en.momMarital || "",
      signature: fin.finSignature || motherName,
      date: fin.finSignDate || hb.hbDate || ph.photoDate,
    },
    father: {
      firstName: en.dadFirst,
      mi: en.dadMI,
      lastName: en.dadLast,
      address: en.childAddress,
      city: en.childCity,
      zip: en.childZip,
      homePhone: "",
      cellPhone: en.dadCell,
      employer: en.dadEmployer,
      occupation: en.dadOccupation,
      workPhone: "",
      workAddress: en.dadWorkAddress,
      workHours: "",
      custodial: !!en.dadCustodial,
      ssn: "",
      email: en.dadEmail,
      driversLicense: "",
      birthday: "",
      maritalStatus: en.dadMarital || "",
      signature: fatherName,
      date: fin.finSignDate || hb.hbDate || ph.photoDate,
    },
    tuition: {
      amount: en.tuitionAmount,
      programs: programSelectionLabel(en.programs, ALC_CONFIG.programs),
      center: loc.name || loc.legalName || en.enLocation,
    },
    care: {
      schedule: `${en.careFrom || ""}${en.careFrom || en.careTo ? " to " : ""}${en.careTo || ""}`,
      from: en.careFrom,
      to: en.careTo,
      meals,
      previousSchool: en.previousDaycareName,
      homeCareName: en.previousHomeCareName,
    },
    emergencyContacts: [
      { name: en.ec1Name, homePhone: en.ec1Home, workPhone: en.ec1Work, cellPhone: en.ec1Cell, address: en.ec1Address, relationship: en.ec1Rel },
      { name: en.ec2Name, homePhone: en.ec2Home, workPhone: en.ec2Work, cellPhone: en.ec2Cell, address: en.ec2Address, relationship: en.ec2Rel },
      { name: "", homePhone: "", workPhone: "", cellPhone: "", address: "", relationship: "" },
    ],
    medical: {
      doctor: em.emDoctor,
      doctorPhone: em.emDoctorPhone,
      doctorAddress: "",
      insurance: "",
      chronicIllnesses: em.emSpecial,
      allergies: em.emAllergies,
      currentMedications: em.emMeds,
      specialInfo: em.emSpecial,
    },
    transportation: {
      selectedSchool: transportSchoolLabel(
        tr.trLocation,
        tr.trSchoolChoice,
        ALC_CONFIG.transport?.schools
      ),
      schoolAddress: tr.trSchoolAddress,
      approxMiles: tr.trMiles,
      pickupTime: tr.trPickupTime,
      arriveTime: tr.trArriveTime,
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].filter((_, i) => tr[["trMon", "trTue", "trWed", "trThu", "trFri"][i]]),
      staffAuthorized: !!tr.trStaffAuth,
    },
    financial: {
      ...fin,
      responsibleParty: resolveResponsiblePartyName(fin, en) || fin.rpName,
      driversLicense: fin.rpDl,
      state: fin.rpState,
      employer: fin.rpEmployer,
      dob: fin.rpDob,
      address: fin.rpAddress,
      cityStateZip: fin.rpCityStateZip,
      phone: fin.rpPhone,
      email: fin.rpEmail,
      enrolledChild: fin.finChildName || childName,
      enrollmentDate: fin.finEnrollDate || en.startDate,
      agreed: !!fin.finAgree,
      signature:
        resolveResponsiblePartyName({ rpName: fin.finSignature }, en) || fin.finSignature,
      date: fin.finSignDate,
      cardholderName: fin.finCardholderName,
      cardNumber: fin.finCardNumber,
      cardExp: fin.finCardExp,
      cardCvv: fin.finCardCvv,
    },
    permissions: {
      water: WATER_PERMISSION_FIELDS.filter(({ field }) => asBool(ph[field])).map(({ label }) => label),
      transportConsent: TRANSPORT_PERMISSION_FIELDS.filter(({ field }) =>
        asBool(transportPerms[field])
      ).map(({ label }) => label),
      photoRelease: ph.photoNone ? "no" : ph.photoAgree ? "yes" : null,
    },
    _source: {
      photo: ph,
      transport: transportPerms,
    },
    photo: {
      classroom: !!ph.photoClassroom,
      family: !!ph.photoFamily,
      web: !!ph.photoWeb,
      marketing: !!ph.photoMarketing,
      none: !!ph.photoNone,
      agree: !!ph.photoAgree,
    },
    externalPreparations: {
      selected: [
        ph.prepBabyWipes && "Baby Wipes",
        ph.prepBandAids && "Band-Aids",
        ph.prepNeosporin && "Neosporin",
        ph.prepBactine && "Bactine",
        ph.prepSunscreen && "Sunscreen",
        ph.prepInsectRepellent && "Insect Repellent",
        ph.prepNonRxOintment && "Non-prescription Ointment",
        ph.prepBabyPowder && "Baby Powder",
      ].filter(Boolean),
      other: ph.prepOther || "",
    },
    photoVideo: {
      granted: [
        ph.photoClassroom && "Classroom / center displays",
        ph.photoFamily && "Communications to enrolled families",
        ph.photoWeb && "Website / social media",
        ph.photoMarketing && "Marketing / promotional materials",
      ].filter(Boolean),
      denyAll: !!ph.photoNone,
    },
    mealBenefit: { acknowledged: !!ies.iesDownloadAck },
    parentHandbook: { acknowledged: !!hb.hbAgree },
    policyAck: {
      ppChildName: pa.ppChildName || childName,
      ppChildDob: pa.ppChildDob || en.childDob,
      ppParentName: pa.ppParentName || fin.rpName || motherName,
      ppCenterLocation: pa.ppCenterLocation || loc.legalName || loc.name || "Angel Learning Center",
      ppInitialsSleep: pa.ppInitialsSleep,
      ppInitialsProhibited: pa.ppInitialsProhibited,
      ppInitialsFamily: pa.ppInitialsFamily,
      ppNeedsDiscussed: pa.ppNeedsDiscussed,
      ppAgreedPractices: pa.ppAgreedPractices,
      ppParentQuestions: pa.ppParentQuestions,
      ppDirectorNotes: pa.ppDirectorNotes,
      ppAckPolicies: !!pa.ppAckPolicies,
      ppAckSafeSleep: !!pa.ppAckSafeSleep,
      ppAckProgress: !!pa.ppAckProgress,
      ppAckSpecialNeeds: !!pa.ppAckSpecialNeeds,
      ppAckShakenBaby: !!pa.ppAckShakenBaby,
      ppAckParticipation: !!pa.ppAckParticipation,
      ppSignature: pa.ppSignature,
      ppSignDate: pa.ppSignDate,
      ppPrintName: pa.ppPrintName,
      ppDirectorSignature: pa.ppDirectorSignature,
      ppDirectorDate: pa.ppDirectorDate,
      ppDirectorPrintTitle: pa.ppDirectorPrintTitle,
    },
    signatures: {
      mother:
        [pa.ppSignature, fin.finSignature, hb.hbSignature, ph.photoSignature]
          .map((raw) => (raw ? resolveResponsiblePartyName({ rpName: raw }, en) || raw : ""))
          .find(Boolean) || motherName,
      father: fatherName,
      date: pa.ppSignDate || fin.finSignDate || hb.hbDate || ph.photoDate,
    },
    _derived: { childName, addressLine },
  };
}

function checkedFrom(value, option) {
  if (Array.isArray(value)) return value.includes(option);
  return value === option || value === true;
}

function isBulletChecked(selected, label) {
  if (!selected) return false;
  if (Array.isArray(selected)) return selected.includes(label);
  if (selected instanceof Set) return selected.has(label);
  return !!selected;
}

function resolveBulletItems(items, defaultChecked = false) {
  return (items || []).map((item) => {
    if (item && typeof item === "object" && "text" in item) {
      return { text: item.text, checked: !!item.checked };
    }
    return { text: String(item), checked: !!defaultChecked };
  });
}

function BulletMark({ checked }) {
  return (
    <View style={{ flexDirection: "row", width: 20, flexShrink: 0 }}>
      <Text style={enroll.policyBulletMark}>•</Text>
      <Text style={[enroll.policyCheckMark, checked ? enroll.valueText : null]}>{checked ? "✓" : " "}</Text>
    </View>
  );
}

function FieldLine({ label, value, flex = 1, multiline = false }) {
  const isSignature = isSignatureFieldLabel(label);
  return (
    <View style={[s.col, { flex, minWidth: 0 }]}>
      <Text style={enroll.inlineLabel}>{label}</Text>
      {isSignature ? (
        <PdfSignatureOnLine value={value} lineStyle={{ flex: 1, minWidth: 0 }} />
      ) : (
        <View style={[enroll.inlineValue, multiline ? s.multiline : null]}>
          <Text style={enroll.valueText} wrap>
            {val(value) || " "}
          </Text>
        </View>
      )}
    </View>
  );
}

function Checkbox({ label, checked }) {
  return (
    <View style={[s.checkboxRow, { marginBottom: 3 }]}>
      <View style={s.checkboxBox}>{checked ? <Text style={s.checkText}>✓</Text> : <Text> </Text>}</View>
      <Text style={enroll.checkboxText}>{label}</Text>
    </View>
  );
}

function SignatureLine({ label = "Signature", value, date }) {
  return (
    <View style={s.row} wrap={false}>
      <FieldLine label={label} value={value} flex={3} />
      <FieldLine label="Date" value={date} flex={1} />
    </View>
  );
}

function BulletList({ items, ordered = false, square = false }) {
  return (
    <View>
      {items.map((item, idx) => (
        <View key={`${idx}-${item.slice(0, 10)}`} style={s.bullet}>
          <Text style={s.bulletMark}>{ordered ? `${idx + 1}.` : square ? "[]" : "-"}</Text>
          <Text style={s.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function SectionHeading({ text }) {
  return (
    <View style={s.section}>
      <Text style={enroll.sectionTitle}>{text}</Text>
    </View>
  );
}

function PacketPage({ title, children }) {
  return (
    <Page size="LETTER" style={enroll.page} wrap>
      <PdfHeader />
      <Text style={enroll.title}>{title}</Text>
      {children}
      <PdfFooter />
    </Page>
  );
}

function maritalStatusField(person = {}) {
  return <FieldLine label="Marital Status" value={person.maritalStatus} flex={1} />;
}

function GuardianBlock({ title, person = {} }) {
  return (
    <View wrap={false}>
      <SectionHeading text={title} />
      <View style={s.row}>
        <FieldLine label="First Name" value={person.firstName} flex={3} />
        <FieldLine label="M.I." value={person.mi} flex={1} />
        <FieldLine label="Last Name" value={person.lastName} flex={3} />
      </View>
      <View style={s.row}>
        <FieldLine label="Address" value={person.address} flex={4} />
        <FieldLine label="City / Zip" value={[person.city, person.zip].filter(Boolean).join(" ")} flex={2} />
      </View>
      <View style={s.row}>
        <FieldLine label="Home Phone" value={person.homePhone} />
        <FieldLine label="Cell Phone" value={person.cellPhone} />
        <FieldLine label="Employed By" value={person.employer} />
      </View>
      <View style={s.row}>
        <FieldLine label="Occupation" value={person.occupation} />
        <FieldLine label="Work Phone" value={person.workPhone} />
        <FieldLine label="Work Address" value={person.workAddress} />
        <FieldLine label="Work Hours" value={person.workHours} />
      </View>
      <View style={s.row}>
        <Checkbox label="Custodial Parent" checked={!!person.custodial} />
        <FieldLine label="SSN" value={person.ssn} />
        <FieldLine label="Email" value={person.email} flex={2} />
      </View>
      <View style={s.row}>
        <FieldLine label="Driver's License #" value={person.driversLicense} />
        <FieldLine label="Birthday" value={person.birthday} />
      </View>
      {maritalStatusField(person)}
    </View>
  );
}

const enroll = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 42,
    paddingHorizontal: 46,
    fontFamily: FONT,
    fontSize: 10,
    color: COLORS.ink,
    lineHeight: 1.12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  headerLogo: {
    width: 118,
    height: 32,
    objectFit: "contain",
  },
  title: {
    fontFamily: FONT,
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    marginTop: 0,
    marginBottom: 10,
  },
  startRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: FONT,
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 9,
    marginBottom: 6,
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    width: "100%",
    marginBottom: 5,
  },
  inlineField: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginRight: 12,
    minWidth: 0,
  },
  inlineLabel: {
    fontFamily: FONT,
    fontWeight: "normal",
    fontSize: 10,
    marginRight: 4,
    flexShrink: 0,
  },
  inlineValue: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#000",
    minHeight: 12,
    paddingHorizontal: 2,
    paddingBottom: 0,
    minWidth: 20,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  valueText: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#0645AD",
    lineHeight: 1.05,
  },
  checkboxText: {
    fontFamily: FONT,
    fontSize: 10,
    marginRight: 10,
  },
  longQuestion: {
    fontFamily: FONT,
    fontWeight: "normal",
    fontSize: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  intro: {
    fontFamily: FONT,
    fontSize: 10,
    lineHeight: 1.38,
    textAlign: "left",
    marginBottom: 10,
    marginTop: 2,
  },
  introEmphasis: {
    fontFamily: FONT,
    fontSize: 10,
    fontWeight: "bold",
    lineHeight: 1.38,
  },
  contactBlock: {
    marginBottom: 12,
  },
  mealLabel: {
    fontFamily: FONT,
    fontSize: 10,
    marginRight: 28,
  },
  italicNote: {
    fontFamily: FONT,
    fontSize: 9,
    fontStyle: "italic",
    marginLeft: 8,
  },
  authText: {
    fontFamily: FONT,
    fontSize: 10,
    lineHeight: 1.42,
    textAlign: "left",
    marginBottom: 4,
  },
  inlineBlank: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#0645AD",
    textDecoration: "underline",
  },
  page2Section: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 8,
  },
  subLabel: {
    fontFamily: FONT,
    fontSize: 10,
    marginBottom: 4,
    marginTop: 6,
  },
  multiline: {
    minHeight: 14,
    marginBottom: 2,
  },
  footerSpacer: {
    height: 8,
  },
  medTable: {
    borderWidth: 2,
    borderColor: "#8B0000",
    marginTop: 10,
    marginBottom: 12,
    flexDirection: "row",
  },
  medCell: {
    flex: 1,
    minHeight: 88,
    minWidth: 0,
    borderRightWidth: 2,
    borderRightColor: "#8B0000",
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  medHead: {
    fontFamily: FONT,
    fontWeight: "bold",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 8,
    color: "#000",
  },
  medBody: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#0645AD",
    textAlign: "center",
  },
  permSection: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
  },
  permBody: {
    fontFamily: FONT,
    fontSize: 10,
    lineHeight: 1.35,
    marginBottom: 6,
  },
  permActivityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    marginTop: 2,
  },
  permActivity: {
    fontFamily: FONT,
    fontSize: 10,
    marginRight: 22,
  },
  permListItem: {
    fontFamily: FONT,
    fontSize: 10,
    marginBottom: 3,
    marginLeft: 8,
  },
  permCheckLine: {
    fontFamily: FONT,
    fontSize: 10,
    lineHeight: 1.35,
    marginBottom: 5,
  },
  permYesNo: {
    fontFamily: FONT,
    fontSize: 10,
    marginBottom: 5,
    marginTop: 4,
  },
  permSigRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 8,
    marginBottom: 4,
  },
  policyAckTitle: {
    fontFamily: FONT,
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 2,
  },
  policyAckSubtitle: {
    fontFamily: FONT,
    fontWeight: "bold",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 14,
  },
  policyAckFieldRow: {
    marginBottom: 8,
  },
  policyAckQuote: {
    fontFamily: FONT,
    fontSize: 10,
    lineHeight: 1.35,
    marginBottom: 6,
    textAlign: "justify",
  },
  policyAckNumberedRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    paddingLeft: 10,
  },
  policyAckNumber: {
    fontFamily: FONT,
    fontSize: 10,
    width: 14,
    flexShrink: 0,
  },
  policyAckSigBlock: {
    marginTop: 10,
    marginBottom: 6,
  },
  policyBullet: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  policyBulletMark: {
    fontFamily: FONT,
    fontSize: 10,
    width: 10,
    flexShrink: 0,
  },
  policyCheckMark: {
    fontFamily: "Helvetica",
    fontSize: 10,
    width: 10,
    flexShrink: 0,
  },
  policyBulletText: {
    fontFamily: FONT,
    fontSize: 10,
    lineHeight: 1.35,
    flex: 1,
  },
  blankSummaryTitle: {
    fontFamily: FONT,
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  blankSummarySubtitle: {
    fontFamily: FONT,
    fontSize: 10,
    textAlign: "center",
    color: COLORS.muted,
    marginBottom: 12,
  },
  blankSummaryMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#f7f7f7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  blankSummaryMetaLabel: {
    fontFamily: FONT,
    fontSize: 8.5,
    color: COLORS.muted,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  blankSummaryMetaValue: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: COLORS.value,
    fontWeight: "bold",
  },
  blankSummaryCountBadge: {
    borderWidth: 1,
    borderColor: "#8B0000",
    backgroundColor: "#fff5f5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    minWidth: 90,
  },
  blankSummaryCountNum: {
    fontFamily: FONT,
    fontWeight: "bold",
    fontSize: 18,
    color: "#8B0000",
    lineHeight: 1.1,
  },
  blankSummaryCountLabel: {
    fontFamily: FONT,
    fontSize: 8,
    color: "#8B0000",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  blankSummarySection: {
    marginBottom: 12,
  },
  blankSummarySectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e8e8e8",
    borderWidth: 0.8,
    borderColor: "#555",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  blankSummarySectionTitle: {
    fontFamily: FONT,
    fontWeight: "bold",
    fontSize: 11,
    letterSpacing: 0.2,
  },
  blankSummarySectionCount: {
    fontFamily: FONT,
    fontSize: 9,
    color: COLORS.muted,
  },
  blankSummarySectionBody: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 0.8,
    borderTopWidth: 0,
    borderColor: "#555",
  },
  blankSummaryItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
    paddingBottom: 3,
    borderBottomWidth: 0.4,
    borderBottomColor: "#ddd",
  },
  blankSummaryItemNum: {
    fontFamily: FONT,
    fontSize: 9,
    width: 16,
    flexShrink: 0,
    color: COLORS.muted,
    paddingTop: 1,
  },
  blankSummaryItemLabel: {
    fontFamily: FONT,
    fontSize: 9.5,
    lineHeight: 1.35,
    flex: 1,
    minWidth: 0,
  },
  blankSummaryCompleteBox: {
    borderWidth: 1,
    borderColor: "#2d6a2d",
    backgroundColor: "#f4fff4",
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: "center",
  },
  blankSummaryCompleteText: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: "bold",
    color: "#2d6a2d",
    textAlign: "center",
    marginBottom: 4,
  },
  blankSummaryCompleteSub: {
    fontFamily: FONT,
    fontSize: 10,
    color: COLORS.muted,
    textAlign: "center",
  },
  permissionCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  permissionCheckBox: {
    width: 11,
    height: 11,
    borderWidth: 0.85,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    flexShrink: 0,
  },
  permissionCheckBoxYes: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
  },
  permissionCheckMark: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.ink,
    lineHeight: 1,
  },
  permissionCheckYes: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    fontWeight: "bold",
    color: "#FFFFFF",
    lineHeight: 1,
  },
  permissionCheckLabel: {
    fontFamily: FONT,
    fontSize: 10,
    lineHeight: 1.35,
    flex: 1,
  },
  prepItem: {
    fontFamily: FONT,
    fontSize: 10,
    marginBottom: 4,
  },
  wmgHero: {
    alignItems: "center",
    marginTop: 4,
    marginBottom: 14,
    width: "100%",
  },
  wmgAlcLogo: {
    width: 108,
    height: 30,
    objectFit: "contain",
    marginBottom: 6,
  },
  wmgLogo: {
    width: 520,
    height: 108,
    objectFit: "contain",
  },
  wmgTitle: {
    fontFamily: FONT,
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B0000",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.4,
  },
  wmgStep: {
    fontFamily: FONT,
    fontSize: 11,
    fontWeight: "bold",
    color: "#1792cc",
    marginTop: 10,
    marginBottom: 6,
  },
  wmgRedNote: {
    fontFamily: FONT,
    fontSize: 9.5,
    fontStyle: "italic",
    color: "#8B0000",
    marginTop: 4,
    lineHeight: 1.35,
  },
  wmgNumbered: {
    fontFamily: FONT,
    fontSize: 10,
    marginBottom: 6,
  },
  wmgFamilyRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    width: "100%",
    marginBottom: 7,
  },
  wmgFamilyNum: {
    width: 14,
    fontFamily: FONT,
    fontSize: 10,
    textAlign: "right",
    marginRight: 6,
    paddingBottom: 1,
    flexShrink: 0,
  },
  wmgFamilyField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    minWidth: 0,
  },
  wmgFamilyLabel: {
    fontFamily: FONT,
    fontSize: 10,
    marginRight: 4,
    flexShrink: 0,
  },
  procareHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  procareAlcLogo: {
    width: 118,
    height: 32,
    objectFit: "contain",
  },
  procareLogo: {
    width: 118,
    height: 40,
    objectFit: "contain",
  },
  procareMainTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: "#6BAFD6",
    textAlign: "center",
    marginBottom: 2,
  },
  procareTagline: {
    fontFamily: "Helvetica",
    fontSize: 11,
    marginTop:20,
    color: "#666666",
    textAlign: "center",
    marginBottom: 10,
  },
  procareIntro: {
    fontFamily: FONT,
    fontSize: 9.5,
    lineHeight: 1.35,
    marginBottom: 8,
    textAlign: "justify",
  },
  procareAuthHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    fontWeight: "bold",
    marginBottom: 6,
    lineHeight: 1.3,
  },
  procareAuthHeadingBlue: {
    color: "#1792cc",
  },
  procareAuthBody: {
    fontFamily: FONT,
    fontSize: 9.5,
    lineHeight: 1.35,
    marginBottom: 6,
    textAlign: "justify",
  },
  procareCompleteOne: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: "#1792cc",
    marginBottom: 8,
  },
  procareSectionA: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#1792cc",
    marginBottom: 8,
  },
  procareStackField: {
    marginRight: 10,
    minWidth: 0,
  },
  procareStackLabel: {
    fontFamily: FONT,
    fontSize: 9,
    marginBottom: 2,
  },
  procareStackValue: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#000",
    minHeight: 13,
    paddingHorizontal: 2,
    justifyContent: "flex-end",
  },
  procareTuitionNote: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#7B68C8",
    marginTop: 6,
    marginBottom: 10,
  },
  procareBottomRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4, 
  },
  procareCheckArea: {
    flex: 1.15,
    marginRight: 12,
  },
  procareCheckImage: {
    borderWidth: 1,
    borderColor: "#999",
    backgroundColor: "#f5f5f5",
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  procareCheckOverlay: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#E07020",
    textAlign: "center",
    lineHeight: 1.3,
  },
  procareCheckLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  procareCheckLabel: {
    fontFamily: FONT,
    fontSize: 7.5,
    color: COLORS.muted,
    textAlign: "center",
    flex: 1,
  },
  procareOfficial: {
    flex: 1, 
    borderWidth: 1,
    borderColor: "#333",
    padding: 8,
    height:120,
  },
  procareOfficialTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    textAlign: "center",
    marginBottom: 10,
  },
  procareFooterRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
  },
  procareFooterText: {
    fontFamily: FONT,
    fontSize: 8,
    color: COLORS.muted,
  },
  procareFooterDot: {
    fontFamily: FONT,
    fontSize: 8,
    color: "#1792cc",
    marginHorizontal: 4,
  },
  footerContainer: {
    position: "absolute",
    bottom: 18,
    left: 46, // Matches page paddingHorizontal: 46
    right: 46,
    borderTopWidth: 0.8, // Line above footer text
    borderTopColor: "#999999",
    paddingTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#555555",
  },
});

function InlineField({ label, value, width, flex, grow = false }) {
  const normalizedLabel = String(label || "").trim();
  const labelText = /[:)]$/.test(normalizedLabel) ? normalizedLabel : `${normalizedLabel}:`;
  const isSignature = isSignatureFieldLabel(normalizedLabel);
  const display = isSignature ? formatSignatureValue(value) || " " : val(value) || " ";

  return (
    <View
      style={[
        enroll.inlineField,
        width ? { width } : null,
        flex ? { flex, minWidth: 0 } : null,
        grow ? { flexGrow: 1, minWidth: 0 } : null,
      ]}
    >
      {normalizedLabel ? <Text style={enroll.inlineLabel}>{labelText}</Text> : null}
      {isSignature ? (
        <PdfSignatureOnLine value={value} lineStyle={{ flex: 1, minWidth: 0 }} />
      ) : (
        <View style={[enroll.inlineValue, { flex: 1, minWidth: 0 }]}>
          <Text style={enroll.valueText}>{display}</Text>
        </View>
      )}
    </View>
  );
}

function StackField({ label, value, flex = 1, width }) {
  const isSignature = isSignatureFieldLabel(label);
  return (
    <View style={[enroll.procareStackField, flex ? { flex, minWidth: 0 } : null, width ? { width } : null]}>
      <Text style={enroll.procareStackLabel}>{label}</Text>
      {isSignature ? (
        <PdfSignatureOnLine value={value} lineStyle={{ width: "100%", minHeight: 20 }} />
      ) : (
        <View style={enroll.procareStackValue}>
          <Text style={enroll.valueText}>{val(value) || " "}</Text>
        </View>
      )}
    </View>
  );
}

function splitCityStateZip(value = "") {
  const text = String(value || "").trim();
  if (!text) return { city: "", state: "", zip: "" };
  const parts = text.split(",").map((part) => part.trim());
  if (parts.length >= 3) {
    return { city: parts[0], state: parts[1], zip: parts.slice(2).join(", ") };
  }
  if (parts.length === 2) {
    const stateZip = parts[1].split(/\s+/);
    if (stateZip.length >= 2) {
      return { city: parts[0], state: stateZip[0], zip: stateZip.slice(1).join(" ") };
    }
    return { city: parts[0], state: parts[1], zip: "" };
  }
  return { city: text, state: "", zip: "" };
}

function WmgNumberedField({ number, label, value }) {
  const labelText = /[:)]$/.test(String(label).trim()) ? label : `${label}:`;
  const isSignature = isSignatureFieldLabel(label);
  return (
    <View style={enroll.wmgFamilyRow}>
      <Text style={enroll.wmgFamilyNum}>{number}.</Text>
      <View style={enroll.wmgFamilyField}>
        <Text style={enroll.wmgFamilyLabel}>{labelText}</Text>
        {isSignature ? (
          <PdfSignatureOnLine value={value} lineStyle={{ flex: 1, minWidth: 0 }} />
        ) : (
          <View style={[enroll.inlineValue, { flex: 1, minWidth: 0 }]}>
            <Text style={enroll.valueText}>{val(value) || " "}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function InlineCheck({ label, checked, trailingLine = false }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", marginRight: 10 }}>
      <Text style={enroll.checkboxText}>
        •{checked ? <Text style={enroll.valueText}> ✓</Text> : null} {label}
      </Text>
      {trailingLine ? (
        <View style={[enroll.inlineValue, { width: 48, flexGrow: 0, marginLeft: 2 }]}>
          <Text style={enroll.valueText}> </Text>
        </View>
      ) : null}
    </View>
  );
}

function CompactSection({ children }) {
  return <Text style={enroll.sectionTitle}>{children}</Text>;
}

function CompactGuardian({ title, person = {} }) {
  return (
    <View wrap={false}>
      <CompactSection>{title}</CompactSection>
      <View style={enroll.lineRow}>
        <InlineField label="First Name" value={person.firstName} flex={2.4} />
        <InlineField label="M.I." value={person.mi} flex={0.9} />
        <InlineField label="Last Name" value={person.lastName} flex={2.4} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Address" value={person.address} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="City" value={person.city} flex={2} />
        <InlineField label="Zip code" value={person.zip} flex={1.4} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Home Phone" value={person.homePhone} flex={1} />
        <InlineField label="Cell Phone" value={person.cellPhone} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Employed By" value={person.employer} flex={1.1} />
        <InlineField label="Occupation" value={person.occupation} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Work Phone: ( )" value={person.workPhone} flex={1} />
        <InlineField label="Work Hours" value={person.workHours} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Work Address" value={person.workAddress} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <InlineCheck label="Custodial Parent (If married, mark both parents)" checked={!!person.custodial} />
        <InlineField label={`${title.startsWith("Mother") ? "Mother’s" : "Father’s"} SSN`} value={person.ssn} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Email" value={person.email} flex={1.2} />
        <InlineField label="Driver's License #" value={person.driversLicense} flex={1} />
        <InlineField label="Birthday" value={person.birthday} flex={0.9} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Marital Status" value={person.maritalStatus} flex={1} />
      </View>
    </View>
  );
}

function Page1({ d, raw = {}, waitlistMode = false }) {
  const child = d.child || {};
  const en = raw.enrollment || {};
  const motherName = fullName(d.mother);
  const fatherName = fullName(d.father);
  const registrationFee = `$${Number(ALC_CONFIG.waitlist?.registrationFee ?? 150).toFixed(2)}`;

  return (
    <Page size="LETTER" style={enroll.page}>
      <PdfHeader />
      <Text style={enroll.title}>Angel Learning Center Enrollment Form</Text>
      {!waitlistMode && (
        <View style={{  flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "flex-end",
      marginBottom: 6,}}>
          <InlineField label="Start Date" value={d.startDate} width={150} />
        </View>
      )}

      <CompactSection>Child’s Information</CompactSection>
      <View style={enroll.lineRow}>
        <InlineField label="First Name" value={child.firstName} flex={2.6} />
        <InlineField label="M.I." value={child.mi} flex={0.7} />
        <InlineField label="Last Name" value={child.lastName} flex={2.6} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Name child prefers to be called" value={child.preferredName} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Gender" value={normalizeChildGender(child.gender)} flex={0.9} />
        <InlineField label="Date of Birth" value={child.dob} flex={1.15} />
        <InlineField label="Child’s SSN" value={child.ssn} flex={1.15} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Address" value={child.address} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="City" value={child.city} flex={1.8} />
        <InlineField label="Zip code" value={child.zip} flex={1} />
      </View>
      <Text style={enroll.longQuestion}>
        List any existing medical conditions, medication and/or special attention your child may require?
      </Text>
      <View style={enroll.lineRow}>
        <View style={[enroll.inlineValue, { flex: 1, minWidth: 0, marginRight: 12 }]}>
          <Text style={enroll.valueText}>{val(child.medicalConditions) || " "}</Text>
        </View>
      </View>
      <CompactGuardian title="Mother/Guardian" person={d.mother} />
      <CompactGuardian title="Father/Guardian" person={d.father} />

      {waitlistMode && (
        <>
          <CompactSection>PARENT/GUARDIAN SIGNATURES</CompactSection>
          <View style={enroll.lineRow}>
            <InlineField
              label="Printed Name"
              value={en.wlParent1PrintName || motherName}
              flex={1.2}
            />
            <InlineField
              label="Signature"
              value={en.wlParent1Signature || motherName}
              flex={1.2}
            />
            <InlineField label="Date" value={en.wlParent1SignDate || TODAY} flex={0.7} />
          </View>
          <View style={enroll.lineRow}>
            <InlineField
              label="Printed Name"
              value={en.wlParent2PrintName || fatherName}
              flex={1.2}
            />
            <InlineField
              label="Signature"
              value={en.wlParent2Signature || fatherName}
              flex={1.2}
            />
            <InlineField label="Date" value={en.wlParent2SignDate || TODAY} flex={0.7} />
          </View>
        </>
      )}

    {!waitlistMode && (
  <>
    <CompactSection>Tuition/Payment Information</CompactSection>

    <View style={enroll.lineRow}>
      <InlineField
        label="Current Tuition Amount"
        value={d.tuition?.amount}
        width={220}
      />
    </View>
  </>
)}
      <PdfFooter />
    </Page>
  );
}

function Page2({ d }) {
  const contacts = [...(d.emergencyContacts || [])].slice(0, 3);
  while (contacts.length < 3) contacts.push({});
  const childName = d._derived?.childName || "";
  const childDob = d.child?.dob || "";

  return (
    <Page size="LETTER" style={enroll.page}>
      <PdfHeader />
      <Text style={enroll.title}>Emergency Contact Information Form</Text>

      <Text style={enroll.intro}>
        Children will be released only to the custodial parent or legal guardian and the persons listed below. The
        following people will be contacted and are authorized to remove the child from the facility in case of illness,
        accident or emergency, if for some reason the custodial parent or legal guardian cannot be reached:{" "}
        <Text style={enroll.introEmphasis}>
          ID must be provided by the child’s parent to our center’s email before child can be released to emergency
          contact!
        </Text>
      </Text>

      <Text style={enroll.page2Section}>Emergency Contacts:</Text>
      {contacts.map((c, idx) => (
        <View key={idx} style={enroll.contactBlock} wrap={false}>
          <View style={enroll.lineRow}>
            <InlineField label="Name" value={c.name} flex={1} />
          </View>
          <View style={enroll.lineRow}>
            <Text style={enroll.inlineLabel}>Phone:</Text>
            <InlineField label="(Home)" value={c.homePhone} flex={1} />
            <InlineField label="(Work)" value={c.workPhone} flex={1} />
            <InlineField label="(Cell)" value={c.cellPhone} flex={1} />
          </View>
          <View style={enroll.lineRow}>
            <InlineField label="Address" value={c.address} flex={1} />
          </View>
          <View style={enroll.lineRow}>
            <InlineField label="Relationship to child" value={c.relationship} flex={1} />
          </View>
        </View>
      ))}

      <Text style={enroll.page2Section}>Additional Information</Text>
      <View style={enroll.lineRow}>
        <Text style={enroll.inlineLabel}>Primary Hours of Care:</Text>
        <InlineField label="From" value={d.care?.from} flex={1} />
        <InlineField label="To" value={d.care?.to} flex={1} />
        <Text style={enroll.italicNote}>*cannot exceed more than 10hrs a day.*</Text>
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Meals Served" value={(d.care?.meals || []).join(", ")} flex={1} />
      </View>
      <Text style={enroll.subLabel}>Previous School Information:</Text>
      <View style={enroll.lineRow}>
        <InlineField label="Daycare Name" value={d.care?.previousSchool} flex={1} />
        <InlineField label="Home Care Name" value={d.care?.homeCareName} flex={1} />
      </View>

      <Text style={enroll.page2Section}>Emergency Medical Authorization</Text>
      <Text style={enroll.authText}>
        In the event my child{" "}
        <Text style={enroll.inlineBlank}>{val(childName) || "                        "}</Text>
        , date of birth{" "}
        <Text style={enroll.inlineBlank}>{val(childDob) || "              "}</Text>
        , suffers an injury or illness while in care at Angel Learning Center and the facility is unable to contact me
        (us) immediately, it shall be authorized to secure such medical attention and care for the child as may be
        necessary. I (we) will assume responsibility for payment of services.
      </Text>

      <View style={[enroll.lineRow, { marginTop: 16 }]}>
        <InlineField label="Parent/Guardian Signature" value={d.signatures?.mother} flex={2.2} />
        <InlineField label="Date" value={d.signatures?.date} flex={1} />
      </View>
      <PdfFooter />
    </Page>
  );
}

function Page3({ d }) {
  const mother = d.mother || {};
  const father = d.father || {};
  const medical = d.medical || {};
  const special = val(medical.specialInfo);
  const specialLines = [special, " ", " "];

  return (
    <Page size="LETTER" style={enroll.page}>
      <PdfHeader />
      <Text style={enroll.title}>Child Medical Record Form (Nurse/Transport):</Text>
   

      <View style={enroll.lineRow}>
        <InlineField label="Child’s Name" value={d._derived?.childName} flex={2.2} />
        <InlineField label="Birth Date" value={d.child?.dob} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Address" value={d._derived?.addressLine} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Allergies" value={medical.allergies} flex={1} />
      </View>

      <View style={[enroll.lineRow, { marginTop: 6 }]}>
        <InlineField label="Mother’s Name" value={fullName(mother)} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Address" value={mother.address} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <Text style={enroll.inlineLabel}>Phone:</Text>
        <InlineField label="(Home)" value={mother.homePhone} flex={1} />
        <InlineField label="(Work)" value={mother.workPhone} flex={1} />
        <InlineField label="(Cell)" value={mother.cellPhone} flex={1} />
      </View>

      <View style={[enroll.lineRow, { marginTop: 6 }]}>
        <InlineField label="Father’s Name" value={fullName(father)} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Address" value={father.address} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <Text style={enroll.inlineLabel}>Phone:</Text>
        <InlineField label="(Home)" value={father.homePhone} flex={1} />
        <InlineField label="(Work)" value={father.workPhone} flex={1} />
        <InlineField label="(Cell)" value={father.cellPhone} flex={1} />
      </View>

      <View style={[enroll.lineRow, { marginTop: 6 }]}>
        <InlineField label="Physician’s Name" value={medical.doctor} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Address" value={medical.doctorAddress} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Phone" value={medical.doctorPhone} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <InlineField label="Insurance Information" value={medical.insurance} flex={1} />
      </View>

      <View style={enroll.medTable}>
        {[
          ["Chronic Illnesses", medical.chronicIllnesses],
          ["Allergies", medical.allergies],
          ["Current Medications", medical.currentMedications],
        ].map(([head, body], idx) => (
          <View key={head} style={[enroll.medCell, idx === 2 ? { borderRightWidth: 0 } : null]}>
            <Text style={enroll.medHead}>{head}</Text>
            <Text style={enroll.medBody}>{val(body) || " "}</Text>
          </View>
        ))}
      </View>

      <Text style={[enroll.inlineLabel, { marginBottom: 4 }]}>Special Information:</Text>
      {specialLines.map((line, idx) => (
        <View key={idx} style={enroll.lineRow}>
          <View style={[enroll.inlineValue, { flex: 1, minWidth: 0, marginRight: 12 }]}>
            <Text style={enroll.valueText}>{idx === 0 ? val(line) || " " : " "}</Text>
          </View>
        </View>
      ))}

      <View style={[enroll.lineRow, { marginTop: 14 }]}>
        <InlineField label="Parent/Guardian Signature" value={d.signatures?.mother} flex={2.2} />
        <InlineField label="Date" value={d.signatures?.date} flex={1} />
      </View>
      <PdfFooter />
    </Page>
  );
}

function PermSignature({ signature, date }) {
  return (
    <View style={enroll.permSigRow}>
      <InlineField label="Parent/Guardian Signature" value={signature} flex={2.2} />
      <InlineField label="Date" value={date} flex={1} />
    </View>
  );
}

function Page4({ d, raw = {} }) {
  const sig = d.signatures?.mother;
  const date = d.signatures?.date;
  const photo = raw.photo || d._source?.photo || {};
  const transport = transportPermissionSource(raw.transport || {});
  const photoFlags = d.photo || {};

  const waterItems = permissionItemsFromFields(photo, WATER_PERMISSION_FIELDS, d.permissions?.water);
  const transportItems = permissionItemsFromFields(
    transport,
    TRANSPORT_PERMISSION_FIELDS,
    d.permissions?.transportConsent
  );

  const photoGranted = !!(
    (photoFlags.agree || photoFlags.classroom || photoFlags.family || photoFlags.web || photoFlags.marketing) &&
    !photoFlags.none
  );
  const photoChoice = photoFlags.none
    ? "No, I do not give permission for photographs of any kind to be taken."
    : photoGranted
      ? "Yes, I give permission for photographs to be taken and utilized by ALC."
      : "";

  return (
    <Page size="LETTER" style={enroll.page}>
      <PdfHeader />
      <Text style={enroll.title}>Permissions</Text>

      <Text style={enroll.permSection}>Water Activities:</Text>
      <Text style={enroll.permBody}>
        I give consent for my child to participate in the following water activities:
      </Text>
      <PolicyBullets items={WATER_PERMISSION_FIELDS.map(({ label }) => label)} />
      <PermissionCheckItem
        label="I grant permission for all water activities listed above."
        checked={waterItems.length > 0 && waterItems.every((item) => item.checked)}
      />
      <PermSignature signature={sig} date={date} />

      <Text style={enroll.permSection}>Transportation:</Text>
      <Text style={enroll.permBody}>
        I give consent for my child to be transported and supervised by Angel Learning Center Staff for:
      </Text>
      <InlineField
        label="Selected"
        value={transportItems.filter((item) => item.checked).map((item) => item.text).join(", ")}
        flex={1}
      />
      <Text style={[enroll.permBody, { marginTop: 8 }]}>
        Field trips will be announced at least 48 hours in advance. Parents will sign an individual permission slip for
        each trip indicating the address of the trip, length of the trip, and information on each passenger and driver.
      </Text>
      <PermSignature signature={sig} date={date} />

      <Text style={enroll.permSection}>Photography Release</Text>
      <Text style={enroll.permBody}>
        I understand Angel Learning Center takes photographs of center events and classroom activities throughout the year.
        Permission covers classroom displays, family communications, the website or social media, and marketing materials, or none of those uses.
      </Text>
      <InlineField label="Photo permission" value={photoChoice} flex={1} />
      <PermSignature signature={sig} date={date} />
      <PdfFooter />
    </Page>
  );
}

const bitingPlanItems = [
  "Immediately separate the students.",
  "Remind the student who bit “Biting hurts! That’s not a nice friend.”",
  "Reflection time is not developmentally appropriate until the age of two; however, the student who bit, should be redirected to another play area.",
  "Increase proactive supervision. Most biting occurs when a child feels threatened or forced to defend themselves.",
  "Take note of the actions of both children before the incident and attempt to prevent a recurrence. Example: Was this incident over sharing a toy or did the other friend invade his/her personal space?",
  "Document the incident for both parents including how, when, where, and why this happened and what actions we took following the incident.",
  "If behavior becomes a habit, children 3 years and up will be suspended. If possible, the student who bit will be moved to another classroom.",
  "As a last resort, the student who has will be dismissed from the ALC program.",
];

const pottyPolicyItems = [
  "Children should be potty trained by 3 years old unless there are extenuating circumstances.",
  "Once children are 3 years there will be a 30-day grace period to complete the potty-training process if required.",
  "Our staff members are very diligent in the potty-training process; however, it REQUIRES parental involvement as well.",
  "If a child does not meet the potty-training deadline a conference will be scheduled to discuss options including removal from the ALC program.",
];

function PolicySignature({ signature, date }) {
  return (
    <View style={[enroll.permSigRow, { marginTop: 10, marginBottom: 6 }]}>
      <InlineField label="Parent Signature" value={signature} flex={2.2} />
      <InlineField label="Date" value={date} flex={1} />
    </View>
  );
}

function PolicyBullet({ children, checked = false }) {
  return (
    <View style={enroll.policyBullet}>
      <BulletMark checked={checked} />
      <Text style={enroll.policyBulletText}>{children}</Text>
    </View>
  );
}

function PolicyBullets({ items, checked = false }) {
  const rows = resolveBulletItems(items, checked);
  return (
    <View>
      {rows.map((row, idx) => (
        <View key={idx} style={enroll.policyBullet}>
          <BulletMark checked={row.checked} />
          <Text style={enroll.policyBulletText}>{row.text}</Text>
        </View>
      ))}
    </View>
  );
}

function PermissionCheckItem({ label, checked }) {
  const yes = !!checked;
  return (
    <View style={enroll.permissionCheckRow}>
      <View style={[enroll.permissionCheckBox, yes ? enroll.permissionCheckBoxYes : null]}>
        {yes ? <PdfCheckMark color="#FFFFFF" size={9} /> : <Text> </Text>}
      </View>
      <Text style={enroll.permissionCheckLabel}>{label}</Text>
    </View>
  );
}

function Page5({ d }) {
  const sig = d.signatures?.mother;
  const date = d.signatures?.date;
  const agreed = !!d.parentHandbook?.acknowledged;

  return (
    <Page size="LETTER" style={enroll.page}>
      <PdfHeader />
      <Text style={enroll.title}>Biting Intervention Plan for Angel Learning Center</Text>

      <PolicyBullets items={bitingPlanItems} checked={agreed} />
      <PolicySignature signature={sig} date={date} />

      <Text style={[enroll.permSection, { marginTop: 16 }]}>Potty Training Policy</Text>
      <PolicyBullets items={pottyPolicyItems} checked={agreed} />
      <PolicySignature signature={sig} date={date} />
      <PdfFooter />
    </Page>
  );
}

const centerPolicyItems = [
  "Angel Learning center is open Monday through Friday from 6:30a.m. to 5:30p.m. Our center is designed to care for infants, toddlers, and school-aged children. Your child may be dropped off as early as 6:30a.m., but no later than 9:00a.m. If your child is going to be tardy, you are required to notify us in advance and provide a doctor’s note. Your child can spend a maximum of 10 hours each day with us.",
  "We offer a flat $10 discount weekly for families who choose to make a monthly payment (4 weeks at a time). The payments are made in advance for the week, and it should be made by Friday noon for the upcoming week.",
  "The automatic processing will be done on Monday morning. Unless we are closed Monday for a holiday. If the automatic payment returns/declines a fine of $35 will be posted in addition to the late fee.",
  "An annual registration fee is due the first week of August each year for all children who plan to attend our program the following year whether you participate in summer camp or not.",
  "No credit shall be given for the days the center is officially closed due to electricity, water, inclement weather, etc. We allow 3 days per enrollment year for inclement weather and 3 days for loss of electricity, water, and other environmental issues.",
  "Should you withdraw with a balance on your account, you will be notified immediately. You will be given 30 days to dispute any charges in writing. If payment or payment arrangements are not made on undisputed charges, your balance will be sent to collections.",
  "Angel Learning Center will notify parents in writing before children participate in field trips, water activities over 2 feet deep, and any special activities away from the center.",
  "Angel Learning Center will not allow my child to leave with any person(s) not listed on the guardian or emergency contact list.",
  "Angel Learning Center will notify me in writing of any injury, illness, or accident that occurs while my child is on the premises through the Procare app.",
  "I authorize the facility to provide emergency care services.",
  "I have received a copy of the Parent Manual Rules and Procedures.",
];

function ChildSigFields({ d }) {
  return (
    <>
      <View style={[enroll.permSigRow, { marginTop: 14 }]}>
        <InlineField label="Parent/Guardian Signature" value={d.signatures?.mother} flex={2.2} />
        <InlineField label="Date" value={d.signatures?.date} flex={1} />
      </View>
      <View style={enroll.permSigRow}>
        <InlineField label="Name of Child" value={d._derived?.childName} flex={2.2} />
        <InlineField label="Birth date" value={d.child?.dob} flex={1} />
      </View>
    </>
  );
}

function Page6({ d }) {
  const agreed = !!d.parentHandbook?.acknowledged;

  return (
    <Page size="LETTER" style={enroll.page}>
      <PdfHeader />
      <Text style={enroll.title}>Center Policies and Procedures Agreement</Text>

      <PolicyBullets items={centerPolicyItems} checked={agreed} />
      <ChildSigFields d={d} />
      <PdfFooter />
    </Page>
  );
}

const obligationItems = [
  "All families will sign up for the ProCare Application - this is mandatory for receiving communication from the program as well as a contactless check in and check out.",
  "A parent or guardian shall provide immunization records/religious waiver within 15 days of enrollment.",
  "A parent, guardian, or designated representative shall bring the child into the building upon arrival, sign the child in and hand off the child to a center staff person no exceptions - school age children included.",
  "A parent, guardian or designated representative shall sign the child/ren in each day and sign the child/ren out before removing the child from the premises.",
  "The parent or guardian shall see the child is appropriately dressed.",
  "The parent or guardian shall notify the center when someone other than themselves shall be picking up the child via the ProCare application.",
  "The parent or guardian shall notify the center when there is a change to the child’s home and family life.",
  "The parent or guardian shall notify the center when the child is absent for any reason.",
  "The parent or guardian shall notify the center when the child has been exposed to a communicable disease.",
  "The parent or guardian shall notify the center in writing not less than two weeks prior to withdrawing a child from the center.",
  "Failure to notify the Center as specified will result in tuition fees being assessed, due and payable.",
];

const terminationItems = [
  "Serious illness of the child, Preventing Center attendance.",
  "The parents or guardians of the child allows their account to become delinquent.",
  "Failure of the parents or guardians to honor the obligations listed in this agreement or in any policies promulgated or provided by ALC.",
  "ALC, in its sole discretion, determines that it is unable to meet the needs of the child or family. ALC, in its sole discretion, determines to have the child in attendance.",
];

function Page7({ d }) {
  const agreed = !!d.parentHandbook?.acknowledged;

  return (
    <Page size="LETTER" style={enroll.page}>
      <PdfHeader />
      <Text style={enroll.title}>Obligations of Parents or Guardians</Text>

      <PolicyBullets items={obligationItems} checked={agreed} />
      <ChildSigFields d={d} />

      <Text style={[enroll.permSection, { marginTop: 14 }]}>Termination of the Agreement</Text>
      <Text style={[enroll.permBody, { marginBottom: 8, fontWeight: "bold" }]}>
        This Agreement shall be terminated if any one or more of the following occurs:
      </Text>
      <PolicyBullets items={terminationItems} checked={agreed} />
      <PdfFooter />
    </Page>
  );
}

const procedureItems = [
  "The child’s parents or guardians may request a conference with Center personnel regarding the matters that potentially warrant termination, but the school shall have no obligation to grant any such request.",
  "The Center’s Director and/or Owner shall have the sole right and responsibility to determine any disputed factual matters regarding termination of this agreement.",
];

const modificationItems = [
  "This agreement may be modified whenever any of the circumstances covered by this agreement changes.",
  "Such modifications may only be made in writing and must be signed and dated by the parties involved to be binding and effective.",
  "Oral modifications are not binding under this agreement and shall not be enforceable under any condition.",
];

const otherItems = [
  "The parties to this agreement are aware that Georgia Bright from the Start Services has the right to interview the child and the Center staff, and to inspect and audit all records maintained by the Center, without securing the prior consent of anyone.",
  "The parties are also aware of the licensing agency’s right to observe the physical condition of the child, including conditions indicating neglect and abuse, and to have a licensed medical professional physically examine the child.",
  "The parties to this agreement are aware that the Center staff is required by Georgia Law to report any suspected child abuse to the Georgia Bright from the Start Services, Children’s Protective Service and/or any law.",
];

function Page8({ d }) {
  const agreed = !!d.parentHandbook?.acknowledged;

  return (
    <Page size="LETTER" style={enroll.page}>
      <PdfHeader />

      <Text style={[enroll.permSection, { textAlign: "center", marginTop: 4 }]}>PROCEDURE</Text>
      <PolicyBullets items={procedureItems} checked={agreed} />

      <Text style={[enroll.permSection, { textAlign: "center" }]}>MODIFICATIONS</Text>
      <PolicyBullets items={modificationItems} checked={agreed} />

      <View style={[enroll.permSigRow, { marginTop: 10, marginBottom: 10 }]}>
        <InlineField label="Parent/Guardian Signature" value={d.signatures?.mother} flex={2.2} />
        <InlineField label="Date" value={d.signatures?.date} flex={1} />
      </View>

      <Text style={[enroll.permSection, { textAlign: "center" }]}>OTHER</Text>
      <PolicyBullets items={otherItems} checked={agreed} />
      <PdfFooter />
    </Page>
  );
}


function Page9({ d, raw = {} }) {
  const childName = d._derived?.childName || "";
  const sig = d.signatures?.mother;
  const date = d.signatures?.date;
  const photo = raw.photo || d._source?.photo || {};
  const prepSelected = d.externalPreparations?.selected || [];

  return (
    <Page size="LETTER" style={enroll.page}>
      <PdfHeader />
      <Text style={enroll.title}>Authorization to Dispense External Preparations</Text>

      <Text style={[enroll.permBody, { marginBottom: 8 }]}>590-1-1-.20(1)</Text>
      <Text style={[enroll.permBody, { marginBottom: 8 }]}>
        Parental Authorization. Except for first aid or as authorized under Georgia law, Personnel shall not dispense
        prescription or non-prescription medications to a child without specific written authorization from the child’s
        physician or Parent. Such authorization will include, when applicable, date; full name of the child; name of
        the medication; prescription number, if any; dosage; the dates to be given; the time of day to be dispensed; and
        signature of the parent.
      </Text>
      <Text style={[enroll.permBody, { marginBottom: 10 }]}>
        I give Angel Learning Center permission to apply one or more of the following topical ointments/preparations to
        my child{" "}
        <Text style={enroll.inlineBlank}>{val(childName) || "                                    "}</Text> in accordance with
        the directions on the label of the container.
      </Text>

      <PolicyBullets items={PREP_PERMISSION_FIELDS.map(({ label }) => label)} />
      <PermissionCheckItem
        label="I authorize the center to apply all of the external preparations listed above."
        checked={
          PREP_PERMISSION_FIELDS.every(({ field, key }) => asBool(photo[field]) || prepSelected.includes(key))
        }
      />

      <View style={[enroll.lineRow, { marginTop: 8 }]}>
        <InlineField label="Other (please specify)" value={photo.prepOther || d.externalPreparations?.other} flex={1} />
      </View>

      <View style={[enroll.permSigRow, { marginTop: 12 }]}>
        <InlineField label="Parent/Guardian Signature" value={sig} flex={2.2} />
        <InlineField label="Date" value={date} flex={1} />
      </View>
      <PdfFooter />
    </Page>
  );
}

const videoSurveillanceParagraphs = [
  "As a private employer, Angel Learning Center (ALC) uses video surveillance to monitor our facilities. All persons are advised of the presence and locations of cameras.",
  "Security cameras are in use in all program locations. Parents may view a live feed of their child’s classroom through the Watch Me Grow application (excluding GA Pre-K, School Age, and Summer Camp classrooms). Taking screenshots or video footage is strictly prohibited and may result in revocation of viewing privileges at the discretion of the Regional Director.",
  "Camera footage is for internal use only and will not be shared; no exceptions will be made. Only live feeds are allowed, not regenerated footage, to protect children who cannot be photographed. Staff who violate this policy are subject to disciplinary action up to and including termination. Parents reported for taking screenshots or video will lose access.",
  "Cameras also serve as a crime deterrent, encourage improved performance when monitored, and provide peace of mind for parents and staff. Cameras are for internal purposes only to protect privacy.",
];

const agreementSignatureItems = [
  "I/We agree to perform the obligations of parents or guardians set forth in this agreement",
  "I/we agree to abide by the Rules, Policies and Procedures set forth in the Parent Handbook provided by ALC and agree to cooperate with the general policies of the school.",
  "I/We have read the terms of this agreement and the Rules, Policies, and Procedures set forth in the Parent Handbook provided by ALC.",
];

function AgreementSigColumn({ label, value }) {
  return (
    <View style={{ flex: 1, marginRight: 10, alignItems: "center" }}>
      <PdfSignatureOnLine value={value} lineStyle={{ width: "100%" }} />
      <Text style={{ fontFamily: FONT, fontSize: 9, marginTop: 3, textAlign: "center" }}>{label}</Text>
    </View>
  );
}

function Page10({ d }) {
  const sig = d.signatures?.mother;
  const fatherSig = d.signatures?.father;
  const date = d.signatures?.date;
  const agreed = !!(d.parentHandbook?.acknowledged || d.financial?.agreed);

  return (
    <Page size="LETTER" style={enroll.page}>
      <PdfHeader />
      <Text style={enroll.title}>Video Surveillance Policy</Text>

      {videoSurveillanceParagraphs.map((para, idx) => (
        <Text key={idx} style={[enroll.permBody, { marginBottom: 8, textAlign: "justify" }]}>
          {para}
        </Text>
      ))}

      <View style={[enroll.permSigRow, { marginTop: 6, marginBottom: 16 }]}>
        <InlineField label="Parent/Guardian Signature" value={sig} flex={2.2} />
        <InlineField label="Date" value={date} flex={1} />
      </View>

      <Text style={[enroll.permSection, { textAlign: "center", marginTop: 8 }]}>SIGNATURES TO AGREEMENT</Text>
      <Text style={[enroll.permBody, { marginBottom: 8 }]}>
        For services listed in this agreement, and in accordance with the terms of this agreement:
      </Text>
      <PolicyBullets items={agreementSignatureItems} checked={agreed} />

      <View style={[enroll.lineRow, { marginTop: 16, alignItems: "flex-start" }]}>
        <AgreementSigColumn label="Mother's Signature" value={sig} />
        <AgreementSigColumn label="Father's Signature" value={fatherSig} />
        <View style={{ flex: 0.8, marginRight: 0 }}>
          <View style={[enroll.inlineValue, { width: "100%" }]}>
            <Text style={enroll.valueText}>{val(date) || " "}</Text>
          </View>
          <Text style={{ fontFamily: FONT, fontSize: 9, marginTop: 3, textAlign: "center" }}>Date</Text>
        </View>
      </View>
      <PdfFooter />
    </Page>
  );
}

const acknowledgmentItems = [
  "I understand it is my responsibility to keep all Angel Learning Center records updated with the most current information.",
  "If my student becomes sick or is sent to school sick, the administration will contact me to pick up my student. My student will remain in their care until picked up from ALC.",
  "I understand parent involvement is the key to my child’s success in learning. I agree to have open lines of communication between my family and the teachers responsible for my child’s care at school.",
  "I understand this is a diverse population. Holidays will be recognized for all nationalities with a respectful multicultural approach.",
];

function Page11({ d }) {
  const sig = d.signatures?.mother;
  const date = d.signatures?.date;
  const acked = !!(d.parentHandbook?.acknowledged || d.mealBenefit?.acknowledged || sig);

  return (
    <Page size="A4" style={enroll.page}>
      <PdfHeader />
      <Text style={enroll.title}>Acknowledgments</Text>

      <PolicyBullets items={acknowledgmentItems.slice(0, 2)} checked={acked} />
      <PolicyBullet checked={acked}>
        Upon return, my student must be cleared by their doctor before re-entering the class. A doctor’s note must be
        provided upon the student’s return.{" "}
        <Text style={{ textDecoration: "underline" }}>
          Students must be symptoms free for 24 hours before returning to school.
        </Text>
      </PolicyBullet>
      <PolicyBullets items={acknowledgmentItems.slice(2)} checked={acked} />

      <View style={{ flexGrow: 1, minHeight: 120 }} />

      <View style={[enroll.permSigRow, { marginTop: 8 }]}>
        <InlineField label="Parent/Guardian Signature" value={sig} flex={2.2} />
        <InlineField label="Date" value={date} flex={1} />
      </View>
      <PdfFooter />
    </Page>
  );
}

function Page12({ d }) {
  const fin = d.financial || {};
  const sig = fin.signature || d.signatures?.mother;
  const date = fin.date || d.signatures?.date;
  const hasCardInfo = !!(fin.cardNumber || fin.cardExp || fin.cardCvv || fin.cardholderName);
  const { city, state, zip } = splitCityStateZip(fin.cityStateZip);

  return (
    <Page size="LETTER" style={enroll.page}>
      <View style={enroll.procareHeaderRow}>
        <Image style={enroll.procareAlcLogo} src={getLogoUrl()} />
        <Image style={enroll.procareLogo} src={getProCareLogoUrl()} />
      </View>

      <Text style={enroll.procareMainTitle}>Automated Payment Processing</Text>
      <Text style={enroll.procareTagline}>Safe. Convenient. Easy.</Text>

      <Text style={enroll.procareIntro}>
        Tuition Express is a service that allows you to make secure, on-time payments to your child care provider
        through an automatic deduction from your bank account or credit card. It&apos;s a convenient way to pay your
        tuition and fees.
      </Text>

      <Text style={enroll.procareAuthHeading}>
        ELECTRONIC FUNDS TRANSFER AUTHORIZATION FOR BANK ACCOUNT AND{" "}
        <Text style={enroll.procareAuthHeadingBlue}>CREDIT CARD</Text>
      </Text>
      <Text style={enroll.procareAuthBody}>
        I (we) hereby authorize{" "}
        <Text style={enroll.valueText}>Angel Learning Center</Text> to initiate charges to my (our) account at the
        financial institution or credit card indicated below and to credit the same to my (our) account. This
        authorization is to remain in full force and effect until Angel Learning Center has received written
        notification from me (us) of its termination in such time and in such manner as to afford Angel Learning Center
        and the financial institution or credit card company a reasonable opportunity to act on it. I understand that
        cancellation requires at least 10 days advance notice.
      </Text>
      <Text style={enroll.procareCompleteOne}>COMPLETE ONE SECTION ONLY</Text>

      <Text style={enroll.procareSectionA}>SECTION A (Credit Card)</Text>

      <View style={enroll.lineRow}>
        <StackField
          label="Cardholder Name"
          value={hasCardInfo ? fin.cardholderName || fin.responsibleParty : ""}
          flex={1.5}
        />
        <StackField label="Phone #" value={fin.phone} flex={1} />
      </View>
      <View style={enroll.lineRow}>
        <StackField label="Cardholder Address" value={fin.address} flex={1.6} />
        <StackField label="City" value={city} flex={0.8} />
        <StackField label="State" value={state} flex={0.45} />
        <StackField label="Zip" value={zip} flex={0.65} />
      </View>
      <View style={enroll.lineRow}>
        <StackField label="Card Number" value={hasCardInfo ? fin.cardNumber : ""} flex={1.6} />
        <StackField label="Expiration Date" value={hasCardInfo ? fin.cardExp : ""} flex={0.9} />
        <StackField label="CVV" value={hasCardInfo ? fin.cardCvv : ""} flex={0.5} />
      </View>
      <View style={enroll.lineRow}>
        <StackField label="Cardholder Signature" value={sig} flex={1.5} />
        <StackField label="Date" value={date} flex={1} />
      </View>

      <Text style={enroll.procareTuitionNote}>Tuition is charged every Monday morning by 9:00am.</Text>

      <View style={enroll.procareBottomRow}>
        <View style={enroll.procareCheckArea}>
          <View style={enroll.procareCheckImage}>
            <Text style={enroll.procareCheckOverlay}>ATTACH VOIDED CHECK HERE</Text>
            <Text style={enroll.procareCheckOverlay}>DEPOSIT SLIPS NOT ACCEPTED</Text>
          </View>
          <View style={enroll.procareCheckLabels}>
            <Text style={enroll.procareCheckLabel}>ROUTING NUMBER</Text>
            <Text style={enroll.procareCheckLabel}>ACCOUNT NUMBER</Text>
            <Text style={enroll.procareCheckLabel}>CHECK NUMBER</Text>
          </View>
        </View>

        <View style={enroll.procareOfficial}>
          <Text style={enroll.procareOfficialTitle}>FOR OFFICIAL USE ONLY</Text>
          <StackField label="Date Received" value="" />

          <View style={{ marginTop: 8 }}> 
          </View>
             <StackField label="Employee Signature" value="" />
        </View>
      </View>

      <View style={enroll.procareFooterRow}>
        <Text style={enroll.procareFooterText}>800.338.3884</Text>
        <Text style={enroll.procareFooterDot}>•</Text>
        <Text style={[enroll.procareFooterText, { color: "#1792cc" }]}>procaresoftware.com</Text>
        <Text style={enroll.procareFooterDot}>•</Text>
        <Text style={enroll.procareFooterText}>© Copyright 2020 Procare Software®, LLC</Text>
      </View>

      <PdfFooter />
    </Page>
  );
}

function Page13({ d, raw = {} }) {
  const wmg = raw.watchMeGrow || {};
  const sig = wmg.wmgSignature || d.signatures?.mother;

  return (
    <Page size="LETTER" style={enroll.page}>
      <PdfHeader />

      <View style={enroll.wmgHero}>
        <Image style={enroll.wmgLogo} src={getWatchMeGrowUrl()} />
      </View>

      <Text style={enroll.wmgTitle}>Registration Instructions</Text>

      <Text style={enroll.wmgStep}>Step 1 – Download the App or Open the Website</Text>
      <PolicyBullets
        items={[
          'Option 1: Open your phone’s App Store (iOS) or Google Play Store (Android) and search for "Watch Me Grow" to download the app.',
          "Option 2: Open a web browser and go to www.watchmegrow.com",
        ]}
      />

      <Text style={enroll.wmgStep}>Step 2 – Sign Up</Text>
      <PolicyBullets
        items={[
          "Click on Sign Up and enter the center’s phone number when prompted:",
          "Dawsonville: 706-265-2427",
          "Savannah: 912-228-8228",
          "Valdosta: 229-244-8010",
          "Smarr: 478-994-3096",
          "Follow the prompts to complete setting up your personal account.",
        ]}
      />

      <Text style={enroll.wmgStep}>Step 3 – Request Permission</Text>
      <PolicyBullets
        items={[
          "Enter your child’s room number in the designated field.",
          "Once your request is submitted, our administrative team will review and approve access.",
        ]}
      />

      <Text style={[enroll.wmgStep, { color: COLORS.ink, marginTop: 12 }]}>Family Information</Text>
      <WmgNumberedField number={1} label="Child's Name" value={wmg.wmgChildName || d._derived?.childName} />
      <WmgNumberedField number={2} label="Classroom" value="" />
      <WmgNumberedField number={3} label="Parent Signature" value={sig} />

      <Text style={[enroll.wmgStep, { marginTop: 14 }]}>Parent Acknowledgment</Text>
      {WATCH_ME_GROW_ACK_ITEMS.map((item) => (
        <PermissionCheckItem key={item.key} label={item.text} checked={!!wmg[item.key]} />
      ))}
      <PdfFooter />
    </Page>
  );
}

function Page16BlankSummary({ data, d }) {
  const blanks = collectBlankFields(data, d);
  const groups = groupBlankFields(blanks);
  const childName = val(d._derived?.childName || "");
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const totalCount = blanks.length;

  return (
    <Page size="LETTER" style={enroll.page} wrap>
      <View wrap={false}>
        <Text style={enroll.blankSummaryTitle}>BLANK FIELDS SUMMARY</Text>
        <Text style={enroll.blankSummarySubtitle}>
          Review of incomplete enrollment fields at time of PDF generation
        </Text>

        <View style={enroll.blankSummaryMetaRow}>
          <View>
            <Text style={enroll.blankSummaryMetaLabel}>Child</Text>
            <Text style={enroll.blankSummaryMetaValue}>{childName || "—"}</Text>
          </View>
          <View>
            <Text style={enroll.blankSummaryMetaLabel}>Generated</Text>
            <Text style={enroll.blankSummaryMetaValue}>{generatedDate.toUpperCase()}</Text>
          </View>
          <View style={enroll.blankSummaryCountBadge}>
            <Text style={enroll.blankSummaryCountNum}>{totalCount}</Text>
            <Text style={enroll.blankSummaryCountLabel}>
              {totalCount === 1 ? "Blank field" : "Blank fields"}
            </Text>
          </View>
        </View>
      </View>

      {groups.length === 0 ? (
        <View style={enroll.blankSummaryCompleteBox}>
          <Text style={enroll.blankSummaryCompleteText}>All fields complete</Text>
          <Text style={enroll.blankSummaryCompleteSub}>
            No blank fields were found across the tracked enrollment forms and document uploads.
          </Text>
        </View>
      ) : (
        groups.map((group) => (
          <View key={group.section} style={enroll.blankSummarySection}>
            <View style={enroll.blankSummarySectionHead} minPresenceAhead={24}>
              <Text style={enroll.blankSummarySectionTitle}>{group.section.toUpperCase()}</Text>
              <Text style={enroll.blankSummarySectionCount}>
                {group.labels.length} {group.labels.length === 1 ? "item" : "items"}
              </Text>
            </View>
            <View style={enroll.blankSummarySectionBody}>
              {group.labels.map((label, idx) => (
                <View key={`${group.section}-${idx}-${label}`} style={enroll.blankSummaryItem}>
                  <Text style={enroll.blankSummaryItemNum}>{idx + 1}.</Text>
                  <Text style={enroll.blankSummaryItemLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        ))
      )}

      <PdfFooter />
    </Page>
  );
}

export function PacketPdf({ data = {}, location = {}, which = "packet" }) {
  const d = normalize(data, location);

  if (which === "financial") {
    return (
      <Document>
        <FinancialAgreementPage data={data} location={location} />
        <Page12 d={d} raw={data} />
      </Document>
    );
  }

  if (which === "waitlist") {
    return (
      <Document>
        <Page1 d={d} raw={data} waitlistMode />
      </Document>
    );
  }

  if (which === "enrollment") {
    return (
      <Document>
        <Page1 d={d} raw={data} />
        <Page2 d={d} raw={data} />
      </Document>
    );
  }

  return (
    <Document>
      <Page1 d={d} raw={data} />
      <Page2 d={d} raw={data} />
      <FinancialAgreementPage data={data} location={location} />
      <Page3 d={d} raw={data} />
      <Page4 d={d} raw={data} />
      <Page5 d={d} raw={data} />
      <Page6 d={d} raw={data} />
      <Page7 d={d} raw={data} />
      <Page8 d={d} raw={data} />
      <Page9 d={d} raw={data} />
      <Page10 d={d} raw={data} />
      <Page11 d={d} raw={data} />
      <Page12 d={d} raw={data} />
      <Page13 d={d} raw={data} />
      <ParentPolicyAckPage1 d={d} location={location} raw={data} />
      <ParentPolicyAckPage2 d={d} location={location} raw={data} />
      <ParentPolicyAckPage3 d={d} location={location} raw={data} />
      <SafeSleepPage1 d={d} location={location} raw={data} />
      <SafeSleepPage2 d={d} location={location} raw={data} />
      <StrollerRidePage1 d={d} location={location} raw={data} />
      <StrollerRidePage2 d={d} location={location} raw={data} />
      <Page16BlankSummary data={data} d={d} />
    </Document>
  );
}

export function generateEnrollmentPDF(data, location = {}) {
  return <PacketPdf data={data} location={location} which="packet" />;
}

export { normalize, Page1 as EnrollmentPdfPage1, Page2 as EnrollmentPdfPage2 };

export default PacketPdf;
