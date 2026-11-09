import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { artworks, exhibition } from '../assets/gallery-data.js';

test('seventeen approved artworks retain stable IDs and excluded images are absent everywhere', () => {
  assert.equal(artworks.length, 17);
  assert.equal(new Set(artworks.map(art => art.id)).size, 17);
  assert.equal(exhibition.length, 17);
  assert.deepEqual(exhibition.map(art => art.id).sort(), artworks.map(art => art.id).sort());
  for (const id of ['s13', 's16']) {
    assert.ok(![...artworks, ...exhibition].some(art => art.id === id));
    for (const extension of ['jpg', 'webp']) assert.ok(!existsSync(new URL(`../assets/fanart/${id}.${extension}`, import.meta.url)));
  }
  for (const id of ['s17', 's18', 's19']) assert.ok(artworks.some(art => art.id === id));
  for (const art of artworks) {
    assert.ok(existsSync(new URL(`../${art.image}`, import.meta.url)));
    assert.ok(existsSync(new URL(`../${art.preview}`, import.meta.url)));
    assert.equal(art.creator, ''); assert.equal(art.source, '');
  }
});

test('gallery is independent of the video feed, with native dialog and bypass links', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const code = readFileSync(new URL('../assets/gallery.js', import.meta.url), 'utf8');
  assert.match(html, /<dialog[^>]*id="art-dialog"/);
  assert.match(html, /data-gallery-index/);
  assert.match(html, /class="gallery-exit" href="#information"/);
  assert.ok(html.indexOf('<!-- TAGS -->') < html.indexOf('<!-- GALLERY -->'));
  assert.ok(html.indexOf('<!-- GALLERY -->') < html.indexOf('<!-- INFORMATION -->'));
  assert.doesNotMatch(code, /textNode\('(?:h3|strong)', '', art.title\)/);
  assert.doesNotMatch(code, /preventDefault\(\).*wheel|querySelector\([^)]*youtube|fetch\(/);
});
