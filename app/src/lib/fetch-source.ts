import "server-only";

export class FetchSourceError extends Error {}

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", mdash: "—", ndash: "–",
  hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
};

function decodeEntities(s: string) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** Very small readability pass: prefer <article>/<main>, drop chrome, keep paragraph breaks. */
export function htmlToText(html: string): { title: string; text: string } {
  const title = decodeEntities(
    (html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1] ??
      html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ??
      "").trim(),
  );
  let body = html.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
  body = body
    .replace(/<(script|style|noscript|svg|nav|header|footer|aside|form|iframe)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|h[1-6]|li|blockquote|section|br|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  const text = decodeEntities(body)
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 0)
    .join("\n");
  return { title, text };
}

export async function fetchSource(url: string): Promise<{ title: string; text: string }> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new FetchSourceError("That doesn't look like a valid URL.");
  }
  if (!/^https?:$/.test(parsed.protocol)) throw new FetchSourceError("Only http(s) links are supported.");

  let res: Response;
  try {
    res = await fetch(parsed, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; DeepKnowledge/0.1)", accept: "text/html,text/plain" },
      signal: AbortSignal.timeout(20_000),
      redirect: "follow",
    });
  } catch {
    throw new FetchSourceError("Couldn't download that page. Paste the text instead.");
  }
  if (!res.ok) throw new FetchSourceError(`The page returned HTTP ${res.status}. Paste the text instead.`);
  const type = res.headers.get("content-type") ?? "";
  const raw = await res.text();
  const result = type.includes("text/plain") ? { title: "", text: raw } : htmlToText(raw);
  if (result.text.length < 200)
    throw new FetchSourceError(
      "Couldn't find readable text on that page (it may need JavaScript or a login). Paste the text instead.",
    );
  return result;
}
