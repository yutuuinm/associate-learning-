/* 词汇训练：六级 / 考研核心词，按频度优先组卷
   卷子是**生成**的——每次从词库里抽词现组，不是固定的一套
   复用主练习引擎（practice）：划词、逐句翻译、分级提示、定位、判分、统计全部通用 */
window.CET6 = window.CET6 || {};

(function(){
var C = window.CET6;
var B = C.BANK || {};
var V = C.VEXAM = {};
var $ = C.$, esc = C.esc, get = C.get, set = C.set;

/* 统一词库：六级 + 考研英语合并去重后按频度分 5 阶（见 vocab-en.js） */
var LIBS = { en:C.VE };
V.LIBS = LIBS;
var EXAM = 'en';                       /* 不再分两套，保留变量只为兼容旧调用 */
V.exam = function(){ return EXAM };
V.lib  = function(){ return C.VE };
V.setExam = function(){ V.route(['home']) };

/* ---------- 阶（band）选择：1 最高频 → 5 一般 ---------- */
var BAND = get('cet6_vband','1');
if(BAND !== 'all' && !(BAND >= 1 && BAND <= 5)) BAND = '1';
V.band      = function(){ return BAND };
V.bandLabel = function(b){ return b === 'all' ? '全部' : ('第 ' + b + ' 阶') };
V.setBand = function(b){
  b = String(b);
  if(b !== 'all' && !(b >= 1 && b <= 5)) b = '1';
  BAND = (b === 'all') ? 'all' : Number(b);
  set('cet6_vband', BAND);
  V.route(['home']);
};
/* 当前阶涉及哪些词条（all = 全部） */
V.bandWords = function(){
  var V2 = C.VE;
  if(BAND === 'all') return V2.words;
  return V2.band(BAND);
};

/* 把文章挂进题库，错题本才能定位到标题；
   标记 vexam 后，英语题库页会过滤掉，不混在一起
   同时按文中真实出现的核心词反推 target，保证「本篇核心词」与高亮永远对得上 */
(function(){
  var lib = C.VE; if(!lib) return;
  (lib.passages||[]).forEach(function(p){
    p.vexam = 'en';
    p.kind  = 'reading';
    if(B.readings && B.readings.indexOf(p) < 0) B.readings.push(p);
    var joined = (p.text||[]).map(function(s){ return s[0] }).join(' ');
    var hit = lib.hit ? lib.hit(joined) : [];
    if(hit.length) p.target = hit.map(function(x){ return x.w });
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
V.countByBand = function(){
  var V2 = C.VE, out = {1:0,2:0,3:0,4:0,5:0};
  (V2.words||[]).forEach(function(w){ out[w.band] = (out[w.band]||0)+1 });
  return out;
};
V.countByF = V.countByBand;           /* 兼容旧名 */
/* 每阶里有多少篇短文 */
V.bandPassages = function(b){
  var out = 0;
  (C.VE.passages||[]).forEach(function(p){ if(b === 'all' || p.band === b) out++ });
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
  else if(v === 'passages') renderPassages();
  else if(v === 'read') renderRead(arg);
  else renderHome();
  window.scrollTo(0,0);
  markNav(v);
  crumb(v);
};
function crumb(v){
  var t = {home:'词汇训练', list:'核心词表', quiz:'生成卷子', read:'词汇短文', passages:'词汇递进短文'}[v] || '词汇训练';
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
  var cnt = V.countByBand();
  var h = '<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
  h += '<h1 style="margin:0;flex:1">词汇训练</h1>';
  h += '<div class="seg" id="bandSeg">';
  [[1,'第 1 阶'],[2,'第 2 阶'],[3,'第 3 阶'],[4,'第 4 阶'],[5,'第 5 阶'],['all','全部']].forEach(function(x){
    h += '<button class="'+(BAND===x[0]?'on':'')+'" onclick="CET6.VEXAM.setBand(\''+x[0]+'\')">'+x[1]+'</button>';
  });
  h += '</div></div>';
  h += '<p class="sub" style="margin:8px 0 0">词库是<b>六级 + 考研英语合并去重</b>后按频度分成 5 阶的——两套都收的词排在前面，因为那才是最该先拿下的部分。卷子从词库里<b>现生成</b>：只抽当前阶，抽完才往下补。</p>';
  h += '<div class="grid" style="margin-top:14px">';
  h += '<div class="mc"><div class="l">核心词（并集）</div><div class="v">'+(lib.words||[]).length+'</div><div class="u">个</div></div>';
  for(var b=1; b<=5; b++){
    h += '<div class="mc"><div class="l">第 '+b+' 阶 · '+esc(lib.bandName[b])+'</div>'
       + '<div class="v">'+cnt[b]+'</div><div class="u">'+V.bandPassages(b)+' 篇</div></div>';
  }
  h += '</div>';
  h += '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">';
  h += '<button class="primary big" onclick="location.href=\'#/v/quiz\'">生成一套卷子</button> ';
  h += '<button class="big" onclick="location.href=\'#/v/list\'">看核心词表</button> ';
  h += '<button class="big" onclick="location.href=\'#/v/passages\'">词汇递进短文</button>';
  h += '</div></div>';

  /* 分阶说明 */
  h += '<div class="card"><h3>五个阶是怎么分的</h3><ul class="list">';
  [1,2,3,4,5].forEach(function(b){
    h += '<li><span class="tag">'+b+'</span><span class="g"><b>'+esc(lib.bandName[b])+'</b> · '+cnt[b]+' 词 · '+V.bandPassages(b)+' 篇<br>'+esc(lib.bandDesc[b])+'</span></li>';
  });
  h += '</ul></div>';

  /* 文章：按阶列出 */
  var cur = BAND;
  var list = (lib.passages||[]).filter(function(p){ return cur === 'all' || String(p.band) === String(cur) });
  h += '<div class="card"><h3>词汇递进短文 · '+(cur==='all'?'全部':('第 '+cur+' 阶 '+esc(lib.bandName[cur])))+'（'+list.length+' 篇）</h3>';
  h += '<p class="hint" style="margin:0 0 10px">每篇都只用<b>本阶及以前的词</b>写成，从最高频往下走。读的时候划选生词按 <kbd>S</kbd>，例句会自动存进生词本。</p>';
  h += '<ul class="list">';
  list.forEach(function(p){
    h += '<li><span class="g">'+esc(p.title)+'<div class="d">'+p.words+' 词 · '+(p.qs||[]).length+' 题 · '+(p.target||[]).length+' 个核心词</div></span>';
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
  h += '<div class="seg" id="bandSeg">';
  [[1,'第 1 阶'],[2,'第 2 阶'],[3,'第 3 阶'],[4,'第 4 阶'],[5,'第 5 阶'],['all','全部']].forEach(function(x){
    h += '<button class="'+(BAND===x[0]?'on':'')+'" onclick="CET6.VEXAM.setBand(\''+x[0]+'\')">'+x[1]+'</button>';
  });
  h += '</div></div>';
  h += '<div class="chips" style="margin-top:12px">';
  [[1,'最高频'],[2,'高频'],[3,'中高频'],[4,'中频'],[5,'一般'],['all','全部']].forEach(function(x){
    h += '<span class="chip'+(LIST_F===x[0]?' on':'')+'" onclick="location.href=\'#/v/list/'+x[0]+'\'">'+x[1]+'</span>';
  });
  h += '</div>';
  h += '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">';
  h += '<input type="text" id="vq" placeholder="搜词或释义" value="'+esc(LIST_Q)+'" style="flex:1;min-width:140px;width:auto" oninput="CET6.VEXAM.search(this.value)">';
  h += '<span class="hint" style="align-self:center">'+words.length+' 个词</span></div></div>';

  h += '<div class="card"><table class="wtbl"><thead><tr><th>词</th><th>释义</th><th class="n">阶</th><th class="n">来源</th><th class="n">操作</th></tr></thead><tbody>';
  words.forEach(function(w){
    h += '<tr><td class="w">'+esc(w.w)+'</td><td>'+esc(w.d)+'</td><td class="n">'+w.band+'</td>';
    h += '<td class="n">'+(w.both?'六级+考研':(w.only==='cet6'?'六级':'考研'))+'</td>';
    h += '<td class="n"><button class="sm" onclick="CET6.VEXAM.addWord(\''+esc(w.w)+'\',\''+esc(w.d)+'\')">收进生词本</button></td></tr>';
  });
  h += '</tbody></table></div>';
  $('app').innerHTML = h;
}

/* ================= 词汇递进短文（50 篇 · 按阶） ================= */
/* 每篇只用「本阶及以前」的词写成，从第 1 阶（最高频）一路走到第 5 阶（一般）。
   读完一篇 → 立刻用这篇里的词出卷 → 收词进单词本 → 进遗忘曲线复习。 */
function renderPassages(){
  var lib = V.lib(), V2 = C.VE;
  var all = (lib.passages||[]).slice().sort(function(a,b){
    return (a.band - b.band) || (String(a.id) < String(b.id) ? -1 : 1);
  });
  var S = C.STATS;
  var done = {};
  try{ (S.log.all ? S.log.all() : []).forEach(function(r){ if(r && r.sid) done[r.sid] = 1 }) }catch(e){}
  var readN = 0;
  all.forEach(function(p){ if(done['V'+EXAM+'_'+p.id]) readN++ });

  var h = '<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
  h += '<h1 style="margin:0;flex:1">词汇递进短文</h1>';
  h += '<div class="seg" id="bandSeg">';
  [['all','全部'],[1,'第 1 阶'],[2,'第 2 阶'],[3,'第 3 阶'],[4,'第 4 阶'],[5,'第 5 阶']].forEach(function(x){
    h += '<button class="'+(BAND===x[0]?'on':'')+'" onclick="CET6.VEXAM.setBand(\''+x[0]+'\')">'+x[1]+'</button>';
  });
  h += '</div></div>';
  h += '<p class="sub" style="margin:8px 0 0">共 <b>'+all.length+'</b> 篇，已练 <b>'+readN+'</b> 篇。每篇 <b>5 题</b>，题目分成两类：'
     + '<b>语境题</b>直接用短文原句挖空（考用法），<b>词义题</b>给词选义（考释义）。'
     + '读的时候划选生词按 <kbd>Tab</kbd>，原句会自动存成例句。</p>';
  h += '<div class="grid" style="margin-top:14px">';
  for(var b=1;b<=5;b++){
    h += '<div class="mc"><div class="l">第 '+b+' 阶 · '+esc(V2.bandName[b])+'</div>'
       + '<div class="v">'+V.countByBand()[b]+'</div><div class="u">词 · '+V.bandPassages(b)+' 篇</div></div>';
  }
  h += '</div></div>';

  var cur = BAND;
  for(var bb=1; bb<=5; bb++){
    if(cur !== 'all' && String(cur) !== String(bb)) continue;
    var arr = all.filter(function(p){ return p.band === bb });
    if(!arr.length) continue;
    h += '<div class="card"><h3>第 '+bb+' 阶 · '+esc(V2.bandName[bb])+'</h3>';
    h += '<p class="hint" style="margin:0 0 10px">'+esc(V2.bandDesc[bb])+'</p>';
    h += '<ul class="list">';
    arr.forEach(function(p){
      var ok = done['V'+EXAM+'_'+p.id];
      h += '<li><span class="g">'+esc(p.title)
         + '<div class="d">'+p.words+' 词 · '+(p.qs||[]).length+' 题 · '+(p.target||[]).length+' 个核心词</div></span>'
         + (ok ? '<span class="tag">已练</span> ' : '')
         + '<button class="sm primary" onclick="location.href=\'#/v/read/'+p.id+'\'">读</button> '
         + '<button class="sm" onclick="CET6.VEXAM.genFrom(\''+p.id+'\')">出卷</button></li>';
    });
    h += '</ul></div>';
  }
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
   抽词严格按「阶」——当前阶抽完才往下补，保证高频先遇到。 */
function pickWords(lib, n, bs){
  var pool = [];
  bs.forEach(function(b){
    pool = pool.concat((lib.words||[]).filter(function(w){ return String(w.band) === String(b) }));
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
        if(fs.length && fs.indexOf(hit.band) < 0) return;
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
  return pairsFromPassages(C.VE, (fs || [1]).map(Number)).length;
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

var QZ = {list:[], title:'', bs:[1], n:20};
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
  /* 参数：b1 / b12 / b123 / b12345 / all，或 p_<id>（用某篇文章的词出卷）
     兼容旧写法 f1 / f12 / f123 */
  var MAP = {f1:[1], f12:[1,2], f123:[1,2,3], b1:[1], b12:[1,2], b123:[1,2,3],
                     b1234:[1,2,3,4], b12345:[1,2,3,4,5], all:'all'};
  var bs = QZ.bs, n = QZ.n;
  if(pid){
    /* 指定文章时不按阶筛——这篇里出现过的词都算，读完就测这篇的 */
    bs = [1,2,3,4,5];
  }else if(arg && MAP[arg]){
    bs = (MAP[arg] === 'all') ? 'all' : MAP[arg].slice();
    QZ.bs = bs;
  }
  if(bs === 'all') bs = [1,2,3,4,5];

  /* 语境题由文章驱动：只有在文章里真出现过的词才拿来挖空 */
  var pairs = shuffle(pairsFromPassages(lib, bs, pid));
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
    meanSrc = pickWords(lib, n - nCtx + 8, bs).filter(function(w){ return !usedWords[w.w] });
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
  h += '<div class="seg" id="bandSeg">';
  [[1,'第 1 阶'],[2,'第 2 阶'],[3,'第 3 阶'],[4,'第 4 阶'],[5,'第 5 阶'],['all','全部']].forEach(function(x){
    h += '<button class="'+(BAND===x[0]?'on':'')+'" onclick="CET6.VEXAM.setBand(\''+x[0]+'\')">'+x[1]+'</button>';
  });
  h += '</div></div>';
  h += '<p class="sub" style="margin:8px 0 0">' + (psg
       ? '这一套只考《'+esc(psg.title)+'》里出现过的词：'
       : '这一套从<b>'+(bs.length===1?('第 '+bs[0]+' 阶（'+esc(lib.bandName[bs[0]])+'）'):(bs.map(function(x){return '第 '+x+' 阶'}).join('、')))+'</b>里现抽 ')
     + '<b>'+ctxPicked.length+' 道语境题</b>（取自词汇递进短文的原句，考用法）+ <b>'+meanPicked.length+' 道词义题</b>（考释义），共 '+qs.length+' 题。'
     + '点「换一套」重新抽。</p>';
  h += '<div class="chips" style="margin-top:12px">';
  [['b1','只抽第 1 阶'],['b12','第 1–2 阶'],['b123','第 1–3 阶'],['b12345','五阶全抽'],['all','全部']].forEach(function(x){
    var on = (arg === x[0]) || (!arg && x[0] === 'b1');
    h += '<span class="chip'+(on?' on':'')+'" onclick="location.href=\'#/v/quiz/'+x[0]+'\'">'+x[1]+'</span>';
  });
  h += '<span class="chip" onclick="CET6.VEXAM.newQuiz()">↻ 换一套</span>';
  if(psg) h += '<span class="chip" onclick="location.href=\'#/v/read/'+psg.id+'\'">↩ 先读这篇</span>';
  h += '</div></div>';

  $('app').innerHTML = h;
  /* 交给主练习引擎渲染：划词、提示、定位、判分、统计全部复用 */
  C._practice({
    kind:'vocab', sid:'V' + EXAM + '_' + (pid ? pid : bs.join('')), pfx:'v', qs:qs,
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
    $('app').innerHTML = '<div class="card"><div class="empty-st"><p>找不到这篇。</p><button class="primary" onclick="location.href=\'#/v/home\'">回词汇训练</button></div></div>';
    return;
  }
  if(!p){ $('app').innerHTML = '<div class="card"><div class="empty-st"><p>找不到这篇。</p><button class="primary" onclick="location.href=\'#/v/home\'">回词汇训练</button></div></div>'; return }
  C._renderRead(id);
}
})();
