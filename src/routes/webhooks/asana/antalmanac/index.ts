import { Hono } from "hono";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: { asanaEvents: unknown[] };
}>();

app.post("/", (c) => {
  const events = c.get("asanaEvents");
  console.log("AntAlmanac events:", JSON.stringify(events));
  return c.body(null, 200);
});

export default app;
