import React from "react";
import { useEnrollment } from "../context/EnrollmentContext";

const ENROLLMENT_HELP_PHONE = "912-600-3899";
const ENROLLMENT_HELP_PHONE_HREF = "tel:+19126003899";

export function EnrollmentSubmissionDisclaimer({ className = "", showTitle = true, id }) {
  const { t } = useEnrollment();

  const title = t("enrollmentDisclaimerTitle") || "Enrollment Submission Disclaimer";

  return (
    <aside
      id={id}
      className={className ? `enrollment-submission-disclaimer ${className}` : "enrollment-submission-disclaimer"}
      aria-labelledby={showTitle ? "enrollmentDisclaimerTitle" : undefined}
    >
      {showTitle ? (
        <h3 id="enrollmentDisclaimerTitle" className="enrollment-disclaimer-title">
          {title}
        </h3>
      ) : null}

      <div className="enrollment-disclaimer-body">
        <p>
          Submitting this form does not guarantee a spot on your selected start date. All enrollments are subject to
          availability and center confirmation.
        </p>
        <p>
          The registration fee and tuition must be paid in person before your child&apos;s confirmed start date.
        </p>
        <p>
          Our team will contact you after receiving your form to confirm availability and discuss the start date.
        </p>
        <p>
          For assistance, call{" "}
          <a href={ENROLLMENT_HELP_PHONE_HREF}>
            <strong>{ENROLLMENT_HELP_PHONE}</strong>
          </a>
          .
        </p>
      </div>
    </aside>
  );
}

export default EnrollmentSubmissionDisclaimer;