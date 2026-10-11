// ---- Tussle mascots: chubby fighters (sumo extras optional) ----
function mascotSvg(col,o){o=o||{};const I='#1a1a1a',S='stroke="'+I+'" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"',m=o.mood||'angry',ar=o.arms||'side';let s='';
 if(ar=='side')s+='<circle cx="9" cy="94" r="9.5" fill="'+col+'" '+S+'/><circle cx="91" cy="94" r="9.5" fill="'+col+'" '+S+'/>';
 else if(ar=='up')s+='<path d="M16 88L5 50M84 88L95 50" stroke="'+I+'" stroke-width="18" stroke-linecap="round" fill="none"/><path d="M16 88L5 50M84 88L95 50" stroke="'+col+'" stroke-width="11" stroke-linecap="round" fill="none"/><circle cx="5" cy="45" r="10" fill="'+col+'" '+S+'/><circle cx="95" cy="45" r="10" fill="'+col+'" '+S+'/>';
 s+='<path d="M14 84Q6 44 34 30Q50 24 66 30Q94 44 86 84Q84 118 50 120Q16 118 14 84Z" fill="'+col+'" '+S+'/><ellipse cx="50" cy="96" rx="24" ry="18" fill="#fff" opacity=".16"/><ellipse cx="27" cy="63" rx="6" ry="4" fill="#fff" opacity=".22"/><ellipse cx="73" cy="63" rx="6" ry="4" fill="#fff" opacity=".22"/>';
 if(o.sumo)s+='<path d="M14 98Q50 112 86 98L87 110Q50 124 13 110Z" fill="#fff6e0" '+S+'/><path d="M42 110H58V129H42Z" fill="#fff6e0" '+S+'/>';
 if(o.sumo)s+='<path d="M21 46Q18 21 50 19Q82 21 79 46Q68 35 50 35Q32 35 21 46Z" fill="#2b2b2b" '+S+'/><circle cx="50" cy="12" r="9" fill="#2b2b2b" '+S+'/><path d="M44 21H56" '+S+'/>';
 if(m=='angry')s+='<ellipse cx="38" cy="55" rx="7.5" ry="8.5" fill="#fff" '+S+'/><ellipse cx="62" cy="55" rx="7.5" ry="8.5" fill="#fff" '+S+'/><circle cx="39.5" cy="57" r="4.2" fill="'+I+'"/><circle cx="60.5" cy="57" r="4.2" fill="'+I+'"/><circle cx="38" cy="54.5" r="1.5" fill="#fff"/><circle cx="59" cy="54.5" r="1.5" fill="#fff"/><path d="M26 43L45 50M74 43L55 50" stroke="'+I+'" stroke-width="6" stroke-linecap="round"/><path d="M43 71Q50 64 57 71" fill="none" '+S+'/>';
 else if(m=='happy')s+='<path d="M29 46Q37 41 45 46M55 46Q63 41 71 46" fill="none" '+S+'/><path d="M31 57Q38 49 45 57M55 57Q62 49 69 57" fill="none" '+S+'/><path d="M37 65Q50 84 63 65Z" fill="#7a1d1d" '+S+'/><ellipse cx="50" cy="73" rx="5" ry="3" fill="#ff8aa0"/>';
 else if(m=='smug')s+='<path d="M30 57a8 6.5 0 0 1 16 0Z" fill="#fff" '+S+'/><path d="M54 57a8 6.5 0 0 1 16 0Z" fill="#fff" '+S+'/><circle cx="41" cy="55.5" r="2.8" fill="'+I+'"/><circle cx="65" cy="55.5" r="2.8" fill="'+I+'"/><path d="M27 52H48M52 52H73" fill="none" '+S+'/><path d="M40 70Q52 77 63 64" fill="none" '+S+'/>';
 else if(m=='shock')s+='<ellipse cx="38" cy="55" rx="8.5" ry="10" fill="#fff" '+S+'/><ellipse cx="62" cy="55" rx="8.5" ry="10" fill="#fff" '+S+'/><circle cx="38" cy="56" r="3" fill="'+I+'"/><circle cx="62" cy="56" r="3" fill="'+I+'"/><path d="M28 40Q38 33 47 40M53 40Q62 33 72 40" fill="none" '+S+'/><ellipse cx="50" cy="75" rx="5.5" ry="7.5" fill="#7a1d1d" '+S+'/>';
 else if(m!='none')s+='<path d="M32 49l12 12m0-12l-12 12M56 49l12 12m0-12l-12 12" fill="none" '+S+'/><path d="M40 72Q45 66 50 72Q55 78 60 72" fill="none" '+S+'/>';
 if(!o.sumo&&!o.nohat&&col=='#e5392f'&&window.Meta&&Meta.hat())s+=hatSvg(Meta.hat());
 return s}
// ---- Hats (cosmetics) drawn on the player's red mascot ----
function hatSvg(id){const I='#1a1a1a',S='stroke="'+I+'" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"';
 const H={
 cap:'<path d="M29 35Q29 8 50 8Q71 8 71 35Z" fill="#ffc93c" '+S+'/><path d="M62 29Q88 27 93 38Q76 41 62 36Z" fill="#e0a800" '+S+'/><circle cx="50" cy="8" r="3.5" fill="#e0a800" '+S+'/><path d="M50 10V32" stroke="#e0a800" stroke-width="2.5"/>',
 beanie:'<circle cx="50" cy="3" r="8" fill="#fff6e0" '+S+'/><path d="M27 36Q27 8 50 8Q73 8 73 36Z" fill="#2563c9" '+S+'/><rect x="25" y="28" width="50" height="12" rx="6" fill="#1d4fa0" '+S+'/><path d="M34 30V38M42 30V38M50 30V38M58 30V38M66 30V38" stroke="#2563c9" stroke-width="2.5"/>',
 chef:'<path d="M29 29Q14 23 22 10Q27 0 40 5Q50 -5 60 5Q74 0 78 10Q86 23 71 29Z" fill="#fff6e0" '+S+'/><rect x="30" y="26" width="40" height="13" rx="3" fill="#fff6e0" '+S+'/><path d="M42 12V24M58 12V24" stroke="#d8cdb4" stroke-width="2.5"/>',
 band:'<path d="M20 42Q50 28 80 42L80 33Q50 19 20 33Z" fill="#fff6e0" '+S+'/><rect x="41" y="27" width="18" height="11" rx="3" fill="#9aa5b1" '+S+'/><path d="M80 36L95 28M80 39L97 44" stroke="'+I+'" stroke-width="9" stroke-linecap="round"/><path d="M80 36L95 28M80 39L97 44" stroke="#fff6e0" stroke-width="4" stroke-linecap="round"/>',
 cowboy:'<path d="M31 31Q26 6 42 8Q50 15 58 8Q74 6 69 31Z" fill="#a9703a" '+S+'/><path d="M6 35Q50 54 94 35Q88 23 76 30Q50 21 24 30Q12 23 6 35Z" fill="#c98b4b" '+S+'/><path d="M32 26Q50 32 68 26" fill="none" stroke="#e5392f" stroke-width="4"/>',
 viking:'<path d="M32 26Q8 28 5 2Q18 14 38 16Z" fill="#fff6e0" '+S+'/><path d="M68 26Q92 28 95 2Q82 14 62 16Z" fill="#fff6e0" '+S+'/><path d="M27 36Q27 9 50 9Q73 9 73 36Z" fill="#aab4c0" '+S+'/><rect x="26" y="28" width="48" height="9" rx="3" fill="#7c8794" '+S+'/><circle cx="50" cy="32" r="2.6" fill="#ffc93c"/><path d="M40 14Q50 11 58 15" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>',
 wizard:'<path d="M32 33Q44 20 54 -14Q62 10 70 33Z" fill="#5b4bd5" '+S+'/><path d="M18 36Q50 48 82 36Q50 26 18 36Z" fill="#4c3bb5" '+S+'/><path d="M35 29Q52 34 68 28" fill="none" stroke="#ffc93c" stroke-width="3.5"/><path d="M52 4l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6-5-2.8-5 2.8 1.2-5.6-4.2-3.8 5.6-.6z" fill="#ffc93c" stroke="'+I+'" stroke-width="2" stroke-linejoin="round"/>'};
 return H[id]||''}
// ---- Rex the bot: purple boss, 3 levels (0 easy, 1 medium, 2 hard) ----
const REXC='#8b5cf6';
function rexSvg(lv,o){o=o||{};const I='#1a1a1a',S='stroke="'+I+'" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"';let s=mascotSvg(REXC,{mood:'none',arms:o.arms||'side'});
 const eye=(x,pu)=>'<ellipse cx="'+x+'" cy="56" rx="7.5" ry="8.5" fill="#fff" '+S+'/><circle cx="'+(x+pu)+'" cy="58" r="4.2" fill="'+I+'"/>';
 if(lv==0){s+=eye(38,0)+eye(62,0)+'<path d="M30 56a8 8.5 0 0 1 16 0Z" fill="'+REXC+'" '+S+'/><path d="M54 56a8 8.5 0 0 1 16 0Z" fill="'+REXC+'" '+S+'/><path d="M28 46Q36 42 45 47M72 46Q64 42 55 47" fill="none" '+S+'/><path d="M42 71Q50 76 58 71" fill="none" '+S+'/>'
  +'<g transform="rotate(-14 50 30)"><path d="M35 31L50 -8L65 31Z" fill="#ffc93c" '+S+'/><path d="M40 20L60 20M43 11L57 11" stroke="#e5392f" stroke-width="4.5" stroke-linecap="round"/><circle cx="50" cy="-9" r="6" fill="#fff6e0" '+S+'/></g><text x="74" y="30" font-family="Lilita One,sans-serif" font-size="15" fill="'+I+'">z</text><text x="82" y="18" font-family="Lilita One,sans-serif" font-size="11" fill="'+I+'">z</text>'}
 else if(lv==1){s+=eye(38,2)+eye(62,2)+'<path d="M27 40Q36 36 45 45M73 46L55 49" fill="none" stroke="'+I+'" stroke-width="6" stroke-linecap="round"/><path d="M40 70Q52 78 63 66" fill="none" '+S+'/><circle cx="63" cy="66" r="1.8" fill="'+I+'"/>'}
 else{s+='<path d="M24 45L46 52M76 45L54 52" stroke="'+I+'" stroke-width="6" stroke-linecap="round"/><path d="M25 52H47Q47 66 40 66H32Q25 66 25 58Z" fill="#111" '+S+'/><path d="M53 52H75V58Q75 66 68 66H60Q53 66 53 52Z" fill="#111" '+S+'/><path d="M47 55H53" '+S+'/><path d="M29 55L36 55M57 55L64 55" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/><path d="M36 68Q50 84 64 68Z" fill="#fff" '+S+'/><path d="M50 69V78" stroke="'+I+'" stroke-width="2"/>'
  +'<path d="M27 32L30 8L41 21L50 3L59 21L70 8L73 32Z" fill="#ffc93c" '+S+'/><circle cx="30" cy="8" r="3.4" fill="#e5392f" '+S+'/><circle cx="50" cy="3" r="3.4" fill="#2563c9" '+S+'/><circle cx="70" cy="8" r="3.4" fill="#e5392f" '+S+'/><path d="M28 27H72" stroke="'+I+'" stroke-width="2.5"/>'}
 if(o.mood){const P='<ellipse cx="50" cy="72" rx="15" ry="8" fill="'+REXC+'"/>';
  if(o.mood=='sad')s+=P+'<path d="M28 44Q37 50 46 46M72 44Q63 50 54 46" fill="none" '+S+'/><path d="M41 77Q50 69 59 77" fill="none" '+S+'/><path d="M67 60Q71 68 67 70Q63 68 67 60Z" fill="#7dd3fc" stroke="'+I+'" stroke-width="2"/>';
  else if(o.mood=='hype')s+=P+'<path d="M28 42Q37 38 46 44M72 42Q63 38 54 44" fill="none" '+S+'/><path d="M38 69Q50 86 62 69Z" fill="#7a1d1d" '+S+'/>';
  else if(o.mood=='smug')s+=P+'<path d="M27 47L46 51M73 47L54 51" fill="none" '+S+'/><path d="M40 73Q52 79 64 65" fill="none" '+S+'/>'}
 return s}
function isBot(){return !!on.bot}
function rexLv(){const n=on.opp||'';return n.indexOf('Sleepy')>=0?0:n.indexOf('King')>=0?2:1}
function OC(){return isBot()?REXC:'#2563c9'}
function rexUri(lv){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -16 108 148" width="216" height="296">'+rexSvg(lv)+'</svg>')}
function rexAv(lv,sz){return '<span class="av" style="background:'+REXC+';overflow:hidden;width:'+sz+'px;height:'+sz+'px"><svg viewBox="12 -16 76 76" width="'+sz+'" height="'+sz+'">'+rexSvg(lv)+'</svg></span>'}
function oppAv(sz){return isBot()?rexAv(rexLv(),sz):'<span class="av" style="background:#2563c9;width:'+sz+'px;height:'+sz+'px">'+((on.opp||'?')[0]).toUpperCase()+'</span>'}
const LN=[
{start:['zzz... oh! Let\'s play!','*yawn* Ready when you are.','Be gentle with me!','Five more minutes... kidding, go!'],
 mine:['Oof! Nice one!','Ooh, good!','Wow, you\'re quick!','Ow! Well played!','I blinked. Sorry!'],
 his:['Oh! I did it?','Yay, me!','Was that me? Cool!','Haha, lucky me!'],
 lead:['I\'m winning?! Wake me up!','Wait, am I ahead?'],trail:['Uh oh, I\'m behind...','My hat feels heavy.'],
 level:['We\'re even! Whoa!','Tied! Don\'t go easy on me.'],streak:['Two in a row?! Dreams do come true.','Is this a dream?'],
 mpMine:['One more and you win... no pressure!','You\'re about to win! Yikes.'],mpHis:['Match point for me?! I\'m nervous!','Don\'t look, I\'m nervous.'],
 think:['Hmm... where was I?','Let me think... zzz','Ooh, a hard one.'],
 win:['I won?! Rematch?','No way! I won! Again?'],lose:['You\'re so good!','Nice game! Teach me?','Okay, you win. Nap time.']},
{start:['Let\'s dance.','Bring it on!','Show me what you\'ve got.','Warm-up\'s over.'],
 mine:['Not bad.','Hm. Lucky.','Okay, okay. Nice.','That one\'s yours.','Noted.'],
 his:['Gotcha.','Easy.','Too slow!','That one\'s mine.','Nice try.'],
 lead:['I\'m in front. Keep up!','Scoreboard doesn\'t lie.'],trail:['Alright, now it\'s on.','You\'re ahead... for now.'],
 level:['All square. Now it gets fun.','Back to even. Good.'],streak:['That\'s two. Want a third?','On a roll!'],
 mpMine:['Match point for you. Sweating yet? Me too.','You\'re one away. Interesting.'],mpHis:['Match point. Choke time?','One more and it\'s mine.'],
 think:['Hmm, interesting move.','Let me think...','Oh, you\'re sneaky.'],
 win:['GG. Rematch?','Good game. Better luck next time.'],lose:['Hmph. Again!','You got me. Rematch?','Nice one. I want a rematch.']},
{start:['Too easy.','Kneel.','You dare challenge the king?','Make your move, peasant.'],
 mine:['A fluke.','Hmph.','Enjoy it. It won\'t last.','The crown is unmoved.','Insolent!'],
 his:['Too slow.','Bow down.','Predictable.','As expected.','The king scores.'],
 lead:['The throne is mine.','Behold my dominion.'],trail:['You dare lead the king?!','This will not stand.'],
 level:['Even? Unacceptable.','A brief rebellion.'],streak:['Bow. Again.','Absolute rule.'],
 mpMine:['Impossible... one more?!','You are close. Too close.'],mpHis:['The final blow approaches.','Prepare for defeat.'],
 think:['Hmm. A worthy move.','The king ponders.','Calculating your doom.'],
 win:['Long live the king!','As the prophecy foretold.'],lose:['Impossible!!','This changes nothing.','Guards! ...fine, you win.']}];
// one line per game for each Rex level, said at the start of a match
const LG={sumo:['Mind the edge... zzz','Let\'s shove!','Off the platform you go.'],darts:['Hit the board, not me!','Bullseye or bust.','I never miss.'],archery:['Is it windy? I forgot.','Watch the wind.','The wind obeys me.'],flip:['Wheee! Gravity is silly.','Don\'t fall upward!','The ceiling is my home.'],pizza:['Mmm, pizza...','Extra toppings, please.','I have memorized every topping.'],spot:['I see... circles.','Eyes sharp!','My eyes miss nothing.'],c4:['Four... is that a lot?','Four in a row? Let\'s see.','Your defeat has four sides.'],gomoku:['Five stones, got it.','Think five moves ahead.','Five in a row. Mine.'],dots:['Dot to dot, fun!','Don\'t give me boxes.','I\'ll take the boxes.'],uttt:['So many boards...','Nine boards, one winner.','Nine boards. I own them all.'],sea:['Is that a ship?','Sink or swim!','Your fleet is doomed.'],hurdle:['Hurdles? I\'ll nap over them.','Jump high!','Watch me fly over.'],stack:['Don\'t knock it over!','Steady hands.','My towers touch the sky.'],sky:['Up, up, up!','Pick the right cloud.','The sky belongs to me.'],fruit:['Yum, fruit!','Beware the bombs!','Sliced, diced, defeated.']};
let rbT=0,rbLast={},rbAt=0,RXS={m:0,h:0};
function rexSay(k,mood,g){if(!isBot())return;const lv=rexLv();let L=LN[lv][k];if(k=='start'&&g&&LG[g]&&Math.random()<.65)L=[LG[g][lv]];if(!L)return;
 let i=Math.floor(Math.random()*L.length);if(L.length>1&&rbLast[k]===i)i=(i+1)%L.length;rbLast[k]=i;
 let b=document.getElementById('rbub');if(!b){b=document.createElement('div');b.id='rbub';document.body.appendChild(b)}
 b.innerHTML='<svg viewBox="8 -14 84 100" width="38" height="45" style="flex:none">'+rexSvg(lv,{mood:mood||''})+'</svg><span>'+L[i]+'</span>';b.style.top=typeof view!='undefined'&&view=='res'?'160px':'';b.style.display='flex';rbAt=Date.now();clearTimeout(rbT);rbT=setTimeout(()=>{b.style.display='none'},2600)}
// Rex reacts to the score after each round of a best-of match
function rexReact(d){if(!isBot()||!d.w||!(d.to>1))return;const me=d.pts[pid]||0,hi=d.pts.BOT||0,to=d.to,mine=d.w==pid;
 if(mine){RXS.m++;RXS.h=0}else{RXS.h++;RXS.m=0}
 let k=mine?'mine':'his',mood=mine?'sad':'smug';
 if(mine&&me==to-1){k='mpMine';mood='sad'}else if(!mine&&hi==to-1){k='mpHis';mood='hype'}
 else if(!mine&&RXS.h>=2){k='streak';mood='hype'}
 else if(me==hi){k='level';mood=mine?'sad':'smug'}
 else if(hi>me){k=mine?'mine':'lead';mood=mine?'sad':'smug'}
 else{k=mine?'trail':'his';mood=mine?'sad':'smug'}
 rexSay(k,mood)}
// Rex mutters while thinking in board games
function rexThink(d){if(!isBot()||!d.ids||d.win!=null||d.ids[d.turn]!='BOT'||Date.now()-rbAt<4500||Math.random()>.16)return;rexSay('think','smug')}
// ---- Red and Blue have names and personalities. You are always Blaze, your rival is always Frost. ----
const CH={red:{n:'Blaze',col:'#e5392f',ink:'#c92b21',
  score:['BOOM!','Too hot to handle!','Feel the burn!','Yes! Again!','Light it up!'],
  concede:['Argh! Not fair!','I was about to!','Ow, that stings!','No no no!'],
  win:['I\'M ON FIRE!','Told you I\'d win!','Burn bright!'],lose:['Rematch! Right now!','That was luck!','I\'m not done!']},
 blue:{n:'Frost',col:'#2563c9',ink:'#1d4fa0',
  score:['Cool.','Right on time.','Ice cold.','Easy. Stay calm.','As planned.'],
  concede:['Hm. Noted.','Fair point.','Just warming up.','Interesting.'],
  win:['Stay frosty.','Cool game.','Calm wins.'],lose:['Well played. Again?','The tide turns.','Hm, you\'re good.']}};
let chLast={};
function chLine(w,k){const L=CH[w][k];let i=Math.floor(Math.random()*L.length);if(L.length>1&&chLast[w+k]===i)i=(i+1)%L.length;chLast[w+k]=i;return L[i]}
function chSay(w,k,mood){let b=document.getElementById('rbub');if(!b){b=document.createElement('div');b.id='rbub';document.body.appendChild(b)}
 b.innerHTML='<svg viewBox="8 -14 84 100" width="38" height="45" style="flex:none">'+mascotSvg(CH[w].col,{mood:mood,arms:'none',nohat:w=='blue'})+'</svg><span>'+chLine(w,k)+'</span>';b.style.top=typeof view!='undefined'&&view=='res'?'160px':'';b.style.display='flex';rbAt=Date.now();clearTimeout(rbT);rbT=setTimeout(()=>{b.style.display='none'},2400)}
// vs a friend: after a round, the character who scored gloats, or the other one groans
function charReact(d){if(isBot()||!d.w||!(d.to>1)||Math.random()>.7)return;const mine=d.w==pid,sc=mine?'red':'blue',lo=mine?'blue':'red';
 if(Math.random()<.6)chSay(sc,'score',sc=='red'?'happy':'smug');else chSay(lo,'concede',Math.random()<.5?'shock':'sad')}
// caption under the result banner (friend matches, and your wins against Rex)
function charCap(d){if(d.left||(d.win!='me'&&d.win!='opp'))return '';const w=d.win=='me'?'red':'blue';if(isBot()&&w=='blue')return '';
 return '<div class="L" style="font-size:18px;margin:0 0 6px;color:'+CH[w].ink+'">'+CH[w].n+': “'+chLine(w,'win')+'”</div>'}
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
c4(d,me,mine){const W=50;const cells=d.g.map((v,i)=>{const r=Math.floor(i/7),c=i%7,cx=c*W+W/2+5,cy=r*W+W/2+5,col=v<0?'#fff6e0':v==me?'#e5392f':OC(),hl=d.line&&d.line.includes(i);const dc='<circle cx="'+cx+'" cy="'+cy+'" r="20" fill="'+col+'" stroke="'+(hl?'#ffc93c':'#1a1a1a')+'" stroke-width="'+(hl?6:3)+'"/>'+(i==d.last?'<circle cx="'+cx+'" cy="'+cy+'" r="7" fill="none" stroke="#fff" stroke-width="3"/>':'');return i==d.last?'<g><animateTransform attributeName="transform" type="translate" from="0 -'+(cy+30)+'" to="0 0" dur=".4s" calcMode="spline" keyTimes="0;1" keySplines=".3 0 .7 1" fill="freeze"/>'+dc+'</g>':dc}).join('');
 $('#bb').innerHTML='<svg viewBox="0 0 360 310" width="100%" style="max-width:360px"><rect x="2" y="2" width="356" height="306" rx="16" fill="#f4a261" stroke="#1a1a1a" stroke-width="4"/>'+cells+[0,1,2,3,4,5,6].map(c=>'<rect data-c="'+c+'" x="'+(c*W+5)+'" y="0" width="'+W+'" height="310" fill="transparent" style="cursor:pointer"/>').join('')+'</svg>';
 $('#bb').querySelectorAll('rect[data-c]').forEach(e=>e.onpointerdown=()=>{if(mine&&d.win==null)send({t:'in',c:+e.dataset.c})})},
gomoku(d,me,mine){const N=13,S=26,P=18,L=(N-1)*S+2*P;let s='<rect x="2" y="2" width="'+(L-4)+'" height="'+(L-4)+'" rx="12" fill="#f4d9a0" stroke="#1a1a1a" stroke-width="4"/>';
 for(let i=0;i<N;i++){const p=P+i*S;s+='<path d="M'+P+' '+p+'H'+(L-P)+'M'+p+' '+P+'V'+(L-P)+'" stroke="#1a1a1a" stroke-width="1.5"/>'}
 d.g.forEach((v,i)=>{if(v<0)return;const x=P+(i%N)*S,y=P+Math.floor(i/N)*S,hl=d.line&&d.line.includes(i);s+='<circle cx="'+x+'" cy="'+y+'" r="11" fill="'+(v==me?'#e5392f':OC())+'" stroke="'+(hl?'#ffc93c':'#1a1a1a')+'" stroke-width="'+(hl?5:2.5)+'">'+(i==d.last?'<animate attributeName="r" from="2" to="11" dur=".18s" fill="freeze"/>':'')+'</circle>'+(i==d.last?'<circle cx="'+x+'" cy="'+y+'" r="4" fill="#fff"/>':'')});
 $('#bb').innerHTML='<svg id="gsv" viewBox="0 0 '+L+' '+L+'" width="100%" style="max-width:380px">'+s+'</svg>';
 $('#gsv').onpointerdown=e=>{if(!mine||d.win!=null)return;const r=e.currentTarget.getBoundingClientRect(),k=L/r.width,x=Math.round(((e.clientX-r.left)*k-P)/S),y=Math.round(((e.clientY-r.top)*k-P)/S);if(x>=0&&x<N&&y>=0&&y<N&&d.g[y*N+x]<0)send({t:'in',x,y})}},
dots(d,me,mine){const S=56,P=22,L=5*S+2*P,col=v=>v==me?'#e5392f':OC();let s='';
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
  for(let c=0;c<9;c++){const v=d.c[b*9+c],i=b*9+c;h+='<button data-b="'+b+'" data-c="'+c+'" style="height:34px;border:0;border-right:'+(c%3<2?'2px solid #1a1a1a':'0')+';border-bottom:'+(c<6?'2px solid #1a1a1a':'0')+';background:'+(i==d.last?'#ffe08a':'transparent')+';font:400 22px \'Lilita One\',sans-serif;color:'+(v==me?'#e5392f':OC())+';padding:0">'+(v<0?'':v==me?'X':'O')+'</button>'}
  if(w==0||w==1)h+='<div style="position:absolute;left:0;top:0;right:0;bottom:0;background:'+(w==me?'#e5392fdd':OC()+'dd')+';border-radius:6px;color:#fff6e0;font:400 64px/1 \'Lilita One\',sans-serif;display:flex;align-items:center;justify-content:center;pointer-events:none">'+(w==me?'X':'O')+'</div>';else if(w==2)h+='<div style="position:absolute;left:0;top:0;right:0;bottom:0;background:#999c;border-radius:6px;pointer-events:none"></div>';
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
