/* 学习引擎：答题记录 / 题型正确率 / SRS 生词本 / 错题库 / 六级得分预估
   全部存 localStorage，不联网 */
window.CET6 = window.CET6 || {};

(function(){
var C = window.CET6;
var S = C.STATS = {};

var K_LOG='cet6_log_v1', K_SRS='cet6_srs_v1', K_DAY='cet6_day_v1',
    K_WRONG='cet6_wrong_v1', K_GOAL='cet6_goal_v1',
    K_WDAY='cet6_wday_v1',      /* 每天收进生了哪些词 { day: [word] } */
    K_WMEM='cet6_wmem_v1',      /* AI 助记缓存 { word: {txt, t} } */
    K_WTRAIN='cet6_wtrain_v1';  /* 运用练习记录 { day: { word: {ok, n} } } */

/* ---------- 六级题型分值常量 ---------- */
/* kind: lecture 讲座 / conv 长对话 / passage 听力篇章 / read 仔细阅读 / match 长篇匹配 / cloze 选词填空 */
S.VAL = {lecture:14.2, conv:7.1, passage:7.1, read:14.2, match:7.1, cloze:3.55};
S.MAX = {lecture:142, conv:56.8, passage:49.7, read:142, match:71, cloze:35.5};
S.KIND = [
  {k:'lecture', n:'讲座听力',  sec:'听力', v:14.2,  max:142},
  {k:'conv',    n:'长对话',    sec:'听力', v:7.1,   max:56.8},
  {k:'passage', n:'听力篇章',  sec:'听力', v:7.1,   max:49.7},
  {k:'read',    n:'仔细阅读',  sec:'阅读', v:14.2,  max:142},
  {k:'match',   n:'长篇匹配',  sec:'阅读', v:7.1,   max:71},
  {k:'cloze',   n:'选词填空',  sec:'阅读', v:3.55,  max:35.5}
];
S.WRITE_DEFAULT = 130;    // 写作+翻译按全国平均估（满分 213）

function today(){ var d=new Date(); return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()) }
function p2(n){ return n<10?('0'+n):(''+n) }
function dayAdd(s,n){ var d=new Date(s+'T00:00:00'); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()) }
S.today = today;

/* ---------- 答题记录 ---------- */
/* hint: 这题用到了第几级提示（0 没用 / 1 方向 / 2 定位 / 3 答案） */
S.log = function(kind, sid, qn, qtype, ok, pick, ms, hint){
  var a = C.get(K_LOG, []);
  a.push({t:Date.now(), d:today(), kind:kind, sid:sid, qn:qn, type:qtype||'',
          ok:ok?1:0, pick:pick, ms:ms||0, hint:hint||0});
  if(a.length>4000) a = a.slice(-3000);
  C.set(K_LOG, a);
  var dy = C.get(K_DAY, {});
  var t = dy[today()] || {q:0, ok:0, ms:0, set:{}};
  t.q++; t.ok += ok?1:0; t.ms += (ms||0); t.set[sid]=1;
  dy[today()] = t; C.set(K_DAY, dy);
  if(!ok) S.wrongAdd(kind, sid, qn);
  else S.wrongHit(kind, sid, qn);
};
S.logs = function(){ return C.get(K_LOG, []) };

/* ---------- 分组统计 ---------- */
function agg(list, key){
  var m = {};
  list.forEach(function(r){
    var k = r[key] || 'other';
    if(!m[k]) m[k] = {tot:0, ok:0};
    m[k].tot++; m[k].ok += r.ok;
  });
  Object.keys(m).forEach(function(k){
    m[k].rate = m[k].tot ? m[k].ok/m[k].tot : 0;
  });
  return m;
}
S.byKind = function(){ return agg(S.logs(), 'kind') };
S.byType = function(){ return agg(S.logs(), 'type') };
S.tot = function(){ var l=S.logs(), o=0; l.forEach(function(r){o+=r.ok}); return {tot:l.length, ok:o, rate:l.length?o/l.length:0} };

/* ---------- 提示依赖度：有多少分是靠提示拿的 ---------- */
/* 返回：无提示正确率 / 用了提示的正确率 / 平均提示级别 / 各题型平均提示级别 */
S.hintStat = function(){
  var l = S.logs(), clean = {tot:0, ok:0}, helped = {tot:0, ok:0}, sum = 0, n = 0;
  var byKind = {};
  l.forEach(function(r){
    var h = r.hint || 0;
    var b = h > 0 ? helped : clean;
    b.tot++; b.ok += r.ok;
    sum += h; n++;
    if(!byKind[r.kind]) byKind[r.kind] = {tot:0, sum:0};
    byKind[r.kind].tot++; byKind[r.kind].sum += h;
  });
  Object.keys(byKind).forEach(function(k){
    byKind[k].avg = byKind[k].tot ? byKind[k].sum/byKind[k].tot : 0;
  });
  return {
    clean: {tot:clean.tot, ok:clean.ok, rate: clean.tot?clean.ok/clean.tot:null},
    helped:{tot:helped.tot, ok:helped.ok, rate: helped.tot?helped.ok/helped.tot:null},
    avg: n ? sum/n : 0,
    byKind: byKind,
    n: n
  };
};
/* 自适应建议：连续做对就收紧提示，做不动就放宽 */
S.advise = function(){
  var l = S.logs();
  if(l.length < 8) return null;
  var dis = C.get('cet6_advisedismiss', -1);
  if(dis >= 0 && (l.length - dis) < 8) return null;   /* 刚被"不用"过，别反复弹 */
  var recent = l.slice(-12);
  var clean = recent.filter(function(r){ return !(r.hint > 0) });
  if(clean.length < 4) return null;
  var ok = 0; clean.forEach(function(r){ ok += r.ok });
  var rate = ok / clean.length;
  var cur = (C.settings && C.settings.assist != null) ? C.settings.assist : 2;
  if(rate >= 0.8 && cur > 0) return {act:'down', to:Math.max(0, cur-1), rate:rate,
    why:'最近没看提示也做对了 '+Math.round(rate*100)+'%，可以收紧到「'+['模拟考试','轻 · 方向','中 · 定位','强 · 全开'][Math.max(0,cur-1)]+'」逼自己一把。'};
  if(rate <= 0.45 && cur < 3) return {act:'up', to:Math.min(3, cur+1), rate:rate,
    why:'最近无提示正确率只有 '+Math.round(rate*100)+'%，先放宽到「'+['模拟考试','轻 · 方向','中 · 定位','强 · 全开'][Math.min(3,cur+1)]+'」把方法学会，再收紧。'};
  return null;
};

/* ---------- 六级得分预估 ---------- */
/* 有数据的题型用真实正确率；没数据的用总体正确率兜底（并标记为"未测"） */
S.estimate = function(){
  var t = S.tot(), base = t.tot ? t.rate : null;
  var bk = S.byKind();
  var parts = [], score = 0, measured = 0;
  S.KIND.forEach(function(k){
    var a = bk[k.k];
    var rate = a ? a.rate : base;
    var got = rate==null ? null : Math.round(rate * k.max * 10)/10;
    if(a) measured++;
    if(got!=null) score += got;
    parts.push({k:k.k, n:k.n, sec:k.sec, tot:a?a.tot:0, rate:rate, got:got, max:k.max, measured:!!a});
  });
  if(base==null) return {score:null, parts:parts, measured:0};
  return {
    score: Math.round(score + S.WRITE_DEFAULT),
    obj: Math.round(score),                 // 客观题部分
    write: S.WRITE_DEFAULT,
    parts: parts, measured: measured
  };
};

/* ---------- 每日 / 打卡 ---------- */
S.day = function(d){ d=d||today(); var m=C.get(K_DAY,{}); return m[d]||{q:0,ok:0,ms:0,set:{}} };
S.goal = function(){ var g=C.get(K_GOAL,{daily:30}); return g.daily||30 };
S.setGoal = function(n){ C.set(K_GOAL,{daily:n}) };
S.streak = function(){
  var m=C.get(K_DAY,{}), n=0, d=today();
  if(!(m[d] && m[d].q)) d = dayAdd(d,-1);   // 今天还没做就从昨天算
  while(m[d] && m[d].q>0){ n++; d = dayAdd(d,-1) }
  return n;
};
S.heat = function(days){
  days = days||70;
  var m=C.get(K_DAY,{}), out=[], start = dayAdd(today(), -(days-1));
  for(var i=0;i<days;i++){ var d=dayAdd(start,i); var r=m[d]; out.push({d:d, q:r?r.q:0}) }
  return out;
};

/* ---------- 错题库 ---------- */
S.wrongAdd = function(kind, sid, qn){
  var a = C.get(K_WRONG, []), f=null;
  a.forEach(function(x){ if(x.sid===sid&&x.qn===qn) f=x });
  if(!f){ f={kind:kind, sid:sid, qn:qn, n:0, fixed:0, last:0}; a.push(f) }
  f.n++; f.last=Date.now();
  C.set(K_WRONG, a);
};
/* 做对了：从错题本里减一次，连续做对 2 次就毕业 */
S.wrongHit = function(kind, sid, qn){
  var a = C.get(K_WRONG, []), ch=false;
  a.forEach(function(x){ if(x.sid===sid&&x.qn===qn&&x.fixed<2){ x.fixed=(x.fixed||0)+1; ch=true } });
  a = a.filter(function(x){ return (x.fixed||0) < 2 });
  if(ch) C.set(K_WRONG, a);
};
S.wrongList = function(){ return C.get(K_WRONG, []) };
S.wrongClear = function(sid){ C.set(K_WRONG, C.get(K_WRONG,[]).filter(function(x){return x.sid!==sid})) };

/* ---------- SRS 生词本（SM-2 简化） ---------- */
S.srsAll = function(){ return C.get(K_SRS, {}) };
/* ctx 例句原文 / cz 例句译文 / src 来源（哪篇哪套） / hl 例句中要高亮的词形 */
S.srsAdd = function(w, def, ctx, cz, src, hl){
  var m = S.srsAll(), k = String(w||'').toLowerCase().replace(/[^a-z-]/g,'');
  if(!k) return false;
  if(m[k]){
    var it0 = m[k], ch = false;
    if(ctx && !it0.c){ it0.c = ctx; ch = true }
    if(cz  && !it0.cz){ it0.cz = cz; ch = true }
    if(src && !it0.src){ it0.src = src; ch = true }
    if(hl  && !it0.hl){ it0.hl = hl; ch = true }
    if(def && !it0.d){ it0.d = def; ch = true }
    if(ch){ it0.up = Date.now(); C.set(K_SRS, m) }
    return false;
  }
  var now = Date.now();
  m[k] = {w:String(w).toLowerCase(), d:def||'', c:ctx||'', cz:cz||'', src:src||'', hl:hl||'',
          ef:2.5, iv:1, rep:0, due:today(), add:now, up:now};
  C.set(K_SRS, m);
  dayWordAdd(k);                 /* 任何入口收的词都算进今天的清单 */
  return true;
};
/* ---------- 每日新词清单（目标：每天 50 个出自文章的生词） ---------- */
function dayWordAdd(w){
  var m = C.get(K_WDAY, {}), d = today();
  var a = m[d] || [];
  if(a.indexOf(w) >= 0) return false;
  a.push(w); m[d] = a;
  /* 只留最近 60 天 */
  var ks = Object.keys(m).sort();
  if(ks.length > 60) ks.slice(0, ks.length-60).forEach(function(k){ delete m[k] });
  C.set(K_WDAY, m);
  return true;
}
S.dayWords = function(d){
  var m = C.get(K_WDAY, {});
  return m[d || today()] || [];
};
S.dayWordCount = function(d){ return S.dayWords(d).length };
S.wordGoal = function(){ var g = C.get(K_GOAL, {daily:30}); return g.words || 50 };
S.setWordGoal = function(n){ var g = C.get(K_GOAL, {daily:30}); g.words = n; C.set(K_GOAL, g) };
S.wordDays = function(){ return Object.keys(C.get(K_WDAY, {})) };
/* 连续完成每日生词目标的天数 */
S.wordStreak = function(){
  var m = C.get(K_WDAY, {}), n = 0, d = today(), g = S.wordGoal();
  if(!(m[d] && m[d].length >= g)) d = dayAdd(d, -1);
  while(m[d] && m[d].length >= g){ n++; d = dayAdd(d, -1) }
  return n;
};
/* ---------- AI 助记缓存 ---------- */
S.mem = function(w){
  var m = C.get(K_WMEM, {});
  return m[String(w||'').toLowerCase()] || null;
};
S.memSet = function(w, txt){
  var m = C.get(K_WMEM, {});
  m[String(w||'').toLowerCase()] = {txt: txt, t: Date.now()};
  C.set(K_WMEM, m);
};
S.memAll = function(){ return C.get(K_WMEM, {}) };
/* ---------- 运用练习记录 ---------- */
S.trainHit = function(w, ok){
  var m = C.get(K_WTRAIN, {}), d = today();
  if(!m[d]) m[d] = {};
  var it = m[d][w] || {ok:0, n:0};
  it.n++; if(ok) it.ok++;
  m[d][w] = it; C.set(K_WTRAIN, m);
  return it;
};
S.trainToday = function(){ var m = C.get(K_WTRAIN, {}); return m[today()] || {} };
/* 补例句（词已在生词本里但没例句时覆盖写入） */
S.srsSetCtx = function(w, ctx, cz, src, hl){
  var m = S.srsAll(), k = String(w||'').toLowerCase().replace(/[^a-z-]/g,'');
  var it = m[k]; if(!it) return false;
  if(ctx){ it.c = ctx; it.cz = cz||''; it.src = src||''; it.hl = hl||'' }
  it.up = Date.now();
  C.set(K_SRS, m);
  return true;
};
S.srsHasCtx = function(w){
  var m = S.srsAll(), k = String(w||'').toLowerCase().replace(/[^a-z-]/g,'');
  return !!(m[k] && m[k].c);
};
S.srsDel = function(k){ var m=S.srsAll(); delete m[k]; C.set(K_SRS,m) };
S.srsDue = function(){
  var m=S.srsAll(), t=today(), out=[];
  Object.keys(m).forEach(function(k){ if(m[k].due <= t) out.push(m[k]) });
  out.sort(function(a,b){ return a.due<b.due?-1:1 });
  return out;
};
/* grade: 0 忘了 / 1 模糊 / 2 记得 */
S.srsReview = function(k, grade){
  var m=S.srsAll(), it=m[k]; if(!it) return;
  var ef = it.ef||2.5, iv = it.iv||1;
  it.rep = (it.rep||0)+1;
  if(grade===0){ ef = Math.max(1.3, ef-0.20); iv = 1; }                      // 忘了：明天再来
  else if(grade===1){ ef = Math.max(1.3, ef-0.15); iv = Math.max(1, iv); }   // 模糊：间隔不变
  else { ef = Math.min(2.8, ef+0.10); iv = Math.max(iv+1, Math.round(iv*ef)); }
  it.ef = ef; it.iv = iv;
  it.due = dayAdd(today(), iv);
  it.last = Date.now();
  it.up = Date.now();
  C.set(K_SRS, m);
};
S.srsCount = function(){ var m=S.srsAll(); return {all:Object.keys(m).length, due:S.srsDue().length} };

/* ---------- 重置 ---------- */
S.wipeLearn = function(){
  /* 用 C.del 删：只删当前账号名下的，别的账号不受影响 */
  [K_LOG, K_SRS, K_DAY, K_WRONG, K_WMEM, K_WTRAIN].forEach(function(k){ C.del ? C.del(k) : localStorage.removeItem(k) });
};
})();
