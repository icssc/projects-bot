import { Hono } from "hono";
import { AsanaTaskAddedEvent } from "@/lib/webhooks/asana";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: { asanaEvents: unknown[] };
}>();

app.post("/", (c) => {
  const events = c.get("asanaEvents");

  for (const event of events) {
    const parsed = AsanaTaskAddedEvent.safeParse(event);

    if (!parsed.success) {
      continue;
    }

    console.log("New task added:", parsed.data.resource.gid);
  }

  return c.body(null, 200);
});

export const webhooksAsanaAntalmanacRoutes = app;
