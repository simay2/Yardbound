import {roomFurniture} from './rooms.js';
// Coordinates are in the logical 960 × 540 playfield. This module has no DOM dependencies.
//
// A dream is a chain of seven slots: 0 living room, 1 bedroom (item of the day), 2–4 three combat
// rooms drawn daily from a larger pool, 5 the boss attic, 6 the room where the cat's human waits. The doorways between combat rooms
// also change daily, so the house is laid out differently every day.
const bounds={left:65,right:895,top:55,bottom:485};
const combatRooms=['dining','kitchen','library','bathroom','conservatory','playroom'];
const opposite={north:'south',south:'north',east:'west',west:'east'};
// Lineups get harder room by room. Each day one lineup is drawn per tier.
const tiers=[
 [['lep','unicorn'],['mouse','mouse','lep'],['unicorn','moth'],['teapot','mouse'],['moth','lep'],['cucumber','mouse'],['phoenix','lep']],
 [['felix','lep'],['felix','mouse'],['teapot','moth'],['felix','teapot'],['dog','mouse'],['dragon','moth'],['cucumber','cucumber','lep'],['phoenix','unicorn']],
 [['dog','felix'],['dragon','teapot'],['phoenix','dog'],['dragon','unicorn','mouse'],['felix','cucumber','moth'],['dog','cucumber'],['dragon','phoenix']]
];
// One boss per day, sometimes with a helper. Loki needs no helpers – he makes his own copies.
export const BOSSES=['witch','medusa','giant','loki','sphinx'];
const bossHelpers=[null,null,'moth','mouse','cucumber','phoenix'];
const isBoss=f=>BOSSES.includes(f.type)&&!f.clone;
export const HUG_TIME=3.2;
export const OWNER={x:480,y:250};
const stamina={unicorn:3,lep:3,felix:5,witch:16,medusa:16,giant:20,loki:14,sphinx:16,mouse:2,moth:2,teapot:4,phoenix:3,dragon:5,dog:5,cucumber:3};
const flyers=['moth','phoenix'];
export const RULES={
 windy:{name:'Windy night',text:'Coins, apples, steam and flames fly faster.'},
 catnip:{name:'Catnip night',text:'You run faster but start with one heart less.'},
 fullmoon:{name:'Full moon',text:'Every enemy has one extra heart.'},
 sleepy:{name:'Sleepy house',text:'Enemies are drowsy and attack more slowly.'},
 candle:{name:'Candlelight',text:'The lights are out. Only the glow around the cat shows the way.'}
};
export const ITEMS={
 scarf:{name:'Long scarf',text:'Your yarn flies much farther and you gain a heart.'},
 bell:{name:'Jingle bell',text:'Yarn hits leave enemies dizzy for a moment.'},
 fish:{name:'Sardine',text:'Your hearts grow to six and two are restored.'},
 thimble:{name:'Golden thimble',text:'Reeling the thread through a foe deals 3 damage.'}
};
const ENTRY_GRACE=1.2;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function aim(a,b){const d=distance(a,b)||1;return {x:(b.x-a.x)/d,y:(b.y-a.y)/d};}
function along(a,b,p){const x=b.x-a.x,y=b.y-a.y;const t=clamp(((p.x-a.x)*x+(p.y-a.y)*y)/(x*x+y*y||1),0,1);return Math.hypot(p.x-a.x-t*x,p.y-a.y-t*y);}
// Small deterministic PRNG (mulberry32) so everyone gets the same dream on the same day.
function rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const pick=(r,list)=>list[Math.floor(r()*list.length)];

// Furniture collision shared by the hero and the enemies. mx/my widen the footprint.
function solidAt(kind,x,y,mx,my){return roomFurniture(kind).some(r=>x>r.left-mx&&x<r.right+mx&&y>r.top-my&&y<r.bottom+my);}
function foeBlocked(kind,type,x,y){
 if(flyers.includes(type))return false; // flies over the furniture
 return type==='giant'?solidAt(kind,x,y,30,12):BOSSES.includes(type)?solidAt(kind,x,y,22,10):solidAt(kind,x,y,14,7);
}
// A random free floor spot at least `away` pixels from the cat.
function freeSpot(g,f,away){
 const p=g.hero;let x=f.x,y=f.y;
 for(let i=0;i<60;i++){x=130+f.rand()*700;y=120+f.rand()*310;if(!foeBlocked(kindOf(g),f.type,x,y)&&distance({x,y},p)>=away)break;}
 return {x,y};
}
const kindOf=g=>g.layout[g.room];
// Moves a foe axis by axis so it slides along furniture. Returns true if it bumped into something.
function slide(g,f,vx,vy,dt){
 let hit=false;const kind=kindOf(g);
 const nx=clamp(f.x+vx*dt,90,865);if(foeBlocked(kind,f.type,nx,f.y))hit=true;else f.x=nx;
 const ny=clamp(f.y+vy*dt,84,457);if(foeBlocked(kind,f.type,f.x,ny))hit=true;else f.y=ny;
 return hit;
}

export function doors(g){
 return Object.fromEntries(Object.keys(g.routes[g.room]).map(side=>[side,g.foes.length===0]));
}
// The doorway that leads deeper into the house from the current room, if any.
export function forwardExit(g){
 const entry=Object.entries(g.routes[g.room]).find(([,to])=>to>g.room&&!(g.room===0&&to===1));
 return entry?{side:entry[0],kind:g.layout[entry[1]]}:null;
}
export function lineupFor(g,slot){return g.formations[slot];}

function planHouse(r){
 const pool=[...combatRooms];
 const middle=[0,1,2].map(()=>pool.splice(Math.floor(r()*pool.length),1)[0]);
 const layout=['living','bedroom',...middle,'attic','home'];
 const routes=layout.map(()=>({}));
 const link=(from,side,to)=>{routes[from][side]=to;routes[to][opposite[side]]=from;};
 link(0,'north',1);
 link(0,pick(r,['east','west']),2);
 for(let s=2;s<6;s++){
  const cameFrom=Object.keys(routes[s])[0];
  link(s,pick(r,['north','east','south','west'].filter(d=>d!==cameFrom)),s+1);
 }
 return {layout,routes};
}
export function newGame(seed){
 const r=rng(seed);
 const {layout,routes}=planHouse(r);
 const rule=pick(r,Object.keys(RULES)),item=pick(r,Object.keys(ITEMS));
 const boss=pick(r,BOSSES),helper=boss==='loki'?null:pick(r,bossHelpers);
 const formations=[[],[],...tiers.map(t=>pick(r,t)),helper?[boss,helper]:[boss],[]];
 const hp=rule==='catnip'?4:5;
 const g={seed,rule,item,layout,routes,formations,room:0,visited:new Set(),cleared:new Set(),
  boss,hero:{x:300,y:300,hp,max:5,item:null,inv:0,stone:0,flip:false,facing:"front",stride:0,moving:false},
  clock:0,shots:[],fx:[],phase:'play',direction:{x:1,y:0}};
 enter(g,0);return g;
}
function enter(g,index,via){
 g.room=index;g.visited.add(index);g.shots=[];g.fx=[];g.ball={state:'held'};
 const p=g.hero,kind=g.layout[index];p.x=via==='west'?815:via==='east'?144:via?480:330;p.y=via==='north'?430:via==='south'?112:285;
 // Short grace period on every doorway so nothing can hit the cat the instant it arrives.
 if(via)p.inv=Math.max(p.inv,ENTRY_GRACE);
 const r=rng(g.seed*31+index*977),foes=[];
 for(const [i,type] of (g.cleared.has(index)?[]:g.formations[index]).entries()){
  let x,y,tries=0;
  do{x=150+r()*660;y=BOSSES.includes(type)?160+r()*220:110+r()*330;}
  while(++tries<80&&(foeBlocked(kind,type,x,y)||distance({x,y},p)<300||foes.some(o=>distance(o,{x,y})<80)));
  foes.push(makeFoe(g,type,x,y,i,r));
 }
 g.foes=foes;
}
function makeFoe(g,type,x,y,i,r,clone=false){
 const hp=clone?1:stamina[type]+(g.rule==='fullmoon'?1:0);
 return {type,x,y,hp,max:hp,inv:0,stun:0,mode:'ready',timer:1.25+i*.65,dx:0,dy:1,flip:false,age:0,phase:r()*Math.PI*2,volley:0,hidden:false,clone,air:0,
  rand:rng(Math.floor(r()*1e9))};
}
function hurt(g,f,amount=1){
 if(f.inv>0||f.hp<=0||f.hidden||f.mode==='ashes')return;f.hp-=amount;f.inv=.23;
 g.fx.push({x:f.x,y:f.y,kind:'hit',ttl:.25,total:.25});
 if(g.hero.item==='bell')f.stun=isBoss(f)?.5:1.1;
 if(f.hp>0)return;
 // The phoenix rises once from its ashes with half its strength.
 if(f.type==='phoenix'&&!f.reborn){f.reborn=true;f.hp=Math.ceil(f.max/2);f.mode='ashes';f.timer=1.4;f.stun=0;g.fx.push({x:f.x,y:f.y,kind:'fire',ttl:.42,total:.42});return;}
 g.foes=g.foes.filter(other=>other!==f);
 if(f.clone)g.fx.push({x:f.x,y:f.y,kind:'puff',ttl:.4,total:.4});
 // Defeating the boss breaks the spell and dispels any helpers or copies. The door to the
 // cat's human opens; the dream is won once the cat reaches them for a hug.
 if(isBoss(f)){for(const o of g.foes)g.fx.push({x:o.x,y:o.y,kind:'puff',ttl:.4,total:.4});g.foes=[];g.bossDown=true;}
 if(!g.foes.length){g.cleared.add(g.room);g.shots=[];}
}
function wound(g){
 const p=g.hero;if(p.inv>0||g.phase!=='play')return;
 p.inv=1.45;if(--p.hp===0)g.phase='lost';
}
function pickUp(g){
 const p=g.hero;p.item=g.item;
 if(g.item==='scarf')p.hp=Math.min(p.max,p.hp+1);
 if(g.item==='fish'){p.max=6;p.hp=Math.min(p.max,p.hp+2);}
}
export function cast(g,target){
 if(g.phase!=='play'||g.hero.stone>0)return;const p=g.hero,b=g.ball;
 if(b.state==='back')return;
 if(b.state!=='held'){b.state='back';for(const f of [...g.foes])if(along(p,b,f)<(f.type==='witch'?40:29))hurt(g,f,p.item==='thimble'?3:2);return;}
 const nearest=g.foes.filter(f=>!f.hidden).sort((a,b)=>distance(a,p)-distance(b,p))[0];
 const d=target||nearest?aim(p,target||nearest):g.direction;
 g.ball={state:'out',x:p.x,y:p.y,dx:d.x,dy:d.y,travel:0};
}
function shot(g,type,f,d,speed){
 speed*=g.rule==='windy'?1.3:1;
 g.shots.push({type,x:f.x,y:f.y,dx:d.x*speed,dy:d.y*speed,ttl:4});
}
function bonk(g,f,rest){f.mode='ready';f.timer=rest;g.fx.push({x:f.x,y:f.y,kind:'hit',ttl:.3,total:.3});}
// Flying foes circle the cat at a distance before swooping.
function circle(g,f,dt,radius,speed){
 const p=g.hero;f.phase+=dt*1.1;const spot={x:p.x+Math.cos(f.phase)*radius,y:p.y+Math.sin(f.phase)*radius*.78},m=aim(f,spot),v=Math.min(speed,distance(f,spot)*3);
 slide(g,f,m.x*v,m.y*v,dt);
}
function foeStep(g,f,dt){
 const p=g.hero,d=aim(f,p);f.inv-=dt;f.age+=dt;
 if(f.stun>0){f.stun-=dt;return;}
 // On a sleepy night enemies take longer to wind up their next attack.
 f.timer-=f.mode==='ready'&&g.rule==='sleepy'?dt*.7:dt;
 if(f.mode!=='dash')f.flip=d.x<0;
 if(f.type==='unicorn'){
  if(f.mode==='ready'){slide(g,f,d.x*45,d.y*45,dt);if(f.timer<=0){f.mode='warn';f.timer=.72;f.dx=d.x;f.dy=d.y;}}
  else if(f.mode==='warn'&&f.timer<=0){f.mode='dash';f.timer=.55;}
  else if(f.mode==='dash'){f.flip=f.dx<0;if(slide(g,f,f.dx*380,f.dy*380,dt))bonk(g,f,1.6);else if(f.timer<=0){f.mode='ready';f.timer=1.25;}}
 }else if(f.type==='mouse'){
  // Wind-up mouse: zig-zags towards the cat, then stops, squeaks and scurries in a straight line.
  if(f.mode==='ready'){
   const side=Math.sin(f.age*7+f.phase)*.8,vx=d.x-d.y*side,vy=d.y+d.x*side,n=Math.hypot(vx,vy)||1;
   slide(g,f,vx/n*100,vy/n*100,dt);f.flip=vx<0;
   if(f.timer<=0){f.mode='warn';f.timer=.4;f.dx=d.x;f.dy=d.y;}
  }else if(f.mode==='warn'){if(f.timer<=0){f.mode='dash';f.timer=.45;}}
  else if(f.mode==='dash'){f.flip=f.dx<0;if(slide(g,f,f.dx*270,f.dy*270,dt))bonk(g,f,1.8);else if(f.timer<=0){f.mode='ready';f.timer=1.8;}}
 }else if(f.type==='moth'){
  // Circles the cat above the furniture, then flashes and swoops through where the cat stood.
  if(f.mode==='ready'){circle(g,f,dt,155,130);if(f.timer<=0){f.mode='warn';f.timer=.6;f.dx=d.x;f.dy=d.y;}}
  else if(f.mode==='warn'){if(f.timer<=0){f.mode='dash';f.timer=.6;}}
  else if(f.mode==='dash'){f.flip=f.dx<0;slide(g,f,f.dx*330,f.dy*330,dt);if(f.timer<=0){f.mode='ready';f.timer=2.4;}}
 }else if(f.type==='phoenix'){
  // Swoops through the room and leaves a trail of embers that burn for a moment.
  if(f.mode==='ashes'){if(f.timer<=0){f.mode='ready';f.timer=1.2;}}
  else if(f.mode==='ready'){circle(g,f,dt,190,115);if(f.timer<=0){f.mode='warn';f.timer=.65;f.dx=d.x;f.dy=d.y;}}
  else if(f.mode==='warn'){if(f.timer<=0){f.mode='dash';f.timer=.75;f.drop=0;}}
  else if(f.mode==='dash'){
   f.flip=f.dx<0;slide(g,f,f.dx*300,f.dy*300,dt);f.drop-=dt;
   if(f.drop<=0){f.drop=.09;g.shots.push({type:'ember',x:f.x,y:f.y,dx:0,dy:0,ttl:1.8,total:1.8});}
   if(f.timer<=0){f.mode='ready';f.timer=2.3;}
  }
 }else if(f.type==='teapot'){
  // Haunted teapot: mostly stays put and bursts steam in a ring that rotates every volley.
  if(distance(f,p)<170)slide(g,f,-d.x*30,-d.y*30,dt);
  if(f.timer<=0&&f.mode==='ready'){f.mode='warn';f.timer=.8;}
  else if(f.timer<=0){
   const turn=f.volley++%2?Math.PI/8:0;
   for(let i=0;i<8;i++){const a=turn+i*Math.PI/4;shot(g,'steam',f,{x:Math.cos(a),y:Math.sin(a)},135);}
   f.mode='ready';f.timer=2.3;
  }
 }else if(f.type==='dragon'){
  // Little dragon keeps its distance, then breathes a short wavering stream of fire.
  if(f.mode!=='breath'){const spacing=distance(f,p),move=spacing>270?1:spacing<170?-.7:0;slide(g,f,d.x*50*move,d.y*50*move,dt);}
  if(f.mode==='ready'&&f.timer<=0){f.mode='warn';f.timer=.8;f.target={x:p.x,y:p.y};}
  else if(f.mode==='warn'&&f.timer<=0){f.mode='breath';f.timer=.6;f.drop=0;f.aimAt=aim(f,f.target);}
  else if(f.mode==='breath'){
   f.flip=f.aimAt.x<0;f.drop-=dt;
   if(f.drop<=0){f.drop=.1;const a=Math.atan2(f.aimAt.y,f.aimAt.x)+Math.sin(f.age*14)*.18;shot(g,'flame',f,{x:Math.cos(a),y:Math.sin(a)},250);}
   if(f.timer<=0){f.mode='ready';f.timer=2.4;}
  }
 }else if(f.type==='dog'){
  // Guard dog plods after the cat and barks out an expanding ring. Keep your distance!
  if(f.mode==='ready'){slide(g,f,d.x*70,d.y*70,dt);if(f.timer<=0){f.mode='warn';f.timer=.65;}}
  else if(f.mode==='warn'&&f.timer<=0){g.shots.push({type:'bark',x:f.x,y:f.y,dx:0,dy:0,r:0,ttl:.8,total:.8});f.mode='ready';f.timer=2.5;}
 }else if(f.type==='cucumber'){
  // The cat's worst nightmare: hides, the floor wobbles next to the cat, then it pops up.
  if(f.mode==='ready'){if(f.timer<=0){f.mode='hide';f.hidden=true;f.timer=.9;}}
  else if(f.mode==='hide'){
   if(f.timer<=0){
    for(let k=0;k<8;k++){const a=f.age*2.3+f.phase+k*Math.PI/4,x=clamp(p.x+Math.cos(a)*48,90,865),y=clamp(p.y+Math.sin(a)*40,84,457);
     if(!foeBlocked(kindOf(g),f.type,x,y)){f.x=x;f.y=y;break;}}
    f.mode='warn';f.timer=.75;
   }
  }else if(f.mode==='warn'&&f.timer<=0){f.mode='ready';f.hidden=false;f.timer=1.9;g.fx.push({x:f.x,y:f.y,kind:'hit',ttl:.3,total:.3});if(distance(f,p)<48)wound(g);}
 }else if(BOSSES.includes(f.type)&&f.type!=='witch'){
  bossStep(g,f,dt,d);
 }else{
  const spacing=distance(f,p), move=spacing>300?1:spacing<150?-.55:0;
  slide(g,f,d.x*34*move,d.y*34*move,dt);
  if(f.timer<=0&&f.mode==='ready'){f.mode='warn';f.timer=.7;f.target={x:p.x,y:p.y};}
  else if(f.timer<=0){const line=aim(f,f.target);
  if(f.type==='lep')shot(g,'coin',f,line,225);
  if(f.type==='felix'){g.shots.push({type:'bomb',x:f.x,y:f.y,from:{x:f.x,y:f.y},target:f.target,ttl:1.45,total:1.45});}
  if(f.type==='witch'){
  const angle=Math.atan2(line.y,line.x),spread=f.hp<=8?[-.66,-.33,0,.33,.66]:[-.32,0,.32];
  for(const offset of spread)shot(g,'apple',f,{x:Math.cos(angle+offset),y:Math.sin(angle+offset)},155);
  }
  f.mode='ready';f.timer=f.type==='witch'?(f.hp<=8?1.25:1.7):f.type==='felix'?2.3:1.55;}
 }
 // Flyers only touch the cat while swooping; a hidden cucumber only hurts when it pops up.
 const reach=f.type==='giant'?48:BOSSES.includes(f.type)?40:f.type==='mouse'?24:f.type==='dog'?32:29;
 const touching=flyers.includes(f.type)?f.mode==='dash':!f.hidden&&f.mode!=='leap';
 if(touching&&distance(f,p)<reach)wound(g);
}
function fan(g,type,f,target,count,step,speed,extra={}){
 const base=Math.atan2(target.y-f.y,target.x-f.x);
 for(let i=0;i<count;i++){const a=base+(i-(count-1)/2)*step;shot(g,type,f,{x:Math.cos(a),y:Math.sin(a)},speed);Object.assign(g.shots.at(-1),extra);}
}
function ring(g,type,f,count,speed,turn=0){for(let i=0;i<count;i++){const a=turn+i*Math.PI*2/count;shot(g,type,f,{x:Math.cos(a),y:Math.sin(a)},speed);}}
// The four new bosses. Each has two alternating attacks and gets fiercer below half health.
function bossStep(g,f,dt,d){
 const p=g.hero,angry=f.hp<=f.max/2;
 if(f.type==='medusa'){
  // Stone gaze: when her eyes glow, the cat must be moving away from her or it turns to stone.
  if(f.mode==='ready'){const sp=distance(f,p),m=sp>280?1:sp<190?-.8:0;slide(g,f,d.x*40*m,d.y*40*m,dt);
   if(f.timer<=0){f.next=f.volley++%2?'snakes':'gaze';f.mode='warn';f.timer=f.next==='gaze'?1.1:.7;}}
  else if(f.mode==='warn'&&f.timer<=0){
   if(f.next==='gaze'){const toHer=aim(p,f);if(g.direction.x*toHer.x+g.direction.y*toHer.y>.3||!p.moving)p.stone=1.4;g.fx.push({x:f.x,y:f.y-40,kind:'gaze',ttl:.5,total:.5});}
   else fan(g,'snake',f,p,angry?5:3,.38,150,{wiggle:0});
   f.mode='ready';f.timer=angry?1.3:1.8;
  }
 }else if(f.type==='giant'){
  // Leaps onto the cat's spot and showers rubble on landing, or hurls boulders.
  if(f.mode==='ready'){slide(g,f,d.x*40,d.y*40,dt);if(f.timer<=0){f.next=f.volley++%2?'rocks':'stomp';f.mode='warn';f.timer=.9;f.target={x:p.x,y:p.y};}}
  else if(f.mode==='warn'&&f.timer<=0){
   if(f.next==='stomp'){
    const to={x:clamp(f.target.x,110,850),y:clamp(f.target.y,110,440)};
    f.from={x:f.x,y:f.y};f.to=foeBlocked(kindOf(g),'giant',to.x,to.y)?{...f.from}:to;f.mode='leap';f.timer=.9;
   }else{fan(g,'rock',f,p,angry?3:2,.42,170);f.mode='ready';f.timer=angry?1.4:2;}
  }else if(f.mode==='leap'){
   const k=clamp(1-f.timer/.9,0,1);f.x=f.from.x+(f.to.x-f.from.x)*k;f.y=f.from.y+(f.to.y-f.from.y)*k;f.air=Math.sin(Math.PI*k)*90;
   if(f.timer<=0){f.air=0;g.fx.push({x:f.x,y:f.y,kind:'quake',ttl:.5,total:.5});if(distance(f,p)<85)wound(g);
    ring(g,'rubble',f,angry?10:8,150,f.volley*.3);f.mode='ready';f.timer=angry?1.2:1.8;}
  }
 }else if(f.type==='loki'){
  if(f.clone){
   // Illusions circle the cat and throw single daggers. They vanish in one hit.
   circle(g,f,dt,200,60);
   if(f.mode==='ready'&&f.timer<=0){f.mode='warn';f.timer=.6;}
   else if(f.mode==='warn'&&f.timer<=0){fan(g,'dagger',f,p,1,0,190);f.mode='ready';f.timer=2.4+f.rand();}
  }else{
   // The trickster: dagger fans, and every third move he vanishes and leaves copies behind.
   const sx=-d.y*Math.sin(f.age*.8),sy=d.x*Math.sin(f.age*.8);slide(g,f,sx*60,sy*60,dt);
   if(f.mode==='ready'&&f.timer<=0){f.next=f.volley++%3===2?'trick':'daggers';f.mode='warn';f.timer=.7;}
   else if(f.mode==='warn'&&f.timer<=0){
    if(f.next==='trick'){
     g.fx.push({x:f.x,y:f.y,kind:'puff',ttl:.4,total:.4});
     const copies=g.foes.filter(o=>o.clone).length,want=(angry?3:2)-copies;
     for(let i=0;i<want;i++){const at=freeSpot(g,f,200);g.foes.push(makeFoe(g,'loki',at.x,at.y,i,f.rand,true));}
     Object.assign(f,freeSpot(g,f,250));g.fx.push({x:f.x,y:f.y,kind:'puff',ttl:.4,total:.4});
    }else fan(g,'dagger',f,p,angry?5:3,.3,210);
    f.mode='ready';f.timer=1.5;
   }
  }
 }else if(f.type==='sphinx'){
  // Sweeping sun rays around her, then a fan of sand bolts. Circle around to stay between the rays.
  const home={x:480,y:230},h=aim(f,home);if(f.mode!=='rays'&&distance(f,home)>20)slide(g,f,h.x*40,h.y*40,dt);
  if(f.mode==='ready'&&f.timer<=0){f.next=f.volley++%2?'sand':'rays';f.mode='warn';f.timer=f.next==='rays'?1.2:.7;f.rays=angry?4:3;f.spin=f.volley%4<2?1:-1;f.rayAngle=f.age;}
  else if(f.mode==='warn'&&f.timer<=0){
   if(f.next==='rays'){f.mode='rays';f.timer=3.2;}
   else{fan(g,'sand',f,p,angry?7:5,.26,190);f.mode='ready';f.timer=1.6;}
  }else if(f.mode==='rays'){
   f.rayAngle+=dt*(angry?1.05:.8)*f.spin;
   for(let k=0;k<f.rays;k++){const a=f.rayAngle+k*Math.PI*2/f.rays,end={x:f.x+Math.cos(a)*460,y:f.y+Math.sin(a)*460};
    if(distance(f,p)>34&&along(f,end,p)<14)wound(g);}
   if(f.timer<=0){f.mode='ready';f.timer=1.4;}
  }
 }
}
function updateShots(g,dt){
 const keep=[];
 for(const s of g.shots){s.ttl-=dt;
 if(s.type==='bomb'){const k=clamp((s.total-s.ttl)/.7,0,1);s.x=s.from.x+(s.target.x-s.from.x)*k;s.y=s.from.y+(s.target.y-s.from.y)*k;
 if(s.ttl<=0){g.fx.push({kind:'fire',x:s.x,y:s.y,ttl:.42,total:.42});if(distance(g.hero,s)<63)wound(g);continue;}}
 else if(s.type==='bark'){s.r=(1-s.ttl/s.total)*200;if(!s.hit&&Math.abs(distance(g.hero,s)-s.r)<14){s.hit=true;wound(g);}}
 else{
  s.x+=s.dx*dt;s.y+=s.dy*dt;
  // Medusa's snakes slither side to side as they travel.
  if(s.wiggle!==undefined){s.wiggle+=dt;const n=Math.hypot(s.dx,s.dy)||1,w=Math.cos(s.wiggle*7)*80;s.x+=-s.dy/n*w*dt;s.y+=s.dx/n*w*dt;}
  if(distance(g.hero,s)<(s.type==='ember'?16:s.type==='rock'?26:21)){wound(g);continue;}
 }
 if(s.ttl>0&&s.x>55&&s.x<905&&s.y>48&&s.y<495)keep.push(s);
 }g.shots=keep;
}
export function step(g,dt,input={x:0,y:0}){
 if(g.phase==='hug'){g.hug+=dt;if(g.hug>=HUG_TIME)g.phase='won';return;}
 if(g.phase!=='play')return;g.clock+=dt;const p=g.hero;p.inv-=dt;
 const len=Math.hypot(input.x,input.y);
 p.moving=false;
 // A petrified cat cannot move until the stone cracks.
 if(p.stone>0)p.stone-=dt;
 else if(len>.06){
   const norm=Math.max(1,len), speed=g.rule==='catnip'?295:245;
   const dx=input.x/norm,dy=input.y/norm;
   g.direction={x:dx,y:dy};
   const oldX=p.x,oldY=p.y;
   const blocked=(x,y)=>solidAt(kindOf(g),x,y,9,5);
   const nextX=clamp(p.x+speed*dx*dt,bounds.left,bounds.right);
   if(!blocked(nextX,p.y))p.x=nextX;
   const nextY=clamp(p.y+speed*dy*dt,bounds.top,bounds.bottom);
   if(!blocked(p.x,nextY))p.y=nextY;
   const walked=Math.hypot(p.x-oldX,p.y-oldY);
   p.moving=walked>.001;
   if(p.moving){
     p.stride=(p.stride+walked*(Math.PI*2/78))%(Math.PI*2);
     p.facing=Math.abs(dx)>=Math.abs(dy)*.8?'side':dy<0?'back':'front';
     if(p.facing==='side')p.flip=dx<0;
   }
 }
 if(g.room===1&&!p.item&&distance(p,{x:480,y:270})<42)pickUp(g);
 if(kindOf(g)==='home'&&distance(p,OWNER)<64){g.phase='hug';g.hug=0;g.shots=[];g.ball={state:'held'};return;}
 if(!g.foes.length){
 const exit=p.x>=890&&Math.abs(p.y-270)<46?'east':p.x<=70&&Math.abs(p.y-270)<46?'west':p.y<=60&&Math.abs(p.x-480)<52?'north':p.y>=480&&Math.abs(p.x-480)<52?'south':null;
 if(exit&&g.routes[g.room][exit]!==undefined){enter(g,g.routes[g.room][exit],exit);return;}}
 const b=g.ball;
 if(b.state==='out'||b.state==='back'){
 const old={x:b.x,y:b.y},dist=dt*(b.state==='out'?540:690);
 if(b.state==='back'&&distance(b,p)<=dist){b.x=p.x;b.y=p.y;b.state='held';}
 else{const d=b.state==='out'?{x:b.dx,y:b.dy}:aim(b,p);b.x=clamp(b.x+d.x*dist,62,898);b.y=clamp(b.y+d.y*dist,53,487);b.travel+=dist;
 if(b.state==='out'&&(b.travel>=(p.item==='scarf'?610:370)||b.x<=62||b.x>=898||b.y<=53||b.y>=487))b.state='ground';}
 for(const f of [...g.foes])if(along(old,b,f)<(f.type==='witch'?38:25))hurt(g,f);
 }
 if(g.phase!=='play')return;for(const f of g.foes)foeStep(g,f,dt);updateShots(g,dt);
 g.fx=g.fx.filter(e=>(e.ttl-=dt)>0);
}
