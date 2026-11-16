import React, { useState, useEffect } from "react";
import ALC_CONFIG from "../config";
import { useEnrollment } from "../context/EnrollmentContext";
import { useFormDraft } from "../hooks/useFormDraft";
import { completeFormAndGo } from "../utils/formNext";

export function TransportView() {
  const { state, saveForm, applyCarryForward, selectedLocationId, needsEmergencyMedicalForm, t, navigateTo } = useEnrollment();

  const savedData = state.data?.transport || {};

  const [formData, setFormData] = useState({
    trLocation: savedData.trLocation || selectedLocationId || "savannah",
    trChild: savedData.trChild || "",
    trSchoolChoice: savedData.trSchoolChoice || "",
    trSchoolAddress: savedData.trSchoolAddress || "",
    trDirection: savedData.trDirection || "both",
    trWhen: savedData.trWhen || "both",
    trPickupTime: savedData.trPickupTime || "",
    trArriveTime: savedData.trArriveTime || "",
    trMon: !!savedData.trMon,
    trTue: !!savedData.trTue,
    trWed: !!savedData.trWed,
    trThu: !!savedData.trThu,
    trFri: !!savedData.trFri,
    trStaffAuth: !!savedData.trStaffAuth,
    trPermEmergency:
      "trPermEmergency" in savedData ? !!savedData.trPermEmergency : !!savedData.trStaffAuth,
    trPermFieldTrips:
      "trPermFieldTrips" in savedData ? !!savedData.trPermFieldTrips : !!savedData.trStaffAuth,
    trPermSchool:
      "trPermSchool" in savedData
        ? !!savedData.trPermSchool
        : !!(savedData.trStaffAuth && savedData.trSchoolChoice),
    trMiles: savedData.trMiles || "",
    trSignature: savedData.trSignature || "",
    trDate: savedData.trDate || "",
  });

  useEffect(() => {
    applyCarryForward({ force: false, onlyForm: "transport" });
  }, [applyCarryForward]);

  useEffect(() => {
    const tr = state.data?.transport || {};
    setFormData((prev) => ({
      ...prev,
      ...tr,
      trLocation: tr.trLocation || selectedLocationId || "savannah",
      trMon: !!tr.trMon,
      trTue: !!tr.trTue,
      trWed: !!tr.trWed,
      trThu: !!tr.trThu,
      trFri: !!tr.trFri,
      trStaffAuth: !!tr.trStaffAuth,
      trPermEmergency:
        "trPermEmergency" in tr ? !!tr.trPermEmergency : !!tr.trStaffAuth,
      trPermFieldTrips:
        "trPermFieldTrips" in tr ? !!tr.trPermFieldTrips : !!tr.trStaffAuth,
      trPermSchool:
        "trPermSchool" in tr ? !!tr.trPermSchool : !!(tr.trStaffAuth && tr.trSchoolChoice),
    }));
  }, [state.data?.transport, selectedLocationId]);

  useFormDraft("transport", formData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationChange = (e) => {
    const locId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      trLocation: locId,
      trSchoolChoice: "",
      trSchoolAddress: "",
    }));
  };

  const handleSchoolSelect = (school) => {
    setFormData((prev) => ({
      ...prev,
      trSchoolChoice: school.id,
      trSchoolAddress: school.address,
    }));
  };

  const handleNext = (e) => {
    completeFormAndGo({
      event: e,
      saveForm,
      formId: "transport",
      getPayload: () => formData,
      navigateTo,
      target: nextTarget,
    });
  };

  const schools = ALC_CONFIG.transport?.schools?.[formData.trLocation] || [];
  const showPrefillNotice = !!(
    state.data?.enrollment?.childFirst ||
    state.data?.enrollment?.momFirst ||
    state.data?.enrollment?.dadFirst
  );
  const hasEmergency = needsEmergencyMedicalForm();
  const nextTarget = hasEmergency ? "emergency" : "handbook";
  const nextText = hasEmergency
    ? t("nextEmergency") || "Next: Emergency form →"
    : t("nextHandbook") || "Next: Parent Handbook →";

  return (
    <section id="view-transport" className="view is-active">
      <form className="form-shell" data-form="transport" onSubmit={(e) => e.preventDefault()} noValidate>
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
          <p className="eyebrow" data-i18n="form3">
            {t("form3") || "Form 3 of 5"}
          </p>
          <h2 data-i18n="transportTitle">{t("transportTitle") || "Transportation Agreement"}</h2>
          <p className="section-lead" data-i18n="transportLead">
            {t("transportLead") || "Authorize Angel Learning Center staff to transport your child from school."}
          </p>
          {showPrefillNotice ? (
            <p className="prefill-notice">
              Name, address, and contact fields were filled from the Enrollment form so you don’t retype them. Edit anything that needs changes.
            </p>
          ) : null}
        </div>

        <fieldset>
          <legend data-i18n="childRoute">{t("childRoute") || "Child & route"}</legend>
          <label>
            <span data-i18n="alcLocation">{t("alcLocation") || "ALC location"}</span>
            <select
              name="trLocation"
              id="trLocation"
              value={formData.trLocation}
              onChange={handleLocationChange}
              required
            >
              {Object.values(ALC_CONFIG.locations || {}).map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} — {loc.address.split(",")[0]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span data-i18n="childName">{t("childName") || "Name of child"}</span>
            <input name="trChild" value={formData.trChild} onChange={handleChange} required />
          </label>

          <p className="subhead" data-i18n="selectPickupSchool">
            {t("selectPickupSchool") || "School bus pickup"}
          </p>
          <p className="hint" data-i18n="pickupSchoolHint">
            {t("pickupSchoolHint") || "Schools served by ALC routes for the location you selected (from center list)."}
          </p>

          <div className="route-options" id="routeSchoolList">
            {schools.map((s) => {
              const isChecked = formData.trSchoolChoice === s.id;
              return (
                <label key={s.id} className="radio-card">
                  <input
                    type="radio"
                    name="trSchoolRadio"
                    value={s.id}
                    checked={isChecked}
                    onChange={() => handleSchoolSelect(s)}
                  />
                  <span>
                    <strong>{s.name}</strong>
                    <small>{s.address}</small>
                  </span>
                </label>
              );
            })}
          </div>

          <p className="hint">
            Only listed schools may be selected (center policy). School ↔ center runs both ways. Enter AM/PM times if needed until default route times are published.
          </p>

          <div className="grid-2">
            <label>
              <span>Direction</span>
              <select name="trDirection" value={formData.trDirection} onChange={handleChange}>
                <option value="both">School ↔ Center (both)</option>
                <option value="school_to_center">School → Center only</option>
                <option value="center_to_school">Center → School only</option>
              </select>
            </label>
            <label>
              <span>When</span>
              <select name="trWhen" value={formData.trWhen} onChange={handleChange}>
                <option value="both">AM &amp; PM</option>
                <option value="am">AM (before school)</option>
                <option value="pm">PM (after school)</option>
              </select>
            </label>
          </div>

          <div className="grid-2">
            <label>
              <span data-i18n="pickupTime">{t("pickupTime") || "Pickup time (school)"}</span>
              <input
                type="time"
                name="trPickupTime"
                id="trPickupTime"
                value={formData.trPickupTime}
                onChange={handleChange}
              />
            </label>
            <label>
              <span data-i18n="arriveAlc">{t("arriveAlc") || "Arrive at Angel Learning Center"}</span>
              <input
                type="time"
                name="trArriveTime"
                value={formData.trArriveTime}
                onChange={handleChange}
              />
            </label>
          </div>

          <p className="subhead" data-i18n="transportDays">
            {t("transportDays") || "Transport days"}
          </p>
          <div className="chip-group">
            <label className="chip">
              <input type="checkbox" name="trMon" checked={formData.trMon} onChange={handleChange} /> Monday
            </label>
            <label className="chip">
              <input type="checkbox" name="trTue" checked={formData.trTue} onChange={handleChange} /> Tuesday
            </label>
            <label className="chip">
              <input type="checkbox" name="trWed" checked={formData.trWed} onChange={handleChange} /> Wednesday
            </label>
            <label className="chip">
              <input type="checkbox" name="trThu" checked={formData.trThu} onChange={handleChange} /> Thursday
            </label>
            <label className="chip">
              <input type="checkbox" name="trFri" checked={formData.trFri} onChange={handleChange} /> Friday
            </label>
          </div>

          <p className="subhead">Transportation permissions (check all that apply)</p>
          <label className="check">
            <input
              type="checkbox"
              name="trPermEmergency"
              checked={formData.trPermEmergency}
              onChange={handleChange}
            />
            Emergency Care
          </label>
          <label className="check">
            <input
              type="checkbox"
              name="trPermFieldTrips"
              checked={formData.trPermFieldTrips}
              onChange={handleChange}
            />
            Field Trips
          </label>
          <label className="check">
            <input
              type="checkbox"
              name="trPermSchool"
              checked={formData.trPermSchool}
              onChange={handleChange}
            />
            To and From Elementary School
          </label>

          <label className="check">
            <input
              type="checkbox"
              name="trStaffAuth"
              checked={formData.trStaffAuth}
              onChange={handleChange}
              required
            />
            <span data-i18n="staffAuth">
              {t("staffAuth") || "Angel Learning staff is authorized to transport my child."}
            </span>
          </label>

          <div className="grid-2">
            <label>
              <span data-i18n="schoolAddress">{t("schoolAddress") || "School address"}</span>
              <input
                name="trSchoolAddress"
                id="trSchoolAddress"
                value={formData.trSchoolAddress}
                readOnly
              />
            </label>
            <label>
              <span data-i18n="miles">{t("miles") || "Approx. miles from center"}</span>
              <input name="trMiles" value={formData.trMiles} onChange={handleChange} />
            </label>
          </div>
          <input type="hidden" name="trSchoolChoice" value={formData.trSchoolChoice} />
        </fieldset>

        <fieldset>
          <legend data-i18n="signature">{t("signature") || "Signature"}</legend>
          <div className="grid-2">
            <label>
              <span data-i18n="parentSignature">{t("parentSignature") || "Parent / guardian signature"}</span>
              <input
                name="trSignature"
                className="signature"
                value={formData.trSignature}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <span data-i18n="date">{t("date") || "Date"}</span>
              <input type="date" name="trDate" value={formData.trDate} onChange={handleChange} />
            </label>
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            {nextText}
          </button>
        </div>
      </form>
    </section>
  );
}

export default TransportView;
