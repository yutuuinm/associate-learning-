/* 349 药学综合模块：学霸笔记 / 带背 / 反应机理 / 常考题 / 收藏
   路由由 app.js 在 hash 以 #/p/ 开头时转发到 PHARMV.route() */
window.CET6 = window.CET6 || {};

(function(){
var C = window.CET6;
var P = C.PHARM || {};
var V = C.PHARMV = {};
var $ = C.$, esc = C.esc, get = C.get, set = C.set;
var R = C.RC;
var Q = C.PHARMQ;

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

V.titles = {home:'349 总览', note:'学霸笔记', recite:'带背', mech:'反应机理', bank:'常考题',
            wrong:'错题本', master:'掌握度', star:'我的收藏', about:'考试说明'};

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
  else if(v==='wrong') renderWrong(arg);
  else if(v==='master') renderMaster();
  else if(v==='star') renderStar();
  else if(v==='about') renderAbout();
  else renderHome();
  window.scrollTo(0,0);
  markNav(v);
  setCrumb(v);
  if(C.TOOLS && C.TOOLS.refreshBadges) C.TOOLS.refreshBadges();
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

  /* 学习状态 */
  var tm = Q.totalMaster(), wk = Q.wrongCount(), mk = Q.markTotal();
  h += '<div class="grid" style="margin-top:10px">';
  h += '<div class="mc"><div class="l">掌握度</div><div class="v">'+(tm==null?'—':tm)+'</div><div class="u">'+(tm==null?'还没测过':Q.level(tm).t+'　<a href="#/p/master">详情</a>')+'</div></div>';
  h += '<div class="mc"><div class="l">错题</div><div class="v">'+wk+'</div><div class="u">'+(wk?'<a href="#/p/wrong">去错题本</a>':'全对')+'</div></div>';
  h += '<div class="mc"><div class="l">自评标记</div><div class="v">'+(mk.yes+mk.mid+mk.no)+'</div><div class="u">会'+mk.yes+' 模糊'+mk.mid+' 不会'+mk.no+'</div></div>';
  h += '<div class="mc"><div class="l">连续天数</div><div class="v">'+Q.streak()+'</div><div class="u">今日 '+Q.day().q+' 题</div></div>';
  h += '</div>';
  h += '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">';
  h += '<button class="primary big" onclick="location.href=\'#/p/recite\'">开始带背</button> ';
  h += '<button class="big" onclick="location.href=\'#/p/note\'">看笔记</button> ';
  h += '<button class="big" onclick="location.href=\'#/p/mech\'">看机理</button> ';
  h += '<button class="big" onclick="location.href=\'#/p/bank\'">刷题</button>';
  if(wk) h += ' <button class="big" onclick="location.href=\'#/p/wrong\'">错题本 '+wk+'</button>';
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

  var cm = Q.courseMaster(NOTE_COURSE);
  h += '<div class="card tight"><div class="mrow"><span class="hint" style="flex:1">本科目掌握度（已测 '+cm.tested+'/'+cm.total+' 章，测过才计入）</span>'+mBar(cm.m)+'</div></div>';

  c.list.forEach(function(ch){
    h += '<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
    h += '<div style="flex:1;min-width:200px"><h3 style="margin:0">'+esc(ch.t)+'</h3>';
    h += '<div class="hint">'+esc(ch.sub||'')+'</div></div>';
    h += hotBar(ch.hot);
    h += mBar(Q.master(ch.id));
    h += '<button class="sm primary" onclick="location.href=\'#/p/note/ch/'+ch.id+'\'">展开</button> ';
    h += '<button class="sm" onclick="CET6.PHARMV.reciteCh(\''+ch.id+'\')">背这章</button> ';
    h += '<button class="sm" onclick="location.href=\'#/p/bank/'+NOTE_COURSE+'/'+ch.id+'\'">做题</button></div>';
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
  h += mBar(Q.master(ch.id));
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
  }else if(scopeKey === 'weak' || scopeKey === 'new'){
    title = scopeKey === 'weak' ? '不会 + 模糊' : '还没标记过的';
    allChs().forEach(function(x){
      (x.ch.pts||[]).forEach(function(p){
        var g = Q ? Q.markOf(p) : null;
        var hit = scopeKey === 'weak' ? (g === 0 || g === 1) : (g == null);
        if(hit) out.push({id:x.ch.id+'.'+p.k, k:p.k, a:p.a, mn:p.mn, from:x.c.n+' · '+x.ch.t});
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
  h += '<span class="chip'+(key==='weak'?' on':'')+'" onclick="CET6.PHARMV.scope(\'weak\')">只背不会/模糊</span>';
  h += '<span class="chip'+(key==='new'?' on':'')+'" onclick="CET6.PHARMV.scope(\'new\')">只背没标记的</span>';
  COURSES.forEach(function(c){
    h += '<span class="chip'+(key==='c_'+c.k?' on':'')+'" onclick="CET6.PHARMV.scope(\'c_'+c.k+'\')">'+esc(c.n)+'</span>';
  });
  h += '</div>';
  var mkt = Q.markTotal();
  h += '<div class="hint" style="margin-top:6px">自评进度：会 <b>'+mkt.yes+'</b> · 模糊 <b>'+mkt.mid+'</b> · 不会 <b>'+mkt.no+'</b>（共 '+countPts()+' 条）。标记后会进入掌握度。</div>';
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

  /* 默写（填空 / 听背模式下都能打字自测） */
  if(st.mode === 'fill' || st.mode === 'listen'){
    if(WRITE.id !== it.id){ WRITE.id = it.id; WRITE.txt = ''; WRITE.res = null }
    var target = st.mode === 'fill' ? (bl && bl.ans[0] || '') : it.a;
    h += '<div class="card tight"><div class="wrt">';
    h += '<div class="hint" style="margin-bottom:6px">默写：先自己敲一遍，再对答案（按 <kbd>Enter</kbd> 对答案）</div>';
    h += '<textarea id="wrtBox" placeholder="'+(st.mode==='fill'?'把挖空的那段写出来':'把整条要点写出来')+'" oninput="CET6.PHARMV.rcType(this.value)" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();CET6.PHARMV.rcCheck()}">'+esc(WRITE.txt)+'</textarea>';
    h += '<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">';
    h += '<button class="sm primary" onclick="CET6.PHARMV.rcCheck()">对答案</button> ';
    h += '<button class="sm" onclick="CET6.PHARMV.rcReveal()">看答案</button>';
    h += '</div>';
    if(WRITE.res){
      var r = WRITE.res;
      h += '<div class="tipbox" style="margin-top:8px;border-left:3px solid '+(r.rate>=0.6?'var(--ok)':(r.rate>=0.3?'var(--wn)':'var(--er)'))+'">';
      h += '<div>'+(r.rate>=0.6?'<span class="pill g">差不多对了</span>':(r.rate>=0.3?'<span class="pill y">对了一半</span>':'<span class="pill r">基本没对</span>'))+'　命中 '+r.hit+'/'+r.all+' 个关键词（'+Math.round(r.rate*100)+'%）</div>';
      h += '<div style="margin-top:6px;color:var(--mut)">漏掉：'+esc(r.miss.length?r.miss.join('、'):'无')+'</div>';
      h += '<div style="margin-top:6px">参考答案：'+esc(target)+'</div>';
      h += '</div>';
    }
    h += '</div></div>';
  }

  /* 自评：不会 / 模糊 / 会 */
  var mk = Q.markOf(it);
  h += '<div class="card tight"><div class="mrow">';
  h += '<span class="hint" style="flex:1">这条你现在的状态（会写进掌握度）</span>';
  h += '<div class="mkseg">';
  h += '<button class="'+(mk===0?'on no':'')+'" onclick="CET6.PHARMV.rcMark(0)">不会</button>';
  h += '<button class="'+(mk===1?'on mid':'')+'" onclick="CET6.PHARMV.rcMark(1)">模糊</button>';
  h += '<button class="'+(mk===2?'on yes':'')+'" onclick="CET6.PHARMV.rcMark(2)">会</button>';
  h += '</div>';
  h += '<button class="sm" onclick="CET6.PHARMV.rcMark(null)">清除</button>';
  h += '<span class="hint">快捷键 <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd></span>';
  h += '</div></div>';

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
  if(k === '1' || k === '2' || k === '3'){ V.rcMark(+k - 1); e.preventDefault(); return }
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

/* ================= 默写（打字自测） ================= */
var WRITE = {id:'', txt:'', res:null};
function norm(s){ return String(s||'').replace(/[\s，,。；;、（）()【】\[\]:：　·"'’“”_—–-]/g,'') }
function bigrams(s){
  var a = [];
  for(var i=0;i<s.length-1;i++) a.push(s.substr(i,2));
  return a.length ? a : [s];
}
/* 中文用二元组覆盖率判，比逐字比对宽容；含英文/数字则整段当一段 */
function keyMatch(target, typed){
  var T = norm(target), Y = norm(typed);
  if(!T) return {rate:0, hit:0, all:0, miss:[]};
  var segs = String(target).split(/[，,；;。、]/).map(norm).filter(function(x){ return x.length>1 });
  if(!segs.length) segs = [T];
  var hit = 0, miss = [];
  segs.forEach(function(s){
    var bs = bigrams(s), ok = 0;
    bs.forEach(function(b){ if(Y.indexOf(b) >= 0) ok++ });
    if(ok / bs.length >= 0.5) hit++;
    else miss.push(s.slice(0,20));
  });
  return {rate: segs.length ? hit/segs.length : 0, hit:hit, all:segs.length, miss:miss};
}
V.rcType = function(v){ WRITE.txt = v || ''; WRITE.res = null };
V.rcCheck = function(){
  var it = R.cur(); if(!it) return;
  var target = R.state.mode === 'fill' ? ((R.blank(it.a).ans||[])[0] || '') : it.a;
  WRITE.res = keyMatch(target, WRITE.txt);
  renderRecite();
  var b = document.getElementById('wrtBox');
  if(b){ b.focus(); try{ b.setSelectionRange(b.value.length, b.value.length) }catch(e){} }
};
V.rcMark = function(g){
  var it = R.cur(); if(!it) return;
  Q.mark(it, g);
  if(g != null){
    var n = ['不会','模糊','会'][g];
    if(C.TOOLS && C.TOOLS.toast) C.TOOLS.toast('已标记为「'+n+'」');
    R.stop(); R.next(); WRITE = {id:'', txt:'', res:null};
  }
  renderRecite();
};

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
      (ch.qs||[]).forEach(function(q){ qs.push(Object.assign({__from:ch.t, __ch:ch.id}, q)) });
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
  var ok = 0, judged = 0, rec = {};
  BANK.list.forEach(function(q, i){
    var got = BANK.ans[i];
    var right;
    if(q.a === -1 || q.a == null && (!q.o || !q.o.length)) right = null;
    else if(Array.isArray(q.a)){
      var arr = (got||[]).slice().sort().join(','), key = q.a.slice().sort().join(',');
      right = (arr === key);
    }else right = (got === q.a);
    if(right) ok++;
    /* 没选过答案的不算错（否则一键解析会把整章塞进错题本） */
    var answered = !(got === undefined || got === null || (Array.isArray(got) && !got.length));
    var sure = (right !== null && answered);
    if(sure) judged++;
    /* 记录到掌握度 / 错题本 */
    var cid = q.__ch || BANK.ch;
    if(cid) (rec[cid] = rec[cid] || []).push({qn:q.n, type:q.type||'', ok:(sure ? right : null)});
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
  if(Q) Object.keys(rec).forEach(function(cid){ Q.log(cid, rec[cid]) });
  if(C.TOOLS && C.TOOLS.refreshBadges) C.TOOLS.refreshBadges();

  var rate = judged ? ok/judged : 0;
  var skip = BANK.list.length - judged;
  var h = '<div class="card acc '+(judged===0?'':(rate>=0.7?'ok':'wn'))+'"><h2>'+ok+' / '+judged+'</h2>';
  h += '<p class="sub" style="margin:0">'+(judged?('正确率 '+Math.round(rate*100)+'%。'):'还没判到题。')
    + (skip?('另有 '+skip+' 道未作答或需自评，不计入。'):'')+'错题已进错题本，连对 2 次自动毕业。</p>';
  h += '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">';
  h += '<button class="sm" onclick="location.href=\'#/p/wrong\'">看错题本</button> ';
  h += '<button class="sm" onclick="location.href=\'#/p/master\'">看掌握度</button>';
  h += '</div></div>';
  $('app').insertAdjacentHTML('afterbegin', h);
  window.scrollTo(0,0);
};

/* ================= 掌握度条 ================= */
function mBar(m){
  if(m == null) return '<span class="mbar"><span class="tr"><i style="width:0"></i></span><span class="mv">未测</span></span>';
  var lv = Q.level(m);
  return '<span class="mbar '+lv.c+'"><span class="tr"><i style="width:'+m+'%"></i></span><span class="mv">'+m+'</span></span>';
}

/* ================= 错题本 ================= */
var WRONG_COURSE = get('cet6_wrongcourse','');
function renderWrong(ck){
  if(ck !== undefined) WRONG_COURSE = (ck === 'all' ? '' : ck), set('cet6_wrongcourse', WRONG_COURSE);
  var list = Q.wrongList(WRONG_COURSE || '');
  var h = '<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
  h += '<h1 style="margin:0;flex:1">错题本</h1>';
  h += '<div class="seg">';
  h += '<button class="'+(!WRONG_COURSE?'on':'')+'" onclick="location.href=\'#/p/wrong/all\'">全部 '+Q.wrongCount()+'</button>';
  COURSES.forEach(function(x){
    var n = Q.wrongCount(x.k);
    h += '<button class="'+(WRONG_COURSE===x.k?'on':'')+'" onclick="location.href=\'#/p/wrong/'+x.k+'\'">'+esc(x.n)+' '+n+'</button>';
  });
  h += '</div></div>';
  h += '<p class="sub" style="margin:8px 0 0">做错自动进来，<b>连对 2 次自动毕业</b>。也可以手动标记「已掌握」移除。每道错题下面直接给了解析要点。</p></div>';

  if(!list.length){
    h += '<div class="card"><div class="empty-st"><div class="ic">✓</div><p>这个范围没有错题。</p><button class="primary" onclick="location.href=\'#/p/bank\'">去刷题</button></div></div>';
    $('app').innerHTML = h; return;
  }

  h += '<div class="card tight"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
  h += '<span class="hint" style="flex:1">共 '+list.length+' 道'+(WRONG_COURSE?'（'+esc(course(WRONG_COURSE).n)+'）':'')+'</span>';
  h += '<button class="sm" onclick="CET6.PHARMV.wrongClear()">清空当前范围</button></div></div>';

  list.forEach(function(w, i){
    var f = Q.findQ(w.ch, w.n);
    if(!f) return;
    var q = f.q;
    h += '<div class="card qz">';
    h += '<div class="qmeta"><span class="tag">'+esc(f.course.n)+'</span> '+esc(f.ch.t)+'　第 '+w.n+' 题　<span class="tag">'+esc(q.type||'')+'</span>';
    h += '　错 '+w.n+' 次'+(w.fixed?('　已连对 '+w.fixed+' 次'):'')+'</div>';
    h += '<div class="qt">'+esc(q.q)+'</div>';
    if(q.o && q.o.length){
      h += '<div class="opts">';
      q.o.forEach(function(o, oi){
        var isKey = Array.isArray(q.a) ? (q.a.indexOf(oi)>=0) : (oi===q.a);
        h += '<div class="opt'+(isKey?' ok':'')+'"><span class="k">'+String.fromCharCode(65+oi)+'</span><span>'+esc(o)+'</span></div>';
      });
      h += '</div>';
      h += '<div class="ansrow"><div class="sh">正确答案 '+(Array.isArray(q.a)?q.a.map(function(x){return String.fromCharCode(65+x)}).join(''):String.fromCharCode(65+q.a))+'</div>';
    }else{
      h += '<div class="ansrow"><div class="sh">简答 · 参考答案要点</div>';
    }
    h += '<div class="tipbox">'+esc(q.why||'')+'</div></div>';
    h += '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">';
    h += '<button class="sm" onclick="CET6.PHARMV.wrongOk(\''+w.ch+'\','+w.n+')">标记已掌握</button> ';
    h += '<button class="sm" onclick="location.href=\'#/p/bank/'+f.course.c+'/'+w.ch+'\'">重做这章</button> ';
    h += '<button class="sm" onclick="CET6.PHARMV.reciteCh(\''+w.ch+'\')">背这章</button>';
    h += '</div></div>';
  });
  $('app').innerHTML = h;
}
V.wrongOk = function(ch, n){ Q.wrongGraduate(ch, n); V.route(['wrong', WRONG_COURSE||'all']) };
V.wrongClear = function(){
  if(!confirm('清空'+(WRONG_COURSE?('「'+course(WRONG_COURSE).n+'」的'):'全部')+'错题记录？掌握度里的答题正确率不受影响。')) return;
  Q.wrongClear(WRONG_COURSE||''); V.route(['wrong', WRONG_COURSE||'all']);
};

/* ================= 掌握度 ================= */
function renderMaster(){
  var tm = Q.totalMaster(), t = Q.tot(), mk = Q.markTotal();
  var h = '<div class="card"><h1>掌握度</h1>';
  h += '<p class="sub">掌握度 = 答题正确率（60%）+ 带背自评（40%），两者都有才算数。只统计已测过的章，没测过的显示为「未测」。</p>';
  h += '<div class="grid" style="margin-top:14px">';
  h += '<div class="mc"><div class="l">总体掌握度</div><div class="v">'+(tm==null?'—':tm)+'</div><div class="u">'+(tm==null?'先去做题 / 带背':Q.level(tm).t)+'</div></div>';
  h += '<div class="mc"><div class="l">已答题</div><div class="v">'+t.tot+'</div><div class="u">正确率 '+(t.tot?Math.round(t.rate*100):0)+'%</div></div>';
  h += '<div class="mc"><div class="l">待处理错题</div><div class="v">'+Q.wrongCount()+'</div><div class="u"><a href="#/p/wrong">去错题本</a></div></div>';
  h += '<div class="mc"><div class="l">自评标记</div><div class="v">'+(mk.yes+mk.mid+mk.no)+'</div><div class="u">会 '+mk.yes+' / 模糊 '+mk.mid+' / 不会 '+mk.no+'</div></div>';
  h += '</div></div>';

  COURSES.forEach(function(c){
    var r = Q.courseMaster(c.k);
    h += '<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
    h += '<h2 style="margin:0;flex:1">'+esc(c.n)+'</h2>';
    h += mBar(r.m);
    h += '<span class="pill">已测 '+r.tested+'/'+r.total+' 章</span></div>';
    if(r.weak.length){
      h += '<div class="ntr" style="font-size:12.5px;color:var(--wn);background:var(--wnbg);border-radius:8px;padding:8px 11px;margin-top:10px;line-height:1.7">';
      h += '最薄弱：' + r.weak.map(function(x){ return esc(x.t)+'（'+x.m+'）' }).join('　·　');
      h += '　<button class="sm" style="margin-left:6px" onclick="CET6.PHARMV.reciteCh(\''+r.weak[0].id+'\')">先背最弱那章</button></div>';
    }
    h += '<ul class="list" style="margin-top:10px">';
    c.list.forEach(function(ch){
      var m = Q.master(ch.id), rec = Q.chRec(ch.id), ms = Q.markStat(ch);
      h += '<li><span class="g">'+esc(ch.t)+'<div class="d">';
      var bits = [];
      if(rec.tot) bits.push('做题 '+rec.ok+'/'+rec.tot);
      if(ms.yes+ms.mid+ms.no) bits.push('自评 会'+ms.yes+' 模糊'+ms.mid+' 不会'+ms.no);
      h += esc(bits.length?bits.join(' · '):'还没测过');
      h += '</div></span>';
      h += mBar(m);
      h += '<button class="sm" onclick="location.href=\'#/p/bank/'+c.k+'/'+ch.id+'\'">测</button> ';
      h += '<button class="sm" onclick="CET6.PHARMV.reciteCh(\''+ch.id+'\')">背</button></li>';
    });
    h += '</ul></div>';
  });

  h += '<div class="card tight"><div style="display:flex;gap:8px;flex-wrap:wrap">';
  h += '<button class="sm" onclick="CET6.PHARMV.wipePharm()">清空 349 全部学习记录</button>';
  h += '<span class="hint" style="align-self:center">只影响 349，CET-6 的记录不受影响</span></div></div>';
  $('app').innerHTML = h;
}
V.wipePharm = function(){
  if(!confirm('清空 349 的答题记录、错题本、自评标记和打卡？此操作不可撤销。')) return;
  Q.wipe(); if(C.TOOLS && C.TOOLS.refreshBadges) C.TOOLS.refreshBadges();
  V.route(['master']);
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
  h += '<div class="assist" style="margin-top:12px"><b>本站有机的范围</b><br>按胡春《有机化学》三版（药学类）组织，<b>不含波谱解析</b>——紫外/红外/核磁/质谱归在分析化学里。<b>杂环单列一章</b>：沈药是药科大学，杂环（吡啶、咪唑、噻唑、嘧啶、嘌呤、吲哚…）在有机里的占比明显高于综合类院校的通用考纲。</div>';
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
