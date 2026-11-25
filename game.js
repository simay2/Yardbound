import {newGame,step,cast,doors,lineupFor,forwardExit,RULES,ITEMS,BOSSES,OWNER} from './engine.js';
import {drawRoom,roomName} from './rooms.js';
import {drawSprite} from './sprites.js';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d');
const labels={unicorn:'The plush unicorn',lep:'Coin trickster',felix:'Felix',witch:'The Mirror Witch',mouse:'Wind-up mice',moth:'Dusty moth',teapot:'Haunted teapot',
 phoenix:'Phoenix',dragon:'Little dragon',dog:'Guard dog',cucumber:'Sneaky cucumber',medusa:'Medusa',giant:'The Giant',loki:'Loki',sphinx:'The Sphinx'};
const tips={unicorn:'Sidestep the unicorn after its “!” – it charges in a straight line.',lep:'Dodge the flying coins.',felix:'Move outside the golden circle before the bomb bursts.',witch:'Slip between the apples and reel your yarn through the witch.',
 mouse:'Wind-up mice squeak, then scurry straight at you.',moth:'The moth circles overhead and swoops after it flashes.',teapot:'The teapot bursts steam in a ring – stand in the gaps.',
 phoenix:'The phoenix leaves burning embers and rises once from its ashes.',dragon:'Step out of line when the dragon takes a breath.',dog:'Keep your distance – the dog’s bark sends out a ring.',cucumber:'When the floor wobbles beside you, run – a cucumber is about to pop up!',
 medusa:'When Medusa’s eyes glow, run AWAY from her or you turn to stone. Dodge her slithering snakes.',
 giant:'Leave the marked circle before the Giant lands, then slip between the flying rubble.',
 loki:'Loki leaves copies behind – only the real Loki casts a shadow.',
 sphinx:'Circle around the Sphinx to stay between her sun rays, then dodge the sand.'};
const sizes={medusa:112,giant:150,loki:108,sphinx:120,owner:128,witch:113,mouse:54,moth:62,teapot:64,phoenix:74,dragon:76,dog:80,cucumber:62};
const flyers=['moth','phoenix'],still=['teapot','moth','phoenix','cucumber'];
const sideWords={north:'top',south:'bottom',east:'right',west:'left'};
const the=name=>name.startsWith('The ')?name:'the '+name;
const boss=f=>BOSSES.includes(f.type)&&!f.clone;
const roomTip=()=>[...new Set(g.foes.map(f=>f.type))].sort((a,b)=>BOSSES.includes(b)-BOSSES.includes(a)).map(t=>tips[t]).join(' ');
const guests=()=>[2,3,4,5].flatMap(r=>lineupFor(g,r)).filter((t,i,a)=>!BOSSES.includes(t)&&a.indexOf(t)===i).map(t=>t==='felix'?labels[t]:labels[t].toLowerCase()).join(', ');
// Preview mode: ?dev shows ◀ ▶ day buttons, ?day=2026-12-24 opens a specific day.
const params=new URLSearchParams(location.search),devMode=params.has('dev')||params.has('day');
let date=params.get('day')?new Date(params.get('day')+'T12:00:00Z'):new Date();
if(isNaN(date))date=new Date();
const seedOf=d=>Number(d.toISOString().slice(0,10).replaceAll('-',''));
let seed=seedOf(date);
drawSprite($('portrait').getContext('2d'),'cat',50,51,89,0,{});
let g=newGame(seed),mode='ready',last=performance.now(),hudKey='',bgKey='';
const timeEl=document.querySelector('time');
function showDay(){document.querySelector('.brand p').textContent=labels[g.boss];timeEl.textContent=new Intl.DateTimeFormat('en-GB',{month:'short',day:'numeric',timeZone:'UTC'}).format(date)+' · '+RULES[g.rule].name;}
function changeDay(delta){
 date=new Date(date.getTime()+delta*864e5);seed=seedOf(date);g=newGame(seed);mode='ready';bgKey=hudKey='';showDay();
 if(devMode)history.replaceState(null,'','?day='+date.toISOString().slice(0,10));
}
if(devMode){
 const wrap=document.createElement('span');wrap.className='days';
 const btn=(label,delta,name)=>{const b=document.createElement('button');b.textContent=label;b.ariaLabel=name;b.onclick=()=>{changeDay(delta);b.blur();};return b;};
 timeEl.replaceWith(wrap);wrap.append(btn('◀',-1,'Previous day'),timeEl,btn('▶',1,'Next day'));
}
showDay();
// Debug handle for testing in preview mode only, e.g. yarnbound.game in the browser console.
if(devMode)globalThis.yarnbound={get game(){return g;}};
const keys=new Set(),stick={x:0,y:0},back=document.createElement('canvas');back.width=960;back.height=540;
function clearedHint(){
 const p=g.hero,next=forwardExit(g),item=ITEMS[g.item];
 if(g.room===0)return 'The top door leads to the bedroom. The '+sideWords[next.side]+' door leads to '+the(roomName(next.kind))+'.';
 if(g.room===1)return p.item?item.name+'! '+item.text+' Return through the bottom door.':'Walk up to the '+item.name.toLowerCase()+' on the footstool.';
 if(g.layout[g.room]==='home')return 'Your human is waiting with open arms – run over for a hug!';
 if(next?.kind==='home')return 'The spell is broken! Your human is waiting behind the '+sideWords[next.side]+' door.';
 return next?'The '+sideWords[next.side]+' doorway leads to '+the(roomName(next.kind))+'.':'';
}
function ui(){
 const p=g.hero,k=[mode,g.room,p.hp,p.max,p.item,g.foes.length,g.phase].join('|');if(k===hudKey)return;hudKey=k;
 $('hearts').textContent='♥ '.repeat(p.hp)+'♡ '.repeat(p.max-p.hp);$('hearts').ariaLabel=p.hp+' of '+p.max+' hearts';
 $('item').textContent=p.item?'✦ '+ITEMS[p.item].name:'Bare paws';$('room').textContent=roomName(g.layout[g.room]);
 $('pause').disabled=!['playing','paused'].includes(mode);$('pause').textContent=mode==='paused'?'▶':'Ⅱ';$('pause').ariaLabel=mode==='paused'?'Resume game':'Pause game';document.body.classList.toggle('playing',mode==='playing');
 const rule=RULES[g.rule];
 const lines= mode==='ready'?[labels[g.boss],rule.name+': '+rule.text+' Find the '+ITEMS[g.item].name.toLowerCase()+' in the bedroom. Tonight’s guests: '+guests()+'.','Play dream']:
 g.phase==='hug'?['A big hug!','You broke the spell and ran home to your human.','']:
 mode==='paused'?['A little catnap','Your dream is paused.','Resume']:
 mode==='done'?(g.phase==='won'?['Home sweet home!','You defeated '+labels[g.boss]+' and hugged your human after '+Math.floor(g.clock)+' seconds.','Dream again']:['Out of hearts','Try moving sideways after casting to catch enemies in the thread.','Try again']):
 [roomName(g.layout[g.room]),g.foes.length?roomTip():clearedHint(),''];
 [$('title').textContent,$('hint').textContent,$('go').textContent]=lines;$('go').disabled=false;
}
function disk(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2.3;ctx.stroke();}}
function projectiles(t){for(const s of g.shots){if(s.type==='bomb'){ctx.save();ctx.setLineDash([7,5]);ctx.strokeStyle='#ffb456';ctx.lineWidth=3;ctx.beginPath();ctx.arc(s.target.x,s.target.y,63,0,7);ctx.stroke();ctx.restore();
 const z=Math.sin(Math.PI*Math.min(1,(s.total-s.ttl)/.7))*42;disk(s.x,s.y-z,11,'#422e45','#180f21');disk(s.x+4,s.y-z-12,4,'#ffc750');}
 else if(s.type==='bark'){ctx.save();ctx.globalAlpha=s.ttl/s.total;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.strokeStyle='#f3e2c4';ctx.lineWidth=7;ctx.stroke();ctx.strokeStyle='#8a5a3a';ctx.lineWidth=2;ctx.stroke();
  if(s.ttl>s.total-.4){ctx.fillStyle='#fff3d6';ctx.font='bold 20px Georgia';ctx.textAlign='center';ctx.fillText('WOOF!',s.x,s.y-78);}ctx.restore();}
 else if(s.type==='ember'){const f=.8+.2*Math.sin(t*30+s.x);ctx.save();ctx.globalAlpha=Math.min(1,s.ttl/.4);disk(s.x,s.y,9*f,'#ff8a3c','#b8442a');disk(s.x,s.y-2,4*f,'#ffd25a');ctx.restore();}
 else if(s.type==='flame'){disk(s.x,s.y,10,'#ff7a3c','#a83a24');disk(s.x-2,s.y-2,5,'#ffd25a');}
 else if(s.type==='steam'){ctx.save();ctx.globalAlpha=.85;disk(s.x,s.y,10,'#eef7f4','#7fa7a8');disk(s.x-3,s.y-3,4,'#ffffff');ctx.restore();}
 else if(s.type==='snake'){const n=Math.hypot(s.dx,s.dy)||1,ux=s.dx/n,uy=s.dy/n;ctx.save();ctx.lineCap='round';ctx.beginPath();
  for(let i=0;i<=6;i++){const back=i*4,w=Math.sin(s.wiggle*7-i*.9)*5;ctx.lineTo(s.x-ux*back-uy*w,s.y-uy*back+ux*w);}
  ctx.strokeStyle='#182640';ctx.lineWidth=9;ctx.stroke();ctx.strokeStyle='#86c26e';ctx.lineWidth=6;ctx.stroke();ctx.restore();disk(s.x,s.y,5,'#6fae5c','#182640');}
 else if(s.type==='rock'||s.type==='rubble'){const r=s.type==='rock'?15:8;disk(s.x,s.y,r,'#8f8a84','#3f3b38');disk(s.x-r*.3,s.y-r*.3,r*.35,'#b5afa8');}
 else if(s.type==='dagger'){const a=Math.atan2(s.dy,s.dx);ctx.save();ctx.translate(s.x,s.y);ctx.rotate(a);ctx.fillStyle='#d6dee6';ctx.strokeStyle='#182640';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-4,-4);ctx.lineTo(-4,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#e3b94e';ctx.fillRect(-10,-3,7,6);ctx.restore();}
 else if(s.type==='sand'){ctx.save();ctx.globalAlpha=.9;disk(s.x,s.y,8,'#e7c97f','#a8823c');disk(s.x+3,s.y-2,3,'#fff0c0');ctx.restore();}
 else if(s.type==='coin'){disk(s.x,s.y,9,'#fac947','#824918');ctx.fillStyle='#a86325';ctx.fillRect(s.x-1,s.y-5,2,10);}
 else{disk(s.x,s.y,9,'#df545e','#502441');ctx.fillStyle='#89af6b';ctx.fillRect(s.x+1,s.y-13,5,6);}}}
function yarn(x,y){disk(x,y,10,'#f793a9','#69415a');ctx.strokeStyle='#af5475';ctx.lineWidth=1.6;for(const o of [-4,0,4]){ctx.beginPath();ctx.ellipse(x+o*.5,y,3,8,-.6,0,6.28);ctx.stroke();}}
function render(){const d=doors(g),kind=g.layout[g.room],key=kind+JSON.stringify(d);if(key!==bgKey){bgKey=key;drawRoom(back.getContext('2d'),kind,seed,d);}ctx.drawImage(back,0,0);
 const p=g.hero,b=g.ball,t=g.clock+(g.hug||0),marks=[],hugging=g.phase==='hug'||g.phase==='won'&&g.hug!==undefined;
 // Sphinx sun rays sit on the floor beneath everyone: faint while she charges, blazing while active.
 for(const f of g.foes)if(f.type==='sphinx'&&(f.mode==='rays'||f.mode==='warn'&&f.next==='rays')){
  const live=f.mode==='rays';ctx.save();ctx.lineCap='round';
  for(let k=0;k<f.rays;k++){const a=f.rayAngle+k*Math.PI*2/f.rays;ctx.beginPath();ctx.moveTo(f.x+Math.cos(a)*34,f.y+Math.sin(a)*34);ctx.lineTo(f.x+Math.cos(a)*460,f.y+Math.sin(a)*460);
   ctx.strokeStyle=live?'#ffd25a99':'#ffd25a40';ctx.lineWidth=live?22:6;ctx.stroke();if(live){ctx.strokeStyle='#fff6c8';ctx.lineWidth=6;ctx.stroke();}}
  ctx.restore();}
 // The Giant's landing zone.
 for(const f of g.foes)if(f.type==='giant'&&f.mode==='leap'){ctx.save();ctx.setLineDash([9,6]);ctx.strokeStyle='#ff8f5a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.to.x,f.to.y,85,0,7);ctx.stroke();ctx.restore();}
 if(g.room===1&&!p.item){drawSprite(ctx,g.item,480,246+3*Math.sin(t*3),50,t,{});}
 if(b.state!=='held'){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle='#ffc0cb';ctx.lineWidth=3;ctx.stroke();}
 const human=g.layout[g.room]==='home'?{...OWNER,owner:true}:null;
 for(const a of [...g.foes,p,...(human?[human]:[])].sort((a,b)=>a.y-b.y)){const hero=a===p;
 // The human kneels with open arms; once the cat arrives they hug, with hearts floating up.
 if(a.owner){ctx.fillStyle='#16192455';ctx.beginPath();ctx.ellipse(a.x,a.y+14,34,8,0,0,7);ctx.fill();
  drawSprite(ctx,'owner',a.x,a.y+14-sizes.owner*.46,sizes.owner,t,{hug:hugging,scarf:p.item==='scarf',bell:p.item==='bell'});
  if(hugging)for(let i=0;i<6;i++){const k=((g.hug||0)*.6+i/6)%1;ctx.save();ctx.globalAlpha=1-k;ctx.fillStyle=i%2?'#f07a8c':'#ff9fb0';ctx.font='bold '+(16+i%3*5)+'px Georgia';ctx.textAlign='center';
   ctx.fillText('♥',a.x+Math.sin(i*2.4+k*5)*42,a.y-70-k*90);ctx.restore();}
  continue;}
 if(hero&&hugging)continue;
 const type=hero?'cat':a.type;
 // A hidden cucumber shows only as wobbling floor just before it pops up.
 if(!hero&&a.hidden){if(a.mode==='warn'){const w=Math.sin(t*40)*2;ctx.fillStyle='#6b4f3a88';ctx.beginPath();ctx.ellipse(a.x+w,a.y+10,24,8,0,0,7);ctx.fill();ctx.strokeStyle='#3f2e25';ctx.lineWidth=2;ctx.stroke();marks.push([a.x,a.y-14]);}continue;}
 ctx.save();if(hero&&p.inv>0&&Math.floor(p.inv*9)%2||!hero&&a.inv>0)ctx.globalAlpha=.62;
 // Petrified by Medusa: the cat turns grey until the stone cracks.
 if(hero&&p.stone>0)ctx.filter='grayscale(1) brightness(.85)';
 const flying=flyers.includes(type)&&a.mode!=='ashes';
 // Loki's copies are illusions – they cast no shadow.
 if(!a.clone){ctx.fillStyle='#16192455';ctx.beginPath();ctx.ellipse(a.x,a.y+12,type==='giant'?46:BOSSES.includes(type)?34:type==='dog'?27:type==='mouse'?17:21,flying?5:7,0,0,7);ctx.fill();}
 const h=hero?76:sizes[type]||67,lift=flying?(a.mode==='dash'?10:30)+4*Math.sin(t*3+a.phase):a.air||0;
 drawSprite(ctx,type,a.x,a.y+14-h*.46-lift,h,t,{flip:hero?p.facing==='side'&&p.flip:a.flip,facing:hero?p.facing:undefined,stride:hero?p.stride:undefined,scarf:hero&&p.item==='scarf',bell:hero&&p.item==='bell',
  moving:hero?p.moving:mode==='playing'&&!still.includes(type)&&!(a.stun>0),charging:a.mode==='warn',mode:a.mode,next:a.next});ctx.restore();
 if(hero&&p.stone>0){ctx.strokeStyle='#5d5a57';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-8,p.y-40);ctx.lineTo(p.x-2,p.y-30);ctx.lineTo(p.x-7,p.y-20);ctx.moveTo(p.x+9,p.y-12);ctx.lineTo(p.x+3,p.y-4);ctx.stroke();}
 if(!hero&&a.type==='medusa'&&a.mode==='warn'&&a.next==='gaze'){ctx.fillStyle='#ffe066';ctx.font='bold 17px Georgia';ctx.textAlign='center';ctx.fillText('LOOK AWAY!',a.x,a.y-h-14);}
 if(!hero&&a.mode==='warn')marks.push([a.x,a.y-h+9-lift]);
 if(!hero&&a.stun>0){ctx.fillStyle='#ffe58a';for(let i=0;i<3;i++){const an=t*5+i*2.09;disk(a.x+Math.cos(an)*15,a.y-h+4-lift+Math.sin(an)*4,3,'#ffe58a','#9a7a2a');}}
 if(!hero&&a.hp<a.max&&type!=='witch'){ctx.fillStyle='#382a3e';ctx.fillRect(a.x-15,a.y+19,30,4);ctx.fillStyle='#ef998a';ctx.fillRect(a.x-15,a.y+19,30*a.hp/a.max,4);}
 }
 yarn(b.state==='held'?p.x+17:b.x,b.state==='held'?p.y+5:b.y);
 // Candlelight night: darkness everywhere except a warm circle around the cat. Attacks and
 // warnings are drawn on top so the challenge stays fair.
 if(g.rule==='candle'){const gr=ctx.createRadialGradient(p.x,p.y,70,p.x,p.y,270);gr.addColorStop(0,'rgba(12,14,32,0)');gr.addColorStop(1,'rgba(12,14,32,.88)');ctx.fillStyle=gr;ctx.fillRect(0,0,960,540);}
 projectiles(t);
 ctx.fillStyle='#ffda86';ctx.font='bold 21px Georgia';ctx.textAlign='center';for(const [x,y] of marks)ctx.fillText('!',x,y);
 const fxStyle={fire:['#ff9749',8,20,45],hit:['#ffe1a1',3,12,19],gaze:['#ffe066',5,20,120],quake:['#9b7a55',10,30,90],puff:['#d9f0e0',12,6,26]};
 for(const e of g.fx){const [color,width,r0,grow]=fxStyle[e.kind]||fxStyle.hit;ctx.save();ctx.globalAlpha=e.ttl/e.total;const k=1-e.ttl/e.total;ctx.lineWidth=width;ctx.strokeStyle=color;ctx.beginPath();ctx.arc(e.x,e.y,r0+k*grow,0,7);ctx.stroke();ctx.restore();}
 const big=g.foes.find(boss);if(big){ctx.fillStyle='#23182b';ctx.fillRect(335,15,290,22);ctx.fillStyle='#b54863';ctx.fillRect(337,17,286*big.hp/big.max,18);ctx.fillStyle='white';ctx.textAlign='center';ctx.font='bold 13px Georgia';ctx.fillText(labels[big.type],480,30);}
}
function toggle(){if(mode==='playing'){mode='paused';keys.clear();stick.x=stick.y=0;}else if(mode==='paused')mode='playing';ui();}
$('pause').onclick=toggle;$('go').onclick=()=>{if(mode==='paused')toggle();else{g=newGame(seed);bgKey='';mode='playing';ui();}};
function fire(target){if(mode==='playing')cast(g,target);}
canvas.onpointerdown=e=>{const r=canvas.getBoundingClientRect();fire({x:(e.clientX-r.left)*960/r.width,y:(e.clientY-r.top)*540/r.height});};
$('cast').onpointerdown=()=>fire();onkeydown=e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&mode==='playing')e.preventDefault();keys.add(e.code);if(!e.repeat){if(e.code==='Space')fire();if(e.code==='Escape')toggle();}};onkeyup=e=>keys.delete(e.code);onblur=()=>{keys.clear();if(mode==='playing')toggle();};
const pad=$('pad');function joystick(e){let r=pad.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/22,y=(e.clientY-r.top-r.height/2)/22,n=Math.max(1,Math.hypot(x,y));stick.x=x/n;stick.y=y/n;pad.firstChild.style.transform='translate('+stick.x*17+'px,'+stick.y*17+'px)';}
pad.onpointerdown=e=>{pad.setPointerCapture(e.pointerId);joystick(e);};pad.onpointermove=e=>{if(pad.hasPointerCapture(e.pointerId))joystick(e);};pad.onlostpointercapture=()=>{stick.x=stick.y=0;pad.firstChild.style.transform='';};
function frame(now){const dt=Math.min(.06,(now-last)/1000);last=now;
 if(mode==='playing'){step(g,dt,{x:stick.x+Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),y:stick.y+Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'))});if(g.phase==='won'||g.phase==='lost')mode='done';}
 ui();render();requestAnimationFrame(frame);}
ui();requestAnimationFrame(frame);
