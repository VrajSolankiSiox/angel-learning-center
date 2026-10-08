import { useCallback, useEffect, useRef, useState } from "react";
import { getSubmissionStorageKey } from "../pdf/pdfGenerator";
import { submitEnrollmentEmail, getNotificationEmail } from "../utils/submitEnrollmentEmail";

export function useSubmitEnrollmentEmail({ type, state, location, autoSend = false }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState(() => getNotificationEmail(location));
  const [documentCount, setDocumentCount] = useState(0);
  const storageKey = state ? getSubmissionStorageKey(state, type) : "";
  const locationKey = location?.id || state?.locationId || "";
  const autoStartedRef = useRef("");

  const submit = useCallback(async () => {
    if (!state || !storageKey) return;
    if (status === "sending") return;

    setStatus("sending");
    setError("");
    try {
      const result = await submitEnrollmentEmail({ type, state, location });
      setSentTo(result.to || getNotificationEmail(location));
      setDocumentCount(result.documentCount || 0);
      if (result.skipped) {
        setStatus("skipped");
      } else {
        setStatus("sent");
        if (import.meta.env.DEV && result.localDev === false) {
          console.warn(
            "Enrollment email was sent but the API did not mark localDev — check that npm run dev is running and RESEND_API_KEY is in .env"
          );
        }
      }
    } catch (err) {
      console.error("Enrollment email submission failed:", err);
      setError(err.message || "Could not send enrollment email");
      setStatus("error");
    }
  }, [type, state, location, storageKey, status]);

  useEffect(() => {
    if (!autoSend || !state || !storageKey) return;
    if (autoStartedRef.current) return;
    autoStartedRef.current = true;
    submit();
  }, [autoSend, storageKey, locationKey, state, location, submit]);

  return { status, error, sentTo, documentCount, submit };
}
