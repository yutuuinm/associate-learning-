/* 单词本 + 今日复习（遗忘曲线调度）
   ---------------------------------------------------------------
   单词本：不管从哪个入口收的词（划词 / 词表 / 文章覆盖词 / 摘抄），
           都自动落在这里——收词只有一个漏斗 C.STATS.srsAdd，所以不会漏。
   今日复习：按艾宾浩斯遗忘曲线排程。每个词记一个「阶」stage，
           阶对应复习间隔天数阶梯 [1,2,4,8,15,30,60,120]。
           记得 → 升一阶（间隔拉长）
           模糊 → 不升阶，明天再见
           忘了 → 归零，今天重新排队
   数据存 localStorage，走 C.get/C.set，所以按账号自动隔离。 */
window.CET6 = window.CET6 || {};

(function(){
var C = window.CET6;
var $ = C.$, esc = C.esc, get = C.get, set = C.set;

/* ---------- 日期工具（stats.js 里的同名函数是私有的，这里各留一份） ---------- */
function pad(n){ return (n<10?'0':'') + n }
function today(d){ d = d || new Date(); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()) }
function dayAdd(s, n){
  var p = String(s).split('-');
  var d = new Date(+p[0], (+p[1])-1, +p[2]);
  d.setDate(d.getDate() + n);
  return today(d);
}
function daysBetween(a, b){
  var pa = String(a).split('-'), pb = String(b).split('-');
  var da = Date.UTC(+pa[0], (+pa[1])-1, +pa[2]);
  var db = Date.UTC(+pb[0], (+pb[1])-1, +pb[2]);
  return Math.round((db - da) / 86400000);
}

/* ---------- 单词本 ---------- */
var B = C.BOOK = {};

/* 复习间隔阶梯（天）：第 0 阶=刚收，第 7 阶≈四个月后 */
var LADDER = [1, 2, 4, 8, 15, 30, 60, 120];
B.LADDER = LADDER;

B.all = function(){
  var m = (C.STATS && C.STATS.srsAll) ? C.STATS.srsAll() : {};
  var out = [];
  Object.keys(m).forEach(function(k){
    var it = m[k];
    if(!it || !it.w) return;
    out.push(it);
  });
  return out;
};
/* 给条目补上「阶 / 来源类型」等派生字段 */
B.decorate = function(it){
  var v = (C.VE && C.VE.byWord) ? C.VE.byWord(it.w) : null;
  it.key  = String(it.w||'').toLowerCase();
  it.band = v ? v.band : 0;
  it.bn  = v ? (C.VE.bandName[v.band] || '课外') : '课外';
  it.stage = (typeof it.stage === 'number') ? it.stage : stageFromIv(it.iv);
  it.ivNow = LADDER[Math.min(it.stage, LADDER.length-1)];
  return it;
};
function stageFromIv(iv){
  iv = iv || 1;
  var s = 0;
  for(var i=0;i<LADDER.length;i++) if(iv >= LADDER[i]) s = i;
  return s;
}
B.get = function(k){ var m = (C.STATS && C.STATS.srsAll) ? C.STATS.srsAll() : {}; return m[k] || null };
B.list = function(){
  return B.all().map(B.decorate);
};
/* 收词：唯一入口，任何地方收词都会先进单词本 */
B.add = function(w, def, ctx, cz, src, hl){
  var S = C.STATS; if(!S || !S.srsAdd) return false;
  var isNew = S.srsAdd(w, def, ctx, cz, src || '手动收词', hl || w);
  if(isNew && C.BOOKV && C.BOOKV.flash) C.BOOKV.flash();
  return isNew;
};
B.del = function(k){
  var S = C.STATS; if(S && S.srsDel) S.srsDel(k);
  if(C.TOOLS && C.TOOLS.refreshBadges) C.TOOLS.refreshBadges();
};
/* 三档打分：0 忘了 / 1 模糊 / 2 记得 */
B.review = function(k, grade){
  var S = C.STATS; if(!S || !S.srsReview) return;
  var it = B.get(k); if(!it) return;
  var st = (typeof it.stage === 'number') ? it.stage : stageFromIv(it.iv);
  if(grade === 0)       st = 0;
  else if(grade === 2)  st = Math.min(st + 1, LADDER.length - 1);
  it.stage = st;
  S.srsReview(k, grade);
  /* srsReview 会按 ef 重写 iv，这里再用阶梯钉住，保证曲线可预期 */
  var m = S.srsAll(); if(m[k]){
    m[k].stage = st;
    m[k].iv = LADDER[st];
    m[k].due = dayAdd(today(), LADDER[st]);
    C.set('cet6_srs_v1', m);
  }
  if(C.TOOLS && C.TOOLS.refreshBadges) C.TOOLS.refreshBadges();
};
/* 到期需要复习的词（due <= 今天），按到期日升序 */
B.due = function(){
  var t = today(), out = [];
  B.all().forEach(function(it){
    if(String(it.due||'') <= t) out.push(B.decorate(it));
  });
  out.sort(function(a,b){
    return (String(a.due) < String(b.due) ? -1 : String(a.due) > String(b.due) ? 1 : 0)
        || ((a.add||0) - (b.add||0));
  });
  return out;
};
B.stats = function(){
  var all = B.all().map(B.decorate), t = today();
  var due = 0, fresh = 0, mid = 0, solid = 0, bs = {1:0,2:0,3:0,4:0,5:0,0:0};
  all.forEach(function(it){
    if(String(it.due||'') <= t) due++;
    var st = it.stage;
    if(st <= 0) fresh++; else if(st <= 2) mid++; else solid++;
    if(bs[it.band] != null) bs[it.band]++;
  });
  return {all:all.length, due:due, fresh:fresh, mid:mid, solid:solid, bands:bs,
          today: (C.STATS && C.STATS.dayWordCount) ? C.STATS.dayWordCount() : 0};
};
/* 未来复习时刻表（给遗忘曲线图用） */
B.schedule = function(stage){
  var t = today(), out = [];
  for(var i = 0; i < LADDER.length; i++){
    out.push({d: LADDER[i], date: dayAdd(t, LADDER[i]), on: i === stage});
  }
  return out;
};
/* 导出成可复制的文本 */
B.exportText = function(){
  var all = B.all().map(B.decorate);
  all.sort(function(a,b){
    return (a.band - b.band) || (String(a.w) < String(b.w) ? -1 : 1);
  });
  var lines = ['# 单词本 · ' + today() + ' · 共 ' + all.length + ' 个'];
  var last = -1;
  all.forEach(function(it){
    if(it.band !== last){
      last = it.band;
      lines.push('', '## 第 ' + it.band + ' 阶 · ' + it.bn);
    }
    lines.push(it.w + '  ' + (it.d || ''));
    if(it.c) lines.push('    ' + it.c);
    if(it.cz) lines.push('    ' + it.cz);
  });
  return lines.join('\n');
};

/* ================= 视图 ================= */
var V = C.BOOKV = {tab:'all', q:'', sort:'due', ex:{}, open:null, done:0};

function hd(title, sub){
  var h = '<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
  h += '<h1 style="margin:0;flex:1">' + esc(title) + '</h1>';
  h += '</div>';
  if(sub) h += '<p class="sub" style="margin:8px 0 0">' + sub + '</p>';
  h += '</div>';
  return h;
}

/* ---------- 单词本 ---------- */
V.renderBook = function(){
  var st = B.stats(), all = B.list(), h = '', q = (V.q||'').toLowerCase();

  h += hd('单词本', '这里收着<b>所有</b>你标记过的词——不管是从文章里划的、词表里点的，还是手动加的，都会自动进来。'
      + '点词看例句；「今日复习」会按遗忘曲线把它们排好队。');

  /* 统计 */
  h += '<div class="grid" style="margin-top:14px">';
  h += '<div class="mc"><div class="l">收藏的词</div><div class="v">' + st.all + '</div><div class="u">个</div></div>';
  h += '<div class="mc"><div class="l">今日待复习</div><div class="v">' + st.due + '</div><div class="u">个</div></div>';
  h += '<div class="mc"><div class="l">已巩固</div><div class="v">' + st.solid + '</div><div class="u">≥8 天</div></div>';
  h += '<div class="mc"><div class="l">今日新收</div><div class="v">' + st.today + '</div><div class="u">个</div></div>';
  h += '</div>';

  /* 筛选 */
  h += '<div class="card"><div class="chips">';
  var tabs = [['all','全部'],['due','待复习'],['fresh','新收未巩固'],['solid','已巩固'],
              ['1','第1阶'],['2','第2阶'],['3','第3阶'],['4','第4阶'],['5','第5阶']];
  tabs.forEach(function(t){
    h += '<span class="chip'+(V.tab===t[0]?' on':'')+'" onclick="CET6.BOOKV.setTab(\''+t[0]+'\')">'+t[1]+'</span>';
  });
  h += '</div>';
  h += '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">';
  h += '<input type="text" id="bq" placeholder="搜词或释义" value="'+esc(V.q)+'" style="flex:1;min-width:140px;width:auto" oninput="CET6.BOOKV.search(this.value)">';
  h += '<button class="sm" onclick="CET6.BOOKV.exportBook()">导出清单</button> ';
  h += '<a class="sm" href="#/review" style="text-decoration:none">去今日复习 →</a>';
  h += '</div></div>';

  /* 列表 */
  var t = today();
  var list = all.filter(function(it){
    if(q && !(String(it.w).toLowerCase().indexOf(q) >= 0 || String(it.d||'').toLowerCase().indexOf(q) >= 0)) return false;
    var isDue = String(it.due||'') <= t;
    if(V.tab === 'due')  return isDue;
    if(V.tab === 'fresh')return it.stage <= 0;
    if(V.tab === 'solid')return it.stage >= 3;
    if(V.tab !== 'all' && String(it.band) !== String(V.tab)) return false;
    return true;
  });
  list.sort(V.sort === 'band'
    ? function(a,b){ return (a.band - b.band) || (String(a.w) < String(b.w) ? -1 : 1) }
    : function(a,b){ return ((a.due||'') < (b.due||'') ? -1 : 1) || ((a.rep||0) - (b.rep||0)) });

  h += '<div class="card"><h3>' + esc(V.tabName()) + '（' + list.length + ' 个）</h3>';
  if(!list.length){
    h += '<p class="sub" style="margin:0">没有匹配的词。去做一篇短文，划选生词按 <kbd>Tab</kbd>。</p>';
  }else{
    h += '<table class="wtbl"><thead><tr><th>词</th><th>释义</th><th class="n">阶</th><th class="n">复习</th><th class="n">下次</th><th class="n">操作</th></tr></thead><tbody>';
    list.forEach(function(it){
      var k = it.key;
      h += '<tr><td class="w">'+esc(it.w)+'<span class="spk" onclick="CET6.BOOKV.say(\''+k+'\',0)" title="读一遍">🔊</span></td><td>'+esc(it.d||'—')+'</td>'
         + '<td class="n">'+(it.band ? it.band : '—')+'</td>'
         + '<td class="n">'+(it.rep||0)+' 次</td>'
         + '<td class="n">'+esc(it.due||'')+'</td>'
         + '<td class="n">'
         + (it.c ? '<button class="sm" onclick="CET6.BOOKV.togEx(\''+k+'\')">例句</button> ' : '')
         + '<button class="sm danger" onclick="CET6.BOOKV.remove(\''+k+'\')">删</button>'
         + '</td></tr>';
      if(V.ex[k] && it.c){
        h += '<tr class="exrow"><td colspan="6">' + C.TOOLS.ctxHTML(it) + '</td></tr>';
      }
    });
    h += '</tbody></table>';
  }
  h += '</div>';
  $('app').innerHTML = h;
};

V.tabName = function(){
  return {all:'全部', due:'待复习', fresh:'新收未巩固', solid:'已巩固',
          '1':'第 1 阶 · 最高频','2':'第 2 阶 · 高频','3':'第 3 阶 · 中高频',
          '4':'第 4 阶 · 中频','5':'第 5 阶 · 一般'}[String(V.tab)] || '全部';
};
V.setTab = function(t){ V.tab = String(t); V.renderBook() };
V.search = function(q){ V.q = q || ''; V.renderBook(); var el = $('bq'); if(el){ el.focus(); try{ el.setSelectionRange(el.value.length, el.value.length) }catch(e){} } };
V.togEx = function(k){ V.ex[k] = !V.ex[k]; V.renderBook() };
V.remove = function(k){
  B.del(k); V.renderBook();
  if(C.TOOLS) C.TOOLS.toast('已从单词本移除');
};
V.exportBook = function(){
  var txt = B.exportText();
  var box = document.createElement('textarea');
  box.value = txt; box.style.cssText = 'position:fixed;left:-9999px';
  document.body.appendChild(box); box.select();
  try{ document.execCommand('copy'); C.TOOLS.toast('已复制到剪贴板（'+B.all().length+' 个词）') }
  catch(e){ C.TOOLS.toast('复制失败，请手动选择') }
  document.body.removeChild(box);
};

/* ---------- 今日复习（遗忘曲线） ---------- */
/* 阶梯：第 n 阶 = 上次之后 LADDER[n] 天再见面 */
V.reviewState = {i:0, show:false, list:[], done:0, missed:[]};

function ladderLabel(n){
  if(n <= 0) return '明天';
  if(n === 1) return '1 天后';
  return n + ' 天后';
}

V.renderReview = function(){
  var all = B.list(), t = today();
  var due = B.due();
  var st = V.reviewState;
  st.list = due;
  if(st.i > due.length - 1) st.i = 0;

  var h = '';
  h += hd('今日复习 · 遗忘曲线',
      '一共 <b>' + all.length + '</b> 个词在册，今天该回来看 <b>' + due.length + '</b> 个。'
    + '复习节奏按<b>艾宾浩斯遗忘曲线</b>走：答对就拉长间隔，答错就退回明天。'
    + '想加新词，去「词汇递进短文」里划。');

  /* 进度条 */
  var total = due.length + st.done, pct = total ? st.done / total : 0;
  h += '<div class="card"><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">';
  h += '<div style="flex:0 0 auto">' + C.TOOLS.ring(pct, 118, st.done, '/ ' + total) + '</div>';
  h += '<div style="flex:1;min-width:200px">';
  if(due.length){
    h += '<p class="sub" style="margin:0">还剩 <b>' + due.length + '</b> 个。点卡片先自己想，实在想不起来就点「忘了」——那不是失败，那是告诉系统明天还得见。</p>';
  }else{
    h += '<p class="sub" style="margin:0">今天这一轮走完了。剩下的词都还在排队，明天它们会自己回来。</p>';
    h += '<div style="margin-top:10px"><a class="big primary" href="#/v/passages" style="text-decoration:none">去读短文收新词 →</a></div>';
  }
  h += '</div></div></div>';

  /* 卡片 */
  if(due.length){
    var it = due[Math.min(st.i, due.length - 1)];
    var k = it.key;
    h += '<div class="card big-card">';
    h += '<div class="rw">' + esc(it.w) + '</div>';
    /* 辅助三件套：听一遍 / 让 AI 讲一遍 / 回原文再看一遍 */
    h += '<div class="center" style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">';
    h += '<button class="sm" onclick="CET6.BOOKV.say(\'' + k + '\',0)">🔊 听单词</button>';
    if(it.c) h += '<button class="sm" onclick="CET6.BOOKV.say(\'' + k + '\',1)">🔊 听例句</button>';
    h += '<button class="sm" onclick="CET6.BOOKV.mem(\'' + k + '\')">✨ AI 助记</button>';
    var backPid = V.srcPid(it);
    if(backPid) h += '<a class="sm" href="#/v/read/' + backPid + '" style="text-decoration:none">← 回原文</a>';
    h += '</div>';
    h += '<div id="rmem"></div>';
    if(st.show){
      h += '<div class="rd">' + esc(it.d || '（还没释义）') + '</div>';
      if(it.c) h += '<div class="rctx">' + C.TOOLS.ctxHTML(it) + '</div>';
      h += '<div class="rlad">';
      B.schedule(it.stage).forEach(function(s, i2){
        h += '<span class="lad'+(s.on?' on':'')+'">' + (i2 === 0 ? '明天' : LADDER[i2] + ' 天') + '</span>';
      });
      h += '<div class="hint" style="margin-top:8px">点「记得」就往右挪一格，点「忘了」就回到最左。</div>';
      h += '</div>';
    }else{
      h += '<div class="hint center" style="margin-top:12px">想不起来？先听一遍、让 AI 讲一遍，再决定要不要翻开。</div>';
    }
    h += '<div class="center" style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">';
    if(!st.show){
      h += '<button class="primary big" onclick="CET6.BOOKV.revShow()">显示释义</button>';
    }else{
      h += '<button class="big" onclick="CET6.BOOKV.revRate(0)">忘了</button>';
      h += '<button class="big" onclick="CET6.BOOKV.revRate(1)">模糊</button>';
      h += '<button class="primary big" onclick="CET6.BOOKV.revRate(2)">记得</button>';
    }
    h += '</div>';
    h += '<div class="center"><button class="sm" onclick="CET6.BOOKV.revReset()">重新洗一遍今天的牌</button></div>';
    h += '</div>';
  }

  /* 记忆曲线说明 */
  h += '<div class="card"><h3>这套复习节奏是怎么算的</h3>';
  h += '<p class="hint" style="margin:0 0 10px">每个词身上挂着一个「阶」，阶决定下次隔多少天再见：</p>';
  h += '<ul class="list">';
  LADDER.forEach(function(d, i){
    h += '<li><span class="tag">第 ' + (i + 1) + ' 阶</span><span class="g">'+ladderLabel(d)+'再见。'
       + (i === 0 ? '刚收进来的词都从这一格开始。' : '') + '</span></li>';
  });
  h += '</ul>';
  h += '<p class="hint" style="margin:10px 0 0">'
     + '• <b>记得</b> → 升一阶，间隔翻倍式拉长<br>'
     + '• <b>模糊</b> → 原阶不动，明天再来一次<br>'
     + '• <b>忘了</b> → 退回第 1 阶，今天这轮重新排队<br>'
     + '连着答对，这个词就会越来越晚出现，直到你可以不管它。'
     + '</p></div>';

  $('app').innerHTML = h;
};

/* ---------- 复习卡上的三件辅助 ---------- */
/* 朗读：mode 0 = 读单词，1 = 读例句。用系统自带语音，不联网、不花钱。
   故意把参数收窄成「键 + 模式」，避免把整句英文塞进 onclick 里引发引号问题。 */
V.say = function(k, mode){
  var it = B.get(k);
  var text = mode === 1 ? String((it && it.c) || '') : String((it && it.w) || k);
  if(!text) return;
  if(!('speechSynthesis' in window)){ if(C.TOOLS) C.TOOLS.toast('这个浏览器不支持朗读，用眼睛多读两遍也一样'); return }
  try{
    var vs = window.speechSynthesis.getVoices() || [];
    var v = vs.filter(function(x){ return /^en[-_]GB/i.test(x.lang) })[0]
         || vs.filter(function(x){ return /^en[-_]US/i.test(x.lang) })[0]
         || vs.filter(function(x){ return /^en/i.test(x.lang) })[0];
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    if(v) u.voice = v;
    u.lang = (v && v.lang) || 'en-US';
    u.rate = mode === 1 ? 0.95 : 0.85;
    window.speechSynthesis.speak(u);
  }catch(e){}
};
/* AI 助记：把这个词的「怎么记 + 怎么用」拉到复习卡上，省得来回切页面 */
V.mem = function(k){
  var it = B.get(k); if(!it) return;
  var box = $('rmem'); if(!box) return;
  if(!C.aiReady()){
    box.innerHTML = '<div class="tipbox">AI 还没接上。到「设置」里填一次接口信息，这里就会给出词根拆解、助记法和例句。</div>';
    return;
  }
  box.innerHTML = '<div class="tipbox">正在让 AI 讲这个词…</div>';
  Promise.resolve(C.aiAssist(it.w, it.c || '')).then(function(o){
    var el = $('rmem'); if(!el) return;
    el.innerHTML = o ? C.memCard(it.w, o)
                     : '<div class="tipbox">没拿到回复，过一会儿再点一次。</div>';
  }, function(){
    var el = $('rmem'); if(el) el.innerHTML = '<div class="tipbox">问 AI 的时候出错了，稍后再试。</div>';
  });
};
/* 这个词出自哪篇短文？能查到就给一个「回原文」的入口，
   记不住的词回到语境里再看一遍，比盯着释义看十遍管用 */
V.srcPid = function(it){
  var src = String((it && it.src) || '');
  if(!src) return '';
  var ps = (C.VE && C.VE.passages) || [];
  for(var i = 0; i < ps.length; i++){
    if(ps[i].title && src.indexOf(ps[i].title) >= 0) return ps[i].id;
  }
  return '';
};

V.revShow  = function(){ V.reviewState.show = true;  V.renderReview() };V.revRate  = function(g){
  var st = V.reviewState, it = st.list[Math.min(st.i, st.list.length - 1)];
  if(!it) return;
  B.review(it.key, g);
  st.done++;
  st.show = false;
  if(g === 0) st.missed.push(it.key);      /* 今天这轮再排队见一次 */
  st.i = Math.min(st.i + 1, Math.max(st.list.length - 1, 0));
  V.renderReview();
  var msg = g === 2 ? '记得 ✓ 下次间隔拉长' : (g === 1 ? '模糊 · 明天再见' : '忘了 · 今天再排一次');
  if(C.TOOLS) C.TOOLS.toast(msg);
};
V.revReset = function(){
  V.reviewState.i = 0; V.reviewState.show = false; V.reviewState.done = 0; V.reviewState.missed = [];
  V.renderReview();
};

/* 角标：单词本总数 + 今日待复习 */
B.paintBadges = function(){
  var st = B.stats();
  var cb = $('cBook'); if(cb){ cb.textContent = st.all; cb.style.display = st.all ? '' : 'none' }
  var cr = $('cRev');  if(cr){ cr.textContent = st.due; cr.style.display = st.due ? '' : 'none' }
};

/* 让侧栏角标跟着刷新（不改动 tools.js 原逻辑，包一层） */
(function(){
  var T = C.TOOLS; if(!T || !T.refreshBadges) return;
  var orig = T.refreshBadges;
  T.refreshBadges = function(){ orig.apply(T, arguments); try{ B.paintBadges() }catch(e){} };
})();

})();
