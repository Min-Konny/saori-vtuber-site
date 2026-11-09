import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const links=html.split('<!-- LINKS -->')[1].split('<!-- YOUTUBE -->')[0];
const works=html.split('<!-- WORKS -->')[1].split('<!-- TAGS -->')[0];
test('requested links replace removed entries and have no supplemental captions',()=>{
 assert.match(links,/href="https:\/\/raidori.com\/@s40r12525"[\s\S]*?<div class="name">ファンクラブ<\/div>/);
 assert.match(links,/href="https:\/\/www.instagram.com\/s40r111\/"[\s\S]*?<div class="name">instagram<\/div>/);
 assert.doesNotMatch(links,/FANBOX|自作MV|class="desc"/);
 assert.equal((links.match(/class="link-card /g)||[]).length,10);
});
test('requested dated works and partners appear once while existing ten remain',()=>{
 for(const value of ['2026.6.12','ブロックブラストタイアップ配信','ブロックブラスト様','2026.7.11','８種入りクッキー缶　販促','osimo様','2026.12.12','ネットカフェ自遊空間 コラボグッズ販売','自遊空間様']) assert.equal(works.split(value).length-1,1);
 assert.equal((works.match(/class="tl-item"/g)||[]).length,13);
});
test('private hero uses supplied portrait and preserves a non-cropping image',()=>{
 const hero=html.split('<!-- HERO -->')[1].split('<!-- PROFILE -->')[0];
 assert.match(hero,/hero-art-stage/);
 assert.doesNotMatch(hero,/asset-draft-note|hero-asset-fallback/);
 assert.equal((hero.match(/<img\b/g)||[]).length,1);
 assert.match(hero,/src="assets\/saori-keyvisual.png"/);
 assert.match(hero,/width="1448" height="2048"/);
 const css=readFileSync(new URL('../assets/keyvisual.css',import.meta.url),'utf8');
 assert.match(css,/\.hero-keyvisual\s*\{[^}]*object-fit: contain/);
 assert.match(css,/nav \.nav-logo\s*\{[^}]*position: static/);
 assert.match(css,/@media \(max-width: 900px\)/);
 assert.match(css,/@media \(max-width: 480px\)/);
});
test('works remain a fully visible list and navigation has a separate flow container',()=>{
 assert.doesNotMatch(works,/<details|hidden|class="tl-item reveal"/);
 assert.equal((works.match(/class="tl-item"/g)||[]).length,13);
 assert.match(html,/<div class="nav-links">/);
});
