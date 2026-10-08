import React, { useState, useEffect, useCallback } from "react";
import ALC_CONFIG from "../config";
import { useEnrollment } from "../context/EnrollmentContext";
import { useFormDraft } from "../hooks/useFormDraft";
import { completeFormAndGo } from "../utils/formNext";
import {
  isProgramDisabled,
  isProgramVisible,
  normalizePrograms,
  toggleProgram,
  validatePrograms,
} from "../utils/programSelection";
import { normalizeChildGender } from "../utils/formValues";

const TODAY = new Date().toISOString().slice(0, 10);

export function EnrollmentView() {
  const {
    state,
    saveForm,
    applyLocation,
    selectedLocationId,
    activeLocation,
    t,
    navigateTo,
    isWaitlistFlow,
  } = useEnrollment();

  const savedData = state.data?.enrollment || {};

  const [formData, setFormData] = useState({
    enLocation: savedData.enLocation || selectedLocationId || "savannah",
    programs: normalizePrograms(
      Array.isArray(savedData.programs)
        ? savedData.programs
        : String(savedData.programs || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
    ),
    childFirst: savedData.childFirst || "",
    childMI: savedData.childMI || "",
    childLast: savedData.childLast || "",
    childPreferred: savedData.childPreferred || "",
    childGrade: savedData.childGrade || "",
    startDate: savedData.startDate || "",
    childDob: savedData.childDob || "",
    childGender: normalizeChildGender(savedData.childGender),
    childAddress: savedData.childAddress || "",
    childCity: savedData.childCity || "",
    childZip: savedData.childZip || "",
    medicalNotes: savedData.medicalNotes || "",
    momFirst: savedData.momFirst || "",
    momMI: savedData.momMI || "",
    momLast: savedData.momLast || "",
    momCell: savedData.momCell || "",
    momEmail: savedData.momEmail || "",
    momEmployer: savedData.momEmployer || "",
    momOccupation: savedData.momOccupation || "",
    momWorkAddress: savedData.momWorkAddress || "",
    momMarital: savedData.momMarital || "",
    momCustodial: !!savedData.momCustodial,
    dadFirst: savedData.dadFirst || "",
    dadMI: savedData.dadMI || "",
    dadLast: savedData.dadLast || "",
    dadCell: savedData.dadCell || "",
    dadEmail: savedData.dadEmail || "",
    dadEmployer: savedData.dadEmployer || "",
    dadOccupation: savedData.dadOccupation || "",
    dadWorkAddress: savedData.dadWorkAddress || "",
    dadMarital: savedData.dadMarital || "",
    dadCustodial: !!savedData.dadCustodial,
    ec1Name: savedData.ec1Name || "",
    ec1Home: savedData.ec1Home || "",
    ec1Work: savedData.ec1Work || "",
    ec1Cell: savedData.ec1Cell || "",
    ec1Address: savedData.ec1Address || "",
    ec1Rel: savedData.ec1Rel || "",
    ec2Name: savedData.ec2Name || "",
    ec2Home: savedData.ec2Home || "",
    ec2Work: savedData.ec2Work || "",
    ec2Cell: savedData.ec2Cell || "",
    ec2Address: savedData.ec2Address || "",
    ec2Rel: savedData.ec2Rel || "",
    careFrom: savedData.careFrom || "",
    careTo: savedData.careTo || "",
    mealBreakfast: !!savedData.mealBreakfast,
    mealLunch: !!savedData.mealLunch,
    mealSnack: !!savedData.mealSnack,
    previousDaycareName: savedData.previousDaycareName || "",
    previousHomeCareName: savedData.previousHomeCareName || "",
    tuitionAmount: savedData.tuitionAmount || "",
    wlEnrollmentGoalDate: savedData.wlEnrollmentGoalDate || "",
    wlDeadlineDate: savedData.wlDeadlineDate || "",
    wlAgree: !!savedData.wlAgree,
    wlParent1PrintName: savedData.wlParent1PrintName || "",
    wlParent1Signature: savedData.wlParent1Signature || "",
    wlParent1SignDate: savedData.wlParent1SignDate || TODAY,
    wlParent2PrintName: savedData.wlParent2PrintName || "",
    wlParent2Signature: savedData.wlParent2Signature || "",
    wlParent2SignDate: savedData.wlParent2SignDate || TODAY,
  });

  const [programError, setProgramError] = useState("");
  const [waitlistError, setWaitlistError] = useState("");

  useEffect(() => {
    const en = state.data?.enrollment || {};
    setFormData((prev) => ({
      ...prev,
      ...en,
      enLocation: en.enLocation || selectedLocationId || "savannah",
      programs: normalizePrograms(
        Array.isArray(en.programs)
          ? en.programs
          : String(en.programs || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
      ),
      childGender: normalizeChildGender(en.childGender),
    }));
  }, [state.data?.enrollment, selectedLocationId]);

  const enrollmentPayload = useCallback(
    () => ({
      ...formData,
      programs: normalizePrograms(formData.programs || []),
    }),
    [formData]
  );

  const mapEnrollmentData = useCallback(
    (data) => ({
      ...data,
      programs: normalizePrograms(data.programs || []),
    }),
    []
  );

  useFormDraft("enrollment", formData, { mapData: mapEnrollmentData });

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
    setFormData((prev) => ({ ...prev, enLocation: locId }));
    applyLocation(locId);
  };

  const handleProgramToggle = (programId) => {
    setProgramError("");
    setFormData((prev) => ({
      ...prev,
      programs: toggleProgram(prev.programs || [], programId),
    }));
  };

  const handleNext = (e) => {
    if (isWaitlistFlow) {
      if (!formData.wlAgree) {
        setWaitlistError("Please acknowledge the parent/guardian waitlist agreement before continuing.");
        return;
      }
      setWaitlistError("");
      completeFormAndGo({
        event: e,
        saveForm,
        formId: "enrollment",
        getPayload: enrollmentPayload,
        navigateTo,
        target: "waitlist-done",
        validate: () => {
          const programValidation = validatePrograms(formData.programs || []);
          if (programValidation) {
            setProgramError(programValidation);
            return programValidation;
          }
          setProgramError("");
          return null;
        },
      });
      return;
    }

    completeFormAndGo({
      event: e,
      saveForm,
      formId: "enrollment",
      getPayload: enrollmentPayload,
      navigateTo,
      target: "financial",
      validate: () => {
        const programValidation = validatePrograms(formData.programs || []);
        if (programValidation) {
          setProgramError(programValidation);
          return programValidation;
        }
        setProgramError("");
        return null;
      },
    });
  };

  const currentLoc = ALC_CONFIG.locations?.[formData.enLocation] || activeLocation;
  const routeCount = (ALC_CONFIG.transport?.schools?.[currentLoc.id] || []).length;
  const programsList = ALC_CONFIG.programs || [];
  const waitlistRegistrationFee = `$${Number(ALC_CONFIG.waitlist?.registrationFee ?? 150).toFixed(2)}`;

  return (
    <section id="view-enrollment" className={`view is-active${isWaitlistFlow ? " waitlist-flow" : ""}`}>
      <form className="form-shell" data-form="enrollment" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="page-head">
          <a
            href={isWaitlistFlow ? "#home" : "#packet"}
            className="back"
            data-nav={isWaitlistFlow ? "home" : "packet"}
            onClick={(e) => {
              e.preventDefault();
              navigateTo(isWaitlistFlow ? "home" : "packet");
            }}
          >
            {isWaitlistFlow ? "← Back to home" : t("backPacket") || "← Back to packet"}
          </a>
          <p className="eyebrow">
            {isWaitlistFlow ? "Waitlist agreement" : t("form1") || "Form 1 of 5"}
          </p>
          <h2>{isWaitlistFlow ? "Waitlist Agreement" : t("enrollmentTitle") || "Enrollment Form"}</h2>
          <p className="section-lead">
            {isWaitlistFlow
              ? "Secure your child's place on the waitlist. Complete the agreement and enrollment details for your child."
              : t("enrollmentLead") || "Child, parent/guardian, emergency contacts, and care schedule."}
          </p>
        </div>

        <fieldset>
          <legend>Center &amp; program</legend>
          <label>
            <span>ALC location</span>
            <select
              name="enLocation"
              id="enLocation"
              value={formData.enLocation}
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

          <div className="location-context" id="enLocationContext" aria-live="polite">
            <strong>{currentLoc.legalName}</strong>
            <br />
            {currentLoc.address}
            <br />
            {currentLoc.phone} · {currentLoc.hours || ""}
            <br />
            Packet emails: <code>{currentLoc.inbox}</code> · {routeCount} school stop(s) on transport form
          </div>

          <p className="subhead">Program(s) for this child</p>
          <p className="hint">
            Choose up to two programs. Little Angels, Tiny Explorers, Busy Bee, and Little Learners are age groups —
            only one can be selected, and when one is chosen only Part-time Stars can be added (all other programs are
            hidden). Before care, after care, and before &amp; after care are standalone — selecting one hides all other
            programs (you can switch between those three only). Summer Camp and Holiday Weeks are selected together.
          </p>
          <p className="hint">
            The Transportation form appears only when Before care, After care, or Before &amp; after care is selected.
            Vehicle Emergency Medical appears when Pre-K, care programs, or summer/holiday programs are selected.
          </p>
          {programError ? (
            <p className="hint" style={{ color: "var(--danger, #b42318)" }} role="alert">
              {programError}
            </p>
          ) : null}

          <div className="chip-group" id="programChips">
            {programsList.map((p) => {
              if (!isProgramVisible(p.id, formData.programs || [])) return null;
              const isChecked = (formData.programs || []).includes(p.id);
              const disabled = isProgramDisabled(p.id, formData.programs || []);
              return (
                <label
                  key={p.id}
                  className={`chip${disabled && !isChecked ? " is-disabled" : ""}`}
                >
                  <input
                    type="checkbox"
                    data-program={p.id}
                    checked={isChecked}
                    disabled={disabled && !isChecked}
                    onChange={() => handleProgramToggle(p.id)}
                  />
                  {p.label}
                </label>
              );
            })}
          </div>
          <input type="hidden" name="programs" value={(formData.programs || []).join(",")} />
        </fieldset>

        <fieldset>
          <legend data-i18n="childInfo">{t("childInfo") || "Child information"}</legend>
          <div id="multiChildBar" className="multi-child-bar">
            <p className="hint" style={{ margin: 0 }}>
              Enrolling more than one child? Complete a separate packet for each child. Legal &amp; document forms cover the household.
            </p>
          </div>
          <div className="grid-3">
            <label>
              <span data-i18n="firstName">{t("firstName") || "First name"}</span>
              <input name="childFirst" value={formData.childFirst} onChange={handleChange} required />
            </label>
            <label>
              M.I. <input name="childMI" maxLength={1} value={formData.childMI} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="lastName">{t("lastName") || "Last name"}</span>
              <input name="childLast" value={formData.childLast} onChange={handleChange} required />
            </label>
          </div>
          <div className="grid-2">
            <label>
              <span data-i18n="preferredName">{t("preferredName") || "Preferred name"}</span>
              <input name="childPreferred" value={formData.childPreferred} onChange={handleChange} />
            </label>
            {!isWaitlistFlow && (
              <label>
                <span data-i18n="startDate">{t("startDate") || "Start date"}</span>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
              </label>
            )}
          </div>
          <div className="grid-2">
            <label>
              <span data-i18n="dob">{t("dob") || "Date of birth"}</span>
              <input type="date" name="childDob" value={formData.childDob} onChange={handleChange} required />
            </label>
            <label>
              <span data-i18n="gender">{t("gender") || "Gender"}</span>
              <select name="childGender" value={formData.childGender} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Boy">Boy</option>
                <option value="Girl">Girl</option>
              </select>
            </label>
          </div>
          <p className="hint">
            {isWaitlistFlow
              ? "SSN numbers are not typed in this web form. Provide SSN documents to the center when completing enrollment."
              : "SSN numbers are not typed in this web form. Upload parent and child SSN documents in the Documents step (required)."}
          </p>
          <label>
            <span data-i18n="address">{t("address") || "Home address"}</span>
            <input name="childAddress" value={formData.childAddress} onChange={handleChange} />
          </label>
          <div className="grid-2">
            <label>
              <span data-i18n="city">{t("city") || "City"}</span>
              <input name="childCity" value={formData.childCity} onChange={handleChange} />
            </label>
            <label>
              ZIP <input name="childZip" value={formData.childZip} onChange={handleChange} />
            </label>
          </div>
          <label>
            <span data-i18n="medicalNotes">
              {t("medicalNotes") || "Medical conditions, medications, or special attention"}
            </span>
            <textarea
              name="medicalNotes"
              rows={3}
              value={formData.medicalNotes}
              onChange={handleChange}
            ></textarea>
          </label>
        </fieldset>

        <fieldset>
          <legend data-i18n="motherGuardian">{t("motherGuardian") || "Mother / guardian"}</legend>
          <div className="grid-3">
            <label>
              <span data-i18n="firstName">{t("firstName") || "First name"}</span>
              <input name="momFirst" value={formData.momFirst} onChange={handleChange} />
            </label>
            <label>
              M.I. <input name="momMI" maxLength={1} value={formData.momMI} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="lastName">{t("lastName") || "Last name"}</span>
              <input name="momLast" value={formData.momLast} onChange={handleChange} />
            </label>
          </div>
          <div className="grid-2">
            <label>
              <span data-i18n="cellPhone">{t("cellPhone") || "Cell phone"}</span>
              <input type="tel" name="momCell" value={formData.momCell} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="email">{t("email") || "Email"}</span>
              <input type="email" name="momEmail" value={formData.momEmail} onChange={handleChange} />
            </label>
          </div>
          <div className="grid-2">
            <label>
              <span data-i18n="employer">{t("employer") || "Employer"}</span>
              <input name="momEmployer" value={formData.momEmployer} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="occupation">{t("occupation") || "Occupation"}</span>
              <input name="momOccupation" value={formData.momOccupation} onChange={handleChange} />
            </label>
          </div>
          <label>
            <span>Work address</span>
            <input name="momWorkAddress" value={formData.momWorkAddress} onChange={handleChange} />
          </label>
          <label>
            <span>Marital status</span>
            <select name="momMarital" value={formData.momMarital} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Married">Married</option>
              <option value="Single">Single</option>
              <option value="Divorced">Divorced</option>
              <option value="Separated">Separated</option>
              <option value="Widowed">Widowed</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="check">
            <input
              type="checkbox"
              name="momCustodial"
              checked={formData.momCustodial}
              onChange={handleChange}
            />
            <span data-i18n="custodial">{t("custodial") || "Custodial parent"}</span>
          </label>
        </fieldset>

        <fieldset>
          <legend data-i18n="fatherGuardian">{t("fatherGuardian") || "Father / guardian"}</legend>
          <div className="grid-3">
            <label>
              <span data-i18n="firstName">{t("firstName") || "First name"}</span>
              <input name="dadFirst" value={formData.dadFirst} onChange={handleChange} />
            </label>
            <label>
              M.I. <input name="dadMI" maxLength={1} value={formData.dadMI} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="lastName">{t("lastName") || "Last name"}</span>
              <input name="dadLast" value={formData.dadLast} onChange={handleChange} />
            </label>
          </div>
          <div className="grid-2">
            <label>
              <span data-i18n="cellPhone">{t("cellPhone") || "Cell phone"}</span>
              <input type="tel" name="dadCell" value={formData.dadCell} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="email">{t("email") || "Email"}</span>
              <input type="email" name="dadEmail" value={formData.dadEmail} onChange={handleChange} />
            </label>
          </div>
          <div className="grid-2">
            <label>
              <span data-i18n="employer">{t("employer") || "Employer"}</span>
              <input name="dadEmployer" value={formData.dadEmployer} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="occupation">{t("occupation") || "Occupation"}</span>
              <input name="dadOccupation" value={formData.dadOccupation} onChange={handleChange} />
            </label>
          </div>
          <label>
            <span>Work address</span>
            <input name="dadWorkAddress" value={formData.dadWorkAddress} onChange={handleChange} />
          </label>
          <label>
            <span>Marital status</span>
            <select name="dadMarital" value={formData.dadMarital} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Married">Married</option>
              <option value="Single">Single</option>
              <option value="Divorced">Divorced</option>
              <option value="Separated">Separated</option>
              <option value="Widowed">Widowed</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="check">
            <input
              type="checkbox"
              name="dadCustodial"
              checked={formData.dadCustodial}
              onChange={handleChange}
            />
            <span data-i18n="custodial">{t("custodial") || "Custodial parent"}</span>
          </label>
        </fieldset>

        {!isWaitlistFlow ? (
        <fieldset>
          <legend>
            <span data-i18n="emergencyContacts">{t("emergencyContacts") || "Emergency contacts"}</span>
            <span className="hint" data-i18n="pickupHint">
              {" "}({t("pickupHint") || "authorized for pickup — ID required"})
            </span>
          </legend>
          <p className="hint">
            Georgia requires <strong>two</strong> emergency contacts. Contacts <strong>cannot be the child’s parents/guardians</strong>.
          </p>
          <div className="repeat-block">
            <p className="subhead" data-i18n="contact1">
              {t("contact1") || "Contact 1"}
            </p>
            <label>
              <span data-i18n="fullName">{t("fullName") || "Full name"}</span>
              <input name="ec1Name" value={formData.ec1Name} onChange={handleChange} required />
            </label>
            <div className="grid-3">
              <label>Home <input type="tel" name="ec1Home" value={formData.ec1Home} onChange={handleChange} /></label>
              <label>Work <input type="tel" name="ec1Work" value={formData.ec1Work} onChange={handleChange} /></label>
              <label>
                Cell <input type="tel" name="ec1Cell" value={formData.ec1Cell} onChange={handleChange} required />
              </label>
            </div>
            <label>
              <span data-i18n="address">{t("address") || "Address"}</span>
              <input name="ec1Address" value={formData.ec1Address} onChange={handleChange} required />
            </label>
            <label>
              <span data-i18n="relationship">{t("relationship") || "Relationship"}</span>
              <input
                name="ec1Rel"
                value={formData.ec1Rel}
                onChange={handleChange}
                required
                placeholder="e.g. Aunt, neighbor — not parent"
              />
            </label>
          </div>

          <div className="repeat-block">
            <p className="subhead">Contact 2</p>
            <label>
              <span data-i18n="fullName">{t("fullName") || "Full name"}</span>
              <input name="ec2Name" value={formData.ec2Name} onChange={handleChange} required />
            </label>
            <div className="grid-3">
              <label>Home <input type="tel" name="ec2Home" value={formData.ec2Home} onChange={handleChange} /></label>
              <label>Work <input type="tel" name="ec2Work" value={formData.ec2Work} onChange={handleChange} /></label>
              <label>
                Cell <input type="tel" name="ec2Cell" value={formData.ec2Cell} onChange={handleChange} required />
              </label>
            </div>
            <label>
              <span data-i18n="address">{t("address") || "Address"}</span>
              <input name="ec2Address" value={formData.ec2Address} onChange={handleChange} required />
            </label>
            <label>
              <span data-i18n="relationship">{t("relationship") || "Relationship"}</span>
              <input
                name="ec2Rel"
                value={formData.ec2Rel}
                onChange={handleChange}
                required
                placeholder="e.g. Grandparent, friend — not parent"
              />
            </label>
          </div>
        </fieldset>
        ) : null}

        <fieldset>
          <legend data-i18n="careSchedule">{t("careSchedule") || "Care schedule"}</legend>
          <div className="grid-2">
            <label>
              <span data-i18n="hoursFrom">{t("hoursFrom") || "Primary hours from"}</span>
              <input type="time" name="careFrom" value={formData.careFrom} onChange={handleChange} />
            </label>
            <label>
              <span data-i18n="hoursTo">{t("hoursTo") || "To"}</span>
              <input type="time" name="careTo" value={formData.careTo} onChange={handleChange} />
            </label>
          </div>
          <p className="hint" data-i18n="tenHourHint">
            {t("tenHourHint") || "Cannot exceed 10 hours per day."}
          </p>
          <div className="chip-group">
            <label className="chip">
              <input
                type="checkbox"
                name="mealBreakfast"
                checked={formData.mealBreakfast}
                onChange={handleChange}
              />
              Breakfast
            </label>
            <label className="chip">
              <input
                type="checkbox"
                name="mealLunch"
                checked={formData.mealLunch}
                onChange={handleChange}
              />
              Lunch
            </label>
            <label className="chip">
              <input
                type="checkbox"
                name="mealSnack"
                checked={formData.mealSnack}
                onChange={handleChange}
              />
              PM Snack
            </label>
          </div>
          {isWaitlistFlow ? (
            <label>
              <span>Registration fee</span>
              <input value={waitlistRegistrationFee} readOnly disabled />
            </label>
          ) : (
            <>
              <p className="hint">
                Tuition rates are confirmed by the center — enter the current tuition amount if known.
              </p>
              <label>
                <span>Current tuition amount</span>
                <input name="tuitionAmount" value={formData.tuitionAmount} onChange={handleChange} />
              </label>
            </>
          )}
        </fieldset>

        <fieldset>
          <legend>Previous school information</legend>
          <div className="grid-2">
            <label>
              <span>Daycare name</span>
              <input name="previousDaycareName" value={formData.previousDaycareName} onChange={handleChange} />
            </label>
            <label>
              <span>Home care name</span>
              <input name="previousHomeCareName" value={formData.previousHomeCareName} onChange={handleChange} />
            </label>
          </div>
        </fieldset>

        {isWaitlistFlow ? (
          <>
            <div className="waitlist-section-divider">
              <h3>Waitlist Agreement</h3>
              <p>Complete the agreement below after filling in enrollment details above.</p>
            </div>

            <div className="waitlist-intro">
              <p>
                The purpose of this document is to provide an understanding of the waitlist process. When accepted,
                this document constitutes a binding agreement — please read it thoroughly and sign at the bottom of
                the agreement.
              </p>
            </div>

            <fieldset className="waitlist-terms">
              <legend>Waitlist terms</legend>
              <ul className="waitlist-terms-list">
                <li>
                  Parents enrolling their child on the waitlist will be required to pay a{" "}
                  <strong>registration fee and first week's tuition.</strong>
                </li>
                <li>
                  We will do our best to find a place for your child; however, placement on the waitlist is{" "}
                  <strong>not a guarantee of enrollment</strong> at the requested time, with a specific age group, or
                  for a specific start date. <strong>Tuition rates are subject to change</strong>, the rate at the time
                  of completing the waitlist agreement may not reflect the rate at the time of enrollment and/or
                  attendance.
                </li>
                <li>
                  In order to be added to the waitlist, parents and the Center must jointly come to the determination on
                  a specific date which corresponds to the amount of time that they are willing to remain on the waitlist
                  before dropping off the waitlist. After the specified date, if the program is full and the child is
                  unable to be enrolled, the child will be removed from the waitlist and will be{" "}
                  <strong>refunded the first week's tuition.</strong>
                </li>
                <li>
                  If your child is offered a place in the program within the time period that s/he is actively on the
                  waitlist and you decline the spot, you agree to{" "}
                  <strong>forfeit the registration and first week's tuition.</strong>
                </li>
                <li>
                  <strong>Rates are subject to change</strong> and may be different depending on when/if you are able to
                  enroll, and at which location you are enrolling.
                </li>
              </ul>
            </fieldset>

            <fieldset>
              <legend>Enrollment &amp; payment details</legend>
              <div className="grid-2">
                <label>
                  <span>Tentative start date</span>
                  <input
                    type="date"
                    name="wlEnrollmentGoalDate"
                    value={formData.wlEnrollmentGoalDate}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  <span>Waitlist deadline date</span>
                  <input
                    type="date"
                    name="wlDeadlineDate"
                    value={formData.wlDeadlineDate}
                    onChange={handleChange}
                  />
                </label>
              </div>
              <label>
                <span>Registration fee</span>
                <input value={waitlistRegistrationFee} readOnly disabled />
              </label>
            </fieldset>

            <div className="waitlist-notice" role="note">
              <strong>Important placement &amp; refund notice</strong>
              <p>
                SPACE IS LIMITED AND BASED ON A FIRST COME, FIRST SERVED BASIS. THE REGISTRATION FEE AND FIRST WEEK'S
                TUITION IS REQUIRED TO SECURE YOUR CHILD'S PLACE ON THE WAITLIST. IF NO SPOT IS AVAILABLE BY THE
                WAITLIST DEADLINE INDICATED ABOVE, YOUR CHILD WILL BE REMOVED FROM THE WAITLIST AND THE FIRST WEEK'S
                TUITION WILL BE REFUNDED.
              </p>
            </div>

            <fieldset>
              <legend>Parent / guardian acknowledgment</legend>
              <p className="hint">
                I am very interested in adding my child(ren) to the waiting list for enrollment. I agree to pay the
                registration fee and first week's tuition upfront, and I understand that failure to do so will result in
                removal from the waitlist. I understand that if I withdraw my child from the waitlist prior to the
                deadline indicated above or decline a spot in the program after signing this agreement, I will not
                receive a refund for any payments for fees.
              </p>
              <label className="check">
                <input
                  type="checkbox"
                  name="wlAgree"
                  checked={formData.wlAgree}
                  onChange={handleChange}
                  required
                />
                <span>I have read and agree to the waitlist terms and acknowledgment above</span>
              </label>
              {waitlistError ? (
                <p className="hint" style={{ color: "var(--danger, #b42318)" }} role="alert">
                  {waitlistError}
                </p>
              ) : null}
            </fieldset>

            <fieldset>
              <legend>Parent / guardian signatures</legend>
              <div className="repeat-block">
                <p className="subhead">Parent / guardian 1</p>
                <div className="grid-3">
                  <label>
                    <span>Printed name</span>
                    <input name="wlParent1PrintName" value={formData.wlParent1PrintName} onChange={handleChange} />
                  </label>
                  <label>
                    <span>Signature</span>
                    <input
                      name="wlParent1Signature"
                      className="signature"
                      value={formData.wlParent1Signature}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    <span>Date</span>
                    <input type="date" name="wlParent1SignDate" value={formData.wlParent1SignDate} onChange={handleChange} />
                  </label>
                </div>
              </div>
              <div className="repeat-block">
                <p className="subhead">Parent / guardian 2</p>
                <div className="grid-3">
                  <label>
                    <span>Printed name</span>
                    <input name="wlParent2PrintName" value={formData.wlParent2PrintName} onChange={handleChange} />
                  </label>
                  <label>
                    <span>Signature</span>
                    <input
                      name="wlParent2Signature"
                      className="signature"
                      value={formData.wlParent2Signature}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    <span>Date</span>
                    <input type="date" name="wlParent2SignDate" value={formData.wlParent2SignDate} onChange={handleChange} />
                  </label>
                </div>
              </div>
            </fieldset>
          </>
        ) : null}

        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            {isWaitlistFlow ? "Complete waitlist agreement →" : t("nextFinancial") || "Next: Tuition agreement →"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default EnrollmentView;
