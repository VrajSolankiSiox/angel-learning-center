import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import {
  pdfStyles,
  PdfHeader,
  PdfFooter,
  PdfSectionTitle,
  FormField,
  CheckboxField,
} from "./PdfShared";
import { resolveResponsiblePartyName } from "../utils/formValues";

const LEGAL_TEXT = [
  "Financial responsibility. I acknowledge that I am the individual legally and financially responsible for payment of all tuition, registration fees, late fees, returned payment fees, activity fees, and any other charges incurred for my child's enrollment at Angel Learning Center. I understand that tuition is due regardless of my child's attendance unless otherwise provided in the Center's written policies.",
  "Failure to Pay. Failure to pay may result in Angel Learning Center's right to: (1) Assess applicable late fees and returned payment fees in accordance with Center policy; (2) Suspend or terminate childcare services until the account is brought current; (3) Refuse future enrollment while any balance remains unpaid; (4) Refer the account to a collection agency; (5) File a civil action in a Georgia court, including Magistrate (Small Claims) Court where permitted by law, to recover any unpaid balance; (6) Seek recovery of court filing fees, service fees, post-judgment interest, and any other amounts recoverable under Georgia law.",
  "Contact information. I agree to keep my mailing address, email address, telephone number, and employer information current and notify the Center within five (5) business days of any changes.",
  "Acknowledgment. I certify that the information provided above is true and correct. I have read this Agreement, understand my financial obligations, and voluntarily agree to be personally responsible for all amounts owed to Angel Learning Center. I understand that this Agreement is a legally binding contract and may be used as evidence in any collection or legal proceeding arising from unpaid tuition or fees.",
];

export function FinancialAgreementPage({ data = {}, location = {} }) {
  const fin = data.financial || {};
  const enrollment = data.enrollment || {};
  const responsibleName = resolveResponsiblePartyName(fin, enrollment) || fin.rpName;
  const printName =
    resolveResponsiblePartyName({ rpName: fin.finPrintName }, enrollment) || fin.finPrintName || responsibleName;
  const signature =
    resolveResponsiblePartyName({ rpName: fin.finSignature }, enrollment) || fin.finSignature || responsibleName;

  return (
      <Page size="LETTER" style={pdfStyles.page}>
        <PdfHeader
          title="Financial Responsibility & Tuition Agreement"
          location={location}
        />

        <PdfSectionTitle title="Responsible Party" />
        <View style={pdfStyles.formRow}>
          <FormField label="Full Legal Name" value={responsibleName} flex={4} />
          <FormField label="Date of Birth" value={fin.rpDob} flex={2} />
        </View>
        <View style={pdfStyles.formRow}>
          <FormField label="Driver’s License / State ID" value={fin.rpDl} flex={2} />
          <FormField label="State" value={fin.rpState} flex={1} />
          <FormField label="Employer" value={fin.rpEmployer} flex={3} />
        </View>
        <View style={pdfStyles.formRow}>
          <FormField label="Home Address" value={fin.rpAddress} flex={3} />
          <FormField label="City / State / ZIP" value={fin.rpCityStateZip} flex={2} />
        </View>
        <View style={pdfStyles.formRow}>
          <FormField label="Phone" value={fin.rpPhone} flex={2} />
          <FormField label="Email" value={fin.rpEmail} flex={3} />
        </View>

        {fin.rp2Name ? (
          <View wrap={false}>
            <PdfSectionTitle title="Second Responsible Party (Optional)" />
            <View style={pdfStyles.formRow}>
              <FormField label="Full Legal Name" value={fin.rp2Name} flex={4} />
              <FormField label="Date of Birth" value={fin.rp2Dob} flex={2} />
            </View>
            <View style={pdfStyles.formRow}>
              <FormField label="Driver’s License / State ID" value={fin.rp2Dl} flex={2} />
              <FormField label="State" value={fin.rp2State} flex={1} />
              <FormField label="Employer" value={fin.rp2Employer} flex={3} />
            </View>
            <View style={pdfStyles.formRow}>
              <FormField label="Home Address" value={fin.rp2Address} flex={3} />
              <FormField label="City / State / ZIP" value={fin.rp2CityStateZip} flex={2} />
            </View>
            <View style={pdfStyles.formRow}>
              <FormField label="Phone" value={fin.rp2Phone} flex={2} />
              <FormField label="Email" value={fin.rp2Email} flex={3} />
            </View>
          </View>
        ) : null}

        <View style={[pdfStyles.formRow, { marginTop: 4 }]}>
          <FormField label="Enrolled Child" value={fin.finChildName} flex={3} />
          <FormField label="Enrollment Date" value={fin.finEnrollDate} flex={2} />
        </View>

        <PdfSectionTitle title="Tuition Agreement Terms" />
        {LEGAL_TEXT.map((para, idx) => (
          <Text key={idx} style={pdfStyles.legalParagraph}>
            {para}
          </Text>
        ))}

        <View wrap={false} style={{ marginTop: 6 }}>
          <PdfSectionTitle title="Acknowledgment & Signature" />
          <View style={pdfStyles.formRow}>
            <CheckboxField
              label="I have read and agree to all financial terms and obligations"
              checked={!!fin.finAgree}
            />
          </View>
          <View style={pdfStyles.formRow}>
            <FormField label="Printed Name" value={printName} flex={3} />
            <FormField label="Date" value={fin.finSignDate} flex={2} />
          </View>
          <View style={pdfStyles.formRow}>
            <FormField label="E-Signature" value={signature} flex={1} />
          </View>
        </View>

        <PdfFooter />
      </Page>
  );
}

export function FinancialPdf({ data = {}, location = {} }) {
  return (
    <Document>
      <FinancialAgreementPage data={data} location={location} />
    </Document>
  );
}

export default FinancialPdf;
