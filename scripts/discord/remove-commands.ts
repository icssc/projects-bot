/**
 * Remove all slash commands from Discord.
 * Run: node --env-file=.dev.vars --experimental-strip-types scripts/discord/remove-commands.ts
 */

export {};

const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = "772739905981644850";

if (!(APPLICATION_ID && BOT_TOKEN)) {
  console.error(
    "Missing DISCORD_APPLICATION_ID or DISCORD_BOT_TOKEN in .dev.vars"
  );
  process.exit(1);
}

const res = await fetch(
  `https://discord.com/api/v10/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([]),
  }
);

if (!res.ok) {
  const body = await res.text();
  console.error(`Failed to remove commands: ${res.status} ${body}`);
  process.exit(1);
}

console.log("All guild commands removed.");
