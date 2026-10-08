import React from "react";
import { Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { FONT, PdfFooter, formatPdfValue, getLogoUrl, PdfSignatureOnLine } from "./PdfShared";
import { PdfCheckboxRow } from "./PdfCheckbox";

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

function CommRow({ label, value, alt = false }) {
  return (
    <View style={[s.commRow, alt ? s.commRowAlt : null]}>
      <Text style={s.commLabel}>{label}</Text>
      <Text style={s.commValue}>{val(value) || " "}</Text>
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

export function getStrollerRideFields(d, location = {}, rawData = {}) {
  const sr = { ...(d.strollerRide || {}), ...(rawData.strollerRide || {}) };
  const loc = location || {};
  const childName = sr.srChildName || d._derived?.childName || "";
  const parentName =
    sr.srPrintName ||
    d.financial?.responsibleParty ||
    d.signatures?.mother ||
    [d.mother?.firstName, d.mother?.mi, d.mother?.lastName].filter(Boolean).join(" ").trim();

  const permYes = isTruthy(sr.srPermYes);
  const permNo = isTruthy(sr.srPermNo);
  const hasSignature = !!(sr.srSignature || d.signatures?.mother);

  let permissionYes = permYes;
  let permissionNo = permNo;
  if (!permissionYes && !permissionNo && hasSignature) {
    permissionYes = true;
  }

  return {
    childName,
    childDob: sr.srChildDob || d.child?.dob || "",
    centerLocation: sr.srCenterLocation || loc.legalName || loc.name || "Angel Learning Center",
    healthInfo: sr.srHealthInfo,
    clothingItems: sr.srClothingItems,
    permissionYes,
    permissionNo,
    signature: sr.srSignature || d.signatures?.mother,
    signDate: sr.srSignDate || d.signatures?.date,
    printName: sr.srPrintName || parentName,
    directorSignature: sr.srDirectorSignature,
    directorDate: sr.srDirectorDate,
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
        <View style={[s.metaCell, s.metaCellLast]}>
          <Text style={s.metaLabel}>Center Location:</Text>
          <Text style={s.metaValue}>{val(fields.centerLocation) || " "}</Text>
        </View>
      </View>
    </View>
  );
}

export function StrollerRidePage1({ d, location = {}, raw = {} }) {
  const fields = getStrollerRideFields(d, location, raw);

  return (
    <Page size="LETTER" style={s.page} wrap>
      <View style={s.logoRow}>
        <Image style={s.logo} src={getLogoUrl()} />
      </View>
      <Text style={s.title}>Infant Stroller Ride and Child Nature Walk Permission</Text>
      <Text style={s.subtitle}>On Site Outdoor Experience</Text>

      <MetaGrid fields={fields} />

      <Text style={s.sectionTitle}>Activity Description</Text>
      <Text style={s.body}>
        Infants may participate in supervised stroller rides and older children in age-appropriate nature walks on Angel
        Learning Center property. The planned route may include designated sidewalks, the area around the building, and
        the approved perimeter of the Center parking lot. Children will not be taken onto public roads or away from
        Center property under this permission.
      </Text>
      <Text style={s.body}>
        The purpose of the activity is to provide fresh air, movement, sensory experiences, and opportunities to observe
        age-appropriate features of nature, such as trees, leaves, flowers, birds, clouds, and changing weather. Infants
        will remain in the stroller unless staff move them to another approved on-site area for a planned and directly
        supervised activity.
      </Text>

      <Text style={s.sectionTitle}>Safety and Supervision Practices</Text>
      <Bullet>
        Staff will follow required staff-to-child ratios and maintain active sight-and-sound supervision throughout the
        activity.
      </Bullet>
      <Bullet>
        Staff will complete name-to-face attendance checks before leaving the classroom, during transitions, when arriving
        at the activity area, before returning, and immediately after re-entering the Center.
      </Bullet>
      <Bullet>
        Each infant will be placed in an age-appropriate stroller seat and secured with the stroller’s restraint system.
        Stroller brakes will be used whenever the stroller is stopped, and the stroller will not be left unattended.
      </Bullet>
      <Bullet>
        Staff will use only the Center-approved route and will remain alert for moving vehicles, uneven pavement, heat,
        insects, landscaping equipment, standing water, and other hazards. The activity will be delayed, rerouted, or
        ended if conditions are unsafe.
      </Bullet>
      <Bullet>
        Walks will occur only during suitable weather and temperature conditions. Staff will monitor children for
        overheating, chilling, breathing difficulty, allergic reactions, discomfort, or other signs of distress and will
        return indoors when needed.
      </Bullet>
      <Bullet>
        Children will not be permitted to place plants, leaves, rocks, insects, or other outdoor materials in their
        mouths. Staff will prevent contact with unknown plants, chemicals, animal waste, and other unsafe items.
      </Bullet>
      <Bullet>
        Staff will carry required attendance and emergency information and will follow Center emergency and first-aid
        procedures if a child becomes ill, is injured, or experiences distress.
      </Bullet>
      <Bullet>
        Appropriate clothing and sun protection will be used according to weather conditions and the Center’s policies. Any
        sunscreen or insect repellent will be applied only when separately authorized by the parent and permitted by
        Center policy.
      </Bullet>

      <Text style={s.sectionTitle}>Parent Information and Instructions</Text>
      <Text style={[s.body, { marginBottom: 4 }]}>
        Please identify any medical condition, allergy, mobility concern, temperature sensitivity, respiratory concern,
        skin sensitivity, or other restriction that staff should consider before your child participates.
      </Text>
      <View style={s.commTable}>
        <CommRow label="Health information, restrictions, or special instructions:" value={fields.healthInfo} />
        <CommRow
          label="Clothing or comfort items requested by parent:"
          value={fields.clothingItems}
          alt
        />
      </View>

      <PdfFooter />
    </Page>
  );
}

export function StrollerRidePage2({ d, location = {}, raw = {} }) {
  const fields = getStrollerRideFields(d, location, raw);

  return (
    <Page size="LETTER" style={s.page} wrap>
      <Text style={s.sectionTitle}>Permission Selection</Text>
      <Text style={[s.body, { marginBottom: 6 }]}>
        {fields.permissionNo
          ? "I do not give permission for my child to participate in stroller rides or nature walks outside the Center building."
          : fields.permissionYes
            ? "I give permission for my child to participate in recurring supervised stroller rides and nature walks on Center property, including the approved route around the building and parking-lot perimeter."
            : " "}
      </Text>

      <Text style={[s.sectionTitle, { marginTop: 8 }]}>Parent or Guardian Authorization</Text>
      <Text style={[s.body, { marginBottom: 10 }]}>
        I understand the nature and location of the activity and the safety practices described above. I understand that
        this permission applies only to supervised on-site stroller rides and nature walks and is not permission for
        transportation or an off-site field trip. I agree to notify the Center in writing of changes to my child’s
        health, restrictions, or participation. I understand that I may withdraw this permission in writing at any
        time.
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
        dateLabel="Date Received:"
      />

      <Text style={s.footerNote}>Place the completed and signed form in the child’s file.</Text>

      <PdfFooter />
    </Page>
  );
}
