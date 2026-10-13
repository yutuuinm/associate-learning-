/* 带背引擎：像 B 站带背 up 主那样——快速、循环、可听、可填空
   三种模式：
     follow 跟读：显示全文 + 朗读，跟着念
     fill   填空：关键词挖空，先自己想，再对答案
     listen 听背：文字遮住，只放音，逼自己回忆
   支持：语速、每条循环遍数、条间间隔、收藏、进度记忆 */
window.CET6 = window.CET6 || {};

(function(){
var C = window.CET6;
var R = C.RC = {};
var $ = function(i){ return document.getElementById(i) };

R.state = {
  list: [], key:'', i:0, mode:'follow', rate:1.0, loop:1, gap:1.2,
  playing:false, show:true, round:0, starOnly:false
};
var timers = [];
function clearTimers(){ timers.forEach(clearTimeout); timers = [] }

/* ---------- 语音（中文优先） ---------- */
var zhVoice = null;
function pickVoice(){
  var vs = (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
  if(!vs.length) return null;
  return vs.filter(function(v){ return /^zh[-_]CN/i.test(v.lang) })[0]
      || vs.filter(function(v){ return /^zh/i.test(v.lang) })[0]
      || null;
}
if('speechSynthesis' in window){
  pickVoiceLater();
  window.speechSynthesis.onvoiceschanged = function(){ zhVoice = pickVoice() };
}
function pickVoiceLater(){
  zhVoice = pickVoice();
  if(!zhVoice){
    var n = 0, t = setInterval(function(){
      zhVoice = pickVoice();
      if(zhVoice || n++ > 12) clearInterval(t);
    }, 250);
  }
}

/* 让 TTS 读得出来的文本规范化：下标、箭头、希腊字母等换成中文 */
var MAP = [
  [/₁/g,'1'],[/₂/g,'2'],[/₃/g,'3'],[/₄/g,'4'],[/₅/g,'5'],[/₆/g,'6'],[/₇/g,'7'],[/₈/g,'8'],[/₉/g,'9'],
  [/→/g,'生成'],[/←/g,'生成'],[/⇌/g,'可逆生成'],[/⇄/g,'互变'],[/—/g,'，'],[/–/g,'，'],
  [/⁻/g,'负'],[/⁺/g,'正'],[/·/g,' '],
  [/α/g,'阿尔法'],[/β/g,'贝塔'],[/γ/g,'伽马'],[/δ/g,'德尔塔'],[/ε/g,'伊普西龙'],[/λ/g,'兰姆达'],[/π/g,'派'],
  [/Δ/g,'德尔塔'],[/δ/g,'德尔塔'],[/ψ/g,'普赛'],[/ω/g,'欧米伽'],
  [/'/g,''],[/′/g,''],[/″/g,''],
  [/\[/g,''],[/\\]/g,''],[/↓/g,'沉淀'],[/↑/g,'气体'],
  [/≈/g,'约等于'],[/≥/g,'大于等于'],[/≤/g,'小于等于'],[/≠/g,'不等于'],
  [/√/g,'根号'],[/×/g,'乘'],[/（/g,'，'],[/）/g,'，'],[/·/g,' ']
];
R.ttsNorm = function(s){
  s = String(s||'');
  MAP.forEach(function(p){ s = s.replace(p[0], p[1]) });
  return s.replace(/\s+/g,' ').trim();
};

/* 读一段文字，times 遍，全部读完回调 done */
R.speak = function(text, times, done){
  if(!('speechSynthesis' in window)){ done && done(false); return }
  var t = R.ttsNorm(text);
  if(!t){ done && done(true); return }
  var n = 0;
  window.speechSynthesis.cancel();
  function once(cb){
    var u = new SpeechSynthesisUtterance(t);
    if(zhVoice) u.voice = zhVoice;
    u.lang = 'zh-CN';
    u.rate = R.state.rate || 1;
    u.pitch = 1; u.volume = 1;
    u.onend = function(){ cb() };
    u.onerror = function(){ cb() };
    window.speechSynthesis.speak(u);
  }
  function run(){
    if(n >= times){ done && done(true); return }
    n++;
    once(function(){ if(R.state.playing) run(); else done && done(false) });
  }
  run();
};

/* ---------- 自动挖空 ---------- */
/* 优先挖：数字/英文/公式片段；其次挖最长的中文分句 */
var PICK_NUM = /[0-9０-９]/;
var PICK_EN = /[A-Za-z]/;
R.blank = function(a){
  var s = String(a||'').trim();
  if(!s) return {text:'', ans:[]};
  /* 按分句切 */
  var parts = s.split(/[；;。]|,|，/).map(function(x){return x.trim()}).filter(function(x){return x.length>1});
  if(!parts.length) parts = [s];
  var idx = -1, bestScore = -1;
  parts.forEach(function(p,i){
    var score = 0;
    if(PICK_NUM.test(p)) score += 3;
    if(PICK_EN.test(p)) score += 2;
    score += Math.min(4, Math.floor(p.length/5));
    if(score > bestScore){ bestScore = score; idx = i }
  });
  if(idx < 0) idx = 0;
  /* 在被选中的分句里，进一步只挖最有信息量的片段 */
  var seg = parts[idx];
  var m = seg.match(/[^，,；;]{2,18}/g) || [seg];
  var pick = m.reduce(function(x,y){
    var sx = (PICK_NUM.test(x)?3:0) + (PICK_EN.test(x)?2:0) + x.length/6;
    var sy = (PICK_NUM.test(y)?3:0) + (PICK_EN.test(y)?2:0) + y.length/6;
    return sy > sx ? y : x;
  });
  if(pick.length < 2 || pick.length >= seg.length - 1) pick = seg;
  var text = s.replace(pick, '＿＿＿＿');
  return {text:text, ans:[pick]};
};

/* ---------- 列表构建 ---------- */
/* items: [{id, k, a, mn, trap}] */
R.build = function(key, items){
  var st = R.state;
  st.key = key; st.list = items || [];
  var pos = C.get('cet6_rcpos_'+key, 0);
  st.i = (pos < st.list.length) ? pos : 0;
  st.playing = false; st.show = true; st.round = 0;
  clearTimers();
};

R.stars = function(){ return C.get('cet6_star_v1', {}) };
R.toggleStar = function(id){
  var s = R.stars();
  if(s[id]) delete s[id]; else s[id] = 1;
  C.set('cet6_star_v1', s);
  return !!s[id];
};
R.isStar = function(id){ return !!R.stars()[id] };

R.cur = function(){
  var st = R.state;
  return st.list[st.i] || null;
};
R.hasZh = function(){ return !!zhVoice };
R.ttsOK = function(){ return ('speechSynthesis' in window) };

/* ---------- 控制 ---------- */
R.setMode = function(m){ R.state.mode = m; R.state.show = (m!=='listen'); };
R.setRate = function(v){ R.state.rate = v };
R.setLoop = function(v){ R.state.loop = v };
R.setGap = function(v){ R.state.gap = v };
R.setStarOnly = function(v){ R.state.starOnly = v; R.state.i = 0 };

R.goto = function(i){
  var st = R.state;
  st.i = Math.max(0, Math.min(st.list.length-1, i));
  st.round = 0;
  st.show = (st.mode !== 'listen');
  C.set('cet6_rcpos_'+st.key, st.i);
  if(st.playing) R.play();
};
R.next = function(){ R.goto(R.state.i + 1) };
R.prev = function(){ R.goto(R.state.i - 1) };

R.stop = function(){
  var st = R.state;
  st.playing = false;
  clearTimers();
  if('speechSynthesis' in window) window.speechSynthesis.cancel();
};

/* 播放当前条：按 loop 遍读，读完停 gap 秒自动下一条 */
R.play = function(){
  var st = R.state;
  var it = R.cur();
  if(!it){ R.stop(); return }
  st.playing = true;
  var text = it.k + '。' + (it.a||'') + (it.mn ? ('。口诀：' + it.mn) : '');
  R.speak(text, st.loop || 1, function(ok){
    if(!ok || !st.playing) return;
    st.round++;
    var last = (st.i >= st.list.length - 1);
    if(last){ st.playing = false; return }
    var t = setTimeout(function(){
      if(!st.playing) return;
      R.next();
    }, (st.gap||1.2)*1000);
    timers.push(t);
  });
};
R.toggle = function(){
  if(R.state.playing) R.stop(); else R.play();
};
R.reveal = function(){ R.state.show = true };

/* ---------- 进度百分比 ---------- */
R.progress = function(){
  var st = R.state;
  return st.list.length ? (st.i + 1) / st.list.length : 0;
};
})();
