import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../assets/videos.js',import.meta.url),'utf8');
function element(tag) { return {tag,children:[],attributes:{},textContent:'',append(...nodes){this.children.push(...nodes)},replaceChildren(...nodes){this.children=nodes},setAttribute(k,v){this.attributes[k]=v}}; }
async function run(fetcher) {
 const grid=element('div'),status=element('p');
 const doc={getElementById:id=>id==='recent-videos'?grid:status,createElement:element};
 const context=vm.createContext({document:doc,fetch:fetcher,AbortSignal,Intl,Date});
 vm.runInContext(code.replace('loadVideos();','globalThis.finished = loadVideos();'),context);
 await context.finished;return {grid,status};
}
test('renders titles as text, valid YouTube links and dates, no reveal-hidden cards',async()=>{
 const {grid,status}=await run(async()=>Response.json({videos:[{id:'abcdefghijk',title:'<script>alert(1)</script>',publishedAt:'2026-11-09T01:00:00Z',isArchive:true}]}));
 assert.equal(grid.children.length,1);const card=grid.children[0];assert.equal(card.href,'https://www.youtube.com/watch?v=abcdefghijk');assert.equal(card.className,'yt-card');assert.equal(card.children[1].textContent,'▶ <script>alert(1)</script>');assert.match(card.children[2].textContent,/配信アーカイブ/);assert.equal(grid.attributes['aria-busy'],'false');assert.match(status.textContent,/30分/);
});
test('API failure/malformed/injected ID show fallback and stop loading',async()=>{
 for(const payload of [new Response('',{status:503}),Response.json({videos:[{id:'javascript:alert(1)',title:'test',publishedAt:'2026-11-09'}]}),Response.json({error:'error'})]) {
 const {grid,status}=await run(async()=>payload);assert.match(status.textContent,/取得できませんでした/);assert.equal(grid.children.length,0);assert.equal(grid.attributes['aria-busy'],'false');
 }
});
test('network timeout shows fallback',async()=>{const {status}=await run(async()=>{throw new DOMException('timeout','TimeoutError')});assert.match(status.textContent,/YouTube/);});
test('empty list is distinct from failure',async()=>{const {status}=await run(async()=>Response.json({videos:[]}));assert.match(status.textContent,/表示できる公開動画はありません/);});
test('HTML has permanent channel link and noscript fallback, removed placeholder labels',async()=>{const html=await readFile(new URL('../index.html',import.meta.url),'utf8');assert.match(html,/<noscript>/);assert.match(html,/id="video-status" role="status"/);assert.ok(!html.includes('▶ 動画①'));assert.ok(!html.includes('YOUTUBE_API_KEY'));});
