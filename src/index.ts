import { Hono } from "hono";
import { asanaRoutes } from "@/routes/asana";

const app = new Hono();

app.get("/", (c) => c.text("Hello World!"));
app.route("/asana", asanaRoutes);

export default app;
