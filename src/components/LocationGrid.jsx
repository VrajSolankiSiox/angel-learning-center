import React from "react";
import ALC_CONFIG from "../config";
import { useEnrollment } from "../context/EnrollmentContext";

export function LocationGrid() {
  const { selectedLocationId, applyLocation } = useEnrollment();

  const locations = Object.values(ALC_CONFIG.locations || {});

  return (
    <div className="location-grid" id="locationGrid">
      {locations.map((loc) => {
        const isSelected = loc.id === selectedLocationId;

        return (
          <button
            key={loc.id}
            type="button"
            className={`location-card ${isSelected ? "is-selected" : ""}`}
            data-location={loc.id}
            onClick={() => applyLocation(loc.id, { scroll: true })}
          >
            <span className="loc-name">{loc.name}</span>
            <span className="loc-address">{loc.address}</span>
            <span className="loc-meta">{loc.phone}</span>
            <span className="loc-meta">{loc.hours || ""}</span>
          </button>
        );
      })}
    </div>
  );
}

export default LocationGrid;
