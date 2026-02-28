import { Hono } from "hono";
import { asanaWebhookRoutes } from "@/routes/asana/webhooks";

const app = new Hono();

app.route("/webhooks", asanaWebhookRoutes);

export const asanaRoutes = app;
