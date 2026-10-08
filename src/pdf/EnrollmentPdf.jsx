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
import { normalizeChildGender, programSelectionLabel } from "../utils/formValues";
import ALC_CONFIG from "../config";
import { formatPdfValue } from "./PdfShared";

export function EnrollmentPdf({ data = {}, location = {} }) {
  const en = data.enrollment || {};
  const programsStr = programSelectionLabel(en.programs, ALC_CONFIG.programs);
  const mealsStr = [
    en.mealBreakfast && "Breakfast",
    en.mealLunch && "Lunch",
    en.mealSnack && "PM Snack",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Document>
      <Page size="LETTER" style={pdfStyles.page}>
        <PdfHeader
        />
        <Text style={pdfStyles.mainTitle}>
          {"Angel Learning Center Enrollment Form"}
        </Text>
        {/* Start Date row */}
        <View
          style={{
            width: 180,
            alignSelf: "flex-end",
            marginBottom: 6,
            backgroundColor:"Black"
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <Text style={pdfStyles.fieldLabel}>Start Date:</Text>
            <Text style={{ marginLeft: 5, color: "#0645AD" }}>
              {formatPdfValue(en.startDate) || ""}
            </Text>
          </View>

          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "#333",
              marginTop: 2,
            }}
          />
        </View>

        {/* Child's Information */}
        <PdfSectionTitle title="Child’s Information" />
        <View style={pdfStyles.formRow}>
          <FormField label="First Name" value={en.childFirst} flex={4} />
          <FormField label="M.I." value={en.childMI} flex={1} />
          <FormField label="Last Name" value={en.childLast} flex={4} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Name child prefers to be called" value={en.childPreferred} flex={1} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Gender" value={normalizeChildGender(en.childGender)} flex={2} />
          <FormField label="Date of Birth" value={en.childDob} flex={3} />
          <FormField label="Child’s SSN" value="" flex={3} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Address" value={en.childAddress} flex={1} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="City" value={en.childCity} flex={3} />
          <FormField label="Zip code" value={en.childZip} flex={2} />
        </View>

        <View style={{ marginTop: 2, marginBottom: 4 }}>
          <Text style={pdfStyles.fieldLabel}>
            List any existing medical conditions, medication and/or special attention your child may require?
          </Text>
          <View style={[pdfStyles.underlineValue, { marginTop: 2, minHeight: 14 }]}>
            <Text>{en.medicalNotes || ""}</Text>
          </View>
        </View>

        {/* Mother/Guardian */}
        <PdfSectionTitle title="Mother/Guardian" />
        <View style={pdfStyles.formRow}>
          <FormField label="First Name" value={en.momFirst} flex={4} />
          <FormField label="M.I." value={en.momMI} flex={1} />
          <FormField label="Last Name" value={en.momLast} flex={4} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Address" value={en.childAddress} flex={1} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="City" value={en.childCity} flex={3} />
          <FormField label="Zip code" value={en.childZip} flex={2} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Home Phone" value="" flex={3} />
          <FormField label="Cell Phone" value={en.momCell} flex={3} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Employed By" value={en.momEmployer} flex={3} />
          <FormField label="Occupation" value={en.momOccupation} flex={3} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Work Phone" value="" flex={3} />
          <FormField label="Work Hours" value="" flex={3} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Work Address" value={en.momWorkAddress} flex={1} />
        </View>

        <View style={pdfStyles.formRow}>
          <CheckboxField label="Custodial Parent (If married, mark both parents)" checked={!!en.momCustodial} />
          <FormField label="Mother’s SSN" value="" flex={2} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Email" value={en.momEmail} flex={3} />
          <FormField label="Driver’s License #" value="" flex={2} />
          <FormField label="Birthday" value="" flex={2} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Marital Status" value={en.momMarital} flex={1} />
        </View>

        {/* Father/Guardian */}
        <PdfSectionTitle title="Father/Guardian" />
        <View style={pdfStyles.formRow}>
          <FormField label="First Name" value={en.dadFirst} flex={4} />
          <FormField label="M.I." value={en.dadMI} flex={1} />
          <FormField label="Last Name" value={en.dadLast} flex={4} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Address" value={en.childAddress} flex={1} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="City" value={en.childCity} flex={3} />
          <FormField label="Zip code" value={en.childZip} flex={2} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Home Phone" value="" flex={3} />
          <FormField label="Cell Phone" value={en.dadCell} flex={3} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Employed By" value={en.dadEmployer} flex={3} />
          <FormField label="Occupation" value={en.dadOccupation} flex={3} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Work Phone" value="" flex={3} />
          <FormField label="Work Hours" value="" flex={3} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Work Address" value={en.dadWorkAddress} flex={1} />
        </View>

        <View style={pdfStyles.formRow}>
          <CheckboxField label="Custodial Parent (If married, mark both parents)" checked={!!en.dadCustodial} />
          <FormField label="Father’s SSN" value="" flex={2} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Email" value={en.dadEmail} flex={3} />
          <FormField label="Driver’s License #" value="" flex={2} />
          <FormField label="Birthday" value="" flex={2} />
        </View>

        <View style={pdfStyles.formRow}>
          <FormField label="Marital Status" value={en.dadMarital} flex={1} />
        </View>

        {/* Tuition & Schedule */}
        <PdfSectionTitle title="Tuition & Care Schedule" />
        <View style={pdfStyles.formRow}>
          <FormField label="Current Tuition Amount" value="" flex={2} />
          <FormField label="Programs" value={programsStr} flex={3} />
          <FormField label="Center" value={location?.name || en.enLocation} flex={2} />
        </View>
        <View style={pdfStyles.formRow}>
          <FormField label="Care Schedule" value={`${en.careFrom || "—"} to ${en.careTo || "—"}`} flex={2} />
          <FormField label="Meals Provided" value={mealsStr || "—"} flex={3} />
        </View>

        <View break />
        {/* Emergency Contacts */}
        <PdfSectionTitle title="Emergency Contacts (Authorized Pickup — ID Required)" />
        <View style={pdfStyles.formRow}>
          <FormField label="Contact 1 Name" value={en.ec1Name}   />
          <FormField label="Relationship" value={en.ec1Rel}   />
        </View>
        <View style={pdfStyles.formRow}>
          <FormField label="Cell" value={en.ec1Cell} flex={2} />
          <FormField label="Home/Work" value={[en.ec1Home, en.ec1Work].filter(Boolean).join(" / ")} flex={2} />
        </View>
        <View style={pdfStyles.formRow}>
          <FormField label="Address" value={en.ec1Address} flex={1} />
        </View>
        <View style={pdfStyles.formRow}>
          <FormField label="Contact 2 Name" value={en.ec2Name} flex={3} />
          <FormField label="Relationship" value={en.ec2Rel} flex={2} />
        </View>
        <View style={pdfStyles.formRow}>

          <FormField label="Cell" value={en.ec2Cell} flex={2} />
          <FormField label="Home/Work" value={[en.ec2Home, en.ec2Work].filter(Boolean).join(" / ")} flex={2} />
        </View>
        <View style={pdfStyles.formRow}>
          <FormField label="Address" value={en.ec2Address} flex={1} />
        </View>
        <PdfFooter />
      </Page>
    </Document >
  );
}

export default EnrollmentPdf;
