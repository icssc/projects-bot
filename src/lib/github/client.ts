const GITHUB_API_BASE = "https://api.github.com";

export async function createIssue({
  owner,
  repo,
  title,
  body,
  pat,
}: {
  owner: string;
  repo: string;
  title: string;
  body: string;
  pat: string;
}) {
  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "projects-bot",
    },
    body: JSON.stringify({ title, body }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error: ${res.status} ${text}`);
  }

  return (await res.json()) as { html_url: string; number: number };
}
