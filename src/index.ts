import { Hono } from "hono";
import { webhooksAsanaRoutes } from "@/routes/webhooks/asana";

const app = new Hono();

app.get("/", (c) => c.text("Hello World!"));
app.route("/webhooks/asana", webhooksAsanaRoutes);

export default app;
