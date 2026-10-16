/* 效率工具：快捷键 / 逐层揭示解析 / 原文定位 / 逐句翻译 / 计时 / 生词速记
   设计原则：先给方向、再给位置、最后才给答案——避免"一眼看到解析"的假学会 */
window.CET6 = window.CET6 || {};

(function(){
var C = window.CET6;
var T = C.TOOLS = {};
var $ = function(i){ return document.getElementById(i) };
var esc = C.esc;

/* ================= Toast ================= */
T.toast = function(msg, ms){
  var box = $('toast'); if(!box) return;
  var d = document.createElement('div');
  d.className = 't'; d.textContent = msg;
  box.appendChild(d);
  setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d) }, ms||2000);
};

/* ================= 侧边栏角标 ================= */
T.refreshBadges = function(){
  var s = C.STATS.srsCount();
  var d = $('cDue'); if(d){ d.textContent = s.due; d.style.display = s.due? '' : 'none' }
  var w = $('cWrong'); if(w){ w.textContent = C.STATS.wrongList().length; w.style.display = C.STATS.wrongList().length? '' : 'none' }
  var wc = $('cWords'); if(wc){
    var n = C.STATS.dayWordCount(), g = C.STATS.wordGoal();
    wc.textContent = n + '/' + g;
    wc.style.display = '' ;
    wc.className = 'cnt' + (n >= g ? ' ok' : '');
  }
  var cn = $('cNotes'); if(cn && C.NOTE){
    var nn = C.NOTE.count();
    cn.textContent = nn;
    cn.style.display = nn ? '' : 'none';
  }
  var pw = $('cPWrong'); if(pw && C.PHARMQ){
    var n = C.PHARMQ.wrongCount();
    pw.textContent = n; pw.style.display = n ? '' : 'none';
  }
  if(C.PHARMQ){
    var pm = $('pMaster');
    if(pm){
      var m = C.PHARMQ.totalMaster();
      pm.textContent = '掌握度 ' + (m == null ? '—' : m + ' · ' + C.PHARMQ.level(m).t);
    }
    var pwr = $('pWrong');
    if(pwr) pwr.textContent = '错题 ' + C.PHARMQ.wrongCount();
  }
};

/* ================= 快捷键面板（每行都能点着执行） ================= */
/* fn 对应 ACT 表里的动作；没有 fn 的说明这一项本来就靠点界面完成 */
T.KBD = [
  { sec:'做题', items:[
    {n:'选择选项', k:'1 2 3 4', tip:'选项直接点就行'},
    {n:'上一题', k:'K', fn:'prev'},
    {n:'下一题', k:'J', fn:'next'},
    {n:'找答案：四步带你找到依据', k:'F', fn:'solve'},
    {n:'实在不会，按规律猜一个', k:'G', fn:'guess'},
    {n:'展开 / 收起本题解析', k:'E', fn:'reveal'},
    {n:'定位到原文依据', k:'L', fn:'locate'},
    {n:'整篇逐句翻译开关', k:'T', fn:'zh'},
    {n:'提交本套', k:'Enter', fn:'submit'}
  ]},
  { sec:'划词', items:[
    {n:'把选中的词收进生词本（自动带例句）', k:'Tab', fn:'word'},
    {n:'（同上，备用）', k:'S', fn:'word2'},
    {n:'翻译划选的整段', k:'R', fn:'tr'},
    {n:'把选中的一段存进摘抄本', k:'（浮动条）', fn:'note'},
    {n:'打开查词面板：单词查释义、整句拆句子', k:'/', fn:'query'}
  ]},
  { sec:'349 带背', items:[
    {n:'播放 / 暂停', k:'空格', fn:'rcPlay'},
    {n:'上一条', k:'←', fn:'rcPrev'},
    {n:'下一条', k:'→', fn:'rcNext'},
    {n:'显示答案', k:'D', fn:'rcReveal'},
    {n:'收藏本条', k:'F', fn:'rcStar'},
    {n:'标 不会', k:'1', fn:'rcMark0'},
    {n:'标 模糊', k:'2', fn:'rcMark1'},
    {n:'标 会', k:'3', fn:'rcMark2'},
    {n:'默写对答案', k:'Enter', fn:'rcCheck'}
  ]},
  { sec:'浮层', items:[
    {n:'关闭这个面板', k:'Esc', fn:'close'},
    {n:'打开这个面板', k:'?', fn:'open'}
  ]}
];
var ACT = {
  prev:  function(){ T.prev() },
  next:  function(){ T.next() },
  reveal:function(){ T.reveal() },
  locate:function(){ T.locate(T.cur0()) },
  solve: function(){ T.solve() },
  guess:function(){ T.blindGuess(T.cur0()) },
  zh:    function(){ T.toggleZh() },
  submit:function(){ if(T.ctx && T.ctx.onGrade) T.ctx.onGrade() },
  word:  function(){ T.addSel() },
  word2: function(){ T.addSel() },
  tr:    function(){ T.translateSel() },
  note:  function(){ T.saveSel() },
  query: function(){ T.querySel() },
  rcPlay:function(){ if(C.PHARMV) C.PHARMV.rcToggle() },
  rcPrev:function(){ if(C.PHARMV) C.PHARMV.rcPrev() },
  rcNext:function(){ if(C.PHARMV) C.PHARMV.rcNext() },
  rcReveal:function(){ if(C.PHARMV) C.PHARMV.rcReveal() },
  rcStar:function(){ if(C.PHARMV) C.PHARMV.rcStar() },
  rcMark0:function(){ if(C.PHARMV) C.PHARMV.rcMark(0) },
  rcMark1:function(){ if(C.PHARMV) C.PHARMV.rcMark(1) },
  rcMark2:function(){ if(C.PHARMV) C.PHARMV.rcMark(2) },
  rcCheck:function(){ if(C.PHARMV) C.PHARMV.rcCheck() },
  close: function(){ T.kbdClose() },
  open:  function(){ T.kbd() }
};
/* 哪些动作在当下真的能用 */
function actOk(it){
  var reciting = String(location.hash||'').indexOf('#/p/recite') === 0;
  var rc = it.fn && it.fn.indexOf('rc') === 0;
  if(rc) return reciting;
  if(it.fn === 'close' || it.fn === 'open') return true;
  if(it.fn === 'word' || it.fn === 'word2' || it.fn === 'tr' || it.fn === 'note' || it.fn === 'query') return true;
  return !!T.ctx;
}
T.runAct = function(name){
  var f = ACT[name];
  if(!f) return;
  T.kbdClose();
  try{ f() }catch(e){ T.toast('这个操作现在用不了') }
};
T.kbd = function(){
  var k = $('kbd'), body = $('kbdBody');
  if(!k) return;
  if(body){
    var h = '';
    T.KBD.forEach(function(g){
      var rows = g.items.filter(actOk);
      if(!rows.length) return;
      h += '<div class="ksec">' + C.esc(g.sec) + '</div>';
      rows.forEach(function(it){
        h += '<div class="kr"><span>' + C.esc(it.n) + '</span>';
        h += '<span class="keys">';
        String(it.k).split(' ').forEach(function(kk){ if(kk) h += '<kbd>' + C.esc(kk) + '</kbd>' });
        h += '</span>';
        if(it.fn) h += '<button class="sm" onclick="CET6.TOOLS.runAct(\'' + it.fn + '\')">执行</button>';
        else h += '<span class="kbdim">' + C.esc(it.tip || '点界面即可') + '</span>';
        h += '</div>';
      });
    });
    body.innerHTML = h;
  }
  k.style.display = 'flex';
};
T.kbdClose = function(){ var k=$('kbd'); if(k) k.style.display='none' };
document.addEventListener('click', function(){ T.kbdClose() });
if($ && $('kbd')) $('kbd').addEventListener('click', function(){ T.kbdClose() });

/* ================= 练习上下文 ================= */
/* ctx = {kind, sid, qs:[], ans:{}, onPick(n,i), onReveal(n), onGrade()} */
T.ctx = null;
T.cur = 0;
T.bind = function(ctx){
  T.ctx = ctx; T.cur = 0;
  T.hint = {};                 /* 每题用到了第几级提示，提交时记进日志 */
  T.solveOpen = {};            /* 换一套时清空「找答案」面板的展开状态 */
  T.markCur();
};
T.unbind = function(){ T.ctx = null; T.stopTimer() };

function qEl(n){
  if(!T.ctx) return null;
  return $('qw_' + (T.ctx.pfx||'') + n);
}
T.markCur = function(){
  if(!T.ctx) return;
  document.querySelectorAll('.q.active').forEach(function(e){ e.classList.remove('active') });
  var e = qEl(T.cur0()); if(e){ e.classList.add('active'); }
};
T.cur0 = function(){
  if(!T.ctx) return 0;
  return T.ctx.qs[T.cur] ? T.ctx.qs[T.cur].n : 0;
};

/* ================= 选择 / 导航 / 揭示 ================= */
T.pick = function(i){
  if(!T.ctx) return;
  var n = T.cur0();
  T.ctx.onPick(n, i);
  T.next();
};
T.go = function(idx){
  if(!T.ctx) return;
  T.cur = Math.max(0, Math.min(T.ctx.qs.length-1, idx));
  T.markCur();
  var e = qEl(T.cur0());
  if(e) e.scrollIntoView({block:'center', behavior:'smooth'});
};
T.next = function(){ T.go(T.cur+1) };
T.prev = function(){ T.go(T.cur-1) };

/* 直接对某一题操作（题卡上的按钮用，不用先跳过去） */
T.gotoQ = function(n){
  if(!T.ctx) return false;
  var idx = -1;
  T.ctx.qs.forEach(function(q,i){ if(q.n === n) idx = i });
  if(idx < 0) return false;
  T.cur = idx; T.markCur();
  return true;
};
T.revealN = function(n){ if(T.gotoQ(n)) T.reveal() };
T.locateN = function(n){ if(T.gotoQ(n)) T.locate(n) };
T.reveal = function(){
  if(!T.ctx) return;
  var n = T.cur0();
  if(T.ctx.onReveal) T.ctx.onReveal(n);
};
T.submit = function(){ if(T.ctx && T.ctx.onGrade) T.ctx.onGrade() };

/* ================= 原文定位高亮 ================= */
function norm(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim() }
function score(a, b){
  var A = norm(a).split(' '), B = norm(b).split(' ');
  if(!A.length || !B.length) return 0;
  var set = {}, hit = 0, tot = Math.min(A.length, B.length);
  B.forEach(function(w){ set[w]=1 });
  A.forEach(function(w){ if(set[w]) hit++ });
  return hit / Math.max(4, tot);
}
T.locate = function(n){
  var q = null;
  if(T.ctx) T.ctx.qs.forEach(function(x){ if(x.n===n) q=x });
  if(!q) return;
  var target = q.loc || q.q;
  var ss = document.querySelectorAll('.s[data-t], .passage .s');
  var best = null, bs = 0;
  for(var i=0;i<ss.length;i++){
    var s = score(ss[i].textContent, target);
    if(s > bs){ bs = s; best = ss[i] }
  }
  document.querySelectorAll('.loc-hl').forEach(function(e){ e.classList.remove('loc-hl') });
  if(best && bs > 0.25){
    best.classList.add('loc-hl');
    best.scrollIntoView({block:'center', behavior:'smooth'});
    var tt = $('tt');
    if(tt && (q.locZh || best.getAttribute('data-t'))){
      tt.innerHTML = C.esc(q.locZh || best.getAttribute('data-t'));
      tt.className = '';
    }
    T.toast('已定位到原文（黄色高亮）');
  }else{
    if(q.loc){
      var tt2 = $('tt');
      if(tt2){ tt2.innerHTML = C.esc(q.locZh || q.loc); tt2.className = '' }
    }
    T.toast('原文里没找到完全对应的句子，看底部译文条');
  }
};

/* ================= 朗读全文 ================= */
/* 把当前页的英文正文攒成一段，交给系统语音念出来。
   边看边听：听力练耳朵，跟读练语感，比默读多记住一层声音。 */
T.readAloud = function(){
  var nodes = (document.querySelectorAll ? document.querySelectorAll('.s[data-t]') : []) || [];
  var buf = [], i;
  for(i = 0; i < nodes.length; i++){
    var t = String(nodes[i].textContent || '').replace(/\s+/g, ' ').trim();
    if(t) buf.push(t);
  }
  var txt = buf.join(' ');
  if(!txt){ T.toast('这一页没有可朗读的正文'); return }
  if(!C.speak){ T.toast('这个浏览器不支持朗读——用眼睛多读两遍也一样'); return }
  C.speak(txt, 1, function(ok){
    if(!ok) T.toast('当前设备没装英文语音包，朗读不可用');
  });
};

/* ================= 逐句翻译开关 ================= */
T.zh = false;
T.toggleZh = function(){
  T.zh = !T.zh;
  var ss = document.querySelectorAll('.s[data-t]');
  if(T.zh){
    for(var i=0;i<ss.length;i++){
      var z = ss[i].getAttribute('data-t');
      if(!z) continue;
      var sp = document.createElement('span');
      sp.className = 'sent-zh'; sp.textContent = z;
      ss[i].insertAdjacentElement('afterend', sp);
    }
    T.toast('已展开全部译文');
  }else{
    document.querySelectorAll('.sent-zh').forEach(function(e){ e.parentNode.removeChild(e) });
    T.toast('已收起译文');
  }
};

/* ================= 收词（自动带原文例句） ================= */
/* 例句来源优先级：显式传入 > 当前划选所在句 > 鼠标停留过的词所在句 */
T.pickCtx = function(word, ctxIn, nodeIn){
  if(ctxIn) return {en:ctxIn, zh:'', hl:word};
  var node = nodeIn || (C._sel && C._sel.node) || C.lastWordNode;
  var s = C.sentOf ? C.sentOf(node) : null;
  if(s && s.en) return {en:s.en, zh:s.zh, hl:word};
  return {en:'', zh:'', hl:word};
};
T.addWord = function(w, def, ctx, cz, src){
  w = String(w||'').toLowerCase().replace(/[^a-z-]/g,'');
  if(!w || w.length<2){ T.toast('先选中一个单词，或把鼠标停在词上再按 S'); return false }
  if(!def) def = C.lookup(w) || '';
  var c = T.pickCtx(w, ctx);
  var S = C.STATS;
  var existed = !S.srsAdd(w, def, c.en, c.zh || cz || '', src || (C.srcLabel ? C.srcLabel() : ''), c.hl);
  if(existed && c.en && !S.srsHasCtx(w)){
    S.srsSetCtx(w, c.en, c.zh || cz || '', src || (C.srcLabel ? C.srcLabel() : ''), c.hl);
    T.toast(w + ' 已经在生词本里，已补上这句例句');
  }else if(existed){
    T.toast('已经有了：' + w);
  }else{
    var n = S.dayWordCount(), g = S.wordGoal();
    T.toast(n >= g
      ? ('已收 ' + w + ' · 今天 ' + n + ' 个，目标达成')
      : ('已收 ' + w + (c.en ? '（带例句）' : '（这段没有例句）') + ' · 今日 ' + n + '/' + g),
      1500);
  }
  T.refreshBadges();
  if(C.CLOUD && C.CLOUD.onWord) C.CLOUD.onWord();
  return !existed;                 /* 返回"这次真的收进来了"，批量收词要数数 */
};
/* 例句里把目标词高亮出来 */
T.ctxHTML = function(it){
  var en = String(it.c||'');
  var w = String(it.w||'');
  if(!en) return '';
  var h = '<div class="exen">';
  if(w){
    var re = new RegExp('(' + w.replace(/[-]/g,'\\-') + ')', 'gi');
    h += C.esc(en).replace(re, '<mark>$1</mark>');
  }else h += C.esc(en);
  h += '</div>';
  if(it.cz) h += '<div class="exzh">' + C.esc(it.cz) + '</div>';
  if(it.src) h += '<div class="exsrc">' + C.esc(it.src) + '</div>';
  return h;
};
function clearSel(){
  try{
    var s = window.getSelection && window.getSelection();
    if(s && s.removeAllRanges) s.removeAllRanges();
  }catch(e){}
}
/* 读者心流：选中一个词，Tab 一下就收走，选区自动清掉可以直接接着挑下一个 */
T.tabWord = function(){
  var sel = C._sel;
  if(sel && sel.one && sel.word){
    T.addWord(sel.word); C.hideSelBar(); clearSel(); return true;
  }
  var s = window.getSelection ? window.getSelection() : null;
  var t = s ? String(s.toString()||'').trim() : '';
  if(t && /^[A-Za-z][A-Za-z'-]*$/.test(t)){
    T.addWord(t); C.hideSelBar(); clearSel(); return true;
  }
  if(C.lastWord){ T.addWord(C.lastWord); return true }
  T.toast('先用鼠标选中一个单词，再按 Tab');
  return false;
};
T.addSel = function(){
  var sel = C._sel;
  if(sel && sel.one && sel.word){ T.addWord(sel.word); C.hideSelBar(); clearSel(); return }
  var s = window.getSelection();
  var t = s ? String(s.toString()||'').trim() : '';
  if(t && /^[A-Za-z][A-Za-z'-]*$/.test(t)){ T.addWord(t); return }
  if(C.lastWord) { T.addWord(C.lastWord); return }
  T.toast('先选中一个单词，或把鼠标停在词上再按 S');
};

/* 单句翻译：点句尾的「译」，只翻这一句，就地对照（不用满篇开译文） */
T.trSent = function(btn){
  var p = btn && btn.parentNode; if(!p) return;
  var ss = p.querySelectorAll ? p.querySelectorAll('.s[data-t]') : null;
  if(!ss || !ss.length){ T.toast('这一句没有内置译文，划选它再点「翻译」'); return }
  /* 再点一次收起 */
  var old = p.querySelector ? p.querySelector('.sent-zh.inl') : null;
  if(old){ if(old.parentNode) old.parentNode.removeChild(old); return }
  var h = '<div class="selpairs">';
  for(var i=0;i<ss.length;i++){
    var en = String(ss[i].textContent||'').trim();
    var zh = ss[i].getAttribute('data-t') || '';
    h += '<div class="selp"><div class="se">' + C.esc(en) + '</div>';
    h += zh ? ('<div class="sz">' + C.esc(zh) + '</div>') : '<div class="sz mut">（无内置译文）</div>';
    h += '</div>';
  }
  h += '</div>';
  var sp = document.createElement('div');
  sp.className = 'sent-zh inl'; sp.innerHTML = h;
  p.appendChild(sp);
  /* 底部译文条同步，视线不用乱跑 */
  var tt = C.$('tt'), box = C.$('trans');
  if(tt){ tt.innerHTML = h; tt.className = ''; showTransX() }
  if(box) box.classList.add('on');
};
/* ================= 划整段翻译 ================= */
/* 优先用句子自带的译文逐句对照；没有内置译文再问 AI */
T.translateSel = function(){
  var sel = C._sel;
  var txt = sel ? sel.txt : '';
  if(!txt){
    var s = window.getSelection();
    txt = s ? String(s.toString()||'').replace(/\s+/g,' ').trim() : '';
  }
  if(!txt){ T.toast('先选中一段文字'); return }
  var tt = C.$('tt'), box = C.$('trans');
  if(!tt) return;

  /* 1) 找选区里所有带译文的句子 */
  var pairs = [];
  try{
    var s2 = window.getSelection();
    if(s2 && s2.rangeCount){
      var frag = s2.getRangeAt(0).cloneContents();
      var tmp = document.createElement('div'); tmp.appendChild(frag);
      var ss = tmp.querySelectorAll('.s[data-t]');
      for(var i=0;i<ss.length;i++){
        var en = String(ss[i].textContent||'').trim();
        var zh = ss[i].getAttribute('data-t') || '';
        if(en) pairs.push({en:en, zh:zh});
      }
    }
  }catch(e){}

  var h = '';
  if(pairs.length){
    h += '<div class="selhd">选中 ' + pairs.length + ' 句 · 逐句对照</div>';
    /* 只选中一个词时，顺手把词义放在最上面 */
    if(sel && sel.one && sel.en){
      var def0 = C.lookup(sel.word);
      h += '<div class="selwd">' + C.esc(sel.txt) + '：<b>' + C.esc(def0 || '词典没收录') + '</b>' +
           (def0 ? '' : '（按 <kbd>S</kbd> 收进生词本，之后可一键补 AI 释义）') + '</div>';
    }
    h += '<div class="selpairs">';
    pairs.forEach(function(p){
      h += '<div class="selp"><div class="se">' + C.esc(p.en) + '</div>';
      h += p.zh ? ('<div class="sz">' + C.esc(p.zh) + '</div>') : '<div class="sz mut">（本句无内置译文）</div>';
      h += '</div>';
    });
    h += '</div>';
    tt.innerHTML = h; tt.className = ''; showTransX();
    if(box) box.classList.add('on');
    T.toast('已翻译选中的 ' + pairs.length + ' 句');
    return;
  }

  /* 2) 没有内置译文：英文走 AI，中文直接提示 */
  if(!/[A-Za-z]/.test(txt)){
    tt.innerHTML = '<div class="selhd">选中的是中文，不需要翻译</div><div class="selpairs"><div class="selp"><div class="se">' + C.esc(txt) + '</div></div></div>';
    tt.className = ''; showTransX();
    if(box) box.classList.add('on');
    return;
  }
  if(!C.aiReady()){
    tt.innerHTML = '<div class="selhd">这段没有内置译文</div><div class="selpairs"><div class="selp"><div class="se">' + C.esc(txt) +
      '</div><div class="sz mut">这段不在内置译文库里。在「设置」里配好 AI 接口后，划选就能整段翻译。</div></div></div>';
    tt.className = ''; showTransX();
    if(box) box.classList.add('on');
    return;
  }
  tt.innerHTML = '<div class="selhd">AI 翻译中…</div><div class="selpairs"><div class="selp"><div class="se">' + C.esc(txt) + '</div></div></div>';
  tt.className = ''; showTransX();
  if(box) box.classList.add('on');
  C.aiTranslate(txt).then(function(zh){
    var el = C.$('tt'); if(!el) return;
    if(!zh){ el.innerHTML = '<div class="selhd">翻译失败</div><div class="selpairs"><div class="selp"><div class="sz mut">'
      + C.esc(C.aiErrText(C.aiLastErr) || '检查一下 AI 接口配置')
      + '。去 <a href="#/settings">设置</a> 点「自检一下」看具体原因。</div></div></div>'; return }
    el.innerHTML = '<div class="selhd">AI 翻译</div><div class="selpairs"><div class="selp"><div class="se">' + C.esc(txt) +
      '</div><div class="sz">' + C.esc(zh) + '</div></div></div>';
  });
};
/* 选区里带内置译文的句子（翻译与摘抄共用同一份逻辑） */
function selPairs(){
  var out = [];
  try{
    var s = window.getSelection();
    if(!s || !s.rangeCount) return out;
    var frag = s.getRangeAt(0).cloneContents();
    var tmp = document.createElement('div'); tmp.appendChild(frag);
    var ss = tmp.querySelectorAll('.s[data-t]');
    for(var i=0;i<ss.length;i++){
      var en = String(ss[i].textContent||'').trim();
      var zh = ss[i].getAttribute('data-t') || '';
      if(en) out.push({en:en, zh:zh});
    }
  }catch(e){}
  return out;
}
function selText(){
  if(C._sel && C._sel.txt) return C._sel.txt;
  var s = window.getSelection && window.getSelection();
  return s ? String(s.toString()||'').replace(/\s+/g,' ').trim() : '';
}

/* ================= 存进摘抄本（一整段） ================= */
/* 生词本收词，摘抄本收段。存的时候顺手把内置译文也带上，之后能逐句对照 */
T.saveSel = function(){
  var txt = selText();
  if(!txt){ T.toast('先用鼠标选中一段文字，再点「存摘抄」'); return }
  var pairs = selPairs();
  var zh = pairs.map(function(p){ return p.zh }).filter(Boolean).join(' ');
  var ok = C.NOTE ? C.NOTE.add(txt, zh, C.srcLabel ? C.srcLabel() : '') : false;
  T.toast(ok ? ('已存进摘抄本：' + txt.slice(0,18) + (txt.length>18?'…':'')) : '这一段已经在摘抄本里了');
  T.refreshBadges();
  C.hideSelBar(); clearSel();
  if(C.CLOUD && C.CLOUD.onNote) C.CLOUD.onNote();
};

/* ================= 查词面板 ================= */
/* 一个输入框解决三种需求：查单词（释义 + 助记）、查句子（翻译 + 拆句）、
   查完直接入表（单词进生词本，句子进摘抄本） */
T._q = null;
T._qctx = '';
T.queryOpen = function(txt, ctx){
  var box = C.$('query'); if(!box) return;
  var inp = C.$('qIn');
  if(inp && txt != null) inp.value = txt;
  if(ctx != null) T._qctx = ctx;
  box.style.display = 'flex';
  if(inp){ try{ inp.focus(); inp.select && inp.select() }catch(e){} }
  if(inp && String(inp.value||'').trim()) T.queryGo(); else T.queryHint();
};
T.queryClose = function(){ var b = C.$('query'); if(b) b.style.display = 'none' };
T.queryHint = function(){
  var o = C.$('qOut'); if(!o) return;
  T._q = null;
  o.innerHTML = '<div class="qempty">输入一个<b>单词</b>、一个<b>短语</b>或<b>整句</b>，回车即可。<br>'
    + '<span class="hint">单词给释义 + 怎么记；句子给翻译，还能让 AI 拆主干、把生词挑出来一起收走。</span></div>';
};
/* 从划选带过来：选中词就查词，选中句子就查句子 */
T.querySel = function(){
  var txt = selText();
  var pairs = selPairs();
  var zh = pairs.map(function(p){ return p.zh }).filter(Boolean).join(' ');
  var ctx = (C._sel && C._sel.node && C.sentOf) ? ((C.sentOf(C._sel.node)||{}).en || '') : '';
  C.hideSelBar();
  T.queryOpen(txt || '', ctx);
  if(zh && T._q) T._q.zh = zh;
};
T.queryGo = function(){
  var inp = C.$('qIn'), o = C.$('qOut');
  if(!inp || !o) return;
  var q = String(inp.value||'').replace(/\s+/g,' ').trim();
  if(!q){ T.queryHint(); return }
  var one = /^[A-Za-z][A-Za-z'-]*$/.test(q);
  var w = one ? q.toLowerCase().replace(/[^a-z-]/g,'') : '';
  var ctx = T._qctx || '';
  var old = T._q || {};
  var inBook = one && C.STATS.srsAll()[w];
  T._q = {txt:q, one:one, word:w, ctx:ctx, zh:old.zh||''};

  var h = '<div class="qhd"><span class="qkind">' + (one?'单词':'句子 / 短语') + '</span><b>' + esc(q) + '</b>';
  h += '<span style="flex:1"></span>';
  if(one){
    h += '<button class="sm ' + (inBook?'':'primary') + '" onclick="CET6.TOOLS.queryAdd()">'
      + (inBook?'已在生词本':'收进生词本') + '</button> ';
  }else{
    h += '<button class="sm primary" onclick="CET6.TOOLS.queryNote()">存进摘抄本</button> ';
  }
  h += '<button class="sm" onclick="CET6.TOOLS.queryClose()">关闭</button></div>';

  if(one){
    var def = C.lookup(q);
    h += '<div class="qsec"><div class="sh">词典</div>';
    h += def ? ('<div class="qdef">' + esc(def) + ' <span class="hint">内置词典</span></div>')
             : '<div class="qdef mut">内置词典没收录这个词' + (C.aiReady()?'，看下面的 AI 释义':'') + '。</div>';
    if(ctx) h += '<div class="qctx"><b>原句</b> ' + esc(ctx) + '</div>';
    h += '</div>';
    h += '<div class="qsec"><div class="sh">怎么记 · 怎么用</div><div id="qai">'
      + (C.aiReady() && C.settings.aiUse.define ? '<div class="hint">正在问 AI…</div>'
         : (C.aiReady() ? '<div class="hint">AI 释义在设置里关掉了。</div>'
            : '<div class="tipbox">没配 AI 接口，只能看内置词典。<a href="#/settings">去设置</a>里填好接口后，'
              + '这里会给词根拆解、助记法和例句，还能直接练填空。</div>'))
      + '</div></div>';
  }else{
    h += '<div class="qsec"><div class="sh">这段里的核心词</div><div id="qcore"></div></div>';
    h += '<div class="qsec"><div class="sh">句子怎么读</div><div id="qai">'
      + (C.aiReady() ? '<div style="margin-bottom:6px"><button class="sm" onclick="CET6.TOOLS.queryExplain()">让 AI 拆这段</button></div><div class="hint">主干 / 修饰 / 翻译 / 生词，一次讲完。</div>'
         : '<div class="tipbox">没配 AI 接口，翻译和拆句都用不了。可以先「存进摘抄本」，'
           + '或者把这段里的核心词直接收进生词本（上面那块）。</div>')
      + '</div></div>';
  }
  o.innerHTML = h;
  if(!one) T.queryCore(q);
  if(one && C.aiReady() && C.settings.aiUse.define) T.queryAI(w, ctx);
};
/* 核心词：不依赖 AI，让"选中一段 → 收生词"这条路随时可用 */
T.queryCore = function(txt){
  var box = C.$('qcore'); if(!box || !C.NOTE) return;
  var ws = C.NOTE.core(txt);
  if(!ws.length){ box.innerHTML = '<div class="hint">这段里没有六级 / 考研核心词表里的词。</div>'; return }
  var h = '<div class="wcrow">';
  ws.forEach(function(x){
    h += '<span class="wc" onclick="CET6.TOOLS.addWord(\'' + esc(String(x.w).toLowerCase()) + '\')" title="收进生词本">'
      + esc(x.w) + '<i>' + (x.f===1?'高':(x.f===2?'中':'低')) + '</i></span>';
  });
  h += '</div>';
  h += '<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">';
  h += '<button class="sm primary" onclick="CET6.TOOLS.queryAddAll()">这 ' + ws.length + ' 个全收进生词本</button>';
  h += '<span class="hint">点单个词也能收。收进去之后去「今日新词」练填空。</span></div>';
  box.innerHTML = h;
};
T.queryAddAll = function(){
  if(!T._q || T._q.one) return;
  var ws = C.NOTE.core(T._q.txt), n = 0;
  ws.forEach(function(x){ if(T.addWord(String(x.w).toLowerCase(), C.lookup(x.w)||'', T._q.txt.slice(0,180))) n++ });
  T.toast(n ? ('这 ' + ws.length + ' 个词都收好了') : '这些词都已经在生词本里了');
};
T.queryAdd = function(){
  if(!T._q || !T._q.one) return;
  T.addWord(T._q.word, '', T._q.ctx || '');
  var b = C.$('qOut');
  if(b){ var bt = b.querySelector('.qhd button'); if(bt){ bt.textContent = '已在生词本'; bt.className = 'sm' } }
};
T.queryNote = function(){
  if(!T._q || !C.NOTE) return;
  var ok = C.NOTE.add(T._q.txt, T._q.zh, C.srcLabel ? C.srcLabel() : '');
  T.toast(ok ? '已存进摘抄本' : '这段已经在摘抄本里了');
  T.refreshBadges();
  if(C.CLOUD && C.CLOUD.onNote) C.CLOUD.onNote();
};
T.queryAI = function(w, ctx){
  C.aiAssist(w, ctx).then(function(o){
    var box = C.$('qai'); if(!box) return;
    if(!o){ box.innerHTML = '<div class="tipbox"><b>AI 没返回内容。</b>' + esc(C.aiErrText(C.aiLastErr))
      + '<br>去 <a href="#/settings">设置</a> 点「自检一下」看具体原因。</div>'; return }
    C.STATS.memSet(w, JSON.stringify(o));
    if(C.CLOUD && C.CLOUD.onMemory) C.CLOUD.onMemory(w, JSON.stringify(o));
    box.innerHTML = C.memCard(w, o);
  });
};
T.queryExplain = function(){
  if(!T._q || T._q.one) return;
  var box = C.$('qai'); if(!box) return;
  var txt = T._q.txt;
  box.innerHTML = '<div class="hint">AI 正在拆…</div>';
  C.aiExplain(txt).then(function(o){
    var el = C.$('qai'); if(!el) return;
    if(!o){ el.innerHTML = '<div class="tipbox"><b>AI 没返回内容。</b>' + esc(C.aiErrText(C.aiLastErr))
      + '<br>去 <a href="#/settings">设置</a> 点「自检一下」看具体原因。</div>'; return }
    T._q.zh = o.zh || '';
    var h = '';
    if(o.main) h += '<div class="qrow"><b>主干</b><span>' + esc(o.main) + '</span></div>';
    if(o.mods && o.mods.length) h += '<div class="qrow"><b>修饰</b><span>' + o.mods.map(esc).join('<br>') + '</span></div>';
    if(o.zh) h += '<div class="qrow"><b>译文</b><span>' + esc(o.zh) + '</span></div>';
    if(o.words && o.words.length){
      h += '<div class="qrow"><b>生词</b><span>';
      o.words.forEach(function(x){
        var w = String(x.w||'').toLowerCase().replace(/[^a-z '-]/g,'');
        h += '<span class="wc" onclick="CET6.TOOLS.addWord(\'' + esc(w) + '\',\'' + esc(x.zh||'') + '\')">'
           + esc(x.w) + '</span> ';
      });
      h += '<br><span class="hint">点词就收进生词本，释义用 AI 给的这句里的意思。</span></span></div>';
    }
    h += '<div class="hint" style="margin-top:6px">AI 讲的只当参考，回原文再对一遍。</div>';
    el.innerHTML = h;
  });
};

function showTransX(){ var x=C.$('ttx'); if(x) x.style.display='' }
T.selCopy = function(){
  var txt = C._sel ? C._sel.txt : '';
  if(!txt) return;
  try{ navigator.clipboard.writeText(txt); T.toast('已复制') }
  catch(e){ T.toast('复制失败，手动 Ctrl+C 吧') }
};
T.clearTrans = function(){
  var tt = C.$('tt'), box = C.$('trans'), x = C.$('ttx');
  if(tt){ tt.innerHTML = '把鼠标移到任意句子上，这里显示整句翻译；<b>划选一段</b>可整段翻译'; tt.className = 'empty' }
  if(box) box.classList.remove('on');
  if(x) x.style.display = 'none';
};

/* ================= 计时器 ================= */
T.timer = null;
T.startTimer = function(limitSec){
  T.stopTimer();
  T.timer = {t0: Date.now(), limit: limitSec||0, id: 0};
  var el = $('tm'); if(!el) return;
  function tick(){
    if(!T.timer) return;
    var s = Math.floor((Date.now()-T.timer.t0)/1000);
    var over = T.timer.limit && s > T.timer.limit;
    el.textContent = fmt(s) + (T.timer.limit ? (' / 建议 ' + fmt(T.timer.limit)) : '');
    el.className = 'tm' + (over ? ' over' : '');
    T.timer.id = setTimeout(tick, 1000);
  }
  tick();
};
T.stopTimer = function(){
  if(T.timer && T.timer.id) clearTimeout(T.timer.id);
  T.timer = null;
  var el = $('tm'); if(el) el.className = 'tm';
};
T.elapsed = function(){ return T.timer ? Math.floor((Date.now()-T.timer.t0)/1000) : 0 };
function fmt(s){ var m=Math.floor(s/60); return m + ':' + (s%60<10?'0':'') + (s%60) }

/* ================= 键盘 ================= */
document.addEventListener('keydown', function(e){
  var t = e.target, tag = t && t.tagName;
  if(tag==='INPUT' || tag==='TEXTAREA' || tag==='SELECT') return;
  if(e.metaKey || e.ctrlKey || e.altKey) return;

  if(e.key === 'Escape'){ T.kbdClose(); T.queryClose(); return }
  /* Tab：选中词一键收进生词本（滑词连续收割就靠它） */
  if(e.key === 'Tab'){
    if(T.tabWord()) e.preventDefault();
    return;
  }
  /* /：随时打开查词面板（选中了东西就带进去查） */
  if(e.key === '/' || e.key === '、'){
    T.querySel(); e.preventDefault(); return;
  }
  if(e.key === '?'){ T.kbd(); return }

  /* 测评页自己的左右键 */
  if((location.hash||'').indexOf('assess') >= 0) return;

  if(!T.ctx) return;
  var k = e.key.toLowerCase();

  if(k>='1' && k<='4'){ T.pick(+k-1); e.preventDefault(); return }
  if(k>='a' && k<='d'){ T.pick(k.charCodeAt(0)-97); e.preventDefault(); return }
  if(k==='j'){ T.next(); e.preventDefault(); return }
  if(k==='k'){ T.prev(); e.preventDefault(); return }
  if(k==='e'){ T.reveal(); e.preventDefault(); return }
  if(k==='l'){ T.locate(T.cur0()); e.preventDefault(); return }
  if(k==='f'){ T.solve(); e.preventDefault(); return }
  if(k==='g'){ T.blindGuess(T.cur0()); e.preventDefault(); return }
  if(k==='t'){ T.toggleZh(); e.preventDefault(); return }
  if(k==='s'){ T.addSel(); e.preventDefault(); return }
  if(k==='r'){ T.translateSel(); e.preventDefault(); return }
  if(e.key === 'Enter'){ T.submit(); e.preventDefault(); return }
});

/* ================= 逐层揭示解析 ================= */
/* 四层：题型方向 → 去哪找 → 能排除谁 → 答案与完整解析 */
T.RV = {};
T.rvKey = function(pfx, n){ return 'rv_' + (pfx||'') + n };

T.RVP = {};
T.rvHTML = function(q, lv, pfx){
  pfx = pfx || '';
  T.RV[T.rvKey(pfx, q.n)] = q;
  T.RVP[T.rvKey(pfx, q.n)] = pfx;
  var steps = [];
  steps.push({t:'题型方向', h: C.TYPE[q.type] ? ('<b>'+C.TYPE[q.type].n+'</b>：'+C.TYPE[q.type].tip) : '按题干关键词判断题型。'});
  steps.push({t:'去原文哪里找', h: q.l2 ? esc(q.l2) : '拿题干里的专有名词或独特名词回原文扫读定位。'});
  steps.push({t:'可以先排除谁', h: trapHTML(q)});
  steps.push({t:'答案与完整解析', h: fullHTML(q)});

  var h = '<div class="rv" id="'+T.rvKey(pfx,q.n)+'">';
  h += '<div class="rv-h">解析 · 共 4 层<span class="st">已解锁 ' + Math.min(lv,4) + ' / 4</span>';
  h += '<span class="sp" style="flex:1"></span>';
  h += '<button class="sm" onclick="CET6.TOOLS.rv(\''+T.rvKey(pfx,q.n)+'\',99)">全部展开</button></div>';
  h += '<div class="rv-b">';
  for(var i=0;i<steps.length;i++){
    if(i < lv){
      h += '<div class="rv-step"><div class="sh" style="font-size:11.5px;font-weight:600;color:#64748B;margin-bottom:3px">'+(i+1)+'. '+steps[i].t+'</div>'+steps[i].h+'</div>';
    }else{
      h += '<div class="rv-mask" onclick="CET6.TOOLS.rv(\''+T.rvKey(pfx,q.n)+'\','+(i+1)+')">点击解锁第 '+(i+1)+' 层 · '+steps[i].t+'</div>';
      break;
    }
  }
  h += '</div></div>';
  return h;
};
function trapHTML(q){
  var h = '';
  if(q.trap && q.trap.length){
    h += '<div class="trap">';
    q.trap.forEach(function(t){ h += '<div class="row2"><b>×</b><span>'+esc(t)+'</span></div>' });
    h += '</div>';
  }else{
    h += '<div class="trap">先砍掉带极端词（all / never / only / must）的选项，再砍掉与原文细节不符的选项。</div>';
  }
  if(q.guess) h += '<div class="tipbox" style="margin-top:8px"><b>没读懂时怎么猜</b><br>'+esc(q.guess)+'</div>';
  return h;
}
function fullHTML(q){
  var h = '<div><b style="color:#15803D">正确答案：'+String.fromCharCode(65+q.a)+'</b></div>';
  h += '<div style="margin-top:6px">'+esc(q.why||'（这题还没写解析）')+'</div>';
  if(q.loc) h += '<div class="loc" data-t="'+esc(q.locZh||q.loc)+'" style="margin-top:8px"><b>原文依据：</b>'+esc(q.loc)+'</div>';
  return h;
}
T.rv = function(key, lv){
  var q = T.RV[key]; if(!q) return;
  var el = $(key); if(!el) return;
  lv = Math.min(lv, 4);
  el.outerHTML = T.rvHTML(q, lv, T.RVP[key] || '');
};

/* ================= 找答案：一步步带你摸到依据 =================
   四步：题型方法 → 题干定位词 & 回原文 → 逐项排雷 → 真的不会才用规律兜底
   全程不给答案，最后那步也只是"高概率项"，并要求回去对着原文核对 */
T.solveOpen = {};
T.ansOf = function(){ return null };   /* app.js 会覆盖成真实的作答表 */
T.solveKey = function(pfx, n){ return 'solve_' + (pfx||'') + n };
T.solveN = function(n){
  if(!T.gotoQ(n)) return;
  var q = null;
  T.ctx.qs.forEach(function(x){ if(x.n === n) q = x });
  if(!q) return;
  var el = $(T.solveKey(T.ctx.pfx, n));
  if(!el) return;
  var on = T.solveOpen[n];
  if(on){ el.innerHTML = ''; T.solveOpen[n] = false; T.untrap(n); return }
  T.solveOpen[n] = true;
  el.innerHTML = T.solveHTML(q);
};
T.solve = function(){ var n = T.cur0(); if(n) T.solveN(n) };
T.untrap = function(n){
  var pfx = T.ctx ? (T.ctx.pfx||'') : '';
  var qw = $('qw_' + pfx + n); if(!qw || !qw.querySelectorAll) return;
  var ts = qw.querySelectorAll('.otag');
  for(var i=0;i<ts.length;i++){ if(ts[i].parentNode) ts[i].parentNode.removeChild(ts[i]) }
  var os = qw.querySelectorAll('.opt');
  for(var j=0;j<os.length;j++) os[j].className = 'opt';
};
function solveMethod(q){
  var SV = C.SOLVE;
  var lines = SV ? SV.methodOf(q.type) : null;
  if(!lines) lines = ['先题后文：拿题干里的关键词回原文定位。'];
  var t = C.TYPE && C.TYPE[q.type] ? C.TYPE[q.type] : null;
  return (t ? '<div class="sd"><b>' + t.n + '</b>　' + t.tip + '</div>' : '') +
    lines.map(function(s){ return '<div class="sd">· ' + s + '</div>' }).join('');
}
function solveKeys(q){
  var SV = C.SOLVE;
  if(!SV) return '';
  var ks = SV.keys(q);
  if(!ks.length) return '<div class="sd">题干里没有明显的定位标志，退而求其次：挑<b>最长的那个名词</b>回原文扫。</div>';
  return '<div class="sd">拿这些词回原文扫读：<span class="kw">' +
    ks.map(function(k){ return esc(k) }).join('</span> <span class="kw">') +
    '</span><br><span class="hint">数字、大写、专有名词最好找——它们几乎不会被换词。</span></div>';
}
function solveTags(q){
  var SV = C.SOLVE;
  if(!SV) return '';
  var tags = SV.tags(q);
  if(!tags.length) return '<div class="sd">这一题的四个选项没什么明显的坑，老实回原文比对。</div>';
  var byI = {};
  tags.forEach(function(t){ (byI[t.i] = byI[t.i] || []).push(t) });
  var h = '';
  Object.keys(byI).forEach(function(i){
    var L = String.fromCharCode(65 + (+i));
    var arr = byI[i];
    h += '<div class="sd"><b>' + L + '</b> ' +
      arr.map(function(t){ return '<span class="otag ' + t.tag + '">' + esc(t.text) + '</span>' }).join(' ') + '</div>';
  });
  return h;
}
T.solveHTML = function(q){
  var h = '<div class="solve">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">';
  h += '<b style="flex:1;min-width:140px">找答案 · 第 ' + q.n + ' 题</b>';
  h += '<button class="sm" onclick="CET6.TOOLS.trapMark(' + q.n + ')">在选项上标出来</button>';
  h += '<button class="sm" onclick="CET6.TOOLS.locate(' + q.n + ')">定位原文</button>';
  h += '<button class="sm" onclick="CET6.TOOLS.solveN(' + q.n + ')">收起</button></div>';
  h += '<div class="sd"><b>第 1 步 · 这题型怎么做</b></div>' + solveMethod(q);
  h += '<div class="sd" style="margin-top:8px"><b>第 2 步 · 拿什么去原文找</b></div>' + solveKeys(q);
  h += '<div class="sd" style="margin-top:8px"><b>第 3 步 · 哪些可以先排除</b></div>' + solveTags(q);
  h += '<div class="sd" style="margin-top:8px"><b>第 4 步 · 实在读不懂</b>　' +
       '<button class="sm" onclick="CET6.TOOLS.blindGuess(' + q.n + ')">按规律猜一个</button></div>';
  h += '<div id="sg_' + (T.ctx.pfx||'') + q.n + '"></div>';
  h += '</div>';
  return h;
};
/* 把排雷标签直接写进选项里 */
T.trapMark = function(n){
  var SV = C.SOLVE;
  if(!SV || !T.ctx) return;
  var q = null;
  T.ctx.qs.forEach(function(x){ if(x.n === n) q = x });
  if(!q) return;
  T.untrap(n);
  var qw = $('qw_' + (T.ctx.pfx||'') + n); if(!qw || !qw.querySelectorAll) return;
  var os = qw.querySelectorAll('.opt');
  var tags = SV.tags(q);
  for(var i=0;i<os.length;i++){
    var mine = tags.filter(function(t){ return t.i === i });
    if(!mine.length) continue;
    var sp = document.createElement('span');
    sp.className = 'otag ' + mine[0].tag;
    sp.textContent = mine[0].text;
    os[i].appendChild(sp);
  }
  T.toast('已在选项上标注');
};
/* 真的不会了：给一个概率最高的选项 + 理由，明说这是规律不是答案 */
T.blindGuess = function(n){
  var SV = C.SOLVE;
  if(!SV || !T.ctx) return;
  var q = null;
  T.ctx.qs.forEach(function(x){ if(x.n === n) q = x });
  if(!q) return;
  var b = SV.blind(q);
  var box = $('sg_' + (T.ctx.pfx||'') + n);
  if(!box) return;
  if(!b){ box.innerHTML = '<div class="sd">这题没法用规律判断，先定位回原文看看。</div>'; return }
  var L = String.fromCharCode(65 + b.i);
  var h = '<div class="sd"><b>规律指向 ' + L + '</b>　' + esc(String(q.o[b.i]).slice(0, 40)) + '</div>';
  if(b.reasons.length) h += '<div class="sd">' + b.reasons.map(function(r){ return '· ' + esc(r) }).join('<br>') + '</div>';
  /* 分布条：说明按 ABCD 均匀这条规律补的是谁 */
  var d = SV.dist();
  if(d._tot >= 3){
    h += '<div class="sdist">这套已经选过 ' + d._tot + ' 题：';
    ['A','B','C','D'].forEach(function(k, i){
      if(i >= (q.o||[]).length) return;
      h += '<span class="sdbox">' + k + '<span class="sdbar" style="width:' + (6 + d[k]*10) + 'px"></span>' + d[k] + '</span>';
    });
    h += '</div>';
  }
  h += '<div class="sd hint">刚才这几步是<b>统计规律</b>，不是找到了依据。'
     + '尤其要注意：本站题库是自编的，为了把干扰项写得明显，这类规律在<b>这里能蒙对九成</b>，'
     + '真题上大约只有一半——靠它只能保底，练不出来真本事。</div>';
  h += '<div style="margin-top:8px"><button class="sm" onclick="CET6.TOOLS.fillGuess(' + n + ',' + b.i + ')">先填上 ' + L + '</button> '
     + '<button class="sm" onclick="CET6.TOOLS.locate(' + n + ')">定位原文核对</button></div>';
  box.innerHTML = h;
};
T.fillGuess = function(n, i){
  if(!T.ctx || !T.ctx.onPick) return;
  T.ctx.onPick(n, i);
  /* 打个标记：这是猜的，回头要回来核对 */
  var qw = $('qw_' + (T.ctx.pfx||'') + n);
  if(qw && qw.querySelectorAll){
    var os = qw.querySelectorAll('.opt[data-i="' + i + '"]');
    for(var k=0;k<os.length;k++) os[k].className = 'opt optpick';
  }
  T.toast('已选 ' + String.fromCharCode(65+i) + '（虚线标记 = 猜的），做完记得回原文核对为什么');
};

/* ================= 完整解析（非分层，用于提交后） ================= */
T.expHTML = function(q, got){
  var right = (got === q.a), h = '';
  h += '<div class="exp"><div class="eh">';
  h += '<span>第 '+q.n+' 题</span>';
  h += right ? '<span class="pill g">正确</span>' : '<span class="pill r">错误</span>';
  h += '<span class="hint">你选 '+(got!=null?String.fromCharCode(65+got):'未答')+' · 正确 '+String.fromCharCode(65+q.a)+'</span>';
  if(q.type) h += '<span class="qbadge k-'+q.type+'">'+C.TYPE[q.type].n+'</span>';
  h += '<span class="sp" style="flex:1"></span>';
  h += '<button class="sm" onclick="CET6.TOOLS.locate('+q.n+')">定位原文</button>';
  h += '</div><div class="eb">';
  h += '<div class="sec z"><div class="sh">为什么</div>'+esc(q.why||'（未写解析）')+'</div>';
  if(q.loc) h += '<div class="sec loc"><div class="sh">原文依据</div><div class="loc" data-t="'+esc(q.locZh||q.loc)+'">'+esc(q.loc)+'</div></div>';
  if(q.trap && q.trap.length){
    h += '<div class="sec tr"><div class="sh">干扰项为什么错</div><div class="trap">';
    q.trap.forEach(function(t){ h += '<div class="row2"><b>×</b><span>'+esc(t)+'</span></div>' });
    h += '</div></div>';
  }
  if(q.guess) h += '<div class="sec gs"><div class="sh">没读懂时怎么猜</div><div class="tipbox">'+esc(q.guess)+'</div></div>';
  h += '</div></div>';
  return h;
};

/* 分级提示：只先给方向，后面两级按需点开，用到第几级都记下来
   档位决定「最多能开到第几级」，不是一口气全摊开——
   提示 3 只给思路，不直接报答案，答案等提交后自己核对 */
T.hint = {};
T.hintOf = function(n){ return (T.hint && T.hint[n]) || 0 };
T.moreHint = function(n, lv){
  if(!T.hint) T.hint = {};
  T.hint[n] = Math.max(T.hint[n] || 0, lv);
  var q = null;
  if(T.ctx) T.ctx.qs.forEach(function(x){ if(x.n === n) q = x });
  if(!q) return;
  var el = $('hint_' + (T.ctx.pfx||'') + n);
  if(el) el.innerHTML = T.assistHTML(q);
  if(lv >= 3) T.toast('已开到「思路」。答案先别看，自己选完再提交核对');
};
T.assistHTML = function(q){
  var s = C.settings, h = '';
  if(s.assist <= 0) return '';
  var lv = T.hintOf(q.n);
  h += '<div class="assist"><b>提示 1 · 解题方向</b><br>' + (C.TYPE[q.type] ? ('<b>'+C.TYPE[q.type].n+'</b>：'+C.TYPE[q.type].tip) : '') + '</div>';
  if(s.assist > 1 && q.l2){
    if(lv >= 2) h += '<div class="assist"><b>提示 2 · 去哪找</b><br>' + esc(q.l2) + '</div>';
    else h += '<div class="hintbtn"><button class="sm" onclick="CET6.TOOLS.moreHint('+q.n+',2)">还是没思路 → 告诉我在哪一段</button></div>';
  }
  if(s.assist > 2 && q.why){
    if(lv >= 3) h += '<div class="assist"><b>提示 3 · 思路</b><br>' + esc(q.why) +
      '<div class="hint" style="margin-top:6px">答案没给你——先自己选，提交后核对。直接看答案练不出东西。</div></div>';
    else h += '<div class="hintbtn"><button class="sm" onclick="CET6.TOOLS.moreHint('+q.n+',3)">实在不会 → 看思路</button></div>';
  }
  return h;
};

/* ================= 环形进度 ================= */
T.ring = function(pct, size, label, sub){
  size = size || 118;
  var r = size/2 - 9, cx = size/2, cc = 2*Math.PI*r;
  var off = cc * (1 - Math.max(0, Math.min(1, pct)));
  var col = pct >= .6 ? '#15803D' : (pct >= .45 ? '#B45309' : '#B91C1C');
  var h = '<div class="ring" style="width:'+size+'px;height:'+size+'px">';
  h += '<svg width="'+size+'" height="'+size+'">';
  h += '<circle cx="'+cx+'" cy="'+cx+'" r="'+r+'" fill="none" stroke="#EEF2F7" stroke-width="9"/>';
  h += '<circle cx="'+cx+'" cy="'+cx+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+cc.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/>';
  h += '</svg><div class="cap"><b>'+label+'</b>'+(sub?'<s>'+sub+'</s>':'')+'</div></div>';
  return h;
};
})();
