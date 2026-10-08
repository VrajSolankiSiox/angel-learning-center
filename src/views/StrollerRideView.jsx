import React, { useState, useEffect } from "react";
import { useEnrollment } from "../context/EnrollmentContext";
import { useFormDraft } from "../hooks/useFormDraft";
import { completeFormAndGo } from "../utils/formNext";

export function StrollerRideView() {
  const { state, saveForm, applyCarryForward, activeLocation, navigateTo } = useEnrollment();
  const savedData = state.data?.strollerRide || {};

  const [formData, setFormData] = useState({
    srChildName: savedData.srChildName || "",
    srChildDob: savedData.srChildDob || "",
    srCenterLocation: savedData.srCenterLocation || activeLocation?.legalName || activeLocation?.name || "",
    srHealthInfo: savedData.srHealthInfo || "",
    srClothingItems: savedData.srClothingItems || "",
    srPermYes: !!savedData.srPermYes,
    srPermNo: !!savedData.srPermNo,
    srSignature: savedData.srSignature || "",
    srSignDate: savedData.srSignDate || "",
    srPrintName: savedData.srPrintName || "",
  });

  useEffect(() => {
    applyCarryForward({ force: false, onlyForm: "strollerRide" });
  }, [applyCarryForward]);

  useEffect(() => {
    const sr = state.data?.strollerRide || {};
    setFormData((prev) => ({
      ...prev,
      ...sr,
      srCenterLocation: sr.srCenterLocation || activeLocation?.legalName || activeLocation?.name || prev.srCenterLocation,
      srPermYes: !!sr.srPermYes,
      srPermNo: !!sr.srPermNo,
    }));
  }, [state.data?.strollerRide, activeLocation]);

  useFormDraft("strollerRide", formData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePermission = (choice) => {
    setFormData((prev) => ({
      ...prev,
      srPermYes: choice === "yes",
      srPermNo: choice === "no",
    }));
  };

  const handleNext = (e) => {
    completeFormAndGo({
      event: e,
      saveForm,
      formId: "strollerRide",
      getPayload: () => formData,
      navigateTo,
      target: "uploads",
    });
  };

  const showPrefillNotice = !!(
    state.data?.enrollment?.childFirst ||
    state.data?.enrollment?.momFirst ||
    state.data?.enrollment?.dadFirst
  );

  return (
    <section id="view-stroller-ride" className="view is-active">
      <form className="form-shell" data-form="strollerRide" onSubmit={(e) => e.preventDefault()} noValidate>
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
          <h1>Infant Stroller Ride and Child Nature Walk Permission</h1>
          <p className="page-lead">On-site outdoor experience permission form.</p>
        </div>

        {showPrefillNotice ? (
          <p className="hint">Child and parent details were carried forward from Enrollment.</p>
        ) : null}

        <fieldset>
          <legend>Child information</legend>
          <div className="grid-2">
            <label>
              <span>Child name</span>
              <input name="srChildName" value={formData.srChildName} onChange={handleChange} required />
            </label>
            <label>
              <span>Date of birth</span>
              <input type="date" name="srChildDob" value={formData.srChildDob} onChange={handleChange} required />
            </label>
            <label>
              <span>Center location</span>
              <input name="srCenterLocation" value={formData.srCenterLocation} onChange={handleChange} required />
            </label>
          </div>
        </fieldset>

        <fieldset className="agreement-box">
          <legend>Activity description</legend>
          <div className="scroll-terms">
            <p>
              Infants may participate in supervised stroller rides and older children in age-appropriate nature walks on
              Angel Learning Center property. The planned route may include designated sidewalks, the area around the
              building, and the approved perimeter of the Center parking lot. Children will not be taken onto public
              roads or away from Center property under this permission.
            </p>
            <p>
              The purpose of the activity is to provide fresh air, movement, sensory experiences, and opportunities to
              observe age-appropriate features of nature, such as trees, leaves, flowers, birds, clouds, and changing
              weather. Infants will remain in the stroller unless staff move them to another approved on-site area for a
              planned and directly supervised activity.
            </p>
          </div>
        </fieldset>

        <fieldset className="agreement-box">
          <legend>Safety and supervision practices</legend>
          <div className="scroll-terms">
            <ul>
              <li>
                Staff will follow required staff-to-child ratios and maintain active sight-and-sound supervision
                throughout the activity.
              </li>
              <li>
                Staff will complete name-to-face attendance checks before leaving the classroom, during transitions,
                when arriving at the activity area, before returning, and immediately after re-entering the Center.
              </li>
              <li>
                Each infant will be placed in an age-appropriate stroller seat and secured with the stroller’s restraint
                system. Stroller brakes will be used whenever the stroller is stopped, and the stroller will not be left
                unattended.
              </li>
              <li>
                Staff will use only the Center-approved route and will remain alert for moving vehicles, uneven pavement,
                heat, insects, landscaping equipment, standing water, and other hazards. The activity will be delayed,
                rerouted, or ended if conditions are unsafe.
              </li>
              <li>
                Walks will occur only during suitable weather and temperature conditions. Staff will monitor children for
                overheating, chilling, breathing difficulty, allergic reactions, discomfort, or other signs of distress
                and will return indoors when needed.
              </li>
              <li>
                Children will not be permitted to place plants, leaves, rocks, insects, or other outdoor materials in
                their mouths. Staff will prevent contact with unknown plants, chemicals, animal waste, and other unsafe
                items.
              </li>
              <li>
                Staff will carry required attendance and emergency information and will follow Center emergency and
                first-aid procedures if a child becomes ill, is injured, or experiences distress.
              </li>
              <li>
                Appropriate clothing and sun protection will be used according to weather conditions and the Center’s
                policies. Any sunscreen or insect repellent will be applied only when separately authorized by the parent
                and permitted by Center policy.
              </li>
            </ul>
          </div>
        </fieldset>

        <fieldset>
          <legend>Parent information and instructions</legend>
          <p className="hint">
            Please identify any medical condition, allergy, mobility concern, temperature sensitivity, respiratory
            concern, skin sensitivity, or other restriction that staff should consider before your child participates.
          </p>
          <label>
            <span>Health information, restrictions, or special instructions</span>
            <textarea name="srHealthInfo" rows={3} value={formData.srHealthInfo} onChange={handleChange} />
          </label>
          <label>
            <span>Clothing or comfort items requested by parent</span>
            <textarea name="srClothingItems" rows={3} value={formData.srClothingItems} onChange={handleChange} />
          </label>
        </fieldset>

        <fieldset className="agreement-box">
          <legend>Permission selection</legend>
          <p className="hint">Please select one:</p>
          <label className="check">
            <input
              type="radio"
              name="srPermission"
              checked={formData.srPermYes}
              onChange={() => handlePermission("yes")}
              required
            />
            <span>
              I give permission for my child to participate in recurring supervised stroller rides and nature walks on
              Center property, including the approved route around the building and parking-lot perimeter.
            </span>
          </label>
          <label className="check">
            <input
              type="radio"
              name="srPermission"
              checked={formData.srPermNo}
              onChange={() => handlePermission("no")}
            />
            <span>
              I do not give permission for my child to participate in stroller rides or nature walks outside the Center
              building.
            </span>
          </label>
        </fieldset>

        <fieldset className="agreement-box">
          <legend>Parent or guardian authorization</legend>
          <div className="scroll-terms">
            <p>
              I understand the nature and location of the activity and the safety practices described above. I understand
              that this permission applies only to supervised on-site stroller rides and nature walks and is not
              permission for transportation or an off-site field trip. I agree to notify the Center in writing of
              changes to my child’s health, restrictions, or participation. I understand that I may withdraw this
              permission in writing at any time.
            </p>
          </div>
          <div className="grid-2">
            <label>
              <span>Printed name</span>
              <input name="srPrintName" value={formData.srPrintName} onChange={handleChange} required />
            </label>
            <label>
              <span>Date</span>
              <input type="date" name="srSignDate" value={formData.srSignDate} onChange={handleChange} required />
            </label>
          </div>
          <label>
            <span>Parent or guardian signature</span>
            <input
              name="srSignature"
              className="signature"
              placeholder="Type full legal name"
              value={formData.srSignature}
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

export default StrollerRideView;
