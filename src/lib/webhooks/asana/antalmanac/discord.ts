import type { APIEmbed } from "discord.js";
import type { AntalmanacSubmission } from "@/lib/webhooks/asana/antalmanac";

export function buildEmbed(submission: AntalmanacSubmission): APIEmbed {
  const fields = [
    { name: "Type", value: submission.type, inline: true },
    {
      name: "Name",
      value: submission.name ?? "Anonymous",
      inline: true,
    },
    { name: "Email", value: submission.email, inline: true },
    { name: "Message", value: submission.message },
  ];

  if (submission.followup) {
    fields.push({
      name: "Follow Up",
      value: submission.followup,
      inline: true,
    });
  }

  if (submission.whereIsTheBug) {
    fields.push({
      name: "Where is the bug?",
      value: submission.whereIsTheBug,
      inline: false,
    });
  }

  if (submission.whatIsTheBug) {
    fields.push({
      name: "What is the bug?",
      value:
        submission.whatIsTheBug === "Other" && submission.otherWhatIsTheBug
          ? submission.otherWhatIsTheBug
          : submission.whatIsTheBug,
      inline: false,
    });
  }

  return {
    title: `New ${submission.type}`,
    url: submission.url,
    color: submission.type === "Bug" ? 0xed_42_45 : 0x58_65_f2,
    fields,
    timestamp: new Date().toISOString(),
  };
}
