import React from "react";
import { Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { FONT, PdfFooter, formatPdfValue, getLogoUrl, PdfSignatureOnLine } from "./PdfShared";
import { PdfCheckboxRow } from "./PdfCheckbox";
import { parentInitialsFromEnrollment } from "../utils/formValues";

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
    fontSize: 16,
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
    marginTop: 6,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
    paddingRight: 4,
  },
  bullet: {
    width: 10,
    fontSize: 9,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    textAlign: "justify",
  },
  boldInline: {
    fontWeight: "bold",
  },
  initialsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 6,
    marginBottom: 8,
  },
  initialsLabel: {
    fontSize: 9,
    marginRight: 4,
  },
  initialsLine: {
    borderBottomWidth: 0.75,
    borderBottomColor: "#111",
    minWidth: 80,
    minHeight: 11,
    paddingBottom: 1,
  },
  initialsValue: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#0645AD",
  },
  commTable: {
    borderWidth: 0.75,
    borderColor: "#999",
    marginTop: 4,
    marginBottom: 8,
  },
  commRow: {
    borderBottomWidth: 0.75,
    borderBottomColor: "#999",
    minHeight: 52,
    padding: 5,
  },
  commRowAlt: {
    backgroundColor: "#f2f2f2",
  },
  commLabel: {
    fontFamily: FONT,
    fontWeight: "bold",
    fontSize: 9,
    marginBottom: 3,
  },
  commValue: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#0645AD",
    minHeight: 28,
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

function val(v) {
  return formatPdfValue(v);
}

function Bullet({ children }) {
  return (
    <View style={s.bulletRow}>
      <Text style={s.bullet}>•</Text>
      <Text style={s.bulletText}>{children}</Text>
    </View>
  );
}

function InitialsLine({ label, value }) {
  return (
    <View style={s.initialsRow}>
      <Text style={s.initialsLabel}>{label}</Text>
      <View style={s.initialsLine}>
        <Text style={s.initialsValue}>{val(value) || " "}</Text>
      </View>
    </View>
  );
}

function CommRow({ label, value, alt = false }) {
  return (
    <View style={[s.commRow, alt ? s.commRowAlt : null]}>
      <Text style={s.commLabel}>{label}</Text>
      <Text style={s.commValue}>{val(value) || " "}</Text>
    </View>
  );
}

function SigLine({ label, signature, date }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={s.sigRow}>
        <View style={[s.sigField, { flex: 2 }]}>
          <Text style={s.sigLabel}>{label}</Text>
          <PdfSignatureOnLine value={signature} />
        </View>
        <View style={[s.sigField, { flex: 1 }]}>
          <Text style={s.sigLabel}>Date:</Text>
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

const ACK_FIELD_KEYS = [
  "ppAckPolicies",
  "ppAckSafeSleep",
  "ppAckProgress",
  "ppAckSpecialNeeds",
  "ppAckShakenBaby",
  "ppAckParticipation",
];

function readAckChecks(pa, hasSignature) {
  const values = ACK_FIELD_KEYS.map((key) => isTruthy(pa[key]));
  if (hasSignature && !values.some(Boolean)) {
    return ACK_FIELD_KEYS.map(() => true);
  }
  return values;
}

export function getParentPolicyFields(d, location = {}, rawData = {}) {
  const pa = { ...(d.policyAck || {}), ...(rawData.policyAck || {}) };
  const loc = location || {};
  const childName = pa.ppChildName || d._derived?.childName || "";
  const parentName =
    pa.ppParentName ||
    d.financial?.responsibleParty ||
    d.signatures?.mother ||
    [d.mother?.firstName, d.mother?.mi, d.mother?.lastName].filter(Boolean).join(" ").trim();

  const hasSignature = !!(pa.ppSignature || d.signatures?.mother);
  const ackChecks = readAckChecks(pa, hasSignature);
  const [
    ackPolicies,
    ackSafeSleep,
    ackProgress,
    ackSpecialNeeds,
    ackShakenBaby,
    ackParticipation,
  ] = ackChecks;

  const enrollment = rawData.enrollment || {};
  const financial = rawData.financial || {};
  const autoInitials = parentInitialsFromEnrollment(enrollment, financial);

  return {
    childName,
    childDob: pa.ppChildDob || d.child?.dob || "",
    parentName,
    centerLocation: pa.ppCenterLocation || loc.legalName || loc.name || "Angel Learning Center",
    initialsSleep: pa.ppInitialsSleep || autoInitials,
    initialsProhibited: pa.ppInitialsProhibited || autoInitials,
    initialsFamily: pa.ppInitialsFamily || autoInitials,
    needsDiscussed: pa.ppNeedsDiscussed,
    agreedPractices: pa.ppAgreedPractices,
    parentQuestions: pa.ppParentQuestions,
    directorNotes: pa.ppDirectorNotes,
    ackPolicies,
    ackSafeSleep,
    ackProgress,
    ackSpecialNeeds,
    ackShakenBaby,
    ackParticipation,
    signature: pa.ppSignature || d.signatures?.mother,
    signDate: pa.ppSignDate || d.signatures?.date,
    printName: pa.ppPrintName || parentName,
    directorSignature: pa.ppDirectorSignature,
    directorDate: pa.ppDirectorDate,
    directorPrintTitle: pa.ppDirectorPrintTitle,
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
          <Text style={s.metaLabel}>Parent or Guardian Name:</Text>
          <Text style={s.metaValue}>{val(fields.parentName) || " "}</Text>
        </View>
        <View style={[s.metaCell, s.metaCellLast]}>
          <Text style={s.metaLabel}>Center Location:</Text>
          <Text style={s.metaValue}>{val(fields.centerLocation) || " "}</Text>
        </View>
      </View>
    </View>
  );
}

export function ParentPolicyAckPage1({ d, location = {}, raw = {} }) {
  const fields = getParentPolicyFields(d, location, raw);

  return (
    <Page size="LETTER" style={s.page} wrap>
      <View style={s.logoRow}>
        <Image style={s.logo} src={getLogoUrl()} />
      </View>
      <Text style={s.title}>Parent Policy Acknowledgment</Text>
      <Text style={s.subtitle}>
        Safe Sleep • Shaken Baby Syndrome and Abusive Head Trauma • Family Participation
      </Text>

      <MetaGrid fields={fields} />

      <Text style={s.body}>
        <Text style={s.boldInline}>Purpose. </Text>
        This form documents that Angel Learning Center provided the parent or guardian with the Center policies
        and procedures described below, reviewed the Center’s required health and safety practices, discussed the
        child’s care, and encouraged family participation. Please read each section, initial where shown, and sign
        the acknowledgment.
      </Text>

      <Text style={s.sectionTitle}>Safe Sleep Practices</Text>
      <Text style={[s.body, { marginBottom: 4 }]}>
        Angel Learning Center follows these safe sleep practices for infants:
      </Text>
      <Bullet>
        Infants are initially placed on their backs to sleep unless the Center has current written instructions from a
        physician or other authorized health care professional directing a different sleep position for that child.
      </Bullet>
      <Bullet>
        Cribs are kept free of blankets, pillows, quilts, comforters, bumper pads, stuffed animals, toys, bibs,
        positioning devices, and all other soft or loose items.
      </Bullet>
      <Bullet>
        Parents must provide appropriate sleep clothing, such as a sleep sack or other properly fitted sleepwear.
        Clothing must not cover the infant’s face or create a safety hazard.
      </Bullet>
      <Bullet>
        Each child is provided an individual crib, cot, or mat, as age appropriate, and individual bedding. Bedding and
        sleep surfaces are changed and cleaned when soiled, before use by another child, and according to the Center’s
        regular cleaning and sanitizing schedule.
      </Bullet>
      <Bullet>
        An infant who falls asleep in a swing, bouncer, car seat, stroller, other equipment, on the floor, or elsewhere
        will be moved promptly to an approved crib for sleep.
      </Bullet>
      <Bullet>
        The Center does not swaddle infants and does not use wedges, sleep positioners, weighted sleep products, or other
        positioning devices.
      </Bullet>
      <InitialsLine label="Parent Initials:" value={fields.initialsSleep} />

      <Text style={s.sectionTitle}>Preventing Shaken Baby Syndrome and Abusive Head Trauma</Text>
      <Text style={s.body}>
        <Text style={s.boldInline}>Center practice. </Text>
        All staff members are expected to protect children from shaken baby syndrome and abusive head trauma. Staff
        receive guidance on recognizing and responding to possible warning signs, supporting healthy early brain
        development, safely caring for infants and young children, and coping with crying or distress.
      </Text>
      <Text style={[s.body, { marginBottom: 2 }]}>
        <Text style={s.boldInline}>Recognizing and Responding to Signs and Symptoms</Text>
      </Text>
      <Text style={s.body}>
        Possible signs or symptoms may include unusual irritability, extreme sleepiness or difficulty waking, poor
        feeding, vomiting, difficulty breathing, seizures, loss of consciousness, inability to focus the eyes, unequal
        pupils, weakness, or unexplained bruising or injury.
      </Text>
      <Text style={s.body}>
        <Text style={s.boldInline}>Response and reporting: </Text>
        If a child shows concerning signs or symptoms, staff will seek immediate medical assistance as appropriate,
        protect the child from further harm, notify the Director or designee, notify the parent or guardian when
        appropriate, document the concern, and make all reports required by Georgia law and licensing rules. When an
        emergency is suspected, staff will call 911. Staff will not delay required reporting while conducting an
        internal review.
      </Text>
      <Text style={[s.body, { marginBottom: 2 }]}>
        <Text style={s.boldInline}>Caring for a Crying or Distraught Child</Text>
      </Text>
      <Bullet>
        Check for immediate needs, including hunger, diapering, illness, injury, temperature, fatigue, overstimulation,
        or the need for comfort.
      </Bullet>
      <Bullet>
        Use a calm voice, gentle holding or rocking, age-appropriate soothing, reduced stimulation, and the child’s
        established care routine.
      </Bullet>
      <Bullet>
        If frustration increases, place the child safely in an approved crib or other safe supervised location and
        request assistance or relief from another staff member.
      </Bullet>
      <Bullet>
        Staff must tell the Director or designee when they need support. A crying child will remain supervised and will
        never be handled roughly.
      </Bullet>

      <PdfFooter />
    </Page>
  );
}

export function ParentPolicyAckPage2({ d, location = {}, raw = {} }) {
  const fields = getParentPolicyFields(d, location, raw);

  return (
    <Page size="LETTER" style={s.page} wrap>
      <Text style={s.sectionTitle}>Understanding Early Brain Development</Text>
      <Text style={s.body}>
        Children from birth through five years of age have rapidly developing brains and depend on calm, responsive, and
        consistent caregivers. Crying, fussing, tantrums, and difficulty with self-regulation are forms of communication
        and may be developmentally expected. Staff use age-appropriate expectations, positive guidance, predictable
        routines, and responsive interactions. Shaking, striking, or forceful handling can cause permanent brain injury,
        disability, or death.
      </Text>

      <Text style={s.sectionTitle}>Prohibited Behaviors</Text>
      <Text style={[s.body, { marginBottom: 4 }]}>
        Staff members, volunteers, and students in training are prohibited from:
      </Text>
      <Bullet>
        Shaking, jerking, tossing, striking, hitting, spanking, pinching, pushing, pulling, or roughly handling a child;
      </Bullet>
      <Bullet>
        Using physical punishment, corporal punishment, or any action that could injure or frighten a child;
      </Bullet>
      <Bullet>
        Yelling at, threatening, humiliating, shaming, ridiculing, intimidating, or using profane or abusive language
        toward a child;
      </Bullet>
      <Bullet>
        Restricting breathing; covering a child’s face; forcing food, drink, or sleep; or using restraint except as
        specifically permitted for immediate safety;
      </Bullet>
      <Bullet>
        Leaving a crying, fussing, or distraught child unsupervised or responding in anger; or
      </Bullet>
      <Bullet>
        Ignoring, concealing, delaying, or failing to report suspected abuse, neglect, injury, or concerning signs and
        symptoms.
      </Bullet>
      <InitialsLine label="Parent Initials:" value={fields.initialsProhibited} />

      <Text style={s.sectionTitle}>Child Care Communication and Individual Needs</Text>
      <Text style={s.body}>
        The Director or designee will communicate with the parent or guardian about the child’s progress and issues
        related to the child’s care. The Center will discuss and document individual practices needed to address the
        child’s identified special needs, health needs, developmental needs, feeding or sleep needs, behavior supports,
        or other care considerations, as applicable.
      </Text>
      <View style={s.commTable}>
        <CommRow
          label="Child’s individual care or special needs discussed:"
          value={fields.needsDiscussed}
        />
        <CommRow
          label="Agreed practices, accommodations, or follow-up needed:"
          value={fields.agreedPractices}
          alt
        />
        <CommRow label="Parent questions or concerns:" value={fields.parentQuestions} />
        <CommRow label="Director or designee notes:" value={fields.directorNotes} alt />
      </View>

      <Text style={s.sectionTitle}>Family Participation</Text>
      <Text style={s.body}>
        Parents and guardians are encouraged to participate in Center activities, communicate regularly with teachers
        and administrators, attend conferences and family events, share information that helps the Center meet their
        child’s needs, volunteer when opportunities are available, and ask questions about the program or their child’s
        care.
      </Text>
      <InitialsLine label="Parent Initials:" value={fields.initialsFamily} />

      <PdfFooter />
    </Page>
  );
}

const ACK_ITEMS = [
  { key: "ackPolicies", text: "provided me with a copy of the Center’s policies and procedures required by the applicable licensing rule;" },
  { key: "ackSafeSleep", text: "advised me of the safe sleep practices followed by the Center;" },
  { key: "ackProgress", text: "advised me of my child’s progress and any issues related to my child’s care that are known at this time;" },
  { key: "ackSpecialNeeds", text: "discussed individual practices concerning my child’s special needs or care needs, when applicable;" },
  { key: "ackShakenBaby", text: "described the Center’s practices for preventing shaken baby syndrome and abusive head trauma; and" },
  { key: "ackParticipation", text: "encouraged my participation in Center activities." },
];

export function ParentPolicyAckPage3({ d, location = {}, raw = {} }) {
  const fields = getParentPolicyFields(d, location, raw);

  return (
    <Page size="LETTER" style={s.page} wrap>
      <Text style={s.sectionTitle}>Parent or Guardian Acknowledgment</Text>
      <Text style={[s.body, { marginBottom: 6 }]}>
        By signing below, I acknowledge that the Director or designee has:
      </Text>

      {ACK_ITEMS.map((item) => (
        <PdfCheckboxRow key={item.key} checked={fields[item.key]} labelStyle={[s.bulletText, { flex: 1 }]}>
          {item.text}
        </PdfCheckboxRow>
      ))}

      <Text style={[s.body, { marginTop: 8, marginBottom: 10 }]}>
        I have had an opportunity to ask questions and understand that I may request clarification or updated information
        from the Center at any time. My signature documents receipt and acknowledgment; it does not waive any rights
        provided by law.
      </Text>

      <SigLine
        label="Parent or Guardian Signature:"
        signature={fields.signature}
        date={fields.signDate}
      />

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

      <View style={[s.sigField, { marginTop: 4 }]}>
        <Text style={s.sigLabel}>Printed Name and Title:</Text>
        <View style={s.sigLine}>
          <Text style={s.sigValue}>{val(fields.directorPrintTitle) || " "}</Text>
        </View>
      </View>

      <Text style={s.footerNote}>Place the completed and signed form in the child’s file.</Text>

      <PdfFooter />
    </Page>
  );
}
