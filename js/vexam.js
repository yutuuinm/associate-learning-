/* 词汇训练：六级 / 考研核心词，按频度优先组卷
   卷子是**生成**的——每次从词库里抽词现组，不是固定的一套
   复用主练习引擎（practice）：划词、逐句翻译、分级提示、定位、判分、统计全部通用 */
window.CET6 = window.CET6 || {};

(function(){
var C = window.CET6;
var B = C.BANK || {};
var V = C.VEXAM = {};
var $ = C.$, esc = C.esc, get = C.get, set = C.set;

/* 两套词库：key -> {name, words, passages} */
var LIBS = { cet6:C.VC, kaoyan:C.VK };
V.LIBS = LIBS;
var EXAM = get('cet6_vexam','cet6');
if(!LIBS[EXAM]) EXAM = 'cet6';
V.exam = function(){ return EXAM };
V.lib = function(){ return LIBS[EXAM] || LIBS.cet6 };
V.setExam = function(k){
  if(!LIBS[k]) return;
  EXAM = k; set('cet6_vexam', k);
  V.route(['home']);
};

/* 把文章挂进题库，错题本才能定位到标题；
   标记 vexam 后，CET-6 题库页会过滤掉，不混在一起 */
(function(){
  ['cet6','kaoyan'].forEach(function(k){
    var lib = LIBS[k]; if(!lib) return;
    (lib.passages||[]).forEach(function(p){
      p.vexam = k;
      p.kind = 'reading';
      if(B.readings && B.readings.indexOf(p) < 0) B.readings.push(p);
    });
  });
})();

/* 词汇题的解题提示（接进分级提示系统） */
C.TYPE = C.TYPE || {};
C.TYPE.vocab = {n:'词汇题', tip:'先看句子里的<b>搭配和逻辑</b>：空格前后的介词、并列/转折关系、褒贬色彩。四个词都认识时，考的是<b>用法</b>不是意思。'};
C.TYPE.meaning = {n:'词义题', tip:'别按中文直译。回到你见过这个词的<b>那个句子</b>，想它的搭配对象。四个选项里三个是同词性的，靠词性排不掉。'};

/* ---------- 工具 ---------- */
function shuffle(a){
  a = a.slice();
  for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t }
  return a;
}
function posOf(d){ var m = String(d||'').match(/^([a-z]+)\./); return m ? m[1] : '' }
function stem(w){ return String(w||'').toLowerCase().replace(/[^a-z]/g,'').slice(0,5) }
V.shuffle = shuffle;

/* ---------- 词库统计 ---------- */
V.countByF = function(k){
  var lib = LIBS[k] || LIBS.cet6, out = {1:0,2:0,3:0};
  (lib.words||[]).forEach(function(w){ out[w.f] = (out[w.f]||0)+1 });
  return out;
};

/* ================= 路由 ================= */
V.route = function(parts){
  var v = parts[0] || 'home', arg = parts[1];
  var app = $('app'); if(!app) return;
  app.innerHTML = '';
  C.TOOLS.unbind();
  if(v === 'home') renderHome();
  else if(v === 'list') renderList(arg);
  else if(v === 'quiz') renderQuiz(arg);
  else if(v === 'read') renderRead(arg);
  else renderHome();
  window.scrollTo(0,0);
  markNav(v);
  crumb(v);
};
function crumb(v){
  var t = {home:'词汇训练', list:'核心词表', quiz:'生成卷子', read:'高频词文章'}[v] || '词汇训练';
  var c = $('crumb'); if(c) c.innerHTML = '<b>'+esc(t)+'</b>';
}
function markNav(v){
  var as = document.querySelectorAll('#menuVocab a');
  for(var i=0;i<as.length;i++){
    var hr = as[i].getAttribute('href')||'';
    as[i].className = (hr === '#/v/'+v || hr.indexOf('#/v/'+v+'/') === 0) ? 'on' : '';
  }
  ['#menuCet6 a','#menuPharm a'].forEach(function(sel){
    var bs = document.querySelectorAll(sel);
    for(var j=0;j<bs.length;j++) bs[j].className = '';
  });
  var sd = document.getElementById('side'); if(sd) sd.classList.remove('open');
}

/* ================= 总览 ================= */
function renderHome(){
  var lib = V.lib();
  var cnt = V.countByF(EXAM);
  var h = '<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
  h += '<h1 style="margin:0;flex:1">词汇训练</h1>';
  h += '<div class="seg">';
  [['cet6','六级'],['kaoyan','考研']].forEach(function(x){
    h += '<button class="'+(EXAM===x[0]?'on':'')+'" onclick="CET6.VEXAM.setExam(\''+x[0]+'\')">'+x[1]+'</button>';
  });
  h += '</div></div>';
  h += '<p class="sub" style="margin:8px 0 0">两套<b>核心词库</b>分开背，卷子是从词库里<b>现生成</b>的——每次抽的词不一样，越靠前的频度档越先被抽到。</p>';
  h += '<div class="grid" style="margin-top:14px">';
  h += '<div class="mc"><div class="l">核心词</div><div class="v">'+(lib.words||[]).length+'</div><div class="u">个</div></div>';
  h += '<div class="mc"><div class="l">高频（1 档）</div><div class="v">'+cnt[1]+'</div><div class="u">优先抽</div></div>';
  h += '<div class="mc"><div class="l">中频（2 档）</div><div class="v">'+cnt[2]+'</div><div class="u">次之</div></div>';
  h += '<div class="mc"><div class="l">低频（3 档）</div><div class="v">'+cnt[3]+'</div><div class="u">查漏</div></div>';
  h += '</div>';
  h += '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">';
  h += '<button class="primary big" onclick="location.href=\'#/v/quiz\'">生成一套卷子</button> ';
  h += '<button class="big" onclick="location.href=\'#/v/list\'">看核心词表</button>';
  h += '</div></div>';

  /* 频度说明 */
  h += '<div class="card"><h3>频度档怎么用</h3><ul class="list">';
  h += '<li><span class="tag">1 档</span><span class="g">高频。阅读和完形里反复出现，<b>先背完这一档</b>再往下走。组卷默认只抽这一档。</span></li>';
  h += '<li><span class="tag">2 档</span><span class="g">中频。认识即可，不要求主动拼写。</span></li>';
  h += '<li><span class="tag">3 档</span><span class="g">低频。用来查漏，考前扫一遍。</span></li>';
  h += '</ul></div>';

  /* 文章 */
  h += '<div class="card"><h3>高频词文章（'+esc(V.lib().name)+'）</h3>';
  h += '<p class="hint" style="margin:0 0 10px">文章本身就是用高频词写的，读一遍等于在语境里过一遍词。读的时候划选生词按 <kbd>S</kbd>，例句会自动存进生词本。</p>';
  h += '<ul class="list">';
  (lib.passages||[]).forEach(function(p){
    h += '<li><span class="g">'+esc(p.title)+'<div class="d">'+p.words+' 词 · '+(p.qs||[]).length+' 题</div></span>';
    h += '<button class="sm primary" onclick="location.href=\'#/v/read/'+p.id+'\'">读</button> ';
    h += '<button class="sm" onclick="CET6.VEXAM.genFrom(\''+p.id+'\')">用这篇出卷</button></li>';
  });
  h += '</ul></div>';
  $('app').innerHTML = h;
}

/* ================= 词表 ================= */
var LIST_F = get('cet6_vlistf','1'), LIST_Q = '';
function renderList(f){
  if(f) LIST_F = f, set('cet6_vlistf', f);
  var lib = V.lib();
  var words = (lib.words||[]).filter(function(w){
    if(LIST_F !== 'all' && String(w.f) !== String(LIST_F)) return false;
    if(LIST_Q){
      var q = LIST_Q.toLowerCase();
      return w.w.toLowerCase().indexOf(q) >= 0 || String(w.d).toLowerCase().indexOf(q) >= 0;
    }
    return true;
  });
  var h = '<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
  h += '<h1 style="margin:0;flex:1">核心词表 · '+esc(lib.name)+'</h1>';
  h += '<div class="seg">';
  [['cet6','六级'],['kaoyan','考研']].forEach(function(x){
    h += '<button class="'+(EXAM===x[0]?'on':'')+'" onclick="CET6.VEXAM.setExam(\''+x[0]+'\')">'+x[1]+'</button>';
  });
  h += '</div></div>';
  h += '<div class="chips" style="margin-top:12px">';
  [['1','高频'],['2','中频'],['3','低频'],['all','全部']].forEach(function(x){
    h += '<span class="chip'+(LIST_F===x[0]?' on':'')+'" onclick="location.href=\'#/v/list/'+x[0]+'\'">'+x[1]+'</span>';
  });
  h += '</div>';
  h += '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">';
  h += '<input type="text" id="vq" placeholder="搜词或释义" value="'+esc(LIST_Q)+'" style="flex:1;min-width:140px;width:auto" oninput="CET6.VEXAM.search(this.value)">';
  h += '<span class="hint" style="align-self:center">'+words.length+' 个词</span></div></div>';

  h += '<div class="card"><table class="wtbl"><thead><tr><th>词</th><th>释义</th><th class="n">档</th><th class="n">操作</th></tr></thead><tbody>';
  words.forEach(function(w){
    h += '<tr><td class="w">'+esc(w.w)+'</td><td>'+esc(w.d)+'</td><td class="n">'+w.f+'</td>';
    h += '<td class="n"><button class="sm" onclick="CET6.VEXAM.addWord(\''+esc(w.w)+'\',\''+esc(w.d)+'\')">收进生词本</button></td></tr>';
  });
  h += '</tbody></table></div>';
  $('app').innerHTML = h;
}
V.search = function(q){
  LIST_Q = q || '';
  renderList();
  var el = $('vq');
  if(el){ el.focus(); try{ el.setSelectionRange(el.value.length, el.value.length) }catch(e){} }
};
V.addWord = function(w, d){
  var S = C.STATS;
  var isNew = S.srsAdd(w, d, '', '', V.lib().name + '核心词', w);
  C.TOOLS.toast(isNew ? ('已收进生词本：'+w) : ('已经有了：'+w));
  C.TOOLS.refreshBadges();
};

/* ================= 组卷 ================= */
/* 题型：① 词义题（给词选义）② 语境题（句子挖空选词）
   频度低的档不会抢在高频前面——抽词严格按档位顺序 */
function pickWords(lib, n, fs){
  var pool = [];
  fs.forEach(function(f){
    pool = pool.concat((lib.words||[]).filter(function(w){ return String(w.f) === String(f) }));
  });
  if(!pool.length) pool = (lib.words||[]).slice();
  return shuffle(pool).slice(0, n);
}
function distracts(lib, w, d, n){
  var pos = posOf(d);
  var same = (lib.words||[]).filter(function(x){ return x.w !== w && posOf(x.d) === pos });
  var rest = (lib.words||[]).filter(function(x){ return x.w !== w && posOf(x.d) !== pos });
  var pool = shuffle(same).concat(shuffle(rest));
  return pool.slice(0, n);
}
/* 句子的词形还原：supports → support，improvements → improve
   不能用「前 N 个字符」匹配——suppose 和 supports 前 5 个字符一样，会张冠李戴 */
function baseForms(t){
  t = String(t||'').toLowerCase().replace(/[^a-z-]/g,'');
  if(!t) return [];
  var out = [t];
  if(/ies$/.test(t)) out.push(t.replace(/ies$/,'y'));
  if(/(ches|shes|xes|sses|zes)$/.test(t)) out.push(t.slice(0,-2));
  if(/s$/.test(t)) out.push(t.slice(0,-1));
  if(/ed$/.test(t)) out.push(t.slice(0,-2), t.slice(0,-1));
  if(/ing$/.test(t)) out.push(t.slice(0,-3), t.slice(0,-3)+'e');
  if(/ly$/.test(t)) out.push(t.slice(0,-2));
  if(/er$/.test(t)) out.push(t.slice(0,-2), t.slice(0,-1));
  if(/est$/.test(t)) out.push(t.slice(0,-3), t.slice(0,-2));
  return out;
}
/* 从文章里找出"真的出现过"的词库词，返回 [{w, en, zh, token, pid}]
   语境题只从这些里出——没在文章里出现过的词不做挖空，避免瞎挖
   pid 可选：只看某一篇（给"这篇覆盖哪些词"和"用这篇出卷"用） */
function pairsFromPassages(lib, fs, pid){
  var idx = {};
  (lib.words||[]).forEach(function(w){ idx[String(w.w).toLowerCase()] = w });
  var out = [], seen = {};
  (lib.passages||[]).forEach(function(p){
    if(pid && p.id !== pid) return;
    (p.text||[]).forEach(function(s){
      var toks = String(s[0]).split(/[^A-Za-z'-]+/);
      toks.forEach(function(t){
        if(t.length < 4) return;
        var hit = null;
        baseForms(t).forEach(function(b){ if(!hit && idx[b]) hit = idx[b] });
        if(!hit) return;
        if(fs.length && fs.indexOf(hit.f) < 0) return;
        if(seen[hit.w]) return;
        seen[hit.w] = 1;
        out.push({w:hit, en:s[0], zh:s[1], token:t, pid:p.id});
      });
    });
  });
  return out;
}
V.pairsFromPassages = pairsFromPassages;
V.pairCount = function(k, fs){
  return pairsFromPassages(LIBS[k] || LIBS.cet6, fs || [1,2,3]).length;
};
/* 某一篇文章覆盖了哪些核心词（不看档位，全列出来给读者看） */
V.coverOf = function(pid){
  var lib = V.lib();
  return pairsFromPassages(lib, [], pid).sort(function(a,b){
    return (a.w.f - b.w.f) || (a.w.w < b.w.w ? -1 : 1);
  });
};
/* 文章页底部：这篇覆盖的核心词，点一下就收进生词本（例句自动带上） */
V.coverCard = function(p){
  var lib = V.lib();
  var cov = V.coverOf(p.id);
  if(!cov.length) return '';
  var bands = {1:[],2:[],3:[]};
  cov.forEach(function(x){ (bands[x.w.f] || bands[3]).push(x) });
  var h = '<div class="vcov"><div class="vcovhd">';
  h += '<b>这篇覆盖的核心词 · '+cov.length+' 个</b>';
  h += '<span class="hint">点词收进生词本（原句自动存为例句）；点「在文中标出」高亮它们</span></div>';
  for(var f=1; f<=3; f++){
    var arr = bands[f]; if(!arr.length) continue;
    h += '<div class="vcovrow"><span class="tag">'+f+' 档</span>';
    arr.forEach(function(x){
      h += '<span class="vw"><button class="wbtn" onclick="CET6.VEXAM.addCW(\''+p.id+'\',\''+esc(x.w.w)+'\')" '
         + 'title="'+esc(x.w.d)+'｜'+esc(x.en)+'">'+esc(x.w.w)+'</button>'
         + '<span class="d">'+esc(x.w.d)+'</span></span>';
    });
    h += '</div>';
  }
  h += '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">';
  h += '<button class="sm" onclick="CET6.VEXAM.hlWords(\''+p.id+'\')">在文中标出</button> ';
  h += '<button class="sm" onclick="CET6.VEXAM.addAll(\''+p.id+'\')">全部收进生词本</button> ';
  h += '<button class="sm primary" onclick="CET6.VEXAM.genFrom(\''+p.id+'\')">用这篇出卷</button>';
  h += '</div></div>';
  return h;
};
/* 收一个覆盖词，例句 = 它在文中出现的那句 */
V.addCW = function(pid, word){
  var lib = V.lib();
  var hit = null;
  V.coverOf(pid).forEach(function(x){ if(!hit && x.w.w === word) hit = x });
  if(!hit) return;
  var S = C.STATS;
  var isNew = S.srsAdd(hit.w.w, hit.w.d, hit.en, hit.zh,
                       lib.name+'高频词文章《'+((psgTitle(pid))) +'》', word);
  C.TOOLS.toast(isNew ? ('已收进生词本：'+word) : ('已经有了：'+word));
  C.TOOLS.refreshBadges();
};
V.addAll = function(pid){
  var lib = V.lib(), S = C.STATS, n = 0;
  var t = psgTitle(pid);
  V.coverOf(pid).forEach(function(x){
    if(S.srsAdd(x.w.w, x.w.d, x.en, x.zh, lib.name+'高频词文章《'+t+'》', x.w.w)) n++;
  });
  C.TOOLS.toast(n ? ('已收 '+n+' 个词，例句都带上了') : '这些词都已经在生词本里了');
  C.TOOLS.refreshBadges();
};
function psgTitle(pid){
  var t = '', lib = V.lib();
  (lib.passages||[]).forEach(function(x){ if(x.id === pid) t = x.title || pid });
  return t || pid;
}
/* 在正文里高亮这些词（再点一次取消）；boxIn 给测试注入用 */
V.hlWords = function(pid, boxIn){
  var box = boxIn || document.querySelector('.passage'); if(!box) return;
  if(box.getAttribute('data-hl') === '1'){
    box.setAttribute('data-hl','');
    var olds = box.querySelectorAll('.w.vhl');
    for(var i=0;i<olds.length;i++) olds[i].className = 'w';
    return;
  }
  var set = {};
  V.coverOf(pid).forEach(function(x){ set[String(x.w.w).toLowerCase()] = 1 });
  var ws = box.querySelectorAll('.w');
  for(var j=0;j<ws.length;j++){
    var t = String(ws[j].textContent||'').toLowerCase();
    var ok = false;
    baseForms(t).forEach(function(b){ if(!ok && set[b]) ok = true });
    if(ok) ws[j].className = 'w vhl';
  }
  box.setAttribute('data-hl','1');
};
function blankIt(en, token){
  var re = new RegExp('\\b' + String(token).replace(/[-]/g,'\\-') + '\\b', 'i');
  return String(en).replace(re, '________');
}

V.genFrom = function(pid){
  /* 用指定文章的词出卷 */
  route2(['quiz', 'p_' + pid]);
};
function route2(p){ location.hash = '#/v/' + p.join('/') }

var QZ = {list:[], title:'', fs:[1], n:20};
function renderQuiz(arg){
  var lib = V.lib();
  var h = '';
  /* 参数：f1 / f12 / f123 / p_<id>（用某篇文章的词出卷） */
  var pid = null, psg = null;
  if(arg && arg.indexOf('p_') === 0){
    pid = arg.slice(2);
    (lib.passages||[]).forEach(function(x){ if(x.id === pid) psg = x });
    if(!psg){ $('app').innerHTML = '<div class="card"><div class="empty-st"><p>找不到这篇。</p><button class="primary" onclick="location.href=\'#/v/home\'">返回</button></div></div>'; return }
  }
  if(arg === 'new'){ /* 重新抽 */ }
  var fs = QZ.fs, n = QZ.n;
  if(pid){
    /* 指定文章时不按档位筛——这篇里出现过的词都算，读完就测 */
    fs = [1,2,3];
  }else{
    if(arg === 'f12') fs = [1,2];
    if(arg === 'f123') fs = [1,2,3];
    if(arg === 'f1') fs = [1];
    if(arg) QZ.fs = fs;
  }

  /* 语境题由文章驱动：只有在文章里真出现过的词才拿来挖空 */
  var pairs = shuffle(pairsFromPassages(lib, fs, pid));
  if(pid){
    /* 指定文章：这篇覆盖几个词就出几题，不外补——读完立刻测这篇的 */
    n = pairs.length || 1;
  }
  var nCtx = Math.min(pairs.length, Math.ceil(n/2));
  var ctxPicked = pairs.slice(0, nCtx);
  var usedWords = {};
  ctxPicked.forEach(function(p){ usedWords[p.w.w] = 1 });
  var meanSrc = [];
  if(pid){
    meanSrc = shuffle(pairs.filter(function(p){ return !usedWords[p.w.w] })).map(function(p){ return p.w });
  }else{
    /* 剩下的名额用词义题补，优先补高频 */
    meanSrc = pickWords(lib, n - nCtx + 8, fs).filter(function(w){ return !usedWords[w.w] });
  }
  var meanPicked = meanSrc.slice(0, n - nCtx);

  var qs = [], i = 0;
  ctxPicked.forEach(function(p){
    i++;
    var w = p.w;
    var ds = distracts(lib, w.w, w.d, 3).map(function(x){ return x.w });
    var opts = shuffle([w.w].concat(ds));
    qs.push({
      n:i, type:'vocab',
      q:'「' + blankIt(p.en, p.token) + '」\n句中空格应填入：（本句译文：' + p.zh + '）',
      o:opts, a:opts.indexOf(w.w),
      why:'答案 '+w.w+'（'+w.d+'）。回到原句看搭配：' + p.en,
      l2:'先读译文确认这句在讲什么，再看空格前后的词——介词和并列关系基本能定答案。',
      loc:p.en, locZh:p.zh, hot:5
    });
  });
  meanPicked.forEach(function(w){
    i++;
    var ds2 = distracts(lib, w.w, w.d, 3).map(function(x){ return x.d });
    var opts2 = shuffle([w.d].concat(ds2));
    qs.push({
      n:i, type:'meaning',
      q:'「' + w.w + '」的意思是：',
      o:opts2, a:opts2.indexOf(w.d),
      why:w.w + ' = ' + w.d + '。别和同词性的近义词混——词性相同排不掉，得靠搭配记。',
      l2:'想一下你见过这个词的句子，它的宾语/主语通常是什么。',
      loc:'', locZh:'', hot:5
    });
  });

  h += '<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
  h += '<h1 style="margin:0;flex:1">生成卷子 · '+esc(lib.name)+'</h1>';
  h += '<div class="seg">';
  [['cet6','六级'],['kaoyan','考研']].forEach(function(x){
    h += '<button class="'+(EXAM===x[0]?'on':'')+'" onclick="CET6.VEXAM.setExam(\''+x[0]+'\')">'+x[1]+'</button>';
  });
  h += '</div></div>';
  h += '<p class="sub" style="margin:8px 0 0">' + (psg
       ? '这一套只考《'+esc(psg.title)+'》里出现过的词：'
       : '这一套从<b>'+(fs.length===1?('第 '+fs[0]+' 档（高频）'):(fs.join('、')+' 档'))+'</b>里现抽 ')
     + '<b>'+ctxPicked.length+' 道语境题</b>（取自高频词文章的原句，考用法）+ <b>'+meanPicked.length+' 道词义题</b>（考释义），共 '+qs.length+' 题。'
     + '点「换一套」重新抽。</p>';
  h += '<div class="chips" style="margin-top:12px">';
  [['f1','只抽高频'],['f12','高频+中频'],['f123','三档全抽']].forEach(function(x){
    var on = (arg === x[0]) || (!arg && x[0] === 'f1');
    h += '<span class="chip'+(on?' on':'')+'" onclick="location.href=\'#/v/quiz/'+x[0]+'\'">'+x[1]+'</span>';
  });
  h += '<span class="chip" onclick="CET6.VEXAM.newQuiz()">↻ 换一套</span>';
  if(psg) h += '<span class="chip" onclick="location.href=\'#/v/read/'+psg.id+'\'">↩ 先读这篇</span>';
  h += '</div></div>';

  $('app').innerHTML = h;
  /* 交给主练习引擎渲染：划词、提示、定位、判分、统计全部复用 */
  C._practice({
    kind:'vocab', sid:'V' + EXAM + '_' + (pid ? pid : fs.join('')), pfx:'v', qs:qs,
    two:false, limit: n*30,
    note:'<span class="hint">词汇卷 · '+esc(lib.name)+(psg?(' · '+esc(psg.title)):'')+'</span>'
  });
}
V.newQuiz = function(){
  /* 同一个 hash 不会触发 hashchange，手动重渲染（保留 f 档位或文章 id） */
  var m = (location.hash||'').match(/\/quiz\/(p_[A-Za-z0-9_-]+|f\d+)/);
  V.route(['quiz'].concat(m ? [m[1]] : []));
};

/* ================= 文章精读 ================= */
function renderRead(id){
  var lib = V.lib();
  var p = null;
  (lib.passages||[]).forEach(function(x){ if(x.id === id) p = x });
  if(!p){
    /* 另一套里找，顺带切过去 */
    var other = EXAM === 'cet6' ? 'kaoyan' : 'cet6';
    (LIBS[other].passages||[]).forEach(function(x){ if(x.id === id) p = x });
    if(p){ EXAM = other; set('cet6_vexam', other) }
  }
  if(!p){ $('app').innerHTML = '<div class="card"><div class="empty-st"><p>找不到这篇。</p><button class="primary" onclick="location.href=\'#/v/home\'">回词汇训练</button></div></div>'; return }
  C._renderRead(id);
}
})();
