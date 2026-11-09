const grid = document.getElementById('recent-videos');
const status = document.getElementById('video-status');
const validId = /^[a-zA-Z0-9_-]{11}$/;

function card(video) {
  const link = document.createElement('a');
  link.className = 'yt-card';
  link.href = `https://www.youtube.com/watch?v=${video.id}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const thumb = document.createElement('div');
  thumb.className = 'yt-thumb-wrap';
  const image = document.createElement('img');
  image.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
  image.alt = '';
  image.loading = 'lazy';
  image.width = 480;
  image.height = 360;
  thumb.append(image);
  const label = document.createElement('div');
  label.className = 'yt-label';
  label.textContent = `▶ ${video.title}`;
  const date = document.createElement('time');
  date.className = 'yt-date';
  date.dateTime = video.publishedAt;
  date.textContent = `${new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo' }).format(new Date(video.publishedAt))}${video.isArchive ? ' · 配信アーカイブ' : ''}`;
  link.append(thumb, label, date);
  return link;
}

async function loadVideos() {
  if (!grid || !status) return;
  try {
    const response = await fetch('/api/videos', { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('unavailable');
    const data = await response.json();
    if (!Array.isArray(data.videos) || !data.videos.every(video => validId.test(video.id) && typeof video.title === 'string' && Number.isFinite(Date.parse(video.publishedAt)))) throw new Error('invalid');
    grid.replaceChildren(...data.videos.slice(0, 3).map(card));
    status.textContent = data.videos.length ? '最近の公開動画・配信アーカイブ（約30分ごとに更新）' : '現在、表示できる公開動画はありません。';
  } catch {
    status.textContent = '動画一覧を取得できませんでした。最新の動画はYouTubeチャンネルでご覧ください。';
  } finally {
    grid.setAttribute('aria-busy', 'false');
  }
}
loadVideos();
