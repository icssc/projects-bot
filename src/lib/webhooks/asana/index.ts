import { z } from "zod";

export const AsanaTaskAddedEvent = z.object({
  action: z.literal("added"),
  created_at: z.string(),
  user: z
    .object({
      gid: z.string(),
      resource_type: z.literal("user"),
    })
    .nullable(),
  resource: z.object({
    gid: z.string(),
    resource_type: z.literal("task"),
    resource_subtype: z.enum(["default_task", "milestone", "approval"]),
  }),
  parent: z
    .object({
      gid: z.string(),
      resource_type: z.string(),
      resource_subtype: z.string(),
    })
    .nullable(),
});

export type AsanaTaskAddedEvent = z.infer<typeof AsanaTaskAddedEvent>;
