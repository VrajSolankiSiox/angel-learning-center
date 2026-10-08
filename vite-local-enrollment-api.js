import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUBMIT_PATH = "/api/submit-enrollment";

/**
 * Run submit-enrollment on the Vite dev server so local tests use your .env
 * RESEND_API_KEY and always route completion mail to the dev inbox.
 */
export function localEnrollmentApiPlugin(env) {
  return {
    name: "local-enrollment-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.originalUrl || req.url || "").split("?")[0];
        if (path !== SUBMIT_PATH) {
          return next();
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        if (env.RESEND_API_KEY) {
          process.env.RESEND_API_KEY = env.RESEND_API_KEY;
        }
        if (env.RESEND_FROM_EMAIL) {
          process.env.RESEND_FROM_EMAIL = env.RESEND_FROM_EMAIL;
        }
        process.env.DEV_NOTIFICATION_EMAIL =
          env.DEV_NOTIFICATION_EMAIL ||
          env.VITE_LOCAL_DEV_NOTIFICATION_EMAIL ||
          "dev4@sioxglobal.com";

        req.headers["x-alc-local-dev"] = "1";

        try {
          const handlerPath = pathToFileURL(resolve(__dirname, "api/submit-enrollment.js")).href;
          const { default: handler } = await import(`${handlerPath}?v=${Date.now()}`);
          await handler(req, res);
        } catch (err) {
          console.error("[local-enrollment-api]", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: err?.message || "Local email API failed",
                hint: "Add RESEND_API_KEY to a .env file in the project root and restart npm run dev.",
              })
            );
          }
        }
      });
    },
  };
}
