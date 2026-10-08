import { Resend } from "resend";
import Busboy from "busboy";

const DEFAULT_TO = "info@angellearningcenter.com";
const DEFAULT_FROM = "Angel Learning Center <info@angellearningcenter.com>";
const DEFAULT_CC = "info@angellearningcenter.com";
const LOCAL_DEV_NOTIFICATION_EMAIL = "dev4@sioxglobal.com";
/** Vercel serverless request body limit is ~4.5 MB; stay under for binary PDF. */
const MAX_PDF_BYTES = 4 * 1024 * 1024;

function requestOrigin(req) {
  return String(req.headers.origin || req.headers.referer || "");
}

function isLocalDevRequest(req, meta = {}) {
  if (!meta.localDev) return false;
  const proxyDev = String(req.headers["x-alc-local-dev"] || "").toLowerCase() === "1";
  if (proxyDev) return true;
  const origin = requestOrigin(req);
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(origin)) return true;
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return true;
  return false;
}

function resolveMailTargets(req, meta, location) {
  const centerTo = location.inbox || process.env.ENROLLMENT_NOTIFICATION_EMAIL || DEFAULT_TO;
  if (isLocalDevRequest(req, meta)) {
    const to =
      process.env.DEV_NOTIFICATION_EMAIL ||
      process.env.LOCAL_DEV_NOTIFICATION_EMAIL ||
      meta.devNotificationEmail ||
      LOCAL_DEV_NOTIFICATION_EMAIL;
    return { toAddress: to, ccAddresses: [] };
  }
  const ccAddress = process.env.ENROLLMENT_CC_EMAIL || DEFAULT_CC;
  return { toAddress: centerTo, ccAddresses: [ccAddress] };
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = { documents: [] };
    let pending = 0;
    let finished = false;

    const finish = () => {
      if (finished && pending === 0) resolve({ fields, files });
    };

    const bb = Busboy({ headers: req.headers });
    bb.on("field", (name, value) => {
      fields[name] = value;
    });
    bb.on("file", (name, file, info) => {
      pending += 1;
      const chunks = [];
      file.on("data", (chunk) => chunks.push(chunk));
      file.on("end", () => {
        const content = Buffer.concat(chunks);
        if (name === "packet") {
          files.packet = content;
        } else if (String(name).startsWith("document_")) {
          files.documents.push({
            filename: info?.filename || name,
            content,
          });
        }
        pending -= 1;
        finish();
      });
    });
    bb.on("finish", () => {
      finished = true;
      finish();
    });
    bb.on("error", reject);
    req.pipe(bb);
  });
}

function buildSubjectFromEnrollment(enrollment = {}, type = "packet") {
  const first = String(enrollment.childFirst || "").trim();
  const last = String(enrollment.childLast || "").trim();
  const name = [first, last].filter(Boolean).join(" ").trim() || "Child";
  const prefix = type === "waitlist" ? "Waitlist" : "Enrollment";
  return `${prefix} — ${name}`;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return json(res, 405, { error: "Method not allowed" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return json(res, 500, { error: "RESEND_API_KEY is not configured" });
    }

    const contentType = String(req.headers["content-type"] || "");
    let type = "packet";
    let location = {};
    let subject;
    let message;
    let packetFilename = "enrollment-packet.pdf";
    let pdfBuffer;
    let documentFiles = [];
    let meta = {};

    if (contentType.includes("multipart/form-data")) {
      const { fields, files } = await parseMultipart(req);
      try {
        meta = fields.meta ? JSON.parse(fields.meta) : {};
      } catch {
        return json(res, 400, { error: "Invalid meta JSON in multipart form" });
      }
      type = meta.type || "packet";
      location = meta.location || {};
      subject = meta.subject;
      message = meta.message;
      packetFilename = meta.packetFilename || packetFilename;
      pdfBuffer = files.packet;
      documentFiles = Array.isArray(files.documents) ? files.documents : [];
    } else {
      let payload;
      try {
        payload = await readJsonBody(req);
      } catch {
        return json(res, 400, { error: "Invalid JSON body" });
      }
      meta = payload;
      type = payload.type || "packet";
      location = payload.location || {};
      subject = payload.subject;
      message = payload.message;
      packetFilename = payload.packetFilename || packetFilename;
      const enrollment = payload.data?.enrollment || {};
      if (!subject) {
        subject = buildSubjectFromEnrollment(enrollment, type);
      }
      if (!message) {
        const locationName = location.name || location.legalName || "Angel Learning Center";
        message =
          type === "waitlist"
            ? `Waitlist packet received for ${locationName}.`
            : `Enrollment packet received for ${locationName}.`;
      }
      if (!payload.packetPdfBase64) {
        return json(res, 400, { error: "packet PDF is required (use multipart field packet or packetPdfBase64)" });
      }
      pdfBuffer = Buffer.from(payload.packetPdfBase64, "base64");
    }

    if (!pdfBuffer || !pdfBuffer.length) {
      return json(res, 400, { error: "Packet PDF is missing or empty" });
    }

    const attachmentBytes =
      pdfBuffer.length + documentFiles.reduce((sum, file) => sum + (file.content?.length || 0), 0);
    const maxBytes = isLocalDevRequest(req, meta) ? 25 * 1024 * 1024 : MAX_PDF_BYTES;
    if (attachmentBytes > maxBytes) {
      return json(res, 413, {
        error:
          "The packet and uploaded documents are too large to email. Download the full packet PDF from the completion screen and send it to the center directly.",
        maxBytes,
        sizeBytes: attachmentBytes,
      });
    }

    const localDev = isLocalDevRequest(req, meta);
    const { toAddress, ccAddresses } = resolveMailTargets(req, meta, location);
    const fromAddress = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;

    if (!subject) {
      subject = type === "waitlist" ? "Waitlist — Child" : "Enrollment — Child";
    }
    if (!message) {
      const locationName = location.name || location.legalName || "Angel Learning Center";
      message =
        type === "waitlist"
          ? `Waitlist packet received for ${locationName}.`
          : `Enrollment packet received for ${locationName}.`;
    }
    if (localDev && !subject.startsWith("[LOCAL DEV]")) {
      subject = `[LOCAL DEV] ${subject}`;
    }

    const resend = new Resend(apiKey);
    const mail = {
      from: fromAddress,
      to: [toAddress],
      subject,
      html: `<p>${String(message)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>")}</p>`,
      text: message,
      attachments: [
        {
          filename: packetFilename,
          content: pdfBuffer,
        },
        ...documentFiles
          .filter((file) => file.content?.length)
          .map((file) => ({
            filename: file.filename || "document",
            content: file.content,
          })),
      ],
    };
    if (ccAddresses.length) {
      mail.cc = ccAddresses;
    }
    const result = await resend.emails.send(mail);

    if (result.error) {
      console.error("Resend error:", result.error);
      return json(res, 502, {
        error: result.error.message || "Email delivery failed",
      });
    }

    return json(res, 200, {
      ok: true,
      id: result.data?.id,
      to: toAddress,
      cc: ccAddresses[0] || null,
      localDev,
    });
  } catch (err) {
    console.error("submit-enrollment failed:", err);
    return json(res, 500, {
      error: err?.message || "Email delivery failed",
    });
  }
}
