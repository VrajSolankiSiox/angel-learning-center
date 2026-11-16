import React, { useState, useEffect } from "react";
import { useEnrollment } from "../context/EnrollmentContext";
import { useFormDraft } from "../hooks/useFormDraft";
import { completeFormAndGo } from "../utils/formNext";

export function EmergencyView() {
  const { state, saveForm, applyCarryForward, activeLocation, t, navigateTo } = useEnrollment();

  const savedData = state.data?.emergency || {};

  const [formData, setFormData] = useState({
    emChild: savedData.emChild || "",
    emDob: savedData.emDob || "",
    emAddress: savedData.emAddress || "",
    emFather: savedData.emFather || "",
    emMother: savedData.emMother || "",
    emFatherCell: savedData.emFatherCell || "",
    emMotherCell: savedData.emMotherCell || "",
    emAltName: savedData.emAltName || "",
    emAltPhone: savedData.emAltPhone || "",
    emDoctor: savedData.emDoctor || "",
    emDoctorPhone: savedData.emDoctorPhone || "",
    emFacility: savedData.emFacility || activeLocation?.hospital || "",
    emAllergies: savedData.emAllergies || "",
    emMeds: savedData.emMeds || "",
    emSpecial: savedData.emSpecial || "",
    emAuthChild: savedData.emAuthChild || "",
    emDate: savedData.emDate || "",
    emSignature: savedData.emSignature || "",
  });

  useEffect(() => {
    applyCarryForward({ force: false, onlyForm: "emergency" });
  }, [applyCarryForward]);

  useEffect(() => {
    const em = state.data?.emergency || {};
    setFormData((prev) => ({
      ...prev,
      ...em,
      emFacility: em.emFacility || activeLocation?.hospital || "",
    }));
  }, [state.data?.emergency, activeLocation?.hospital]);

  useFormDraft("emergency", formData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = (e) => {
    completeFormAndGo({
      event: e,
      saveForm,
      formId: "emergency",
      getPayload: () => formData,
      navigateTo,
      target: "handbook",
    });
  };

  const showPrefillNotice = !!(
    state.data?.enrollment?.childFirst ||
    state.data?.enrollment?.momFirst ||
    state.data?.enrollment?.dadFirst
  );

  return (
    <section id="view-emergency" className="view is-active">
      <form className="form-shell" data-form="emergency" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="page-head">
          <a
            href="#packet"
            className="back"
            data-nav="packet"
            data-i18n="backPacket"
            onClick={(e) => {
              e.preventDefault();
              navigateTo("packet");
            }}
          >
            {t("backPacket") || "← Back to packet"}
          </a>
          <p className="eyebrow" data-i18n="form4">
            {t("form4") || "Form 4 of 5"}
          </p>
          <h2 data-i18n="emergencyTitle">
            {t("emergencyTitle") || "Vehicle Emergency Medical Information"}
          </h2>
          <p className="section-lead" data-i18n="emergencyLead">
            {t("emergencyLead") || "Contacts, doctor, allergies, and emergency medical authorization."}
          </p>
          {showPrefillNotice ? (
            <p className="prefill-notice">
              Name, address, and contact fields were filled from the Enrollment form so you don’t retype them. Edit anything that needs changes.
            </p>
          ) : null}
        </div>

        <fieldset>
          <legend data-i18n="child">{t("child") || "Child"}</legend>
          <div className="grid-2">
            <label>
              <span data-i18n="childName">{t("childName") || "Child’s name"}</span>
              <input name="emChild" value={formData.emChild} onChange={handleChange} required />
            </label>
            <label>
              <span data-i18n="dob">{t("dob") || "Date of birth"}</span>
              <input type="date" name="emDob" value={formData.emDob} onChange={handleChange} />
            </label>
          </div>
          <label>
            <span data-i18n="address">{t("address") || "Address"}</span>
            <input name="emAddress" value={formData.emAddress} onChange={handleChange} />
          </label>
        </fieldset>

        <fieldset>
          <legend data-i18n="parents">{t("parents") || "Parents"}</legend>
          <div className="grid-2">
            <label>
              <span data-i18n="fatherName">{t("fatherName") || "Father’s name"}</span>
              <input name="emFather" value={formData.emFather} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="motherName">{t("motherName") || "Mother’s name"}</span>
              <input name="emMother" value={formData.emMother} onChange={handleChange} />
            </label>
          </div>
          <div className="grid-2">
            <label>
              Father cell phone number
              <input type="tel" name="emFatherCell" value={formData.emFatherCell} onChange={handleChange} />
            </label>
            <label>
              Mother cell phone number
              <input type="tel" name="emMotherCell" value={formData.emMotherCell} onChange={handleChange} />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend data-i18n="emergencyMedical">{t("emergencyMedical") || "Emergency & medical"}</legend>
          <div className="grid-2">
            <label>
              <span data-i18n="altContact">
                {t("altContact") || "Emergency contact (if parents unreachable)"}
              </span>
              <input name="emAltName" value={formData.emAltName} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="phone">{t("phone") || "Phone"}</span>
              <input type="tel" name="emAltPhone" value={formData.emAltPhone} onChange={handleChange} />
            </label>
          </div>
          <div className="grid-2">
            <label>
              <span data-i18n="doctor">{t("doctor") || "Child’s doctor"}</span>
              <input name="emDoctor" value={formData.emDoctor} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="doctorPhone">{t("doctorPhone") || "Doctor phone"}</span>
              <input type="tel" name="emDoctorPhone" value={formData.emDoctorPhone} onChange={handleChange} />
            </label>
          </div>
          <label>
            <span data-i18n="facility">
              {t("facility") || "Default emergency facility (from Parent Handbook — editable)"}
            </span>
            <input
              name="emFacility"
              id="emFacility"
              placeholder="Auto-fills from selected center"
              value={formData.emFacility}
              onChange={handleChange}
            />
          </label>
          <label>
            <span data-i18n="allergies">{t("allergies") || "Child’s allergies"}</span>
            <textarea
              name="emAllergies"
              rows={2}
              value={formData.emAllergies}
              onChange={handleChange}
            ></textarea>
          </label>
          <label>
            <span data-i18n="meds">{t("meds") || "Current prescribed medication"}</span>
            <textarea
              name="emMeds"
              rows={2}
              value={formData.emMeds}
              onChange={handleChange}
            ></textarea>
          </label>
          <label>
            <span data-i18n="specialNeeds">{t("specialNeeds") || "Special needs and conditions"}</span>
            <textarea
              name="emSpecial"
              rows={2}
              value={formData.emSpecial}
              onChange={handleChange}
            ></textarea>
          </label>
        </fieldset>

        <fieldset className="agreement-box">
          <legend data-i18n="authorization">{t("authorization") || "Authorization"}</legend>
          <p data-i18n="emAuthText">
            {t("emAuthText") ||
              "In the event of an emergency involving my child, and if Angel Learning Center cannot get in touch with me, I hereby authorize any needed emergency medical care. I further agree to be fully responsible for all medical expenses incurred during treatment."}
          </p>
          <div className="grid-2">
            <label>
              <span data-i18n="childName">{t("childName") || "Child’s name"}</span>
              <input name="emAuthChild" value={formData.emAuthChild} onChange={handleChange} required />
            </label>
            <label>
              <span data-i18n="date">{t("date") || "Date"}</span>
              <input type="date" name="emDate" value={formData.emDate} onChange={handleChange} />
            </label>
          </div>
          <label>
            <span data-i18n="parentSignature">{t("parentSignature") || "Parent / guardian signature"}</span>
            <input
              name="emSignature"
              className="signature"
              value={formData.emSignature}
              onChange={handleChange}
              required
            />
          </label>
        </fieldset>

        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            {t("nextHandbook") || "Next: Parent Handbook →"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default EmergencyView;
