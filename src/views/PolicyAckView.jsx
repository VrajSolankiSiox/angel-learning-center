import React, { useState, useEffect } from "react";
import { useEnrollment } from "../context/EnrollmentContext";
import { useFormDraft } from "../hooks/useFormDraft";
import { completeFormAndGo } from "../utils/formNext";

const ACK_ITEMS = [
  { key: "ppAckPolicies", label: "Provided me with a copy of the Center’s policies and procedures required by the applicable licensing rule" },
  { key: "ppAckSafeSleep", label: "Advised me of the safe sleep practices followed by the Center" },
  { key: "ppAckProgress", label: "Advised me of my child’s progress and any issues related to my child’s care that are known at this time" },
  { key: "ppAckSpecialNeeds", label: "Discussed individual practices concerning my child’s special needs or care needs, when applicable" },
  { key: "ppAckShakenBaby", label: "Described the Center’s practices for preventing shaken baby syndrome and abusive head trauma" },
  { key: "ppAckParticipation", label: "Encouraged my participation in Center activities" },
];

export function PolicyAckView() {
  const { state, saveForm, applyCarryForward, activeLocation, t, navigateTo } = useEnrollment();
  const savedData = state.data?.policyAck || {};

  const [formData, setFormData] = useState({
    ppChildName: savedData.ppChildName || "",
    ppChildDob: savedData.ppChildDob || "",
    ppParentName: savedData.ppParentName || "",
    ppCenterLocation: savedData.ppCenterLocation || activeLocation?.legalName || activeLocation?.name || "",
    ppInitialsSleep: savedData.ppInitialsSleep || "",
    ppInitialsProhibited: savedData.ppInitialsProhibited || "",
    ppInitialsFamily: savedData.ppInitialsFamily || "",
    ppNeedsDiscussed: savedData.ppNeedsDiscussed || "",
    ppAgreedPractices: savedData.ppAgreedPractices || "",
    ppParentQuestions: savedData.ppParentQuestions || "",
    ppDirectorNotes: savedData.ppDirectorNotes || "",
    ppAckPolicies: !!savedData.ppAckPolicies,
    ppAckSafeSleep: !!savedData.ppAckSafeSleep,
    ppAckProgress: !!savedData.ppAckProgress,
    ppAckSpecialNeeds: !!savedData.ppAckSpecialNeeds,
    ppAckShakenBaby: !!savedData.ppAckShakenBaby,
    ppAckParticipation: !!savedData.ppAckParticipation,
    ppSignature: savedData.ppSignature || "",
    ppSignDate: savedData.ppSignDate || "",
    ppPrintName: savedData.ppPrintName || "",
  });

  useEffect(() => {
    applyCarryForward({ force: false, onlyForm: "policyAck" });
  }, [applyCarryForward]);

  useEffect(() => {
    const pa = state.data?.policyAck || {};
    setFormData((prev) => ({
      ...prev,
      ...pa,
      ppCenterLocation: pa.ppCenterLocation || activeLocation?.legalName || activeLocation?.name || prev.ppCenterLocation,
      ppAckPolicies: !!pa.ppAckPolicies,
      ppAckSafeSleep: !!pa.ppAckSafeSleep,
      ppAckProgress: !!pa.ppAckProgress,
      ppAckSpecialNeeds: !!pa.ppAckSpecialNeeds,
      ppAckShakenBaby: !!pa.ppAckShakenBaby,
      ppAckParticipation: !!pa.ppAckParticipation,
    }));
  }, [state.data?.policyAck, activeLocation]);

  useFormDraft("policyAck", formData);

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
      formId: "policyAck",
      getPayload: () => formData,
      navigateTo,
      target: "safeSleep",
    });
  };

  const showPrefillNotice = !!(
    state.data?.enrollment?.childFirst ||
    state.data?.enrollment?.momFirst ||
    state.data?.enrollment?.dadFirst
  );

  return (
    <section id="view-policy-ack" className="view is-active">
      <form className="form-shell" data-form="policyAck" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="page-head">
          <a
            href="#packet"
            className="back"
            onClick={(e) => {
              e.preventDefault();
              navigateTo("packet");
            }}
          >
            {t("backPacket") || "← Back to packet"}
          </a>
          <p className="eyebrow">Policy acknowledgment</p>
          <h2>Parent Policy Acknowledgment</h2>
          <p className="section-lead">
            Safe Sleep · Shaken Baby Syndrome and Abusive Head Trauma · Family Participation. Read each section;
            parent initials are filled automatically from your enrollment, then sign the acknowledgment.
          </p>
          {showPrefillNotice ? (
            <p className="prefill-notice">
              Child and parent names were filled from your enrollment form. Edit anything that needs changes.
            </p>
          ) : null}
        </div>

        <fieldset>
          <legend>Child &amp; center information</legend>
          <div className="grid-2">
            <label>
              <span>Child name</span>
              <input name="ppChildName" value={formData.ppChildName} onChange={handleChange} required />
            </label>
            <label>
              <span>Date of birth</span>
              <input type="date" name="ppChildDob" value={formData.ppChildDob} onChange={handleChange} required />
            </label>
          </div>
          <div className="grid-2">
            <label>
              <span>Parent or guardian name</span>
              <input name="ppParentName" value={formData.ppParentName} onChange={handleChange} required />
            </label>
            <label>
              <span>Center location</span>
              <input name="ppCenterLocation" value={formData.ppCenterLocation} readOnly disabled />
            </label>
          </div>
        </fieldset>

        <fieldset className="agreement-box">
          <legend>Safe sleep practices</legend>
          <div className="scroll-terms">
            <p>
              Angel Learning Center follows safe sleep practices for infants, including back sleeping unless a physician
              directs otherwise, bare cribs, appropriate sleep clothing, individual bedding, prompt transfer from
              equipment to approved cribs, and no swaddling or positioning devices.
            </p>
          </div>
          <label>
            <span>Parent initials</span>
            <input
              name="ppInitialsSleep"
              value={formData.ppInitialsSleep}
              readOnly
              aria-readonly="true"
              title="Filled automatically from parent name on enrollment"
            />
          </label>
        </fieldset>

        <fieldset className="agreement-box">
          <legend>Shaken baby syndrome &amp; prohibited behaviors</legend>
          <div className="scroll-terms">
            <p>
              Staff are trained to recognize warning signs, respond appropriately, and care safely for crying or distraught
              children. Prohibited behaviors include shaking, striking, verbal abuse, unsafe restraint, and failure to
              report concerns.
            </p>
          </div>
          <label>
            <span>Parent initials</span>
            <input
              name="ppInitialsProhibited"
              value={formData.ppInitialsProhibited}
              readOnly
              aria-readonly="true"
              title="Filled automatically from parent name on enrollment"
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Child care communication &amp; individual needs</legend>
          <label>
            <span>Child’s individual care or special needs discussed</span>
            <textarea name="ppNeedsDiscussed" rows={3} value={formData.ppNeedsDiscussed} onChange={handleChange} />
          </label>
          <label>
            <span>Agreed practices, accommodations, or follow-up needed</span>
            <textarea name="ppAgreedPractices" rows={3} value={formData.ppAgreedPractices} onChange={handleChange} />
          </label>
          <label>
            <span>Parent questions or concerns</span>
            <textarea name="ppParentQuestions" rows={3} value={formData.ppParentQuestions} onChange={handleChange} />
          </label>
          <label>
            <span>Director or designee notes</span>
            <textarea
              name="ppDirectorNotes"
              rows={3}
              value={formData.ppDirectorNotes}
              onChange={handleChange}
              placeholder="Completed at the center, if applicable"
            />
          </label>
        </fieldset>

        <fieldset className="agreement-box">
          <legend>Family participation</legend>
          <div className="scroll-terms">
            <p>
              Parents and guardians are encouraged to participate in Center activities, communicate with staff, attend
              conferences and events, and ask questions about the program or their child’s care.
            </p>
          </div>
          <label>
            <span>Parent initials</span>
            <input
              name="ppInitialsFamily"
              value={formData.ppInitialsFamily}
              readOnly
              aria-readonly="true"
              title="Filled automatically from parent name on enrollment"
            />
          </label>
        </fieldset>

        <fieldset className="agreement-box">
          <legend>Parent or guardian acknowledgment</legend>
          <p className="hint">By signing below, I acknowledge that the Director or designee has:</p>
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
          <p className="hint">
            I have had an opportunity to ask questions and understand that I may request clarification or updated
            information from the Center at any time.
          </p>
          <div className="grid-2">
            <label>
              <span>Printed name</span>
              <input name="ppPrintName" value={formData.ppPrintName} onChange={handleChange} required />
            </label>
            <label>
              <span>Date</span>
              <input type="date" name="ppSignDate" value={formData.ppSignDate} onChange={handleChange} required />
            </label>
          </div>
          <label>
            <span>Parent or guardian signature</span>
            <input
              name="ppSignature"
              className="signature"
              placeholder="Type full legal name"
              value={formData.ppSignature}
              onChange={handleChange}
              required
            />
          </label>
        </fieldset>

        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            Next: Parent Safe Sleep Procedure →
          </button>
        </div>
      </form>
    </section>
  );
}

export default PolicyAckView;
