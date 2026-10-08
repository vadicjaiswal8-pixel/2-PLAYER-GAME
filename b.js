// ---- Tussle mascots: chubby fighters (sumo extras optional) ----
function mascotSvg(col,o){o=o||{};const I='#1a1a1a',S='stroke="'+I+'" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"',m=o.mood||'angry',ar=o.arms||'side';let s='';
 if(ar=='side')s+='<circle cx="9" cy="94" r="9.5" fill="'+col+'" '+S+'/><circle cx="91" cy="94" r="9.5" fill="'+col+'" '+S+'/>';
 else if(ar=='up')s+='<path d="M16 88L5 50M84 88L95 50" stroke="'+I+'" stroke-width="18" stroke-linecap="round" fill="none"/><path d="M16 88L5 50M84 88L95 50" stroke="'+col+'" stroke-width="11" stroke-linecap="round" fill="none"/><circle cx="5" cy="45" r="10" fill="'+col+'" '+S+'/><circle cx="95" cy="45" r="10" fill="'+col+'" '+S+'/>';
 s+='<path d="M14 84Q6 44 34 30Q50 24 66 30Q94 44 86 84Q84 118 50 120Q16 118 14 84Z" fill="'+col+'" '+S+'/><ellipse cx="50" cy="96" rx="24" ry="18" fill="#fff" opacity=".16"/><ellipse cx="27" cy="63" rx="6" ry="4" fill="#fff" opacity=".22"/><ellipse cx="73" cy="63" rx="6" ry="4" fill="#fff" opacity=".22"/>';
 if(o.sumo)s+='<path d="M14 98Q50 112 86 98L87 110Q50 124 13 110Z" fill="#fff6e0" '+S+'/><path d="M42 110H58V129H42Z" fill="#fff6e0" '+S+'/>';
 if(o.sumo)s+='<path d="M21 46Q18 21 50 19Q82 21 79 46Q68 35 50 35Q32 35 21 46Z" fill="#2b2b2b" '+S+'/><circle cx="50" cy="12" r="9" fill="#2b2b2b" '+S+'/><path d="M44 21H56" '+S+'/>';
 if(m=='angry')s+='<ellipse cx="38" cy="55" rx="7.5" ry="8.5" fill="#fff" '+S+'/><ellipse cx="62" cy="55" rx="7.5" ry="8.5" fill="#fff" '+S+'/><circle cx="39.5" cy="57" r="4.2" fill="'+I+'"/><circle cx="60.5" cy="57" r="4.2" fill="'+I+'"/><circle cx="38" cy="54.5" r="1.5" fill="#fff"/><circle cx="59" cy="54.5" r="1.5" fill="#fff"/><path d="M26 43L45 50M74 43L55 50" stroke="'+I+'" stroke-width="6" stroke-linecap="round"/><path d="M43 71Q50 64 57 71" fill="none" '+S+'/>';
 else if(m=='happy')s+='<path d="M29 46Q37 41 45 46M55 46Q63 41 71 46" fill="none" '+S+'/><path d="M31 57Q38 49 45 57M55 57Q62 49 69 57" fill="none" '+S+'/><path d="M37 65Q50 84 63 65Z" fill="#7a1d1d" '+S+'/><ellipse cx="50" cy="73" rx="5" ry="3" fill="#ff8aa0"/>';
 else s+='<path d="M32 49l12 12m0-12l-12 12M56 49l12 12m0-12l-12 12" fill="none" '+S+'/><path d="M40 72Q45 66 50 72Q55 78 60 72" fill="none" '+S+'/>';
 return s}
function mascotUri(col,sumo){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -2 108 134" width="216" height="268">'+mascotSvg(col,{sumo:sumo,arms:'side'})+'</svg>')}
// Board game renderers (client). Uses globals from index.html: $, pid, cur, on, X, send, snd, vib
const BG={c4:1,gomoku:1,dots:1,uttt:1,sea:1};
const SHN=[5,4,3,3,2],CS=30;
function shipSvg(id,len){const L=len*CS,m=CS/2,S='stroke="#1a1a1a" stroke-width="2"';
 const rc=(x,w,h,f)=>'<rect x="'+x+'" y="'+(m-h/2)+'" width="'+w+'" height="'+h+'" rx="2" fill="'+f+'" '+S+'/>';
 const gun=x=>'<circle cx="'+x+'" cy="'+m+'" r="4.5" fill="#475569" '+S+'/><path d="M'+x+' '+m+'H'+(x+9)+'" stroke="#1a1a1a" stroke-width="3"/>';
 let g=id==3?'<rect x="3" y="'+(m-8)+'" width="'+(L-8)+'" height="16" rx="8" fill="#64748b" '+S+'/>':'<path d="M3 '+(m-10)+'H'+(L-12)+'L'+(L-2)+' '+m+'L'+(L-12)+' '+(m+10)+'H3Z" fill="#94a3b8" '+S+' stroke-linejoin="round"/>';
 if(id==0)g+='<path d="M9 '+m+'H'+(L-18)+'" stroke="#fff6e0" stroke-width="3" stroke-dasharray="6 4"/>'+rc(L*.55,12,8,'#e5392f')+rc(L*.18,10,8,'#fff6e0');
 else if(id==1)g+=gun(L*.2)+gun(L*.72)+rc(L*.42,16,12,'#e2e8f0')+rc(L*.36,5,7,'#e5392f');
 else if(id==2)g+=gun(L*.2)+rc(L*.42,18,12,'#e2e8f0')+rc(L*.6,6,9,'#e5392f');
 else if(id==3)g+=rc(L*.4,14,10,'#475569')+'<path d="M'+(L*.4+7)+' '+(m-5)+'V'+(m-13)+'H'+(L*.4+14)+'" stroke="#1a1a1a" stroke-width="2.5" fill="none"/>';
 else g+=gun(L*.28)+rc(L*.5,12,9,'#e2e8f0');
 return g}
const cellsOf=o=>{const c=[];for(let k=0;k<SHN[o.id];k++)c.push(o.h?o.y*10+o.x+k:(o.y+k)*10+o.x);return c};
const fitOk=(fl,o)=>{const len=SHN[o.id];if(o.x<0||o.y<0||(o.h?o.x+len>10||o.y>9:o.y+len>10||o.x>9))return false;const occ=new Set();fl.forEach(p=>{if(p.id!=o.id)cellsOf(p).forEach(c=>occ.add(c))});return cellsOf(o).every(c=>!occ.has(c))};
const randFleet=()=>{for(;;){const fl=[];let ok=true;for(let id=0;id<5&&ok;id++){let t=0,o;do{o={id,x:Math.floor(Math.random()*10),y:Math.floor(Math.random()*10),h:Math.random()<.5};t++}while(!fitOk(fl,o)&&t<300);if(t>=300)ok=false;else fl.push(o)}if(ok)return fl}};
const fleetFromBoard=b=>[0,1,2,3,4].map(id=>{const c=[];b.forEach((v,i)=>{if(v==id)c.push(i)});return{id,x:c[0]%10,y:Math.floor(c[0]/10),h:c.length>1?c[1]-c[0]==1:true}});
const sunkShips=sk=>{let t=0;return sk.map(cs=>{cs=cs.slice().sort((a,b)=>a-b);const len=cs.length,id=len==5?0:len==4?1:len==2?4:(t++?3:2);return{id,x:cs[0]%10,y:Math.floor(cs[0]/10),h:len>1?cs[1]-cs[0]==1:true}})};
const marksOf=a=>{const o={};a.forEach((v,i)=>{if(v)o[i]=v});return o};
function seaSvg(w,ships,marks){let s='<rect width="300" height="300" rx="10" fill="#38bdf8"/>';
 for(let i=1;i<10;i++)s+='<path d="M'+i*CS+' 0V300M0 '+i*CS+'H300" stroke="#ffffff66" stroke-width="1.5"/>';
 for(const o of ships)s+='<g transform="'+(o.h?'translate('+o.x*CS+','+o.y*CS+')':'translate('+(o.x+1)*CS+','+o.y*CS+') rotate(90)')+'" opacity="'+(o.dim?.55:1)+'">'+shipSvg(o.id,SHN[o.id])+'</g>';
 for(const i in marks){const x=i%10*CS+CS/2,y=Math.floor(i/10)*CS+CS/2;s+=marks[i]==2?'<circle cx="'+x+'" cy="'+y+'" r="10" fill="#e5392f" stroke="#1a1a1a" stroke-width="2.5"/><circle cx="'+x+'" cy="'+y+'" r="4" fill="#ffc93c"/>':'<circle cx="'+x+'" cy="'+y+'" r="5" fill="#fff" stroke="#0e7490" stroke-width="2"/>'}
 return '<svg viewBox="-2 -2 304 304" width="100%" style="max-width:'+w+'px;display:block;margin:6px auto;border:3px solid #1a1a1a;border-radius:12px;background:#0e7490;touch-action:none">'+s+'</svg>'}
const cellAt=(e,box)=>{const sv=box.querySelector('svg'),r=sv.getBoundingClientRect(),k=304/r.width;return[Math.floor(((e.clientX-r.left)*k-2)/CS),Math.floor(((e.clientY-r.top)*k-2)/CS)]};
const BR={
c4(d,me,mine){const W=50;const cells=d.g.map((v,i)=>{const r=Math.floor(i/7),c=i%7,cx=c*W+W/2+5,cy=r*W+W/2+5,col=v<0?'#fff6e0':v==me?'#e5392f':'#2563c9',hl=d.line&&d.line.includes(i);const dc='<circle cx="'+cx+'" cy="'+cy+'" r="20" fill="'+col+'" stroke="'+(hl?'#ffc93c':'#1a1a1a')+'" stroke-width="'+(hl?6:3)+'"/>'+(i==d.last?'<circle cx="'+cx+'" cy="'+cy+'" r="7" fill="none" stroke="#fff" stroke-width="3"/>':'');return i==d.last?'<g><animateTransform attributeName="transform" type="translate" from="0 -'+(cy+30)+'" to="0 0" dur=".4s" calcMode="spline" keyTimes="0;1" keySplines=".3 0 .7 1" fill="freeze"/>'+dc+'</g>':dc}).join('');
 $('#bb').innerHTML='<svg viewBox="0 0 360 310" width="100%" style="max-width:360px"><rect x="2" y="2" width="356" height="306" rx="16" fill="#f4a261" stroke="#1a1a1a" stroke-width="4"/>'+cells+[0,1,2,3,4,5,6].map(c=>'<rect data-c="'+c+'" x="'+(c*W+5)+'" y="0" width="'+W+'" height="310" fill="transparent" style="cursor:pointer"/>').join('')+'</svg>';
 $('#bb').querySelectorAll('rect[data-c]').forEach(e=>e.onpointerdown=()=>{if(mine&&d.win==null)send({t:'in',c:+e.dataset.c})})},
gomoku(d,me,mine){const N=13,S=26,P=18,L=(N-1)*S+2*P;let s='<rect x="2" y="2" width="'+(L-4)+'" height="'+(L-4)+'" rx="12" fill="#f4d9a0" stroke="#1a1a1a" stroke-width="4"/>';
 for(let i=0;i<N;i++){const p=P+i*S;s+='<path d="M'+P+' '+p+'H'+(L-P)+'M'+p+' '+P+'V'+(L-P)+'" stroke="#1a1a1a" stroke-width="1.5"/>'}
 d.g.forEach((v,i)=>{if(v<0)return;const x=P+(i%N)*S,y=P+Math.floor(i/N)*S,hl=d.line&&d.line.includes(i);s+='<circle cx="'+x+'" cy="'+y+'" r="11" fill="'+(v==me?'#e5392f':'#2563c9')+'" stroke="'+(hl?'#ffc93c':'#1a1a1a')+'" stroke-width="'+(hl?5:2.5)+'">'+(i==d.last?'<animate attributeName="r" from="2" to="11" dur=".18s" fill="freeze"/>':'')+'</circle>'+(i==d.last?'<circle cx="'+x+'" cy="'+y+'" r="4" fill="#fff"/>':'')});
 $('#bb').innerHTML='<svg id="gsv" viewBox="0 0 '+L+' '+L+'" width="100%" style="max-width:380px">'+s+'</svg>';
 $('#gsv').onpointerdown=e=>{if(!mine||d.win!=null)return;const r=e.currentTarget.getBoundingClientRect(),k=L/r.width,x=Math.round(((e.clientX-r.left)*k-P)/S),y=Math.round(((e.clientY-r.top)*k-P)/S);if(x>=0&&x<N&&y>=0&&y<N&&d.g[y*N+x]<0)send({t:'in',x,y})}},
dots(d,me,mine){const S=56,P=22,L=5*S+2*P,col=v=>v==me?'#e5392f':'#2563c9';let s='';
 d.b.forEach((v,i)=>{if(v<0)return;const r=Math.floor(i/5),c=i%5;s+='<rect x="'+(P+c*S+4)+'" y="'+(P+r*S+4)+'" width="'+(S-8)+'" height="'+(S-8)+'" rx="6" fill="'+col(v)+'" opacity=".45"/>'});
 const ln=(k,r,c,v)=>{const x1=P+c*S,y1=P+r*S,x2=k=='h'?x1+S:x1,y2=k=='h'?y1:y1+S,last=d.last&&d.last[0]==k&&d.last[1]==r&&d.last[2]==c;
  return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(v<0?'#1a1a1a22':col(v))+'" stroke-width="'+(v<0?4:last?10:7)+'" stroke-linecap="round"/>'+(v<0?'<line data-k="'+k+'" data-r="'+r+'" data-c="'+c+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="transparent" stroke-width="30" stroke-linecap="round" style="cursor:pointer"/>':'')};
 for(let r=0;r<6;r++)for(let c=0;c<5;c++)s+=ln('h',r,c,d.h[r*5+c]);for(let r=0;r<5;r++)for(let c=0;c<6;c++)s+=ln('v',r,c,d.v[r*6+c]);
 for(let r=0;r<6;r++)for(let c=0;c<6;c++)s+='<circle cx="'+(P+c*S)+'" cy="'+(P+r*S)+'" r="6" fill="#1a1a1a"/>';
 const a=d.b.filter(v=>v==me).length,z=d.b.filter(v=>v>=0&&v!=me).length;
 $('#bb').innerHTML='<div class="L" style="font-size:20px">You '+a+' – '+z+' '+on.opp+'</div><svg viewBox="0 0 '+L+' '+L+'" width="100%" style="max-width:340px">'+s+'</svg>';
 $('#bb').querySelectorAll('[data-k]').forEach(e=>e.onpointerdown=()=>{if(mine&&d.win==null)send({t:'in',k:e.dataset.k,r:+e.dataset.r,c:+e.dataset.c})})},
uttt(d,me,mine){let h='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:340px;margin:0 auto">';
 for(let b=0;b<9;b++){const w=d.w[b],act=mine&&d.win==null&&w<0&&(d.nx<0||d.nx==b);
  h+='<div style="position:relative;border:4px solid '+(act?'#ffc93c':'#1a1a1a')+';border-radius:10px;background:'+(act?'#fff3c4':'#fff6e0')+';padding:0;overflow:hidden;display:grid;grid-template-columns:repeat(3,1fr);gap:0">';
  for(let c=0;c<9;c++){const v=d.c[b*9+c],i=b*9+c;h+='<button data-b="'+b+'" data-c="'+c+'" style="height:34px;border:0;border-right:'+(c%3<2?'2px solid #1a1a1a':'0')+';border-bottom:'+(c<6?'2px solid #1a1a1a':'0')+';background:'+(i==d.last?'#ffe08a':'transparent')+';font:400 22px \'Lilita One\',sans-serif;color:'+(v==me?'#e5392f':'#2563c9')+';padding:0">'+(v<0?'':v==me?'X':'O')+'</button>'}
  if(w==0||w==1)h+='<div style="position:absolute;left:0;top:0;right:0;bottom:0;background:'+(w==me?'#e5392fdd':'#2563c9dd')+';border-radius:6px;color:#fff6e0;font:400 64px/1 \'Lilita One\',sans-serif;display:flex;align-items:center;justify-content:center;pointer-events:none">'+(w==me?'X':'O')+'</div>';else if(w==2)h+='<div style="position:absolute;left:0;top:0;right:0;bottom:0;background:#999c;border-radius:6px;pointer-events:none"></div>';
  h+='</div>'}
 $('#bb').innerHTML=h+'</div>';
 $('#bb').querySelectorAll('button').forEach(e=>e.onpointerdown=()=>{if(mine&&d.win==null)send({t:'in',b:+e.dataset.b,c:+e.dataset.c})})},
sea(d,me,mine){
 if(d.ph=='place'){if(!X.fl)X.fl=randFleet();const done=d.rdy[me];
  $('#bb').innerHTML='<div class="L" style="font-size:18px">'+(done?'Fleet ready!':'Drag ships to move · tap a ship to rotate')+'</div><div id="sw"></div>'+(done?'':'<button class="b" id="rnd">RANDOM</button><button class="b" id="rdy" style="background:#e5392f;color:#fff6e0">READY!</button>');
  const sw=$('#sw'),draw=()=>{sw.innerHTML=seaSvg(330,X.fl,{})};draw();if(done)return;
  sw.onpointerdown=e=>{const[cx,cy]=cellAt(e,sw),o=X.fl.find(p=>cellsOf(p).includes(cy*10+cx));if(!o)return;X.dg={o,ox:cx-o.x,oy:cy-o.y,mv:0};try{sw.setPointerCapture(e.pointerId)}catch(x){}if(e.preventDefault)e.preventDefault()};
  sw.onpointermove=e=>{const g=X.dg;if(!g)return;const[cx,cy]=cellAt(e,sw),n={...g.o,x:cx-g.ox,y:cy-g.oy};if((n.x!=g.o.x||n.y!=g.o.y)&&fitOk(X.fl,n)){g.o.x=n.x;g.o.y=n.y;g.mv=1;draw()}};
  sw.onpointerup=()=>{const g=X.dg;X.dg=null;if(!g||g.mv)return;const o=g.o;for(const[dx,dy]of[[0,0],[-1,0],[1,0],[0,-1],[0,1],[-2,0],[0,-2],[-3,0],[0,-3],[-4,0],[0,-4]]){const t={...o,h:!o.h,x:o.x+dx,y:o.y+dy};if(fitOk(X.fl,t)){o.h=t.h;o.x=t.x;o.y=t.y;draw();snd('pop');return}}};
  $('#rnd').onpointerdown=()=>{X.fl=randFleet();draw()};
  $('#rdy').onpointerdown=()=>send({t:'in',place:X.fl.map(o=>({id:o.id,x:o.x,y:o.y,h:o.h})),ready:1});return}
 const my=fleetFromBoard(d.mine).map(o=>{o.dim=cellsOf(o).every(i=>d.eshot[i]==2);return o});
 $('#bb').innerHTML='<div class="L" style="font-size:18px">Enemy waters · sunk '+d.sunk.length+'/5</div><div id="ew">'+seaSvg(330,sunkShips(d.sunk),marksOf(d.myshot))+'</div><div class="L" style="font-size:18px">Your fleet · lost '+d.esunk+'/5</div>'+seaSvg(210,my,marksOf(d.eshot));
 $('#ew').onpointerdown=e=>{if(!mine||d.win!=null)return;const[cx,cy]=cellAt(e,$('#ew'));if(cx>=0&&cx<10&&cy>=0&&cy<10&&!d.myshot[cy*10+cx])send({t:'in',x:cx,y:cy})}}
};
function bs(d){const me=d.ids.indexOf(pid),mine=d.turn==me,pl=cur=='sea'&&d.ph=='place';
 if(!$('#bb')){$('#gm').innerHTML='<div class="sc" id="st"></div><div id="bb"></div>';const c=$('#cd');if(c)c.textContent=''}
 $('#st').textContent=d.win!=null?(d.win==me?'You win!':on.opp+' wins!'):pl?(d.rdy[me]?'Waiting for '+on.opp+'…':'Arrange your fleet'):mine?'YOUR TURN':on.opp+' is thinking…';
 $('#st').className='sc'+(mine&&d.win==null&&!pl?' myturn':'');
 BR[cur](d,me,mine);
 const k=d.turn+'|'+(d.last==null?'':JSON.stringify(d.last))+'|'+(d.myshot?d.myshot.join('').length+d.myshot.reduce((a,b)=>a+b,0):'');
 const hits=d.myshot?d.myshot.concat(d.eshot).filter(v=>v==2).length:0;
 if(X.key!==undefined&&X.key!==k){snd(cur=='sea'?(hits>(X.hits||0)?'boom':'splash'):({c4:'drop',gomoku:'stone',dots:'tap',uttt:'pop'})[cur]);vib(10)}X.key=k;X.hits=hits}
