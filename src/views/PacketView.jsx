import React from "react";
import ProgressBar from "../components/ProgressBar";
import FormList from "../components/FormList";
import { useEnrollment } from "../context/EnrollmentContext";

export function PacketView() {
  const { t } = useEnrollment();

  return (
    <section id="view-packet" className="view is-active">
      <div className="page-head">
        <p className="eyebrow" data-i18n="packetEyebrow">
          {t("packetEyebrow")}
        </p>
        <h2 data-i18n="packetTitle">{t("packetTitle")}</h2>
        <p className="section-lead" data-i18n="packetLead">
          {t("packetLead")}
        </p>
        <ProgressBar />
      </div>
      <div className="form-area-outline">
        <FormList id="packetList" />
      </div>
    </section>
  );
}

export default PacketView;
