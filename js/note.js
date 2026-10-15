/* 摘抄本：把「读到好句子 / 长难句 → 存下来 → 回来把它吃透」这条路走通
   和生词本是两回事：生词本收的是**一个词**（按 Tab），摘抄本收的是**一整段**。
   存下来之后能做三件事：
     1. 逐句对照（选区命中内置译文时自动带上）
     2. 让 AI 拆句子：主干 / 修饰 / 生词 / 翻译
     3. 把这段里出现的核心词一次收进生词本（不依赖 AI，直接比词表）
   存 localStorage；开了云端同步会一起备份到 app_settings 表的 notes 键 */
window.CET6 = window.CET6 || {};

(function(){
var C = window.CET6;
var N = C.NOTE = {};
var K = 'cet6_notes_v1', K_TS = 'cet6_notes_ts', MAX = 500;

N.all = function(){ return C.get(K, []) };
N.count = function(){ return N.all().length };
N.get = function(ts){
  var a = N.all(), hit = null;
  a.forEach(function(x){ if(x.ts === ts) hit = x });
  return hit;
};
N.has = function(txt){
  var t = N.clean(txt), a = N.all();
  return a.some(function(x){ return x.t === t });
};
N.clean = function(txt){ return String(txt==null?'':txt).replace(/\s+/g,' ').trim() };
N.touch = function(){ C.set(K_TS, Date.now()) };

N.add = function(txt, zh, src){
  var t = N.clean(txt);
  if(!t) return false;
  var a = N.all();
  if(a.some(function(x){ return x.t === t })) return false;
  a.unshift({ t:t, zh:N.clean(zh), src:N.clean(src), ts:Date.now() });
  if(a.length > MAX) a = a.slice(0, MAX);
  C.set(K, a);
  N.touch();
  return true;
};
N.del = function(ts){
  C.set(K, N.all().filter(function(x){ return x.ts !== ts }));
  N.touch();
};
N.clear = function(){ C.set(K, []); N.touch() };

/* 这段里出现了哪些核心词（六级 / 考研两套词库，不依赖 AI 也能用）
   词形要放宽：文章里出现的是 compensates / deteriorating，不能只匹配原形。
   正则编译一次就缓存住——摘抄本一页要跑几十段，每次重编译会明显卡。 */
var _res = null;
function coreREs(){
  if(_res) return _res;
  _res = [];
  var libs = (C.VEXAM && C.VEXAM.LIBS) || {};
  Object.keys(libs).forEach(function(k){
    ((libs[k]||{}).words || []).forEach(function(w){
      var s = String(w.w||'').toLowerCase();
      if(s.length < 4) return;                         /* 太短的词误报多，跳过 */
      _res.push({ w:w, f:w.f||3,
        re: new RegExp('\\b' + s.replace(/[-]/g,'\\-') + '(?:s|es|ed|d|ing|ly)?\\b') });
    });
  });
  return _res;
}
N.core = function(txt){
  var low = N.clean(txt).toLowerCase();
  if(!low) return [];
  var out = [], seen = {};
  coreREs().forEach(function(x){
    var key = String(x.w.w).toLowerCase();
    if(seen[key]) return;
    if(x.re.test(low)){ seen[key] = 1; out.push(x.w) }
  });
  out.sort(function(a,b){ return a.f - b.f });     /* 高频排前面 */
  return out;
};
})();
