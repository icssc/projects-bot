import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { antalmanacWebhookRoutes } from "@/routes/asana/webhooks/antalmanac";

interface AsanaEnv {
  Bindings: CloudflareBindings;
  Variables: { asanaEvents: unknown[] };
}

const asanaWebhook = createMiddleware<AsanaEnv>(async (c, next) => {
  const hookSecret = c.req.header("x-hook-secret");
  if (hookSecret) {
    c.header("x-hook-secret", hookSecret);
    return c.body(null, 200);
  }

  const body = await c.req.text();
  const signature = c.req.header("x-hook-signature");

  if (signature) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(c.env.ASANA_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const computed = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (computed !== signature) {
      return c.json({ error: "Invalid signature" }, 401);
    }
  }

  const { events } = JSON.parse(body);
  c.set("asanaEvents", events);

  await next();
});

const app = new Hono<AsanaEnv>();

app.use("/*", asanaWebhook);
app.route("/antalmanac", antalmanacWebhookRoutes);

export const asanaWebhookRoutes = app;
