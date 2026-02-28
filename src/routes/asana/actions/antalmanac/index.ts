import { Hono } from "hono";
import { z } from "zod";
import { AsanaTask, fetchAsanaTask } from "@/lib/asana";
import { parseSubmission } from "@/lib/asana/antalmanac";
import { buildEmbed } from "@/lib/asana/antalmanac/discord";
import { CLIENTS as ASANA_CLIENTS } from "@/lib/asana/clients";
import { createForumThread } from "@/lib/discord/client";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const MetadataQuery = z.object({
  action: z.string().optional(),
  action_type: z.string(),
  project: z.string(),
  workspace: z.string(),
  user: z.string(),
  expires_at: z.coerce.date(),
});

// https://app.asana.com/0/my-apps/1213473809004568/rule-actions
app.get("/metadata", (c) => {
  const query = MetadataQuery.safeParse(c.req.query());
  if (!query.success) {
    return c.json({ error: "Invalid query parameters." }, 400);
  }

  return c.json({
    template: "form_metadata_v0",
    metadata: {
      title: "Send AntAlmanac Feedback to Discord",
      on_submit_callback: `${new URL(c.req.url).origin}/asana/actions/antalmanac/onsubmit`,
      fields: [
        {
          id: "info",
          name: "Configuration",
          type: "static_text",
          value: `When triggered, new feedback submissions will be posted to Discord channel ${ASANA_CLIENTS.antalmanac.discordForumChannelId}.`,
        },
      ],
    },
  });
});

const OnSubmitPayload = z.object({
  data: z
    .string()
    .transform((s) => JSON.parse(s) as unknown)
    .pipe(
      z.object({
        action: z.string(),
        action_type: z.string().optional(),
        user: z.number().optional(),
        workspace: z.number().optional(),
        project: z.number().optional(),
      })
    ),
});

app.post("/onsubmit", async (c) => {
  const body = OnSubmitPayload.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ error: "Invalid request payload." }, 400);
  }

  return c.json({ action_result: "ok" });
});

const RunPayload = z.object({
  data: z
    .string()
    .transform((s) => JSON.parse(s) as unknown)
    .pipe(
      z.object({
        target_object: z.number(),
        action: z.string(),
        idempotency_key: z.string(),
      })
    ),
});

app.post("/run", async (c) => {
  const body = RunPayload.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ error: "Invalid request payload." }, 400);
  }

  const taskGid = String(body.data.data.target_object);

  const raw = await fetchAsanaTask({
    taskGid,
    pat: c.env.ASANA_PAT_SECRET,
  });
  const task = AsanaTask.parse(raw);
  const submission = parseSubmission(task);
  const embed = buildEmbed(submission);

  await createForumThread({
    channelId: ASANA_CLIENTS.antalmanac.discordForumChannelId,
    botToken: c.env.DISCORD_BOT_TOKEN,
    name: `[${submission.type}] ${submission.name ?? "Anonymous"}`,
    embeds: [embed],
    components: [
      {
        type: 2, // Button
        style: 5, // Link
        label: "View in Asana",
        url: submission.url,
      },
    ],
  });

  return c.json({ action_result: "ok" });
});

export const antalmanacActionRoutes = app;
