import type { APIEmbed } from "discord.js";

const DISCORD_API_BASE = "https://discord.com/api/v10";

interface MessageComponent {
  label?: string;
  style?: number;
  type: number;
  url?: string;
}

export async function createForumThread({
  channelId,
  botToken,
  name,
  embeds,
  components,
  appliedTags,
}: {
  channelId: string;
  botToken: string;
  name: string;
  embeds: APIEmbed[];
  components?: MessageComponent[];
  appliedTags?: string[];
}) {
  const message: Record<string, unknown> = { embeds };
  if (components?.length) {
    message.components = [{ type: 1, components }];
  }

  const body: Record<string, unknown> = { name, message };
  if (appliedTags?.length) {
    body.applied_tags = appliedTags;
  }

  const res = await fetch(`${DISCORD_API_BASE}/channels/${channelId}/threads`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Discord API error: ${res.status} ${body}`);
  }

  return res.json();
}
