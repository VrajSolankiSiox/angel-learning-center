import React from "react";
import LocationGrid from "../components/LocationGrid";
import SelectedCenterCard from "../components/SelectedCenterCard";
import FormList from "../components/FormList";
import { useEnrollment } from "../context/EnrollmentContext";

export function HomeView() {
  const { navigateTo } = useEnrollment();

  return (
    <section id="view-home" className="view is-active">
      <div className="hero">
        <p className="hero-kicker">Online enrollment · 2026–2027</p>
        <h1 className="hero-brand">Angel Learning Center</h1>
        <p className="hero-lead">
          Choose your center, then complete the enrollment forms online. Your information is saved in this browser as
          you go, and shared fields carry across forms automatically.
        </p>
        <div className="hero-cta">
          <a
            href="#locations"
            className="btn btn-primary"
            id="ctaPickLocation"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("locations")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Choose your center
          </a>
          <a
            href="#packet"
            className="btn btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              navigateTo("packet");
            }}
          >
            View enrollment checklist
          </a>
        </div>
      </div>

      <section className="section" id="locations">
        <h2>Choose your Angel Learning Center</h2>
        <p className="section-lead">
          Select the location where you are enrolling your child. Center address, phone, and hours update with your
          selection.
        </p>
        <LocationGrid />
        <SelectedCenterCard />
      </section>

      <section className="section packet-overview">
        <h2>What to complete</h2>
        <p className="section-lead">
          Enrollment · tuition · transport (when applicable) · emergency · meal benefit · handbook · photo/video
          permission · required document uploads.
        </p>
        <FormList id="formList" />
      </section>
    </section>
  );
}

export default HomeView;
