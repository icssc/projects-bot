import { z } from "zod";
import type { AsanaTask } from "@/lib/webhooks/asana";

const FIELD_GIDS = {
  name: "1208889653506818",
  email: "1211391740618764",
  type: "1208889653506741",
  message: "1209029669147647",
  followup: "1209029669147649",
  whereIsTheBug: "1213178974148980",
  whatIsTheBug: "1213178974148984",
  otherWhatIsTheBug: "1213178974148991",
} as const;

export const AntalmanacSubmission = z.object({
  url: z.string(),
  name: z.string().nullable(),
  email: z.string(),
  type: z.enum(["Question", "Feature request", "Comment", "Bug"]),
  message: z.string(),
  followup: z.enum(["Yes", "No"]).nullable(),
  whereIsTheBug: z.string().nullable(),
  whatIsTheBug: z
    .enum([
      "Cannot login to application",
      "Cannot save data",
      "Interface is not working as expected",
      "Data Inconsistency/Inaccuracy with an official source (e.g. WebSOC, DegreeWorks)",
      "Other",
    ])
    .nullable(),
  otherWhatIsTheBug: z.string().nullable(),
});

export type AntalmanacSubmission = z.infer<typeof AntalmanacSubmission>;

export function parseSubmission(task: AsanaTask): AntalmanacSubmission {
  const field = (gid: string) =>
    task.custom_fields.find((f) => f.gid === gid)?.display_value ?? null;

  return AntalmanacSubmission.parse({
    url: task.permalink_url,
    name: field(FIELD_GIDS.name),
    email: field(FIELD_GIDS.email),
    type: field(FIELD_GIDS.type),
    message: field(FIELD_GIDS.message),
    followup: field(FIELD_GIDS.followup),
    whereIsTheBug: field(FIELD_GIDS.whereIsTheBug),
    whatIsTheBug: field(FIELD_GIDS.whatIsTheBug),
    otherWhatIsTheBug: field(FIELD_GIDS.otherWhatIsTheBug),
  });
}
