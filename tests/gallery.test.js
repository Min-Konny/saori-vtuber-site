import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { sceneAt, artworkPose } from '../assets/gallery-motion.js';
import { artworks, exhibition, companions } from '../assets/gallery-data.js';

test('a whole exhibition takes less than four extra screens and reverses without hysteresis', () => {
  const height = 833, top = 900;
  for (let index = 0; index < exhibition.length; index++) {
    const y = top + index * height * .65;
    assert.equal(sceneAt(y, top, height, exhibition.length).active, index);
    assert.ok(Math.abs(sceneAt(y, top, height, exhibition.length).position - index) < 1e-9);
  }
  assert.ok((exhibition.length - 1) * .65 < 4);
  assert.equal(sceneAt(-999, top, height, exhibition.length).active, 0);
  assert.equal(sceneAt(99999, top, height, exhibition.length).active, exhibition.length - 1);
});

test('artworks orbit and rotate without zoom or perspective, settling upright', () => {
  const main = artworkPose(2, 2);
  assert.equal(main.x, 0); assert.equal(main.y, 0); assert.equal(main.rotation, 0); assert.equal(main.opacity, 1);
  for (const position of [0, .25, .5, 1, 2, 3.5, 5]) {
    assert.deepEqual(Object.keys(artworkPose(2, position)).sort(), ['opacity', 'rotation', 'x', 'y']);
  }
  assert.ok(artworkPose(1, 2).x < -60);
  assert.ok(artworkPose(3, 2).x > 60);
  assert.equal(artworkPose(4, 2).opacity, 0);
  assert.ok(artworkPose(1, 1.5).x < 0 && artworkPose(2, 1.5).x > 0);
  assert.equal(artworkPose(1, 1.5).rotation, -45);
  assert.equal(artworkPose(2, 1.5).rotation, 45);
});

test('seventeen approved artworks retain stable IDs and excluded images are absent everywhere', () => {
  assert.equal(artworks.length, 17);
  assert.equal(new Set(artworks.map(art => art.id)).size, 17);
  assert.equal(exhibition.length, 6);
  for (const id of ['s13', 's16']) {
    assert.ok(![...artworks, ...exhibition, ...companions].some(art => art.id === id));
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
