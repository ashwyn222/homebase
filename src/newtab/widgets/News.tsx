import { useEffect, useState } from 'react';
import { RefreshCw, MessageSquare, Newspaper } from 'lucide-react';
import type { WidgetContext } from './types';

type Category =
  | 'local'
  | 'india'
  | 'indiasports'
  | 'tech'
  | 'ai'
  | 'sports'
  | 'politics'
  | 'world'
  | 'science'
  | 'business'
  | 'gaming'
  | 'movies';

interface NewsConfig {
  category?: Category;
  limit?: number;
}

interface Article {
  id: string;
  title: string;
  url: string;
  permalink: string;
  thumb: string | null;
  source: string;
  score: number;
  comments: number;
  time: number;
}

const CATEGORIES: Record<Category, { label: string; subs: string }> = {
  local: { label: 'Local', subs: 'bangalore+mumbai+delhi+hyderabad+chennai+pune' },
  india: { label: 'India', subs: 'india+IndiaSpeaks+unitedstatesofindia' },
  indiasports: {
    label: 'India sports',
    subs: 'IndianCricket+Cricket+indiansports',
  },
  tech: { label: 'Tech', subs: 'technology+programming' },
  ai: {
    label: 'AI',
    subs: 'artificial+MachineLearning+OpenAI+LocalLLaMA+singularity',
  },
  sports: { label: 'Sports', subs: 'sports+nba+nfl+soccer' },
  politics: { label: 'Politics', subs: 'politics' },
  world: { label: 'World', subs: 'worldnews+news' },
  science: { label: 'Science', subs: 'science+EverythingScience' },
  business: { label: 'Business', subs: 'business+Economics' },
  gaming: { label: 'Gaming', subs: 'Games+gaming' },
  movies: { label: 'Movies & TV', subs: 'movies+television' },
};

interface Cache {
  category: Category;
  items: Article[];
  fetchedAt: number;
}

const CACHE_PREFIX = 'widget_news_cache_';
const TTL = 15 * 60 * 1000;

interface RedditResolution {
  url?: string;
  width?: number;
  height?: number;
}

interface RedditPost {
  id?: string;
  title?: string;
  url?: string;
  url_overridden_by_dest?: string;
  permalink?: string;
  thumbnail?: string;
  domain?: string;
  ups?: number;
  num_comments?: number;
  created_utc?: number;
  stickied?: boolean;
  is_self?: boolean;
  over_18?: boolean;
  preview?: {
    images?: {
      source?: { url?: string };
      resolutions?: RedditResolution[];
    }[];
  };
}

function pickThumb(d: RedditPost): string | null {
  const resolutions = d.preview?.images?.[0]?.resolutions;
  if (resolutions && resolutions.length > 0) {
    const small =
      resolutions.find(
        (r) => (r.width ?? 0) >= 140 && (r.width ?? 0) <= 320,
      ) ?? resolutions[Math.min(1, resolutions.length - 1)];
    if (small?.url) return small.url;
  }
  const source = d.preview?.images?.[0]?.source?.url;
  if (source) return source;
  if (d.thumbnail && d.thumbnail.startsWith('http')) return d.thumbnail;
  return null;
}

async function fetchFromReddit(
  category: Category,
  limit: number,
): Promise<Article[]> {
  const cat = CATEGORIES[category];
  const url = `https://www.reddit.com/r/${cat.subs}/hot.json?limit=${Math.max(limit * 2, 25)}&raw_json=1`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new Error(
      `Network error — check your connection. ${e instanceof Error ? e.message : ''}`,
    );
  }
  if (res.status === 403 || res.status === 429) {
    throw new Error('BLOCKED');
  }
  if (!res.ok) {
    throw new Error(`Reddit returned ${res.status}`);
  }
  let json: { data?: { children?: { data?: RedditPost }[] } };
  try {
    json = await res.json();
  } catch {
    throw new Error('Invalid response from Reddit');
  }
  const posts = json.data?.children ?? [];
  const articles: Article[] = [];
  for (const post of posts) {
    const d = post.data;
    if (!d) continue;
    if (d.stickied || d.is_self || d.over_18) continue;
    if (!d.url || !d.id || !d.title) continue;

    articles.push({
      id: d.id,
      title: d.title,
      url: d.url_overridden_by_dest || d.url,
      permalink: `https://www.reddit.com${d.permalink ?? ''}`,
      thumb: pickThumb(d),
      source: d.domain ?? '',
      score: d.ups ?? 0,
      comments: d.num_comments ?? 0,
      time: d.created_utc ?? Date.now() / 1000,
    });

    if (articles.length >= limit) break;
  }
  return articles;
}

interface AlgoliaHit {
  objectID: string;
  title?: string;
  story_title?: string;
  url?: string;
  story_url?: string;
  author?: string;
  points?: number;
  num_comments?: number;
  created_at_i?: number;
}

const HN_QUERIES: Record<Category, string> = {
  local: 'Bangalore OR Mumbai OR Delhi OR Bengaluru',
  india: 'India OR Indian',
  indiasports: 'India cricket OR IPL OR "Indian cricket"',
  tech: 'tech OR software OR startup',
  ai: 'AI OR LLM OR GPT OR OpenAI OR Anthropic OR "machine learning"',
  sports: 'sports OR NBA OR NFL OR soccer',
  politics: 'politics OR election OR government',
  world: 'world OR geopolitics',
  science: 'science OR research OR study',
  business: 'business OR economy OR market',
  gaming: 'gaming OR videogame OR gamedev',
  movies: 'movie OR film OR streaming OR Netflix',
};

async function fetchFromHN(
  category: Category,
  limit: number,
): Promise<Article[]> {
  const q = encodeURIComponent(HN_QUERIES[category]);
  const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&query=${q}&hitsPerPage=${limit * 2}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fallback failed (${res.status})`);
  const json = (await res.json()) as { hits?: AlgoliaHit[] };
  const hits = json.hits ?? [];
  const articles: Article[] = [];
  for (const h of hits) {
    const title = h.title || h.story_title;
    const url = h.url || h.story_url;
    if (!title || !url) continue;
    let host = '';
    try {
      host = new URL(url).hostname;
    } catch {
      /* skip */
    }
    articles.push({
      id: h.objectID,
      title,
      url,
      permalink: `https://news.ycombinator.com/item?id=${h.objectID}`,
      thumb: null,
      source: host,
      score: h.points ?? 0,
      comments: h.num_comments ?? 0,
      time: h.created_at_i ?? Date.now() / 1000,
    });
    if (articles.length >= limit) break;
  }
  return articles;
}

async function fetchArticles(
  category: Category,
  limit: number,
): Promise<Article[]> {
  try {
    return await fetchFromReddit(category, limit);
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'BLOCKED') {
      return await fetchFromHN(category, limit);
    }
    throw e;
  }
}

async function getArticles(
  category: Category,
  limit: number,
  force = false,
): Promise<Article[]> {
  const key = CACHE_PREFIX + category;
  if (!force) {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const cache = JSON.parse(stored) as Cache;
        if (
          cache.category === category &&
          cache.items.length >= limit &&
          Date.now() - cache.fetchedAt < TTL
        ) {
          return cache.items.slice(0, limit);
        }
      } catch {
        /* ignore */
      }
    }
  }
  const fresh = await fetchArticles(category, limit);
  localStorage.setItem(
    key,
    JSON.stringify({ category, items: fresh, fetchedAt: Date.now() } as Cache),
  );
  return fresh;
}

function hostOf(domain: string): string {
  if (!domain) return '';
  return domain.replace(/^www\./, '').replace(/^self\./, 'self ');
}

function timeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() / 1000 - ts);
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 604800)}w`;
}

export function NewsWidget({
  config,
  onConfigChange,
}: WidgetContext<NewsConfig>) {
  const requested = (config.category ?? 'tech') as Category;
  const category: Category = CATEGORIES[requested] ? requested : 'tech';
  const limit = config.limit ?? 12;

  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getArticles(category, limit, force);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(false);
  }, [category, limit]);

  return (
    <div className="news-widget">
      <div className="news-head">
        <div className="news-tabs" role="tablist">
          {(Object.entries(CATEGORIES) as [Category, { label: string }][]).map(
            ([k, v]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={category === k}
                className={'news-tab' + (category === k ? ' active' : '')}
                onClick={() =>
                  onConfigChange({ ...config, category: k })
                }
              >
                {v.label}
              </button>
            ),
          )}
        </div>
        <button
          type="button"
          className="icon-btn news-refresh"
          onClick={() => load(true)}
          disabled={loading}
          title="Refresh"
          aria-label="Refresh"
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {error ? (
        <div className="news-empty error">{error}</div>
      ) : items.length === 0 && loading ? (
        <div className="news-empty muted">Loading…</div>
      ) : items.length === 0 ? (
        <div className="news-empty muted">No stories.</div>
      ) : (
        <div className="news-grid">
          {items.map((a) => (
            <article key={a.id} className="news-card">
              {a.thumb ? (
                <img
                  className="news-thumb"
                  src={a.thumb}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="news-thumb news-thumb-ph">
                  <Newspaper size={18} />
                </div>
              )}
              <div className="news-body">
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="news-title"
                  title={a.title}
                >
                  {a.title}
                </a>
                <div className="news-meta">
                  <span className="news-source">{hostOf(a.source)}</span>
                  <span className="news-sep">·</span>
                  <span>{timeAgo(a.time)}</span>
                  <span className="news-sep">·</span>
                  <a
                    href={a.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="news-comments"
                    title={`${a.comments} comments`}
                  >
                    <MessageSquare size={10} />
                    {a.comments}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function NewsConfigPanel({
  config,
  onConfigChange,
}: WidgetContext<NewsConfig>) {
  const limit = config.limit ?? 12;
  return (
    <div className="config-panel">
      <label>
        Stories to show
        <input
          type="number"
          min={6}
          max={30}
          value={limit}
          onChange={(e) =>
            onConfigChange({
              ...config,
              limit: Number(e.target.value) || 12,
            })
          }
        />
      </label>
      <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>
        Stories are sourced from Reddit communities.
      </p>
    </div>
  );
}
