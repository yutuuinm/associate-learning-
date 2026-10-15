/* 找答案：把考场上的主流做题方法做成"一步步带你找到依据"的流程
   原则：教你怎么找，不替你选。最后那层「按规律猜」明说是概率，不是答案。
   规则来源常见的公开技巧：先题后文定位、同义替换、绝对词慎选、
   相反项二选一、选项 ABCD 分布均匀、主旨题砍细节项 */
window.CET6 = window.CET6 || {};

(function(){
var C = window.CET6;
var SV = C.SOLVE = {};

/* ---------- 文本相似度（中英混排都能比） ---------- */
function normWords(s){
  return String(s||'').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5 ]/g,' ').replace(/\s+/g,' ').trim();
}
function bigrams(s){
  var t = String(s||'').replace(/[\s，。、；：""''（）()《》,.;:!?！？-]/g,'');
  var out = {};
  for(var i=0;i<t.length-1;i++) out[t.substr(i,2)] = 1;
  return out;
}
function cjkN(s){
  var n = String(s||'').match(/[\u4e00-\u9fa5]/g);
  return n ? n.length : 0;
}
/* 覆盖率：b 里有多少成分出现在 a 里 */
SV.cover = function(a, b){
  a = normWords(a); b = normWords(b);
  if(!a || !b) return 0;
  if(cjkN(a) > 4 && cjkN(b) > 4){
    var A = bigrams(a), ks = Object.keys(bigrams(b)), hit = 0;
    ks.forEach(function(k){ if(A[k]) hit++ });
    return ks.length ? hit/ks.length : 0;
  }
  var Y = {};
  a.split(' ').forEach(function(w){ if(w.length>1) Y[w]=1 });
  var bs = b.split(' ').filter(function(w){ return w.length>1 }), n = 0;
  bs.forEach(function(w){ if(Y[w]) n++ });
  return bs.length ? n/bs.length : 0;
};

/* ---------- 选项特征 ---------- */
var EXTREME = /(完全|彻底|绝对|必然|一律|全都|任何|所有|全部|唯一|必须|必定|永远|从不|毫无|只能|杜绝)/;
var EXTREME_EN = /\b(all|never|always|entirely|completely|only|must|impossible|eliminate|none|every|totally|fully)\b/i;
var SOFT = /(可能|也许|或许|通常|往往|大致|部分|一定程度上|未必|不见得|倾向|一般来说|相对|有限|并不总是)/;
var SOFT_EN = /\b(may|might|could|some|partly|usually|often|tend|perhaps|possibly|generally|likely)\b/i;
var PAIRS = [
  ['增加','减少'],['上升','下降'],['提高','降低'],['支持','反对'],['肯定','否定'],
  ['成功','失败'],['扩大','缩小'],['有利','不利'],['有效','无效'],['加剧','缓解'],
  ['必要','不必要'],['促进','阻碍'],['增长','衰退'],['恶化','改善'],['削弱','加强'],
  ['允许','禁止'],['Necessary','unnecessary']
];
function isExtreme(o){ return EXTREME.test(o) || EXTREME_EN.test(o) }
function isSoft(o){ return SOFT.test(o) || SOFT_EN.test(o) }

/* 一对意思相反的选项（"两个相反项里有一个是答案"） */
SV.opposite = function(q){
  var o = q.o || [], n = o.length;
  for(var i=0;i<n;i++){
    for(var j=i+1;j<n;j++){
      for(var k=0;k<PAIRS.length;k++){
        var a = PAIRS[k][0], b = PAIRS[k][1];
        if(o[i].indexOf(a)>=0 && o[j].indexOf(b)>=0) return [i,j];
        if(o[i].indexOf(b)>=0 && o[j].indexOf(a)>=0) return [i,j];
      }
    }
  }
  return null;
};

/* ---------- 题干里的定位词 ---------- */
SV.keys = function(q){
  var s = String(q.q||''), out = [];
  (s.match(/\d+(\.\d+)?/g)||[]).forEach(function(x){ out.push(x) });
  (s.match(/[A-Za-z][A-Za-z'-]{2,}/g)||[]).forEach(function(x){ out.push(x) });
  (s.match(/[「"']([^」"']{2,20})[」"']/g)||[]).forEach(function(x){
    out.push(x.replace(/[「」"']/g,''));
  });
  var p = s.match(/第\s*[一二三四五六七八九十\d]+\s*段/);
  if(p) out.push(p[0]);
  if(out.length < 2){
    String(s).split(/[\s，。、；：,.;:？?！!（）()]+/).forEach(function(x){
      if(x.length>=2 && x.length<=8) out.push(x);
    });
  }
  var seen = {}, res = [];
  out.forEach(function(x){ if(!seen[x]){ seen[x]=1; res.push(x) } });
  return res.slice(0,6);
};

/* ---------- 逐项排雷标签 ---------- */
SV.tags = function(q){
  var o = q.o || [], out = [];
  var base = String(q.locZh || '') + ' ' + String(q.why || '');
  var covs = o.map(function(x){ return SV.cover(base, x) });
  var maxCov = Math.max.apply(null, covs.concat([0]));
  o.forEach(function(x, i){
    if(isExtreme(x)) out.push({i:i, tag:'bad', text:'有极端词，慎选'});
    else if(isSoft(x)) out.push({i:i, tag:'good', text:'留有余地，更像答案'});
    if(base.length>8 && covs[i]>0.55 && covs[i]>=maxCov)
      out.push({i:i, tag:'warn', text:'几乎照抄原文依据，多半是干扰项'});
    if(base.length>8 && covs[i]<0.08 && maxCov>0.25)
      out.push({i:i, tag:'warn', text:'原文依据里找不到对应内容'});
    if(q.type==='main' && String(x).length<=8)
      out.push({i:i, tag:'warn', text:'太窄，主旨题里多半是段落细节'});
  });
  var opp = SV.opposite(q);
  if(opp){
    out.push({i:opp[0], tag:'mid', text:'这两项意思相反，答案多半在它俩里'});
    out.push({i:opp[1], tag:'mid', text:'这两项意思相反，答案多半在它俩里'});
  }
  return out;
};

/* ---------- 本套已选答案分布（ABCD 大致均匀） ---------- */
SV.dist = function(){
  var ans = (C.TOOLS && C.TOOLS.ansOf) ? C.TOOLS.ansOf() : {};
  var d = {A:0,B:0,C:0,D:0}, tot = 0;
  Object.keys(ans||{}).forEach(function(k){
    var v = ans[k];
    if(v == null || v < 0) return;
    var L = String.fromCharCode(65+v);
    if(d[L] == null) return;
    d[L]++; tot++;
  });
  d._tot = tot;
  return d;
};

/* ---------- 完全没读懂时的兜底猜测（明说：这是概率不是答案） ---------- */
SV.blind = function(q){
  var o = q.o || [], n = o.length;
  if(!n) return null;
  var tags = SV.tags(q), ext = {}, soft = {}, i;
  tags.forEach(function(t){
    if(t.text.indexOf('极端词')>=0) ext[t.i]=1;
    if(t.text.indexOf('留有余地')>=0) soft[t.i]=1;
  });
  var cand = [];
  for(i=0;i<n;i++) if(!ext[i]) cand.push(i);
  var reasons = [];
  if(!cand.length){ for(i=0;i<n;i++) cand.push(i) }
  else reasons.push('先砍掉带极端词的选项');

  var opp = SV.opposite(q);
  if(opp && cand.indexOf(opp[0])>=0 && cand.indexOf(opp[1])>=0){
    reasons.push('有一对意思相反的选项，答案多半在它俩里');
    cand = [opp[0], opp[1]];
  }
  if(cand.length > 1){
    var s2 = cand.filter(function(i){ return soft[i] });
    if(s2.length){ cand = s2; reasons.push('剩下的里面，语气留有余地的更常被设为答案') }
  }
  if(cand.length > 1){
    var d = SV.dist();
    if(d._tot >= 3){
      var min = 99;
      Object.keys(d).forEach(function(k){ if(k.charAt(0)==='_') return; if(d[k]<min) min=d[k] });
      var low = null;
      for(var j=0;j<n;j++){
        if(d[String.fromCharCode(65+j)] === min && cand.indexOf(j)>=0){ low = j; break }
      }
      if(low != null){ cand = [low]; reasons.push('这套已经选过的里面 '+String.fromCharCode(65+low)+' 最少，按分布均匀的规律补它') }
    }
  }
  if(cand.length > 1){
    var best = cand[0];
    cand.forEach(function(i){ if(String(o[i]).length > String(o[best]).length) best = i });
    cand = [best];
    reasons.push('几个都差不多时，信息量更大的那个略占优');
  }
  return {i:cand[0], reasons:reasons};
};

/* ---------- 按题型的一句话方法 ---------- */
SV.METHOD = {
  main:    ['先看<b>首尾段</b>和各段首句，抓住反复出现的那个对象。',
            '排除只讲某一段、某个人名地名的选项——那是细节不是主旨。',
            '正确项常长这样：「某事物的<b>问题 + 成因</b>」「某做法的<b>评价</b>」。'],
  detail:  ['题干里挑<b>专有名词 / 数字 / 大写</b>做定位词，回原文扫读。',
            '答案基本在定位句的<b>同一句或前后一句</b>，不跨段。',
            '细节题不许推理：选项里出现原文没有的推论，直接排除。'],
  meaning: ['答案八成在<b>这个词的下一句</b>（解释句）。',
            '把选项逐一代回原句，读不通的先砍。',
            '别按中文直译选，考的是它在<b>这个语境</b>里的意思。'],
  attitude:['先砍极端项（完全 / 彻底 / 绝对 / 毫不）。',
            '找 however、yet、in fact 后面的<b>评价句</b>，态度藏在那儿。',
            '正确项通常是「承认一部分、保留一部分」。'],
  infer:   ['正确项是原文的<b>同义改写</b>，出现全新概念的直接排除。',
            '回到定位句逐词比对：主语、时态、范围被改过的就是陷阱。',
            '推断题只能走到「原文推一步」，走两步就过头了。'],
  vocab:   ['看空格<b>前后的搭配</b>：介词、并列、转折基本能定答案。',
            '四个词都认识，考的就是<b>用法</b>，不是意思。',
            '把选项代回句子默读一遍，语感不对的先扔。'],
  meaning2:['回到你见过这个词的<b>那个句子</b>，想它的搭配对象。',
            '四个选项里三个是同一词性，靠词性排不掉。'],
  match:   ['先题后文：圈<b>数字、大写、专有名词</b>，回原文扫。',
            '不用读懂，找<b>关键词复现</b>最多的那一段。',
            '一段可能匹配多道题，别匹配过一次就不看了。']
};
SV.methodOf = function(type){ return SV.METHOD[type] || SV.METHOD.detail };
})();
