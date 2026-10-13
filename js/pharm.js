/* 349 药学综合模块：学霸笔记 / 带背 / 反应机理 / 常考题 / 收藏
   路由由 app.js 在 hash 以 #/p/ 开头时转发到 PHARMV.route() */
window.CET6 = window.CET6 || {};

(function(){
var C = window.CET6;
var P = C.PHARM || {};
var V = C.PHARMV = {};
var $ = C.$, esc = C.esc, get = C.get, set = C.set;
var R = C.RC;

var COURSES = [
  {k:'org', n:'有机化学', list:P.org || [], book:'胡春《有机化学》三版'},
  {k:'ana', n:'分析化学', list:P.ana || [], book:'邸欣《分析化学》八版'},
  {k:'bio', n:'生物化学', list:P.bio || [], book:'姚文兵《生物化学》八版'}
];
function course(k){ var c=null; COURSES.forEach(function(x){ if(x.k===k) c=x }); return c }
function allChs(){ var a=[]; COURSES.forEach(function(c){ c.list.forEach(function(ch){ a.push({c:c, ch:ch}) }) }); return a }
function findCh(id){ var f=null; allChs().forEach(function(x){ if(x.ch.id===id) f=x }); return f }
function countPts(){ var n=0; allChs().forEach(function(x){ n += (x.ch.pts||[]).length }); return n }
function countQs(){ var n=0; allChs().forEach(function(x){ n += (x.ch.qs||[]).length }); return n }
function countMech(){ var n=0; (P.org||[]).forEach(function(ch){ n += (ch.mech||[]).length }); return n }

V.titles = {home:'349 总览', note:'学霸笔记', recite:'带背', mech:'反应机理', bank:'常考题', star:'我的收藏', about:'考试说明'};

/* ================= 路由 ================= */
V.route = function(parts){
  var v = parts[0] || 'home', arg = parts[1], arg2 = parts[2];
  var app = $('app'); app.innerHTML = '';
  hideTrans();
  C.TOOLS.unbind();
  if(v==='home') renderHome();
  else if(v==='note'){
    if(arg === 'ch') renderNoteCh(arg2);
    else if(arg === 'c') renderNote(arg2);
    else renderNote();
  }
  else if(v==='recite') renderRecite(arg);
  else if(v==='mech') arg ? renderMechOne(arg) : renderMech();
  else if(v==='bank') renderBank(arg, arg2);
  else if(v==='star') renderStar();
  else if(v==='about') renderAbout();
  else renderHome();
  window.scrollTo(0,0);
  markNav(v);
  setCrumb(v);
};
function setCrumb(v){ var c=$('crumb'); if(c) c.innerHTML='<b>'+(V.titles[v]||'')+'</b>' }
function hideTrans(){ var t=$('tt'); if(t){ t.innerHTML='把鼠标移到任意句子上，这里显示整句翻译'; t.className='empty' } }
function markNav(v){
  var as = document.querySelectorAll('#menuPharm a');
  for(var i=0;i<as.length;i++){
    var hr = as[i].getAttribute('href')||'';
    as[i].className = (hr==='#/p/'+v || hr.indexOf('#/p/'+v+'/')===0) ? 'on' : '';
  }
  var as2 = document.querySelectorAll('#menuCet6 a');
  for(var j=0;j<as2.length;j++) as2[j].className = '';
  var sd = document.getElementById('side'); if(sd) sd.classList.remove('open');
}

/* ================= 总览 ================= */
function renderHome(){
  var h = '';
  h += '<div class="card"><h1>349 药学综合</h1>';
  h += '<p class="sub">沈阳药科大学自命题。<b>有机化学 + 分析化学 + 生物化学</b>三门，每门 100 分，满分 300 分，题型不限。这个模块是给你<b>背</b>和<b>查</b>用的：知识点压到最干，带背循环着过，不会的点随时翻。</p>';
  var d = examDays();
  h += '<div class="grid" style="margin-top:14px">';
  h += '<div class="mc"><div class="l">距初试</div><div class="v">'+d+'</div><div class="u">'+esc(getExamDate())+'（可改）</div></div>';
  h += '<div class="mc"><div class="l">知识点</div><div class="v">'+countPts()+'</div><div class="u">条干总结</div></div>';
  h += '<div class="mc"><div class="l">常考题</div><div class="v">'+countQs()+'</div><div class="u">道</div></div>';
  h += '<div class="mc"><div class="l">反应机理</div><div class="v">'+countMech()+'</div><div class="u">个分步拆解</div></div>';
  h += '</div>';
  h += '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">';
  h += '<button class="primary big" onclick="location.href=\'#/p/recite\'">开始带背</button> ';
  h += '<button class="big" onclick="location.href=\'#/p/note\'">看笔记</button> ';
  h += '<button class="big" onclick="location.href=\'#/p/mech\'">看机理</button> ';
  h += '<button class="big" onclick="location.href=\'#/p/bank\'">刷题</button>';
  h += '</div></div>';

  /* 三科 */
  h += '<div class="grid3">';
  COURSES.forEach(function(c){
    var pts=0, qs=0; c.list.forEach(function(ch){ pts += (ch.pts||[]).length; qs += (ch.qs||[]).length });
    h += '<div class="course" onclick="location.href=\'#/p/note/c/'+c.k+'\'">';
    h += '<div class="cn">'+esc(c.n)+'</div>';
    h += '<div class="cs">'+esc(c.book)+'</div>';
    h += '<div class="cnums"><div><b>'+c.list.length+'</b>章</div><div><b>'+pts+'</b>知识点</div><div><b>'+qs+'</b>题</div></div>';
    h += '</div>';
  });
  h += '</div>';

  /* 常考章节 TOP */
  var hot = allChs().slice().sort(function(a,b){ return (b.ch.hot||0)-(a.ch.hot||0) }).slice(0,8);
  h += '<div class="card"><h3>最该先背的 8 章（按常考指数排）</h3><ul class="list">';
  hot.forEach(function(x){
    h += '<li><span class="tag b">'+esc(x.c.n)+'</span><span class="g">'+esc(x.ch.t)+'<div class="d">'+esc(x.ch.sub||'')+'</div></span>';
    h += hotBar(x.ch.hot);
    h += '<button class="sm" onclick="location.href=\'#/p/note/ch/'+x.ch.id+'\'">看</button> ';
    h += '<button class="sm" onclick="CET6.PHARMV.reciteCh(\''+x.ch.id+'\')">背</button></li>';
  });
  h += '</ul></div>';

  h += '<div class="card tight"><p class="sub" style="margin:0">内容按三本指定教材的章节与常见考点整理，<b>不是官方真题</b>（真题受版权保护，且学校不公开）。建议用它建立骨架，真题另行获取后用「导入题目」加进题库。</p></div>';
  $('app').innerHTML = h;
}
function hotBar(n){
  n = n||0; var s = '<span class="hotbar">';
  for(var i=1;i<=5;i++) s += '<i class="'+(i<=n?'on':'')+'"></i>';
  return s + '</span>';
}
function getExamDate(){ return get('cet6_examdate','2026-12-19') }
function examDays(){
  var d = new Date(getExamDate()+'T08:30:00'), n = new Date();
  return Math.max(0, Math.ceil((d-n)/86400000));
}
V.setExamDate = function(v){ set('cet6_examdate', v); V.route(['home']) };

/* ================= 学霸笔记 ================= */
var NOTE_COURSE = get('cet6_notecourse','org');
function renderNote(k){
  if(k) NOTE_COURSE = k, set('cet6_notecourse', k);
  var c = course(NOTE_COURSE) || COURSES[0];
  var h = '';
  h += '<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
  h += '<h1 style="margin:0;flex:1">学霸笔记</h1>';
  h += '<div class="seg">';
  COURSES.forEach(function(x){
    h += '<button class="'+(x.k===NOTE_COURSE?'on':'')+'" onclick="location.href=\'#/p/note/c/'+x.k+'\'">'+esc(x.n)+'</button>';
  });
  h += '</div></div>';
  h += '<p class="sub" style="margin:8px 0 0">一句话一条，不废话。标 <span class="kw">红</span> 的是常考陷阱，紫色是口诀。点「背」直接进带背。</p></div>';

  c.list.forEach(function(ch){
    h += '<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
    h += '<div style="flex:1;min-width:200px"><h3 style="margin:0">'+esc(ch.t)+'</h3>';
    h += '<div class="hint">'+esc(ch.sub||'')+'</div></div>';
    h += hotBar(ch.hot);
    h += '<button class="sm primary" onclick="location.href=\'#/p/note/ch/'+ch.id+'\'">展开</button> ';
    h += '<button class="sm" onclick="CET6.PHARMV.reciteCh(\''+ch.id+'\')">背这章</button></div>';
    h += '<div class="hint" style="margin-top:6px">'+(ch.pts||[]).length+' 条知识点 · '+(ch.qs||[]).length+' 道题'+(ch.mech&&ch.mech.length?(' · '+ch.mech.length+' 个机理'):'')+'</div></div>';
  });
  $('app').innerHTML = h;
}
function renderNoteCh(id, back){
  var f = findCh(id);
  if(!f){ $('app').innerHTML = '<div class="card"><div class="empty-st"><p>找不到这一章。</p><button class="primary" onclick="location.href=\'#/p/note\'">回笔记</button></div></div>'; return }
  var ch = f.ch;
  var h = '';
  h += '<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
  h += '<div style="flex:1;min-width:200px"><h1 style="margin:0">'+esc(ch.t)+'</h1>';
  h += '<div class="hint">'+esc(f.c.n)+' · '+esc(ch.sub||'')+'</div></div>';
  h += hotBar(ch.hot);
  h += '<button class="sm primary" onclick="CET6.PHARMV.reciteCh(\''+ch.id+'\')">背这一章</button> ';
  h += '<button class="sm" onclick="location.href=\'#/p/bank/'+f.c.k+'/'+ch.id+'\'">做这章的题</button> ';
  h += '<button class="sm" onclick="location.href=\'#/p/note/c/'+f.c.k+'\'">返回</button></div></div>';

  (ch.pts||[]).forEach(function(p,i){
    h += '<div class="note"><div class="nk">'+esc(p.k)+'</div><div class="nb">';
    h += '<div class="na">'+esc(p.a)+'</div>';
    if(p.mn) h += '<div class="nmn">口诀：'+esc(p.mn)+'</div>';
    if(p.trap) h += '<div class="ntr">易错：'+esc(p.trap)+'</div>';
    h += '</div></div>';
  });

  if(ch.mech && ch.mech.length){
    h += '<div class="card"><h3>本章机理</h3><ul class="list">';
    ch.mech.forEach(function(m){
      h += '<li><span class="tag b">机理</span><span class="g">'+esc(m.name)+'<div class="d">'+esc(m.rx)+'</div></span>';
      h += '<button class="sm" onclick="location.href=\'#/p/mech/'+m.id+'\'">看</button></li>';
    });
    h += '</ul></div>';
  }
  $('app').innerHTML = h;
}
V.reciteCh = function(id){ location.href = '#/p/recite/ch_' + id };

/* ================= 带背 ================= */
function reciteItems(scopeKey){
  var out = [], title = '';
  if(scopeKey === 'star'){
    title = '我的收藏';
    allChs().forEach(function(x){
      (x.ch.pts||[]).forEach(function(p){
        if(R.isStar(x.ch.id + '.' + p.k)) out.push({id:x.ch.id+'.'+p.k, k:p.k, a:p.a, mn:p.mn, from:x.c.n+' · '+x.ch.t});
      });
    });
  }else if(scopeKey === 'hot'){
    title = '高频考点';
    allChs().forEach(function(x){
      if((x.ch.hot||0) >= 5) (x.ch.pts||[]).forEach(function(p){
        out.push({id:x.ch.id+'.'+p.k, k:p.k, a:p.a, mn:p.mn, from:x.c.n+' · '+x.ch.t});
      });
    });
  }else if(scopeKey && scopeKey.indexOf('ch_') === 0){
    var f = findCh(scopeKey.slice(3));
    title = f ? (f.c.n + ' · ' + f.ch.t) : '本章';
    if(f) (f.ch.pts||[]).forEach(function(p){
      out.push({id:f.ch.id+'.'+p.k, k:p.k, a:p.a, mn:p.mn, from:f.c.n+' · '+f.ch.t});
    });
  }else if(scopeKey && scopeKey.indexOf('c_') === 0){
    var c = course(scopeKey.slice(2));
    title = c ? c.n : '本科目';
    if(c) c.list.forEach(function(ch){
      (ch.pts||[]).forEach(function(p){
        out.push({id:ch.id+'.'+p.k, k:p.k, a:p.a, mn:p.mn, from:c.n+' · '+ch.t});
      });
    });
  }else{
    title = '全部';
    allChs().forEach(function(x){
      (x.ch.pts||[]).forEach(function(p){
        out.push({id:x.ch.id+'.'+p.k, k:p.k, a:p.a, mn:p.mn, from:x.c.n+' · '+x.ch.t});
      });
    });
  }
  return {items:out, title:title};
}

function renderRecite(scopeKey){
  var key = scopeKey || get('cet6_rcscope','all');
  set('cet6_rcscope', key);
  var built = reciteItems(key);
  if(!R.state.key || R.state.key !== key) R.build(key, built.items);
  var st = R.state, it = R.cur();

  var h = '';
  /* 范围选择 */
  h += '<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
  h += '<h1 style="margin:0;flex:1">带背</h1>';
  h += '<span class="pill">'+esc(built.title)+'</span>';
  h += '<span class="hint">'+built.items.length+' 条</span></div>';
  h += '<p class="sub" style="margin:8px 0 0">三种模式：<b>跟读</b>看着念 · <b>填空</b>先自己想 · <b>听背</b>遮住只听。快捷键 <kbd>空格</kbd> 播放/暂停，<kbd>←</kbd><kbd>→</kbd> 切换，<kbd>D</kbd> 显示答案，<kbd>F</kbd> 收藏。</p>';
  h += '<div class="chips" style="margin-top:12px">';
  h += '<span class="chip'+(key==='all'?' on':'')+'" onclick="CET6.PHARMV.scope(\'all\')">全部</span>';
  h += '<span class="chip'+(key==='hot'?' on':'')+'" onclick="CET6.PHARMV.scope(\'hot\')">只背高频</span>';
  h += '<span class="chip'+(key==='star'?' on':'')+'" onclick="CET6.PHARMV.scope(\'star\')">只背收藏</span>';
  COURSES.forEach(function(c){
    h += '<span class="chip'+(key==='c_'+c.k?' on':'')+'" onclick="CET6.PHARMV.scope(\'c_'+c.k+'\')">'+esc(c.n)+'</span>';
  });
  h += '</div>';
  if(key.indexOf('ch_') === 0){
    var f = findCh(key.slice(3));
    h += '<div class="hint">正在背：'+esc(f? (f.c.n+' · '+f.ch.t) : key)+'　<a href="#/p/note">换一章</a></div>';
  }
  h += '</div>';

  if(!built.items.length){
    h += '<div class="card"><div class="empty-st"><div class="ic">◻</div><p>这个范围里没有内容。</p><button class="primary" onclick="CET6.PHARMV.scope(\'all\')">背全部</button></div></div>';
    $('app').innerHTML = h; return;
  }

  /* 设置条 */
  h += '<div class="card tight"><div class="rcset">';
  h += '<div class="seg">';
  [['follow','跟读'],['fill','填空'],['listen','听背']].forEach(function(m){
    h += '<button class="'+(st.mode===m[0]?'on':'')+'" onclick="CET6.PHARMV.mode(\''+m[0]+'\')">'+m[1]+'</button>';
  });
  h += '</div>';
  h += '<span>语速 <select onchange="CET6.PHARMV.rate(+this.value)">';
  [0.7,0.85,1.0,1.2,1.5].forEach(function(v){
    h += '<option value="'+v+'"'+(Math.abs(st.rate-v)<0.01?' selected':'')+'>'+v+'x</option>';
  });
  h += '</select></span>';
  h += '<span>每条读 <select onchange="CET6.PHARMV.loop(+this.value)">';
  [1,2,3].forEach(function(v){ h += '<option value="'+v+'"'+(st.loop===v?' selected':'')+'>'+v+' 遍</option>' });
  h += '</select></span>';
  h += '<span>间隔 <select onchange="CET6.PHARMV.gap(+this.value)">';
  [0.5,1.2,2,4].forEach(function(v){ h += '<option value="'+v+'"'+(Math.abs(st.gap-v)<0.01?' selected':'')+'>'+v+' 秒</option>' });
  h += '</select></span>';
  h += '<span style="margin-left:auto" class="hint">会自动往下走，背完一轮停住</span>';
  h += '</div></div>';

  /* 卡片 */
  var bl = null;
  if(st.mode === 'fill') bl = R.blank(it.a);
  var masked = (st.mode === 'listen' && !st.show);
  h += '<div class="rc'+(masked?' mask':'')+'" id="rcCard">';
  h += '<div class="rk">'+esc(it.k)+'</div>';
  if(st.mode === 'fill'){
    h += '<div class="ra">' + esc(bl.text).replace(/＿＿＿＿/g, '<span class="blank'+(st.show?' show':'')+'">'+(st.show?esc(bl.ans[0]):'　')+'</span>') + '</div>';
  }else{
    h += '<div class="ra">'+esc(it.a)+'</div>';
  }
  if(it.mn && st.mode !== 'listen') h += '<div class="ramn">口诀：'+esc(it.mn)+'</div>';
  if(st.mode === 'listen' && !st.show) h += '<div class="ra" style="color:var(--mut2)">（按 <kbd>D</kbd> 或点下面按钮显示答案）</div>';
  h += '<div class="rcmeta">'+esc(it.from||'')+'　·　第 '+(st.i+1)+' / '+st.list.length+'</div>';
  h += '</div>';

  /* 进度条 */
  h += '<div class="bar" style="margin:12px 0"><i style="width:'+(R.progress()*100).toFixed(1)+'%"></i></div>';

  /* 控制 */
  h += '<div class="rctl">';
  h += '<button class="big" onclick="CET6.PHARMV.rcPrev()">← 上一条</button> ';
  h += '<button class="primary big" onclick="CET6.PHARMV.rcToggle()">'+(st.playing?'⏸ 暂停':'▶ 播放')+'</button> ';
  h += '<button class="big" onclick="CET6.PHARMV.rcNext()">下一条 →</button>';
  h += '</div>';
  h += '<div class="rctl" style="margin-top:8px">';
  h += '<button class="sm" onclick="CET6.PHARMV.rcReveal()">显示答案 (D)</button> ';
  h += '<button class="sm" onclick="CET6.PHARMV.rcStar()">'+(R.isStar(it.id)?'★ 已收藏':'☆ 收藏')+' (F)</button> ';
  h += '<button class="sm" onclick="CET6.PHARMV.rcReset()">从头开始</button>';
  h += '</div>';
  h += '<div class="center hint" id="vmsg" style="margin-top:10px"></div>';

  $('app').innerHTML = h;
  checkVoice();
}
/* 没有中文语音就明说，别让人以为坏了 */
function checkVoice(){
  var el = $('vmsg'); if(!el) return;
  setTimeout(function(){
    if(!R.ttsOK()){ el.innerHTML = '这个浏览器不支持语音合成，朗读不可用——用「填空」和「听背」的显示答案按钮一样能背。'; return }
    if(!R.hasZh()){
      el.innerHTML = '没找到中文语音包，朗读可能读不出来或读得怪。Windows 可在「设置 → 时间和语言 → 语音」里装中文语音；Mac 在「系统设置 → 辅助功能 → 朗读内容」里添加。';
    }
  }, 900);
}
V.scope = function(k){ R.stop(); R.state.key = null; renderRecite(k) };
V.mode = function(m){ R.stop(); R.setMode(m); renderRecite() };
V.rate = function(v){ R.setRate(v) };
V.loop = function(v){ R.setLoop(v) };
V.gap  = function(v){ R.setGap(v) };
V.rcNext = function(){ R.stop(); R.next(); renderRecite() };
V.rcPrev = function(){ R.stop(); R.prev(); renderRecite() };
V.rcToggle = function(){
  R.toggle();
  var b = document.querySelector('.rctl .primary');
  if(b) b.innerHTML = R.state.playing ? '⏸ 暂停' : '▶ 播放';
};
V.rcReveal = function(){ R.reveal(); renderRecite() };
V.rcStar = function(){ R.toggleStar(R.cur().id); renderRecite() };
V.rcReset = function(){ R.stop(); R.goto(0); renderRecite() };
V.refreshRecite = function(){ if(location.hash.indexOf('#/p/recite') === 0) renderRecite() };

/* 带背快捷键 */
document.addEventListener('keydown', function(e){
  if((location.hash||'').indexOf('#/p/recite') < 0) return;
  var t = e.target, tag = t && t.tagName;
  if(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  var k = e.key.toLowerCase();
  if(e.key === ' '){ V.rcToggle(); e.preventDefault(); return }
  if(e.key === 'ArrowRight'){ V.rcNext(); e.preventDefault(); return }
  if(e.key === 'ArrowLeft'){ V.rcPrev(); e.preventDefault(); return }
  if(k === 'd'){ V.rcReveal(); e.preventDefault(); return }
  if(k === 'f'){ V.rcStar(); e.preventDefault(); return }
});

/* ================= 机理 ================= */
function renderMech(){
  var h = '<div class="card"><h1>反应机理</h1>';
  h += '<p class="sub">有机化学的分基本都在机理上。每个机理拆成「分步 + 电子流向 + 考点」三段：先看每步<b>谁进攻谁</b>，再看<b>箭头怎么走</b>，最后记<b>考点结论</b>。</p></div>';
  var list = [];
  (P.org||[]).forEach(function(ch){
    (ch.mech||[]).forEach(function(m){ list.push({ch:ch, m:m}) });
  });
  list.forEach(function(x){
    h += '<div class="mech"><div class="mh"><div class="mt">'+esc(x.m.name)+'</div>';
    h += '<span class="mrx">'+esc(x.m.rx)+'</span></div>';
    h += '<div style="padding:10px 16px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">';
    h += '<span class="hint">'+esc(x.ch.t)+' · '+x.m.steps.length+' 步</span>';
    h += '<span style="flex:1"></span>';
    h += '<button class="sm primary" onclick="location.href=\'#/p/mech/'+x.m.id+'\'">展开分步</button></div></div>';
  });
  $('app').innerHTML = h;
}
function renderMechOne(id){
  var f = null;
  (P.org||[]).forEach(function(ch){
    (ch.mech||[]).forEach(function(m){ if(m.id === id) f = {ch:ch, m:m} });
  });
  if(!f){ $('app').innerHTML = '<div class="card"><div class="empty-st"><p>找不到这个机理。</p><button class="primary" onclick="location.href=\'#/p/mech\'">回机理库</button></div></div>'; return }
  var m = f.m;
  var h = '<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
  h += '<div style="flex:1;min-width:200px"><h1 style="margin:0">'+esc(m.name)+'</h1><div class="hint">'+esc(f.ch.t)+'</div></div>';
  h += '<button class="sm" onclick="location.href=\'#/p/mech\'">全部机理</button> ';
  h += '<button class="sm" onclick="location.href=\'#/p/note/ch/'+f.ch.id+'\'">本章笔记</button></div></div>';

  h += '<div class="mech"><div class="mh"><div class="mt">总反应</div><span class="mrx">'+esc(m.rx)+'</span></div>';
  m.steps.forEach(function(s,i){
    h += '<div class="ms"><div class="mst"><b>'+(i+1)+'</b>'+esc(s.t)+'</div>';
    h += '<div class="msd">'+esc(s.d)+'</div>';
    if(s.arrow) h += '<div class="msa">箭头：'+esc(s.arrow)+'</div>';
    h += '</div>';
  });
  if(m.key) h += '<div class="mkey"><b>考点</b><br>'+esc(m.key)+'</div>';
  h += '</div>';

  h += '<div class="card tight"><p class="hint" style="margin:0">看机理的口诀：先找<b>亲核中心</b>（富电子：双键、负离子、孤对）和<b>亲电中心</b>（缺电子：碳正离子、羰基碳、质子化的离去基团），箭头从富电子画到缺电子。判断不清产物时，先看生成什么中间体最稳定。</p></div>';
  $('app').innerHTML = h;
}

/* ================= 题库 ================= */
var BANK = {course:'org', ch:'', ans:{}, done:false, list:[]};
function renderBank(ck, chId){
  if(ck) BANK.course = ck;
  var c = course(BANK.course) || COURSES[0];
  BANK.ch = chId || '';
  var qs = [], title = c.n;
  if(chId){
    var f = findCh(chId);
    if(f){ qs = (f.ch.qs||[]).slice(); title = f.c.n + ' · ' + f.ch.t }
  }else{
    c.list.forEach(function(ch){
      (ch.qs||[]).forEach(function(q){ qs.push(Object.assign({__from:ch.t}, q)) });
    });
  }
  BANK.list = qs; BANK.ans = {}; BANK.done = false;

  var h = '<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
  h += '<h1 style="margin:0;flex:1">常考题</h1>';
  h += '<div class="seg">';
  COURSES.forEach(function(x){
    h += '<button class="'+(x.k===BANK.course?'on':'')+'" onclick="location.href=\'#/p/bank/'+x.k+'\'">'+esc(x.n)+'</button>';
  });
  h += '</div></div>';
  h += '<p class="sub" style="margin:8px 0 0">按教材章节和常见考点整理的选择/判断/简答。<b>不是真题</b>。做完看解析里的「答题要点」，简答要能复述出来才算会。</p>';
  h += '<div class="chips">';
  h += '<span class="chip'+(!chId?' on':'')+'" onclick="location.href=\'#/p/bank/'+BANK.course+'\'">全部</span>';
  c.list.forEach(function(ch){
    h += '<span class="chip'+(chId===ch.id?' on':'')+'" onclick="location.href=\'#/p/bank/'+BANK.course+'/'+ch.id+'\'">'+esc(ch.t)+'</span>';
  });
  h += '</div></div>';

  if(!qs.length){
    h += '<div class="card"><div class="empty-st"><p>这个范围还没有题。</p></div></div>';
    $('app').innerHTML = h; return;
  }

  h += '<div class="card"><div style="display:flex;align-items:center;gap:10px"><h2 style="margin:0;flex:1">'+esc(title)+'</h2>';
  h += '<span class="pill">'+qs.length+' 题</span></div>';
  h += '<p class="hint" style="margin:8px 0 0">点选项即选；选完点「查看解析」逐题对。多选题可多选。</p></div>';

  qs.forEach(function(q, i){
    h += '<div class="card qz" id="pq_'+i+'">';
    h += '<div class="qmeta">第 '+(i+1)+' 题　<span class="tag">'+esc(q.type||'')+'</span>' + (q.hot?('　'+hotBar(q.hot)):'') + (q.__from?('　'+esc(q.__from)):'') + '</div>';
    h += '<div class="qt">'+esc(q.q)+'</div>';
    if(q.o && q.o.length){
      h += '<div class="opts">';
      q.o.forEach(function(o, oi){
        h += '<div class="opt" data-qi="'+i+'" data-oi="'+oi+'"><span class="k">'+String.fromCharCode(65+oi)+'</span><span>'+esc(o)+'</span></div>';
      });
      h += '</div>';
    }else{
      h += '<textarea id="sa_'+i+'" style="min-height:70px" placeholder="先自己写一遍要点，再对答案"></textarea>';
    }
    h += '<div id="pe_'+i+'"></div></div>';
  });

  h += '<div class="card center"><button class="primary big" onclick="CET6.PHARMV.gradeBank()">查看解析</button></div>';
  $('app').innerHTML = h;

  var box = $('app');
  box.addEventListener('click', function(e){
    var el = e.target && e.target.closest ? e.target.closest('.opt[data-qi]') : null;
    if(!el || BANK.done) return;
    var qi = +el.getAttribute('data-qi'), oi = +el.getAttribute('data-oi');
    var q = BANK.list[qi];
    var multi = Array.isArray(q.a);
    var sibs = el.parentNode.querySelectorAll('.opt');
    if(multi){
      var arr = BANK.ans[qi] || (BANK.ans[qi] = []);
      var p = arr.indexOf(oi);
      if(p >= 0){ arr.splice(p,1); el.className = 'opt' }
      else { arr.push(oi); el.className = 'opt sel' }
    }else{
      BANK.ans[qi] = oi;
      for(var j=0;j<sibs.length;j++) sibs[j].className = 'opt' + (j===oi ? ' sel' : '');
    }
  });
}
V.gradeBank = function(){
  BANK.done = true;
  var ok = 0;
  BANK.list.forEach(function(q, i){
    var got = BANK.ans[i];
    var right;
    if(q.a === -1 || q.a == null && (!q.o || !q.o.length)) right = null;
    else if(Array.isArray(q.a)){
      var arr = (got||[]).slice().sort().join(','), key = q.a.slice().sort().join(',');
      right = (arr === key);
    }else right = (got === q.a);
    if(right) ok++;
    var el = $('pe_'+i);
    if(!el) return;
    var h = '<div class="ansrow">';
    if(right === null){
      h += '<div class="sh">参考答案要点</div><div class="tipbox">'+esc(q.why||'')+'</div>';
    }else{
      var keyTxt = Array.isArray(q.a) ? q.a.map(function(x){ return String.fromCharCode(65+x) }).join('') : String.fromCharCode(65+q.a);
      h += '<div class="sh">'+(right?'<span class="pill g">正确</span>':'<span class="pill r">错误</span>')+'　正确答案 '+keyTxt+'</div>';
      h += '<div class="tipbox">'+esc(q.why||'')+'</div>';
      var sibs = $('pq_'+i).querySelectorAll('.opt');
      for(var j=0;j<sibs.length;j++){
        var isKey = Array.isArray(q.a) ? (q.a.indexOf(j)>=0) : (j===q.a);
        sibs[j].className = 'opt' + (isKey ? ' ok' : (Array.isArray(got) ? (got.indexOf(j)>=0?' no':'') : (j===got?' no':'')));
      }
    }
    h += '</div>';
    el.innerHTML = h;
  });
  var h = '<div class="card acc '+(ok/BANK.list.length>=0.7?'ok':'wn')+'"><h2>'+ok+' / '+BANK.list.length+'</h2>';
  h += '<p class="sub" style="margin:0">错的点回去翻笔记，或者直接把那条加进带背反复过。</p></div>';
  $('app').insertAdjacentHTML('afterbegin', h);
  window.scrollTo(0,0);
};

/* ================= 收藏 ================= */
function renderStar(){
  var stars = R.stars();
  var ids = Object.keys(stars);
  var h = '<div class="card"><h1>我的收藏</h1>';
  h += '<p class="sub">带背时按 <kbd>F</kbd> 收藏。收藏的东西可以单独循环背。</p></div>';
  if(!ids.length){
    h += '<div class="card"><div class="empty-st"><div class="ic">☆</div><p>还没有收藏。</p><button class="primary" onclick="location.href=\'#/p/recite\'">去带背</button></div></div>';
    $('app').innerHTML = h; return;
  }
  h += '<div class="card"><ul class="list">';
  allChs().forEach(function(x){
    (x.ch.pts||[]).forEach(function(p){
      var id = x.ch.id + '.' + p.k;
      if(!stars[id]) return;
      h += '<li><span class="tag b">'+esc(x.c.n)+'</span><span class="g"><b>'+esc(p.k)+'</b><div class="d">'+esc(p.a)+'</div></span>';
      h += '<button class="starbtn on" onclick="CET6.PHARMV.unstar(\''+esc(id).replace(/'/g,"\\'")+'\')">★</button></li>';
    });
  });
  h += '</ul>';
  h += '<div style="margin-top:14px"><button class="primary" onclick="CET6.PHARMV.scope(\'star\')">只背收藏的</button></div></div>';
  $('app').innerHTML = h;
}
V.unstar = function(id){ R.toggleStar(id); renderStar() };

/* ================= 说明 ================= */
function renderAbout(){
  var h = '<div class="card"><h1>考试说明</h1>';
  h += '<p class="sub">以下内容依据沈阳药科大学研究生院公布的招生章程整理，以当年官方文件为准。</p>';
  h += '<table><tbody>';
  h += '<tr><th style="width:130px">科目代码</th><td>349 药学综合（自命题）</td></tr>';
  h += '<tr><th>考试内容</th><td>有机化学、分析化学、生物化学</td></tr>';
  h += '<tr><th>分值</th><td>满分 300 分，每门课程 100 分</td></tr>';
  h += '<tr><th>题型</th><td>不限（2025 年起由"全部客观题"改为题型不限，需同时准备主观题）</td></tr>';
  h += '<tr><th>参考书</th><td>胡春《有机化学》三版、邸欣《分析化学》八版、姚文兵《生物化学》八版</td></tr>';
  h += '</tbody></table>';
  h += '<div class="assist" style="margin-top:14px"><b>提醒</b><br>2024 年 3 月学校公告变更：自 2025 年起取消生理学，改为三门；题型由"全部客观题"改为不限。<b>旧的复习资料里可能有生理学和纯选择题的安排，别照着旧资料复习。</b></div>';
  h += '</div>';

  h += '<div class="card"><h3>关于本站的内容</h3>';
  h += '<p class="sub">本站<b>不提供官方真题</b>（真题受版权保护，学校也不公开）。这里的内容是按三本指定教材的章节体系与常见考点整理的：</p>';
  h += '<ul class="list">';
  h += '<li><span class="tag">笔记</span><span class="g">一句话一条的干总结，带口诀和易错提示</span></li>';
  h += '<li><span class="tag">带背</span><span class="g">可听、可循环、可填空，跟 B 站带背视频一个思路</span></li>';
  h += '<li><span class="tag">机理</span><span class="g">分步拆解反应，每步标明电子流向与箭头画法</span></li>';
  h += '<li><span class="tag">题库</span><span class="g">按章节和常考点自编，覆盖选择、判断、简答</span></li>';
  h += '</ul>';
  h += '<p class="hint" style="margin-top:10px">拿到真题后，可以用 CET-6 模块里的「导入题目」把 PDF 或文本传进去，自己扩建题库。所有数据都存在你本机浏览器里。</p></div>';

  h += '<div class="card"><h3>初试日期</h3>';
  h += '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">';
  h += '<input type="date" id="ed" value="'+esc(getExamDate())+'" style="width:auto">';
  h += '<button class="primary" onclick="CET6.PHARMV.setExamDate(document.getElementById(\'ed\').value)">保存</button>';
  h += '<span class="hint">只影响倒计时显示</span></div></div>';
  $('app').innerHTML = h;
}
})();
