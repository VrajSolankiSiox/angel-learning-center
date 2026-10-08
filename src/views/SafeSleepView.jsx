import React, { useState, useEffect } from "react";
import { useEnrollment } from "../context/EnrollmentContext";
import { useFormDraft } from "../hooks/useFormDraft";
import { completeFormAndGo } from "../utils/formNext";

const ACK_ITEMS = [
  { key: "ssAckReceived", label: "I have received a copy of this safe sleep procedure" },
  { key: "ssAckQuestions", label: "I have had an opportunity to ask questions about the Center’s safe sleep practices" },
];

export function SafeSleepView() {
  const { state, saveForm, applyCarryForward, activeLocation, navigateTo } = useEnrollment();
  const savedData = state.data?.safeSleep || {};

  const [formData, setFormData] = useState({
    ssChildName: savedData.ssChildName || "",
    ssChildDob: savedData.ssChildDob || "",
    ssClassroom: savedData.ssClassroom || "",
    ssCenterLocation: savedData.ssCenterLocation || activeLocation?.legalName || activeLocation?.name || "",
    ssAckReceived: !!savedData.ssAckReceived,
    ssAckQuestions: !!savedData.ssAckQuestions,
    ssAckPhysician: !!savedData.ssAckPhysician,
    ssAckPhysicianNA: !!savedData.ssAckPhysicianNA,
    ssSignature: savedData.ssSignature || "",
    ssSignDate: savedData.ssSignDate || "",
    ssPrintName: savedData.ssPrintName || "",
  });

  useEffect(() => {
    applyCarryForward({ force: false, onlyForm: "safeSleep" });
  }, [applyCarryForward]);

  useEffect(() => {
    const ss = state.data?.safeSleep || {};
    setFormData((prev) => ({
      ...prev,
      ...ss,
      ssCenterLocation: ss.ssCenterLocation || activeLocation?.legalName || activeLocation?.name || prev.ssCenterLocation,
      ssAckReceived: !!ss.ssAckReceived,
      ssAckQuestions: !!ss.ssAckQuestions,
      ssAckPhysician: !!ss.ssAckPhysician,
      ssAckPhysicianNA: !!ss.ssAckPhysicianNA,
    }));
  }, [state.data?.safeSleep, activeLocation]);

  useFormDraft("safeSleep", formData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhysicianChoice = (choice) => {
    setFormData((prev) => ({
      ...prev,
      ssAckPhysician: choice === "physician",
      ssAckPhysicianNA: choice === "na",
    }));
  };

  const handleNext = (e) => {
    completeFormAndGo({
      event: e,
      saveForm,
      formId: "safeSleep",
      getPayload: () => formData,
      navigateTo,
      target: "strollerRide",
    });
  };

  const showPrefillNotice = !!(
    state.data?.enrollment?.childFirst ||
    state.data?.enrollment?.momFirst ||
    state.data?.enrollment?.dadFirst
  );

  return (
    <section id="view-safe-sleep" className="view is-active">
      <form className="form-shell" data-form="safeSleep" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="page-head">
          <a
            href="#packet"
            className="back"
            onClick={(e) => {
              e.preventDefault();
              navigateTo("packet");
            }}
          >
            ← Back to Packet
          </a>
          <h1>Parent Safe Sleep Procedure and Acknowledgment</h1>
          <p className="page-lead">Angel Learning Center safe sleep practices for infants.</p>
        </div>

        {showPrefillNotice ? (
          <p className="hint">Child and parent details were carried forward from Enrollment.</p>
        ) : null}

        <fieldset>
          <legend>Child information</legend>
          <div className="grid-2">
            <label>
              <span>Child name</span>
              <input name="ssChildName" value={formData.ssChildName} onChange={handleChange} required />
            </label>
            <label>
              <span>Date of birth</span>
              <input type="date" name="ssChildDob" value={formData.ssChildDob} onChange={handleChange} required />
            </label>
            <label>
              <span>Center location</span>
              <input name="ssCenterLocation" value={formData.ssCenterLocation} onChange={handleChange} required />
            </label>
          </div>
        </fieldset>

        <fieldset className="agreement-box">
          <legend>Purpose</legend>
          <div className="scroll-terms">
            <p>
              Angel Learning Center follows these practices whenever an infant is placed to sleep. For this policy, an
              infant is a child younger than 12 months, or a child younger than 18 months who is not yet walking.
              Parents must provide any required physician statement before the Center may use an exception described
              below.
            </p>
          </div>
        </fieldset>

        <fieldset className="agreement-box">
          <legend>Safe sleep practices</legend>
          <div className="scroll-terms">
            <ol>
              <li>
                <strong>Back to sleep.</strong> Staff will initially place every infant on the infant’s back in a
                safety-approved crib unless a physician’s written statement authorizes otherwise.
              </li>
              <li>
                <strong>Safety-approved crib.</strong> Each infant will be provided a crib that complies with CPSC and
                ASTM safety standards.
              </li>
              <li>
                <strong>Firm mattress and fitted sheet.</strong> Each crib will have a firm, tight-fitting mattress at
                least two inches thick with an individual, tight-fitting sheet.
              </li>
              <li>
                <strong>Empty crib.</strong> No blankets, toys, pillows, quilts, comforters, bumper pads, or other soft
                or loose items.
              </li>
              <li>
                <strong>Nothing attached to the crib.</strong> No crib gyms, toys, mirrors, mobiles, cords, or similar
                items.
              </li>
              <li>
                <strong>Bedding care.</strong> Crib sheets changed daily, whenever soiled, and before a change of
                occupant.
              </li>
              <li>
                <strong>Sleeping only in an approved crib.</strong> Infants who fall asleep elsewhere will be transferred
                promptly to a safety-approved crib.
              </li>
              <li>
                <strong>Sleep clothing.</strong> Sleepers and sleep sacks may be used when properly fitted. Loose blankets
                will not be used.
              </li>
              <li>
                <strong>Swaddling.</strong> Not permitted unless authorized by a physician’s written statement.
              </li>
              <li>
                <strong>Positioning devices and monitors.</strong> Not used unless authorized by a physician’s written
                statement.
              </li>
              <li>
                <strong>Room temperature and lighting.</strong> Sleep area maintained between 65°F and 85°F with
                sufficient lighting for staff to observe each infant.
              </li>
              <li>
                <strong>Supervision and response.</strong> Staff maintain active sight-and-sound supervision and respond
                immediately to signs of distress.
              </li>
            </ol>
          </div>
        </fieldset>

        <fieldset className="agreement-box">
          <legend>Physician instructions</legend>
          <div className="scroll-terms">
            <p>
              If your infant requires an alternate sleep position, swaddling, a wedge, another positioning device, or a
              monitor, provide the Center with a current physician’s written statement before the practice or device may
              be used.
            </p>
          </div>
        </fieldset>

        <fieldset className="agreement-box">
          <legend>Parent or guardian acknowledgment</legend>
          <div className="scroll-terms">
            <p>
              By signing below, I acknowledge that the Director or designee has provided me with and explained Angel
              Learning Center’s safe sleep practices. I understand that my infant will be placed initially on the back in
              an empty, safety-approved crib unless the Center has an acceptable physician’s written statement
              authorizing a specific exception.
            </p>
          </div>
          {ACK_ITEMS.map((item) => (
            <label className="check" key={item.key}>
              <input
                type="checkbox"
                name={item.key}
                checked={formData[item.key]}
                onChange={handleChange}
                required
              />
              <span>{item.label}</span>
            </label>
          ))}
          <p className="hint">Physician-authorized sleep instructions (select one):</p>
          <label className="check">
            <input
              type="radio"
              name="ssPhysicianChoice"
              checked={formData.ssAckPhysician}
              onChange={() => handlePhysicianChoice("physician")}
              required={!formData.ssAckPhysicianNA}
            />
            <span>My child currently has physician-authorized sleep instructions attached to this form</span>
          </label>
          <label className="check">
            <input
              type="radio"
              name="ssPhysicianChoice"
              checked={formData.ssAckPhysicianNA}
              onChange={() => handlePhysicianChoice("na")}
            />
            <span>Not applicable</span>
          </label>
          <div className="grid-2">
            <label>
              <span>Printed name</span>
              <input name="ssPrintName" value={formData.ssPrintName} onChange={handleChange} required />
            </label>
            <label>
              <span>Date</span>
              <input type="date" name="ssSignDate" value={formData.ssSignDate} onChange={handleChange} required />
            </label>
          </div>
          <label>
            <span>Parent or guardian signature</span>
            <input
              name="ssSignature"
              className="signature"
              placeholder="Type full legal name"
              value={formData.ssSignature}
              onChange={handleChange}
              required
            />
          </label>
        </fieldset>

        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            Next: Stroller Ride & Nature Walk →
          </button>
        </div>
      </form>
    </section>
  );
}

export default SafeSleepView;
