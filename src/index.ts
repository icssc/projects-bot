import { Hono } from "hono";
import { asanaRoutes } from "@/routes/asana";
import { discordRoutes } from "@/routes/discord";

const app = new Hono();

app.get("/", (c) => c.text("Hello World!"));
app.route("/asana", asanaRoutes);
app.route("/discord/interactions", discordRoutes);

export default app;
