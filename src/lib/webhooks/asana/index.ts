import { z } from "zod";

const ASANA_API_BASE = "https://app.asana.com/api/1.0";

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
});

export type AsanaTaskAddedEvent = z.infer<typeof AsanaTaskAddedEvent>;

const AsanaCustomField = z.object({
  gid: z.string(),
  name: z.string(),
  type: z.string(),
  display_value: z.string().nullable(),
});

export const AsanaTask = z.object({
  gid: z.string(),
  name: z.string(),
  notes: z.string(),
  permalink_url: z.string(),
  custom_fields: z.array(AsanaCustomField),
});

export type AsanaTask = z.infer<typeof AsanaTask>;
export type AsanaCustomField = z.infer<typeof AsanaCustomField>;

export async function fetchAsanaTask({
  taskGid,
  pat,
}: {
  taskGid: string;
  pat: string;
}) {
  const url = new URL(`${ASANA_API_BASE}/tasks/${taskGid}`);
  url.searchParams.set(
    "opt_fields",
    [
      "name",
      "notes",
      "permalink_url",
      "custom_fields",
      "custom_fields.name",
      "custom_fields.display_value",
      "custom_fields.type",
    ].join(",")
  );

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${pat}` },
  });

  if (!res.ok) {
    throw new Error(`Asana API error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as { data: unknown };
  return json.data;
}
