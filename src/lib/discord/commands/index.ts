import { createIssueCommand } from "@/lib/discord/commands/create-issue";

export const GITHUB_REPOS = [
  { label: "AntAlmanac Scheduler (AntAlmanac)", value: "AntAlmanac" },
  {
    label: "AntAlmanac Planner (peterportal-client)",
    value: "peterportal-client",
  },
  { label: "Anteater API (anteater-api)", value: "anteater-api" },
] as const;

export const GITHUB_OWNER = "icssc";

export const commands = {
  "create-issue": createIssueCommand,
} as const;
