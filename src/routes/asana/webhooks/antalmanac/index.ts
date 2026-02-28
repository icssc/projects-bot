import { Hono } from "hono";
import { AsanaTask, AsanaTaskAddedEvent, fetchAsanaTask } from "@/lib/asana";
import { parseSubmission } from "@/lib/asana/antalmanac";
import { buildEmbed } from "@/lib/asana/antalmanac/discord";
import { asanaClients } from "@/lib/asana/clients";
import { createForumThread } from "@/lib/discord/client";

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
    const embed = buildEmbed(submission);

    await createForumThread({
      channelId: asanaClients.antalmanac.discordForumChannelId,
      botToken: c.env.DISCORD_BOT_TOKEN,
      name: `[${submission.type}] ${submission.name ?? "Anonymous"}`,
      embeds: [embed],
    });
  }

  return c.body(null, 200);
});

export const antalmanacWebhookRoutes = app;
