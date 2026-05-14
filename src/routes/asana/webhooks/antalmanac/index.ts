import { Hono } from "hono";
import { AsanaTask, AsanaTaskAddedEvent, fetchAsanaTask } from "@/lib/asana";
import { discordForumThreadTitle, parseSubmission } from "@/lib/asana/antalmanac";
import { buildEmbed } from "@/lib/asana/antalmanac/discord";
import { CLIENTS as ASANA_CLIENTS } from "@/lib/asana/clients";
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

    try {
      const raw = await fetchAsanaTask({
        taskGid: gid,
        pat: c.env.ASANA_PAT_SECRET,
      });
      const task = AsanaTask.parse(raw);
      const submission = parseSubmission(task);
      const embed = buildEmbed(submission);

      const { forumTags } = ASANA_CLIENTS.antalmanac;
      const tags: string[] = [];
      if (submission.type in forumTags.type) {
        tags.push(forumTags.type[submission.type]);
      }
      if (submission.whereIsTheBug) {
        for (const [name, tagId] of Object.entries(forumTags.product)) {
          if (submission.whereIsTheBug.includes(name)) {
            tags.push(tagId);
          }
        }
      }

      await createForumThread({
        channelId: ASANA_CLIENTS.antalmanac.discordForumChannelId,
        botToken: c.env.DISCORD_BOT_TOKEN,
        name: discordForumThreadTitle(submission),
        embeds: [embed],
        appliedTags: tags,
        components: [
          {
            type: 2,
            style: 5,
            label: "View in Asana",
            url: submission.url,
          },
        ],
      });
    } catch (err) {
      console.error(`Failed to process task ${gid}:`, err);
    }
  }

  return c.body(null, 200);
});

export const antalmanacWebhookRoutes = app;
