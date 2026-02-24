import { Hono } from "hono";
import asana from "./routes/webhooks/asana";

const app = new Hono();

app.get("/", (c) => c.text("Hello World!"));
app.route("/webhooks/asana", asana);

export default app;
