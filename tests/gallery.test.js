import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { sceneAt, artworkPose } from '../assets/gallery-motion.js';
import { artworks, exhibition } from '../assets/gallery-data.js';

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

test('stationary scenes have a single front-facing artwork and neighbors remain off center', () => {
  const main = artworkPose(2, 2);
  assert.ok(main.x === 0 && main.z === 0 && main.rotateY === 0);
  assert.equal(main.scale, 1); assert.equal(main.opacity, 1);
  assert.ok(artworkPose(1, 2).x < -100);
  assert.ok(artworkPose(3, 2).x > 100);
  assert.equal(artworkPose(4, 2).opacity, 0);
  assert.ok(artworkPose(1, 1.5).x < 0 && artworkPose(2, 1.5).x > 0);
});

test('all sixteen original artworks and display copies are present without fabricated credits', () => {
  assert.equal(artworks.length, 16);
  assert.equal(new Set(artworks.map(art => art.id)).size, 16);
  assert.equal(exhibition.length, 6);
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
  assert.match(html, /class="gallery-exit" href="#profile"/);
  assert.doesNotMatch(code, /preventDefault\(\).*wheel|querySelector\([^)]*youtube|fetch\(/);
});
