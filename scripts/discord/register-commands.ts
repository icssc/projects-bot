/**
 * One-time script to register slash commands with Discord.
 * Make sure to use Node 24 or newer.
 * Run with: node --env-file=.dev.vars --experimental-strip-types scripts/discord/register-commands.ts
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

const commands = [
  {
    name: "create-issue",
    description: "Create a GitHub issue from Discord",
    type: 1,
  },
];

const res = await fetch(
  `https://discord.com/api/v10/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  }
);

if (!res.ok) {
  const body = await res.text();
  console.error(`Failed to register commands: ${res.status} ${body}`);
  process.exit(1);
}

const registered = (await res.json()) as { name: string; id: string }[];
console.log(`Registered ${registered.length} command(s):`);
for (const cmd of registered) {
  console.log(`  /${cmd.name} (${cmd.id})`);
}
