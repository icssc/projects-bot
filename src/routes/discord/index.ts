import { verifyKey } from "discord-interactions";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { commands } from "@/lib/discord/commands";

interface DiscordEnv {
  Bindings: CloudflareBindings;
}

const verifyDiscordRequest = createMiddleware<DiscordEnv>(async (c, next) => {
  const signature = c.req.header("x-signature-ed25519");
  const timestamp = c.req.header("x-signature-timestamp");
  const body = await c.req.text();

  if (!(signature && timestamp)) {
    return c.json({ error: "Missing signature headers" }, 401);
  }

  const isValid = await verifyKey(
    body,
    signature,
    timestamp,
    c.env.DISCORD_PUBLIC_KEY
  );
  if (!isValid) {
    return c.json({ error: "Invalid request signature" }, 401);
  }

  c.set("rawBody" as never, body);
  await next();
});

const app = new Hono<DiscordEnv>();

app.post("/", verifyDiscordRequest, async (c) => {
  const body = JSON.parse(c.get("rawBody" as never) as string);
  const { type } = body;

  // PING — Discord's endpoint verification
  if (type === 1) {
    return c.json({ type: 1 });
  }

  // APPLICATION_COMMAND
  if (type === 2) {
    const commandName = body.data.name as string;
    const command = commands[commandName as keyof typeof commands];
    if (!command) {
      return c.json({
        type: 4,
        data: { content: `Unknown command: ${commandName}` },
      });
    }
    return c.json(command.handleCommand());
  }

  // MODAL_SUBMIT
  if (type === 5) {
    const customId = body.data.custom_id as string;

    if (customId === "create-issue-modal") {
      try {
        const response = await commands["create-issue"].handleModalSubmit(
          body,
          c.env
        );
        return c.json(response);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return c.json({
          type: 4,
          data: { content: `Failed to create issue: ${message}` },
        });
      }
    }

    return c.json({ type: 4, data: { content: `Unknown modal: ${customId}` } });
  }

  return c.json({ error: "Unknown interaction type" }, 400);
});

export const discordRoutes = app;
