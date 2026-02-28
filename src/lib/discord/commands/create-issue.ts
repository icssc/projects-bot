import { GITHUB_OWNER, GITHUB_REPOS } from "@/lib/discord/commands";
import { createIssue } from "@/lib/github/client";

interface ModalComponent {
  custom_id: string;
  value?: string;
  values?: string[];
}

interface ModalLabel {
  component: ModalComponent;
  type: number;
}

interface Interaction {
  channel?: { id: string; name?: string };
  channel_id?: string;
  data?: {
    name?: string;
    custom_id?: string;
    components?: ModalLabel[];
  };
  guild_id?: string;
  member?: { user: { id: string; username: string; global_name?: string } };
  type: number;
  user?: { id: string; username: string; global_name?: string };
}

function getUser(interaction: Interaction) {
  return interaction.member?.user ?? interaction.user;
}

function getModalValue(
  interaction: Interaction,
  customId: string
): string | undefined {
  for (const label of interaction.data?.components ?? []) {
    const comp = label.component;
    if (comp.custom_id === customId) {
      return comp.value ?? comp.values?.[0];
    }
  }
}

export const createIssueCommand = {
  definition: {
    name: "create-issue",
    description: "Create a GitHub issue from Discord",
    type: 1,
  },

  handleCommand() {
    return {
      type: 9, // MODAL
      data: {
        custom_id: "create-issue-modal",
        title: "Create GitHub Issue",
        components: [
          {
            type: 18, // Label
            label: "Repository",
            component: {
              type: 3, // String Select
              custom_id: "repo",
              placeholder: "Select a repository",
              min_values: 1,
              max_values: 1,
              options: GITHUB_REPOS.map((r) => ({
                label: r.label,
                value: r.value,
              })),
            },
          },
          {
            type: 18, // Label
            label: "Issue Title",
            component: {
              type: 4, // Text Input
              custom_id: "title",
              style: 1, // Short
              required: true,
              max_length: 256,
            },
          },
          {
            type: 18, // Label
            label: "Description",
            component: {
              type: 4, // Text Input
              custom_id: "description",
              style: 2, // Paragraph
              required: false,
              max_length: 4000,
            },
          },
        ],
      },
    };
  },

  async handleModalSubmit(interaction: Interaction, env: CloudflareBindings) {
    const repo = getModalValue(interaction, "repo");
    const title = getModalValue(interaction, "title");
    const description = getModalValue(interaction, "description") ?? "";

    if (!(repo && title)) {
      return {
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: { content: "Missing required fields (repo or title)." },
      };
    }

    const user = getUser(interaction);
    const username = user?.global_name ?? user?.username ?? "Unknown";
    const userId = user?.id;
    const channelName = interaction.channel?.name ?? "unknown-channel";
    const guildId = interaction.guild_id;
    const channelId = interaction.channel_id;

    const discordLink =
      guildId && channelId
        ? `https://discord.com/channels/${guildId}/${channelId}`
        : undefined;

    const metadataLines = [
      "---",
      `*Created by ${userId ? `<@${userId}>` : username} (${username}) from #${channelName} in Discord*`,
      discordLink ? `*[View in Discord](${discordLink})*` : "",
    ].filter(Boolean);

    const body = [description, "", ...metadataLines].join("\n");

    const issue = await createIssue({
      owner: GITHUB_OWNER,
      repo,
      title,
      body,
      pat: env.GITHUB_PAT_SECRET,
    });

    return {
      type: 4,
      data: {
        content: `Created issue **#${issue.number}** in **${GITHUB_OWNER}/${repo}**: ${issue.html_url}`,
      },
    };
  },
};
