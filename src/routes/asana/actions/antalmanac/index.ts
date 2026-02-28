import { Hono } from "hono";
import { z } from "zod";
import { AsanaTask, fetchAsanaTask } from "@/lib/asana";
import { parseSubmission } from "@/lib/asana/antalmanac";
import { buildEmbed } from "@/lib/asana/antalmanac/discord";
import { asanaClients } from "@/lib/asana/clients";
import { createForumThread } from "@/lib/discord/client";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/metadata", (c) => {
  return c.json({
    template: "form_metadata_v0",
    metadata: {
      title: "Send AntAlmanac Feedback to Discord",
      on_submit_callback: `${new URL(c.req.url).origin}/asana/actions/antalmanac/onsubmit`,
      fields: [
        {
          id: "info",
          name: "",
          type: "static_text",
          value:
            "Posts new feedback submissions to the configured AntAlmanac Discord forum channel.",
        },
      ],
    },
  });
});

app.post("/onsubmit", (c) => {
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
    channelId: asanaClients.antalmanac.discordForumChannelId,
    botToken: c.env.DISCORD_BOT_TOKEN,
    name: `[${submission.type}] ${submission.name ?? "Anonymous"}`,
    embeds: [embed],
  });

  return c.json({ action_result: "ok" });
});

export const antalmanacActionRoutes = app;
