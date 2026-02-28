import { Hono } from "hono";
import { cors } from "hono/cors";
import { antalmanacActionRoutes } from "@/routes/asana/actions/antalmanac";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use("/*", cors({ origin: "https://app.asana.com" }));
app.route("/antalmanac", antalmanacActionRoutes);

export const asanaActionRoutes = app;
