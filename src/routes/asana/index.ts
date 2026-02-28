import { Hono } from "hono";
import { asanaActionRoutes } from "@/routes/asana/actions";
import { asanaWebhookRoutes } from "@/routes/asana/webhooks";

const app = new Hono();

app.route("/actions", asanaActionRoutes);
app.route("/webhooks", asanaWebhookRoutes);

export const asanaRoutes = app;
