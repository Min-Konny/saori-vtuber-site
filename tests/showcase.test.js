import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../assets/showcase.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('showcase is progressive enhancement without hiding media or replacing content',()=>{
 assert.match(html,/assets\/showcase.css/);
 assert.match(css,/@supports \(animation-timeline: view\(\)\)/);
 assert.match(css,/grid-template-columns: minmax\(0, 1fr\)/);
 assert.doesNotMatch(css,/opacity:\s*0\b|visibility:\s*hidden|display:\s*none/);
 assert.equal((html.match(/class="tl-item"/g)||[]).length,13);
 assert.match(html,/assets\/videos.js/);
 assert.doesNotMatch(css,/#works|\.tl-item/);
});
test('mobile and reduced motion retain normal document flow',()=>{
 assert.match(css,/@media \(min-width: 901px\) and \(prefers-reduced-motion: no-preference\)/);
 assert.match(css,/@media \(max-width: 900px\)[\s\S]*grid-template-columns: minmax\(0, 1fr\)/);
 assert.match(css,/@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none !important; transform: none !important/);
 assert.match(css,/:focus-visible[^}]*outline: 3px/);
 assert.doesNotMatch(css,/url\(/);
});
