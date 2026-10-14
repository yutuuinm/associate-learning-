/* 核心：设置管理 / 划词提示 / AI 接口 / 辅助提示分级 / 工具函数 */
window.CET6 = window.CET6 || {};

(function(){
var C = window.CET6;
var KEY='cet6_settings_v1', PKEY='cet6_profile_v1', DCACHE='cet6_dictcache_v1';

/* ---------- 设置 ---------- */
var DEF = {
  hoverTip:true,   // 鼠标移到词上给提示
  assist:2,        // 0 关（模拟考试）1 只给方向 2 方向+定位 3 全开（含解析）
  instant:true,    // 即时反馈（学习模式）
  ai:{enabled:false, baseUrl:'https://api.openai.com/v1', key:'', model:'gpt-4o-mini'}
};
C.settings = Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY)||'{}'));
if(!C.settings.ai) C.settings.ai = Object.assign({}, DEF.ai);
C.saveSettings = function(){ localStorage.setItem(KEY, JSON.stringify(C.settings)) };

/* ---------- 工具 ---------- */
C.$=function(i){return document.getElementById(i)};
C.esc=function(s){return String(s==null?'':s).replace(/&/g,'&#38;').replace(/</g,'&#60;').replace(/>/g,'&#62;').replace(/"/g,'&#34;')};
C.get=function(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
C.set=function(k,v){localStorage.setItem(k,JSON.stringify(v))};

/* ---------- 词典查询（带回退还原） ---------- */
C.lookup=function(raw){
  var w=String(raw||'').toLowerCase().replace(/[^a-z-]/g,'');
  if(!w) return null;
  var D=C.DICT||{};
  if(D[w]) return D[w];
  var t=[];
  if(/ies$/.test(w)) t.push(w.replace(/ies$/,'y'));
  if(/(ches|shes|xes|sses|zes)$/.test(w)) t.push(w.slice(0,-2));
  if(/s$/.test(w)) t.push(w.slice(0,-1));
  if(/ed$/.test(w)) t.push(w.slice(0,-2), w.slice(0,-1));
  if(/ing$/.test(w)) t.push(w.slice(0,-3), w.slice(0,-3)+'e');
  if(/ly$/.test(w)) t.push(w.slice(0,-2));
  for(var i=0;i<t.length;i++) if(D[t[i]]) return D[t[i]];
  var cache=C.get(DCACHE,{});
  return cache[w]||null;
};
C.cacheWord=function(w,def){
  var c=C.get(DCACHE,{}); c[String(w).toLowerCase()]=def; C.set(DCACHE,c);
};

/* ---------- AI 接口（可选） ---------- */
C.aiReady=function(){var a=C.settings.ai; return !!(a&&a.enabled&&a.baseUrl&&a.key)};
C.aiChat=async function(prompt, maxTok){
  if(!C.aiReady()) return null;
  var a=C.settings.ai;
  try{
    var r=await fetch(a.baseUrl.replace(/\/+$/,'')+'/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+a.key},
      body:JSON.stringify({model:a.model||'gpt-4o-mini',messages:[{role:'user',content:prompt}],
        temperature:0.3,max_tokens:maxTok||200})
    });
    if(!r.ok) return null;
    var j=await r.json();
    var t=j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;
    return t?String(t).trim():null;
  }catch(e){ return null }
};
/* 词典没有时，用 AI 补释义 */
C.aiDefine=async function(word, ctx){
  var out=await C.aiChat('你是英语词汇老师。给出单词 "'+word+'" 在大学英语六级考试语境下的中文释义。'+(ctx?('上下文：'+ctx+'\n'):'')+
    '只输出一行，格式严格为：词性. 中文释义（不超过 12 个汉字）。不要任何解释。',60);
  return out;
};

/* 整段翻译：没有内置译文时的兜底 */
C.aiTranslate = async function(text){
  var out = await C.aiChat('你是大学英语六级考试的翻译助手。把下面这段英文翻成通顺的中文。' +
    '要求：忠实原文、语序自然、专有名词保留英文。只输出译文，不要任何说明、不要加标题。\n\n' + text, 900);
  return out;
};

/* ---------- 可划词 HTML ---------- */
C.words=function(text){
  return C.esc(text).replace(/([A-Za-z][A-Za-z'-]*)/g,function(m){
    return '<span class="w'+(C.lookup(m)?' hit':'')+'">'+m+'</span>';
  });
};
C.sentHTML=function(en,zh){
  return '<span class="s" data-t="'+C.esc(zh)+'">'+C.words(en)+'</span> ';
};

/* ---------- 取词所在的句子（原文 + 译文） ---------- */
/* node 是 .w 或任意节点，往上找最近的 .s[data-t] */
C.sentOf=function(node){
  var s = node && node.closest ? node.closest('.s[data-t]') : null;
  if(!s) return null;
  return {en:String(s.textContent||'').trim(), zh:s.getAttribute('data-t')||''};
};
/* 当前页面的来源标签（哪篇/哪套），写进生词本例句里 */
C.srcLabel=function(){
  var h = String(location.hash||'');
  var m = h.match(/#\/(read|listen|match|cloze)\/([^/?]+)/);
  if(m) return (m[1]==='read'?'仔细阅读':m[1]==='listen'?'听力':m[1]==='match'?'长篇匹配':'选词填空') + ' ' + m[2];
  var p = h.match(/#\/p\/(note|recite|bank|mech)\/?(.*)/);
  if(p) return '349 ' + (p[1]||'') + (p[2]?('/'+p[2]):'');
  return '';
};

/* ---------- 划词提示引擎（全局委托） ---------- */
var lastWord=null;
document.addEventListener('mouseover',function(e){
  if(!C.settings.hoverTip) return;
  var t=e.target;
  if(!t||!t.classList) return;
  if(t.classList.contains('w')){
    C.lastWord = String(t.textContent||'').toLowerCase().replace(/[^a-z-]/g,'');
    C.lastWordNode = t;
    var def=C.lookup(t.textContent);
    var tipEl=C.$('tip'); if(!tipEl) return;
    if(def){
      C.showTip(tipEl,t.textContent,def,'',e);
      lastWord=null;
    }else{
      var w=String(t.textContent).toLowerCase().replace(/[^a-z-]/g,'');
      if(w.length>2 && C.aiReady() && lastWord!==w){
        lastWord=w;
        C.showTip(tipEl,t.textContent,'正在查询…','ai',e);
        var node=tipEl;
        C.aiDefine(w,'').then(function(d){
          if(!d) return;
          C.cacheWord(w,d);
          t.classList.add('hit');
          if(node.style.display==='block') C.showTip(node,w,d,'ai',null);
        });
      }
    }
  }
  var s=t.classList.contains('s')?t:(t.closest?t.closest('.s,.loc'):null);
  if(s){
    var z=s.getAttribute('data-t');
    var tt=C.$('tt');
    if(z&&tt){ tt.innerHTML=C.esc(z); tt.className='' }
  }
});
document.addEventListener('mouseout',function(e){
  var t=e.target;
  if(t&&t.classList&&t.classList.contains('w')){
    var tipEl=C.$('tip'); if(tipEl) tipEl.style.display='none';
  }
});
C.showTip=function(el,word,def,tag,e){
  el.innerHTML='<div class="tw">'+C.esc(word)+'</div><div class="tc">'+C.esc(def)+'</div>'+(tag?'<div class="ai">AI 生成</div>':'');
  el.style.display='block';
  if(!e) return;
  var x=e.clientX+14, y=e.clientY+18;
  if(x+340>window.innerWidth) x=window.innerWidth-350;
  if(y+90>window.innerHeight) y=window.innerHeight-100;
  el.style.left=x+'px'; el.style.top=y+'px';
};

/* ---------- 划选工具条（收词 / 翻译 / 复制） ---------- */
var SEL_CLEAN_WORD = /^[A-Za-z][A-Za-z'-]*$/;
C._sel = null;
C.hideSelBar = function(){
  var b = C.$('selbar'); if(b) b.style.display = 'none';
  C._sel = null;
};
document.addEventListener('mouseup', function(e){
  /* 点工具条自己时不处理 */
  if(e && e.target && e.target.closest && e.target.closest('#selbar')) return;
  setTimeout(function(){
    var s = window.getSelection && window.getSelection();
    var txt = s ? String(s.toString()||'').replace(/\s+/g,' ').trim() : '';
    var bar = C.$('selbar');
    if(!bar) return;
    if(!txt || txt.length < 1){ C.hideSelBar(); return }
    var r = null;
    try{ r = s.getRangeAt(0).getBoundingClientRect() }catch(err){ r = null }
    if(!r || (!r.width && !r.height)){ C.hideSelBar(); return }
    var one = SEL_CLEAN_WORD.test(txt);
    C._sel = {
      txt: txt,
      one: one,
      word: one ? txt.toLowerCase().replace(/[^a-z-]/g,'') : '',
      en: /[A-Za-z]/.test(txt),
      node: (s.anchorNode && s.anchorNode.nodeType === 1) ? s.anchorNode : (s.anchorNode ? s.anchorNode.parentNode : null)
    };
    bar.style.display = 'flex';
    var bw = bar.querySelector('[data-a="word"]');
    if(bw) bw.style.display = (one && C._sel.word.length > 1) ? '' : 'none';
    var x = r.left + r.width/2, y = r.top;
    if(y < 60) y = r.bottom + 8;                       // 选区太靠上就挂下面
    bar.style.left = Math.max(70, Math.min(window.innerWidth - 70, x)) + 'px';
    bar.style.top = y + 'px';
  }, 5);
});
document.addEventListener('mousedown', function(e){
  if(e && e.target && e.target.closest && e.target.closest('#selbar')) return;  /* 别清掉选区 */
  var bar = C.$('selbar');
  if(bar && bar.style.display !== 'none' && e && e.target && e.target.closest && !e.target.closest('#selbar')){
    /* 延迟到 mouseup 再决定，这里先不动 */
  }
});
/* 滚动或翻页时收起 */
document.addEventListener('scroll', function(){ C.hideSelBar() }, true);

/* ---------- 辅助提示：题型标签与解题口诀 ---------- */
C.TYPE={
 main:   {n:'主旨题', tip:'主旨题抓贯穿全文的对象。排除带具体例子、具体人名地名的选项——那是段落细节。正确项长相通常是「某事物的问题 / 及原因」。'},
 detail: {n:'细节题', tip:'细节题不做推理，必须有原文逐词对应。先拿题干的名词去原文扫定位，再看那句话。'},
 meaning:{n:'词义句意题', tip:'词义题别按中文直译。答案九成在生词所在句的<b>下一句</b>（解释句）。正确项必须能解释上下文现象。'},
 attitude:{n:'态度题', tip:'态度题先砍极端项（entirely / completely / only / never）。正确项几乎都是「承认一部分、保留一部分」。找 however 后的评价句。'},
 infer:  {n:'推断题', tip:'推断题正确项是原文的<b>同义改写</b>，不是新信息。选项里出现原文没有的新概念，直接排除。'}
};
C.assistL1=function(type){ var t=C.TYPE[type]; return t?('<b>'+t.n+'</b>：'+t.tip):'' };

/* 题干关键词高亮：标出题眼 */
C.eyeWords=/mainly|primarily|inferred|imply|implies|suggest|attitude|tone|purpose|according to|mean|meaning|refer|best title|conclude|except|not true/i;
C.markEye=function(q){
  return C.esc(q).replace(/(mainly|primarily|inferred|imply|implies|attitude|according to|conclude|except)/gi,
    '<b style="color:#A32D2D">$1</b>');
};
/* 选项里的绝对化词预警 */
C.absWords=/\b(all|never|always|entirely|completely|only|must|impossible|eliminate|none|every|totally)\b/i;
C.markAbs=function(o){
  return C.esc(o).replace(/\b(all|never|always|entirely|completely|only|must|impossible|eliminate|none|every|totally)\b/gi,
    '<span style="border-bottom:1.5px wavy #BA7517;text-decoration:underline wavy #BA7517">$1</span>');
};
})();
