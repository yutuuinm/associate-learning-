/* 349 学习闭环：答题记录 / 章节掌握度 / 错题本 / 带背自评
   与 CET-6 的 STATS 完全分开存（前缀 pharm_），互不干扰 */
window.CET6 = window.CET6 || {};

(function(){
var C = window.CET6;
var Q = C.PHARMQ = {};
var P = C.PHARM || {};

var K_LOG = 'pharm_log_v1',      // 每次判分一条
    K_CH  = 'pharm_ch_v1',       // 章节累计 { chId: {tot, ok, last} }
    K_WR  = 'pharm_wrong_v1',    // 错题本
    K_MK  = 'pharm_mark_v1',     // 带背自评 { ptKey: 0不会/1模糊/2会 }
    K_DAY = 'pharm_day_v1';      // 每日打卡

function today(){ var d=new Date(); return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()) }
function p2(n){ return n<10?('0'+n):(''+n) }
Q.today = today;

/* 走 C.get/C.set：登录后会带上账号前缀，药学的数据也就跟着账号走了 */
function get(k, d){ return (window.CET6 && window.CET6.get) ? window.CET6.get(k, d) : d }
function set(k, v){ if(window.CET6 && window.CET6.set) window.CET6.set(k, v) }

/* ============ 章节 / 科目映射 ============ */
var MAP = {};   // chId -> {c:courseKey, n:courseName, t:章名}
(function(){
  [['org','有机化学'],['ana','分析化学'],['bio','生物化学']].forEach(function(x){
    ((P[x[0]]||[])).forEach(function(ch){ MAP[ch.id] = {c:x[0], n:x[1], t:ch.t} });
  });
})();
Q.mapOf = function(chId){ return MAP[chId] || {c:'', n:'', t:chId} };

/* ============ 答题记录 ============ */
/* items: [{ch, qn, type, ok}]  ok: true/false/null(简答未判) */
Q.log = function(chId, items){
  var logs = get(K_LOG, []), chs = get(K_CH, {}), wr = get(K_WR, []);
  var dy = get(K_DAY, {}), t = today();
  var d = dy[t] || {q:0, ok:0, set:{}};
  var chRec = chs[chId] || {tot:0, ok:0, last:0};

  items.forEach(function(it){
    var ok = it.ok === true ? 1 : (it.ok === false ? 0 : null);
    logs.push({t:Date.now(), d:t, ch:chId, qn:it.qn, type:it.type||'', ok:ok});
    d.q++; if(ok===1) d.ok++;
    d.set[chId] = 1;
    if(ok !== null){
      chRec.tot++; if(ok===1) chRec.ok++;
      chRec.last = Date.now();
      if(ok===0) wrongHit(wr, chId, it.qn, false);
      else       wrongHit(wr, chId, it.qn, true);
    }
  });
  chs[chId] = chRec;
  dy[t] = d;
  if(logs.length > 6000) logs = logs.slice(-4000);
  set(K_LOG, logs); set(K_CH, chs); set(K_WR, wr); set(K_DAY, dy);
};
/* 错题：错了记一次；对了减一次，连续对 2 次毕业 */
function wrongHit(list, chId, qn, ok){
  var f = null;
  list.forEach(function(x){ if(x.ch===chId && x.qn===qn) f = x });
  if(ok){
    if(f){ f.fixed = (f.fixed||0)+1; f.last = Date.now() }
  }else{
    if(!f){ f = {ch:chId, qn:qn, n:0, fixed:0, last:0}; list.push(f) }
    f.n++; f.fixed = 0; f.last = Date.now();
  }
  return list;
}
Q.logs = function(){ return get(K_LOG, []) };
Q.chAll = function(){ return get(K_CH, {}) };
Q.chRec = function(chId){ return get(K_CH, {})[chId] || {tot:0, ok:0, last:0} };

/* ============ 错题本 ============ */
Q.wrongList = function(course){
  var l = get(K_WR, []).filter(function(x){ return (x.fixed||0) < 2 });
  if(course) l = l.filter(function(x){ return (Q.mapOf(x.ch).c === course) });
  l.sort(function(a,b){ return (b.last||0)-(a.last||0) });
  return l;
};
/* 找到错题对应的原题对象，供错题本直接展示 */
Q.findQ = function(chId, qn){
  var list = [];
  [['org'],['ana'],['bio']].forEach(function(x){ (P[x[0]]||[]).forEach(function(ch){ list.push(ch) }) });
  var f = null;
  list.forEach(function(ch){ if(ch.id===chId) f = ch });
  if(!f) return null;
  var q = null;
  (f.qs||[]).forEach(function(x){ if(x.n === qn) q = x });
  if(!q) return null;
  return {ch:f, q:q, course:Q.mapOf(chId)};
};
Q.wrongGraduate = function(chId, qn){     // 手动标记"已掌握"
  var l = get(K_WR, []);
  l.forEach(function(x){ if(x.ch===chId && x.qn===qn) x.fixed = 2 });
  l = l.filter(function(x){ return (x.fixed||0) < 2 });
  set(K_WR, l);
};
Q.wrongClear = function(course){
  var l = get(K_WR, []);
  if(course) l = l.filter(function(x){ return Q.mapOf(x.ch).c !== course });
  set(K_WR, l);
};
Q.wrongCount = function(course){ return Q.wrongList(course).length };

/* ============ 带背自评 ============ */
/* 0 不会 / 1 模糊 / 2 会；key 用知识点正文前 20 字做稳定键 */
Q.markKey = function(pt){ return String(pt && (pt.k||pt.a) || '').slice(0,24) };
Q.mark = function(pt, g){
  var m = get(K_MK, {});
  if(g == null) delete m[Q.markKey(pt)];
  else m[Q.markKey(pt)] = {g:g, t:Date.now()};
  set(K_MK, m);
};
Q.markOf = function(pt){ var m = get(K_MK, {})[Q.markKey(pt)]; return m ? m.g : null };
Q.markAll = function(){ return get(K_MK, {}) };
/* 某章的自评统计 */
Q.markStat = function(ch){
  var m = get(K_MK, {}), s = {no:0, mid:0, yes:0, all:0};
  (ch.pts||[]).forEach(function(p){
    var r = m[Q.markKey(p)];
    s.all++;
    if(!r) return;
    if(r.g===0) s.no++; else if(r.g===1) s.mid++; else s.yes++;
  });
  return s;
};
/* 全局自评统计 */
Q.markTotal = function(){
  var m = get(K_MK, {}), s = {no:0, mid:0, yes:0};
  Object.keys(m).forEach(function(k){ var g = m[k].g; if(g===0) s.no++; else if(g===1) s.mid++; else s.yes++ });
  return s;
};

/* ============ 掌握度 ============ */
/* 综合两部分：答题正确率（权重 0.6）+ 带背自评（权重 0.4）
   没有数据时返回 null，界面显示为"未测" */
Q.master = function(chId){
  var ch = null;
  [['org'],['ana'],['bio']].forEach(function(x){
    (P[x[0]]||[]).forEach(function(c){ if(c.id===chId) ch = c });
  });
  var r = Q.chRec(chId);
  var quiz = r.tot >= 3 ? r.ok / r.tot : null;
  var ms = ch ? Q.markStat(ch) : {no:0,mid:0,yes:0,all:0};
  var rec = ms.yes + ms.mid > 0 ? (ms.yes + ms.mid*0.5) / (ms.yes + ms.mid + ms.no) : null;
  if(quiz == null && rec == null) return null;
  if(quiz == null) return Math.round(rec*100);
  if(rec == null) return Math.round(quiz*100);
  return Math.round((quiz*0.6 + rec*0.4) * 100);
};
/* 科目级：各章平均（只算有数据的章），并给出已测章数 */
Q.courseMaster = function(ck){
  var list = P[ck] || [], sum = 0, n = 0, weak = [];
  list.forEach(function(ch){
    var m = Q.master(ch.id);
    if(m != null){ sum += m; n++; if(m < 60) weak.push({id:ch.id, t:ch.t, m:m}) }
  });
  weak.sort(function(a,b){ return a.m-b.m });
  return {m: n ? Math.round(sum/n) : null, tested:n, total:list.length, weak:weak.slice(0,3)};
};
/* 总体 */
Q.totalMaster = function(){
  var s = 0, n = 0;
  ['org','ana','bio'].forEach(function(k){ var r = Q.courseMaster(k); if(r.m != null){ s += r.m; n++ } });
  return n ? Math.round(s/n) : null;
};
Q.level = function(m){
  if(m == null) return {t:'未测', c:'g'};
  if(m >= 85) return {t:'稳', c:'g'};
  if(m >= 70) return {t:'较熟', c:'b'};
  if(m >= 50) return {t:'一般', c:'y'};
  return {t:'薄弱', c:'r'};
};

/* ============ 每日 / 连续 ============ */
Q.day = function(d){ d = d||today(); return get(K_DAY,{})[d] || {q:0,ok:0,set:{}} };
Q.dayMap = function(){ return get(K_DAY, {}) };
Q.streak = function(){
  var m = get(K_DAY, {}), n = 0, d = today();
  function add(s,k){ var x=new Date(s+'T00:00:00'); x.setDate(x.getDate()+k); return x.getFullYear()+'-'+p2(x.getMonth()+1)+'-'+p2(x.getDate()) }
  if(!(m[d] && m[d].q)) d = add(d,-1);
  while(m[d] && m[d].q>0){ n++; d = add(d,-1) }
  return n;
};
Q.tot = function(){
  var l = Q.logs(), ok = 0, n = 0;
  l.forEach(function(r){ if(r.ok !== null){ n++; ok += r.ok } });
  return {tot:n, ok:ok, rate: n ? ok/n : 0};
};

/* ============ 重置 ============ */
Q.wipe = function(){
  [K_LOG, K_CH, K_WR, K_MK, K_DAY].forEach(function(k){
    if(window.CET6 && window.CET6.del) window.CET6.del(k);
    else try{ localStorage.removeItem(k) }catch(e){}
  });
};
/* 导出（供设置页备份） */
Q.dump = function(){
  return {log:Q.logs(), ch:Q.chAll(), wrong:get(K_WR,[]), mark:Q.markAll(), day:Q.dayMap()};
};
})();
