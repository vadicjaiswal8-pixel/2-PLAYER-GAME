// ---- Tussle meta layer: settings, music, tutorial, emotes, stats, stars/levels, daily challenge, looks ----
// Loaded before the main script. Everything lives in the Meta namespace. Uses main-script globals at call time.
const Meta=(function(){
const KEY='tussle.v1',DEF={sfx:1,sfxV:.8,mus:1,musV:.4,vib:1,tut:0,gift:0,stars:0,earned:0,hat:'',theme:'',own:['night'],
 st:{p:0,w:0,l:0,t:0,cur:0,best:0,g:{},bot:[[0,0],[0,0],[0,0]],fr:[0,0],vs:{}},dy:{last:'',streak:0,doneOn:''}};
let ST;
function load(){let o={};try{o=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
 ST=Object.assign({},JSON.parse(JSON.stringify(DEF)),o);ST.st=Object.assign(JSON.parse(JSON.stringify(DEF.st)),o.st||{});ST.dy=Object.assign({},DEF.dy,o.dy||{});
 if(!o.sfx&&o.sfx!==0&&localStorage.mute=='1'){ST.sfx=0;ST.mus=0}}
function sv(){try{localStorage.setItem(KEY,JSON.stringify(ST))}catch(e){}}
load();

// ---------- levels ----------
const TITLES=['Rookie','Scrapper','Brawler','Contender','Champ','Hero','Legend'];
const need=l=>5*l*(l-1);                       // cumulative stars earned to reach level l
function lvInfo(e){let l=1;while(e>=need(l+1))l++;const a=need(l),b=need(l+1);return{l,title:TITLES[Math.min(l-1,6)],cur:e-a,span:b-a,pct:Math.round((e-a)/(b-a)*100)}}
const lvl0=()=>lvInfo(ST.earned).l;

// ---------- items ----------
const HATS=[['cap','Sun Cap',5,1],['beanie','Beanie',10,1],['chef','Chef Hat',15,2],['band','Ninja Band',20,2],['cowboy','Cowboy',30,3],['viking','Viking',40,4],['wizard','Wizard',60,5]];
const THEMES=[['','Classic',0,1,'#f4ead5','#1a1a1a1f','#1a1a1a'],['night','Night',0,1,'#2b2f5b','#ffffff1c','#fff6e0'],['sunset','Sunset',25,2,'linear-gradient(#ffc08f,#ff9fb7)','#ffffff33','#1a1a1a'],['mint','Mint',25,3,'#c3ecd9','#1a1a1a1a','#1a1a1a']];

// ---------- audio (master gains) ----------
let SG=null,MG=null;
function audioNodes(c){if(SG)return;SG=c.createGain();MG=c.createGain();SG.connect(c.destination);MG.connect(c.destination);audioApply()}
function audioApply(){if(!SG)return;SG.gain.value=ST.sfx?ST.sfxV:0;musGain()}
const sfxOut=()=>SG;
let mT=0,mNext=0,mStep=0,mOn=0;
const hz=m=>440*Math.pow(2,(m-69)/12);
const CH=[[48,[60,64,67]],[45,[57,60,64]],[41,[57,60,65]],[43,[55,59,62]]];   // C Am F G : bass, triad
function mt(f,t,d,type,v){const c=AC,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(MG);o.start(t);o.stop(t+d+.05)}
function mhat(t){const c=AC,n=Math.floor(c.sampleRate*.04),b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type='highpass';f.frequency.value=7000;g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+.04);s.connect(f);f.connect(g);g.connect(MG);s.start(t)}
const E=60/92/2;                                                              // eighth note @92bpm
function musSched(){if(!mOn||!AC||!MG)return;while(mNext<AC.currentTime+.35){const bar=Math.floor(mStep/8)%4,k=mStep%8,ch=CH[bar],t=mNext;
  if(k==0||k==4)mt(hz(ch[0]),t,E*3.6,'sine',.5);
  if(k==0)ch[1].forEach(n=>mt(hz(n-12),t,E*7.5,'triangle',.07));
  mt(hz(ch[1][[0,1,2,1,2,1,2,1][k]]+12),t,E*1.6,'triangle',.11);
  if(k%2==1)mhat(t);
  if(k==2||k==6){if(Math.random()<.55)mt(hz(ch[1][Math.floor(Math.random()*3)]+24),t+.01,E*1.3,'sine',.08)}
  mNext+=E;mStep++}}
function musGain(){if(!MG||!AC)return;const want=ST.mus&&mOn?ST.musV*.5:0;MG.gain.setTargetAtTime(want,AC.currentTime,.25)}
function musSync(){const want=!!(ST.mus&&ST.musV>0&&typeof view!='undefined'&&view!='play'&&!document.hidden&&AC&&AC.state=='running');
 if(want&&!mOn){mOn=1;mNext=AC.currentTime+.1;mStep=0;clearInterval(mT);mT=setInterval(musSched,120);musSched()}
 else if(!want&&mOn){mOn=0;setTimeout(()=>{if(!mOn)clearInterval(mT)},900)}
 musGain()}
document.addEventListener('visibilitychange',()=>{if(typeof AC!='undefined'&&AC){if(document.hidden)AC.suspend().catch(()=>{});else AC.resume().catch(()=>{})}setTimeout(musSync,250)});

// ---------- small ui helpers ----------
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(m,ms){const e=document.getElementById('tt');if(!e)return;e.textContent=m;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>{e.style.display='none'},ms||2200)}
function modal(html,id){close(id);const d=document.createElement('div');d.className='mdl';d.id=id||'md';d.innerHTML='<div class="qb" style="max-height:88vh;overflow:auto">'+html+'</div>';d.addEventListener('pointerdown',e=>{if(e.target==d&&id!='tut')close(id)});document.body.appendChild(d);return d}
function close(id){const m=document.getElementById(id||'md');if(m)m.remove()}
const star=(s)=>'<svg viewBox="0 0 24 24" width="'+(s||18)+'" height="'+(s||18)+'" style="vertical-align:-3px"><path d="M12 2.5l2.9 6.2 6.7.8-5 4.6 1.4 6.7L12 17.3 6 20.8l1.4-6.7-5-4.6 6.7-.8z" fill="#ffc93c" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/></svg>';
const todayS=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const yestS=()=>{const d=new Date();d.setDate(d.getDate()-1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function myHead(sz,bg){return '<span class="av" style="background:'+(bg||'#fff6e0')+';overflow:hidden;width:'+sz+'px;height:'+sz+'px"><svg viewBox="8 -14 84 84" width="'+sz+'" height="'+sz+'">'+mascotSvg('#e5392f',{mood:'angry'})+'</svg></span>'}

// ---------- theme ----------
function theme(){const t=THEMES.find(x=>x[0]==ST.theme)||THEMES[0],b=document.body;b.style.background=t[4]+' radial-gradient('+t[5]+' 1.2px,transparent 1.5px) 0 0/14px 14px';b.style.backgroundAttachment='fixed';b.style.color=t[6];
 const m=document.querySelector('meta[name=theme-color]');if(m)m.content=t[4].indexOf('gradient')>0?'#ffb0a0':t[4]}

// ---------- settings ----------
function toggleRow(label,key,sub){return '<div class="strow"><div><b>'+label+'</b>'+(sub?'<br><small>'+sub+'</small>':'')+'</div><button class="sw'+(ST[key]?' on':'')+'" onclick="Meta.set(\''+key+'\')" aria-label="'+label+'"><i></i></button></div>'}
function sliderRow(label,key){return '<div class="strow" style="margin-top:-4px"><input type="range" min="0" max="1" step=".05" value="'+ST[key]+'" oninput="Meta.vol(\''+key+'\',this.value)" aria-label="'+label+' volume"></div>'}
function settings(){modal('<h2 style="margin:0 0 6px">Settings</h2>'+toggleRow('Sound effects','sfx')+sliderRow('Sound effects','sfxV')+toggleRow('Music','mus','Calm menu music')+sliderRow('Music','musV')+toggleRow('Vibration','vib','Phones only')
 +'<button class="b" style="width:100%;margin:10px 0 4px;background:#cbd5e1" onclick="Meta.close(\'md\');Meta.tutorial(1)">HOW TUSSLE WORKS</button><button class="b" style="width:100%;margin:4px 0;background:#e9967a" onclick="Meta.reset()">RESET MY PROGRESS</button><button class="b cta" style="height:52px;font-size:22px" onclick="Meta.close(\'md\')">DONE</button>','md')}
function set(k){ST[k]=ST[k]?0:1;sv();audioApply();if(k=='sfx'&&ST.sfx)snd('pop');if(k=='vib'&&ST.vib&&navigator.vibrate)try{navigator.vibrate(30)}catch(e){}if(k=='mus'&&ST.mus)ac();musSync();const m=document.getElementById('md');if(m)settings();syncMt()}
function vol(k,v){ST[k]=+v;sv();audioApply();if(k=='musV'){ac();musSync()}else{clearTimeout(vol.t);vol.t=setTimeout(()=>snd('pop'),120)}}
function reset(){modal('<h2 style="margin:0 0 6px">Reset progress?</h2><p style="margin:6px 0 12px">This clears your stars, level, stats, looks and daily streak on this device. It cannot be undone.</p><button class="b" style="width:100%;background:#e5392f;color:#fff6e0" onclick="Meta.doReset()">YES, RESET</button><button class="b" style="width:100%;background:#cbd5e1" onclick="Meta.settings()">Cancel</button>','md')}
function doReset(){const keep={sfx:ST.sfx,sfxV:ST.sfxV,mus:ST.mus,musV:ST.musV,vib:ST.vib};ST=Object.assign(JSON.parse(JSON.stringify(DEF)),keep,{tut:1,gift:1});sv();theme();close('md');if(typeof home=='function')home();toast('Progress reset')}
function syncMt(){const b=document.getElementById('mt');if(b)b.innerHTML=(ST.sfx||ST.mus)?SPK1:SPK0}
function quickMute(){const on=ST.sfx||ST.mus;ST.sfx=on?0:1;ST.mus=on?0:1;sv();audioApply();if(!on)ac();musSync();syncMt();const m=document.getElementById('md');if(m)settings()}

// ---------- tutorial ----------
const TUC=[
 ()=>{const m=(x,c,mood)=>'<g transform="translate('+x+' 8) scale(.8)">'+mascotSvg(c,{mood,arms:'up'})+'</g>';return ['Welcome to Tussle!','Ten quick head-to-head mini games. Sumo, darts, archery, pizza, board games and more. First one to win the round takes the point.','<svg viewBox="0 0 220 120" width="220" height="120">'+m(24,'#e5392f','happy')+m(116,'#2563c9','happy')+'</svg>']},
 ()=>['Challenge a friend','Tap CHALLENGE A FRIEND and send the link on WhatsApp or anywhere. When they open it you are in the same room and can rematch as often as you like.','<svg viewBox="0 0 220 120" width="220" height="120"><g transform="translate(6 14) scale(.7)">'+mascotSvg('#e5392f',{mood:'angry'})+'</g><g transform="translate(144 14) scale(.7)">'+mascotSvg('#2563c9',{mood:'angry'})+'</g><path d="M82 52H138" stroke="#1a1a1a" stroke-width="5" stroke-dasharray="2 10" stroke-linecap="round"/><rect x="88" y="26" width="46" height="22" rx="11" fill="#fff6e0" stroke="#1a1a1a" stroke-width="3"/><text x="111" y="42" text-anchor="middle" font-family="Lilita One" font-size="14" fill="#1a1a1a">LINK</text></svg>'],
 ()=>['Or take on Rex','No friend around? Beat Rex the bot. Choose Easy, Medium or Hard. He talks a big game, so make him eat his words.','<svg viewBox="-4 -16 330 148" width="240" height="108"><g transform="translate(0 0)">'+rexSvg(0)+'</g><g transform="translate(110 0)">'+rexSvg(1)+'</g><g transform="translate(220 0)">'+rexSvg(2)+'</g></svg>'],
 ()=>['Win stars, get stylish','Every win earns stars. Spend them on hats and themes. Do the Daily Challenge on consecutive days for a growing streak bonus.','<svg viewBox="0 0 220 120" width="220" height="120"><g transform="translate(28 4) scale(.82)">'+mascotSvg('#e5392f',{mood:'happy',arms:'up',nohat:1})+hatSvg('wizard')+'</g><g transform="translate(136 14)"><path d="M32 4l9 19 20 2.4-15 14 4 20L32 50 14 59.4l4-20-15-14 20-2.4z" fill="#ffc93c" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/></g></svg>']];
function tutorial(replay,i){i=i||0;const last=TUC.length;let h;
 if(i<last){const c=TUC[i]();h='<div style="text-align:center"><div style="height:124px;display:flex;align-items:center;justify-content:center">'+c[2]+'</div><h2 style="margin:8px 0 6px;font-size:28px">'+c[0]+'</h2><p style="margin:0 0 12px;font-size:16px;line-height:1.35">'+c[1]+'</p></div>'}
 else h='<div style="text-align:center"><h2 style="margin:4px 0 6px;font-size:28px">What\'s your name?</h2><p style="margin:0 0 6px">This is what your opponent sees.</p><input id="tn" maxlength="14" placeholder="Your name" value="'+esc(typeof nm!='undefined'?nm:'')+'" oninput="nmIn(this.value)">'+((!ST.gift&&!replay)?'<div class="L" style="font-size:18px;margin:6px 0">Welcome gift: +5 '+star(18)+'</div>':'')+'</div>';
 const dots='<div style="display:flex;justify-content:center;gap:7px;margin:4px 0 8px">'+Array.from({length:last+1},(_,k)=>'<i style="width:10px;height:10px;border-radius:50%;border:2.5px solid #1a1a1a;background:'+(k==i?'#e5392f':'#fff6e0')+'"></i>').join('')+'</div>';
 const nx=i<last?'<button class="b cta" style="height:54px;font-size:23px" onclick="Meta.tutorial('+(replay?1:0)+','+(i+1)+')">NEXT</button>':'<button class="b cta" style="height:54px;font-size:23px" onclick="Meta.tutDone('+(replay?1:0)+')">LET\'S GO!</button>';
 const sk=i<last?'<button class="b" style="width:100%;margin:0;background:#cbd5e1;font-size:14px;min-height:38px;padding:4px" onclick="Meta.tutDone('+(replay?1:0)+',1)">Skip</button>':'';
 modal(h+dots+nx+sk,'tut')}
function tutDone(replay,skip){close('tut');ST.tut=1;if(!ST.gift&&!replay){ST.gift=1;ST.stars+=5;toast('+5 stars! Check the Looks shop',2600)}sv();if(typeof ui=='function')ui();
 if(!replay&&typeof nm!='undefined'&&!nm.trim()){setTimeout(()=>{const i=document.getElementById('nin');if(i)i.focus()},300)}}
function tutMaybe(){if(ST.tut)return;const q=new URLSearchParams(location.search).get('r');if(q||localStorage.room)return;tutorial(0,0)}

// ---------- emotes ----------
const EL=['GG!','Nice one!','Oops!','Rematch?','Wow!','Hurry up!'];
function emFace(i,col,sz){const I='#1a1a1a',S='stroke="'+I+'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';
 const eyes=['<path d="M10 17Q13 13 16 17M24 17Q27 13 30 17" fill="none" '+S+'/>','<path d="M13 12l1.6 3.4 3.6.4-2.7 2.4.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.4 3.6-.4z M27 12l1.6 3.4 3.6.4-2.7 2.4.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.4 3.6-.4z" transform="translate(-1 0)" fill="#ffc93c" stroke="'+I+'" stroke-width="1.6"/>','<circle cx="13" cy="17" r="2.6" fill="'+I+'"/><circle cx="27" cy="17" r="2.6" fill="'+I+'"/>','<path d="M8 12L17 17M32 12L23 17" '+S+'/><circle cx="13" cy="19" r="2.4" fill="'+I+'"/><circle cx="27" cy="19" r="2.4" fill="'+I+'"/>','<circle cx="13" cy="16" r="5" fill="#fff" '+S+'/><circle cx="27" cy="16" r="5" fill="#fff" '+S+'/><circle cx="13" cy="16" r="1.8" fill="'+I+'"/><circle cx="27" cy="16" r="1.8" fill="'+I+'"/>','<path d="M8 17H18M22 17H32" '+S+'/><path d="M8 13H18M22 13H32" stroke="'+col+'" stroke-width="4"/>'];
 const mouth=['<path d="M11 25Q20 36 29 25Z" fill="#7a1d1d" '+S+'/>','<path d="M12 26Q20 33 28 26" fill="none" '+S+'/>','<path d="M12 29Q16 24 20 28Q24 32 28 27" fill="none" '+S+'/><path d="M33 8Q36 13 33 15Q30 13 33 8Z" fill="#7dd3fc" stroke="'+I+'" stroke-width="1.6"/>','<path d="M13 28Q22 24 28 27" fill="none" '+S+'/>','<ellipse cx="20" cy="29" rx="3.6" ry="4.4" fill="#7a1d1d" '+S+'/>','<path d="M13 28H27" '+S+'/>'];
 return '<svg viewBox="0 0 40 40" width="'+sz+'" height="'+sz+'"><circle cx="20" cy="21" r="17" fill="'+col+'" stroke="'+I+'" stroke-width="3"/>'+eyes[i]+mouth[i]+'</svg>'}
let emT=0,emCd=0;
function emBtn(){let b=document.getElementById('et');if(!b){b=document.createElement('button');b.id='et';b.className='b';b.setAttribute('aria-label','Emotes');b.onclick=trayToggle;b.innerHTML=emFace(0,'#ffc93c',30);document.body.appendChild(b)}return b}
function emSync(){const b=emBtn(),v=typeof view!='undefined'&&(view=='play'||view=='res')&&typeof room!='undefined'&&room&&n>1;b.style.display=v?'flex':'none';if(!v)trayClose()}
function trayClose(){const t=document.getElementById('etray');if(t)t.remove()}
function trayToggle(){if(document.getElementById('etray'))return trayClose();const t=document.createElement('div');t.id='etray';t.innerHTML=EL.map((l,i)=>'<button class="em" onclick="Meta.emote('+i+')">'+emFace(i,'#e5392f',40)+'<span>'+l+'</span></button>').join('');document.body.appendChild(t)}
function emote(i){trayClose();if(Date.now()<emCd){toast('Easy there!',900);return}emCd=Date.now()+1600;send({t:'emote',e:i});snd('pop');const b=emBtn();b.innerHTML=emFace(i,'#ffc93c',30);b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}
function emGot(i){if(!(i>=0&&i<6))return;let b=document.getElementById('ebub');if(!b){b=document.createElement('div');b.id='ebub';document.body.appendChild(b)}
 b.innerHTML='<span style="flex:none;line-height:0">'+emFace(i,OC(),36)+'</span><span><small style="font-weight:900;opacity:.7">'+esc(on.opp||'Friend')+'</small><br>'+EL[i]+'</span>';b.style.display='flex';b.classList.remove('pop2');void b.offsetWidth;b.classList.add('pop2');snd('pop');vib(15);clearTimeout(emT);emT=setTimeout(()=>{b.style.display='none'},2400)}
document.addEventListener('pointerdown',e=>{const t=document.getElementById('etray');if(t&&!e.target.closest('#etray')&&!e.target.closest('#et'))trayClose()});

// ---------- stats / stars / daily ----------
const GN=g=>(G[g]||[g])[0];
function dailyDef(){const s=todayS();let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;h=Math.imul(h^h>>>15,2246822507)>>>0;return{g:GAMES10[h%GAMES10.length],lv:(h>>>8)%3,date:s}}
const DR=[4,5,6,8,10,12,20];
function dyStreak(){const d=ST.dy,t=todayS();return d.last==t||d.last==yestS()?d.streak:0}
const dyDone=()=>ST.dy.last==todayS();
function dyNext(){const s=dyDone()?ST.dy.streak:dyStreak()+1;return DR[(s-1)%7]}
function recRes(d){if(!d||d.win=='left'||!d.g)return null;
 const bot=isBot(),L=bot?rexLv():-1,s=ST.st,res=d.win=='me'?'w':d.win=='opp'?'l':'t';
 s.p++;if(res=='w'){s.w++;s.cur++;s.best=Math.max(s.best,s.cur)}else if(res=='l'){s.l++;s.cur=0}else s.t++;
 const g=s.g[d.g]=s.g[d.g]||[0,0,0];g[res=='w'?0:res=='l'?1:2]++;
 if(bot){const b=s.bot[L];b[0]++;if(res=='w')b[1]++}else{s.fr[0]++;if(res=='w')s.fr[1]++;if(d.op){const v=s.vs[d.op]=s.vs[d.op]||{n:on.opp||'Friend',w:0,l:0,t:0,ts:0};v.n=on.opp||v.n;v[res]++;v.ts=Date.now()}}
 let gain=res=='w'?(bot?[1,2,3][L]:d.left?1:3):res=='t'?1:(bot?0:1);
 const out={gain,lvUp:0,daily:null},before=lvl0();
 const dl=dailyDef();if(res=='w'&&bot&&d.g==dl.g&&L>=dl.lv&&!dyDone()){const dy=ST.dy;dy.streak=dy.last==yestS()?dy.streak+1:1;dy.last=todayS();const r=DR[(dy.streak-1)%7];gain+=r;out.daily={reward:r,streak:dy.streak}}
 out.gain=gain;ST.stars+=gain;ST.earned+=gain;const after=lvl0();if(after>before)out.lvUp=after;sv();return out}
function recQuit(){if(typeof isBot=='function'&&isBot())return;const s=ST.st;s.p++;s.l++;s.cur=0;sv()}
function rwH(r){if(!r)return'';let h='<div class="pill" style="box-shadow:none;margin:6px auto;max-width:300px">'+(r.gain?'<span class="L" style="font-size:24px">+'+r.gain+' '+star(24)+'</span>':'<span style="font-size:15px">No stars this time. Beat Rex to earn them!</span>');
 if(r.daily)h+='<br><b style="color:#2f9e5b">Daily challenge complete! Day '+r.daily.streak+' streak</b>';
 if(r.lvUp)h+='<br><b style="color:#e5392f">LEVEL UP! Lv '+r.lvUp+' '+TITLES[Math.min(r.lvUp-1,6)]+'</b>';return h+'</div>'}

// ---------- home widgets ----------
function dailyCard(){const dl=dailyDef(),done=dyDone(),st=dyStreak(),pos=st%7,lvN=['Easy','Medium','Hard'][dl.lv];
 const dots=Array.from({length:7},(_,i)=>{const f=done?i<((ST.dy.streak-1)%7+1):i<pos;return '<span style="display:inline-flex;flex-direction:column;align-items:center;font:900 10px Nunito"><i style="width:22px;height:22px;border:3px solid #1a1a1a;border-radius:50%;background:'+(f?'#2f9e5b':i==(done?-1:pos)?'#ffc93c':'#fff6e0')+';display:block"></i>'+DR[i]+'</span>'}).join('');
 return '<div class="board" style="margin:14px 0 4px;text-align:left;background:#fff3b0"><div style="display:flex;align-items:center;gap:10px"><div style="flex:none;transform:scale(.55);width:50px;height:50px;transform-origin:left top;margin-right:4px">'+G[dl.g][4]+'</div><div style="flex:1;min-width:0"><div class="L" style="font-size:18px">DAILY CHALLENGE</div><div style="font-size:15px">Beat <b>Rex ('+lvN+')</b> at <b>'+GN(dl.g)+'</b></div></div></div><div style="display:flex;justify-content:space-between;margin:8px 4px 6px">'+dots+'</div>'
 +(done?'<div class="L" style="font-size:17px;color:#2f9e5b;text-align:center">DONE! Back tomorrow to keep your '+ST.dy.streak+'-day streak</div>':'<button class="b cta" style="height:50px;font-size:21px;margin:2px 0" onclick="Meta.playDaily()">PLAY · +'+dyNext()+' '+star(20)+'</button>')+'</div>'}
function playDaily(){const dl=dailyDef();if(room&&n>1&&!isBot()){msg='Your friend is in this room. Leave it to play the daily challenge.';ui();return}lvl=dl.lv;selG=dl.g;playBot(dl.g)}
function playerCard(){const li=lvInfo(ST.earned);
 return '<div class="me" style="padding:5px 8px 5px 5px"><button class="b" style="margin:0;padding:0;min-height:0;border:0;box-shadow:none;background:none;display:flex" onclick="Meta.go(\'prof\')" aria-label="Profile">'+myHead(46)+'</button><input id="nin" maxlength="14" placeholder="Your name" value="'+esc(nm)+'" oninput="nmIn(this.value)"><button class="b" style="margin:0;padding:3px 9px;min-height:34px;font-size:15px;border-width:3px;box-shadow:2px 2px 0 #1a1a1a;white-space:nowrap" onclick="Meta.go(\'shop\')">Lv '+li.l+' · '+ST.stars+' '+star(16)+'</button></div>'}
function quickRow(){return '<div style="display:flex;gap:8px;margin:6px 0 0"><button class="b" style="flex:1;margin:0;background:#cbd5e1;font-size:16px" onclick="Meta.go(\'prof\')">MY STATS</button><button class="b" style="flex:1;margin:0;background:#ffc93c;font-size:16px" onclick="Meta.go(\'shop\')">LOOKS SHOP</button></div>'}
function go(v){view=v;ui()}

// ---------- profile ----------
function profile(){const s=ST.st,li=lvInfo(ST.earned),wr=s.p?Math.round(s.w/s.p*100):0;
 const box=(a,b)=>'<div class="pill" style="margin:0;padding:8px 4px;box-shadow:2px 2px 0 #1a1a1a"><div class="L" style="font-size:26px">'+a+'</div><small>'+b+'</small></div>';
 const rows=GAMES10.map(g=>{const r=s.g[g]||[0,0,0],t=r[0]+r[1]+r[2];return '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-top:2px dashed #1a1a1a33"><div style="width:34px;height:34px;flex:none;overflow:hidden"><div style="transform:scale(.42);transform-origin:0 0">'+G[g][4]+'</div></div><div style="flex:1;text-align:left">'+GN(g)+'</div><div style="font-weight:900">'+(t?r[0]+' W · '+r[1]+' L'+(r[2]?' · '+r[2]+' T':''):'<span style="opacity:.5">not played</span>')+'</div></div>'}).join('');
 const lvN=['Sleepy Rex','Rex','King Rex'],bots=s.bot.map((b,i)=>'<div style="display:flex;align-items:center;gap:8px;padding:3px 0"><svg viewBox="12 -16 76 76" width="34" height="34">'+rexSvg(i)+'</svg><div style="flex:1;text-align:left">'+lvN[i]+'</div><b>'+(b[0]?b[1]+' / '+b[0]+' won':'<span style="opacity:.5">not played</span>')+'</b></div>').join('');
 const fr=Object.keys(s.vs).map(k=>s.vs[k]).sort((a,b)=>b.ts-a.ts).slice(0,8).map(v=>'<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-top:2px dashed #1a1a1a33"><span class="av" style="background:#2563c9;width:34px;height:34px;font-size:17px">'+esc((v.n||'?')[0].toUpperCase())+'</span><div style="flex:1;text-align:left">'+esc(v.n)+'</div><b>'+v.w+' – '+v.l+(v.t?' – '+v.t:'')+'</b></div>').join('')||'<div style="opacity:.6;padding:6px 0">Play a friend to start a rivalry record.</div>';
 return '<div style="margin:6px 0"><svg viewBox="-12 -26 124 160" width="120" height="154" class="bnc2">'+mascotSvg('#e5392f',{mood:'happy',arms:'up'})+'</svg></div><h2 style="margin:0">'+esc(nm||'You')+'</h2><div class="L" style="font-size:20px">Lv '+li.l+' · '+li.title+'</div>'
 +'<div style="height:16px;border:3px solid #1a1a1a;border-radius:10px;background:#fff6e0;margin:6px auto;max-width:280px;overflow:hidden"><div style="height:100%;width:'+li.pct+'%;background:#2f9e5b"></div></div><small>'+li.cur+' / '+li.span+' stars to Lv '+(li.l+1)+'</small>'
 +'<div class="L" style="font-size:22px;margin:6px">'+ST.stars+' '+star(22)+' to spend</div>'
 +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0">'+box(s.p,'played')+box(s.w,'wins')+box(wr+'%','win rate')+box(s.cur,'streak')+'</div><small>Best win streak: <b>'+s.best+'</b></small>'
 +'<div class="board" style="margin-top:12px"><div class="L" style="font-size:19px;margin-bottom:4px">WINS BY GAME</div>'+rows+'</div>'
 +'<div class="board" style="margin-top:12px"><div class="L" style="font-size:19px;margin-bottom:4px">VS REX</div>'+bots+'</div>'
 +'<div class="board" style="margin-top:12px"><div class="L" style="font-size:19px;margin-bottom:4px">RIVALS</div>'+fr+'</div>'
 +'<small style="display:block;margin:6px">Stats are saved on this device.</small><button class="b" style="background:#e9967a" onclick="home()">Back</button>'}

// ---------- shop ----------
function itemCard(kind,it){const [id,name,price,lv]=it,have=kind=='hat'?ST.own.indexOf(id)>=0:(price==0||ST.own.indexOf(id)>=0),eq=(kind=='hat'?ST.hat:ST.theme)==id,lock=lvl0()<lv,can=ST.stars>=price;
 const art=kind=='hat'?'<svg viewBox="8 -24 84 94" width="64" height="70">'+mascotSvg('#e5392f',{mood:'angry',nohat:1})+hatSvg(id)+'</svg>':'<div style="width:64px;height:70px;border:3px solid #1a1a1a;border-radius:12px;background:'+it[4]+' radial-gradient('+it[5]+' 1.2px,transparent 1.5px) 0 0/10px 10px;display:flex;align-items:center;justify-content:center;font:400 14px Lilita One;color:'+it[6]+'">Aa</div>';
 const lab=eq?'<span style="color:#2f9e5b">EQUIPPED</span>':have?'EQUIP':lock?'Lv '+lv+' needed':price+' '+star(15);
 return '<button class="b k2" style="background:'+(eq?'#d9f5e3':have?'#fff6e0':lock?'#e5e1d6':'#fff3b0')+'" onclick="Meta.buy(\''+kind+'\',\''+id+'\')">'+art+'<span class="L" style="font-size:16px">'+name+'</span><span style="font-size:14px">'+lab+'</span></button>'}
function shop(){const none=ST.hat?'':'1';
 return '<h2 style="margin:6px 0 0">Looks Shop</h2><div class="L" style="font-size:22px;margin:2px 0 6px">'+ST.stars+' '+star(22)+' · Lv '+lvl0()+'</div><div style="margin:2px 0"><svg viewBox="-12 -26 124 160" width="104" height="134">'+mascotSvg('#e5392f',{mood:'happy',arms:'up'})+'</svg></div>'
 +'<div class="sec" style="margin-top:6px"><i style="background:#e5392f"></i>HATS</div><div class="shg">'+'<button class="b k2" style="background:'+(none?'#d9f5e3':'#fff6e0')+'" onclick="Meta.buy(\'hat\',\'\')"><div style="width:64px;height:70px;display:flex;align-items:center;justify-content:center;font:400 30px Lilita One">—</div><span class="L" style="font-size:16px">No hat</span><span style="font-size:14px">'+(none?'<span style="color:#2f9e5b">EQUIPPED</span>':'EQUIP')+'</span></button>'+HATS.map(h=>itemCard('hat',h)).join('')+'</div>'
 +'<div class="sec"><i style="background:#2563c9"></i>THEMES</div><div class="shg">'+THEMES.map(t=>itemCard('theme',t)).join('')+'</div><small style="display:block;margin:8px">Earn stars by winning. Level up to unlock more.</small><button class="b" style="background:#e9967a" onclick="home()">Back</button>'}
function buy(kind,id){const list=kind=='hat'?HATS:THEMES,it=list.find(x=>x[0]==id);
 if(!id&&kind=='hat'){ST.hat='';sv();snd('tap');return ui()}
 if(!it)return;const have=kind=='hat'?ST.own.indexOf(id)>=0:(it[2]==0||ST.own.indexOf(id)>=0);
 if(!have){if(lvl0()<it[3]){snd('bad');return toast('Reach Level '+it[3]+' to unlock '+it[1])}if(ST.stars<it[2]){snd('bad');return toast('Need '+(it[2]-ST.stars)+' more stars')}ST.stars-=it[2];ST.own.push(id);snd('win');confetti()}
 else snd('pop');
 if(kind=='hat')ST.hat=ST.hat==id?'':id;else ST.theme=ST.theme==id&&id?'':id;sv();theme();ui()}

// ---------- view hook (called from ui0) ----------
function view0(a){if(view=='prof'){a.innerHTML=profile();return 1}if(view=='shop'){a.innerHTML=shop();return 1}return 0}
function onView(){const g=document.getElementById('gt');if(g)g.style.display=(view=='play'||view=='intro')?'none':'flex';emSync();musSync()}
function boot(){theme();syncMt();const gt=document.createElement('button');gt.id='gt';gt.className='b';gt.setAttribute('aria-label','Settings');gt.onclick=settings;gt.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1a1a1a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2" fill="#ffc93c"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/></svg>';document.body.appendChild(gt);emBtn();onView();
 document.addEventListener('pointerdown',()=>{setTimeout(musSync,200)},{once:false,passive:true});setTimeout(tutMaybe,400)}
return{get st(){return ST},hat:()=>ST&&ST.hat,hatSvg:null,audioNodes,sfxOut,audioApply,musSync,set,vol,settings,reset,doReset,quickMute,syncMt,tutorial,tutDone,emote,emGot,emSync,recRes,recQuit,rwH,dailyCard,playDaily,playerCard,quickRow,go,view0,onView,boot,buy,close,toast,theme,sfxOn:()=>!!ST.sfx,vibOn:()=>!!ST.vib}})();
