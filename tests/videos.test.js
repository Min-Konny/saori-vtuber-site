import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../api/videos.js';
const channel = 'UCTekfATLNcoCgLOYZ5sBnzw';
const video = (id, date = '2026-11-09T00:00:00Z', extra = {}) => ({ id, snippet: { channelId: channel, title: '<img src=x onerror=alert(1)>', publishedAt: date, liveBroadcastContent: 'none' }, status: { privacyStatus: 'public' }, ...extra });
function setup(details = [video('abcdefghijk')], failAt) {
  const calls=[];
  const fetcher = async (url, options) => {
    calls.push({url,options});
    if(calls.length===failAt) return new Response('secret-upstream-error',{status:403});
    const items = calls.length===1 ? [{contentDetails:{relatedPlaylists:{uploads:'UUTekfATLNcoCgLOYZ5sBnzw'}}}] : calls.length===2 ? details.map(v=>({contentDetails:{videoId:v.id}})) : details;
    return Response.json({items});
  };
  return { calls, handler:createHandler({fetcher, getKey:()=> 'test-only-key', now:()=> new Date('2026-11-09T01:00:00Z')}) };
}
const req = (suffix='', method='GET') => new Request(`https://example.com/api/videos${suffix}`, {method});
test('fixed-channel three calls; server-only key header; cache; minimal response', async()=>{
 const {handler,calls}=setup();const res=await handler(req());const data=await res.json();
 assert.equal(calls.length,3);assert.equal(calls[0].url.searchParams.get('id'),channel);
 assert.ok(calls.every(c=>c.url.origin==='https://www.googleapis.com'&&!c.url.href.includes('test-only-key')&&c.options.headers['X-Goog-Api-Key']==='test-only-key'&&c.options.signal&&c.options.redirect==='error'));
 assert.equal(res.headers.get('Vercel-CDN-Cache-Control'),'public, s-maxage=1800, stale-while-revalidate=60');
 assert.equal(data.videos[0].id,'abcdefghijk');assert.equal(data.updatedAt,'2026-11-09T01:00:00.000Z');assert.ok(!JSON.stringify(data).includes('test-only-key'));
});
test('filters scheduled/live/private/foreign/invalid; sorts latest 3; labels archives',async()=>{
 const details=[video('11111111111','2026-01-01'),video('22222222222','2026-02-01'),video('33333333333','2026-03-01'),video('44444444444','2026-04-01',{liveStreamingDetails:{actualEndTime:'2026-04-01'}}),video('55555555555','2026-11-01',{status:{privacyStatus:'private'}}),video('66666666666',undefined,{snippet:{channelId:channel,liveBroadcastContent:'upcoming',publishedAt:'2026-11-09'}}),video('77777777777',undefined,{snippet:{channelId:channel,liveBroadcastContent:'live',publishedAt:'2026-11-09'}}),video('88888888888',undefined,{snippet:{channelId:'another',publishedAt:'2026-11-09'}}),video('99999999999','bad-date')];
 const {handler}=setup(details);const data=await(await handler(req())).json();assert.deepEqual(data.videos.map(v=>v.id),['44444444444','33333333333','22222222222']);assert.equal(data.videos[0].isArchive,true);
});
test('missing key fails closed without calls',async()=>{const handler=createHandler({getKey:()=>'',fetcher:()=>assert.fail()});const res=await handler(req());assert.equal(res.status,503);assert.equal(res.headers.get('cache-control'),'no-store');});
test('quota/auth failure is sanitized and does not retry',async()=>{const {handler,calls}=setup(undefined,2);const res=await handler(req());assert.equal(res.status,503);assert.equal(calls.length,2);assert.equal(await res.text(),'{"error":"temporarily_unavailable"}');});
test('network exception and malformed body are sanitized',async()=>{for(const fetcher of [async()=>{throw Error('test-secret')},async()=>Response.json({})]){const h=createHandler({getKey:()=> 'fake',fetcher});const res=await h(req());assert.equal(res.status,503);assert.ok(!(await res.text()).includes('test-secret'));}});
test('empty uploads skips video query',async()=>{const {handler,calls}=setup([]);assert.deepEqual((await(await handler(req())).json()).videos,[]);assert.equal(calls.length,2);});
test('rejects arbitrary query and non GET before external calls',async()=>{const {handler,calls}=setup();assert.equal((await handler(req('?channel=other'))).status,400);assert.equal((await handler(req('','POST'))).status,405);assert.equal(calls.length,0);});
