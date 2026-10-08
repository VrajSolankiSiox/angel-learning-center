import React from "react";
import { Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { FONT, PdfFooter, formatPdfValue, getLogoUrl, PdfSignatureOnLine } from "./PdfShared";
import { PdfCheckboxBox, PdfCheckboxRow } from "./PdfCheckbox";

const s = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontFamily: FONT,
    fontSize: 9,
    color: "#000",
    lineHeight: 1.32,
  },
  logoRow: {
    marginBottom: 6,
  },
  logo: {
    width: 122,
    height: 33,
    objectFit: "contain",
  },
  title: {
    fontFamily: FONT,
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONT,
    fontWeight: "bold",
    fontSize: 9,
    textAlign: "center",
    marginBottom: 10,
  },
  metaTable: {
    borderWidth: 0.75,
    borderColor: "#999",
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    borderBottomWidth: 0.75,
    borderBottomColor: "#999",
  },
  metaCell: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRightWidth: 0.75,
    borderRightColor: "#999",
    minHeight: 28,
  },
  metaCellLast: {
    borderRightWidth: 0,
  },
  metaLabel: {
    fontFamily: FONT,
    fontSize: 9,
    marginBottom: 2,
  },
  metaValue: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#0645AD",
  },
  body: {
    fontFamily: FONT,
    fontSize: 9,
    textAlign: "justify",
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: FONT,
    fontWeight: "bold",
    fontSize: 11,
    marginTop: 4,
    marginBottom: 4,
  },
  numberedRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    paddingRight: 4,
  },
  numberedText: {
    flex: 1,
    fontSize: 9,
    textAlign: "justify",
  },
  boldInline: {
    fontWeight: "bold",
  },
  physicianRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingRight: 4,
  },
  physicianText: {
    flex: 1,
    fontSize: 9,
    textAlign: "justify",
  },
  naGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    flexShrink: 0,
  },
  naLabel: {
    fontSize: 9,
    marginLeft: 4,
  },
  sigRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
    gap: 8,
  },
  sigField: {
    flex: 1,
  },
  sigLabel: {
    fontSize: 9,
    marginBottom: 2,
  },
  sigLine: {
    borderBottomWidth: 0.75,
    borderBottomColor: "#111",
    minHeight: 12,
    paddingBottom: 1,
  },
  sigValue: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#0645AD",
  },
  footerNote: {
    fontFamily: FONT,
    fontWeight: "bold",
    fontSize: 9,
    textAlign: "center",
    marginTop: 10,
  },
});

const SAFE_SLEEP_PRACTICES = [
  {
    n: 1,
    title: "Back to sleep.",
    text:
      "Staff will initially place every infant on the infant’s back in a safety-approved crib. A different initial sleep position may be used only when the parent provides a physician’s written statement identifying how the infant must be placed and the time frame for following the instruction. When an infant can easily roll from back to front and back again, staff will continue to place the infant initially on the back and will allow the infant to remain in the position the infant chooses without repositioning.",
  },
  {
    n: 2,
    title: "Safety-approved crib.",
    text:
      "Each infant will be provided a crib that complies with Consumer Product Safety Commission (CPSC) and American Society for Testing and Materials International (ASTM) safety standards. Cribs will be maintained in good repair and free of hazards. Stack cribs and drop-side cribs will not be used.",
  },
  {
    n: 3,
    title: "Firm mattress and fitted sheet.",
    text:
      "Each crib will have a firm, tight-fitting mattress without gaps. The mattress will be at least two inches thick and covered with waterproof, washable material. Only an individual, tight-fitting sheet will be used. The mattress will be disinfected before a change of occupant.",
  },
  {
    n: 4,
    title: "Empty crib.",
    text:
      "No objects will be placed or allowed in or on the crib with an infant. Prohibited items include blankets, covers, toys, pillows, quilts, comforters, bumper pads, sheepskins, stuffed toys, bibs, and other soft or loose items.",
  },
  {
    n: 5,
    title: "Nothing attached to the crib.",
    text:
      "No objects will be attached or allowed to remain attached to a crib while an infant is sleeping. Prohibited items include crib gyms, toys, mirrors, mobiles, cords, and similar items.",
  },
  {
    n: 6,
    title: "Bedding care.",
    text:
      "An infant’s individual tight-fitting crib sheet will be changed daily, whenever soiled, whenever otherwise needed, and before a change of occupant. Sheets or similar coverings for cots or mats will be laundered daily unless marked for individual use. Individually marked sheets and covers will be laundered weekly or more frequently as needed.",
  },
  {
    n: 7,
    title: "Sleeping only in an approved crib.",
    text:
      "An infant who arrives asleep or falls asleep in a car safety seat, bouncy seat, highchair, swing, other equipment, on the floor, or elsewhere will be transferred promptly to a safety-approved crib.",
  },
  {
    n: 8,
    title: "Sleep clothing.",
    text:
      "Sleepers, sleep sacks, and wearable blankets may be used when they fit according to the manufacturer’s instructions and cannot slide up around the infant’s face. Parents are responsible for providing safe, properly fitted sleep clothing when requested. Loose blankets will not be used in an infant’s crib.",
  },
  {
    n: 9,
    title: "Swaddling.",
    text:
      "Swaddling is not permitted unless the parent provides a physician’s written statement authorizing swaddling for the particular infant. The statement must include specific instructions and the time frame during which swaddling is authorized.",
  },
  {
    n: 10,
    title: "Positioning devices and monitors.",
    text:
      "Wedges, infant positioning devices, and monitors will not be used unless the parent provides a physician’s written statement authorizing the device for the particular infant. The statement must explain how the device is to be used and the authorized time frame.",
  },
  {
    n: 11,
    title: "Room temperature and lighting.",
    text:
      "The infant sleep area will be maintained at a temperature comfortable for a lightly clothed adult, within 65°F to 85°F depending on the season. Lighting will remain sufficient for staff to clearly see each sleeping infant’s face, observe skin color, and check breathing.",
  },
  {
    n: 12,
    title: "Supervision and response.",
    text:
      "Staff will maintain active sight-and-sound supervision and follow the Center’s required sleep-check procedures. Staff will respond immediately to changes in an infant’s breathing, skin color, temperature, position, behavior, or other signs of distress.",
  },
];

function val(v) {
  return formatPdfValue(v);
}

function NumberedItem({ n, title, text }) {
  return (
    <View style={s.numberedRow} wrap={false}>
      <Text style={s.numberedText}>
        <Text style={s.boldInline}>{n}. {title} </Text>
        {text}
      </Text>
    </View>
  );
}

function SigLine({ label, signature, date, dateLabel = "Date:" }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={s.sigRow}>
        <View style={[s.sigField, { flex: 2 }]}>
          <Text style={s.sigLabel}>{label}</Text>
          <PdfSignatureOnLine value={signature} />
        </View>
        <View style={[s.sigField, { flex: 1 }]}>
          <Text style={s.sigLabel}>{dateLabel}</Text>
          <View style={s.sigLine}>
            <Text style={s.sigValue}>{val(date) || " "}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function isTruthy(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}

export function getSafeSleepFields(d, location = {}, rawData = {}) {
  const ss = { ...(d.safeSleep || {}), ...(rawData.safeSleep || {}) };
  const loc = location || {};
  const childName = ss.ssChildName || d._derived?.childName || "";
  const parentName =
    ss.ssPrintName ||
    d.financial?.responsibleParty ||
    d.signatures?.mother ||
    [d.mother?.firstName, d.mother?.mi, d.mother?.lastName].filter(Boolean).join(" ").trim();

  const hasSignature = !!(ss.ssSignature || d.signatures?.mother);
  let ackReceived = isTruthy(ss.ssAckReceived);
  let ackQuestions = isTruthy(ss.ssAckQuestions);
  let ackPhysician = isTruthy(ss.ssAckPhysician);
  let ackPhysicianNA = isTruthy(ss.ssAckPhysicianNA);

  if (hasSignature && !ackReceived && !ackQuestions && !ackPhysician && !ackPhysicianNA) {
    ackReceived = true;
    ackQuestions = true;
    ackPhysicianNA = true;
  }

  return {
    childName,
    childDob: ss.ssChildDob || d.child?.dob || "",
    classroom: ss.ssClassroom || "",
    centerLocation: ss.ssCenterLocation || loc.legalName || loc.name || "Angel Learning Center",
    ackReceived,
    ackQuestions,
    ackPhysician,
    ackPhysicianNA,
    signature: ss.ssSignature || d.signatures?.mother,
    signDate: ss.ssSignDate || d.signatures?.date,
    printName: ss.ssPrintName || parentName,
    directorSignature: ss.ssDirectorSignature,
    directorDate: ss.ssDirectorDate,
  };
}

function MetaGrid({ fields }) {
  return (
    <View style={s.metaTable}>
      <View style={s.metaRow}>
        <View style={s.metaCell}>
          <Text style={s.metaLabel}>Child Name:</Text>
          <Text style={s.metaValue}>{val(fields.childName) || " "}</Text>
        </View>
        <View style={[s.metaCell, s.metaCellLast]}>
          <Text style={s.metaLabel}>Date of Birth:</Text>
          <Text style={s.metaValue}>{val(fields.childDob) || " "}</Text>
        </View>
      </View>
      <View style={[s.metaRow, { borderBottomWidth: 0 }]}>
        <View style={s.metaCell}>
          <Text style={s.metaLabel}>Classroom:</Text>
          <Text style={s.metaValue}>{val(fields.classroom) || " "}</Text>
        </View>
        <View style={[s.metaCell, s.metaCellLast]}>
          <Text style={s.metaLabel}>Center Location:</Text>
          <Text style={s.metaValue}>{val(fields.centerLocation) || " "}</Text>
        </View>
      </View>
    </View>
  );
}

export function SafeSleepPage1({ d, location = {}, raw = {} }) {
  const fields = getSafeSleepFields(d, location, raw);

  return (
    <Page size="LETTER" style={s.page} wrap>
      <View style={s.logoRow}>
        <Image style={s.logo} src={getLogoUrl()} />
      </View>
      <Text style={s.title}>Parent Safe Sleep Procedure and Acknowledgment</Text>
      <Text style={s.subtitle}>Angel Learning Center</Text>

      <MetaGrid fields={fields} />

      <Text style={s.body}>
        <Text style={s.boldInline}>Purpose. </Text>
        Angel Learning Center follows these practices whenever an infant is placed to sleep. For this policy, an infant is
        a child younger than 12 months, or a child younger than 18 months who is not yet walking. Parents must provide
        any required physician statement before the Center may use an exception described below.
      </Text>

      <Text style={s.sectionTitle}>Safe Sleep Practices</Text>
      {SAFE_SLEEP_PRACTICES.slice(0, 10).map((item) => (
        <NumberedItem key={item.n} n={item.n} title={item.title} text={item.text} />
      ))}

      <PdfFooter />
    </Page>
  );
}

export function SafeSleepPage2({ d, location = {}, raw = {} }) {
  const fields = getSafeSleepFields(d, location, raw);

  return (
    <Page size="LETTER" style={s.page} wrap>
      {SAFE_SLEEP_PRACTICES.slice(10).map((item) => (
        <NumberedItem key={item.n} n={item.n} title={item.title} text={item.text} />
      ))}

      <Text style={[s.sectionTitle, { marginTop: 6 }]}>Physician Instructions</Text>
      <Text style={s.body}>
        If your infant requires an alternate sleep position, swaddling, a wedge, another positioning device, or a
        monitor, provide the Center with a current physician’s written statement before the practice or device may be
        used. The Center will follow only the written instructions and time frame stated by the physician.
      </Text>

      <Text style={s.sectionTitle}>Parent or Guardian Acknowledgment</Text>
      <Text style={[s.body, { marginBottom: 6 }]}>
        By signing below, I acknowledge that the Director or designee has provided me with and explained Angel Learning
        Center’s safe sleep practices. I understand that my infant will be placed initially on the back in an empty,
        safety-approved crib unless the Center has an acceptable physician’s written statement authorizing a specific
        exception. I agree to provide safe sleep clothing and any required physician documentation and to notify the
        Center promptly of changes to my child’s health or sleep instructions.
      </Text>

      <PdfCheckboxRow checked={fields.ackReceived} labelStyle={[s.numberedText, { flex: 1 }]}>
        I have received a copy of this safe sleep procedure.
      </PdfCheckboxRow>
      <PdfCheckboxRow checked={fields.ackQuestions} labelStyle={[s.numberedText, { flex: 1 }]}>
        I have had an opportunity to ask questions about the Center’s safe sleep practices.
      </PdfCheckboxRow>

      <Text style={[s.body, { marginBottom: 8 }]}>
        {fields.ackPhysician
          ? "My child currently has physician-authorized sleep instructions attached to this form."
          : fields.ackPhysicianNA
            ? "Physician-authorized sleep instructions: not applicable."
            : " "}
      </Text>

      <SigLine label="Parent or Guardian Signature:" signature={fields.signature} date={fields.signDate} />

      <View style={s.sigField}>
        <Text style={s.sigLabel}>Printed Name:</Text>
        <View style={s.sigLine}>
          <Text style={s.sigValue}>{val(fields.printName) || " "}</Text>
        </View>
      </View>

      <SigLine
        label="Director or Designee Signature:"
        signature={fields.directorSignature}
        date={fields.directorDate}
      />

      <Text style={s.footerNote}>Place the completed and signed form in the child’s file.</Text>

      <PdfFooter />
    </Page>
  );
}
