import React, { useState, useEffect } from "react";
import { useEnrollment } from "../context/EnrollmentContext";
import { useFormDraft } from "../hooks/useFormDraft";
import { completeFormAndGo } from "../utils/formNext";
import { digitsOnly } from "../utils/formValues";

export function FinancialView() {
  const { state, saveForm, needsTransportForm, needsEmergencyMedicalForm, applyCarryForward, t, navigateTo } = useEnrollment();

  const savedData = state.data?.financial || {};

  const [formData, setFormData] = useState({
    rpName: savedData.rpName || "",
    rpDob: savedData.rpDob || "",
    rpDl: savedData.rpDl || "",
    rpState: savedData.rpState || "",
    rpAddress: savedData.rpAddress || "",
    rpCityStateZip: savedData.rpCityStateZip || "",
    rpPhone: savedData.rpPhone || "",
    rpEmail: savedData.rpEmail || "",
    rpEmployer: savedData.rpEmployer || "",
    rp2Name: savedData.rp2Name || "",
    rp2Dob: savedData.rp2Dob || "",
    rp2Dl: savedData.rp2Dl || "",
    rp2State: savedData.rp2State || "",
    rp2Address: savedData.rp2Address || "",
    rp2CityStateZip: savedData.rp2CityStateZip || "",
    rp2Employer: savedData.rp2Employer || "",
    rp2Phone: savedData.rp2Phone || "",
    rp2Email: savedData.rp2Email || "",
    finChildName: savedData.finChildName || "",
    finEnrollDate: savedData.finEnrollDate || "",
    finAgree: !!savedData.finAgree,
    finPrintName: savedData.finPrintName || "",
    finSignDate: savedData.finSignDate || "",
    finSignature: savedData.finSignature || "",
    finCardholderName: savedData.finCardholderName || "",
    finCardNumber: savedData.finCardNumber || "",
    finCardExp: savedData.finCardExp || "",
    finCardCvv: savedData.finCardCvv || "",
  });

  useEffect(() => {
    applyCarryForward({ force: false, onlyForm: "financial" });
  }, [applyCarryForward]);

  useEffect(() => {
    const fin = state.data?.financial || {};
    setFormData((prev) => ({
      ...prev,
      ...fin,
      finAgree: !!fin.finAgree,
    }));
  }, [state.data?.financial]);

  useFormDraft("financial", formData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "rpDl" || name === "rp2Dl") {
      setFormData((prev) => ({ ...prev, [name]: digitsOnly(value, 20) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = (e) => {
    completeFormAndGo({
      event: e,
      saveForm,
      formId: "financial",
      getPayload: () => formData,
      navigateTo,
      target: nextTarget,
    });
  };

  const hasTransport = needsTransportForm();
  const hasEmergency = needsEmergencyMedicalForm();
  const nextTarget = hasTransport ? "transport" : hasEmergency ? "emergency" : "ies";
  const nextText = hasTransport
    ? t("nextTransport") || "Next: Transportation →"
    : hasEmergency
      ? t("nextEmergency") || "Next: Emergency form →"
      : t("nextIes") || "Next: Meal benefit form →";

  const showPrefillNotice = !!(
    state.data?.enrollment?.childFirst ||
    state.data?.enrollment?.momFirst ||
    state.data?.enrollment?.dadFirst
  );

  return (
    <section id="view-financial" className="view is-active">
      <form className="form-shell" data-form="financial" onSubmit={(e) => e.preventDefault()} noValidate>
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
          <p className="eyebrow" data-i18n="form2">
            {t("form2") || "Form 2 of 5"}
          </p>
          <h2 data-i18n="financialTitle">
            {t("financialTitle") || "Financial Responsibility & Tuition Agreement"}
          </h2>
          <p className="section-lead" data-i18n="financialLead">
            {t("financialLead") || "Acknowledge responsibility for tuition, fees, and payment terms."}
          </p>
          {showPrefillNotice ? (
            <p className="prefill-notice">
              Name, address, and contact fields were filled from the Enrollment form so you don’t retype them. Edit anything that needs changes.
            </p>
          ) : null}
        </div>

        <fieldset>
          <legend data-i18n="responsibleParty">{t("responsibleParty") || "Responsible party"}</legend>
          <label>
            <span data-i18n="legalName">{t("legalName") || "Full legal name"}</span>
            <input name="rpName" value={formData.rpName} onChange={handleChange} required />
          </label>
          <div className="grid-3">
            <label>
              <span data-i18n="dob">{t("dob") || "Date of birth"}</span>
              <input type="date" name="rpDob" value={formData.rpDob} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="dl">{t("dl") || "Driver’s license / State ID #"}</span>
              <input
                name="rpDl"
                value={formData.rpDl}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                placeholder="Numbers only"
              />
            </label>
            <label>
              <span data-i18n="state">{t("state") || "State"}</span>
              <input name="rpState" maxLength={2} value={formData.rpState} onChange={handleChange} />
            </label>
          </div>
          <label>
            <span data-i18n="address">{t("address") || "Home address"}</span>
            <input name="rpAddress" value={formData.rpAddress} onChange={handleChange} />
          </label>
          <div className="grid-2">
            <label>
              <span data-i18n="cityStateZip">{t("cityStateZip") || "City / State / ZIP"}</span>
              <input name="rpCityStateZip" value={formData.rpCityStateZip} onChange={handleChange} />
            </label>
            <label>
              SSN (paper / center only)
              <input name="rpSsn" value="" disabled placeholder="Not collected online" autoComplete="off" />
            </label>
          </div>
          <div className="grid-2">
            <label>
              <span data-i18n="phone">{t("phone") || "Phone"}</span>
              <input type="tel" name="rpPhone" value={formData.rpPhone} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="email">{t("email") || "Email"}</span>
              <input type="email" name="rpEmail" value={formData.rpEmail} onChange={handleChange} />
            </label>
          </div>
          <label>
            <span data-i18n="employer">{t("employer") || "Employer"}</span>
            <input name="rpEmployer" value={formData.rpEmployer} onChange={handleChange} />
          </label>
        </fieldset>

        <fieldset>
          <legend>
            Second responsible party <span className="pill-muted">Optional</span>
          </legend>
          <p className="hint">Add another adult who shares financial responsibility (optional).</p>
          <label>
            Full legal name <input name="rp2Name" value={formData.rp2Name} onChange={handleChange} />
          </label>
          <div className="grid-3">
            <label>
              <span data-i18n="dob">{t("dob") || "Date of birth"}</span>
              <input type="date" name="rp2Dob" value={formData.rp2Dob} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="dl">{t("dl") || "Driver’s license / State ID #"}</span>
              <input
                name="rp2Dl"
                value={formData.rp2Dl}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                placeholder="Numbers only"
              />
            </label>
            <label>
              <span data-i18n="state">{t("state") || "State"}</span>
              <input name="rp2State" maxLength={2} value={formData.rp2State} onChange={handleChange} />
            </label>
          </div>
          <label>
            <span data-i18n="address">{t("address") || "Home address"}</span>
            <input name="rp2Address" value={formData.rp2Address} onChange={handleChange} />
          </label>
          <div className="grid-2">
            <label>
              <span data-i18n="cityStateZip">{t("cityStateZip") || "City / State / ZIP"}</span>
              <input name="rp2CityStateZip" value={formData.rp2CityStateZip} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="employer">{t("employer") || "Employer"}</span>
              <input name="rp2Employer" value={formData.rp2Employer} onChange={handleChange} />
            </label>
          </div>
          <div className="grid-2">
            <label>
              <span data-i18n="phone">{t("phone") || "Phone"}</span>
              <input type="tel" name="rp2Phone" value={formData.rp2Phone} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="email">{t("email") || "Email"}</span>
              <input type="email" name="rp2Email" value={formData.rp2Email} onChange={handleChange} />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend data-i18n="child">{t("child") || "Child"}</legend>
          <div className="grid-2">
            <label>
              <span data-i18n="childName">{t("childName") || "Child’s name"}</span>
              <input name="finChildName" value={formData.finChildName} onChange={handleChange} required />
            </label>
            <label>
              <span data-i18n="enrollDate">{t("enrollDate") || "Enrollment date"}</span>
              <input type="date" name="finEnrollDate" value={formData.finEnrollDate} onChange={handleChange} />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            Credit card for automated billing <span className="pill-muted">Optional</span>
          </legend>
          <p className="hint">
            Optional — for Procare automated tuition billing. Leave blank if you prefer another payment method or will upload card photos in Documents instead.
          </p>
          <label>
            Cardholder name
            <input
              name="finCardholderName"
              value={formData.finCardholderName}
              onChange={handleChange}
              placeholder={formData.rpName || "Same as responsible party"}
            />
          </label>
          <div className="grid-3">
            <label>
              Card number
              <input
                name="finCardNumber"
                value={formData.finCardNumber}
                onChange={handleChange}
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="Optional"
              />
            </label>
            <label>
              Expiration date
              <input
                name="finCardExp"
                value={formData.finCardExp}
                onChange={handleChange}
                placeholder="MM/YY"
                autoComplete="cc-exp"
              />
            </label>
            <label>
              CVV
              <input
                name="finCardCvv"
                value={formData.finCardCvv}
                onChange={handleChange}
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="Optional"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="agreement-box">
          <legend data-i18n="agreement">{t("agreement") || "Agreement"}</legend>
          <div className="scroll-terms legal-terms-full">
            <p>
              <strong>Financial responsibility.</strong> I acknowledge that I am the individual legally and financially responsible for payment of all tuition, registration fees, late fees, returned payment fees, activity fees, and any other charges incurred for my child’s enrollment at Angel Learning Center. I understand that tuition is due regardless of my child’s attendance unless otherwise provided in the Center’s written policies.
            </p>
            <p>
              <strong>Failure to Pay.</strong> Failure to pay may result in Angel Learning Center’s right to:
            </p>
            <ul>
              <li>Assess applicable late fees and returned payment fees in accordance with Center policy.</li>
              <li>Suspend or terminate childcare services until the account is brought current.</li>
              <li>Refuse future enrollment while any balance remains unpaid.</li>
              <li>Refer the account to a collection agency.</li>
              <li>File a civil action in a Georgia court, including Magistrate (Small Claims) Court where permitted by law, to recover any unpaid balance.</li>
              <li>Seek recovery of court filing fees, service fees, post-judgment interest, and any other amounts recoverable under Georgia law.</li>
            </ul>
            <p>
              <strong>Contact information.</strong> I agree to keep my mailing address, email address, telephone number, and employer information current and notify the Center within five (5) business days of any changes.
            </p>
            <p>
              <strong>Acknowledgment.</strong> I certify that the information provided above is true and correct. I have read this Agreement, understand my financial obligations, and voluntarily agree to be personally responsible for all amounts owed to Angel Learning Center. I understand that this Agreement is a legally binding contract and may be used as evidence in any collection or legal proceeding arising from unpaid tuition or fees.
            </p>
          </div>
          <label className="check">
            <input type="checkbox" name="finAgree" checked={formData.finAgree} onChange={handleChange} required />
            <span>
              I have read this Agreement in full, understand my financial obligations, and voluntarily agree to be personally responsible for all amounts owed to Angel Learning Center.
            </span>
          </label>
          <div className="grid-2">
            <label>
              <span data-i18n="printedName">{t("printedName") || "Printed name"}</span>
              <input name="finPrintName" value={formData.finPrintName} onChange={handleChange} required />
            </label>
            <label>
              <span data-i18n="date">{t("date") || "Date"}</span>
              <input type="date" name="finSignDate" value={formData.finSignDate} onChange={handleChange} />
            </label>
          </div>
          <label>
            <span data-i18n="esign">{t("esign") || "E-signature"}</span>
            <input
              name="finSignature"
              className="signature"
              placeholder="Type full legal name to sign"
              value={formData.finSignature}
              onChange={handleChange}
              required
            />
          </label>
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

export default FinancialView;
