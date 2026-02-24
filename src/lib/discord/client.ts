import type { APIEmbed } from "discord.js";

const DISCORD_API_BASE = "https://discord.com/api/v10";

export async function createForumThread({
  channelId,
  botToken,
  name,
  embeds,
}: {
  channelId: string;
  botToken: string;
  name: string;
  embeds: APIEmbed[];
}) {
  const res = await fetch(`${DISCORD_API_BASE}/channels/${channelId}/threads`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, message: { embeds } }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Discord API error: ${res.status} ${body}`);
  }

  return res.json();
}
