import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { formatPdfValue, getLogoUrl, PdfSignatureOnLine } from "./PdfShared";
import ALC_CONFIG from "../config";

const REGISTRATION_FEE = `$${Number(ALC_CONFIG.waitlist?.registrationFee ?? 150).toFixed(2)}`;

const BLUE = "#1e4d8c";
const ORANGE = "#e8651a";
const INK = "#333333";
const MUTED = "#666666";
const LABEL_BG = "#dceaf7";
const TODAY = new Date().toISOString().slice(0, 10);

const s = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingBottom: 36,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
    fontSize: 8,
    color: INK,
    lineHeight: 1.28,
  },
  titleRow: {
    position: "relative",
    marginBottom: 4,
    minHeight: 32,
  },
  titleBlock: { paddingRight: 108 },
  mainTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: BLUE,
    letterSpacing: 0.4,
  },
  centerName: {
    fontSize: 10,
    fontWeight: "bold",
    color: ORANGE,
    marginTop: 1,
  },
  logo: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 100,
    height: 28,
    objectFit: "contain",
  },
  colorBar: { flexDirection: "row", height: 4, marginBottom: 8 },
  barOrange: { flex: 1, backgroundColor: ORANGE },
  barBlue: { flex: 1, backgroundColor: "#4a90c4" },
  barGreen: { flex: 1, backgroundColor: "#6ab04c" },
  barNavy: { flex: 1, backgroundColor: BLUE },
  intro: {
    fontSize: 7.5,
    color: MUTED,
    marginBottom: 8,
    textAlign: "justify",
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: BLUE,
    marginTop: 7,
    marginBottom: 4,
    borderBottomWidth: 0.8,
    borderBottomColor: BLUE,
    paddingBottom: 2,
  },
  bulletRow: { flexDirection: "row", marginBottom: 3, paddingRight: 4 },
  bulletDot: { width: 8, color: ORANGE, fontSize: 8, fontWeight: "bold" },
  bulletText: { flex: 1, fontSize: 7.5, textAlign: "justify" },
  bold: { fontWeight: "bold" },
  table: { borderWidth: 0.8, borderColor: "#999", marginBottom: 7 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.8,
    borderBottomColor: "#ccc",
    minHeight: 22,
    alignItems: "center",
  },
  tableLabel: {
    width: "40%",
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 8,
    fontWeight: "bold",
    color: BLUE,
    backgroundColor: LABEL_BG,
    borderRightWidth: 0.8,
    borderRightColor: "#ccc",
  },
  tableValue: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 8,
    color: "#0645AD",
  },
  tableTotalLabel: {
    width: "40%",
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 8,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: BLUE,
    borderRightWidth: 0.8,
    borderRightColor: "#ccc",
  },
  tableTotalValue: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 8,
    fontWeight: "bold",
    color: "#0645AD",
    backgroundColor: "#e8f5e9",
  },
  noticeBox: {
    borderWidth: 1.2,
    borderColor: ORANGE,
    backgroundColor: "#fffaf5",
    padding: 6,
    marginBottom: 7,
  },
  noticeText: {
    fontSize: 7,
    color: ORANGE,
    fontWeight: "bold",
    textAlign: "justify",
    lineHeight: 1.25,
  },
  body: { fontSize: 7.5, marginBottom: 6, textAlign: "justify" },
  childRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 6,
    gap: 8,
  },
  childField: { flexDirection: "row", alignItems: "flex-end", flex: 1 },
  childFieldShort: { flexDirection: "row", alignItems: "flex-end", width: 130 },
  fieldLabel: { fontSize: 8, marginRight: 3, flexShrink: 0 },
  fieldLine: {
    flex: 1,
    borderBottomWidth: 0.8,
    borderBottomColor: "#333",
    minHeight: 11,
    paddingBottom: 1,
  },
  fieldValue: { fontSize: 8, color: "#0645AD" },
  sigSection: { marginTop: 4 },
  sigParentLabel: { fontSize: 8, fontWeight: "bold", marginBottom: 3 },
  sigRow: { flexDirection: "row", marginBottom: 8, gap: 6 },
  sigCol: { flex: 1 },
  sigLine: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#333",
    minHeight: 12,
    marginBottom: 1,
  },
  sigHint: { fontSize: 6.5, color: MUTED, fontStyle: "italic", textAlign: "center" },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    paddingTop: 5,
    fontSize: 7,
    color: MUTED,
  },
});

function val(v) {
  return formatPdfValue(v);
}

function fullName(first, mi, last) {
  return [first, mi, last].filter(Boolean).join(" ").trim();
}

function SignatureRow({ title, printName, signature, date }) {
  return (
    <View style={s.sigSection}>
      <Text style={s.sigParentLabel}>{title}</Text>
      <View style={s.sigRow}>
        <View style={s.sigCol}>
          <View style={s.sigLine}>
            <Text style={s.fieldValue}>{val(printName) || " "}</Text>
          </View>
          <Text style={s.sigHint}>Printed Name</Text>
        </View>
        <View style={s.sigCol}>
          <PdfSignatureOnLine value={signature} lineStyle={{ minHeight: 14 }} />
          <Text style={s.sigHint}>Signature</Text>
        </View>
        <View style={[s.sigCol, { flex: 0.7 }]}>
          <View style={s.sigLine}>
            <Text style={s.fieldValue}>{val(date) || " "}</Text>
          </View>
          <Text style={s.sigHint}>Date</Text>
        </View>
      </View>
    </View>
  );
}

/** Standalone waitlist agreement page — matches official template layout. */
export function WaitlistAgreementPdf({ data = {}, location = {} }) {
  const en = data.enrollment || {};
  const loc = location || {};
  const centerName = loc.legalName || loc.name || "ANGEL LEARNING CENTER";

  return (
    <Document>
      <Page size="LETTER" style={s.page} wrap>
        <View style={s.titleRow}>
          <View style={s.titleBlock}>
            <Text style={s.mainTitle}>WAITLIST AGREEMENT</Text>
            {/* <Text style={s.centerName}>{val(centerName)}</Text> */}
          </View>
          <Image style={s.logo} src={getLogoUrl()} />
        </View>

        <View style={s.colorBar}>
          <View style={s.barOrange} />
          <View style={s.barBlue} />
          <View style={s.barGreen} />
          <View style={s.barNavy} />
        </View>

        <Text style={s.intro}>
          The purpose of this document is to provide an understanding of the waitlist process. When accepted, this
          document constitutes a binding agreement, please read it thoroughly, and sign at the bottom of the agreement.
        </Text>

        <Text style={s.sectionTitle}>WAITLIST TERMS</Text>
        <View style={s.bulletRow}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>
            Parents enrolling their child on the waitlist will be required to pay a{" "}
            <Text style={s.bold}>registration fee and first week's tuition.</Text>
          </Text>
        </View>
        <View style={s.bulletRow}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>
            We will do our best to find a place for your child; however, placement on the waitlist is{" "}
            <Text style={s.bold}>not a guarantee of enrollment</Text> at the requested time, with a specific age group,
            or for a specific start date. <Text style={s.bold}>Tuition rates are subject to change</Text>, the rate at
            the time of completing the waitlist agreement may not reflect the rate at the time of enrollment and/or
            attendance.
          </Text>
        </View>
        <View style={s.bulletRow}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>
            In order to be added to the waitlist, parents and the Center must jointly come to the determination on a
            specific date which corresponds to the amount of time that they are willing to remain on the waitlist before
            dropping off the waitlist. After the specified date, if the program is full and the child is unable to be
            enrolled, the child will be removed from the waitlist and will be{" "}
            <Text style={s.bold}>refunded the first week's tuition.</Text>
          </Text>
        </View>
        <View style={s.bulletRow}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>
            If your child is offered a place in the program within the time period that s/he is actively on the
            waitlist and you decline the spot, you agree to{" "}
            <Text style={s.bold}>forfeit the registration and first week's tuition.</Text>
          </Text>
        </View>
        <View style={s.bulletRow}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>
            <Text style={s.bold}>Rates are subject to change</Text> and may be different depending on when/if you are
            able to enroll, and at which location you are enrolling.
          </Text>
        </View>

        <Text style={s.sectionTitle}>ENROLLMENT &amp; PAYMENT DETAILS</Text>
        <View style={s.table}>
          <View style={s.tableRow}>
            <Text style={s.tableLabel}>Tentative Start Date</Text>
            <Text style={s.tableValue}>Date: {val(en.wlEnrollmentGoalDate) || " "}</Text>
          </View>
          <View style={s.tableRow}>
            <Text style={s.tableLabel}>Waitlist Deadline</Text>
            <Text style={s.tableValue}>Date: {val(en.wlDeadlineDate) || " "}</Text>
          </View>
          <View style={[s.tableRow, { borderBottomWidth: 0 }]}>
            <Text style={[s.tableLabel, ]}>Registration Fee</Text>
            <Text style={[s.tableValue, s.bold, { color: "#000" }]}>{REGISTRATION_FEE}</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>IMPORTANT PLACEMENT &amp; REFUND NOTICE</Text>
        <View style={s.noticeBox}>
          <Text style={s.noticeText}>
            SPACE IS LIMITED AND BASED ON A FIRST COME, FIRST SERVED BASIS. THE REGISTRATION FEE AND FIRST WEEK'S
            TUITION IS REQUIRED TO SECURE YOUR CHILD'S PLACE ON THE WAITLIST. IF NO SPOT IS AVAILABLE BY THE WAITLIST
            DEADLINE INDICATED ABOVE, YOUR CHILD WILL BE REMOVED FROM THE WAITLIST AND THE FIRST WEEK'S TUITION WILL
            BE REFUNDED.
          </Text>
        </View>

        <Text style={s.sectionTitle}>PARENT/GUARDIAN ACKNOWLEDGMENT</Text>
        <Text style={s.body}>
          I am very interested in adding my child(ren) to the waiting list for enrollment. I agree to pay the
          registration fee and first week's tuition upfront, and I understand that failure to do so will result in
          removal from the waitlist. I understand that if I withdraw my child from the waitlist prior to the deadline
          indicated above or decline a spot in the program after signing this agreement, I will not receive a refund
          for any payments for fees.
        </Text>

        <Text style={s.sectionTitle}>PARENT/GUARDIAN SIGNATURES</Text>
        <SignatureRow
          title="Parent/Guardian 1"
          printName={en.wlParent1PrintName || fullName(en.momFirst, en.momMI, en.momLast)}
          signature={en.wlParent1Signature || fullName(en.momFirst, en.momMI, en.momLast)}
          date={en.wlParent1SignDate || TODAY}
        />
        <SignatureRow
          title="Parent/Guardian 2"
          printName={en.wlParent2PrintName || fullName(en.dadFirst, en.dadMI, en.dadLast)}
          signature={en.wlParent2Signature || fullName(en.dadFirst, en.dadMI, en.dadLast)}
          date={en.wlParent2SignDate || TODAY}
        />

        <View style={s.footer} fixed>
          <Text> WAITLIST AGREEMENT</Text>
          <Text render={({ pageNumber, totalPages }) => `PAGE ${pageNumber} OF ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );  
}

export default WaitlistAgreementPdf;
