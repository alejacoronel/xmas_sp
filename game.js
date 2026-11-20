const c=document.getElementById('game'),g=c.getContext('2d');
const title=document.getElementById('title'),ending=document.getElementById('ending');
const W=960,H=540,G=440,LEVEL=2260,FLAG_X=2110;
let state='title',keys={},frame=0,camera=0,hero={x:55,y:G-58,v:0,on:true},got=new Set(),snow=[];
for(let i=0;i<85;i++)snow.push({x:(i*137)%W,y:(i*71)%H,s:1+(i%3),drift:(i%5-2)*.18});
const blocks=[{x:270,y:350},{x:470,y:305},{x:720,y:340},{x:960,y:300},{x:1190,y:345},{x:1430,y:305},{x:1690,y:345},{x:1900,y:310},{x:2010,y:315}];
const hazards=[390,625,865,1080,1330,1580,1830];
const fruit=[[300,305],[500,260],[750,295],[990,255],[1220,300],[1460,260],[1720,300],[1930,265]];
function box(x,y,w,h,col){g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h)}
function line(x1,y1,x2,y2,col,width=2){g.strokeStyle=col;g.lineWidth=width;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}
function label(t,x,y,s,col,align='left'){g.font=`${s}px "Press Start 2P",monospace`;g.textAlign=align;g.fillStyle=col;g.fillText(t,x,y)}
function cloud(x,y,s=1){box(x,y,72*s,17*s,'#fff');box(x+15*s,y-13*s,43*s,19*s,'#fff');box(x+52*s,y+4*s,29*s,13*s,'#fff');box(x+20*s,y+17*s,42*s,3*s,'#d8eff8')}
function pineTree(x,scale=1,decorated=false){x-=camera*.55;let y=G-3;box(x+18*scale,y-68*scale,9*scale,70*scale,'#765033');for(let n=0;n<3;n++){let yy=y-(42+n*22)*scale,w=(54-n*11)*scale;box(x+(45*scale-w/2),yy,w,25*scale,n===0?'#176c50':'#23845a');box(x+(45*scale-w/2)+4*scale,yy,w-8*scale,4*scale,'#e9f7ff');}if(decorated){box(x+25*scale,y-54*scale,5*scale,5*scale,'#e7c94e');box(x+48*scale,y-34*scale,5*scale,5*scale,'#d94b49');box(x+36*scale,y-75*scale,7*scale,7*scale,'#ffe17b')}}
function background(){
 box(0,0,W,H,'#78c9ef');
 // soft winter sun and distant cloud layers
 g.globalAlpha=.7;g.beginPath();g.arc(810,92,39,0,Math.PI*2);g.fillStyle='#fff4c5';g.fill();g.globalAlpha=1;
 for(let i=0;i<7;i++){let x=((i*245-camera*.13)%(W+280))-110;cloud(x,58+(i%3)*39,.85+(i%2)*.2)}
 // far snowy mountain silhouettes
 for(let i=0;i<7;i++){let x=((i*230-camera*.22)%(W+300))-120;box(x,290,190,150,'#82b9a1');box(x+30,265,130,35,'#effaff');box(x+55,245,80,25,'#f8fdff');box(x+18,315,160,125,'#6eaa88')}
 // nearer rolling hills
 for(let i=0;i<6;i++){let x=((i*250-camera*.34)%(W+300))-120;box(x,360,205,80,'#4b9a69');box(x+20,345,160,18,'#e9f8f7')}
 // layered decorated evergreens
 for(let i=0;i<14;i++){let x=((i*155-camera*.5)%(W+240))-100;pineTree(x,.72+(i%3)*.12,i%4===0)}
 // snow flakes drift continuously
 for(const f of snow){let x=(f.x+f.drift*frame+W)%W,y=(f.y+frame*(.35+f.s*.18))%(H-12);box(x,y,f.s,f.s+2,'#f5fdff')}
 // ground and detailed brick/grass path
 box(0,G,W,H-G,'#98613f');box(0,G,W,13,'#42965a');box(0,G+13,W,6,'#eaf8ff');
 for(let x=-(camera%64);x<W;x+=64){box(x,G+20,62,44,'#a96e47');box(x+3,G+23,56,37,'#bd8050');box(x+29,G+23,5,37,'#825032');box(x+3,G+41,56,4,'#825032');box(x+7,G+27,17,3,'#d99a65')}
 // little snow caps along the grass edge
 for(let x=-(camera%96);x<W;x+=96){box(x+9,G-2,34,4,'#f4ffff')}
}
function drawBlock(p){let x=p.x-camera;box(x,p.y,72,25,'#85472d');box(x+3,p.y+3,66,19,'#bd7540');box(x+4,p.y+4,64,3,'#e3a36a');box(x+4,p.y+15,64,4,'#8d512f');box(x+33,p.y,5,25,'#874c30');box(x+8,p.y+8,4,4,'#f0bd80');box(x+57,p.y+8,4,4,'#f0bd80')}
function drawHero(){
 let x=Math.round(hero.x-camera),y=Math.round(hero.y),walk=Math.abs(hero.vx||0)>.1&&hero.on?Math.sin(frame*.32)*3:0;
 // shadow
 g.globalAlpha=.2;g.beginPath();g.ellipse(x+19,G+2,18,4,0,0,Math.PI*2);g.fillStyle='#173b36';g.fill();g.globalAlpha=1;
 // hair silhouette and face
 box(x+7,y+1,22,8,'#211c25');box(x+3,y+7,29,9,'#211c25');box(x+5,y+12,25,17,'#f2c9a9');box(x+4,y+10,5,10,'#211c25');box(x+27,y+10,5,9,'#211c25');
 box(x+10,y+17,3,4,'#29212a');box(x+22,y+17,3,4,'#29212a');box(x+15,y+24,8,2,'#b66b62');box(x+12,y+13,4,2,'#f8dfc9');
 // green cap with brim and stitched badge
 box(x+7,y-5,23,8,'#21864b');box(x+4,y+1,30,4,'#176b3e');box(x+20,y-3,6,4,'#f4d66b');
 // torso, collar, buttons and sleeves
 box(x+6,y+29,27,17,'#23894d');box(x+11,y+28,17,4,'#e5f0d9');box(x+17,y+32,3,12,'#f1d36a');box(x+7,y+35,5,7,'#176b3e');
 let arm= Math.sin(frame*.24)*2;
 box(x+1,y+31+arm,7,12,'#23894d');box(x+1,y+40+arm,7,5,'#f2c9a9');box(x+31,y+31-arm,7,12,'#23894d');box(x+31,y+40-arm,7,5,'#f2c9a9');
 // trousers and animated feet
 box(x+8,y+45,11,8,'#315b40');box(x+21,y+45,10,8,'#315b40');
 box(x+5+(walk>0?3:0),y+52,14,5,'#49352f');box(x+20+(walk<0?3:0),y+52,14,5,'#49352f');
}
function snowBuddy(worldX){let x=worldX-camera,bob=Math.sin(frame*.08+worldX)*1.5;box(x+7,G-31+bob,20,18,'#f7fdff');box(x+10,G-45+bob,15,16,'#fff');box(x+13,G-40+bob,3,3,'#263b4b');box(x+21,G-40+bob,3,3,'#263b4b');box(x+16,G-34+bob,7,2,'#e78a42');box(x+4,G-28+bob,8,3,'#795333');box(x+24,G-28+bob,8,3,'#795333');box(x+8,G-48+bob,18,3,'#c94c48');box(x+12,G-55+bob,12,8,'#c94c48');box(x+21,G-52+bob,4,4,'#fff')}
function pineapple(x,y){x-=camera;let bob=Math.sin(frame*.09+x)*2;box(x+7,y+bob,15,20,'#e7a72e');box(x+9,y+5+bob,2,2,'#fff0a6');box(x+17,y+11+bob,2,2,'#fff0a6');box(x+5,y-5+bob,7,10,'#3caa62');box(x+11,y-9+bob,7,12,'#2d9b58');box(x+18,y-6+bob,7,10,'#27824c');box(x+12,y-2+bob,3,5,'#f0d85d')}
function princess(){
 // Princess sits on the very top of the flagpole. Fairer warm-ivory complexion.
 let x=FLAG_X-camera+1,y=147,bob=Math.sin(frame*.07)*1.5;
 // flowing brown hair
 box(x+6,y+2+bob,27,10,'#593522');box(x+3,y+9+bob,31,17,'#593522');box(x+5,y+13+bob,5,20,'#70452d');box(x+28,y+13+bob,6,20,'#70452d');
 // face and delicate features
 box(x+9,y+10+bob,20,18,'#e7c5a6');box(x+12,y+18+bob,3,3,'#33232a');box(x+23,y+18+bob,3,3,'#33232a');box(x+17,y+24+bob,7,2,'#bb7774');box(x+10,y+14+bob,5,2,'#f5dfc8');
 // tiny crown
 box(x+12,y-2+bob,17,4,'#e7c44f');box(x+14,y-7+bob,4,6,'#f5d96c');box(x+21,y-8+bob,4,7,'#f5d96c');
 // purple dress and puff sleeves
 box(x+8,y+29+bob,23,22,'#8749a4');box(x+3,y+30+bob,8,9,'#a967bd');box(x+28,y+30+bob,8,9,'#a967bd');box(x+5,y+47+bob,30,7,'#633b83');box(x+13,y+31+bob,13,4,'#e5c4ef');box(x+18,y+37+bob,4,4,'#f1d46c');
}
function flagAndFinish(){
 let x=FLAG_X-camera;
 // base pedestal and tall striped pole
 box(x-20,G-7,52,7,'#8b5838');box(x-14,G-13,40,7,'#d5e7e8');
 box(x+15,112,9,329,'#e8e9df');box(x+17,112,3,329,'#fff');
 // fluttering banner
 let wave=Math.sin(frame*.1)*5;box(x+24,123,72+wave,34,'#d94343');box(x+24,123,72+wave,7,'#fff1d4');box(x+24,150,72+wave,7,'#fff1d4');box(x+38,133,9,9,'#f5d65a');box(x+55,133,9,9,'#f5d65a');
 princess();
 // small snow-covered platform beside pole: jump from it to reach her
 box(FLAG_X-72-camera,320,92,13,'#85502f');box(FLAG_X-72-camera,316,92,6,'#f4ffff');box(FLAG_X-68-camera,333,84,8,'#b97b4d');
}
function hud(){box(16,15,210,34,'#fff9e9');box(20,19,202,26,'#294e56');label('PIÑAS '+got.size+'/'+fruit.length,31,37,12,'#fff6d7')}
function update(){
 if(state!=='play')return;frame++;
 const speed=3.45;hero.vx=(keys.right?speed:0)-(keys.left?speed:0);hero.x+=hero.vx;
 if((keys.jump||keys.up)&&hero.on){hero.v=-12.4;hero.on=false}
 hero.v+=.56;hero.y+=hero.v;hero.on=false;
 for(const p of blocks){if(hero.x+36>p.x&&hero.x<p.x+72&&hero.y+58>=p.y&&hero.y+58<=p.y+17&&hero.v>=0){hero.y=p.y-58;hero.v=0;hero.on=true}}
 // finish approach platform
 if(hero.x+36>FLAG_X-72&&hero.x<FLAG_X+20&&hero.y+58>=320&&hero.y+58<=337&&hero.v>=0){hero.y=320-58;hero.v=0;hero.on=true}
 if(hero.y+58>=G){hero.y=G-58;hero.v=0;hero.on=true}
 for(const hx of hazards){if(hero.x+34>hx&&hero.x<hx+32&&hero.y+58>G-35){hero.x=Math.max(55,hero.x-120);hero.y=G-58;hero.v=0}}
 fruit.forEach((p,i)=>{if(!got.has(i)&&Math.abs(hero.x-p[0])<28&&Math.abs(hero.y-p[1])<47)got.add(i)});
 hero.x=Math.max(0,Math.min(LEVEL-40,hero.x));camera=Math.max(0,Math.min(LEVEL-W,hero.x-300));
 // Rescue requires a jump up to the princess at the pole's crown.
 const princessX=FLAG_X+12,princessY=147+Math.sin(frame*.07)*1.5;
 if(hero.x+36>princessX-10&&hero.x<princessX+42&&hero.y<princessY+58&&hero.y+58>princessY-10){state='ending';ending.classList.remove('hidden')}
}
function render(){background();blocks.forEach(drawBlock);hazards.forEach(snowBuddy);fruit.forEach((p,i)=>{if(!got.has(i))pineapple(...p)});flagAndFinish();drawHero();hud()}
function loop(){update();render();requestAnimationFrame(loop)}
function start(){got.clear();hero={x:55,y:G-58,v:0,vx:0,on:true};camera=0;frame=0;state='play';title.classList.add('hidden');ending.classList.add('hidden')}
document.getElementById('play').onclick=start;document.getElementById('again').onclick=start;
document.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup',' ','a','d','w'].includes(k))e.preventDefault();if(k==='arrowleft'||k==='a')keys.left=true;if(k==='arrowright'||k==='d')keys.right=true;if(k===' '||k==='arrowup'||k==='w')keys.jump=true});
document.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')keys.left=false;if(k==='arrowright'||k==='d')keys.right=false;if(k===' '||k==='arrowup'||k==='w')keys.jump=false});
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true});['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();keys[k]=false}))});
loop();