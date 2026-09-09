import React from "react";
import { useEnrollment } from "../context/EnrollmentContext";

export function SelectedCenterCard() {
  const { activeLocation, startWaitlistFlow, startFullEnrollment } = useEnrollment();
  if (!activeLocation || !activeLocation.id) return null;

  return (
    <div className="selected-center" id="selectedCenterCard">
      <p className="eyebrow">Selected center</p>
      <h3 id="selCenterName">{activeLocation.legalName || activeLocation.name}</h3>
      <p id="selCenterMeta" className="section-lead">
        {activeLocation.address} · {activeLocation.phone}
        {activeLocation.hours ? ` · ${activeLocation.hours}` : ""}
      </p>
      {activeLocation.inbox ? (
        <p id="selCenterInbox" className="center-inbox">
          Questions? Email {activeLocation.inbox}
        </p>
      ) : null}
      <div className="hero-cta">
        {/* <a
          href="#packet"
          className="btn btn-primary"
          data-nav="packet"
          onClick={(e) => {
            e.preventDefault();
            setFullFlowMode();
            navigateTo("packet");
          }}
        >
          Continue to checklist →
        </a> */}
        <a
          href="#enrollment"
          className="btn btn-primary"
          data-nav="enrollment"
          onClick={(e) => {
            e.preventDefault();
            startFullEnrollment();
          }}
        >
          Start Enrollment Form →
        </a>
        <button
          type="button"
          className="btn btn-waitlist"
          onClick={startWaitlistFlow}
        >
          Waitlist Form →
        </button>
      </div>
    </div>
  );
}

export default SelectedCenterCard;
