import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { flushSync } from "react-dom";
import ALC_CONFIG from "../config";
import { ALL_FORMS, I18N } from "../constants";
import {
  needsEmergencyMedicalForm as checkEmergencyMedical,
  needsTransportForm as checkTransport,
} from "../utils/programSelection";
import {
  joinPersonName,
  resolveResponsiblePartyName,
  isFirstNameOnlyPrefill,
  parentInitialsFromEnrollment,
} from "../utils/formValues";
import { firstIncompletePacketStep, missingRequiredUploads } from "../utils/requiredDocuments";

const STORAGE_KEY = "alc-enrollment-v1-multi";
const LANG_KEY = "alc-enrollment-lang";

const EnrollmentContext = createContext(null);

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        completed: parsed.completed || {},
        data: parsed.data || {},
        locationId: parsed.locationId || parsed.data?.enrollment?.enLocation || "savannah",
        siblings: parsed.siblings || [],
        flowMode: parsed.flowMode === "waitlist" ? "waitlist" : "full",
      };
    }
  } catch (e) {
    console.error("Failed to load initial enrollment state:", e);
  }
  return {
    completed: {},
    data: {},
    locationId: "savannah",
    siblings: [],
    flowMode: "full",
  };
}

export function EnrollmentProvider({ children }) {
  const [state, setState] = useState(loadInitialState);
  const [lang, setLang] = useState(() => {
    return localStorage.getItem(LANG_KEY) || "en";
  });
  const [currentView, setCurrentView] = useState(() => {
    let h = (window.location.hash || "#home").slice(1) || "home";
    if (h === "auth") h = "home";
    return h;
  });
  const [toast, setToast] = useState({ message: "", visible: false });
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const incompleteStepRef = useRef(null);
  const gateToastRef = useRef(null);
  const allowDoneAfterSubmitRef = useRef(false);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }, [state]);

  // Sync lang to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang);
      document.documentElement.lang = lang;
    } catch (e) {
      console.error("Failed to save lang:", e);
    }
  }, [lang]);

  const redirectIfDoneBlocked = useCallback((viewId) => {
    if (viewId !== "done") return viewId;
    if (allowDoneAfterSubmitRef.current) return viewId;
    const blocked = incompleteStepRef.current;
    if (!blocked) return viewId;

    const labels = (blocked.missingDocs || []).map((item) => item.label);
    const message = blocked.id === "uploads" && labels.length
      ? `Upload every required document before finishing: ${labels.join(", ")}`
      : "Complete every required form and the required documents before the completion page.";
    setToast({ message, visible: true });
    clearTimeout(gateToastRef.current);
    gateToastRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4200);
    return blocked.id || "uploads";
  }, []);

  // Hash change navigation listener
  useEffect(() => {
    const handleHashChange = () => {
      let h = (window.location.hash || "#home").slice(1) || "home";
      if (h === "auth") h = "home";
      if (h !== "done" && h !== "waitlist-done") allowDoneAfterSubmitRef.current = false;
      const next = redirectIfDoneBlocked(h);
      if (next !== h) {
        window.location.hash = `#${next}`;
      }
      setCurrentView(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [redirectIfDoneBlocked]);

  const navigateTo = useCallback((viewId) => {
    if (viewId !== "done" && viewId !== "waitlist-done") allowDoneAfterSubmitRef.current = false;
    const next = redirectIfDoneBlocked(viewId);
    window.location.hash = `#${next}`;
    setCurrentView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [redirectIfDoneBlocked]);

  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2400);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmDialog({ open: false });
  }, []);

  const showConfirm = useCallback((options) => {
    setConfirmDialog({ open: true, ...options });
  }, []);

  const confirmDialogAction = useCallback(() => {
    confirmDialog.onConfirm?.();
    setConfirmDialog({ open: false });
  }, [confirmDialog]);

  const t = useCallback(
    (key) => {
      return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
    },
    [lang]
  );

  const selectedLocationId = useMemo(() => {
    return (
      state.locationId ||
      state.data?.enrollment?.enLocation ||
      state.data?.transport?.trLocation ||
      "savannah"
    );
  }, [state.locationId, state.data?.enrollment?.enLocation, state.data?.transport?.trLocation]);

  const activeLocation = useMemo(() => {
    return (
      ALC_CONFIG.locations?.[selectedLocationId] ||
      ALC_CONFIG.locations?.savannah ||
      {}
    );
  }, [selectedLocationId]);

  const selectedPrograms = useCallback(() => {
    const en = state.data?.enrollment || {};
    const raw = en.programs || "";
    if (Array.isArray(raw)) return raw;
    return String(raw)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [state.data?.enrollment]);

  const needsTransportForm = useCallback(() => {
    return checkTransport(selectedPrograms());
  }, [selectedPrograms]);

  const needsEmergencyMedicalForm = useCallback(() => {
    return checkEmergencyMedical(selectedPrograms());
  }, [selectedPrograms]);

  const needsLittleAngels = useCallback(() => {
    return selectedPrograms().includes("little_angels");
  }, [selectedPrograms]);

  const activeForms = useMemo(() => {
    const transportNeeded = needsTransportForm();
    const emergencyNeeded = needsEmergencyMedicalForm();
    return ALL_FORMS.filter((f) => {
      if (f.always) return true;
      if (f.requiresTransport && transportNeeded) return true;
      if (f.requiresEmergencyMedical && emergencyNeeded) return true;
      return false;
    });
  }, [needsTransportForm, needsEmergencyMedicalForm]);

  incompleteStepRef.current =
    state.flowMode === "waitlist"
      ? null
      : firstIncompletePacketStep(activeForms, state.completed, state.data);

  useEffect(() => {
    if (currentView !== "done" || state.flowMode === "waitlist") return;
    if (allowDoneAfterSubmitRef.current) return;
    const blocked = incompleteStepRef.current;
    if (!blocked) return;
    const next = redirectIfDoneBlocked("done");
    if (next !== "done") {
      window.location.hash = `#${next}`;
      setCurrentView(next);
    }
  }, [currentView, state.flowMode, state.completed, state.data, activeForms, redirectIfDoneBlocked]);

  useEffect(() => {
    if (state.flowMode === "waitlist" || !state.completed.uploads) return;
    if (missingRequiredUploads(state.data).length === 0) return;
    setState((prev) => ({
      ...prev,
      completed: { ...prev.completed, uploads: false },
    }));
  }, [state.flowMode, state.completed.uploads, state.data]);

  const completedCount = useMemo(() => {
    return activeForms.filter((f) => !!state.completed[f.id]).length;
  }, [activeForms, state.completed]);

  const formTitle = useCallback(
    (form) => {
      return lang === "es" ? form.titleEs : form.title;
    },
    [lang]
  );

  const formBlurb = useCallback(
    (form) => {
      return lang === "es" ? form.blurbEs : form.blurb;
    },
    [lang]
  );

  const isWaitlistFlow = state.flowMode === "waitlist";

  const startWaitlistFlow = useCallback(() => {
    setState((prev) => ({ ...prev, flowMode: "waitlist" }));
    navigateTo("enrollment");
  }, [navigateTo]);

  const startFullEnrollment = useCallback(() => {
    setState((prev) => ({ ...prev, flowMode: "full" }));
    navigateTo("enrollment");
  }, [navigateTo]);

  const setFullFlowMode = useCallback(() => {
    setState((prev) => ({ ...prev, flowMode: "full" }));
  }, []);

  const applyLocation = useCallback(
    (locationId, { scroll = false } = {}) => {
      const loc = ALC_CONFIG.locations?.[locationId];
      if (!loc) return;

      setState((prev) => {
        const next = { ...prev, locationId: loc.id };
        if (!next.data) next.data = {};
        if (!next.data.enrollment) next.data.enrollment = {};
        if (!next.data.transport) next.data.transport = {};
        next.data.enrollment.enLocation = loc.id;
        next.data.transport.trLocation = loc.id;

        // Default emergency facility from handbook by location if not explicitly customized
        if (loc.hospital) {
          const prior = next.data.emergency?.emFacility;
          const hospitals = Object.values(ALC_CONFIG.locations || {})
            .map((l) => l.hospital)
            .filter(Boolean);
          if (!prior || hospitals.includes(prior)) {
            if (!next.data.emergency) next.data.emergency = {};
            next.data.emergency.emFacility = loc.hospital;
          }
        }
        return next;
      });

      if (scroll) {
        const card = document.getElementById("selectedCenterCard");
        card?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    },
    []
  );

  // Carry forward logic helper
  const computeCarryForward = useCallback((currentState) => {
    const en = currentState.data?.enrollment || {};
    const fin = currentState.data?.financial || {};

    const child = joinPersonName(en.childFirst, en.childMI, en.childLast) || fin.finChildName || "";
    const mom = joinPersonName(en.momFirst, en.momMI, en.momLast);
    const dad = joinPersonName(en.dadFirst, en.dadMI, en.dadLast);
    const signer = resolveResponsiblePartyName(fin, en) || "";
    const parentInitials = parentInitialsFromEnrollment(en, fin);

    const city = (en.childCity || "").trim();
    const zip = (en.childZip || "").trim();
    const cityStateZip = city && zip ? `${city}, GA ${zip}` : city ? `${city}, GA` : zip;

    const line1 = (en.childAddress || "").trim();
    const homeLine = line1 && cityStateZip ? `${line1}, ${cityStateZip}` : line1 || cityStateZip || "";

    const phone = en.momCell || en.dadCell || fin.rpPhone || "";
    const email = en.momEmail || en.dadEmail || fin.rpEmail || "";
    const dob = en.childDob || "";
    const today = new Date().toISOString().slice(0, 10);
    const locId = currentState.locationId || en.enLocation || "savannah";

    return {
      financial: {
        finChildName: child,
        rpName: signer,
        rpAddress: en.childAddress || "",
        rpCityStateZip: cityStateZip,
        rpPhone: phone,
        rpEmail: email,
        rpEmployer: en.momEmployer || en.dadEmployer || "",
        finPrintName: signer,
        finSignature: signer,
        finSignDate: today,
        finEnrollDate: en.startDate || "",
      },
      transport: {
        trChild: child,
        trSignature: signer,
        trDate: today,
        trArriveTime: en.careTo || "",
        trLocation: en.enLocation || locId,
      },
      handbook: {
        hbPrint: signer,
        hbSignature: signer,
        hbDate: today,
        hbChild: child,
      },
      emergency: {
        emChild: child,
        emAuthChild: child,
        emDob: dob,
        emAddress: homeLine || en.childAddress || "",
        emFather: dad,
        emMother: mom,
        emFatherCell: en.dadCell || "",
        emMotherCell: en.momCell || "",
        emSignature: signer,
        emDate: today,
        emFacility: ALC_CONFIG.locations?.[locId]?.hospital || "",
      },
      ies: {
        iesAckPrint: signer,
        iesAckDate: today,
      },
      photo: {
        photoChild: child,
        photoPrint: signer,
        photoSignature: signer,
        photoDate: today,
      },
      policyAck: {
        ppChildName: child,
        ppChildDob: dob,
        ppParentName: signer,
        ppCenterLocation: ALC_CONFIG.locations?.[locId]?.legalName || ALC_CONFIG.locations?.[locId]?.name || "",
        ppInitialsSleep: parentInitials,
        ppInitialsProhibited: parentInitials,
        ppInitialsFamily: parentInitials,
        ppPrintName: signer,
        ppSignature: signer,
        ppSignDate: today,
      },
      safeSleep: {
        ssChildName: child,
        ssChildDob: dob,
        ssCenterLocation: ALC_CONFIG.locations?.[locId]?.legalName || ALC_CONFIG.locations?.[locId]?.name || "",
        ssPrintName: signer,
        ssSignature: signer,
        ssSignDate: today,
      },
      strollerRide: {
        srChildName: child,
        srChildDob: dob,
        srCenterLocation: ALC_CONFIG.locations?.[locId]?.legalName || ALC_CONFIG.locations?.[locId]?.name || "",
        srPrintName: signer,
        srSignature: signer,
        srSignDate: today,
      },
      watchMeGrow: {
        wmgChildName: child,
        wmgPrintName: signer,
        wmgSignature: signer,
        wmgSignDate: today,
      },
    };
  }, []);

  const applyCarryForward = useCallback(
    ({ force = false, onlyForm = null } = {}) => {
      setState((prev) => {
        const carryMap = computeCarryForward(prev);
        const nextData = { ...prev.data };
        const enrollment = prev.data?.enrollment || {};
        let changed = false;

        const isBlank = (v) => v === undefined || v === null || v === "" || v === false;
        const STALE_SIGNER_KEYS = {
          financial: new Set(["rpName", "finPrintName", "finSignature"]),
          photo: new Set(["photoPrint", "photoSignature"]),
          watchMeGrow: new Set(["wmgPrintName", "wmgSignature"]),
        };
        const AUTO_REFRESH_KEYS = {
          policyAck: new Set(["ppInitialsSleep", "ppInitialsProhibited", "ppInitialsFamily"]),
        };

        Object.entries(carryMap).forEach(([formId, source]) => {
          if (onlyForm && onlyForm !== formId) return;
          const formForce = force && !prev.completed[formId];
          const target = { ...(nextData[formId] || {}) };
          let formChanged = false;

          Object.entries(source).forEach(([key, val]) => {
            if (isBlank(val)) return;
            const staleSignerName =
              STALE_SIGNER_KEYS[formId]?.has(key) &&
              isFirstNameOnlyPrefill(target[key], enrollment);
            const autoRefresh = AUTO_REFRESH_KEYS[formId]?.has(key);
            if (formForce || isBlank(target[key]) || staleSignerName || autoRefresh) {
              if (target[key] !== val) {
                target[key] = val;
                formChanged = true;
              }
            }
          });

          if (formChanged) {
            nextData[formId] = target;
            changed = true;
          }
        });

        return changed ? { ...prev, data: nextData } : prev;
      });
    },
    [computeCarryForward]
  );

  const saveForm = useCallback(
    (formId, formData, markComplete = true, options = {}) => {
      const { silent = false } = options;
      const payload = formData;
      const commit = () => {
        setState((prev) => {
          const next = {
            ...prev,
            data: {
              ...prev.data,
              [formId]: {
                ...(prev.data[formId] || {}),
                ...payload,
              },
            },
            completed: {
              ...prev.completed,
              [formId]: markComplete ? true : prev.completed[formId],
            },
          };
          return next;
        });
      };
      if (markComplete) {
        flushSync(commit);
      } else {
        commit();
      }

      if (formId === "enrollment" || formId === "financial") {
        setTimeout(() => {
          applyCarryForward({ force: true });
        }, 10);
      }

      if (!silent) {
        showToast(
          formId === "enrollment"
            ? lang === "es"
              ? "Guardado — datos copiados a los demás formularios"
              : "Saved — shared details carried to the other forms"
            : t("toastSaved")
        );
      }
    },
    [applyCarryForward, lang, showToast, t]
  );

  const autoSaveForm = useCallback(
    (formId, formData) => {
      const payload = formData;
      setState((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [formId]: {
            ...(prev.data[formId] || {}),
            ...payload,
          },
        },
      }));

      if (formId === "enrollment" || formId === "financial") {
        setTimeout(() => {
          applyCarryForward({ force: false });
        }, 10);
      }
    },
    [applyCarryForward]
  );

  const clearPacket = useCallback(() => {
    allowDoneAfterSubmitRef.current = true;
    setState((prev) => ({
      completed: {},
      data: {},
      locationId: prev.locationId || "savannah",
      siblings: [],
      flowMode: prev.flowMode === "waitlist" ? "waitlist" : "full",
    }));
  }, []);

  const resetPacket = useCallback(() => {
    showConfirm({
      title: t("resetPacketTitle"),
      message: t("confirmReset"),
      confirmLabel: t("resetPacketConfirm"),
      cancelLabel: t("cancel"),
      onConfirm: () => {
        setState({ completed: {}, data: {}, locationId: "savannah", siblings: [], flowMode: "full" });
        showToast(t("toastReset"));
        navigateTo("home");
      },
    });
  }, [navigateTo, showConfirm, showToast, t]);

  const addSibling = useCallback(() => {
    setState((prev) => {
      const en = prev.data?.enrollment || {};
      const newSiblings = [
        ...(prev.siblings || []),
        {
          first: en.childFirst || "",
          last: en.childLast || "",
          dob: en.childDob || "",
          note: "Primary child on forms",
        },
      ];

      const nextData = {
        ...prev.data,
        enrollment: {
          ...(prev.data.enrollment || {}),
          childFirst: "",
          childMI: "",
          childLast: "",
          childPreferred: "",
          childGrade: "",
          childDob: "",
          childGender: "",
          medicalNotes: "",
        },
      };

      return {
        ...prev,
        siblings: newSiblings,
        data: nextData,
        completed: {
          ...prev.completed,
          enrollment: false,
          transport: false,
          emergency: false,
        },
      };
    });

    showToast("Sibling slot started — enter the next child’s details on Enrollment");
    navigateTo("enrollment");
  }, [navigateTo, showToast]);

  const uploadFile = useCallback(
    (uploadDefId, fileMetaList, uploadedBy = "parent", note = "") => {
      setState((prev) => {
        const uploads = prev.data?.uploads || {};
        const files = { ...(uploads.files || {}) };
        const staffLog = [...(uploads.staffLog || [])];

        const def = (ALC_CONFIG.uploads || []).find((u) => u.id === uploadDefId);
        const prevFiles = files[uploadDefId] || [];

        const newItems = fileMetaList.map((f) => ({
          ...f,
          uploadedBy,
          note: note.trim(),
        }));

        files[uploadDefId] = def?.multiple ? [...prevFiles, ...newItems] : newItems;

        if (uploadedBy === "staff") {
          newItems.forEach((m) => {
            staffLog.push({
              id: uploadDefId,
              label: def?.label || uploadDefId,
              name: m.name,
              uploadedAt: m.uploadedAt,
              note: m.note,
            });
          });
        }

        const allReqPresent = missingRequiredUploads({ uploads: { ...uploads, files } }).length === 0;

        return {
          ...prev,
          data: {
            ...prev.data,
            uploads: {
              ...uploads,
              files,
              staffLog,
            },
          },
          completed: {
            ...prev.completed,
            uploads: allReqPresent ? prev.completed.uploads : false,
          },
        };
      });
    },
    []
  );

  const value = {
    state,
    setState,
    lang,
    setLang,
    currentView,
    navigateTo,
    toast,
    showToast,
    confirmDialog,
    closeConfirm,
    confirmDialogAction,
    showConfirm,
    t,
    selectedLocationId,
    activeLocation,
    applyLocation,
    selectedPrograms,
    needsTransportForm,
    needsEmergencyMedicalForm,
    needsLittleAngels,
    activeForms,
    completedCount,
    formTitle,
    formBlurb,
    applyCarryForward,
    saveForm,
    autoSaveForm,
    resetPacket,
    clearPacket,
    addSibling,
    uploadFile,
    flowMode: state.flowMode,
    isWaitlistFlow,
    startWaitlistFlow,
    startFullEnrollment,
    setFullFlowMode,
  };

  return <EnrollmentContext.Provider value={value}>{children}</EnrollmentContext.Provider>;
}

export function useEnrollment() {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error("useEnrollment must be used within an EnrollmentProvider");
  }
  return context;
}
