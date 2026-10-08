import React, { useState, useEffect } from "react";
import { useEnrollment } from "../context/EnrollmentContext";
import { useFormDraft } from "../hooks/useFormDraft";
import { completeFormAndGo } from "../utils/formNext";
import { WATCH_ME_GROW_ACK_ITEMS } from "../constants/watchMeGrowAck";

export function WatchMeGrowView() {
  const { state, saveForm, applyCarryForward, navigateTo } = useEnrollment();
  const savedData = state.data?.watchMeGrow || {};

  const initialAcks = WATCH_ME_GROW_ACK_ITEMS.reduce((acc, item) => {
    acc[item.key] = !!savedData[item.key];
    return acc;
  }, {});

  const [formData, setFormData] = useState({
    wmgChildName: savedData.wmgChildName || "",
    wmgPrintName: savedData.wmgPrintName || "",
    wmgSignature: savedData.wmgSignature || "",
    wmgSignDate: savedData.wmgSignDate || "",
    ...initialAcks,
  });

  useEffect(() => {
    applyCarryForward({ force: false, onlyForm: "watchMeGrow" });
  }, [applyCarryForward]);

  useEffect(() => {
    const wmg = state.data?.watchMeGrow || {};
    const acks = WATCH_ME_GROW_ACK_ITEMS.reduce((acc, item) => {
      acc[item.key] = !!wmg[item.key];
      return acc;
    }, {});
    setFormData((prev) => ({
      ...prev,
      ...wmg,
      ...acks,
    }));
  }, [state.data?.watchMeGrow]);

  useFormDraft("watchMeGrow", formData);

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
      formId: "watchMeGrow",
      getPayload: () => formData,
      navigateTo,
      target: "policyAck",
    });
  };

  const showPrefillNotice = !!(
    state.data?.enrollment?.childFirst ||
    state.data?.enrollment?.momFirst ||
    state.data?.enrollment?.dadFirst
  );

  return (
    <section id="view-watch-me-grow" className="view is-active">
      <form className="form-shell" data-form="watchMeGrow" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="page-head">
          <a
            href="#packet"
            className="back"
            onClick={(e) => {
              e.preventDefault();
              navigateTo("packet");
            }}
          >
            ← Back to packet
          </a>
          <p className="eyebrow">Watch Me Grow</p>
          <h2>Watch Me Grow Registration Acknowledgment</h2>
          <p className="section-lead">
            After you register in the Watch Me Grow app, acknowledge the live camera viewing policies below. These
            statements match the registration page in your enrollment packet PDF.
          </p>
          {showPrefillNotice ? (
            <p className="prefill-notice">
              Child and parent names were filled from your enrollment form. Edit anything that needs changes.
            </p>
          ) : null}
        </div>

        <fieldset>
          <legend>Child information</legend>
          <label>
            <span>Child&apos;s name</span>
            <input name="wmgChildName" value={formData.wmgChildName} onChange={handleChange} required />
          </label>
        </fieldset>

        <fieldset className="agreement-box">
          <legend>Camera viewing policies</legend>
          <p className="hint">Check each statement to confirm you understand these rules for Watch Me Grow access.</p>
          {WATCH_ME_GROW_ACK_ITEMS.map((item) => (
            <label className="check" key={item.key}>
              <input
                type="checkbox"
                name={item.key}
                checked={!!formData[item.key]}
                onChange={handleChange}
                required
              />
              <span className={item.emphasis ? "wmg-ack-emphasis" : undefined}>{item.text}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="agreement-box">
          <legend>Parent or guardian signature</legend>
          <div className="grid-2">
            <label>
              <span>Printed name</span>
              <input name="wmgPrintName" value={formData.wmgPrintName} onChange={handleChange} required />
            </label>
            <label>
              <span>Date</span>
              <input type="date" name="wmgSignDate" value={formData.wmgSignDate} onChange={handleChange} />
            </label>
          </div>
          <label>
            <span>E-signature</span>
            <input
              name="wmgSignature"
              className="signature"
              placeholder="Type full legal name to sign"
              value={formData.wmgSignature}
              onChange={handleChange}
              required
            />
          </label>
        </fieldset>

        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            Next: Documents →
          </button>
        </div>
      </form>
    </section>
  );
}

export default WatchMeGrowView;
