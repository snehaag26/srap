import { NextResponse } from 'next/server';

/**
 * Reddit API Route
 *
 * Fetches posts from one or more subreddits using the official Reddit OAuth2 API
 * (client_credentials grant — no user login required).
 *
 * POST /api/reddit
 * Body: { keywords: string[], subreddits: string[], limit?: number }
 */

// Cache the access token to avoid hammering Reddit's auth endpoint
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value;
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Reddit API credentials not configured. Please set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in .env.local');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'LeadGenPro/1.0 (web development lead finder)',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Reddit auth failed (${response.status}): ${text}`);
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error('Reddit did not return an access token. Check your credentials.');
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };

  return cachedToken.value;
}

interface RedditPost {
  id: string;
  author: string;
  subreddit: string;
  title: string;
  selftext: string;
  url: string;
  permalink: string;
  created_utc: number;
  ups: number;
  score: number;
}

async function fetchSubredditPosts(
  token: string,
  subreddit: string,
  query: string,
  limit: number
): Promise<RedditPost[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://oauth.reddit.com/r/${subreddit}/search.json?q=${encodedQuery}&sort=new&limit=${limit}&restrict_sr=1&type=link`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'LeadGenPro/1.0 (web development lead finder)',
    },
  });

  if (!response.ok) {
    console.error(`Reddit fetch failed for r/${subreddit}: ${response.status}`);
    return [];
  }

  const data = await response.json();
  const children = data?.data?.children || [];

  return children.map((child: any) => ({
    id: child.data.id,
    author: child.data.author,
    subreddit: child.data.subreddit,
    title: child.data.title,
    selftext: child.data.selftext || '',
    url: child.data.url,
    permalink: `https://www.reddit.com${child.data.permalink}`,
    created_utc: child.data.created_utc,
    ups: child.data.ups || 0,
    score: child.data.score || 0,
  }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keywords = [], subreddits = [], limit = 25 } = body;

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'At least one keyword is required.' }, { status: 400 });
    }

    if (!Array.isArray(subreddits) || subreddits.length === 0) {
      return NextResponse.json({ error: 'At least one subreddit is required.' }, { status: 400 });
    }

    const token = await getAccessToken();
    const query = keywords.join(' OR ');

    // Fetch from all subreddits concurrently
    const results = await Promise.all(
      subreddits.map((sub: string) =>
        fetchSubredditPosts(token, sub.replace(/^r\//, ''), query, Math.min(limit, 50))
      )
    );

    // Flatten and deduplicate by post ID
    const seen = new Set<string>();
    const posts: RedditPost[] = [];
    for (const batch of results) {
      for (const post of batch) {
        if (!seen.has(post.id)) {
          seen.add(post.id);
          posts.push(post);
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error: any) {
    console.error('Reddit API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
