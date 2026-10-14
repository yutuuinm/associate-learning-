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
    {n:'展开 / 收起本题解析', k:'E', fn:'reveal'},
    {n:'定位到原文依据', k:'L', fn:'locate'},
    {n:'整篇逐句翻译开关', k:'T', fn:'zh'},
    {n:'提交本套', k:'Enter', fn:'submit'}
  ]},
  { sec:'划词', items:[
    {n:'把选中的词收进生词本（自动带例句）', k:'S', fn:'word'},
    {n:'翻译划选的整段', k:'R', fn:'tr'}
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
  zh:    function(){ T.toggleZh() },
  submit:function(){ if(T.ctx && T.ctx.onGrade) T.ctx.onGrade() },
  word:  function(){ T.addSel() },
  tr:    function(){ T.translateSel() },
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
  if(it.fn === 'word' || it.fn === 'tr') return true;
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
  if(!w || w.length<2){ T.toast('先选中一个单词，或把鼠标停在词上再按 S'); return }
  if(!def) def = C.lookup(w) || '';
  var c = T.pickCtx(w, ctx);
  var S = C.STATS;
  var existed = !S.srsAdd(w, def, c.en, c.zh || cz || '', src || (C.srcLabel ? C.srcLabel() : ''), c.hl);
  if(existed && c.en && !S.srsHasCtx(w)){
    S.srsSetCtx(w, c.en, c.zh || cz || '', src || (C.srcLabel ? C.srcLabel() : ''), c.hl);
    T.toast(w + ' 已经在生词本里，已补上这句例句');
  }else{
    T.toast(existed ? ('已经有了：' + w) : ('已收进生词本：' + w + (c.en ? '（带例句）' : '（这段没有例句）')));
  }
  T.refreshBadges();
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
T.addSel = function(){
  var sel = C._sel;
  if(sel && sel.one && sel.word){ T.addWord(sel.word); C.hideSelBar(); return }
  var s = window.getSelection();
  var t = s ? String(s.toString()||'').trim() : '';
  if(t && /^[A-Za-z][A-Za-z'-]*$/.test(t)){ T.addWord(t); return }
  if(C.lastWord) { T.addWord(C.lastWord); return }
  T.toast('先选中一个单词，或把鼠标停在词上再按 S');
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
    if(!zh){ el.innerHTML = '<div class="selhd">翻译失败</div><div class="selpairs"><div class="selp"><div class="sz mut">检查一下 AI 接口配置。</div></div></div>'; return }
    el.innerHTML = '<div class="selhd">AI 翻译</div><div class="selpairs"><div class="selp"><div class="se">' + C.esc(txt) +
      '</div><div class="sz">' + C.esc(zh) + '</div></div></div>';
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

  if(e.key === 'Escape'){ T.kbdClose(); return }
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
