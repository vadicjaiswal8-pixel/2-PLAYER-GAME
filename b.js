// Board game renderers (client). Uses globals from index.html: $, pid, cur, on, X, send, snd, vib
const BG={c4:1,gomoku:1,dots:1,uttt:1,sea:1};
const BR={
c4(d,me,mine){const W=50;const cells=d.g.map((v,i)=>{const r=Math.floor(i/7),c=i%7,cx=c*W+W/2+5,cy=r*W+W/2+5,col=v<0?'#fff6e0':v==me?'#e5392f':'#2563c9',hl=d.line&&d.line.includes(i);return '<circle cx="'+cx+'" cy="'+cy+'" r="20" fill="'+col+'" stroke="'+(hl?'#ffc93c':'#1a1a1a')+'" stroke-width="'+(hl?6:3)+'"/>'+(i==d.last?'<circle cx="'+cx+'" cy="'+cy+'" r="7" fill="none" stroke="#fff" stroke-width="3"/>':'')}).join('');
 $('#bb').innerHTML='<svg viewBox="0 0 360 310" width="100%" style="max-width:360px"><rect x="2" y="2" width="356" height="306" rx="16" fill="#f4a261" stroke="#1a1a1a" stroke-width="4"/>'+cells+[0,1,2,3,4,5,6].map(c=>'<rect data-c="'+c+'" x="'+(c*W+5)+'" y="0" width="'+W+'" height="310" fill="transparent" style="cursor:pointer"/>').join('')+'</svg>';
 $('#bb').querySelectorAll('rect[data-c]').forEach(e=>e.onpointerdown=()=>{if(mine&&d.win==null)send({t:'in',c:+e.dataset.c})})},
gomoku(d,me,mine){const N=13,S=26,P=18,L=(N-1)*S+2*P;let s='<rect x="2" y="2" width="'+(L-4)+'" height="'+(L-4)+'" rx="12" fill="#f4d9a0" stroke="#1a1a1a" stroke-width="4"/>';
 for(let i=0;i<N;i++){const p=P+i*S;s+='<path d="M'+P+' '+p+'H'+(L-P)+'M'+p+' '+P+'V'+(L-P)+'" stroke="#1a1a1a" stroke-width="1.5"/>'}
 d.g.forEach((v,i)=>{if(v<0)return;const x=P+(i%N)*S,y=P+Math.floor(i/N)*S,hl=d.line&&d.line.includes(i);s+='<circle cx="'+x+'" cy="'+y+'" r="11" fill="'+(v==me?'#e5392f':'#2563c9')+'" stroke="'+(hl?'#ffc93c':'#1a1a1a')+'" stroke-width="'+(hl?5:2.5)+'"/>'+(i==d.last?'<circle cx="'+x+'" cy="'+y+'" r="4" fill="#fff"/>':'')});
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
uttt(d,me,mine){let h='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:340px;margin:0 auto">';
 for(let b=0;b<9;b++){const w=d.w[b],act=mine&&d.win==null&&w<0&&(d.nx<0||d.nx==b);
  h+='<div style="position:relative;border:3px solid '+(act?'#ffc93c':'#1a1a1a')+';border-radius:10px;background:'+(act?'#fff3c4':'#fff6e0')+';padding:2px;display:grid;grid-template-columns:repeat(3,1fr);gap:1px">';
  for(let c=0;c<9;c++){const v=d.c[b*9+c],i=b*9+c;h+='<button data-b="'+b+'" data-c="'+c+'" style="height:34px;border:0;background:'+(i==d.last?'#ffe08a':'transparent')+';font:400 22px \'Lilita One\',sans-serif;color:'+(v==me?'#e5392f':'#2563c9')+';padding:0">'+(v<0?'':v==me?'X':'O')+'</button>'}
  if(w==0||w==1)h+='<div style="position:absolute;left:0;top:0;right:0;bottom:0;background:'+(w==me?'#e5392fdd':'#2563c9dd')+';border-radius:6px;color:#fff6e0;font:400 64px/1 \'Lilita One\',sans-serif;display:flex;align-items:center;justify-content:center;pointer-events:none">'+(w==me?'X':'O')+'</div>';else if(w==2)h+='<div style="position:absolute;left:0;top:0;right:0;bottom:0;background:#999c;border-radius:6px;pointer-events:none"></div>';
  h+='</div>'}
 $('#bb').innerHTML=h+'</div>';
 $('#bb').querySelectorAll('button').forEach(e=>e.onpointerdown=()=>{if(mine&&d.win==null)send({t:'in',b:+e.dataset.b,c:+e.dataset.c})})},
sea(d,me,mine){const sunk=new Set(d.sunk.flat()),dim='<span style="color:#0e7490">•</span>';
 const grid=(fn,click,w)=>{let h='<div style="display:grid;grid-template-columns:repeat(10,1fr);gap:2px;width:'+w+'px;max-width:100%;margin:6px auto;border:3px solid #1a1a1a;border-radius:10px;padding:3px;background:#0e7490">';for(let i=0;i<100;i++){const[bg,tx]=fn(i);h+='<div '+(click?'data-i="'+i+'" ':'')+'style="aspect-ratio:1;background:'+bg+';border-radius:3px;display:flex;align-items:center;justify-content:center;font:400 '+(click?15:10)+'px \'Lilita One\',sans-serif;color:#fff">'+tx+'</div>'}return h+'</div>'};
 const myF=i=>d.eshot[i]==2?['#e5392f','✕']:d.eshot[i]==1?['#e0f2fe',dim]:d.mine[i]>=0?['#334155','']:['#38bdf8',''];
 const enF=i=>sunk.has(i)?['#7f1d1d','✕']:d.myshot[i]==2?['#e5392f','✕']:d.myshot[i]==1?['#e0f2fe',dim]:['#38bdf8',''];
 if(d.ph=='place'){$('#bb').innerHTML='<div class="L" style="font-size:20px">Your fleet</div>'+grid(myF,0,300)+(d.rdy[me]?'':'<button class="b" id="shf">SHUFFLE</button><button class="b" id="rdy" style="background:#e5392f;color:#fff6e0">READY!</button>');
  const s=$('#shf'),r=$('#rdy');if(s)s.onpointerdown=()=>send({t:'in',rand:1});if(r)r.onpointerdown=()=>send({t:'in',ready:1});return}
 $('#bb').innerHTML='<div class="L" style="font-size:18px">Enemy waters · sunk '+d.sunk.length+'/5</div>'+grid(enF,1,330)+'<div class="L" style="font-size:18px">Your fleet · lost '+d.esunk+'/5</div>'+grid(myF,0,200);
 $('#bb').querySelectorAll('[data-i]').forEach(e=>e.onpointerdown=()=>{const i=+e.dataset.i;if(mine&&d.win==null&&!d.myshot[i])send({t:'in',x:i%10,y:Math.floor(i/10)})})}
};
function bs(d){const me=d.ids.indexOf(pid),mine=d.turn==me,pl=cur=='sea'&&d.ph=='place';
 if(!$('#bb')){$('#gm').innerHTML='<div class="sc" id="st"></div><div id="bb"></div>';const c=$('#cd');if(c)c.textContent=''}
 $('#st').textContent=d.win!=null?(d.win==me?'You win!':on.opp+' wins!'):pl?(d.rdy[me]?'Waiting for '+on.opp+'…':'Arrange your fleet'):mine?'YOUR TURN':on.opp+' is thinking…';
 BR[cur](d,me,mine);
 const k=d.turn+'|'+(d.last==null?'':JSON.stringify(d.last))+'|'+(d.myshot?d.myshot.join('').length+d.myshot.reduce((a,b)=>a+b,0):'');
 if(X.key!==undefined&&X.key!==k){snd(mine?'point':'pop');vib(10)}X.key=k}
