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

export function PhotoPdf({ data = {}, location = {} }) {
  const ph = data.photo || {};
  const enrollment = data.enrollment || {};
  const printName =
    resolveResponsiblePartyName({ rpName: ph.photoPrint }, enrollment) || ph.photoPrint;
  const signature =
    resolveResponsiblePartyName({ rpName: ph.photoSignature }, enrollment) || ph.photoSignature;

  return (
    <Document>
      <Page size="LETTER" style={pdfStyles.page}>
        <PdfHeader
          title="Photo / Video Permission Form"
          location={location}
        />

        <PdfSectionTitle title="Permission Authorization" />
        <Text style={[pdfStyles.legalParagraph, { marginTop: 4, marginBottom: 10 }]}>
          I understand that Angel Learning Center may take photographs and/or video of children during normal program activities, special events, and classroom learning. These images may be used for classroom displays, center communications to enrolled families, the center website or social media, and marketing materials, unless limited below.
        </Text>

        <PdfSectionTitle title="Photo / video permission" />
        <View style={pdfStyles.formRow}>
          <FormField
            label="Selection"
            value={
              ph.photoNone
                ? "None"
                : ph.photoClassroom || ph.photoFamily || ph.photoWeb || ph.photoMarketing
                  ? "All listed uses"
                  : ""
            }
            flex={1}
          />
        </View>

        <PdfSectionTitle title="Child & Parent Acknowledgment" />
        <View style={pdfStyles.formRow}>
          <FormField label="Child’s Full Name" value={ph.photoChild} flex={1} />
        </View>

        <View style={pdfStyles.formRow}>
          <CheckboxField
            label="I have read this Photo / Video Permission form and my choices above are correct."
            checked={!!ph.photoAgree}
          />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Printed Name" value={printName} flex={3} />
          <FormField label="Date" value={ph.photoDate} flex={2} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Parent / Guardian Signature" value={signature} flex={1} />
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}

export default PhotoPdf;
