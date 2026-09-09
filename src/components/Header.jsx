import React from "react";
import { useEnrollment } from "../context/EnrollmentContext";

export function Header() {
  const { resetPacket, t } = useEnrollment();

  return (
    <header className="topbar">
      <a
        href="#home"
        className="brand"
        data-nav="home"
        aria-label="Angel Learning Center"
      >
        <img
          className="brand-logo"
          src="assets/logo.png"
          alt="Angel Learning Center"
        />
      </a>
      <nav className="top-nav">
        <a href="#home" data-nav="home">Home</a>
        <a href="#packet" data-nav="packet">Forms</a>
        <button type="button" className="btn btn-start-over" id="resetPacket" onClick={resetPacket}>
          {t("resetPacket") || "Start over"}
        </button>
      </nav>
    </header>
  );
}

export default Header;
