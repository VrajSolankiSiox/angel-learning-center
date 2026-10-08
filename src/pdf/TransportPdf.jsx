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
import { transportDirectionLabel, transportSchoolLabel, transportWhenLabel } from "../utils/formValues";
import ALC_CONFIG from "../config";

export function TransportPdf({ data = {}, location = {} }) {
  const tr = data.transport || {};
  if (!tr.trChild && !tr.trSignature) return null;

  return (
    <Document>
      <Page size="LETTER" style={pdfStyles.page}>
        <PdfHeader
          title="Transportation Agreement Form"
          location={location}
        />

        <PdfSectionTitle title="Child & Route Details" />
        <View style={pdfStyles.formRow}>
          <FormField label="Name of Child" value={tr.trChild} flex={3} />
          <FormField label="ALC Location" value={location?.name || tr.trLocation} flex={2} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField
            label="Selected School"
            value={transportSchoolLabel(tr.trLocation || location?.id, tr.trSchoolChoice, ALC_CONFIG.transport?.schools)}
            flex={3}
          />
          <FormField label="Approx. Miles" value={tr.trMiles} flex={1} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="School Address" value={tr.trSchoolAddress} flex={1} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Direction" value={transportDirectionLabel(tr.trDirection)} flex={2} />
          <FormField label="When" value={transportWhenLabel(tr.trWhen)} flex={2} />
          <FormField label="Pickup Time" value={tr.trPickupTime} flex={2} />
          <FormField label="Arrive Time" value={tr.trArriveTime} flex={2} />
        </View>

        <PdfSectionTitle title="Days of Transportation" />
        <View style={pdfStyles.formRow}>
          <FormField
            label="Selected days"
            value={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
              .filter((_, index) => tr[["trMon", "trTue", "trWed", "trThu", "trFri"][index]])
              .join(", ")}
            flex={1}
          />
        </View>

        <PdfSectionTitle title="Staff Authorization & Signature" />
        <View style={pdfStyles.formRow}>
          <CheckboxField
            label="Angel Learning Center staff is authorized to transport my child."
            checked={!!tr.trStaffAuth}
          />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Parent / Guardian Signature" value={tr.trSignature} flex={3} />
          <FormField label="Date" value={tr.trDate} flex={2} />
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}

export default TransportPdf;
