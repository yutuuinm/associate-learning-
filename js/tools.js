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
};

/* ================= 快捷键面板 ================= */
T.kbd = function(){ var k=$('kbd'); if(k) k.style.display='flex' };
T.kbdClose = function(){ var k=$('kbd'); if(k) k.style.display='none' };
document.addEventListener('click', function(){ T.kbdClose() });
if($ && $('kbd')) $('kbd').addEventListener('click', function(){ T.kbdClose() });

/* ================= 练习上下文 ================= */
/* ctx = {kind, sid, qs:[], ans:{}, onPick(n,i), onReveal(n), onGrade()} */
T.ctx = null;
T.cur = 0;
T.bind = function(ctx){
  T.ctx = ctx; T.cur = 0;
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

/* ================= 收词 ================= */
T.addWord = function(w, def, ctx){
  w = String(w||'').toLowerCase().replace(/[^a-z-]/g,'');
  if(!w || w.length<2){ T.toast('先选中一个单词，或把鼠标停在词上再按 S'); return }
  if(!def) def = C.lookup(w) || '';
  var isNew = C.STATS.srsAdd(w, def, ctx||'');
  T.toast(isNew ? ('已收进生词本：' + w) : ('生词本里已经有了：' + w));
  T.refreshBadges();
};
T.addSel = function(){
  var s = window.getSelection();
  var t = s ? String(s.toString()||'').trim() : '';
  if(t && /^[A-Za-z][A-Za-z'-]*$/.test(t)){ T.addWord(t); return }
  if(C.lastWord) { T.addWord(C.lastWord); return }
  T.toast('没有选中的词');
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

/* 分级提示（做题前显示，按 assist 档位） */
T.assistHTML = function(q){
  var s = C.settings, h = '';
  if(s.assist <= 0) return '';
  h += '<div class="assist"><b>提示 1 · 解题方向</b><br>' + (C.TYPE[q.type] ? ('<b>'+C.TYPE[q.type].n+'</b>：'+C.TYPE[q.type].tip) : '') + '</div>';
  if(s.assist > 1 && q.l2) h += '<div class="assist"><b>提示 2 · 去哪找</b><br>' + esc(q.l2) + '</div>';
  if(s.assist > 2 && q.why) h += '<div class="assist"><b>提示 3 · 答案</b><br>' + esc(q.why) + '　<b>正确答案：'+String.fromCharCode(65+q.a)+'</b></div>';
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
