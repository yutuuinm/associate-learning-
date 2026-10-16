/* 统一英语核心词库：六级 + 考研英语合并去重，按「频度」分成 5 阶
   ---------------------------------------------------------------
   为什么合并：六级和考研英语的高频词重叠度很高（401 个并集里有 235 个两套都收）。
   分开背等于把同一批核心词背两遍，而真正的差别只在「专科词」上。

   分阶规则（band 越小越该先背）：
     band 1  两套都收 + 两边都标 1 档   —— 最高频，不认识基本没法做题
     band 2  两套都收 + 一高一中/双中   —— 高频
     band 3  两套都收但偏低，或只在一套收却是那套的 1 档 —— 中高频
     band 4  只在一套收，该套标 2 档     —— 中频
     band 5  只在一套收，该套标 3 档     —— 一般，查漏用

   词表条目：{w 词, d 释义, f 原档位, band 阶, fc 六级档(0=没收), fk 考研档(0=没收)}
   释义取两套里更详细的那条；band 相同的词按字母序排，方便定位。 */
window.CET6 = window.CET6 || {};

(function(){
var C = window.CET6;

var V = C.VE = {
  key:'en',
  name:'英语核心词',
  desc:'六级 + 考研英语合并去重，按频度分 5 阶',
  words:[],
  passages:[],
  bands:{},                                  /* band -> [词条] */
  bandName:{1:'最高频',2:'高频',3:'中高频',4:'中频',5:'一般'},
  bandDesc:{
    1:'六级、考研都收，且都标为最高频 —— 这批词不认识，阅读基本寸步难行。',
    2:'两套都收，频度居中 —— 决定你能不能把句子读顺。',
    3:'通用词里偏后的一批，加上某一套特别看重的高频词。',
    4:'只在六级或只在考研里出现的中频词 —— 按你的目标挑着背。',
    5:'出现频率一般，属于查漏补缺，考前过一遍即可。'
  }
};

/* ---------- 合并：同形词只留一条，记下两套各自的档位 ---------- */
var map = {};
function put(w, d, f, src){
  var k = String(w||'').toLowerCase();
  if(!k) return;
  var e = map[k];
  if(!e){ e = map[k] = {w:w, d:d, fc:0, fk:0} }
  if(src === 'cet6') e.fc = f; else e.fk = f;
  /* 释义保留更详细的一条——两条信息往往互补，长的通常带搭配 */
  if(String(d||'').length > String(e.d||'').length) e.d = d;
}
(C.VC && C.VC.words || []).forEach(function(x){ put(x.w, x.d, x.f, 'cet6') });
(C.VK && C.VK.words || []).forEach(function(x){ put(x.w, x.d, x.f, 'kaoyan') });

/* ---------- 分阶 ---------- */
function bandOf(e){
  if(e.fc && e.fk){                          /* 两套都收：看档位之和 */
    var s = e.fc + e.fk;
    return s <= 2 ? 1 : s <= 4 ? 2 : 3;
  }
  var f = e.fc || e.fk;                      /* 只在一套：按那套的档位后移 */
  return f <= 1 ? 3 : f <= 2 ? 4 : 5;
}

var all = Object.keys(map).map(function(k){ return map[k] });
all.forEach(function(e){
  e.band  = bandOf(e);
  e.f     = (e.fc && e.fk) ? Math.min(e.fc, e.fk) : (e.fc || e.fk);
  e.both  = !!(e.fc && e.fk);
  e.only  = e.fc ? (e.fk ? '' : 'cet6') : 'kaoyan';
});
all.sort(function(a,b){ return a.band - b.band || (String(a.w) < String(b.w) ? -1 : 1) });

V.words = all;
all.forEach(function(e){ (V.bands[e.band] = V.bands[e.band] || []).push(e) });

/* ---------- 查询接口 ---------- */
V.band      = function(b){ return V.bands[b] || [] };
V.bandCount = function(b){ return (V.bands[b] || []).length };
V.total     = function(){ return all.length };
V.byWord    = function(w){
  var k = String(w||'').toLowerCase();
  return map[k] || null;
};
/* 词形还原用的正则：一个词表里是 analyze，文章里可能是 analysed / analyzing。
   英语还在词尾加后缀前先脱 e，所以「词干 + 可选 e + 后缀」这样匹配：
     analyze → \b analyze? (?:s|d|ing|...)? \b    能命中 analyze/analyzes/analyzed/analyzing */
var _reCache = {};
function reFor(w){
  if(_reCache[w]) return _reCache[w];
  var s = String(w||'').toLowerCase().replace(/[^a-z-]/g,'');
  if(!s){ _reCache[w] = null; return null }
  var stem = s.replace(/e$/, '');
  if(stem.length < 3) stem = s;
  var r = new RegExp('\\b' + stem.replace(/[-]/g,'\\-')
        + 'e?(?:s|es|ed|d|ing|ly|ment|tion|sion|ive|able|ent|ance|ence|al|er|est)?\\b');
  _reCache[w] = r;
  return r;
}
V.reFor = reFor;
/* 一段文本里出现的核心词（按阶排序：低阶 = 更高频，排前面） */
V.hit = function(txt){
  var low = String(txt||'').toLowerCase();
  if(!low) return [];
  var out = [], i, e, re;
  for(i = 0; i < all.length; i++){
    e = all[i]; re = reFor(e.w);
    if(re && re.test(low)) out.push(e);
  }
  return out;
};

})();
