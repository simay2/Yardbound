// Sprites are drawn in a common 100-unit coordinate space. Cache ink paths so
// outlines remain clean at any size without allocating new paths every frame.
const inkCache = new Map();
function ink(data) {
  if (!inkCache.has(data)) inkCache.set(data, new Path2D(data));
  return inkCache.get(data);
}
const outline = '#182640';
const white = '#fffaf1';
const blue = '#94cbf7';

function brush(ctx) {
  function path(data, fill, edge = outline, width = 2.8) {
    const p = ink(data);
    if (fill) { ctx.fillStyle = fill; ctx.fill(p); }
    if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = width; ctx.stroke(p); }
  }
  // Animated shapes change every frame, so they skip the cache to avoid unbounded growth.
  function live(data, fill, edge = outline, width = 2.8) {
    const p = new Path2D(data);
    if (fill) { ctx.fillStyle = fill; ctx.fill(p); }
    if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = width; ctx.stroke(p); }
  }
  function oval(x,y,rx,ry,fill,edge=null,width=2.8) {
    ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
    ctx.fillStyle=fill; ctx.fill();
    if (edge) { ctx.strokeStyle=edge; ctx.lineWidth=width; ctx.stroke(); }
  }
  return {path,oval,ctx,live};
}

function scarf({path},loose=false) {
  path('M6 1 Q16 6 21 19 L15 17 14 22 Q6 17 3 8Z','#da5266');
  path('M4 3 Q8 18 4 26 L-1 22 -5 24 Q-2 11 -4 6Z','#f78180');
  path('M-14 -2 Q0 5 14 -2 L15 5 Q0 13 -14 6Z','#da5266');
  path('M-10 1 Q0 6 10 1',null,'#ffbf94',1.4);
  if(loose) path('M11 14 l4 -1 m-15 8 4 1',null,'#ffd0a0',1.4);
}

function seatedCat(p, o, t) {
  const {path,oval}=p;
  p.ctx.save(); p.ctx.translate(10,38); p.ctx.rotate(Math.sin(t*2.2)*.075); p.ctx.translate(-10,-38);
  path('M9 39 C19 34 38 32 41 38 C45 45 30 46 27 43 C22 40 34 42 36 39 C34 37 23 40 16 43Z',white);
  p.ctx.restore();
  path('M-15 2 Q-17 14 -13 30 L-15 39 Q-17 43 -10 43 L-4 41 Q5 45 13 42 Q23 42 18 33 Q16 26 19 15 L17 5Z',white);
  path('M-9 20 Q-7 29 -7 39 Q-11 44 -5 44 L0 43 M0 21 Q3 30 1 40 Q0 44 6 44 L10 42',null,outline,2);
  path('M-11 33 L-10 40 M15 30 Q8 34 8 40',null,outline,1.6);
  catFace(p,o,t);
}

function catFace(p,o,t){
  const {path,oval}=p;
  // Oversized head, irregular pale blue eye marking and upright ears.
  path('M-28 -24 Q-27 -35 -19 -46 Q-16 -49 -13 -44 L-5 -34 Q4 -36 12 -32 L24 -40 Q28 -42 29 -36 L29 -19 Q34 -13 30 -3 Q28 7 17 11 Q4 17 -10 11 Q-27 6 -30 -7 Q-32 -16 -28 -24Z',white,outline,3);
  path('M-25 -28 Q-23 -36 -18 -43 L-12 -35 Q-17 -29 -25 -24Z',blue,null);
  path('M-27 -13 Q-27 -22 -16 -23 Q-3 -24 -4 -14 Q-6 -2 -15 1 Q-23 3 -27 -6Z',blue,null);
  path('M-2 -34 l-2 -5 m3 6 3 -3',null,outline,2);
  const blink = Math.sin(t*.88) > .999;
  if (blink) path('M-20 -12 q3 2 6 0 M11 -10 q3 2 6 0',null,outline,2.5);
  else {oval(-16.3,-12.5,2.8,3.9,outline);oval(13,-10.9,2.8,3.9,outline);}
  path('M-4 -5 Q-1 -6 2 -4 L-1 0Z',outline,null);
  path('M-1 -1 l0 3 -2.1 2 m2.1 -2 2.1 2',null,outline,1.5);
  path('M26 1 l4 -2 M-28 -8 l-4 -1',null,outline,1.6);
  if(o.scarf) { p.path('M-14 10 Q0 15 13 10 L15 15 Q1 21 -13 15Z','#e45971'); p.path('M9 17 L18 28 20 22 25 22 15 13Z','#ed7784'); }
  if(o.bell) { path('M-14 10 Q0 16 13 10',null,'#da5266',3.6); oval(0,16,3.8,3.8,'#f1c24f',outline,1.6); }
}

// The paw is anchored at the wrist; tint and layer order separate the near
// and far legs even when the two silhouettes overlap mid-stride.
function paw(p, x, y, angle, lift, far) {
  const {ctx,path,oval}=p;
  const fur=far?'#c6d6dc':white;
  ctx.save();
  ctx.translate(x,y); ctx.rotate(angle); ctx.scale(1,1-lift*.22);
  path('M-5 -2 Q-6 7 -3 14 L-4 20 Q-5 25 -1 25 L5 24 Q9 23 7 19 L3 17 4 12 Q6 5 4 -1Z',fur,outline,2.4);
  oval(2.1,20.6,3.4,1.3,far?'#b0c2ca':'#e8d7cc');
  ctx.restore();
}

function raisedTail(p, x, y, swing) {
  const {ctx,path}=p;
  ctx.save(); ctx.translate(x,y); ctx.rotate(swing);
  path('M4 5 C-6 4 -15 -2 -17 -16 C-18 -23 -13 -36 -20 -36 C-25 -36 -23 -30 -26 -29 C-32 -29 -30 -42 -22 -44 C-9 -48 -8 -33 -10 -21 C-12 -9 -5 -5 4 -3Z',white,outline,2.8);
  ctx.restore();
}
function walkingCat(p,o,t){
  const {ctx,path,oval}=p;
  const phase=o.moving?(o.stride??t*12):0;
  const swing=o.moving?Math.sin(phase):0;
  const bob=o.moving?2*Math.cos(phase*2):.9*Math.sin(t*2.8);
  const tailSwing=o.moving?.19*Math.sin(phase-.55):.09*Math.sin(t*2.7);
  ctx.save();ctx.translate(0,bob);
  if(o.facing==='side'){
    raisedTail(p,-22,5,tailSwing);
    const leg=(x,y,phaseShift,far)=>{
      const angle=o.moving?Math.sin(phase+phaseShift):0;
      const lift=o.moving?Math.max(0,Math.cos(phase+phaseShift)):0;
      paw(p,x,y-lift*4,angle*.67,lift,far);
    };
    leg(-16,10,0,true);leg(14,10,Math.PI,true);
    path('M-28 -1 Q-22 -10 -7 -9 Q6 -9 16 -17 L28 -7 Q27 9 19 20 Q14 24 3 20 Q-5 17 -16 21 Q-31 21 -30 10Z',white);
    leg(-17,14,Math.PI,false);leg(15,14,0,false);
    ctx.save();ctx.translate(18,-9);ctx.rotate(swing*.055);ctx.scale(.79,.84);
    path('M-24 -18 L-22 -34 Q-21 -39 -18 -37 L-8 -28 Q0 -31 8 -29 L18 -36 Q21 -37 22 -33 L22 -16 Q24 -10 29 -8 Q35 -7 29 0 Q24 10 13 13 Q-1 18 -16 9 Q-29 0 -24 -18Z',white,outline,3);
    path('M-21 -22 L-20 -33 L-12 -28Z',blue,null);
    path('M-7 -12 Q-3 -22 8 -18 Q17 -15 13 -5 Q7 3 -1 0 Q-8 -1 -7 -12Z',blue,null);
    oval(7,-9,3.1,4.3,outline);path('M26 -8 Q32 -11 32 -7 L29 -4Z',outline,null);
    path('M24 0 q3 2 6 -1 M-12 -1 l-9 -1 M-12 2 l-7 3',null,outline,1.4);
    if(o.scarf){path('M-15 10 Q-2 18 13 12 L14 17 Q0 24 -16 16Z','#e65d74');path('M-14 14 Q-19 9 -30 13 L-27 16 -31 19 Q-21 17 -13 19Z','#f88288');}
    if(o.bell){path('M-15 10 Q-2 18 13 12',null,'#da5266',3.6);oval(2,18,3.8,3.8,'#f1c24f',outline,1.6);}
    ctx.restore();
  }else{
    const back=o.facing==='back';
    const leg=(x,y,offset,far)=>{
      const wave=o.moving?Math.sin(phase+offset):0;
      const lift=Math.max(0,wave);
      paw(p,x+wave*1.5,y+wave*7,-wave*.18,lift,far);
    };
    leg(-13,4,0,true);leg(14,4,Math.PI,true);
    oval(0,7,17,24,white,outline,2.8);
    leg(-10,18,Math.PI,false);leg(10,18,0,false);
    if(!back)raisedTail(p,13,8,-.65+tailSwing);
    ctx.save();ctx.translate(0,-4);ctx.rotate(swing*.055);
    if(back){
      path('M-26 -16 L-26 -32 Q-26 -40 -21 -39 L-8 -30 Q0 -33 10 -30 L21 -41 Q25 -45 26 -39 L29 -22 Q34 -10 29 2 Q24 15 3 17 Q-13 16 -23 7 Q-30 -2 -26 -16Z',white);
      path('M21 -37 Q24 -41 24 -35 L26 -25 17 -29Z',blue,null);
      path('M-10 9 Q-6 12 -4 9 M-2 13 Q1 15 4 12',null,'#c5d5db',1.7);
      if(o.scarf)path('M-13 14 Q0 20 14 15 L14 20 Q0 25 -14 20Z','#e65d74');
      if(o.bell)path('M-13 14 Q0 20 14 15',null,'#da5266',3.6);
    }else catFace(p,o,t);
    ctx.restore();
    if(back)raisedTail(p,2,22,-.27+tailSwing);
  }
  ctx.restore();
}
function cat(p,o,t){
  if(o.moving||o.facing==='back'||o.facing==='side'){walkingCat(p,o,t);return;}
  p.ctx.save();p.ctx.scale(1,1+.012*Math.sin(t*2.7));seatedCat(p,o,t);p.ctx.restore();
}

function unicorn({path,oval},o,t) {
  path('M12 21 Q20 12 28 14 Q41 18 35 29 Q34 22 30 21 Q31 30 25 32 Q28 23 20 23Z','#a999e6');
  path('M-9 14 Q-20 25 -15 37 Q-17 42 -9 41 L-4 35 7 36 Q7 44 14 42 L20 31 Q23 20 12 16Z','#e6cbf4');
  path('M-15 35 l9 1 m13 1 7 1',null,'#a79acb',2.5);
  path('M-18 -7 Q-22 -24 -16 -31 L-7 -22 Q1 -25 9 -22 L19 -32 Q23 -29 19 -13 Q29 -4 24 9 Q22 22 9 24 L-10 22 Q-24 20 -26 9 Q-30 1 -18 -7Z','#f3dbed');
  path('M-15 -24 l4 7 -5 0Z M16 -25 l-4 9 5 -3Z','#d18fb7',null);
  path('M-7 -19 L0 -44 Q2 -47 4 -42 L8 -18Z','#ffd287');
  path('M-3 -29 l8 3 m-6 -11 4 2',null,'#bd7961',1.6);
  path('M-9 -18 Q-19 -18 -21 -6 Q-13 -12 -8 -10 Q-5 -6 -1 -4 Q-1 -12 7 -13 Q11 -18 13 -19 Q6 -25 0 -20Z','#a99be1');
  oval(-12,-1,3,4,outline);oval(11,-1,3,4,outline);
  path('M-15 -7 l6 2 M8 -5 l6 -3',null,outline,2);
  oval(-1,12,12,7,'#e6accc');oval(-6,12,1.2,1.7,outline);oval(4,12,1.2,1.7,outline);
  path('M-19 5 l2 1 m-2 2 2 1 m33 -4 2 -1',null,'#bf7390',1.6);
}

function lep({path,oval}) {
  path('M-14 28 L-21 38 Q-28 41 -23 43 L-7 42 -1 28Z M5 27 L7 41 23 42 Q26 39 19 35 L15 27Z','#393242');
  path('M-13 7 Q-22 13 -25 26 L-16 28 -13 23 -17 34 Q-2 39 18 32 L15 22 20 26 25 20 Q23 11 12 8Z','#548458');
  path('M-13 25 Q1 29 15 24 L16 29 Q0 34 -15 30Z','#473f42');path('M-2 26 h6 v5 h-6Z','#ffca64');
  path('M-20 -14 Q-22 -18 -29 -16 Q-28 -6 -18 -5 M20 -13 Q24 -19 30 -17 Q29 -9 21 -6','#efbf8d');
  path('M-21 -16 Q0 -27 21 -16 L21 -2 Q18 13 5 17 L-5 17 Q-20 12 -21 -1Z','#efbc8b');
  path('M-20 -3 Q-16 2 -11 0 Q-8 8 -2 5 Q0 3 3 4 Q10 8 14 -1 L19 -4 Q25 4 18 13 L15 12 12 19 8 17 2 23 -4 20 -8 21 -10 17 -15 18 -16 13 Q-24 10 -20 -3Z','#c56840');
  path('M-10 6 Q-3 3 2 7 Q7 3 12 5',null,'#864632',2);
  oval(-11,-8,2.2,3,outline);oval(11,-8,2.2,3,outline);oval(1,-4,5.6,4.6,'#e39975',outline,1.6);
  path('M-16 -13 l9 4 m15 0 9 -5',null,outline,2.6);
  path('M-17 -19 L-15 -38 Q-13 -43 -6 -40 Q4 -36 15 -43 L20 -18Z','#4e8f62');
  path('M-17 -26 Q2 -22 18 -27 L20 -19 -18 -17Z','#35404b');
  path('M0 -26 l7 -1 1 6 -7 1Z','#ffd171',outline,1.6);
  path('M-27 -18 Q-3 -23 25 -21 Q29 -18 24 -15 Q-1 -11 -27 -14 Q-30 -16 -27 -18Z','#619f6c');
  oval(23,23,5,5,'#ebbd8e',outline,2);oval(29,20,6,7,'#ffd26c',outline,2);oval(29,20,3.4,4.4,'#e1a34d');path('M29 17 v6',null,'#ffe6a4',1.5);
}

function felix({path,oval},o,t) {
  path('M14 28 Q30 32 30 17 Q31 6 38 10 Q42 14 37 18 Q35 19 35 14 Q34 30 28 34 Q21 38 12 34Z','#42445a');
  path('M-13 9 Q-22 17 -19 34 L-21 40 Q-22 45 -13 43 L-5 38 6 37 Q8 43 17 42 Q22 39 16 34 L20 24 Q21 12 11 9Z','#414356');
  path('M-10 12 Q0 16 14 9 L11 26 -1 33 -13 26Z','#ac6648');path('M-8 15 l14 12',null,'#ffbb75',3);
  path('M-22 -18 L-24 -37 Q-25 -40 -20 -37 L-6 -28 Q2 -30 10 -26 L23 -37 Q25 -38 24 -32 L23 -17 Q32 -2 20 9 Q4 23 -15 11 Q-28 5 -22 -18Z','#464858');
  path('M-20 -32 l9 7 -7 2Z M19 -31 l-7 9 7 -2Z','#e19796',null);
  path('M-23 -13 Q0 -6 24 -15',null,'#a87855',5);
  for(const x of [-11,11]){oval(x,-10,9.4,8.7,'#d99c57',outline,2.8);oval(x,-10,6.2,5.8,'#e97c51',outline,1.6);path('M'+(x-3)+' -9 l4 -4',null,'#ffdf94',2);}
  path('M-3 2 l6 -1 -3 4Z','#e5a7a0',null);
  path('M0 4 q2 4 6 2',null,'#f6d6c5',1.7);
  oval(-20,23,7,7,'#454555',outline,2);
  oval(-24,18,8.5,9.5,'#bd5e50',outline,2.5);
  path('M-28 11 l2 -6 6 1 -1 5Z','#aa855c');path('M-23 5 q-1 -5 3 -6',null,'#d6a765',2);
  path('M-20 0 Q-25 -4 -21 -9 Q-20 -6 -17 -7 Q-15 -3 -20 0Z','#ffb85c','#b45145',1.2);
}

function witch({path,oval},o,t) {
  path('M-16 0 Q-24 6 -29 18 Q-35 32 -40 42 Q-28 39 -21 45 Q-9 40 -3 46 Q7 40 15 44 Q24 38 35 42 L26 18 Q23 7 15 0Z','#493349');
  path('M-4 12 Q-4 26 -12 41 M10 13 Q11 27 19 39 M-16 14 Q-20 27 -28 34',null,'#73516b',2.2);
  path('M-28 -1 Q-32 -17 -23 -32 Q-14 -43 -4 -46 Q5 -51 9 -54 Q10 -47 19 -39 Q31 -29 30 -14 L27 2 Q18 9 13 12 L-13 12Z','#382e45');
  path('M-21 -12 Q-22 -29 -5 -36 Q4 -40 9 -42 Q23 -28 24 -12 L19 3 -14 6Z','#8e7887');
  path('M-16 -16 Q-20 -8 -22 1 L-17 -1 -17 8 -10 4 -8 -11Z M15 -20 Q24 -14 23 -1 L19 -4 20 5 12 2Z','#d5c7ba');
  path('M-15 -19 Q-10 -26 0 -23 Q10 -23 16 -18 L16 -9 Q16 2 9 8 Q6 15 0 17 Q1 10 -6 10 Q-13 8 -17 2 Q-20 -3 -15 -19Z','#b9b88f');
  path('M-18 -16 Q-13 -26 -4 -26 Q-9 -21 -8 -16 Q-14 -16 -18 -11 M1 -25 Q9 -26 17 -17 L16 -24 9 -30Z','#e3d7c4');
  path('M-12 -12 l8 3 M4 -9 l8 -5',null,outline,2.4);
  oval(-7.5,-7,2.1,2.8,'#5b3947');oval(8,-8,2.1,2.8,'#5b3947');
  path('M1 -9 Q2 -3 8 -1 Q8 2 2 2 L-2 0',null,'#686952',2);
  path('M-8 5 Q-1 9 7 4',null,outline,1.8);
  path('M-5 6 l2 3 1 -2Z','#f2e3c5',null);
  path('M-18 10 Q-18 4 -23 8 L-35 19 Q-39 27 -32 29 Q-24 30 -17 22Z','#574259');
  path('M-35 20 Q-40 15 -37 13 Q-35 12 -32 17 Q-28 18 -25 16 Q-22 17 -25 21 Q-30 26 -35 20Z','#b9b88f');
  path('M-38 10 Q-42 1 -35 0 Q-31 -2 -28 1 Q-24 -2 -19 1 Q-15 6 -20 13 Q-23 19 -27 17 Q-34 19 -38 10Z','#e45e67');
  path('M-28 2 q-1 -5 3 -7',null,outline,1.8);path('M-27 -1 q-5 -8 -9 -5 q2 6 9 5Z','#8baa76',outline,1.2);
  oval(-34,4,1.4,2,'#ffc0aa');
  oval(1,16,3.5,4.2,'#eebf74',outline,1.5);
}

// Wind-up toy mouse on little wheels. Drawn facing right; the key on its back spins.
function mouse({ctx,path,oval},o,t) {
  path('M-30 24 Q-48 22 -46 8 Q-44 -2 -52 -6',null,'#c98a8a',2.8);
  oval(-18,35,6.5,6.5,'#5d566a',outline,2.2);oval(18,35,6.5,6.5,'#5d566a',outline,2.2);
  path('M-32 30 Q-36 6 -12 -4 Q8 -12 24 2 Q36 12 42 24 Q44 32 34 33 L-26 34 Q-33 34 -32 30Z','#b9b4c8');
  path('M-24 26 Q4 19 34 27',null,'#8f8aa3',2);
  path('M-18 8 l4 4 m6 -8 l4 4',null,'#8f8aa3',1.6);
  oval(10,-6,10,11,'#b9b4c8',outline,2.6);oval(10,-6,6,7,'#f0a9b4');
  oval(27,12,2.5,3.3,outline);
  oval(43,26,3.4,3.2,'#e0707e',outline,1.5);
  path('M38 22 l12 -5 M38 27 l13 1',null,outline,1.3);
  ctx.save();ctx.translate(-16,-6);ctx.scale(Math.cos(t*7),1);
  path('M0 4 L0 -12',null,outline,3);
  path('M0 -12 Q-11 -10 -11 -19 Q-11 -27 0 -21 Q11 -27 11 -19 Q11 -10 0 -12Z','#e8c070',outline,2.2);
  ctx.restore();
}

// Dusty moth with flapping wings. It hovers, so the shadow is drawn well below it.
function moth({ctx,path,oval},o,t) {
  const flap=.35+.65*Math.abs(Math.sin(t*14));
  for(const side of [-1,1]){
    ctx.save();ctx.scale(side*flap,1);
    path('M2 -8 Q16 -42 42 -34 Q52 -20 32 -6 Q48 4 38 22 Q20 32 3 8Z','#dcccab');
    path('M8 -10 Q22 -30 36 -27',null,'#b49c7e',1.6);
    oval(28,-18,6,6,'#8b6f8c',outline,1.6);oval(28,-18,2.4,2.4,'#f2e3c5');
    oval(26,12,4,4,'#b49c7e');
    ctx.restore();
  }
  oval(0,4,8,21,'#8a7a6a',outline,2.6);
  path('M-7 0 h14 M-7 8 h14 M-6 16 h12',null,'#5f5248',1.6);
  path('M-3 -27 Q-8 -40 -16 -42 M3 -27 Q8 -40 16 -42',null,outline,2);
  path('M-16 -42 l-3 4 m3 -4 l1 5 M16 -42 l3 4 m-3 -4 l-1 5',null,outline,1.4);
  oval(0,-20,9.5,8.5,'#a8957f',outline,2.4);
  oval(-4,-21,2.4,3,outline);oval(4,-21,2.4,3,outline);
}

// Haunted teapot. Its lid rattles while it builds up steam.
function teapot({ctx,path,oval,live},o,t) {
  const lid=o.charging?-Math.abs(Math.sin(t*30))*6:0;
  path('M-24 -2 Q-44 -6 -42 12 Q-40 26 -22 22',null,outline,8);
  path('M-24 -2 Q-44 -6 -42 12 Q-40 26 -22 22',null,'#7fb4b0',4);
  path('M22 6 Q34 4 38 -10 L45 -12 Q43 3 35 15 L24 19Z','#7fb4b0');
  path('M-16 34 L16 34 L20 41 L-20 41Z','#5f8f8b');
  path('M-29 8 Q-31 -14 0 -16 Q31 -14 29 8 Q29 28 15 35 L-15 35 Q-29 28 -29 8Z','#8fc4bf',outline,3);
  path('M-26 -3 Q0 4 26 -3',null,'#f3e3c4',2.2);
  for(const [x,y] of [[-18,22],[19,21],[0,28]]){oval(x,y,3,3,'#f3e3c4');oval(x,y,1.2,1.2,'#e58b65');}
  oval(-9,8,2.5,3.3,outline);oval(9,8,2.5,3.3,outline);
  path(o.charging?'M-5 15 Q0 21 5 15Z':'M-5 15 Q0 19 5 15',o.charging?outline:null,outline,1.8);
  oval(-15,14,3.4,2,'#f0a0a0');oval(15,14,3.4,2,'#f0a0a0');
  ctx.save();ctx.translate(0,lid);
  path('M-19 -15 Q0 -27 19 -15Z','#a9d4cf');
  oval(0,-25,4.5,4,'#f1c57c',outline,2);
  ctx.restore();
  const w=Math.sin(t*4)*3;
  live('M42 -16 q'+(-4+w)+' -6 0 -10 q'+(4-w)+' -5 0 -10',null,'#ffffffb0',2.2);
}

// Phoenix: a fire bird with a flame tail. After its first defeat it rests as a pile of ash.
function phoenix({ctx,path,oval,live},o,t) {
  if(o.mode==='ashes'){
    path('M-26 30 Q-20 18 -6 20 Q4 12 14 20 Q26 18 28 30Z','#6d6266');
    const f=Math.sin(t*20)*2;
    live('M0 22 Q-8 10 -2 '+(-2+f)+' Q2 8 6 '+(2-f)+' Q9 14 0 22Z','#ffb14d','#c0532f',1.6);
    return;
  }
  const flap=Math.sin(t*9);
  path('M-6 16 Q-18 34 -12 48 Q-6 38 0 45 Q4 36 10 47 Q16 32 6 16Z','#ff9a3c');
  path('M-3 20 Q-8 32 -4 40 Q0 32 4 39 Q8 30 3 20Z','#ffd25a',null);
  for(const side of [-1,1]){
    ctx.save();ctx.scale(side,1);ctx.rotate(-flap*.28);
    path('M8 -2 Q30 -32 54 -24 Q45 -17 51 -10 Q38 -8 44 0 Q30 2 34 10 Q20 8 8 12Z','#e8553f');
    path('M14 -1 Q30 -18 46 -18',null,'#ffc35a',2);
    ctx.restore();
  }
  path('M-12 -6 Q-14 -24 0 -28 Q14 -24 12 -6 Q14 14 0 22 Q-14 14 -12 -6Z','#f2793f');
  path('M-6 2 Q0 -4 6 2 Q6 12 0 16 Q-6 12 -6 2Z','#ffc76a',null);
  path('M-4 -27 Q-11 -42 -4 -47 Q-2 -38 0 -36 Q2 -47 9 -44 Q6 -36 4 -27Z','#ffcf4d');
  oval(-5,-18,2.2,2.9,outline);oval(5,-18,2.2,2.9,outline);
  path('M-3.5 -13 L3.5 -13 L0 -7Z','#ffd36b',outline,1.6);
}

// Little dragon, side view facing right. Opens its mouth while breathing fire.
function dragon({ctx,path,oval},o,t) {
  const breath=o.mode==='breath';
  path('M-20 24 Q-44 26 -46 10 Q-48 2 -40 0 Q-40 12 -30 14 Q-22 14 -18 16Z','#5aa36a');
  path('M-46 4 l-6 -6 8 -1Z','#f3df9c',outline,2);
  ctx.save();ctx.translate(-6,-6);ctx.rotate(Math.sin(t*5)*.12);
  path('M0 0 Q-10 -34 -34 -36 Q-26 -26 -30 -20 Q-20 -22 -22 -12 Q-12 -14 -12 -4Z','#87c98b');
  ctx.restore();
  path('M-14 26 L-16 38 L-5 38 L-6 28Z M8 26 L8 38 L19 38 L16 26Z','#4b8d5c');
  path('M-24 20 Q-26 -2 -6 -6 Q14 -8 18 10 Q20 30 0 32 Q-20 32 -24 20Z','#6dbb7a');
  path('M-10 4 Q2 0 8 8 Q10 22 -2 26 Q-12 24 -10 4Z','#f3df9c',null);
  path('M-7 10 h11 M-7 16 h12 M-6 22 h10',null,'#d1b670',1.4);
  path('M-21 -1 l-3 -7 7 3 M-11 -6 l-1 -8 6 5',null,outline,2);
  ctx.save();ctx.translate(14,-14);
  path('M-6 -12 L-12 -25 L-1 -15Z M2 -15 L1 -29 L9 -15Z','#f3df9c');
  if(breath)path('M6 2 Q18 14 30 6 L26 2Z','#8a2f3a',outline,2);
  path('M-12 4 Q-14 -14 2 -16 Q20 -16 27 -6 Q31 2 23 '+(breath?2:6)+' Q8 '+(breath?4:10)+' -12 4Z','#6dbb7a');
  oval(6,-6,2.7,3.5,outline);path('M2 -11 l7 2',null,outline,2);
  oval(23,-4,1.3,1.3,outline);
  if(!breath)path('M12 4 Q18 6 24 3',null,outline,1.6);
  ctx.restore();
}

// Guard dog: big, grumpy and loud – a cat's natural enemy. Opens its jaws to bark.
function dog({path,oval},o,t) {
  const bark=o.charging;
  path('M-24 8 Q-30 24 -26 40 L-14 42 -12 30 Q0 34 12 30 L14 42 26 40 Q30 24 24 8Z','#b9875e');
  oval(-20,41,8,4,'#f2dcc0',outline,2);oval(20,41,8,4,'#f2dcc0',outline,2);
  path('M-20 6 Q0 14 20 6 L21 12 Q0 20 -21 12Z','#d4483f');oval(0,17,4,4,'#f1c57c',outline,1.6);
  path('M-26 -20 Q-28 -38 0 -40 Q28 -38 26 -20 Q30 0 14 8 Q0 12 -14 8 Q-30 0 -26 -20Z','#c99a6e',outline,3);
  path('M-24 -33 Q-39 -30 -36 -11 Q-30 -9 -23 -19Z M24 -33 Q39 -30 36 -11 Q30 -9 23 -19Z','#7a5338');
  path('M5 -37 Q18 -36 20 -23 Q16 -15 6 -19Z','#7a5338',null);
  oval(0,-6,14,10,'#f2dcc0',outline,2);
  if(bark){path('M-9 -2 Q0 12 9 -2Z','#8a2f3a',outline,2);path('M-7 -2 l2 3 2 -3 M3 -2 l2 3 2 -3','#ffffff',outline,1);}
  else path('M-6 -1 Q0 3 6 -1',null,outline,1.8);
  path('M-6 -12 Q0 -16 6 -12 Q4 -7 0 -7 Q-4 -7 -6 -12Z',outline,null);
  oval(-11,-22,2.8,3.4,outline);oval(11,-22,2.8,3.4,outline);
  path('M-17 -29 l10 4 M17 -29 l-10 4',null,outline,2.6);
}

// The sneaky cucumber – every cat's secret fear.
function cucumber({path,oval,live},o,t) {
  const wob=Math.sin(t*6)*2;
  path('M-12 38 Q-18 0 -10 -30 Q-4 -46 6 -44 Q16 -40 14 -10 Q14 20 10 38 Q0 44 -12 38Z','#5f9d4f');
  path('M-6 30 Q-10 0 -4 -30',null,'#8cc36c',3);
  for(const y of [-14,2,18,30]){oval(9,y,1.6,1.6,'#3f7a38');oval(-9,y+6,1.6,1.6,'#3f7a38');}
  path('M-1 -44 Q2 -54 8 -52 Q12 -46 6 -42Z','#b5d17a');
  live('M5 -48 Q16 '+(-60+wob)+' 25 -52 Q16 -46 5 -48Z','#7fbf5a',outline,2);
  oval(-4,-24,4,5,white,outline,1.8);oval(7,-24,4,5,white,outline,1.8);
  oval(-2,-23,1.8,2.4,outline);oval(9,-23,1.8,2.4,outline);
  path('M-6 -11 Q2 -5 10 -11',null,outline,1.8);
}

// Items of the day, drawn as pickups on the bedroom footstool.
function bellItem({path,oval}) {
  path('M-14 -2 Q0 4 14 -2',null,'#da5266',3);
  path('M-10 0 Q-11 -16 0 -18 Q11 -16 10 0 L12 6 L-12 6Z','#f1c24f');
  path('M-8 6 Q0 10 8 6',null,outline,1.6);oval(0,8,2.5,2.5,outline);
  path('M-5 -12 q3 -3 6 -2',null,'#fff0b0',1.6);
}
function fishItem({path,oval}) {
  path('M-16 0 Q-4 -12 10 -2 L18 -8 L16 0 L18 8 L10 2 Q-4 12 -16 0Z','#9fb7c8');
  path('M-10 3 Q-2 7 8 1',null,'#d7e4ec',1.4);
  oval(-9,-2,1.7,1.7,outline);path('M-4 -5 Q-1 0 -4 5',null,outline,1.3);
}
function thimbleItem({path,oval}) {
  path('M-9 8 L-7 -8 Q0 -14 7 -8 L9 8Z','#f2c14e');
  for(const [x,y] of [[-3,-6],[2,-6],[-4,-1],[1,-1],[5,-1],[-3,4],[2,4]])oval(x,y,1,1,'#b9862b');
  path('M-10 8 h20',null,outline,3.2);
  path('M-5 -9 q2 -2 5 -2',null,'#fff0b0',1.4);
}
// ---- Bosses ----
// Medusa: snake hair that writhes; her eyes blaze gold just before the stone gaze.
function medusa({ctx,path,oval,live},o,t) {
  const glare=o.charging&&o.next==='gaze';
  path('M-22 4 Q-30 24 -34 44 Q0 50 34 44 Q30 24 22 4Z','#c9b77a');
  path('M-8 10 Q-10 28 -14 42 M8 10 Q10 28 12 42 M-20 8 Q-12 14 0 12 Q12 14 20 8',null,'#9e8b55',2);
  path('M-22 6 Q-34 18 -30 30 L-24 30 Q-26 20 -16 12Z M22 6 Q34 18 30 30 L24 30 Q26 20 16 12Z','#a9c99a');
  for(let i=0;i<8;i++){
    const a=Math.PI*(1.02+i*.137),x0=Math.cos(a)*14,y0=-30+Math.sin(a)*13,dx=Math.cos(a),dy=Math.sin(a);
    const w=Math.sin(t*6+i*1.3)*6,mx=x0+dx*13-dy*w,my=y0+dy*13+dx*w,ex=x0+dx*25+dy*w*.6,ey=y0+dy*25-dx*w*.6;
    const d='M'+x0.toFixed(1)+' '+y0.toFixed(1)+' Q'+mx.toFixed(1)+' '+my.toFixed(1)+' '+ex.toFixed(1)+' '+ey.toFixed(1);
    live(d,null,outline,8);live(d,null,i%2?'#6fae5c':'#86c26e',5);
    oval(ex,ey,4.2,3.4,i%2?'#6fae5c':'#86c26e',outline,1.6);
  }
  path('M-17 -26 Q-18 -44 0 -45 Q18 -44 17 -26 Q17 -10 0 -6 Q-17 -10 -17 -26Z','#a9c99a',outline,3);
  path('M-12 -38 Q0 -46 12 -38',null,'#6fae5c',3);
  if(glare){oval(-7,-27,6,5,'#ffe06688');oval(7,-27,6,5,'#ffe06688');}
  oval(-7,-27,3.4,2.5,glare?'#ffe066':'#f6f0c8',outline,1.5);oval(7,-27,3.4,2.5,glare?'#ffe066':'#f6f0c8',outline,1.5);
  path('M-7 -29 v4 M7 -29 v4',null,outline,1.6);
  path('M-12 -33 l7 2 M12 -33 l-7 2',null,outline,2);
  path('M-5 -14 Q0 -11 5 -14',null,outline,1.6);
  oval(0,4,4,3,'#e3b94e',outline,1.5);
}

// The Giant: huge, slow and bearded, with a club raised high before he leaps.
function giant({ctx,path,oval},o,t) {
  path('M-24 26 L-26 46 L-4 46 L-8 26Z M8 26 L4 46 L26 46 L24 26Z','#6b5a48');
  path('M-34 -6 Q-40 30 -24 32 L24 32 Q40 30 34 -6 Q30 -24 0 -26 Q-30 -24 -34 -6Z','#8aa070');
  path('M-20 -4 Q0 6 20 -4 M-22 0 L-26 28 M22 0 L26 28',null,'#6f8558',2);
  path('M-35 14 Q0 20 35 14 L35 21 Q0 27 -35 21Z','#6b4a32');
  path('M-5 15 h10 v9 h-10Z','#e3b94e',outline,1.6);
  oval(-40,6,9,17,'#e0b48c',outline,2.6);
  ctx.save();ctx.translate(40,-2);ctx.rotate(o.charging||o.mode==='leap'?-1.15:-.3);
  path('M-4 2 L-7 -36 Q-10 -50 1 -52 Q14 -50 9 -36 L5 2Z','#8b6a48');
  path('M-4 -40 l3 2 M4 -44 l3 2 M0 -30 l3 2',null,'#5f4630',2);
  ctx.restore();
  oval(40,0,9,15,'#e0b48c',outline,2.6);
  oval(0,-37,16,15,'#e0b48c',outline,2.8);
  path('M-16 -42 Q-14 -56 0 -56 Q14 -56 16 -42 Q8 -48 0 -47 Q-8 -48 -16 -42Z','#9b5f3a');
  path('M-15 -33 Q-13 -13 0 -11 Q13 -13 15 -33 Q8 -27 0 -29 Q-8 -27 -15 -33Z','#9b5f3a');
  oval(-6,-38,2,2.6,outline);oval(6,-38,2,2.6,outline);
  path('M-11 -43 l8 2 M11 -43 l-8 2',null,outline,3);
  oval(0,-33,3.6,3,'#d39c78',outline,1.4);
  path('M-4 -26 Q0 -24 4 -26',null,outline,1.6);
}

// Loki: the trickster in green and gold with a horned helm and a sly grin.
function loki({ctx,path,oval},o,t) {
  const sway=Math.sin(t*3)*2;
  path('M-20 -6 Q-34 20 -30 46 Q0 40 30 46 Q34 20 20 -6Z','#2f6b4a');
  path('M-10 40 L-11 47 L-2 47 L-2 40Z M2 40 L2 47 L11 47 L10 40Z','#2c2c3a');
  path('M-14 -4 Q-16 20 -12 40 L12 40 Q16 20 14 -4Z','#3f8c5e');
  path('M-10 0 L-6 38 M10 0 L6 38 M-14 -2 Q0 4 14 -2',null,'#e3b94e',2.4);
  path('M14 -2 Q26 4 24 14',null,outline,7);path('M14 -2 Q26 4 24 14',null,'#3f8c5e',4);
  ctx.save();ctx.translate(24,14);ctx.rotate(-.6+sway*.03);
  path('M0 0 L4 -24 L7 -24 L5 0Z','#d6dee6',outline,1.6);path('M-3 0 h11 v3 h-11Z','#e3b94e',outline,1.2);
  ctx.restore();
  oval(24,15,4,4,'#f1d0b0',outline,1.6);
  oval(0,-20,13,15,'#f1d0b0',outline,2.8);
  path('M-13 -24 Q-17 -8 -12 2 L-9 -14Z M13 -24 Q17 -8 12 2 L9 -14Z','#232331');
  path('M-11 -32 Q-22 -50 -12 -66 Q-15 -50 -5 -36Z M11 -32 Q22 -50 12 -66 Q15 -50 5 -36Z','#e3b94e');
  path('M-15 -24 Q0 -42 15 -24 L13 -21 L-13 -21Z','#e3b94e');
  oval(-5,-18,2,2.6,outline);oval(5,-18,2,2.6,outline);
  path('M-9 -23 l7 2 M9 -23 l-7 2',null,outline,2);
  path('M-6 -10 Q0 -5 7 -11',null,outline,1.8);
}

// The Sphinx: a lion's body in a striped royal headdress. Her eyes glow before the sun rays.
function sphinx({ctx,path,oval},o,t) {
  const glow=o.charging||o.mode==='rays';
  path('M-40 24 Q-54 20 -50 6',null,'#b8904a',3.4);oval(-50,5,3.5,3.5,'#7a5a30');
  path('M-42 32 Q-46 10 -26 4 Q0 -2 20 6 L30 32Z','#d8b26a');
  path('M-30 14 Q-14 20 4 14',null,'#b8904a',2);
  path('M8 32 L46 32 Q50 38 42 40 L8 40Z','#d8b26a');path('M36 32 v8 M41 32 v8',null,outline,1.4);
  path('M0 -38 Q20 -48 38 -38 L44 6 L30 2 L28 -6 L12 -6 L10 2 L-6 6Z','#3d67a8');
  path('M2 -28 L40 -28 M0 -16 L42 -16 M-2 -4 L44 -4',null,'#e3b94e',3);
  path('M10 -30 Q24 -36 32 -28 Q34 -12 21 -4 Q8 -12 10 -30Z','#e8c27c',outline,2.2);
  if(glow){oval(16,-20,5,4,'#ffe06688');oval(27,-20,5,4,'#ffe06688');}
  oval(16,-20,2,2.6,glow?'#ffe066':outline);oval(27,-20,2,2.6,glow?'#ffe066':outline);
  path('M12 -20 h-3 M31 -20 h3',null,outline,1.6);
  path('M21 -15 l-1.5 3 h3Z M18 -9 Q21 -7 24 -9',null,outline,1.4);
  path('M19 -4 L23 -4 L22 6 L20 6Z','#3d67a8',outline,1.4);
  oval(21,-40,4,3,'#e3b94e',outline,1.4);
}

// The cat's human: kneels with open arms, then hugs the cat tight.
function owner(p,o,t) {
  const {ctx,path,oval}=p,skin='#f2c7a5',sweater='#e98a6b';
  ctx.save();ctx.rotate(o.hug?Math.sin(t*3)*.05:0);
  path('M-28 30 Q-30 44 -18 46 L22 46 Q32 44 28 30Z','#5b6d9a');
  path('M-22 -10 Q-26 14 -24 32 L24 32 Q26 14 22 -10 Q12 -18 0 -18 Q-12 -18 -22 -10Z',sweater);
  path('M-24 6 Q0 10 24 6 M-24 18 Q0 22 24 18',null,'#f6c3a4',2.5);
  oval(0,-19,5,4,skin);
  path('M-16 -36 Q-18 -54 0 -53 Q18 -54 16 -36 Q17 -24 19 -16 Q10 -22 9 -38 Q0 -43 -9 -38 Q-10 -22 -19 -16 Q-17 -24 -16 -36Z','#6b3f2a');
  oval(0,-34,14,15,skin,outline,2.6);
  path('M-14 -38 Q-8 -50 2 -48 Q10 -48 14 -40 Q6 -44 -2 -42 Q-8 -42 -14 -38Z','#6b3f2a',null);
  if(o.hug)path('M-9 -33 q3 -3 6 0 M3 -33 q3 -3 6 0',null,outline,2);
  else{oval(-6,-33,1.8,2.4,outline);oval(6,-33,1.8,2.4,outline);}
  path('M-5 -26 Q0 -21 5 -26',null,outline,1.8);
  oval(-10,-27,3,1.8,'#f19b8f');oval(10,-27,3,1.8,'#f19b8f');
  if(o.hug){
    ctx.save();ctx.translate(0,8);ctx.scale(.42,.42);cat(p,{scarf:o.scarf,bell:o.bell},t);ctx.restore();
    for(const s of [-1,1]){
      const d='M'+(s*22)+' -8 Q'+(s*30)+' 14 '+(s*10)+' 20 Q'+(s*2)+' 22 '+(-s*6)+' 16';
      path(d,null,outline,9);path(d,null,sweater,6);oval(-s*7,15,5,4.5,skin,outline,2);
    }
  }else{
    const lift=Math.sin(t*4)*3;
    for(const s of [-1,1]){
      ctx.save();ctx.translate(s*20,-8);ctx.rotate(s*lift*.03);
      path('M0 0 Q'+(s*18)+' 2 '+(s*24)+' -16',null,outline,9);path('M0 0 Q'+(s*18)+' 2 '+(s*24)+' -16',null,sweater,6);
      oval(s*25,-19,5,5,skin,outline,2);
      ctx.restore();
    }
  }
  ctx.restore();
}

const pickups={scarf:p=>scarf(p,true),bell:bellItem,fish:fishItem,thimble:thimbleItem};

const artists={cat,unicorn,lep,felix,witch,mouse,moth,teapot,phoenix,dragon,dog,cucumber,medusa,giant,loki,sphinx,owner};
export function drawSprite(ctx,type,x,y,size,time=0,options={}) {
  ctx.save();
  const stride=type!=='cat'&&options.moving?Math.sin(time*12):0;
  ctx.translate(x,y+(options.moving?-Math.abs(stride)*size*.043:0));
  ctx.scale((options.flip?-1:1)*size/100,size/100);
  ctx.rotate(options.moving?stride*.033:0);
  if (options.charging) ctx.rotate(Math.sin(time*36)*.033);
  ctx.lineJoin='round';ctx.lineCap='round';
  const p=brush(ctx);
  if(pickups[type]){ctx.scale(1.9,1.9);ctx.translate(0,-9);pickups[type](p);}
  else artists[type]?.(p,options,time);
  ctx.restore();
}
