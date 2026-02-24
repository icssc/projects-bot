import { Hono } from "hono";
import {
  AsanaTask,
  AsanaTaskAddedEvent,
  fetchAsanaTask,
} from "@/lib/webhooks/asana";
import { parseSubmission } from "./types";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: { asanaEvents: unknown[] };
}>();

app.post("/", async (c) => {
  const events = c.get("asanaEvents");
  const seen = new Set<string>();

  for (const event of events) {
    const parsed = AsanaTaskAddedEvent.safeParse(event);
    if (!parsed.success) {
      continue;
    }

    const gid = parsed.data.resource.gid;
    if (seen.has(gid)) {
      continue;
    }
    seen.add(gid);

    const raw = await fetchAsanaTask({
      taskGid: gid,
      pat: c.env.ASANA_PAT_SECRET,
    });
    const task = AsanaTask.parse(raw);
    const submission = parseSubmission(task);

    // TODO: send to Discord
    console.log("New feedback:", submission);
  }

  return c.body(null, 200);
});

export const webhooksAsanaAntalmanacRoutes = app;
