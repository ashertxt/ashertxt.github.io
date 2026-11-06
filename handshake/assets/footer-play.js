
(()=>{
const footer=document.querySelector('.site-footer'),layer=footer?.querySelector('.footer-play');
if(!footer||!layer)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const alien='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 5C9 5 3 22 13 38C20 50 28 59 32 59S44 50 51 38C61 22 55 5 32 5Z" fill="#b2ff00" stroke="#0c1821" stroke-width="2"/><ellipse cx="21" cy="29" rx="7" ry="11" transform="rotate(-28 21 29)" fill="#0c1821"/><ellipse cx="43" cy="29" rx="7" ry="11" transform="rotate(28 43 29)" fill="#0c1821"/><path d="M27 46Q32 50 37 46" stroke="#0c1821" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>';
const cat='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M9 28L8 6L25 18Q32 15 39 18L56 6L55 28C64 59 0 59 9 28Z" fill="#0c1821" stroke="#0c1821" stroke-width="2" stroke-linejoin="round"/><path d="M14 16L15 27L22 22M50 16L49 27L42 22" fill="#007f78"/><path d="M17 33Q23 27 28 33Q23 39 17 33M36 33Q42 27 47 33Q42 39 36 33" fill="#b2ff00"/><path d="M22 30V36M42 30V36" stroke="#0c1821" stroke-width="2"/><path d="M29 42L32 45L35 42Z" fill="#00cfc0"/><path d="M9 39L22 41M8 46L22 45M42 41L55 39M42 45L56 46" stroke="#00cfc0" stroke-width="1.5"/></svg>';
let W=footer.clientWidth,H=footer.clientHeight,active=false,raf=0,last=0,quiet=0;
const headRadius=()=>matchMedia('(max-width:700px)').matches?34:60;
const bodies=Array.from({length:8},(_,i)=>{const el=document.createElement('button');el.className='footer-head';el.innerHTML=i%2?cat:alien;el.type='button';el.setAttribute('aria-label',(i%2?'Black cat':'Alien')+' '+(Math.floor(i/2)+1)+(i===0?' — click, tap, or press Enter to bounce; drag to toss':''));layer.append(el);const r=headRadius();return {el,x:r+(i%4)*(W-2*r)/3,y:r+Math.floor(i/4)*(2*r+4),vx:(i%2?1:-1)*.45,vy:0,r,angle:0,spin:0,held:false};});
const draw=b=>b.el.style.transform=`translate(${b.x-b.r}px,${b.y-b.r}px) rotate(${b.angle}deg)`;
function wake(){quiet=0;if(!raf){last=0;raf=requestAnimationFrame(tick);}}
function tick(t){const dt=last?Math.min((t-last)/16.667,2):1;last=t;let energy=0;
for(const b of bodies){if(b.held)continue;b.vy+=.14*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.angle+=b.spin*dt;b.vx*=Math.pow(.994,dt);b.spin*=Math.pow(.98,dt);
if(b.x<b.r||b.x>W-b.r){b.x=Math.max(b.r,Math.min(W-b.r,b.x));b.vx*=-.5;}
if(b.y<b.r){b.y=b.r;b.vy=Math.abs(b.vy)*.6;}
if(b.y>H-b.r){b.y=H-b.r;b.vy=Math.abs(b.vy)<1?0:-b.vy*.32;b.vx*=.92;b.spin*=.8;}
}
for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){let a=bodies[i],b=bodies[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.01,over=a.r+b.r-d;if(over>0){let nx=dx/d,ny=dy/d,share=a.held||b.held?1:.5;if(!a.held){a.x-=nx*over*share;a.y-=ny*over*share;}if(!b.held){b.x+=nx*over*share;b.y+=ny*over*share;}let v=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(v<0){let imp=-v*.72;if(!a.held){a.vx-=imp*nx;a.vy-=imp*ny;}if(!b.held){b.vx+=imp*nx;b.vy+=imp*ny;}}}}
for(const b of bodies){draw(b);energy+=Math.abs(b.vx)+Math.abs(b.vy);}
quiet=energy<1?quiet+1:0;if(quiet>90&&!bodies.some(b=>b.held)){raf=0;return;}raf=requestAnimationFrame(tick);}
for(const b of bodies){draw(b);let prev,offset,start,moved=false;
b.el.addEventListener('pointerdown',e=>{moved=false;start={x:e.clientX,y:e.clientY};b.held=true;b.vx=b.vy=0;b.el.setPointerCapture(e.pointerId);const rect=footer.getBoundingClientRect();offset={x:e.clientX-rect.left-b.x,y:e.clientY-rect.top-b.y};prev={x:e.clientX,y:e.clientY,t:e.timeStamp};wake();});
b.el.addEventListener('pointermove',e=>{if(!b.held)return;if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>6)moved=true;const rect=footer.getBoundingClientRect();b.x=Math.max(b.r,Math.min(W-b.r,e.clientX-rect.left-offset.x));b.y=Math.max(b.r,Math.min(H-b.r,e.clientY-rect.top-offset.y));const dt=Math.max(8,e.timeStamp-prev.t);b.vx=Math.max(-16,Math.min(16,(e.clientX-prev.x)*16.667/dt));b.vy=Math.max(-16,Math.min(16,(e.clientY-prev.y)*16.667/dt));prev={x:e.clientX,y:e.clientY,t:e.timeStamp};draw(b);});
const release=()=>{b.held=false;b.spin=b.vx*.35;wake();};b.el.addEventListener('pointerup',release);b.el.addEventListener('pointercancel',release);b.el.addEventListener('lostpointercapture',()=>{if(b.held)release();});b.el.addEventListener('click',e=>{if(e.detail>0&&moved){moved=false;return;}b.vy=reduced.matches?-3:-9;b.vx=(Math.random()-.5)*8;wake();});
}
new ResizeObserver(()=>{W=footer.clientWidth;H=footer.clientHeight;for(const b of bodies){b.r=headRadius();b.x=Math.max(b.r,Math.min(W-b.r,b.x));b.y=Math.min(H-b.r,b.y);draw(b);}if(active)wake();}).observe(footer);
new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting&&!active){active=true;if(reduced.matches){bodies.forEach((b,i)=>{b.x=b.r+(i%4)*(W-2*b.r)/3;b.y=H-b.r-Math.floor(i/4)*2*b.r;b.vx=b.vy=0;draw(b);});}else wake();}else if(!entry.isIntersecting&&raf){cancelAnimationFrame(raf);raf=0;}else if(entry.isIntersecting&&active&&!reduced.matches)wake();}},{threshold:.1}).observe(footer);
})();

