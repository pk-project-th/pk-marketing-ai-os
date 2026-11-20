export interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
}

export interface WebResearchResult {
  query: string;
  foundFacts: boolean;
  summaryText: string;
  sources: ResearchSource[];
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts a clean search query from a conversational Thai/English creator prompt.
 * E.g. "ให้คุณช่วยคิดคอนเท้นสำหรับไปวัดร่องขุ่นหน่อย" -> "วัดร่องขุ่น"
 */
export function extractSearchTopic(rawPrompt: string): string {
  let cleaned = (rawPrompt || "").trim();
  const fillerPatterns = [
    /ช่วยคิดคอนเทนต์|ช่วยคิดคอนเท้น|คิดคอนเทนต์|คิดคอนเท้น|ทำคลิปสั้น|ทำคลิปรีวิว|ทำคลิป|รีวิว|สำหรับไป|สำหรับ|ให้คุณ|ให้หน่อย|หน่อยครับ|หน่อยค่ะ|หน่อย|อยากทำ|สไตล์ไวรัล|หยุดนิ้ว|แนวเชิญชวน|แนวไลฟ์สไตล์|15\s*วิ|30\s*วิ|60\s*วิ/gi
  ];
  for (const pat of fillerPatterns) {
    cleaned = cleaned.replace(pat, " ");
  }
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  if (cleaned.length < 2) return rawPrompt.trim().slice(0, 80);
  return cleaned.slice(0, 80);
}

async function fetchWithTimeout(url: string, timeoutMs = 4000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: {
        "User-Agent": "PKMarketingAIOS/1.0 (https://pk-marketing-ai-os.onrender.com)"
      },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

async function searchWikipedia(lang: "th" | "en", query: string): Promise<ResearchSource[]> {
  try {
    const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&srlimit=2&format=json&utf8=1`;
    const res = await fetchWithTimeout(searchUrl, 3800);
    if (!res.ok) return [];
    const data = await res.json();
    const hits = data?.query?.search || [];
    if (!Array.isArray(hits) || hits.length === 0) return [];

    const results: ResearchSource[] = [];
    for (const hit of hits.slice(0, 2)) {
      const title = String(hit.title || "");
      if (!title) continue;
      let snippet = stripHtml(String(hit.snippet || ""));

      // Fetch richer plain-text intro extract for the top hit
      if (results.length === 0) {
        try {
          const extUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(
            title
          )}&format=json&utf8=1`;
          const extRes = await fetchWithTimeout(extUrl, 3500);
          if (extRes.ok) {
            const extJson = await extRes.json();
            const pages = extJson?.query?.pages || {};
            const firstPage: any = Object.values(pages)[0];
            if (firstPage?.extract && typeof firstPage.extract === "string") {
              snippet = firstPage.extract.trim().slice(0, 750);
            }
          }
        } catch {
          // Keep search snippet
        }
      }

      results.push({
        title,
        url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
        snippet
      });
    }
    return results;
  } catch {
    return [];
  }
}

async function searchDuckDuckGoHtml(query: string): Promise<ResearchSource[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetchWithTimeout(url, 4200);
    if (!res.ok) return [];
    const html = await res.text();

    const sources: ResearchSource[] = [];
    const blockRegex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>|<div[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/div>)/gi;

    let match: RegExpExecArray | null;
    while ((match = blockRegex.exec(html)) !== null && sources.length < 4) {
      const rawHref = match[1] || "";
      const title = stripHtml(match[2] || "");
      const snippet = stripHtml(match[3] || match[4] || "");
      if (!title || !snippet) continue;

      let cleanUrl = rawHref;
      const uddgMatch = rawHref.match(/uddg=([^&]+)/);
      if (uddgMatch) {
        try {
          cleanUrl = decodeURIComponent(uddgMatch[1]);
        } catch {
          cleanUrl = rawHref;
        }
      }

      sources.push({
        title: title.slice(0, 120),
        url: cleanUrl,
        snippet: snippet.slice(0, 320)
      });
    }
    return sources;
  } catch {
    return [];
  }
}

/**
 * Performs fast, 100% free live web research (Thai Wikipedia + DuckDuckGo + English Wikipedia fallback)
 * so AI content scripts are grounded in real places, real attractions, opening hours, and authentic details.
 */
export async function researchTopicOnline(rawPrompt: string): Promise<WebResearchResult> {
  const topic = extractSearchTopic(rawPrompt);
  if (!topic || topic.length < 2) {
    return { query: rawPrompt, foundFacts: false, summaryText: "", sources: [] };
  }

  const [thWiki, ddgThai, enWiki] = await Promise.all([
    searchWikipedia("th", topic),
    searchDuckDuckGoHtml(`${topic} เวลาเปิดปิด ไฮไลต์ รีวิว`),
    searchWikipedia("en", topic)
  ]);

  const combined: ResearchSource[] = [];
  const seenTitles = new Set<string>();
  for (const list of [thWiki, ddgThai, enWiki]) {
    for (const item of list) {
      const key = item.title.toLowerCase();
      if (!seenTitles.has(key) && item.snippet.length > 20) {
        seenTitles.add(key);
        combined.push(item);
      }
    }
  }

  const topSources = combined.slice(0, 5);
  const summaryText = topSources
    .map((s, i) => `[แหล่งข้อมูล ${i + 1}: ${s.title}]\n${s.snippet}`)
    .join("\n\n");

  return {
    query: topic,
    foundFacts: topSources.length > 0,
    summaryText,
    sources: topSources
  };
}
