// A cutaway dollhouse. Object anchors use floor coordinates; tall upholstery,
// lamps and mirrors extend upward from their walk-blocking footprints.
// Every room kind: name, palette [wall, print, trim, wood, light, rug, gold], furniture
// [kind, x, y, footprint w, footprint h], rugs, and optional tiled floor / attic beams.
// Door approaches (top/bottom centre, left/right middle) must stay free in every room,
// because the daily layout can put a doorway on any side of a combat room.
export const roomKinds={
 living:{name:'Living Room',palette:['#ace0d5','#5a9c98','#fbecce','#e4b786','#f1d09b','#426e72','#f6cc8c'],
  items:[['sofa',172,112,174,40],['lamp',302,98,24,15],['bookcase',780,89,128,30],['plant',846,420,30,20]],mats:[[215,159,520,239]]},
 bedroom:{name:'Bedroom',palette:['#e7b5c3','#bb829c','#fff1d7','#c99783','#dfa991','#9584ab','#f8dcbe'],curtain:'#cd92a6',
  items:[['bed',174,142,145,108],['nightstand',286,103,45,39],['wardrobe',786,99,109,43],['ottoman',480,270,54,24]],mats:[[350,166,271,209]]},
 dining:{name:'Dining Room',palette:['#efd095','#bb985e','#fff0cb','#a97659','#c99772','#75958a','#e7cc91'],
  items:[['table',162,143,134,63],['hutch',772,98,151,37],['plant',132,418,30,20]],mats:[[85,88,193,142]]},
 kitchen:{name:'Kitchen',palette:['#c2dbd3','#88aeaa','#fff4cf','#c7bd9b','#e6d6af','#be8670','#ffddb1'],tiles:['#d7d4b3','#eee3c2',45],
  items:[['stove',128,106,86,52],['counter',258,106,159,52],['sink',759,99,148,40],['shelf',855,405,52,60]],mats:[[92,142,245,45]]},
 library:{name:'Library',palette:['#b9c79f','#7f9468','#fbecce','#9a6a4e','#b98763','#8a4f52','#e7c27a'],
  items:[['bookcase',175,92,128,30],['bookcase',785,92,128,30],['desk',650,350,118,40],['armchair',150,418,60,34],['globe',842,418,36,26]],mats:[[250,150,300,200]]},
 bathroom:{name:'Bathroom',palette:['#bfe0ea','#86b6c6','#fff6e2','#c9c3b8','#e5e0d4','#6fa3b5','#f4e3b0'],tiles:['#e2eef0','#cfe2e7',30],
  items:[['bathtub',190,118,176,62],['basin',785,100,80,34],['basket',852,422,44,32],['towels',140,425,50,30]],mats:[[560,330,160,90]]},
 conservatory:{name:'Conservatory',palette:['#d4e6b5','#97b878','#fff4d6','#b07a5a','#c98f69','#6e9a6a','#f1d18b'],tiles:['#d8a983','#c99572',40],
  items:[['plant',115,105,30,20],['plant',300,108,30,20],['plant',845,105,30,20],['fountain',480,272,96,48],['bench',260,428,112,26],['plant',730,430,30,20]],mats:[]},
 playroom:{name:'Playroom',palette:['#f4cfa2','#e09a77','#fff2d9','#c59266','#ddb185','#7d9ad0','#ffd76e'],
  items:[['toychest',172,110,112,44],['dollhouse',790,100,104,40],['rockinghorse',300,412,74,30],['blocks',690,190,52,36],['blocks',700,420,52,36]],mats:[[330,180,300,190]]},
 home:{name:'Your Human’s Room',palette:['#f8e1b0','#e7b977','#fff6e0','#d49a6a','#e8b98a','#e07f6f','#ffe08a'],curtain:'#f0a98f',
  items:[['bed',175,142,145,108],['nightstand',290,103,45,39],['plant',845,105,30,20],['armchair',830,418,60,34],['plant',130,430,30,20]],mats:[[330,170,300,190]]},
 attic:{name:'The Attic',palette:['#a9adc3','#737a96','#e4d8c1','#976e62','#b68e75','#667892','#d7c394'],beams:true,windows:1,
  items:[['trunk',147,111,110,52],['mirror',788,115,81,44],['books',135,420,77,35],['lamp',868,422,24,15]],mats:[[256,121,442,289]]}
};
const obstacles=Object.fromEntries(Object.entries(roomKinds).map(([kind,info])=>[kind,info.items.map(([,x,y,w,h])=>({left:x-w/2,right:x+w/2,top:y-h/2,bottom:y+h/2}))]));
export function roomFurniture(kind){return obstacles[kind]||[];}
export function roomName(kind){return roomKinds[kind]?.name||'';}
const ink='#4b4146';
function drawKit(c){
 const box=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 function rect(x,y,w,h,r,fill,stroke=ink,width=1.8){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.stroke();}}
 function oval(x,y,rx,ry,fill,stroke=null,sw=1.5){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=sw;c.strokeStyle=stroke;c.stroke();}}
 function line(points,color,width=2,close=false){c.beginPath();for(let i=0;i<points.length;i+=2)i?c.lineTo(points[i],points[i+1]):c.moveTo(points[i],points[i+1]);if(close)c.closePath();c.strokeStyle=color;c.lineWidth=width;c.stroke();}
 function poly(points,color,stroke=ink,width=1.5){c.beginPath();for(let i=0;i<points.length;i+=2)i?c.lineTo(points[i],points[i+1]):c.moveTo(points[i],points[i+1]);c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
 return {box,rect,oval,line,poly};
}
function furniture(c,k,kind,x,y){
 const {rect,oval,line,poly,box}=k;
 c.save();c.translate(x,y);const wood='#aa7055',pale='#e8bb85',dark='#764f45',cream='#fbe6bd';
 function feet(w,h){for(const a of [-1,1])rect(a*w-3,h,6,10,2,dark);}
 function books(x,y,count){for(let i=0;i<count;i++){const h=11+(i*7)%11;rect(x+i*8,y-h,7,h,1,['#c97865','#6b9e95','#dfad68','#9089a4'][i%4],ink,1);box(x+i*8+2,y-5,3,1,cream);}}
 function knobs(x,y){oval(x,y,3,3,'#f1c57c',dark,1);}
 function flower(x,y){line([x,y,x+1,y-12],'#4e846f',1.5);for(let i=0;i<5;i++){const a=i*1.257;oval(x+Math.cos(a)*3,y-12+Math.sin(a)*3,2.2,2.2,'#f5b378');}oval(x,y-12,2,2,'#e58b65');}
 if(kind==='sofa'){
 feet(72,15);rect(-85,-43,170,60,14,'#407b78');rect(-78,-44,156,32,11,'#5e9790');line([-70,-37,68,-37],'#9bb9a3',2);
 rect(-75,-16,150,34,8,'#528e86');
 for(const a of [-1,1]){rect(a*34-32,-17,64,24,7,'#78aaa0');rect(a*78-10,-24,20,41,8,'#82aba0');}
 c.save();c.rotate(-.16);rect(-54,-34,25,24,5,'#e7b46e');line([-50,-23,-42,-29,-35,-20],'#fff0ba',2);c.restore();
 c.save();c.rotate(.15);rect(30,-34,26,24,5,'#d18c85');line([33,-24,53,-24],'#f0c5ac',2);c.restore();
 }else if(kind==='lamp'){oval(0,5,13,5,dark,ink);rect(-2,-46,4,49,1,'#c99960');poly([-16,-31,-10,-53,11,-53,18,-31],cream);line([-8,-33,-5,-50,0,-51],'#d5aa76');knobs(11,-23);}
 else if(kind==='plant'){
 rect(-12,-9,24,20,4,'#d49170');rect(-15,-14,30,8,2,'#e9b08b');
 for(let i=0;i<6;i++){let a=-1.05+i*.43;c.save();c.rotate(a);line([0,-12,0,-39],'#557755',2);oval(0,-34,5,13,['#7aa887','#588b73','#91b588'][i%3],ink,1);c.restore();}
 }else if(kind==='bookcase'||kind==='hutch'){
 const w=kind==='hutch'?145:122;feet(w/2-9,12);rect(-w/2,-42,w,55,3,wood);rect(-w/2-3,-47,w+6,8,2,pale);
 rect(-w/2+7,-35,w-14,24,2,dark);if(kind==='hutch'){for(let i=0;i<6;i++){oval(-49+i*19,-23,8,10,'#d9e8db',ink,1);oval(-49+i*19,-23,5,7,'#f6ebd0','#90b6b2',1);}}else books(-48,-13,12);
 rect(-w/2+4,-11,w-8,4,1,pale);
 for(let i=0;i<2;i++){rect(-w/2+6+i*(w-12)/2,-5,(w-16)/2,15,2,'#ba8465');knobs(i?8:-8,2);}
 }else if(kind==='bed'){
 feet(58,45);rect(-69,-72,138,114,9,dark);rect(-72,-75,144,23,8,'#ba896e');rect(-64,-63,128,109,10,'#fff0d6');
 rect(-48,-61,96,30,9,'#f3d7bd');rect(-44,-57,88,20,7,'#fff2dc','#c6ae9f',1);
 rect(-66,-24,132,72,8,'#aaa0bd');for(let i=0;i<6;i++)line([-55+i*22,-20,-55+i*22,42],'#d2bbce',2);for(let i=0;i<3;i++)line([-63,-13+i*23,63,-13+i*23],'#d4c1cf',2);
 rect(-66,-29,132,13,4,'#cfbed2');rect(-71,43,142,12,4,wood);
 }else if(kind==='nightstand'||kind==='wardrobe'){
 const big=kind==='wardrobe',w=big?108:43,h=big?67:37;feet(w/2-7,9);rect(-w/2,-h,w,h+11,4,wood);rect(-w/2-3,-h-4,w+6,7,2,pale);
 for(let i=0;i<(big?2:1);i++){const sw=big?w/2-6:w-8;rect(-w/2+4+i*(w/2),-h+6,sw,h-2,3,'#bc8c71');knobs(big?(i?7:-7):0,-h/3);}
 if(!big){rect(-6,-46,12,10,3,'#a2bdad');flower(0,-46);}
 }else if(kind==='ottoman'){feet(19,8);rect(-28,-11,56,22,7,'#b87977');rect(-31,-16,62,16,7,'#d99b8d');line([-23,-4,22,-4],'#f2c89b',1.8);}
 else if(kind==='table'){
 for(const xx of [-30,30])for(const yy of [-1,1]){rect(xx-13,yy*31-9,26,19,5,wood);rect(xx-14,yy*42-3,28,6,2,pale);}
 feet(55,22);rect(-67,-33,134,59,17,wood);rect(-68,-36,136,58,16,pale);rect(-17,-36,34,58,2,'#8caa98',null);
 for(const xx of [-39,39]){oval(xx,-7,13,10,'#f7efda','#968e77');oval(xx,-7,9,7,'#e3e8d7','#a8b9a6',1);}
 oval(0,-7,8,5,'#6e9c97',ink);flower(-1,-11);flower(4,-9);
 }else if(kind==='stove'){
 rect(-41,-34,82,56,4,'#667d7c');rect(-42,-38,84,36,3,'#b0bab0');
 for(const xx of [-22,21]){oval(xx,-20,13,7,'#565c5f',ink);oval(xx,-20,9,4,'#9aa7a2',ink,1);}
 rect(-29,4,58,13,3,'#465563');line([-18,5,18,5],cream,3);rect(9,-34,24,14,4,'#c66f60');oval(21,-34,12,4,'#df9a77',ink);knobs(21,-38);
 }else if(kind==='counter'||kind==='sink'){
 const w=kind==='sink'?145:156;rect(-w/2,-31,w,52,3,'#60958d');rect(-w/2-2,-36,w+4,23,3,cream);
 for(const xx of [-1,1]){rect(xx*w/4-w/5,-10,w/2-8,24,3,'#87b3a4');knobs(xx*8,-4);}
 if(kind==='sink'){rect(-24,-34,52,17,6,'#849e9e');rect(-18,-31,39,11,4,'#b2c7c2');line([5,-32,5,-44,11,-46,14,-42],ink,4);}
 else{rect(-54,-32,34,14,4,wood);poly([-45,-26,-26,-28,-29,-24],'#c3cebf');for(const [i,col] of ['#dca16e','#b9cca4','#ceb3a2'].entries()){rect(22+i*14,-40,11,17,3,col);rect(21+i*14,-42,13,4,1,dark);}}
 }else if(kind==='shelf'||kind==='books'){if(kind==='shelf'){rect(-23,-27,46,55,4,wood);for(let i=0;i<3;i++){rect(-21,-22+i*16,42,12,2,dark);for(let j=0;j<3;j++)oval(-14+j*13,-16+i*16,5,5,['#d99c68','#99b27e','#c97966'][i],ink,1);}}else{for(let i=0;i<4;i++){rect(-32+i%2*5,8-i*8,60,8,2,['#bd9268','#839889','#9b8297','#cc8a73'][i]);line([-23,12-i*8,19,12-i*8],cream,1);}}}
 else if(kind==='mirror'){
 feet(28,13);rect(-31,-57,62,68,22,'#a68060');oval(0,-32,33,44,'#c3a573',ink,3);oval(0,-32,26,36,'#9db3c0','#816746',2);line([-15,-27,4,-52],'#e2e8d9',3);line([-10,-18,14,-48],'#ccddda',2);
 rect(-36,5,72,12,4,wood);knobs(0,-79);
 }else if(kind==='trunk'){feet(42,17);rect(-52,-22,104,39,6,'#a07559');rect(-52,-34,104,25,9,'#b78961');for(const xx of [-30,30])rect(xx-4,-32,8,47,2,'#77554d');rect(-6,-13,12,12,3,'#e5b976');}
 else if(kind==='armchair'){feet(22,14);rect(-30,-42,60,56,12,'#8a4f52');rect(-24,-46,48,30,10,'#a5605f');rect(-34,-20,13,34,6,'#9a5857');rect(21,-20,13,34,6,'#9a5857');rect(-21,-14,42,22,6,'#b8716c');line([-14,-38,14,-38],'#c98a84',1.5);}
 else if(kind==='globe'){rect(-14,10,28,6,2,dark);line([0,10,0,-6],dark,3);oval(0,-24,17,17,'#7fb6c9',ink,2);poly([-9,-34,2,-31,-2,-22,-11,-25],'#9cc48a',null);poly([4,-20,12,-25,11,-14,4,-12],'#9cc48a',null);c.beginPath();c.arc(0,-24,21,Math.PI*.6,Math.PI*1.9);c.strokeStyle='#c49a5c';c.lineWidth=2.5;c.stroke();}
 else if(kind==='desk'){feet(52,14);rect(-59,-30,118,46,4,wood);rect(-62,-34,124,10,3,pale);rect(-50,-20,40,28,3,'#ba8465');knobs(-30,-6);rect(14,-50,30,18,2,cream);line([18,-44,38,-44],'#9b8ea0',1);line([18,-38,34,-38],'#9b8ea0',1);rect(-42,-48,10,14,2,'#f6ebd0');oval(-37,-50,2,3,'#ffc75a');}
 else if(kind==='bathtub'){feet(76,22);rect(-88,-40,176,64,26,'#f3f4f0');rect(-80,-34,160,46,20,'#bfe3ee',ink,1.5);
  for(const [bx,by,br] of [[-30,-18,8],[-12,-23,6],[14,-14,9],[40,-20,7],[60,-10,5]])oval(bx,by,br,br,'#ffffffd0','#9cc8d4',1);
  oval(-60,-18,7,6,'#ffd75a',ink,1.2);oval(-55,-25,4.5,4.5,'#ffd75a',ink,1.2);poly([-51,-25,-46,-24,-51,-22],'#f08a3c',null);
  rect(70,-60,8,24,2,'#c9c3b8');oval(74,-60,8,3,'#c9c3b8',ink);}
 else if(kind==='basin'){rect(-40,-30,80,48,4,'#e5e0d4');rect(-34,-24,68,18,8,'#bfe3ee');line([0,-26,0,-36,8,-38],ink,3);rect(-26,-66,52,28,6,'#c7dfe6',ink,2);line([-18,-58,-8,-46],'#ffffff',2);}
 else if(kind==='basket'){rect(-22,-22,44,38,6,'#c9a06a');for(let i=0;i<4;i++)line([-20,-14+i*8,20,-14+i*8],'#a07a4a',1.5);rect(-18,-32,18,14,4,'#f1b6c6');rect(2,-30,16,12,4,'#a6cbe8');}
 else if(kind==='towels'){rect(-25,-34,50,48,3,wood);rect(-20,-30,40,10,3,'#f1b6c6');rect(-20,-17,40,10,3,'#a6cbe8');rect(-20,-4,40,10,3,'#fff4d0');}
 else if(kind==='fountain'){oval(0,4,48,22,'#c9c3b8',ink,2);oval(0,2,40,16,'#9fd3e0',ink,1.5);oval(-14,4,7,3,'#ffffff90');rect(-6,-30,12,32,3,'#d9d3c8');oval(0,-30,16,6,'#c9c3b8',ink,1.5);
  for(const a of [-1,1]){c.beginPath();c.moveTo(0,-34);c.quadraticCurveTo(a*18,-56,a*26,-6);c.strokeStyle='#d8f2f7';c.lineWidth=2.5;c.stroke();}}
 else if(kind==='bench'){feet(46,10);rect(-56,-14,112,22,4,wood);rect(-56,-38,112,10,3,pale);for(const xx of [-40,0,40])rect(xx-3,-30,6,17,1,dark);}
 else if(kind==='toychest'){feet(48,16);rect(-56,-30,112,48,6,'#c46a5a');rect(-58,-38,116,16,6,'#d8806b');for(const xx of [-30,30])rect(xx-5,-36,10,52,2,'#f1c57c');oval(-40,-46,9,9,'#7d9ad0',ink,1.5);line([-46,-46,-34,-46],'#ffffff',1.5);rect(26,-58,16,18,3,'#ffd76e');}
 else if(kind==='dollhouse'){rect(-48,-40,96,56,2,'#f4e3c4');poly([-54,-40,0,-72,54,-40],'#c46a5a');for(const [wx,wy] of [[-32,-30],[12,-30],[-32,-6]])rect(wx,wy,20,15,2,'#96cad4');rect(14,-6,14,22,2,'#aa7055');}
 else if(kind==='rockinghorse'){c.beginPath();c.arc(0,-30,40,Math.PI*.25,Math.PI*.75);c.strokeStyle=dark;c.lineWidth=5;c.stroke();line([-20,-2,-14,-26],dark,4);line([20,-2,14,-26],dark,4);
  line([-20,-32,-34,-22],'#c46a5a',5);oval(0,-30,23,10,'#f4e3c4',ink,1.8);poly([14,-34,26,-58,40,-52,26,-28],'#f4e3c4');line([20,-42,25,-58],'#c46a5a',4);rect(-9,-42,18,8,3,'#7d9ad0');oval(31,-51,1.6,1.6,ink);}
 else if(kind==='blocks'){for(const [bx,by,col,l] of [[-25,-18,'#e07a5f','A'],[1,-18,'#7d9ad0','B'],[-12,-42,'#ffd76e','C']]){rect(bx,by,24,24,3,col);c.fillStyle=ink;c.font='bold 14px Georgia';c.textAlign='center';c.fillText(l,bx+12,by+17);}}
 c.restore();
}
export function drawRoom(c,kind='living',seed=0,doors={}){
 const info=roomKinds[kind]||roomKinds.living,[wall,print,trim,wood,light,rug,gold]=info.palette,k=drawKit(c),{box,rect,oval,line,poly}=k;
 c.save();c.lineJoin='round';c.lineCap='round';box(0,0,960,540,wall);
 // Block-printed leaves on wallpaper, with a cream ceiling moulding.
 for(let y=8;y<535;y+=17)for(let x=6+(y%2)*10;x<957;x+=23){
   if(x>47&&x<913&&y>66&&y<505)continue;
   line([x,y+5,x+2,y-4],print,.9);oval(x-1,y,2.7,1.4,print);oval(x+4,y-3,2.7,1.4,print);
 }
 box(0,0,960,5,trim);rect(40,57,880,445,2,wood,ink,2);
 c.save();c.beginPath();c.rect(42,59,876,441);c.clip();
 if(info.tiles){const [ta,tb,tw]=info.tiles;for(let i=0;i*tw<880;i++)for(let j=0;j*tw<445;j++){const x=40+i*tw,y=58+j*tw;box(x,y,tw-1,tw-1,(i+j)%2?ta:tb);}}
 else{for(let row=0;row<16;row++){const y=58+row*30;for(let i=-1;i<8;i++){const x=42+i*153+(row%2)*76;box(x+1,y+1,151,28,(row+i+9)%3?wood:light);line([x+4,y+2,x+148,y+2],light,.9);const v=(i*i+row*13+(Number(seed)||0))%53;line([x+17+v,y+10,x+28+v,y+9,x+39+v,y+10],'#765a462c',1);}}}
 c.restore();
 function mat(x,y,w,h){rect(x+1,y+3,w,h,12,'#614d4829',null);rect(x,y,w,h,11,rug,ink,1);rect(x+6,y+6,w-12,h-12,8,null,gold,2);c.setLineDash([3,5]);rect(x+11,y+11,w-22,h-22,6,null,gold,1);c.setLineDash([]);for(const xx of [x+24,x+w-24])for(const yy of [y+24,y+h-24])poly([xx-4,yy,xx,yy-5,xx+4,yy,xx,yy+5],gold,null);}
 for(const m of info.mats)mat(...m);
 if(info.beams)for(const xx of [52,891]){box(xx,60,15,440,'#795645');line([xx+3,62,xx+3,498],'#c38d65',2);}
 // Window light, figures and warm trim sit above the playable floor.
 for(const [x,y,w,h] of [[35,51,890,10],[34,59,9,438],[917,59,9,438],[34,499,892,10]])rect(x,y,w,h,2,trim,print,1.5);
 function window(x,w){rect(x-4,5,w+8,42,3,'#ab8971');rect(x,7,w,34,2,'#96cad4');oval(x+w*.72,15,5,5,'#ffeab0');poly([x,40,x,34,x+w*.28,23,x+w*.55,35,x+w*.81,26,x+w,36,x+w,40],'#83aba0',null);box(x+w/2-2,7,4,35,trim);box(x,24,w,3,trim);rect(x-7,41,w+14,5,2,trim);
 for(const side of [0,1]){const at=side?x+w:x,sign=side?-1:1;poly([at-2*sign,5,at+13*sign,5,at+6*sign,25,at+10*sign,41,at-2*sign,42],info.curtain||'#d3aa87');}}
 window(222,92);if((info.windows??2)>1)window(647,91);
 function frame(x){rect(x,12,28,29,2,'#b48a62');rect(x+3,15,22,23,1,'#f8e5ba',null);oval(x+14,25,6,7,print);line([x+9,33,x+15,25,x+20,22],dark,1);}
 const dark='#68544d';frame(84);frame(831);
 function door(side,open){c.save();if(side==='north')c.translate(480,0);else if(side==='south'){c.translate(480,540);c.rotate(Math.PI);}else if(side==='west'){c.translate(0,270);c.rotate(-Math.PI/2);}else{c.translate(960,270);c.rotate(Math.PI/2);}
 const h=side==='north'?60:side==='south'?42:44;
 rect(-40,4,80,h-1,2,'#765a50');rect(-36,8,72,h-6,2,open?'#5b726f':'#b97d59',null);
 if(open){poly([-36,9,-15,15,-15,h-5,-36,h-1],'#c78e67');line([-28,16,-21,18,-21,h-9],'#e0ad7b',1.5);}
 else{for(const xx of [-28,3])rect(xx,13,25,h-23,2,'#cd946d','#a77557',1.5);oval(25,h*.61,3.3,3.3,'#f3d077',dark);}
 rect(-43,3,8,h,1,trim,dark,1);rect(35,3,8,h,1,trim,dark,1);rect(-45,1,90,6,1,trim,dark,1);rect(-35,h-1,70,4,1,'#bb916a',null);c.restore();}
 for(const [side,open] of Object.entries(doors))if(open!=null)door(side,open);
 for(const [name,x,y] of info.items)furniture(c,k,name,x,y);
 c.restore();
}
