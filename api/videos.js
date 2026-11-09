// Only public metadata for this fixed channel is exposed. Never return upstream errors or keys.
const CHANNEL_ID = 'UCTekfATLNcoCgLOYZ5sBnzw';
const API = 'https://www.googleapis.com/youtube/v3/';
const ID = /^[a-zA-Z0-9_-]{11}$/;

export function createHandler({ fetcher = fetch, getKey = () => process.env.YOUTUBE_API_KEY, now = () => new Date() } = {}) {
  return async function handle(request) {
    const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
    if (request.method !== 'GET') return Response.json({ error: 'method_not_allowed' }, { status: 405, headers: { ...headers, Allow: 'GET' } });
    if (new URL(request.url).search) return Response.json({ error: 'invalid_request' }, { status: 400, headers });
    const key = getKey();
    if (!key) return Response.json({ error: 'temporarily_unavailable' }, { status: 503, headers });
    // One bounded refresh, no retries. CDN caching is not a global quota hard limit.
    const signal = AbortSignal.timeout(12000);
    async function get(resource, params) {
      const url = new URL(resource, API);
      for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
      const response = await fetcher(url, { headers: { 'X-Goog-Api-Key': key }, signal, redirect: 'error' });
      if (!response.ok) throw new Error('upstream_failed');
      const result = await response.json();
      if (!Array.isArray(result.items)) throw new Error('invalid_response');
      return result.items;
    }
    try {
      const channels = await get('channels', { part: 'contentDetails', id: CHANNEL_ID });
      const playlist = channels[0]?.contentDetails?.relatedPlaylists?.uploads;
      if (typeof playlist !== 'string' || !/^UU[a-zA-Z0-9_-]{22}$/.test(playlist)) throw new Error('missing_uploads');
      const uploads = await get('playlistItems', { part: 'contentDetails', playlistId: playlist, maxResults: '30' });
      const ids = [...new Set(uploads.map(item => item.contentDetails?.videoId).filter(id => ID.test(id)))];
      const details = ids.length ? await get('videos', { part: 'snippet,status,liveStreamingDetails', id: ids.join(',') }) : [];
      const videos = details.filter(item => ID.test(item.id) && item.snippet?.channelId === CHANNEL_ID && item.status?.privacyStatus === 'public' && item.snippet?.liveBroadcastContent !== 'upcoming' && item.snippet?.liveBroadcastContent !== 'live' && Number.isFinite(Date.parse(item.snippet?.publishedAt)))
        .sort((a, b) => Date.parse(b.snippet.publishedAt) - Date.parse(a.snippet.publishedAt))
        .slice(0, 3).map(item => ({ id: item.id, title: String(item.snippet.title || '').slice(0, 500), publishedAt: item.snippet.publishedAt, isArchive: Boolean(item.liveStreamingDetails?.actualEndTime) }));
      return Response.json({ videos, updatedAt: now().toISOString() }, { headers: { ...headers, 'Cache-Control': 'public, max-age=60', 'Vercel-CDN-Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=60' } });
    } catch {
      // Deliberately do not log fetch exceptions: they can contain request credentials.
      console.warn('youtube_metadata_refresh_failed');
      return Response.json({ error: 'temporarily_unavailable' }, { status: 503, headers });
    }
  };
}
const handle = createHandler();
export const GET = handle;
