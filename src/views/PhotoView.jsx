import React, { useState, useEffect } from "react";
import { useEnrollment } from "../context/EnrollmentContext";
import { useFormDraft } from "../hooks/useFormDraft";
import { completeFormAndGo } from "../utils/formNext";

const PHOTO_PERMISSION_ITEMS = [
  "Classroom / center displays",
  "Communications to enrolled families",
  "Website / social media",
  "Marketing / promotional materials",
];

const WATER_PERMISSION_ITEMS = [
  "Sprinkler",
  "Play Splashing",
  "Swimming Pools",
  "Water Table Play",
];

const PREP_PERMISSION_ITEMS = [
  { field: "prepBabyWipes", label: "Baby wipes" },
  { field: "prepBandAids", label: "Band-Aids" },
  { field: "prepNeosporin", label: "Neosporin or similar ointment" },
  { field: "prepBactine", label: "Bactine or similar first aid spray" },
  { field: "prepSunscreen", label: "Sunscreen" },
  { field: "prepInsectRepellent", label: "Insect repellent" },
  { field: "prepNonRxOintment", label: "Non-prescription ointment (A&D, Desitin, Vaseline, etc.)" },
  { field: "prepBabyPowder", label: "Baby Powder" },
];

function allPhotoGranted(data = {}) {
  return !!(
    data.photoClassroom &&
    data.photoFamily &&
    data.photoWeb &&
    data.photoMarketing &&
    !data.photoNone
  );
}

function allWaterGranted(data = {}) {
  return !!(
    data.permWaterSprinkler &&
    data.permWaterSplashing &&
    data.permWaterPools &&
    data.permWaterTable
  );
}

function allPrepGranted(data = {}) {
  return PREP_PERMISSION_ITEMS.every((item) => !!data[item.field]);
}

function withAllOrNonePermissions(data) {
  const photoGrant = allPhotoGranted(data);
  const waterGrant = allWaterGranted(data);
  const prepGrant = allPrepGranted(data);
  const next = {
    ...data,
    photoClassroom: photoGrant,
    photoFamily: photoGrant,
    photoWeb: photoGrant,
    photoMarketing: photoGrant,
    photoNone: !photoGrant,
    permWaterSprinkler: waterGrant,
    permWaterSplashing: waterGrant,
    permWaterPools: waterGrant,
    permWaterTable: waterGrant,
  };
  PREP_PERMISSION_ITEMS.forEach((item) => {
    next[item.field] = prepGrant;
  });
  return next;
}

export function PhotoView() {
  const { state, saveForm, applyCarryForward, t, navigateTo } = useEnrollment();

  const savedData = state.data?.photo || {};

  const [formData, setFormData] = useState({
    photoClassroom: !!savedData.photoClassroom,
    photoFamily: !!savedData.photoFamily,
    photoWeb: !!savedData.photoWeb,
    photoMarketing: !!savedData.photoMarketing,
    photoNone: !!savedData.photoNone,
    photoChild: savedData.photoChild || "",
    photoAgree: !!savedData.photoAgree,
    photoPrint: savedData.photoPrint || "",
    photoDate: savedData.photoDate || "",
    photoSignature: savedData.photoSignature || "",
    permWaterSprinkler: !!savedData.permWaterSprinkler,
    permWaterSplashing: !!savedData.permWaterSplashing,
    permWaterPools: !!savedData.permWaterPools,
    permWaterTable: !!savedData.permWaterTable,
    prepBabyWipes: !!savedData.prepBabyWipes,
    prepBandAids: !!savedData.prepBandAids,
    prepNeosporin: !!savedData.prepNeosporin,
    prepBactine: !!savedData.prepBactine,
    prepSunscreen: !!savedData.prepSunscreen,
    prepInsectRepellent: !!savedData.prepInsectRepellent,
    prepNonRxOintment: !!savedData.prepNonRxOintment,
    prepBabyPowder: !!savedData.prepBabyPowder,
    prepOther: savedData.prepOther || "",
  });

  useEffect(() => {
    applyCarryForward({ force: false, onlyForm: "photo" });
  }, [applyCarryForward]);

  useEffect(() => {
    const ph = state.data?.photo || {};
    setFormData((prev) => ({
      ...prev,
      ...ph,
      photoClassroom: !!ph.photoClassroom,
      photoFamily: !!ph.photoFamily,
      photoWeb: !!ph.photoWeb,
      photoMarketing: !!ph.photoMarketing,
      photoNone: !!ph.photoNone,
      photoAgree: !!ph.photoAgree,
      permWaterSprinkler: !!ph.permWaterSprinkler,
      permWaterSplashing: !!ph.permWaterSplashing,
      permWaterPools: !!ph.permWaterPools,
      permWaterTable: !!ph.permWaterTable,
      prepBabyWipes: !!ph.prepBabyWipes,
      prepBandAids: !!ph.prepBandAids,
      prepNeosporin: !!ph.prepNeosporin,
      prepBactine: !!ph.prepBactine,
      prepSunscreen: !!ph.prepSunscreen,
      prepInsectRepellent: !!ph.prepInsectRepellent,
      prepNonRxOintment: !!ph.prepNonRxOintment,
      prepBabyPowder: !!ph.prepBabyPowder,
      prepOther: ph.prepOther || "",
    }));
  }, [state.data?.photo]);

  useFormDraft("photo", formData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "photoGrantAll") {
      setFormData((prev) => withAllOrNonePermissions({
        ...prev,
        photoClassroom: checked,
        photoFamily: checked,
        photoWeb: checked,
        photoMarketing: checked,
        photoNone: !checked,
      }));
      return;
    }
    if (name === "waterGrantAll") {
      setFormData((prev) => withAllOrNonePermissions({
        ...prev,
        permWaterSprinkler: checked,
        permWaterSplashing: checked,
        permWaterPools: checked,
        permWaterTable: checked,
      }));
      return;
    }
    if (name === "prepGrantAll") {
      setFormData((prev) => {
        const next = { ...prev };
        PREP_PERMISSION_ITEMS.forEach((item) => {
          next[item.field] = checked;
        });
        return withAllOrNonePermissions(next);
      });
      return;
    }
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
      formId: "photo",
      getPayload: () => withAllOrNonePermissions(formData),
      navigateTo,
      target: "watchMeGrow",
    });
  };

  const photoGrantAll = allPhotoGranted(formData);
  const waterGrantAll = allWaterGranted(formData);
  const prepGrantAll = allPrepGranted(formData);

  const showPrefillNotice = !!(
    state.data?.enrollment?.childFirst ||
    state.data?.enrollment?.momFirst ||
    state.data?.enrollment?.dadFirst
  );

  return (
    <section id="view-photo" className="view is-active">
      <form className="form-shell" data-form="photo" onSubmit={(e) => e.preventDefault()} noValidate>
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
          <p className="eyebrow">Permissions</p>
          <h2>Photo / Video Permission</h2>
          <p className="section-lead">
            Required for enrollment. Tell us how Angel Learning Center may use photos and video of your child.
          </p>
          {showPrefillNotice ? (
            <p className="prefill-notice">
              Name, address, and contact fields were filled from the Enrollment form so you don’t retype them. Edit anything that needs changes.
            </p>
          ) : null}
        </div>

        <fieldset className="agreement-box">
          <legend>Permission</legend>
          <div className="scroll-terms">
            <p>
              I understand that Angel Learning Center may take photographs and/or video of children during normal program activities, special events, and classroom learning. Permission is for every use below, or for none of them.
            </p>
          </div>
          <p className="subhead">I grant permission for</p>
          <ul className="perm-choice-list">
            {PHOTO_PERMISSION_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <label className="check">
            <input
              type="checkbox"
              name="photoGrantAll"
              checked={photoGrantAll}
              onChange={handleChange}
            />
            I grant permission for all of the uses above. Leave unchecked to grant none.
          </label>

          <p className="subhead">Water activities consent</p>
          <p className="hint">Permission is for every water activity below, or for none of them.</p>
          <ul className="perm-choice-list">
            {WATER_PERMISSION_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <label className="check">
            <input
              type="checkbox"
              name="waterGrantAll"
              checked={waterGrantAll}
              onChange={handleChange}
            />
            I grant permission for all water activities above. Leave unchecked to grant none.
          </label>

          <p className="subhead">Topical preparations</p>
          <p className="hint">Acknowledgment covers every external preparation below, or none of them.</p>
          <ul className="perm-choice-list">
            {PREP_PERMISSION_ITEMS.map((item) => (
              <li key={item.field}>{item.label}</li>
            ))}
          </ul>
          <label className="check">
            <input
              type="checkbox"
              name="prepGrantAll"
              checked={prepGrantAll}
              onChange={handleChange}
            />
            I authorize the center to apply all of the external preparations above. Leave unchecked to authorize none.
          </label>
          <label>
            Other topical preparation (optional)
            <input name="prepOther" value={formData.prepOther} onChange={handleChange} />
          </label>

          <label>
            Child’s full name
            <input
              name="photoChild"
              value={formData.photoChild}
              onChange={handleChange}
              required
            />
          </label>

          <label className="check">
            <input
              type="checkbox"
              name="photoAgree"
              checked={formData.photoAgree}
              onChange={handleChange}
              required
            />
            I have read this Photo / Video Permission form and my choices above are correct.
          </label>

          <div className="grid-2">
            <label>
              Printed name
              <input
                name="photoPrint"
                className="signature"
                value={formData.photoPrint}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Date
              <input
                type="date"
                name="photoDate"
                value={formData.photoDate}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label>
            Parent / guardian signature
            <input
              name="photoSignature"
              className="signature"
              placeholder="Type full legal name"
              value={formData.photoSignature}
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

export default PhotoView;
