import { artworks, exhibition } from './gallery-data.js';
import { artworkPose, sceneAt, clamp } from './gallery-motion.js';

const section = document.getElementById('gallery');
const track = section.querySelector('.gallery-track');
const nav = document.querySelector('nav');
const counter = section.querySelector('.gallery-counter');
const progressBar = section.querySelector('.gallery-progress span');
const staticButton = section.querySelector('[data-gallery-static]');
const dialog = document.getElementById('art-dialog');
const dialogBody = dialog.querySelector('.art-dialog-body');
const dialogTitle = dialog.querySelector('#art-dialog-title');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const escapeStorage = (fn) => { try { return fn(); } catch { return null; } };
let manualStatic = escapeStorage(() => localStorage.getItem('saori-gallery-static')) === 'true';
let current = 0;
let position = 0;
let inView = false;
let queued = false;
let galleryTop = 0;
let navHeight = 68;
let viewHeight = innerHeight;
let stopBackground = () => {};
const isStatic = () => manualStatic || reduced.matches;

const textNode = (tag, className, text) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = text;
  return el;
};

function openDialog() {
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}

function showArtwork(index) {
  const art = artworks[index];
  dialogTitle.textContent = art.title;
  const img = document.createElement('img');
  img.className = 'art-dialog-image';
  img.src = art.image;
  img.alt = art.alt;
  const credit = textNode('p', 'art-dialog-credit', art.credit);
  if (art.creator && art.source && /^https:\/\//.test(art.source)) {
    const link = textNode('a', '', `作者：${art.creator} ↗`);
    link.href = art.source;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    credit.replaceChildren(link);
  }
  const back = textNode('button', '', '作品一覧へ');
  back.type = 'button';
  back.addEventListener('click', showIndex);
  const original = textNode('a', 'art-original', '原画を開く ↗');
  original.href = art.image;
  original.target = '_blank';
  original.rel = 'noopener noreferrer';
  dialogBody.replaceChildren(img, credit, back, original);
  openDialog();
}

function showIndex() {
  dialogTitle.textContent = 'Collection';
  const list = document.createElement('div');
  list.className = 'art-index';
  artworks.forEach((art, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    const image = document.createElement('img');
    image.src = art.preview || art.image;
    image.loading = 'lazy';
    image.alt = art.alt;
    button.append(image, textNode('strong', '', art.title), textNode('small', '', art.credit));
    button.addEventListener('click', () => showArtwork(index));
    list.append(button);
  });
  dialogBody.replaceChildren(list);
  openDialog();
}

const pieces = exhibition.map((art, sceneIndex) => {
  const figure = document.createElement('figure');
  figure.className = 'gallery-piece';
  figure.dataset.kind = art.kind || 'object';
  figure.dataset.layout = sceneIndex % 2 ? 'left' : 'right';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'gallery-art-button';
  button.dataset.kind = art.kind || 'object';
  button.setAttribute('aria-label', `${art.title}を大きく見る`);
  const image = document.createElement('img');
  image.src = art.preview || art.image;
  image.alt = art.alt;
  image.decoding = 'async';
  button.append(image);
  button.addEventListener('click', () => showArtwork(artworks.indexOf(art)));
  const caption = document.createElement('figcaption');
  caption.append(textNode('p', 'art-subtitle', art.subtitle), textNode('h3', '', art.title), textNode('p', 'art-credit', art.credit));
  const companionArt = artworks[[3, 4, 11, 9, 12, 10][sceneIndex]];
  const companion = document.createElement('button');
  companion.type = 'button';
  companion.className = 'gallery-companion';
  companion.setAttribute('aria-label', `${companionArt.title}を大きく見る`);
  const companionImage = document.createElement('img');
  companionImage.src = companionArt.preview || companionArt.image;
  companionImage.alt = companionArt.alt;
  companionImage.decoding = 'async';
  companion.append(companionImage);
  companion.addEventListener('click', () => showArtwork(artworks.indexOf(companionArt)));
  figure.append(companion, button, caption);
  track.append(figure);
  return figure;
});

function draw() {
  queued = false;
  if (isStatic()) return;
  const state = sceneAt(scrollY, galleryTop, viewHeight, pieces.length);
  position = state.position;
  current = state.active;
  pieces.forEach((piece, index) => {
    const pose = artworkPose(index, position);
    piece.style.transform = `translateX(${pose.x}vw)`;
    piece.style.opacity = pose.opacity;
    piece.inert = index !== current;
    piece.setAttribute('aria-hidden', String(index !== current));
    piece.style.zIndex = String(10 - Math.round(Math.abs(index - position) * 3));
  });
  section.dataset.active = String(current);
  counter.textContent = `${String(current + 1).padStart(2,'0')} / ${String(pieces.length).padStart(2,'0')}`;
  progressBar.style.width = `${(position + 1) / pieces.length * 100}%`;
}

function requestDraw() {
  if (!queued) { queued = true; requestAnimationFrame(draw); }
}

function measure() {
  navHeight = Math.ceil(nav.getBoundingClientRect().height);
  viewHeight = Math.max(1, innerHeight - navHeight);
  section.style.setProperty('--gallery-nav', `${navHeight}px`);
  section.style.setProperty('--gallery-height', `${viewHeight}px`);
  section.style.height = isStatic() ? 'auto' : `${viewHeight + (pieces.length - 1) * viewHeight * .65}px`;
  galleryTop = section.getBoundingClientRect().top + scrollY - navHeight;
  requestDraw();
}

function setMode() {
  section.classList.toggle('gallery-static', isStatic());
  staticButton.setAttribute('aria-pressed', String(isStatic()));
  staticButton.textContent = isStatic() ? '演出表示' : '静止表示';
  if (isStatic()) {
    pieces.forEach(piece => {
      piece.removeAttribute('style');
      piece.inert = false;
      piece.removeAttribute('aria-hidden');
    });
  }
  measure();
  stopBackground();
}

function move(direction) {
  if (isStatic()) return;
  const target = clamp(Math.round(position) + direction, 0, pieces.length - 1);
  window.scrollTo({ top: galleryTop + target * viewHeight * .65, behavior: 'smooth' });
}

section.querySelector('[data-gallery-next]').addEventListener('click', () => move(1));
section.querySelector('[data-gallery-prev]').addEventListener('click', () => move(-1));
section.querySelector('[data-gallery-index]').addEventListener('click', showIndex);
staticButton.addEventListener('click', () => {
  manualStatic = !isStatic();
  escapeStorage(() => localStorage.setItem('saori-gallery-static', String(manualStatic)));
  setMode();
  section.scrollIntoView({ behavior: 'instant' });
});
dialog.querySelector('[data-art-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
section.classList.add('gallery-ready');
setMode();
addEventListener('scroll', requestDraw, { passive: true });
addEventListener('resize', measure, { passive: true });
new ResizeObserver(measure).observe(nav);
document.fonts.ready.then(measure);
// Honor a direct gallery link after the page's initial layout settles, unless the
// visitor has already begun interacting. Later resize never changes their scroll.
let userInteracted = false;
['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(type => addEventListener(type, () => { userInteracted = true; }, { once: true, passive: true }));
document.fonts.ready.then(() => {
  measure();
  if (location.hash === '#gallery' && !userInteracted) window.scrollTo({ top: galleryTop, behavior: 'instant' });
});
const alignInitialHash = () => requestAnimationFrame(() => {
  measure();
  if (location.hash === '#gallery' && !userInteracted) window.scrollTo({ top: galleryTop, behavior: 'instant' });
});
if (document.readyState === 'complete') alignInitialHash();
else addEventListener('load', alignInitialHash, { once: true });
reduced.addEventListener('change', setMode);

// Shader-only background: original artwork stays untouched in ordinary image elements.
function createBackground(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' });
  if (!gl) return () => {};
  const vertex = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
  const fragment = `precision mediump float;
  uniform vec2 resolution; uniform float time; uniform float scene;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  void main(){
    vec2 uv=gl_FragCoord.xy/resolution;vec2 p=(uv-.5)*vec2(resolution.x/resolution.y,1.);
    float t=time*.13;
    float angle=-.45+scene*.22;
    p=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*p;
    vec3 color=mix(vec3(.045,.025,.075),vec3(.14,.035,.10),uv.x);
    float wave=sin(p.x*2.5+t)*.16+sin(p.x*4.-t*.7)*.05;
    float d=abs(p.y-wave);
    float ribbon=exp(-d*9.);
    float filament=pow(.5+.5*sin((p.y-wave)*32.+p.x*3.-t),22.);
    vec3 pink=mix(vec3(.54,.13,.33),vec3(.25,.17,.53),.5+.5*sin(scene*2.));
    color+=pink*ribbon*.7;
    color+=vec3(.95,.63,.78)*filament*ribbon*.23;
    float beam=abs(p.y+sin(p.x*1.8-t)*.22+.15);
    color+=vec3(.55,.29,.5)*exp(-beam*45.)*.4;
    vec2 cell=floor((uv+vec2(time*.001,0.))*vec2(100.,65.));
    float star=step(.997,hash(cell));
    vec2 f=fract((uv+vec2(time*.001,0.))*vec2(100.,65.))-.5;
    color+=star*exp(-dot(f,f)*90.)*.45;
    color*=1.-.45*dot(uv-.5,uv-.5);
    gl_FragColor=vec4(color,1.);
  }`;
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
  };
  const vs = compile(gl.VERTEX_SHADER, vertex);
  const fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) { canvas.hidden = true; return () => {}; }
  const program = gl.createProgram();
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { canvas.hidden = true; return () => {}; }
  gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const attr = gl.getAttribLocation(program, 'a'); gl.enableVertexAttribArray(attr); gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
  const uniforms = Object.fromEntries(['resolution','time','scene'].map(key => [key,gl.getUniformLocation(program,key)]));
  let frame = 0;
  let previous = 0;
  const render = timestamp => {
    frame = 0;
    if (!inView || isStatic() || document.hidden) return;
    frame = requestAnimationFrame(render);
    if (timestamp - previous < 33) return;
    previous = timestamp;
    const ratio = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1 : 1.5);
    const width = Math.round(canvas.clientWidth * ratio), height = Math.round(canvas.clientHeight * ratio);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; gl.viewport(0,0,width,height); }
    gl.uniform2f(uniforms.resolution,width,height); gl.uniform1f(uniforms.time,timestamp/1000); gl.uniform1f(uniforms.scene,position);
    gl.drawArrays(gl.TRIANGLES,0,6);
  };
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); cancelAnimationFrame(frame); frame = 0; canvas.hidden = true; });
  const sync = () => {
    cancelAnimationFrame(frame); frame = 0;
    if (inView && !isStatic() && !document.hidden) frame = requestAnimationFrame(render);
  };
  document.addEventListener('visibilitychange', sync);
  return sync;
}

stopBackground = createBackground(section.querySelector('canvas'));
new IntersectionObserver(entries => {
  inView = entries[0].isIntersecting;
  document.documentElement.classList.toggle('gallery-view', inView);
  stopBackground();
}, { threshold: 0.1 }).observe(section.querySelector('.gallery-stage'));
