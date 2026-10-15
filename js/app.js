/* 主程序：路由 / 页面渲染 / 通用练习引擎
   交互原则：先给方向 → 再给位置 → 最后才给答案 */
(function(){
var C=window.CET6, B=C.BANK, A=C.ASSESS, S=C.STATS, T=C.TOOLS;
var $=C.$, esc=C.esc, get=C.get, set=C.set;
var L='ABCD';
function letter(i){ return String.fromCharCode(65+i) }
function pct(x){ return Math.round(x*100) }

/* ================= 路由 ================= */
var TITLES={home:'总览',assess:'能力测评',plan:'我的方案',bank:'题库',read:'仔细阅读',
  listen:'听力',match:'长篇匹配',cloze:'选词填空',vocab:'生词速记',wrong:'错题本',
  stats:'数据分析',import:'导入题目',settings:'设置',redo:'错题重做',method:'找答案手册',
  words:'今日新词',notes:'摘抄本',account:'账号'};

/* ---------- 考试切换（CET-6 / 349 药学综合） ---------- */
C.exam = get('cet6_exam','cet6');
C.applyExam = function(){
  var k = C.exam;
  var mc=$('menuCet6'), mp=$('menuPharm');
  if(mc) mc.className = 'menu' + (k==='cet6'?' on':'');
  if(mp) mp.className = 'menu' + (k==='pharm'?' on':'');
  var b1=$('exCet6'), b2=$('exPharm');
  if(b1) b1.className = k==='cet6'?'on':'';
  if(b2) b2.className = k==='pharm'?'on':'';
  var tc=$('topCet6'), tp=$('topPharm');
  if(tc) tc.style.display = k==='cet6'?'':'none';
  if(tp) tp.style.display = k==='pharm'?'':'none';
  var sub=$('sideSub');
  if(sub) sub.textContent = k==='pharm' ? '349 · 有机/分析/生化' : '目标 425 · 12 月 12 日';
  if(C.TOOLS && C.TOOLS.refreshBadges) C.TOOLS.refreshBadges();
};
C.setExam = function(k){
  C.exam = k; set('cet6_exam', k);
  C.applyExam();
  var target = k==='pharm' ? '#/p/home' : '#/home';
  if(location.hash === target) route(); else location.hash = target;
};

function route(){
  var h=(location.hash||'#/home').replace(/^#\/?/,'');
  var p=h.split('/'), view=p[0]||'home', arg=p[1];

  /* 349 模块：#/p/... */
  if(view==='p'){
    if(C.exam!=='pharm'){ C.exam='pharm'; C.applyExam() }
    if(C.PHARMV){ C.PHARMV.route(p.slice(1)); set('cet6_last', location.hash); return }
  }
  /* 词汇训练：#/v/...（六级 / 考研核心词） */
  if(view==='v'){
    if(C.exam!=='cet6'){ C.exam='cet6'; C.applyExam() }
    if(C.VEXAM){ C.VEXAM.route(p.slice(1)); set('cet6_last', location.hash); return }
  }
  if(C.exam!=='cet6'){ C.exam='cet6'; C.applyExam() }

  var app=$('app'); app.innerHTML='';
  hideTrans();
  T.unbind();
  if(view==='home') renderHome();
  else if(view==='assess') renderAssess();
  else if(view==='plan') renderPlan();
  else if(view==='bank') renderBank();
  else if(view==='read') renderRead(arg);
  else if(view==='listen') renderListen(arg);
  else if(view==='match') renderMatch(arg);
  else if(view==='cloze') renderCloze(arg);
  else if(view==='vocab') renderVocab();
  else if(view==='wrong') renderWrong();
  else if(view==='stats') renderStats();
  else if(view==='import') C.IMP.render();
  else if(view==='settings') renderSettings();
  else if(view==='method') renderMethod();
  else if(view==='words') renderWords();
  else if(view==='notes') renderNotes();
  else if(view==='account') renderAccount();
  else renderHome();
  window.scrollTo(0,0);
  markNav(view);
  setCrumb(view);
  set('cet6_last', location.hash);
  T.refreshBadges();
  C.aiPaintStatus();          /* 顶栏 AI 灯每换一页都刷一次 */
  C.accPaint();               /* 顶栏账号灯：现在是谁在学 */
}
function markNav(v){
  var as=document.querySelectorAll('#menuCet6 a');
  for(var i=0;i<as.length;i++){
    var hr=as[i].getAttribute('href')||'';
    as[i].className = (hr==='#/'+v || hr.indexOf('#/'+v+'/')===0) ? 'on' : '';
  }
  var sd=document.getElementById('side'); if(sd) sd.classList.remove('open');
}
function setCrumb(v){ var c=$('crumb'); if(c) c.innerHTML='<b>'+(TITLES[v]||'')+'</b>' }
function hideTrans(){ var t=$('tt'); if(t){ t.innerHTML='把鼠标移到任意句子上，这里显示整句翻译'; t.className='empty' } }
C.route = route;

C.syncTop = function(){
  var s=C.settings;
  var hw=$('swHover'); if(hw){ if(hw.tagName==='SELECT') hw.value=String(C.hoverMode()); else hw.checked=s.hoverTip }
  var wr=$('swHoverWrap'); if(wr) wr.className='switch'+(C.hoverMode()?' on':'');
  var i=$('swInstant'); if(i) i.checked=s.instant;
  var a=$('swAssist'); if(a) a.value=String(s.assist);
};
C.toggleHover=function(v){ C.settings.hoverTip=v; C.saveSettings(); C.syncTop() };
/* 划词显示到什么程度：0 不显示 1 只词义 2 词义 + 整句译文 */
C.setHoverMode=function(v){
  C.settings.hoverMode=+v || 0;
  C.settings.hoverTip = C.settings.hoverMode > 0;
  C.saveSettings(); C.syncTop();
  T.toast(['划词翻译已关闭：纯英文阅读','只看单词释义','看单词释义 + 整句译文'][C.settings.hoverMode]);
};
C.setAssist=function(v){ C.settings.assist=v; C.saveSettings(); route() };
C.toggleInstant=function(v){ C.settings.instant=v; C.saveSettings() };

/* 折叠侧栏（移动端点链接后收起） */
document.addEventListener('click', function(e){
  var a = e.target && e.target.closest ? e.target.closest('.side a') : null;
  if(a){ var sd=document.getElementById('side'); if(sd) sd.classList.remove('open') }
});

/* ================= 小工具 ================= */
function ringScore(){
  /* 预估六级得分 */
  var e=S.estimate();
  if(e.score==null) return null;
  return e;
}
function daysLeft(){
  var d=new Date('2026-12-12T15:00:00'), n=new Date();
  return Math.max(0,Math.ceil((d-n)/86400000));
}
function levelName(v){ return v<3500?'需要补词':(v<4800?'及格线附近':(v<6000?'够用':'超出要求')) }
function taskKey(){ return 'cet6_task_'+S.today() }
var TASKS=[
  ['听力','精听 1 段讲座：扫选项 → 预判 → 抓改写','#/listen/LL1'],
  ['阅读','做 1 篇仔细阅读，逐题复盘并标错因','#/bank'],
  ['词汇','过一遍生词本，把今天遇到的生词收进去','#/vocab']
];

/* ================= 首页 · 仪表盘 ================= */
function renderHome(){
  var prof=get('cet6_profile_v1',null), h='';

  /* Hero */
  h+='<div class="card"><div style="display:flex;gap:22px;align-items:center;flex-wrap:wrap">';
  var e=ringScore();
  if(e){
    h+=T.ring(e.score/710, 118, e.score, '/ 710');
  }else{
    h+=T.ring(0, 118, '—', '未测评');
  }
  h+='<div style="flex:1;min-width:240px">';
  h+='<h1>CET-6 训练台</h1>';
  h+='<p class="sub" style="margin-bottom:8px">目标不是检验你，是让你在最短时间里<b>学会</b>。所有提示都能开，学会了再关掉做模拟考试。</p>';
  if(e){
    var gap=425-e.score;
    h+= gap>0
      ? '<div class="pill a">距 425 还差 '+gap+' 分</div>'
      : '<div class="pill g">已越过 425 线（估）</div>';
    h+=' <span class="hint">含写译按全国平均 '+S.WRITE_DEFAULT+' 分估</span>';
  }else{
    h+='<div class="pill n">还没有数据，先做一次诊断</div>';
  }
  h+='</div></div>';

  /* 今日三个数 */
  var d=S.day(), goal=S.goal(), st=S.streak();
  h+='<div class="grid" style="margin-top:16px">';
  h+='<div class="mc"><div class="l">今日题量</div><div class="v">'+d.q+'<span style="font-size:14px;color:#94A3B8"> / '+goal+'</span></div><div class="bar" style="margin-top:6px"><i style="width:'+Math.min(100,d.q/goal*100)+'%"></i></div></div>';
  h+='<div class="mc click" onclick="location.href=\'#/words\'"><div class="l">今日生词</div><div class="v">'+S.dayWordCount()+'<span style="font-size:14px;color:#94A3B8"> / '+S.wordGoal()+'</span></div><div class="bar" style="margin-top:6px"><i style="width:'+Math.min(100,S.dayWordCount()/S.wordGoal()*100)+'%"></i></div><div class="u">选中词按 Tab 收割</div></div>';
  h+='<div class="mc"><div class="l">连续打卡</div><div class="v">'+st+'<span style="font-size:14px;color:#94A3B8"> 天</span></div><div class="u">断一天就归零，别断</div></div>';
  h+='<div class="mc"><div class="l">距考试</div><div class="v">'+daysLeft()+'</div><div class="u">12 月 12 日下午场</div></div>';
  h+='<div class="mc click" onclick="location.href=\'#/vocab\'"><div class="l">待复习生词</div><div class="v">'+S.srsDue().length+'</div><div class="u">共 '+S.srsCount().all+' 个 · 去复习</div></div>';
  h+='</div></div>';

  /* 首次引导 */
  if(!prof){
    h+='<div class="card acc"><div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">';
    h+='<div style="flex:1;min-width:240px"><h3 style="margin:0 0 4px">第一次进来：先花 5–10 分钟做个诊断</h3>';
    h+='<p class="sub" style="margin:0">测算真实词汇量 + 诊断答题习惯，然后给你一套针对性的训练方法。只做一次。</p></div>';
    h+='<button class="primary big" onclick="location.href=\'#/assess\'">开始诊断</button></div></div>';
  }

  /* 今日三件事 */
  var tk=get(taskKey(),[false,false,false]);
  h+='<div class="card"><div style="display:flex;align-items:center;gap:10px"><h3 style="margin:0;flex:1">今天做这三件事</h3>';
  h+='<span class="hint">'+ (tk.filter(function(x){return x}).length) +' / 3</span></div>';
  h+='<ul class="list" style="margin-top:8px">';
  TASKS.forEach(function(t,i){
    h+='<li><label class="chk" style="margin:0;flex:1"><input type="checkbox"'+(tk[i]?' checked':'')+' onchange="CET6.task('+i+',this.checked)">';
    h+='<span><span class="tag b">'+t[0]+'</span> '+esc(t[1])+'</span></label>';
    h+='<button class="sm" onclick="location.href=\''+t[2]+'\'">去做</button></li>';
  });
  h+='</ul></div>';

  /* 短板排行 */
  h+=weakCard();

  /* 继续上次 */
  var last=get('cet6_last','');
  h+='<div class="grid2">';
  h+='<div class="card tight"><h3 style="margin-top:0">题库</h3><p class="sub">内置仿真卷，题型分值与真题一致。</p><button class="primary" onclick="location.href=\'#/bank\'">进入题库</button></div>';
  h+='<div class="card tight"><h3 style="margin-top:0">错题本</h3><p class="sub">'+S.wrongList().length+' 道待消灭。做对两次自动毕业。</p><button onclick="location.href=\'#/wrong\'">去消灭</button></div>';
  h+='<div class="card tight"><h3 style="margin-top:0">导入题目</h3><p class="sub">有真题 PDF？拖进来就能变成题库。</p><button class="primary" onclick="location.href=\'#/import\'">去导入</button></div>';
  h+='<div class="card tight"><h3 style="margin-top:0">找答案手册</h3><p class="sub">先题后文、同义替换、绝对词慎选——照着做的那套流程，看完直接练。</p><button onclick="location.href=\'#/method\'">去看手册</button></div>';
  h+='</div>';

  h+='<div class="card tight"><p class="sub" style="margin:0">真实六级真题受版权保护，本站不内置真题；内置的是按真题题型、分值、篇幅自编的仿真卷。你拿到真题后可用「导入题目」自己加进去。</p></div>';
  $('app').innerHTML=h;
}
C.task=function(i,on){
  var k=taskKey(), a=get(k,[false,false,false]);
  a[i]=on; set(k,a);
  if(a.filter(function(x){return x}).length===3) T.toast('今天三件事做完了，明天见');
};

/* 短板：按投入产出排序 */
function weakCard(){
  var bk=S.byKind(), rows=[];
  S.KIND.forEach(function(k){
    var a=bk[k.k];
    rows.push({k:k.k, n:k.n, sec:k.sec, tot:a?a.tot:0, rate:a?a.rate:null, v:k.v, max:k.max});
  });
  var measured=rows.filter(function(r){return r.tot>0});
  var h='<div class="card"><h3>题型短板（按分值排序）</h3>';
  if(!measured.length){
    h+='<p class="sub" style="margin:0">还没有答题记录。做完一套题，这里会告诉你的分丢在哪。</p>';
  }else{
    h+='<p class="sub">先看「每分钟能换多少分」：讲座听力和仔细阅读每题 14.2 分，是全卷最贵的两块。</p>';
    rows.sort(function(a,b){ return b.v-a.v });
    h+='<table><thead><tr><th>题型</th><th class="n">分值/题</th><th class="n">做过</th><th class="n">正确率</th><th style="width:130px">状态</th></tr></thead><tbody>';
    rows.forEach(function(r){
      var col = r.rate==null?'':(r.rate>=.7?'ok':(r.rate>=.5?'wn':'er'));
      h+='<tr><td>'+r.n+'<span class="pill n" style="margin-left:6px">'+r.sec+'</span></td>';
      h+='<td class="n">'+r.v+'</td><td class="n">'+r.tot+'</td>';
      h+='<td class="n">'+(r.rate==null?'—':pct(r.rate)+'%')+'</td>';
      h+='<td><div class="bar"><i class="'+col+'" style="width:'+(r.rate==null?0:pct(r.rate))+'%"></i></div></td></tr>';
    });
    h+='</tbody></table>';
    /* 给出一个明确建议 */
    var worst=null;
    measured.forEach(function(r){ if(!worst || r.rate<worst.rate) worst=r });
    var best=null;
    measured.forEach(function(r){ if(!best || (r.v>r.v0||r.v>best.v)) best=r });
    var focus = S.KIND.filter(function(k){ return k.k==='lecture'||k.k==='read' })[0];
    h+='<div class="assist" style="margin-top:12px"><b>现在的优先级</b><br>';
    h+='最弱的是 <b>'+worst.n+'</b>（正确率 '+pct(worst.rate)+'%）。';
    h+='但提分最快的是 <b>讲座听力 + 仔细阅读</b>——两者合计 284 分，占全卷 40%，每题都是 14.2 分。';
    h+='选词填空整套只有 35.5 分，考场上留最后 5 分钟按词性蒙。</div>';
  }
  h+='</div>';
  return h;
}

/* ================= 词汇量测评 ================= */
var PROF='cet6_profile_v1';
var VT={list:[],i:0,ans:{},started:false};
function renderAssess(){
  if(!VT.started) buildVT();
  var h='';
  if(VT.i<VT.list.length){
    var w=VT.list[VT.i], p=Math.round(VT.i/VT.list.length*100);
    h+='<div class="card"><div style="display:flex;align-items:center;gap:10px"><h2 style="flex:1;margin:0">词汇量测评</h2><span class="pill">第 '+(VT.i+1)+' / '+VT.list.length+'</span></div>';
    h+='<p class="sub">认识就点「认识」。不确定的一律点「不认识」——高估自己只会拿到一份没用的方案。里面混了几个不存在的词。</p>';
    h+='<div class="bar"><i style="width:'+p+'%"></i></div>';
    h+='<div class="center"><div class="wt">'+esc(w.w)+'<small>'+(w.band?'（'+w.label+'）':'')+'</small></div>';
    h+='<button class="big" onclick="CET6.vt(1)">认识</button> ';
    h+='<button class="big" onclick="CET6.vt(0)">不认识</button>';
    h+='<div style="margin-top:10px"><button class="sm" title="收进生词本（S）" onclick="CET6.vtAdd()">收进生词本</button></div>';
    h+='<p class="hint center" style="margin-top:14px">键盘：<kbd>←</kbd> 认识　<kbd>→</kbd> 不认识　<kbd>S</kbd> 收词</p></div>';
  }
  $('app').innerHTML=h;
}
function buildVT(){
  var list=[];
  A.bands.forEach(function(b){ b.words.forEach(function(w){ list.push({w:w,band:b.k,label:b.label,size:b.size}) }) });
  A.nonce.forEach(function(w){ list.push({w:w,band:null,nonce:true}) });
  for(var i=list.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=list[i]; list[i]=list[j]; list[j]=t }
  VT={list:list,i:0,ans:{},started:true};
}
C.vt=function(v){
  if(VT.i>=VT.list.length) return;
  VT.ans[VT.list[VT.i].w]=v;
  VT.i++;
  if(VT.i>=VT.list.length) finishVT(); else renderAssess();
};
C.vtAdd=function(){ if(VT.list[VT.i]) T.addWord(VT.list[VT.i].w) };
document.addEventListener('keydown',function(e){
  if((location.hash||'').indexOf('assess')<0 || !VT.started || VT.i>=VT.list.length) return;
  if(e.key==='ArrowLeft') C.vt(1);
  if(e.key==='ArrowRight') C.vt(0);
  if(e.key==='s'||e.key==='S'){ C.vtAdd(); e.preventDefault() }
});
function finishVT(){
  var fake=0;
  A.nonce.forEach(function(w){ if(VT.ans[w]) fake++ });
  var vocab=0, rows=[];
  A.bands.forEach(function(b){
    var ok=0; b.words.forEach(function(w){ if(VT.ans[w]) ok++ });
    var rate=ok/b.words.length;
    vocab+=Math.round(b.size*rate);
    rows.push({k:b.k,label:b.label,ok:ok,tot:b.words.length,rate:Math.round(rate*100),add:Math.round(b.size*rate)});
  });
  VT.result={vocab:vocab,fake:fake,rows:rows};
  renderQuiz();
}

/* ---------- 方法问卷 ---------- */
var QZ={i:0,ans:{}};
function renderQuiz(){
  var h='<div class="card"><h2>词汇量估算结果</h2>';
  h+='<div class="grid" style="margin:12px 0">';
  h+='<div class="mc"><div class="l">估算词汇量</div><div class="v" style="color:var(--brand)">'+VT.result.vocab+'</div></div>';
  h+='<div class="mc"><div class="l">水平</div><div class="v" style="font-size:18px">'+levelName(VT.result.vocab)+'</div></div></div>';
  if(VT.result.fake>3){
    h+='<div class="card tight" style="background:var(--erbg);border-color:var(--erln)"><b>注意：</b>你把 '+VT.result.fake+' 个不存在的词也标成了「认识」，结果可能偏高。建议重测一次，不确定的一律选「不认识」。</div>';
  }
  h+='<table><thead><tr><th>词频带</th><th class="n">答对</th><th class="n">折算</th></tr></thead><tbody>';
  VT.result.rows.forEach(function(r){
    h+='<tr><td>'+r.k+' · '+esc(r.label)+'</td><td class="n">'+r.ok+' / '+r.tot+'</td><td class="n">'+r.add+'</td></tr>';
  });
  h+='</tbody></table>';
  h+='<h3 style="margin-top:18px">接下来 8 个问题：诊断你的答题习惯</h3>';
  h+='<p class="sub">按真实情况选。选错只会让你拿到一份不适合自己的方案。</p></div>';
  A.quiz.forEach(function(q,idx){
    h+='<div class="card"><div style="font-weight:600;font-size:14.5px;margin-bottom:8px">'+(idx+1)+'. '+esc(q.q)+'</div>';
    if(q.multi){
      q.o.forEach(function(o,oi){
        h+='<label class="chk"><input type="checkbox" onchange="CET6.qzMulti('+idx+','+oi+',this.checked)">'+esc(o)+'</label>';
      });
    }else{
      h+='<div class="opts">';
      q.o.forEach(function(o,oi){
        h+='<div class="opt'+(QZ.ans[q.k]===oi?' sel':'')+'" onclick="CET6.qzPick(\''+q.k+'\','+oi+')"><span class="k">'+L[oi]+'</span><span>'+esc(o)+'</span></div>';
      });
      h+='</div>';
    }
    h+='</div>';
  });
  h+='<div class="card center"><button class="primary big" onclick="CET6.finishAssess()">生成我的训练方案</button></div>';
  $('app').innerHTML=h;
}
C.qzPick=function(k,i){ QZ.ans[k]=i; renderQuiz() };
C.qzMulti=function(qi,oi,on){
  var k=A.quiz[qi].k;
  if(!QZ.ans[k]) QZ.ans[k]=[];
  var arr=QZ.ans[k], idx=arr.indexOf(A.quiz[qi].o[oi]);
  if(on&&idx<0) arr.push(A.quiz[qi].o[oi]);
  if(!on&&idx>=0) arr.splice(idx,1);
};
C.finishAssess=function(){
  var prof={
    vocab:VT.result.vocab,
    order:QZ.ans.order==null?0:QZ.ans.order,
    prelisten:QZ.ans.prelisten==null?3:QZ.ans.prelisten,
    newword:QZ.ans.newword==null?0:QZ.ans.newword,
    cloze:QZ.ans.cloze==null?0:QZ.ans.cloze,
    writing:QZ.ans.writing==null?3:QZ.ans.writing,
    review:QZ.ans.review==null?2:QZ.ans.review,
    hours:QZ.ans.hours==null?1:QZ.ans.hours,
    weak:QZ.ans.weak||[],
    at:new Date().toISOString()
  };
  set(PROF,prof);
  location.href='#/plan';
};

/* ================= 训练方案 ================= */
function renderPlan(){
  var prof=get(PROF,null);
  if(!prof){ $('app').innerHTML='<div class="card center"><div class="empty-st"><div class="ic">◔</div><p>还没做测评，先花 5 分钟诊断一下。</p><button class="primary" onclick="location.href=\'#/assess\'">去测评</button></div></div>'; return }
  var secs=A.plan(prof);
  var h='<div class="card"><h1>你的训练方案</h1>';
  h+='<p class="sub">基于词汇量 '+prof.vocab+' 和你的答题习惯生成。做满两周后回来重测一次词汇量。</p>';
  h+='<div class="grid"><div class="mc"><div class="l">词汇量</div><div class="v">'+prof.vocab+'</div></div>';
  h+='<div class="mc"><div class="l">距考试</div><div class="v">'+daysLeft()+'</div><div class="u">天</div></div>';
  h+='<div class="mc"><div class="l">每周投入</div><div class="v" style="font-size:16px">'+['10h+','5–10h','3–5h','<3h'][prof.hours]+'</div></div>';
  h+='<div class="mc click" onclick="location.href=\'#/bank\'"><div class="l">开始练</div><div class="v" style="font-size:17px">题库 →</div></div></div></div>';
  secs.forEach(function(s){
    h+='<div class="card"><h2>'+esc(s.h)+'</h2><ul class="list">';
    s.items.forEach(function(it){ h+='<li><span class="g">'+it+'</span></li>' });
    h+='</ul></div>';
  });
  h+='<div class="card center"><button class="primary" onclick="location.href=\'#/bank\'">开始做题</button> ';
  h+='<button onclick="if(confirm(\'重新测评会覆盖当前方案，确定？\')){location.href=\'#/assess\'}">重新测评</button></div>';
  $('app').innerHTML=h;
}

/* ================= 题库 ================= */
function setStat(sid, total){
  var ls=S.logs().filter(function(r){ return r.sid===sid });
  var m={}, ok=0;
  ls.forEach(function(r){ m[r.qn]=r; });
  Object.keys(m).forEach(function(k){ if(m[k].ok) ok++ });
  return {done:Object.keys(m).length, ok:ok, tot:total};
}
function renderBank(){
  var imp=get('cet6_imported',[]);
  var h='<div class="card"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:240px">';
  h+='<h1>题库</h1><p class="sub" style="margin:0">内置仿真卷按真题题型与分值自编。做完可以开「辅助提示」重做一遍。</p></div>';
  h+='<button class="primary" onclick="location.href=\'#/import\'">+ 导入题目</button></div></div>';

  h+='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h3 style="margin:0;flex:1">仔细阅读</h3><span class="pill a">每题 14.2 分 · 全卷最值钱</span></div>';
  h+='<p class="sub" style="margin:8px 0 4px">做完一篇就复盘一篇。看解析时按 <kbd>E</kbd> 逐层揭开，先自己想再看答案。</p>';
  h+='<ul class="list">';
  B.readings.forEach(function(r){
    if(r.vexam) return;                     /* 词汇训练的文章不混进六级题库 */
    var st=setStat(r.id, r.qs.length);
    h+='<li><span class="tag b">'+esc(r.topic||'阅读')+'</span><span class="g">'+esc(r.title)+'<div class="d">'+r.words+' 词 · '+r.qs.length+' 题'+(st.done?(' · 已做 '+st.done+' 题 对 '+st.ok):'')+'</div></span>';
    h+='<button class="sm" onclick="location.href=\'#/read/'+r.id+'\'">开始</button></li>';
  });
  h+='</ul></div>';

  h+='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h3 style="margin:0;flex:1">听力</h3><span class="pill a">讲座每题 14.2 分 · 占听力 57%</span></div>';
  h+='<p class="sub" style="margin:8px 0 4px">只播一遍，与考场一致。听完再对答案，别边听边看原文。</p>';
  h+='<ul class="list">';
  B.listening.forEach(function(g){
    var nm=g.kind==='lecture'?'讲座':(g.kind==='passage'?'篇章':'长对话');
    var st=setStat(g.id, g.qs.length);
    h+='<li><span class="tag'+(g.kind==='lecture'?' b':'')+'">'+nm+'</span><span class="g">'+esc(g.title)+'<div class="d">'+g.qs.length+' 题 × '+g.value+' 分'+(st.done?(' · 已做 对 '+st.ok):'')+'</div></span>';
    h+='<button class="sm" onclick="location.href=\'#/listen/'+g.id+'\'">开始</button></li>';
  });
  h+='</ul></div>';

  h+='<div class="card"><h3>长篇匹配 / 选词填空</h3>';
  h+='<p class="sub">匹配题不依赖词汇量，靠扫读，性价比最高。选词填空整套 35.5 分，考场上放最后做。</p>';
  h+='<ul class="list">';
  B.matching.forEach(function(m){
    var st=setStat(m.id, m.qs.length);
    h+='<li><span class="tag">长篇匹配</span><span class="g">'+esc(m.title)+'<div class="d">10 题 × 7.1 分'+(st.done?(' · 已做 对 '+st.ok):'')+'</div></span><button class="sm" onclick="location.href=\'#/match/'+m.id+'\'">开始</button></li>';
  });
  B.cloze.forEach(function(c){
    h+='<li><span class="tag">选词填空</span><span class="g">'+esc(c.title)+'<div class="d">10 题 × 3.55 分 · 整套只值 35.5 分</div></span><button class="sm" onclick="location.href=\'#/cloze/'+c.id+'\'">开始</button></li>';
  });
  h+='</ul></div>';

  if(imp.length){
    h+='<div class="card"><h3>我导入的题目</h3><ul class="list">';
    imp.forEach(function(p,i){
      h+='<li><span class="tag">导入</span><span class="g">'+esc(p.title||p.id)+'<div class="d">'+p.qs.length+' 题</div></span>';
      h+='<button class="sm" onclick="location.href=\'#/read/'+p.id+'\'">开始</button> ';
      h+='<button class="sm danger" onclick="CET6.delImport('+i+')">删除</button></li>';
    });
    h+='</ul></div>';
  }
  $('app').innerHTML=h;
}
C.delImport=function(i){
  var a=get('cet6_imported',[]);
  var it=a[i]; if(!it) return;
  a.splice(i,1); set('cet6_imported',a);
  B.readings=B.readings.filter(function(x){ return x.id!==it.id });
  route();
};

/* ================= 通用练习引擎 ================= */
var P=null;

/* 富文本：逐词包裹（便于划词）+ 题眼高亮 + 绝对化词预警 */
var RE_EYE=/\b(mainly|primarily|inferred|infer|imply|implies|attitude|tone|purpose|except|conclude|suggest)\b/gi;
var RE_ABS=/\b(all|never|always|entirely|completely|only|must|impossible|eliminate|none|every|totally)\b/gi;
function richHTML(text, eye, abs){
  var s=esc(text).replace(/([A-Za-z][A-Za-z'-]*)/g,function(m){
    return '<span class="w'+(C.lookup(m)?' hit':'')+'">'+m+'</span>';
  });
  if(eye) s=s.replace(RE_EYE,function(m){ return '<span class="eyew">'+m+'</span>' });
  if(abs) s=s.replace(RE_ABS,function(m){ return '<span class="abs">'+m+'</span>' });
  return s;
}
function qBlock(q,pfx){
  var showHint = C.settings.assist>0;
  var h='<div class="q" id="qw_'+pfx+q.n+'">';
  h+='<div class="qhead"><span class="qno" id="qn_'+pfx+q.n+'">'+q.n+'</span>';
  h+='<div class="qtext">'+(showHint&&q.type?'<span class="qbadge k-'+q.type+'">'+C.TYPE[q.type].n+'</span>':'')+richHTML(q.q,true,false)+'</div>';
  h+='<div class="qacts">';
  h+='<button class="sm primary" title="四步带你找到依据（F）" onclick="CET6.TOOLS.solveN('+q.n+')">找答案</button>';
  h+='<button class="sm" title="展开/收起本题解析（E）" onclick="CET6.TOOLS.revealN('+q.n+')">解析</button>';
  h+='<button class="sm" title="定位到原文依据（L）" onclick="CET6.TOOLS.locateN('+q.n+')">定位</button>';
  h+='</div></div>';
  h+='<div id="hint_'+pfx+q.n+'">'+T.assistHTML(q)+'</div>';
  h+='<div id="solve_'+pfx+q.n+'"></div>';
  h+='<div class="opts">';
  q.o.forEach(function(o,i){
    h+='<div class="opt" data-n="'+q.n+'" data-i="'+i+'"><span class="k">'+letter(i)+'</span><span>'+richHTML(o,false,showHint)+'</span><span class="kb">'+(i+1)+'</span></div>';
  });
  h+='</div><div id="ex_'+pfx+q.n+'"></div></div>';
  return h;
}
function pbarHTML(cfg){
  var h='<div class="pbar"><span class="tm" id="tm">0:00</span>';
  h+='<span class="hint" id="pg">已答 0 / '+cfg.qs.length+'</span>';
  h+='<span class="sp" style="flex:1"></span>';
  h+='<button class="sm" title="上一题（K）" onclick="CET6.TOOLS.prev()">‹ 上题</button>';
  h+='<button class="sm" title="下一题（J）" onclick="CET6.TOOLS.next()">下题 ›</button>';
  h+='<button class="sm primary" title="四步带你找到依据（F）" onclick="CET6.TOOLS.solve()">找答案</button>';
  h+='<button class="sm" title="实在不会，按规律猜一个（G）" onclick="CET6.TOOLS.blindGuess(CET6.TOOLS.cur0())">猜一个</button>';
  h+='<button class="sm" title="展开/收起本题解析（E）" onclick="CET6.TOOLS.reveal()">解析</button>';
  h+='<button class="sm" title="定位到原文依据（L）" onclick="CET6.TOOLS.locate(CET6.TOOLS.cur0())">定位原文</button>';
  h+='<button class="sm" title="整篇逐句翻译（T）" onclick="CET6.TOOLS.toggleZh()">逐句翻译</button>';
  h+='<button class="sm" title="把选中的词收进生词本（S）" onclick="CET6.TOOLS.addSel()">收词</button>';
  h+='<button class="sm" title="翻译划选的整段（R）" onclick="CET6.TOOLS.translateSel()">译选中</button>';
  h+='<button class="sm" title="把选中的一段存进摘抄本" onclick="CET6.TOOLS.saveSel()">存摘抄</button>';
  h+='<button class="sm" title="查词 / 拆句子（/）" onclick="CET6.TOOLS.querySel()">查词 <kbd>/</kbd></button>';
  h+='<button class="sm" onclick="CET6.TOOLS.kbd()">快捷键 <kbd>?</kbd></button>';
  h+='<button class="sm" onclick="CET6.clearAns()">清空</button></div>';
  return h;
}
var ASSIST_NM=['模拟考试','轻 · 方向','中 · 定位','强 · 全开'];
function adviseHTML(ad){
  return '<div class="card acc"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'+
    '<b style="flex:1;min-width:200px">建议把辅助提示调到「'+ASSIST_NM[ad.to]+'」</b>'+
    '<button class="sm primary" onclick="CET6.applyAdvise('+ad.to+')">照做</button>'+
    '<button class="sm" onclick="CET6.dismissAdvise()">先不用</button></div>'+
    '<div class="hint" style="margin-top:6px">'+esc(ad.why)+'</div></div>';
}
C.applyAdvise=function(v){ C.setAssist(v); T.toast('已切到「'+ASSIST_NM[v]+'」') };
C.dismissAdvise=function(){ C.set('cet6_advisedismiss', S.logs().length); route() };

function practice(cfg){
  P={cfg:cfg, ans:{}, done:false};
  T.stopTimer();
  var h=pbarHTML(cfg);
  var ad=S.advise();
  if(ad) h+=adviseHTML(ad);
  h+=cfg.two ? '<div class="prac"><div class="col-l">'+cfg.left+'</div><div class="col-r">' : '<div>';
  h+='<div class="card"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><h2 style="margin:0;flex:1">Questions</h2>'+(cfg.note||'')+'</div>';
  h+='<p class="hint" style="margin:6px 0 0">题干里 <span class="eyew">红色</span> 是题眼（决定题型）；选项里 <span class="abs">波浪线</span> 是绝对化词，通常可以先排除。按 <kbd>E</kbd> 逐层看解析。</p>';
  h+='<div id="qsBox">';
  cfg.qs.forEach(function(q){ h+=qBlock(q,cfg.pfx) });
  h+='</div><div class="center" style="margin-top:16px"><button class="primary big" onclick="CET6.grade()">提交并查看解析</button>';
  h+=' <span class="hint">或按 <kbd>Enter</kbd></span></div></div>';
  h+=cfg.two?'</div></div>':'</div>';
  $('app').innerHTML=h;
  var box=$('qsBox');
  box.addEventListener('click',function(e){
    var el=e.target&&e.target.closest?e.target.closest('.opt'):null;
    if(!el) return;
    pick(+el.getAttribute('data-n'), +el.getAttribute('data-i'));
  });
  T.bind({kind:cfg.kind, sid:cfg.sid, pfx:cfg.pfx, qs:cfg.qs, onPick:pick, onReveal:revealOne, onGrade:C.grade});
  T.ansOf = function(){ return P ? P.ans : {} };   /* 「答案分布」这条规律要用 */
  T.startTimer(cfg.limit);
  if(cfg.after) cfg.after();
}
function getQ(n){
  var q=null; if(P) P.cfg.qs.forEach(function(x){ if(x.n===n) q=x });
  return q;
}
function pick(n,i){
  if(!P||P.done) return;
  P.ans[n]=i;
  var box=$('qsBox'); if(!box) return;
  var os=box.querySelectorAll('.opt[data-n="'+n+'"]');
  for(var k=0;k<os.length;k++) os[k].className='opt'+(k===i?' sel':'');
  var pg=$('pg');
  if(pg) pg.textContent='已答 '+Object.keys(P.ans).length+' / '+P.cfg.qs.length;
  if(C.settings.instant && C.settings.assist>0) gradeOne(n);
}
function gradeOne(n){
  if(!P) return;
  var q=getQ(n); if(!q) return;
  var el=$('ex_'+P.cfg.pfx+n); if(!el) return;
  el.innerHTML=T.expHTML(q,P.ans[n]);
  var box=$('qsBox');
  var os=box.querySelectorAll('.opt[data-n="'+n+'"]');
  for(var k=0;k<os.length;k++){
    os[k].className='opt'+(k===q.a?' ok':(k===P.ans[n]?' no':''));
  }
  var qn=$('qn_'+P.cfg.pfx+n); if(qn) qn.className='qno '+(P.ans[n]===q.a?'ok':'no');
}
function revealOne(n){
  if(!P) return;
  var q=getQ(n); if(!q) return;
  var el=$('ex_'+P.cfg.pfx+n); if(!el) return;
  if(el.innerHTML){ el.innerHTML=''; return }
  el.innerHTML=T.rvHTML(q,1,P.cfg.pfx);
}
C.clearAns=function(){
  if(!P) return;
  P.ans={};
  var box=$('qsBox'); if(!box) return;
  var os=box.querySelectorAll('.opt');
  for(var k=0;k<os.length;k++) os[k].className='opt';
  var pg=$('pg'); if(pg) pg.textContent='已答 0 / '+P.cfg.qs.length;
  P.cfg.qs.forEach(function(q){
    var e=$('ex_'+P.cfg.pfx+q.n); if(e) e.innerHTML='';
    var n=$('qn_'+P.cfg.pfx+q.n); if(n) n.className='qno';
  });
};
C.grade=function(){
  if(!P||P.done) return;
  var el=T.elapsed();
  T.stopTimer();
  P.done=true;
  var cfg=P.cfg, ok=0;
  var per=cfg.qs.length?Math.round(el*1000/cfg.qs.length):0;
  cfg.qs.forEach(function(q){
    var got=P.ans[q.n], right=(got===q.a);
    if(right) ok++;
    /* 记下这题用了几级提示——"靠提示做对"和"自己会"是两回事 */
    S.log(cfg.kind, cfg.sid, q.n, q.type||'', right, got==null?-1:got, per, T.hintOf ? T.hintOf(q.n) : 0);
    var e2=$('ex_'+cfg.pfx+q.n);
    if(e2){
      e2.innerHTML=T.expHTML(q,got);
      if(!right) e2.insertAdjacentHTML('beforeend', reasonHTML(cfg.sid,q.n));
    }
    markOpts(q,got);
  });
  var rate=cfg.qs.length?ok/cfg.qs.length:0;
  var val=(S.VAL[cfg.kind]||0);
  var gotScore=Math.round(ok*val*10)/10, maxScore=Math.round(cfg.qs.length*val*10)/10;
  var h='<div class="card acc '+(rate>=.6?'ok':'wn')+'">';
  h+='<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">';
  h+=T.ring(rate,96,pct(rate)+'%','正确率');
  h+='<div style="flex:1;min-width:220px">';
  h+='<h2 style="margin-bottom:6px">'+ok+' / '+cfg.qs.length+' · 折合 '+gotScore+' 分（满分 '+maxScore+'）</h2>';
  h+='<p class="sub" style="margin:0">'+(rate>=.6?
    '过关。但回去确认有没有<b>蒙对</b>的题——那些比错题更危险，你会以为自己会了。':
    '别先盯正确率。逐题判断你是<b>定位错了</b>、<b>句子没拆开</b>还是<b>词汇卡住</b>：三类的补法完全不同。')+'</p>';
  var est=S.estimate();
  if(est.score!=null) h+='<div class="hint" style="margin-top:8px">当前六级预估：<b>'+est.score+' 分</b>（客观题 '+est.obj+' + 写译按 '+est.write+' 估）</div>';
  /* 提示依赖度：靠提示拿到的分不算数 */
  var used=0, usedOk=0;
  cfg.qs.forEach(function(q){
    var lv=T.hintOf?T.hintOf(q.n):0;
    if(lv>0){ used++; if(P.ans[q.n]===q.a) usedOk++ }
  });
  if(used){
    var cleanN=cfg.qs.length-used, cleanOk=ok-usedOk;
    h+='<div class="assist" style="margin-top:10px"><b>提示依赖</b><br>这 ' + used + ' 题你开了提示' +
       (usedOk?('，其中 '+usedOk+' 题做对——这几题的分<b>不算真会</b>，明天不开提示再做一遍才算过。'):'，而且都没做对——这类题先回原文把句子拆开，别急着做下一套。');
    if(cleanN) h+='<br>剩下 '+cleanN+' 题没看提示，做对 '+cleanOk+' 题（' + pct(cleanN?cleanOk/cleanN:0) + '%），这个数才是你的真实水平。';
    h+='</div>';
  }
  h+='</div><div style="display:flex;flex-direction:column;gap:8px">';
  h+='<button class="sm" onclick="location.reload()">重做这套</button>';
  h+='<button class="sm" onclick="location.href=\'#/wrong\'">看错题本</button>';
  h+='<button class="sm" onclick="location.href=\'#/stats\'">看数据分析</button>';
  h+='</div></div></div>';
  $('app').insertAdjacentHTML('afterbegin',h);
  window.scrollTo(0,0);
  T.refreshBadges();
  if(C.CLOUD) C.CLOUD.onAnswer();      /* 开了自动同步的话，交完卷顺手备份一次 */
};
function markOpts(q,got){
  var box=$('qsBox'); if(!box) return;
  var os=box.querySelectorAll('.opt[data-n="'+q.n+'"]');
  for(var k=0;k<os.length;k++){
    os[k].className='opt'+(k===q.a?' ok':(k===got?' no':''));
  }
  var n=$('qn_'+P.cfg.pfx+q.n); if(n) n.className='qno '+(got===q.a?'ok':'no');
}
/* 错因自评：三类错法补法完全不同 */
var REASONS=['定位错','句子没拆开','词汇卡住','粗心'];
function reasonHTML(sid,n){
  var h='<div style="margin-top:8px;font-size:12.5px;color:var(--mut)">错因（选一个，会统计到数据分析里）：';
  REASONS.forEach(function(r){
    h+=' <button class="sm" onclick="CET6.reason(\''+sid+'\','+n+',\''+r+'\')">'+r+'</button>';
  });
  h+='</div>';
  return h;
}
C.reason=function(sid,n,r){
  var m=get('cet6_reason_v1',{});
  m[sid+':'+n]=r; set('cet6_reason_v1',m);
  T.toast('已记录：'+r);
};

/* ================= 阅读 ================= */
function renderRead(id){
  var r=null;
  B.readings.forEach(function(x){ if(x.id===id) r=x });
  if(!r){ var im=get('cet6_imported',[]); im.forEach(function(x){ if(x.id===id&&x.type==='reading') r=x }) }
  if(!r){ $('app').innerHTML='<div class="card"><div class="empty-st"><p>找不到这篇文章。</p><button class="primary" onclick="location.href=\'#/bank\'">回题库</button></div></div>'; return }
  var qs=r.qs;
  if(C.redoOnly){
    var wn=S.wrongList().filter(function(w){ return w.sid===r.id }).map(function(w){ return w.qn });
    qs=qs.filter(function(q){ return wn.indexOf(q.n)>=0 });
    if(!qs.length) qs=r.qs;
    C.redoOnly=null;
  }
  var left='<div class="card"><h2 style="margin-bottom:10px">'+esc(r.title)+'</h2>';
  left+='<p class="hint" style="margin-bottom:10px">'+(r.words?r.words+' 词 · ':'')+qs.length+' 题 · 建议 '+(qs.length*2)+' 分钟内做完</p>';
  left+='<div class="passage">';
  r.text.forEach(function(p){
    left+='<p class="sp">';
    if(Array.isArray(p)) left+=C.sentHTML(p[0],p[1]);
    else left+=C.sentHTML(p,p);
    left+='<button class="pt" title="只看这一句的中文" onclick="CET6.TOOLS.trSent(this)">译</button>';
    left+='</p>';
  });
  left+='</div>';
  left+='<p class="hint" style="margin-top:10px">每句右边的<b>「译」</b>只看那一句中文；<b>划选一段</b>再点浮动条的「翻译」可整段对照；按 <kbd>T</kbd> 一次展开全文译文。</p>';
  /* 词汇训练的文章：底部列出这篇覆盖的核心词 */
  if(r.vexam && C.VEXAM && C.VEXAM.coverCard) left+=C.VEXAM.coverCard(r);
  left+='</div>';
  practice({kind:'read', sid:r.id, pfx:'r', two:true, left:left, qs:qs, limit:qs.length*120,
    note:'<span class="hint">每题 14.2 分</span>'});
}

/* ================= 听力 ================= */
var LS={}, LST={};   /* LST 按 id 记住"是否播过 / 是否显示原文"，重绘不丢状态 */
function renderListen(id){
  var g=null;
  B.listening.forEach(function(x){ if(x.id===id) g=x });
  if(!g){ $('app').innerHTML='<div class="card"><div class="empty-st"><p>找不到这段听力。</p><button class="primary" onclick="location.href=\'#/bank\'">回题库</button></div></div>'; return }
  var qs=g.qs;
  if(C.redoOnly){
    var wn=S.wrongList().filter(function(w){ return w.sid===g.id }).map(function(w){ return w.qn });
    qs=qs.filter(function(q){ return wn.indexOf(q.n)>=0 });
    if(!qs.length) qs=g.qs;
    C.redoOnly=null;
  }
  var st = LST[id] || (LST[id]={show:false, played:false});
  LS={g:g, played:st.played, show:st.show, rate:1};
  var nm=g.kind==='lecture'?'讲座/讲话':(g.kind==='passage'?'听力篇章':'长对话');
  var left='<div class="card"><h2 style="margin-bottom:6px">'+esc(g.title)+'</h2>';
  left+='<span class="pill">'+nm+'</span> <span class="pill a">'+qs.length+' 题 × '+g.value+' 分</span>';
  left+='<p class="sub" style="margin:10px 0 0">只播一遍，与考场一致。播放前建议先看选项预判。</p>';
  left+='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px">';
  left+='<button class="primary" id="pl" onclick="CET6.play()">播放（仅一次）</button>';
  left+='<span class="hint" id="pst">未播放</span>';
  left+='<span style="flex:1"></span><span class="hint">语速</span>';
  left+='<select id="rate" style="width:auto" onchange="LSA.rate=+this.value"><option value="0.85">0.85x</option><option value="1" selected>1.0x</option><option value="1.15">1.15x</option></select>';
  left+='</div>';
  left+='<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="sm" onclick="CET6.showAudio()">'+(LS.show?'收起原文':'显示原文')+'</button>';
  if(g.kind==='lecture') left+='<span class="hint">讲座占听力 57% 的分值，是全卷最该花时间的一块</span>';
  left+='</div>';
  if(LS.show) left+='<div class="passage" style="font-size:14px;margin-top:10px">'+C.words(g.audio)+'</div>';
  left+='<div class="assist" style="margin-top:12px"><b>三步法</b><br>① 播放前扫选项，圈名词预判主题 → ② 听时只抓"选项的同义改写" → ③ 听到 but / however / 数字 / 举例 立刻记。</div>';
  left+='</div>';
  practice({kind:g.kind, sid:g.id, pfx:'l', two:true, left:left, qs:qs, limit:qs.length*40,
    note:'<span class="hint">每题 '+g.value+' 分</span>',
    after:function(){ var box=$('qsBox'); if(box && !LS.played) box.classList.add('locked') }});
}
C.showAudio=function(){
  var st=LST[LS.g.id]||{};
  st.show=!st.show; LST[LS.g.id]=st;
  renderListen(LS.g.id);
};
var LSA={rate:1};
C.play=function(){
  if(LS.played){ T.toast('只播一遍。想重听可以刷新页面，但那就不是模拟考试了'); return }
  var g=LS.g;
  LS.played=true; (LST[g.id]||(LST[g.id]={})).played=true;
  var b=$('pl'); if(b) b.disabled=true;
  var st=$('pst'); if(st) st.textContent='播放中… 请勿切走页面';
  speak(g.audio, LSA.rate, function(ok){
    if(st) st.textContent = ok? '' : '当前设备没有英文语音，题目已解锁。可点"显示原文"练习。';
    var q=$('qsBox'); if(q) q.classList.remove('locked');
    if(!ok){ LS.played=false; if(b) b.disabled=false }
  });
};
function speak(text,rate,cb){
  if(!('speechSynthesis' in window)){ cb(false); return }
  var vs=window.speechSynthesis.getVoices()||[];
  var v=vs.filter(function(x){return /^en[-_]GB/i.test(x.lang)})[0]
     || vs.filter(function(x){return /^en[-_]US/i.test(x.lang)})[0]
     || vs.filter(function(x){return /^en/i.test(x.lang)})[0];
  if(!v){ cb(false); return }
  window.speechSynthesis.cancel();
  var sents=text.match(/[^.?!]+[.?!]+/g)||[text], i=0;
  var keeper=setInterval(function(){ if(window.speechSynthesis.speaking) window.speechSynthesis.resume() },3000);
  cb(true);
  function next(){
    if(i>=sents.length){ clearInterval(keeper); var st=$('pst'); if(st) st.textContent='播放结束 · 题目已解锁'; return }
    var u=new SpeechSynthesisUtterance(sents[i++]);
    u.voice=v; u.rate=rate||1; u.pitch=1; u.onend=next; u.onerror=next;
    window.speechSynthesis.speak(u);
  }
  setTimeout(next,80);
}

/* ================= 长篇匹配 ================= */
function renderMatch(id){
  var m=null; B.matching.forEach(function(x){ if(x.id===id) m=x });
  if(!m){ $('app').innerHTML='<div class="card"><div class="empty-st"><p>找不到这篇。</p><button class="primary" onclick="location.href=\'#/bank\'">回题库</button></div></div>'; return }
  var qs=m.qs.map(function(q){
    var idx=-1; m.paras.forEach(function(p,i){ if(p.k===q.a) idx=i });
    var para=m.paras[idx]||{t:''};
    return {n:q.n,type:'detail',q:q.q,o:m.paras.map(function(p){return p.k}),a:idx,
      loc:para.t, locZh:'对应上方 ['+q.a+'] 段原文',
      why:'题干是对 '+q.a+' 段的同义改写。匹配题考的是改写识别，不是读懂全文。',
      trap:['干扰项是"话题相关但没有这个细节"的段落。只有题干里的独特名词能帮你确认。','另外有一段是不会被选中的，别硬凑。'],
      l2:'先划出题干里别的段落没有的独特名词，再回头扫段落。',guess:'把题干拆成 2–3 个"只有某段才会有"的关键词，然后逐段扫。扫不到就先跳过，做完剩下的再回来。'};
  });
  if(C.redoOnly){
    var wn=S.wrongList().filter(function(w){ return w.sid===m.id }).map(function(w){ return w.qn });
    var f=qs.filter(function(q){ return wn.indexOf(q.n)>=0 });
    if(f.length) qs=f;
    C.redoOnly=null;
  }
  var left='<div class="card"><h2 style="margin-bottom:8px">'+esc(m.title)+'</h2>';
  left+='<span class="pill">长篇匹配</span> <span class="pill a">10 题 × 7.1 分</span>';
  left+='<p class="sub" style="margin:10px 0">'+esc(m.note||'')+'</p>';
  m.paras.forEach(function(p){
    left+='<div style="display:flex;gap:10px;margin:9px 0"><b style="min-width:16px;color:var(--brand)">'+p.k+'</b><span style="font-size:14px;line-height:1.75">'+C.words(p.t)+'</span></div>';
  });
  left+='<div class="assist" style="margin-top:12px"><b>方法</b><br>不读全文。题干划 2–3 个独特名词 → 逐段扫 → 找到改写就选。卡 12 分钟，目标 8 题以上。</div></div>';
  practice({kind:'match', sid:m.id, pfx:'m', two:true, left:left, qs:qs, limit:720,
    note:'<span class="hint">每题 7.1 分 · 建议 12 分钟</span>'});
}

/* ================= 选词填空 ================= */
var CS={};
function renderCloze(id){
  var c=null; B.cloze.forEach(function(x){ if(x.id===id) c=x });
  if(!c){ $('app').innerHTML='<div class="card"><div class="empty-st"><p>找不到这篇。</p><button class="primary" onclick="location.href=\'#/bank\'">回题库</button></div></div>'; return }
  CS={c:c,ans:{}};
  var h='<div class="pbar"><span class="tm" id="tm">0:00</span><span class="hint">整套只值 35.5 分，考场上留最后 5 分钟</span>';
  h+='<span class="sp" style="flex:1"></span>';
  h+='<button class="sm" title="把选中的词收进生词本（S）" onclick="CET6.TOOLS.addSel()">收词</button>';
  h+='<button class="sm" title="翻译划选的整段（R）" onclick="CET6.TOOLS.translateSel()">译选中</button>';
  h+='<button class="sm" onclick="CET6.clozeClear()">清空</button>';
  h+='<button class="sm" onclick="CET6.TOOLS.kbd()">快捷键 <kbd>?</kbd></button></div>';
  h+='<div class="card"><h1>'+esc(c.title)+' <span class="pill">选词填空</span> <span class="pill a">10 题 × 3.55 分</span></h1>';
  h+='<p class="sub">'+esc(c.note||'')+'</p>';
  h+='<div class="card tight" style="background:var(--wnbg);border-color:var(--wnln)"><b>先说清楚：</b>这 10 题满分只有 35.5 分（约占全卷 5%），是全卷最便宜的题型。做不来就按词性蒙，把时间留给仔细阅读。</div>';
  h+='<div style="margin:12px 0;font-size:14px">';
  c.words15.forEach(function(w,i){ h+='<span style="display:inline-block;margin:3px 14px 3px 0"><b>'+letter(i)+'.</b> '+C.words(w)+'</span>' });
  h+='</div>';
  var parts=c.text.split(/\{\{(\d+)\}\}/), body='';
  for(var i=0;i<parts.length;i++){
    if(i%2===0){ body+=esc(parts[i]).replace(/\n\n/g,'</p><p style="margin:0 0 10px">').replace(/\n/g,'<br>') }
    else{
      var n=parts[i];
      var sel='<select onchange="CET6.clozePick('+n+',this.value)"><option value="">—</option>';
      c.words15.forEach(function(w){ sel+='<option value="'+w+'">'+w+'</option>' });
      sel+='</select>';
      body+='<b style="color:var(--brand)">['+n+']</b> '+sel+' ';
    }
  }
  h+='<div class="passage"><p style="margin:0">'+body+'</p></div>';
  h+='<div class="center" style="margin-top:16px"><button class="primary big" onclick="CET6.gradeCloze()">提交并查看解析</button></div>';
  h+='<div id="clz"></div></div>';
  $('app').innerHTML=h;
  T.startTimer(300);
}
C.clozePick=function(n,v){ CS.ans[n]=v };
C.clozeClear=function(){
  if(!CS.c) return;
  CS.ans={};
  var ss=document.querySelectorAll('#app select');
  for(var i=0;i<ss.length;i++) ss[i].value='';
  T.toast('已清空答案');
};
C.gradeCloze=function(){
  var el=T.elapsed(); T.stopTimer();
  var c=CS.c, ok=0, rows='';
  Object.keys(c.ans).forEach(function(n){
    var got=CS.ans[n], right=(got&&got===c.ans[n]);
    if(right) ok++;
    S.log('cloze', c.id, +n, '', right, got?1:0, Math.round(el*100));
    rows+='<tr><td>'+n+'</td><td class="n" style="color:'+(right?'#15803D':'#B91C1C')+'">'+(got||'未答')+'</td><td class="n" style="color:#15803D">'+esc(c.ans[n])+'</td>';
    rows+='<td class="n"><button class="sm" onclick="CET6.TOOLS.addWord(\''+esc(c.ans[n])+'\',\'（选词填空）\')">收词</button></td></tr>';
  });
  var h='<div class="card acc"><h2>'+ok+' / 10 · 折合 '+(Math.round(ok*3.55*10)/10)+' 分（满分 35.5）</h2>';
  h+='<p class="sub" style="margin:0">错得多不用焦虑——这题最吃词汇量，而它只值 35.5 分。真正该做的是：把错的词收进生词本，然后把考场上花在它身上的时间压到 5 分钟。</p></div>';
  h+='<div class="card"><table><thead><tr><th>空</th><th class="n">你的答案</th><th class="n">正确答案</th><th class="n">操作</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  $('clz').innerHTML=h;
  window.scrollTo(0,0);
  T.refreshBadges();
};

/* ================= 生词速记 ================= */
var VC={i:0, show:false, list:[], ex:{}};
function renderVocab(){
  var due=S.srsDue(), all=S.srsAll();
  var h='';
  if(due.length){
    var it=due[Math.min(VC.i, due.length-1)];
    VC.list=due;
    h+='<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
    h+='<h2 style="margin:0;flex:1">速记卡</h2>';
    h+='<span class="pill">'+due.length+' 个待复习</span>';
    h+='<span class="hint">第 '+(Math.min(VC.i,due.length-1)+1)+' / '+due.length+'</span></div>';
    h+='<p class="sub" style="margin-top:8px">先看词，回忆意思，再点开核对。<b>想不起来就点「忘了」</b>——诚实比假装记住有用。</p>';
    h+='<div class="fc'+(VC.show?'':' hide')+'" onclick="CET6.vcShow()" id="fc">';
    h+='<div class="fw">'+esc(it.w)+'</div>';
    if(it.c){
      h+='<div class="fctx">'+T.ctxHTML(it)+'</div>';
    }
    h+='<div class="fd">'+(it.d?esc(it.d):'<span style="color:var(--mut2)">（还没释义，点下面"补全释义"）</span>')+'</div>';
    h+='</div>';
    h+='<div class="center" style="margin:14px 0;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">';
    if(!VC.show) h+='<button class="primary big" onclick="CET6.vcShow()">显示释义</button>';
    else{
      h+='<button class="big" onclick="CET6.vcRate(0)">忘了</button>';
      h+='<button class="big" onclick="CET6.vcRate(1)">模糊</button>';
      h+='<button class="primary big" onclick="CET6.vcRate(2)">记得</button>';
    }
    h+='</div>';
    h+='<div class="center"><button class="sm" onclick="CET6.vcFill()">用 AI 补全释义</button> ';
    h+='<button class="sm" onclick="CET6.TOOLS.addSel()">收当前选中的词 (S)</button></div>';
    h+='</div>';
  }else{
    h+='<div class="card"><div class="empty-st"><div class="ic">◻</div><p>今天没有待复习的词。</p>';
    h+='<p class="hint">做阅读时遇到生词，选中它按 <kbd>S</kbd> 就能收进来。</p></div></div>';
  }

  /* 手动添加 */
  h+='<div class="card"><h3>手动加词</h3>';
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap">';
  h+='<input type="text" id="vw" placeholder="单词" style="flex:1;min-width:120px;width:auto">';
  h+='<input type="text" id="vd" placeholder="中文释义（可留空）" style="flex:2;min-width:160px;width:auto">';
  h+='<button class="primary" onclick="CET6.vcAdd()">加入</button></div></div>';

  /* 词表 */
  var ks=Object.keys(all);
  h+='<div class="card"><h3>生词本（'+ks.length+' 个）</h3>';
  h+='<p class="hint" style="margin:0 0 8px">做阅读时<b>划选生词</b>按 <kbd>S</kbd> 或点浮动条的「收词」，会自动把<b>那句话</b>存成例句。点「例句」展开看原文（词已高亮）和译文。</p>';
  if(!ks.length){
    h+='<p class="sub" style="margin:0">空空如也。做阅读时选中生词按 <kbd>S</kbd>，或在这里手动加。</p>';
  }else{
    h+='<table class="wtbl"><thead><tr><th>词</th><th>释义</th><th class="n">复习次数</th><th class="n">下次</th><th class="n">操作</th></tr></thead><tbody>';
    ks.sort(function(a,b){ return (all[a].add||0)-(all[b].add||0) });
    ks.forEach(function(k){
      var it=all[k];
      h+='<tr><td class="w">'+esc(it.w)+'</td><td>'+esc(it.d||'—')+'</td>';
      h+='<td class="n">'+(it.rep||0)+'</td><td class="n">'+esc(it.due)+'</td>';
      h+='<td class="n">'+(it.c?'<button class="sm" onclick="CET6.vcEx(\''+k+'\')">例句</button> ':'')+
         '<button class="sm danger" onclick="CET6.vcDel(\''+k+'\')">删</button></td></tr>';
      if(VC.ex[k] && it.c){
        h+='<tr class="exrow"><td colspan="5">'+T.ctxHTML(it)+'</td></tr>';
      }
    });
    h+='</tbody></table>';
  }
  h+='</div>';
  $('app').innerHTML=h;
}
C.vcEx=function(k){ VC.ex[k]=!VC.ex[k]; renderVocab() };
C.vcShow=function(){ VC.show=true; renderVocab() };
C.vcRate=function(g){
  var it=VC.list[Math.min(VC.i,VC.list.length-1)];
  if(!it) return;
  S.srsReview(it.w, g);
  VC.show=false;
  if(g===0) T.toast('明天再考你一次');
  else if(g===1) T.toast('间隔不变，很快再来');
  else T.toast('下次 '+ (S.srsAll()[it.w]?S.srsAll()[it.w].iv:1) +' 天后再见');
  VC.i=0;
  renderVocab();
};
C.vcAdd=function(){
  var w=$('vw').value.trim(), d=$('vd').value.trim();
  if(!w){ T.toast('先填个单词'); return }
  var isNew=S.srsAdd(w,d,'');
  T.toast(isNew?('已加入：'+w):('已经有了：'+w));
  renderVocab(); T.refreshBadges();
};
C.vcDel=function(k){ S.srsDel(k); renderVocab(); T.refreshBadges() };
C.vcFill=function(){
  var due=S.srsDue();
  if(!due.length){ T.toast('没有待复习的词'); return }
  if(!C.aiReady()){ T.toast('先在设置里配好 AI 接口'); return }
  var it=due[Math.min(VC.i,due.length-1)];
  T.toast('AI 查询中…');
  C.aiDefine(it.w, it.c).then(function(d){
    if(!d){ T.toast('没查到，检查 AI 配置'); return }
    var m=S.srsAll(); if(m[it.w]){ m[it.w].d=d; C.set('cet6_srs_v1',m) }
    T.toast('已补全：'+d);
    renderVocab();
  });
};

/* ================= 错题本 ================= */
function renderWrong(){
  var w=S.wrongList();
  var h='<div class="card"><h1>错题本</h1>';
  h+='<p class="sub">只有<b>做错过</b>的题会进来。同一道题连续做对 <b>2 次</b>自动毕业。蒙对的题不会进来——但它们其实更危险。</p></div>';
  if(!w.length){
    h+='<div class="card"><div class="empty-st"><div class="ic">✓</div><p>错题本是空的。去做一套题吧。</p><button class="primary" onclick="location.href=\'#/bank\'">去题库</button></div></div>';
    $('app').innerHTML=h; return;
  }
  /* 按套题分组 */
  var g={};
  w.forEach(function(x){ (g[x.sid]=g[x.sid]||[]).push(x) });
  Object.keys(g).forEach(function(sid){
    var items=g[sid], meta=setMeta(sid);
    h+='<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
    h+='<div style="flex:1;min-width:200px"><h3 style="margin:0">'+esc(meta.title)+'</h3>';
    h+='<div class="hint">'+esc(meta.kindName)+' · '+items.length+' 道错题</div></div>';
    if(meta.href) h+='<button class="primary sm" onclick="CET6.redo(\''+sid+'\',\''+meta.href+'\')">只重做这几道</button>';
    h+='<button class="sm" onclick="location.href=\''+meta.href+'\'">整套重做</button>';
    h+='<button class="sm danger" onclick="CET6.wrongClear(\''+sid+'\')">清空</button></div>';
    h+='<ul class="list" style="margin-top:6px">';
    items.sort(function(a,b){return a.qn-b.qn}).forEach(function(x){
      var rs=get('cet6_reason_v1',{})[sid+':'+x.qn];
      h+='<li><span class="tag">第 '+x.qn+' 题</span><span class="g">错 '+x.n+' 次'+(rs?(' · 错因：'+esc(rs)):'')+'</span>';
      h+='<span class="hint">'+(x.fixed?('已连对 '+x.fixed+' 次'):'')+'</span></li>';
    });
    h+='</ul></div>';
  });
  h+='<div class="card tight"><b>怎么用：</b>错题只看一遍没用。重做时如果还是错，说明你改的是<b>答案记忆</b>而不是<b>方法</b>——回到解析里看「定位 → 排除 → 确认」那三步。</div>';
  $('app').innerHTML=h;
}
function setMeta(sid){
  var t=sid, kindName='', href='';
  B.readings.forEach(function(x){ if(x.id===sid){
    t=x.title;
    if(x.vexam){ kindName=(x.vexam==='cet6'?'六级词汇文章':'考研词汇文章'); href='#/v/read/'+sid }
    else { kindName='仔细阅读'; href='#/read/'+sid }
  } });
  B.listening.forEach(function(x){ if(x.id===sid){ t=x.title; kindName=(x.kind==='lecture'?'讲座':(x.kind==='passage'?'篇章':'长对话')); href='#/listen/'+sid } });
  B.matching.forEach(function(x){ if(x.id===sid){ t=x.title; kindName='长篇匹配'; href='#/match/'+sid } });
  B.cloze.forEach(function(x){ if(x.id===sid){ t=x.title; kindName='选词填空'; href='#/cloze/'+sid } });
  var im=get('cet6_imported',[]); im.forEach(function(x){ if(x.id===sid){ t=x.title||sid; kindName='导入'; href='#/read/'+sid } });
  return {title:t, kindName:kindName||sid, href:href};
}
C.redo=function(sid,href){
  C.redoOnly=sid;
  /* 重做错题时自动把提示开到「中 · 定位」——错题是用来学会的，不是用来再考一次的。
     只在你当前档位低于 2 时才提，不覆盖你主动调高的设置。 */
  if((C.settings.assist||0) < 2){ C.settings.assist=2; C.saveSettings(); T.toast('错题重做：辅助提示已开到「中 · 定位」') }
  if(location.hash===href) route(); else location.href=href;
};
C.wrongClear=function(sid){ S.wrongClear(sid); route(); T.refreshBadges() };

/* ================= 数据分析 ================= */
function renderStats(){
  var e=S.estimate(), t=S.tot();
  var h='';
  h+='<div class="card"><div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">';
  if(e.score!=null){
    h+=T.ring(e.score/710, 120, e.score, '/ 710');
  }else{
    h+=T.ring(0,120,'—','未测评');
  }
  h+='<div style="flex:1;min-width:240px"><h1>数据分析</h1>';
  if(e.score!=null){
    var gap=425-e.score;
    h+='<p class="sub">客观题 '+e.obj+' 分 + 写译按全国平均 '+e.write+' 分估。已测 '+e.measured+' / 6 个题型。</p>';
    h+= gap>0 ? '<div class="pill a">距 425 还差 '+gap+' 分</div>' : '<div class="pill g">已越过 425</div>';
  }else{
    h+='<p class="sub">还没有答题记录。做完任意一套题就能看到预估分。</p>';
  }
  h+='</div></div>';
  h+='<div class="grid" style="margin-top:14px">';
  h+='<div class="mc"><div class="l">累计做题</div><div class="v">'+t.tot+'</div></div>';
  h+='<div class="mc"><div class="l">总正确率</div><div class="v">'+(t.tot?pct(t.rate)+'%':'—')+'</div></div>';
  h+='<div class="mc"><div class="l">今日</div><div class="v">'+S.day().q+'</div><div class="u">目标 '+S.goal()+'</div></div>';
  h+='<div class="mc"><div class="l">连续打卡</div><div class="v">'+S.streak()+'</div><div class="u">天</div></div>';
  h+='</div></div>';

  /* 提示依赖度：有多少分是靠提示拿的 */
  var hs=S.hintStat();
  if(hs.n){
    h+='<div class="card"><h3>提示依赖度</h3>';
    h+='<p class="sub" style="margin-top:0">开了提示才做对的题，<b>不属于你的真实水平</b>。这个数越低越好。</p>';
    h+='<div class="grid" style="margin-top:12px">';
    h+='<div class="mc"><div class="l">没看提示的正确率</div><div class="v">'+
       (hs.clean.rate==null?'—':pct(hs.clean.rate)+'%')+'</div><div class="u">'+hs.clean.tot+' 题</div></div>';
    h+='<div class="mc"><div class="l">开了提示的正确率</div><div class="v">'+
       (hs.helped.rate==null?'—':pct(hs.helped.rate)+'%')+'</div><div class="u">'+hs.helped.tot+' 题</div></div>';
    h+='<div class="mc"><div class="l">平均提示级别</div><div class="v">'+hs.avg.toFixed(2)+'</div><div class="u">0 完全没用　3 全开</div></div>';
    h+='</div>';
    if(hs.clean.rate!=null && hs.helped.rate!=null && hs.helped.tot>=3){
      var d=hs.helped.rate-hs.clean.rate;
      h+='<div class="assist" style="margin-top:12px"><b>怎么读这个数</b><br>';
      h+= d>0.25
        ? ('开提示后正确率提高了 '+pct(d)+' 个百分点，说明你<b>方法还没内化</b>——现在靠提示能懂，不代表考场上能想起来。这几类题要回到原文把依据句划出来，隔天不开提示重做。')
        : ('开提示和不开提示的正确率差不多（差 '+pct(Math.abs(d))+' 个点），说明你的问题<b>不在方法而在基本功</b>——多半是句子没拆开或词汇卡住，提示帮不上忙。');
      h+='</div>';
    }
    var ad=S.advise();
    if(ad) h+=adviseHTML(ad);
    h+='</div>';
  }

  /* 题型分解 */
  h+='<div class="card"><h3>分丢在哪（按真题分值折算）</h3>';
  if(e.score==null){
    h+='<p class="sub" style="margin:0">先去做题。</p>';
  }else{
    h+='<table><thead><tr><th>题型</th><th class="n">做过</th><th class="n">正确率</th><th class="n">折算得分</th><th class="n">满分</th><th style="width:110px">占比</th></tr></thead><tbody>';
    e.parts.forEach(function(p){
      h+='<tr><td>'+p.n+'<span class="pill n" style="margin-left:6px">'+p.sec+'</span>'+(p.measured?'':'<span class="pill a" style="margin-left:4px">未测</span>')+'</td>';
      h+='<td class="n">'+p.tot+'</td>';
      h+='<td class="n">'+(p.rate==null?'—':pct(p.rate)+'%')+'</td>';
      h+='<td class="n">'+(p.got==null?'—':p.got)+'</td>';
      h+='<td class="n">'+p.max+'</td>';
      h+='<td><div class="bar"><i style="width:'+(p.got==null?0:pct(p.got/p.max))+'%"></i></div></td></tr>';
    });
    h+='</tbody></table>';
    h+='<p class="hint" style="margin-top:10px">没测过的题型按你的总正确率估算，标了「未测」——想让预估更准，就把每个题型都做一遍。</p>';
  }
  h+='</div>';

  /* 错因 */
  var rs=get('cet6_reason_v1',{}), rc={};
  Object.keys(rs).forEach(function(k){ rc[rs[k]]=(rc[rs[k]]||0)+1 });
  var rk=Object.keys(rc);
  h+='<div class="card"><h3>错因分布</h3>';
  if(!rk.length){
    h+='<p class="sub" style="margin:0">还没有标记过错因。做完题在每道错题下面点一下错因，这里会告诉你该补什么。</p>';
  }else{
    var max=0; rk.forEach(function(k){ if(rc[k]>max) max=rc[k] });
    rk.sort(function(a,b){ return rc[b]-rc[a] });
    rk.forEach(function(k){
      h+='<div style="margin:7px 0"><div style="display:flex;font-size:13.5px"><span>'+esc(k)+'</span><span style="margin-left:auto" class="num">'+rc[k]+'</span></div>';
      h+='<div class="bar"><i class="wn" style="width:'+pct(rc[k]/max)+'%"></i></div></div>';
    });
    h+='<div class="assist" style="margin-top:12px"><b>怎么补</b><br>';
    h+='<b>定位错</b> → 练扫读：题干划独特名词，回原文扫，别通读。<br>';
    h+='<b>句子没拆开</b> → 练长难句：先找主句谓语动词，再挂修饰成分，每天拆 5 句。<br>';
    h+='<b>词汇卡住</b> → 才需要背单词，而且只背真题里出现的生词。';
    h+='</div>';
  }
  h+='</div>';

  /* 打卡 */
  var heat=S.heat(70);
  h+='<div class="card"><div style="display:flex;align-items:center;gap:10px"><h3 style="margin:0;flex:1">打卡</h3>';
  h+='<span class="hint">连续 '+S.streak()+' 天 · 近 10 周</span></div>';
  h+='<div class="heat" style="margin-top:12px">';
  heat.forEach(function(x){
    var lv = x.q===0?'':(x.q<10?' l1':(x.q<25?' l2':(x.q<45?' l3':' l4')));
    h+='<i class="'+lv.trim()+'" title="'+x.d+' · '+x.q+' 题"></i>';
  });
  h+='</div>';
  h+='<p class="hint" style="margin-top:10px">颜色越深题量越大。备考期最怕的不是某天做得少，是<b>连续几天不做</b>。</p></div>';

  h+='<div class="card"><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><div style="flex:1;min-width:200px"><h3 style="margin:0">每日目标</h3><div class="hint">现在 '+S.goal()+' 题 / 天</div></div>';
  [15,30,50,80].forEach(function(n){
    h+='<button class="sm'+(S.goal()===n?' primary':'')+'" onclick="CET6.setGoal('+n+')">'+n+' 题</button>';
  });
  h+='</div></div>';
  $('app').innerHTML=h;
}
C.setGoal=function(n){ S.setGoal(n); renderStats(); T.toast('每日目标改为 '+n+' 题') };

/* ================= 今日新词 ================= */
/* 每天从文章里收下 N 个生词（默认 50），当天就能在这把它们练一遍：
   看原句 → 要一份"怎么记"的助记 → 自己填一遍空（运用）→ 自评进 SRS */
function renderWords(){
  var S=C.STATS;
  var goal=S.wordGoal(), words=S.dayWords(), m=S.srsAll();
  var list=[];
  words.forEach(function(w){ if(m[w]) list.push(m[w]) });
  var done  = words.length, train=S.trainToday(), practiced=0;
  words.forEach(function(w){ if(train[w] && train[w].n>0) practiced++ });

  var h='<div class="card"><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">';
  h+='<div style="flex:0 0 auto">'+T.ring(done/goal, 118, done, '/ '+goal)+'</div>';
  h+='<div style="flex:1;min-width:220px">';
  h+='<h1 style="margin:0 0 6px">今日新词</h1>';
  h+='<p class="sub" style="margin:0">今天已经从文章里收下 <b>'+done+'</b> 个生词，其中 <b>'+practiced+'</b> 个练过填空。'
   + '目标是 '+goal+' 个——读完一篇就把不认识的词按 <kbd>Tab</kbd> 收割一遍。</p>';
  h+='<div class="chips" style="margin-top:10px">';
  [20,30,50,80].forEach(function(n){
    h+='<span class="chip'+(goal===n?' on':'')+'" onclick="CET6.setWordGoal('+n+')">每天 '+n+' 个</span>';
  });
  h+='</div></div></div>';
  h+='<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">';
  h+='<button class="primary" onclick="location.href=\'#/bank\'">去文章里继续收</button> ';
  h+='<button onclick="CET6.TOOLS.practiceAll()">全部练一遍</button> ';
  h+='<button onclick="CET6.fillAllMem()">给全部词要 AI 助记</button>';
  var st=C.aiStatus();
  h+='<span class="hint" style="align-self:center'+(st.ok?'':';color:#B91C1C')+'">'+ esc(st.t) +'</span>';
  h+='<button class="sm" onclick="CET6.aiTest()">自检一下</button>';
  h+='</div></div>';

  if(!list.length){
    h+='<div class="card"><div class="empty-st"><p>今天还没收词。</p>'
     + '<p class="hint">读任意一篇文章，遇到不认识的单词<b>选中它按 <kbd>Tab</kbd></b>，'
     + '原文例句会自动跟着存进来。每篇六级阅读大约能收 10–20 个。</p>'
     + '<button class="primary" onclick="location.href=\'#/bank\'">挑一篇文章开始</button></div></div>';
    $('app').innerHTML=h; return;
  }

  h+='<div class="card"><h3>今天收的 '+list.length+' 个词</h3>';
  h+='<p class="hint" style="margin:0 0 10px">每个词下面三件事：<b>AI 助记</b>（怎么记住）、<b>练填空</b>（会不会用）、<b>自评</b>（进复习计划）。</p>';
  h+='<table class="wtbl"><thead><tr><th>词</th><th>释义与出处</th><th class="n">操作</th></tr></thead><tbody>';
  list.forEach(function(it, i){
    h+='<tr><td class="w">'+esc(it.w)+'</td><td>';
    h+='<div>'+esc(it.d||'（还没释义）')+'</div>';
    if(it.c) h+=T.ctxHTML(it);
    h+='<div id="mem_'+it.w+'"></div>';
    h+='<div id="tr_'+it.w+'"></div>';
    h+='</td><td class="n" style="white-space:nowrap">';
    h+='<div style="display:flex;flex-direction:column;gap:4px;align-items:stretch">';
    h+='<button class="sm" onclick="CET6.aiMemory(\''+it.w+'\')">AI 助记</button>';
    h+='<button class="sm" onclick="CET6.trainWord(\''+it.w+'\')">练填空</button>';
    h+='<button class="sm" onclick="CET6.gradeWord(\''+it.w+'\',0)">忘了</button>';
    h+='<button class="sm" onclick="CET6.gradeWord(\''+it.w+'\',1)">模糊</button>';
    h+='<button class="sm" onclick="CET6.gradeWord(\''+it.w+'\',2)">记得</button>';
    h+='</div></td></tr>';
  });
  h+='</tbody></table>';
  var st=S.trainToday(); var okN=0, nN=0;
  Object.keys(st).forEach(function(k){ okN+=st[k].ok; nN+=st[k].n });
  if(nN) h+='<p class="hint" style="margin-top:10px">今天填空练了 '+nN+' 次，对 '+okN+' 次（'+Math.round(okN/nN*100)+'%）。</p>';
  h+='</div>';
  if(done>=goal){
    h+='<div class="card acc"><b>今日目标达成：'+done+' / '+goal+'</b>'
     + '<div class="hint" style="margin-top:6px">明天继续。间隔复习已经排好了——明天的「生词速记」里会出现今天标「忘了」和「模糊」的词。</div></div>';
  }
  h+='<div class="card"><h3>词收完了，句子还不懂？</h3>'
   + '<p class="sub" style="margin:0">生词本按「词」收，摘抄本按「段」收。<b>长难句别当场硬啃</b>——'
   + '读文章时选中它点「存摘抄」，攒够了回来一起处理：AI 拆主干和修饰成分，再把这段的核心词批量收进生词本。</p>'
   + '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
   + '<button onclick="location.href=\'#/notes\'">打开摘抄本'+(C.NOTE.count()?('（'+C.NOTE.count()+' 段）'):'')+'</button>'
   + '<button onclick="CET6.TOOLS.queryOpen()">查一个词 / 一段话</button>'
   + '<span class="hint">快捷键 <kbd>/</kbd> 随时叫出来</span></div></div>';
  $('app').innerHTML=h;
}
C.setWordGoal=function(n){ S.setWordGoal(n); renderWords(); T.toast('每日生词目标改为 '+n) };

/* ================= 摘抄本 ================= */
/* 生词本按「词」收，摘抄本按「段」收。
   一段存下来之后能做的事：逐句对照 / AI 拆句子 / 把这段的核心词一次收进生词本 */
function noteDate(ts){
  var d = new Date(ts||0);
  return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
}
function renderNotes(){
  var list = C.NOTE.all(), h='';
  var coreAll = 0;
  h+='<div class="card"><h1 style="margin:0 0 6px">摘抄本</h1>';
  h+='<p class="sub" style="margin:0">读到值得回看的段落或长难句，<b>选中它 → 点「存摘抄」</b>（或按 <kbd>/</kbd> 查完再存），就落在这里。'
   + '回来可以逐句对照、让 AI 拆句子，或者把这段里的核心词一次收进生词本。</p>';
  h+='<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">';
  h+='<button class="primary" onclick="location.href=\'#/bank\'">去文章里挑一段</button> ';
  h+='<button onclick="CET6.TOOLS.queryOpen()">手动查 / 录一段</button> ';
  if(list.length) h+='<button onclick="CET6.noteClear()">清空</button>';
  h+='<span class="hint">共 '+list.length+' 段</span></div></div>';

  if(!list.length){
    h+='<div class="card"><div class="empty-st"><p>还没有摘抄。</p>'
     + '<p class="hint">做阅读时遇到读不懂的长句，别硬扛：<b>选中它 → 存摘抄</b>，'
     + '回头让 AI 把主干和修饰成分拆开，再把里面的核心词收进生词本。</p></div></div>';
    $('app').innerHTML=h; return;
  }

  list.forEach(function(it){
    var ws = C.NOTE.core(it.t);
    coreAll += ws.length;
    h+='<div class="card note">';
    h+='<div class="notehd"><span class="hint">'+(it.src?esc(it.src):'手动录入')+' · '+noteDate(it.ts)+'</span>';
    h+='<span style="flex:1"></span>';
    h+='<button class="sm" onclick="CET6.noteCore('+it.ts+')">核心词 '+ws.length+'</button> ';
    h+='<button class="sm" onclick="CET6.noteExplain('+it.ts+')">AI 讲这段</button> ';
    h+='<button class="sm" onclick="CET6.noteCopy('+it.ts+')">复制</button> ';
    h+='<button class="sm" onclick="CET6.noteDel('+it.ts+')">删除</button></div>';
    h+='<div class="notebody">'+C.sentHTML(it.t, it.zh||'')+'</div>';
    if(it.zh) h+='<div class="notezh">'+esc(it.zh)+'</div>';
    h+='<div id="nt_'+it.ts+'"></div>';
    h+='</div>';
  });
  if(coreAll) h+='<p class="hint" style="padding:0 4px">这些段落一共覆盖 '+coreAll+' 个核心词，点每段的「核心词」可以挑着收。</p>';
  $('app').innerHTML=h;
}
C.noteDel=function(ts){ C.NOTE.del(ts); renderNotes(); T.toast('已删除') };
C.noteClear=function(){
  if(!confirm('清空摘抄本？本地和云端都会清掉。')) return;
  C.NOTE.clear(); renderNotes();
  if(C.CLOUD && C.CLOUD.onNote) C.CLOUD.onNote();
  T.toast('摘抄本已清空');
};
C.noteCopy=function(ts){
  var it=C.NOTE.get(ts); if(!it) return;
  try{ navigator.clipboard.writeText(it.t); T.toast('已复制') }catch(e){ T.toast('复制失败，手动选中吧') }
};
/* 核心词：先列出来，点哪个收哪个（一键全收也行） */
C.noteCore=function(ts){
  var it=C.NOTE.get(ts), box=$('nt_'+ts); if(!it||!box) return;
  if(box.getAttribute('data-open')==='1'){ box.innerHTML=''; box.setAttribute('data-open',''); return }
  var ws=C.NOTE.core(it.t);
  box.setAttribute('data-open','1');
  if(!ws.length){ box.innerHTML='<div class="hint">这段里没有核心词表里的词。</div>'; return }
  var h='<div class="wcrow">';
  ws.forEach(function(x){
    h+='<span class="wc" onclick="CET6.noteTake('+ts+',\''+x.w+'\')" title="收进生词本">'+esc(x.w)+'<i>'+(x.f===1?'高':(x.f===2?'中':'低'))+'</i></span>';
  });
  h+='</div><div style="margin-top:8px"><button class="sm primary" onclick="CET6.noteTakeAll('+ts+')">这 '
   + ws.length + ' 个全收进生词本</button></div>';
  box.innerHTML=h;
};
C.noteTake=function(ts,w){
  var it=C.NOTE.get(ts); if(!it) return;
  T.addWord(String(w).toLowerCase(), C.lookup(w)||'', it.t.slice(0,180));
};
C.noteTakeAll=function(ts){
  var it=C.NOTE.get(ts); if(!it) return;
  var ws=C.NOTE.core(it.t), n=0;
  ws.forEach(function(x){ if(T.addWord(String(x.w).toLowerCase(), C.lookup(x.w)||'', it.t.slice(0,180))) n++ });
  T.toast(n?('收进 '+n+' 个新词'):'这些词都已经在生词本里了');
};
/* AI 拆句子：主干 / 修饰 / 译文 / 生词 */
C.noteExplain=function(ts){
  var it=C.NOTE.get(ts), box=$('nt_'+ts); if(!it||!box) return;
  if(!C.aiReady()){
    box.innerHTML='<div class="tipbox">没配 AI 接口，拆不了句子。'
      + '可以去 <a href="#/settings">设置</a>里填参数，或者先用上面的「核心词」把生词收走。</div>';
    return;
  }
  if(box.getAttribute('data-open')==='1' && box.innerHTML.indexOf('AI 正在')<0){
    box.innerHTML=''; box.setAttribute('data-open',''); return;
  }
  box.setAttribute('data-open','1');
  box.innerHTML='<div class="hint">AI 正在拆…</div>';
  C.aiExplain(it.t).then(function(o){
    var el=$('nt_'+ts); if(!el) return;
    if(!o){ el.innerHTML='<div class="tipbox"><b>AI 没返回内容。</b>'+esc(C.aiErrText(C.aiLastErr))+'</div>'; return }
    if(o.zh && !it.zh){ it.zh=o.zh; C.NOTE.all().forEach(function(x){ if(x.ts===ts) x.zh=o.zh }); C.set('cet6_notes_v1', C.NOTE.all()) }
    var h='';
    if(o.main) h+='<div class="qrow"><b>主干</b><span>'+esc(o.main)+'</span></div>';
    if(o.mods && o.mods.length) h+='<div class="qrow"><b>修饰</b><span>'+o.mods.map(esc).join('<br>')+'</span></div>';
    if(o.zh) h+='<div class="qrow"><b>译文</b><span>'+esc(o.zh)+'</span></div>';
    if(o.words && o.words.length){
      h+='<div class="qrow"><b>生词</b><span>';
      o.words.forEach(function(x){
        var w=String(x.w||'').toLowerCase().replace(/[^a-z '-]/g,'');
        h+='<span class="wc" onclick="CET6.TOOLS.addWord(\''+esc(w)+'\',\''+esc(x.zh||'')+'\')">'+esc(x.w)+'</span> ';
      });
      h+='<br><span class="hint">点词收进生词本，释义就是它在这句里的意思。</span></span></div>';
    }
    h+='<div class="hint" style="margin-top:6px">AI 只当参考，回原文再对一遍。</div>';
    el.innerHTML=h;
    if(C.CLOUD && C.CLOUD.onNote) C.CLOUD.onNote();
  });
};

/* 用原文例句挖空：没有 AI 也能练，这是关键 */
function blankOf(it){
  var en=String(it.c||''), key=String(it.hl||it.w||'');
  if(!en || !key) return null;
  var re=new RegExp('\\b'+key.replace(/[-]/g,'\\-')+'\\b','i');
  var mt=en.match(re);
  if(!mt) return null;
  return {sent: en.replace(re,'________'), ans: mt[0], zh: it.cz||''};
}
/* 练填空：优先用 AI 造的例句，没有就用原文那句 */
C.trainWord=function(w){
  var S=C.STATS, m=S.srsAll(), it=m[w]; if(!it) return;
  var box=$('tr_'+w); if(!box) return;
  if(box.getAttribute('data-open')==='1'){ box.innerHTML=''; box.setAttribute('data-open',''); return }
  var mem=S.mem(w), ai=(mem&&mem.txt&&mem.txt.charAt(0)==='{')?tryJSON(mem.txt):null;
  var b = (ai && ai.fill) ? {sent:ai.fill, ans:(String(it.w)), zh:ai.fillZh||''} : blankOf(it);
  if(!b){ box.innerHTML='<div class="tipbox">这个词没有可用的例句，先去生词本给它补一句。</div>'; return }
  box.setAttribute('data-open','1');
  box.innerHTML='<div class="train"><div class="th">把它填回去</div>'
    +'<div class="ten">'+esc(b.sent)+'</div>'
    +(b.zh?('<div class="tzh">'+esc(b.zh)+'</div>'):'')
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">'
    +'<input type="text" id="tw_'+w+'" placeholder="填这个词的正确形式" style="width:auto;flex:1;min-width:130px" onkeydown="if(event.key===\'Enter\')CET6.checkWord(\''+w+'\')">'
    +'<button class="sm primary" onclick="CET6.checkWord(\''+w+'\')">对答案</button></div>'
    +'<div id="trs_'+w+'" class="hint" style="margin-top:6px"></div></div>';
  var el=$('tw_'+w); if(el) el.focus();
};
function tryJSON(s){ try{ return JSON.parse(s) }catch(e){ return null } }
C.checkWord=function(w){
  var S=C.STATS, m=S.srsAll(), it=m[w]; if(!it) return;
  var el=$('tw_'+w), out=$('trs_'+w); if(!el||!out) return;
  var mem=S.mem(w), ai=(mem&&mem.txt)?tryJSON(mem.txt):null;
  var b = (ai && ai.fill) ? {ans:(ai.ans||it.w)} : (blankOf(it)||{ans:it.w});
  var val=String(el.value||'').trim().toLowerCase();
  var ans=String(b.ans||it.w).toLowerCase();
  var ok = val===ans || val===String(it.w).toLowerCase();
  S.trainHit(w, ok);
  out.innerHTML = ok
    ? '<b style="color:#15803D">对了。</b>'+esc(it.w)+' —— 记住它的<b>搭配对象</b>，比只记中文意思管用。'
    : '<b style="color:#B91C1C">不对。</b>正确写法是 <b>'+esc(b.ans||it.w)+'</b>。注意词形（单复数 / 时态 / 词尾变化）也要写出来。';
};
C.aiMemory=function(w){
  var S=C.STATS, m=S.srsAll(), it=m[w]; if(!it) return;
  var box=$('mem_'+w); if(!box) return;
  if(box.getAttribute('data-open')==='1'){ box.innerHTML=''; box.setAttribute('data-open',''); return }
  var cached=S.mem(w);
  if(cached){ box.setAttribute('data-open','1'); box.innerHTML=memHTML(w, cached.txt); return }
  if(!C.aiReady()){ T.toast('先在设置里配好 AI 接口'); box.innerHTML='<div class="tipbox">'
    +'没配 AI 接口。可以去 <a href="#/settings">设置</a> 里填参数，或者先点「练填空」——' 
    +'用原文那句挖空自己填，不依赖 AI 也能练运用。</div>'; box.setAttribute('data-open','1'); return }
  box.setAttribute('data-open','1');
  box.innerHTML='<div class="tipbox">正在问 AI 怎么记这个词…</div>';
  C.aiAssist(w, it.c).then(function(o){
    var el=$('mem_'+w); if(!el) return;
    if(!o){ el.innerHTML='<div class="tipbox"><b>AI 没返回内容。</b>'+esc(C.aiErrText(C.aiLastErr))
    + '<br>去 <a href="#/settings">设置</a> 里点「自检一下」，它会把具体原因说出来（Key / 模型名 / 余额 / 跨域）。</div>'; return }
    var txt=JSON.stringify(o);
    S.memSet(w, txt);
    if(C.CLOUD && C.CLOUD.onMemory) C.CLOUD.onMemory(w, txt);
    el.innerHTML=memHTML(w, txt);
  });
};
function memHTML(w, txt){ return C.memCard(w, txt) }
C.fillAllMem=function(){
  if(!C.aiReady()){ T.toast('先在设置里配好 AI 接口'); return }
  var ws=S.dayWords();
  var i=0;
  (function step(){
    while(i<ws.length && S.mem(ws[i])) i++;
    if(i>=ws.length){ T.toast('这些词的助记都有了'); return }
    var w=ws[i++];
    C.aiMemory(w);
    setTimeout(step, 700);
  })();
};
/* 全部练一遍：挨个展开填空框，手动确认 */
T.practiceAll=function(){
  var ws=S.dayWords(), i=0;
  (function step(){
    while(i<ws.length && $('tr_'+ws[i]) && $('tr_'+ws[i]).getAttribute('data-open')==='1') i++;
    if(i>=ws.length){ T.toast('今天的词都展开了，逐个填吧'); return }
    var w=ws[i++];
    C.trainWord(w);
    var el=$('tw_'+w); if(el) el.focus();
  })();
};
C.gradeWord=function(w, g){
  S.srsReview(w, g);
  T.toast(['标为「忘了」，明天再来一遍','标为「模糊」，间隔不变','标为「记得」，往后排期'][g]);
  T.refreshBadges();
};

/* ================= 找答案手册 ================= */
/* 这是"怎么练"，不是"怎么考"：把常见做题方法摊开写清楚，
   配上站内对应的练习入口，看完立刻能上手 */
function renderMethod(){
  var SV=C.SOLVE||{};
  var h='<div class="card"><h1>找答案手册</h1>'
       +'<p class="sub">不读懂也能做对的一半靠方法。这里把常见的做题套路整理成能照着做的步骤，'
       +'每条配了站内入口——看完直接练，别光记住。</p></div>';

  h+='<div class="card"><h3>三条铁律（所有题型通用）</h3><ul class="list">';
  h+='<li><span class="tag">1</span><span class="g"><b>先题后文</b><div class="d">别先通读。先读题干，圈出定位词（<b>数字、大写、人名地名、专有名词</b>），再回原文扫。</div></span></li>';
  h+='<li><span class="tag">2</span><span class="g"><b>同义替换才是答案</b><div class="d">正确项几乎不会照抄原文。选项和原文一模一样时，多半是干扰项；换了说法的那个才是。</div></span></li>';
  h+='<li><span class="tag">3</span><span class="g"><b>绝对词慎选</b><div class="d">出现「完全 / 彻底 / 绝对 / 所有 / 必然 / 必须 / 只能」先打个问号；「可能 / 通常 / 部分 / 一定程度上」更常被设为答案。</div></span></li>';
  h+='</ul></div>';

  h+='<div class="card"><h3>按题型怎么打</h3><ul class="list">';
  [['仔细阅读（142 分的大头）',
    '① 读题干圈定位词，<b>不读选项</b>（避免被带偏）；② 回原文找这个词所在的句子，答案就在这一句或它的前一句/后一句，不跨段；③ 拿选项跟定位句逐词比对。全程控制在 10 分钟内。'],
   ['长篇匹配（10 题 / 71 分）',
    '纯做连连看，<b>不用读懂</b>。题干圈数字、大写、专有名词，回段落里扫关键词复现。<b>一段可以匹配多道题</b>，优先做有特殊标志的，剩下的最后排。'],
   ['选词填空（每题 3.55 分）',
    '性价比最低，<b>放最后</b>。先给 15 个选项标词性，再看空格缺什么成分（缺主语宾语→名词，缺谓语→动词，缺修饰→形容词/副词），固定搭配直接选。不会就跳。'],
   ['听力（讲座是提分最快的一块）',
    '六级听力的正确项<b>几乎都是同义替换</b>，原文原词反而是干扰。答案常出现在<b>转折词之后</b>（but / however / actually）和对话后半段。听不出来立刻放弃，别拖到下一题。'],
   ['写译（142 分，模板化正在失灵）',
    '翻译遇到不会的词<b>不要空着</b>，用近义词或解释绕过去，写满就有分。写作要有自己的例子和话题词库，别套万能模板——评分对模板化表达越来越严。']
  ].forEach(function(x){
    h+='<li><span class="g"><b>'+x[0]+'</b><div class="d">'+x[1]+'</div></span></li>';
  });
  h+='</ul></div>';

  h+='<div class="card"><h3>五种题型的针对性打法</h3>';
  var types=[['main','主旨题'],['detail','细节题'],['meaning','词义句意题'],['attitude','态度题'],['infer','推断题']];
  types.forEach(function(t){
    var lines=(SV.methodOf?SV.methodOf(t[0]):[])||[];
    h+='<div style="margin-bottom:12px"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">';
    h+='<span class="qbadge k-'+t[0]+'">'+t[1]+'</span></div><ul class="list" style="margin-top:6px">';
    lines.forEach(function(s,i){
      h+='<li><span class="tag">'+(i+1)+'</span><span class="g">'+s+'</span></li>';
    });
    h+='</ul></div>';
  });
  h+='</div>';

  h+='<div class="card"><h3>考场急救：完全读不懂时的顺序</h3>'
   + '<p class="hint" style="margin:0 0 10px">这是<b>概率</b>不是能力——用它是为了不空题，别把它当方法练。真要提分还是回第 1 步。</p><ul class="list">';
  [['先砍极端项','一句话说死的（完全 / 绝不 / 所有）通常不是答案。'],
   ['找一对相反的选项','两个意思相反时，答案多半在它俩里——二选一，命中率从 25% 变 50%。'],
   ['挑"留有余地"的那个','可能、通常、部分这类被设为正确项的概率更高。'],
   ['贴主旨的那个','选项里跟全文主题最贴、概括性最强的优先。'],
   ['看 ABCD 分布','同一套里某个字母选得特别多时，剩下不会的题可以补最少的那个。']
  ].forEach(function(x,i){
    h+='<li><span class="tag">'+(i+1)+'</span><span class="g"><b>'+x[0]+'</b><div class="d">'+x[1]+'</div></span></li>';
  });
  h+='</ul>';
  h+='<div class="tipbox" style="margin-top:10px"><b>别高估这套东西。</b>'
   + '本站题库是自编的，干扰项为了教学目的写得比较明显，上面这些规律<b>在这里实测能蒙对九成</b>，'
   + '真题上大致只有一半左右。它只是「不空题」的保底手段，不是提分方法——'
   + '真想要那 142 分，还是回到第 1 步：先题后文，在定位句里找同义替换。</div>';
  h+='<div style="margin-top:12px"><button class="primary" onclick="location.href=\'#/bank\'">去题库挑一篇练这套流程</button></div></div>';

  h+='<div class="card"><h3>在本站怎么把这套练成肌肉记忆</h3><ul class="list">';
  h+='<li><span class="g"><b>「找答案」按钮（<kbd>F</kbd>）</b><div class="d">每道题都有：第 1 步讲题型方法，第 2 步给你题干里的定位词，第 3 步标出可以先排除的选项，第 4 步才是"按规律猜"。<b>它不直接报答案</b>。</div></span></li>';
  h+='<li><span class="g"><b>辅助提示分四档</b><div class="d">顶栏「辅助」可调：模拟考试 / 只给方向 / 加定位 / 连解析。建议第一遍开「强」把方法看明白，隔天调回「模拟考试」重做同一篇。</div></span></li>';
  h+='<li><span class="g"><b>划词翻译三档</b><div class="d">顶栏「划词翻译」：完全不显示（硬读）/ 只给词义 / 词义+整句。读不动的句子用句尾的<b>「译」</b>只看那一句，别一上来就全文开译文。</div></span></li>';
  h+='<li><span class="g"><b>划选 → 浮动条</b><div class="d">划一个词能收进生词本（原文例句自动带上）；划一整段点「翻译」做中英对照，点「存摘抄」放进摘抄本。<kbd>Tab</kbd> 收词，<kbd>R</kbd> 整段翻译。</div></span></li>';
  h+='<li><span class="g"><b>查词面板（<kbd>/</kbd>）</b><div class="d">顶栏「查词」或按 <kbd>/</kbd>。查<b>单词</b>给词典释义 + 词根助记 + 例句，可以直接收进生词本；'
   + '查<b>句子</b>给翻译，让 AI 拆主干和修饰成分，还能自动挑出里面的核心词——点一下就收走。<b>选中任何东西再按 <kbd>/</kbd>，会直接带进去查。</b></div></span></li>';
  h+='<li><span class="g"><b>摘抄本（长难句专用）</b><div class="d">生词本收"词"，摘抄本收"段"。读不懂的长句选中 →「存摘抄」，攒下来回头一起处理：'
   + '逐句对照、AI 拆句子、把这段覆盖的核心词批量收进生词本。比当场硬啃效率高得多。</div></span></li>';
  h+='<li><span class="g"><b>数据统计里的「提示依赖度」</b><div class="d">区分「靠提示做对」和「真会」。这条分数在往下走，才是真的学会了。</div></span></li>';
  h+='</ul></div>';

  $('app').innerHTML=h;
}

/* ================= 设置 ================= */
function renderSettings(){
  var s=C.settings, a=s.ai||{};
  var h='<div class="card"><h1>设置</h1><p class="sub">提示开关、AI 接口、数据管理。</p></div>';

  h+='<div class="card"><h3>学习提示</h3>';
  h+='<div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center;margin-bottom:10px">';
  h+='<label class="switch"><input type="checkbox" id="sHover"'+(C.hoverMode()>0?' checked':'')+'><i></i><span>划词翻译（总开关）</span></label>';
  h+='<label class="switch"><input type="checkbox" id="sInstant"'+(s.instant?' checked':'')+'><i></i><span>即时反馈</span></label>';
  h+='<div class="tseg"><span>显示到什么程度</span><select id="sHoverMode" style="width:auto">';
  [[0,'完全不显示（纯英文读）'],[1,'只显示这个词的释义'],[2,'词义 + 整句译文']].forEach(function(o){
    h+='<option value="'+o[0]+'"'+(C.hoverMode()===o[0]?' selected':'')+'>'+o[1]+'</option>';
  });
  h+='</select></div>';
  h+='<div class="tseg"><span>显示延迟</span><select id="sHoverDelay" style="width:auto">';
  [[0,'立刻'],[300,'停留 0.3 秒'],[600,'停留 0.6 秒'],[1000,'停留 1 秒']].forEach(function(o){
    h+='<option value="'+o[0]+'"'+(Number(s.hoverDelay||0)===o[0]?' selected':'')+'>'+o[1]+'</option>';
  });
  h+='</select></div>';
  h+='<div class="tseg"><span>每日生词</span><select id="sWordGoal" style="width:auto">';
  [20,30,50,80].forEach(function(n){
    h+='<option value="'+n+'"'+(S.wordGoal()===n?' selected':'')+'>'+n+' 个 / 天</option>';
  });
  h+='</select></div>';
  h+='<div class="tseg"><span>辅助提示</span><select id="sAssist" style="width:auto">';
  [[0,'关闭 · 模拟考试'],[1,'轻 · 只给题型口诀'],[2,'中 · 加定位提示'],[3,'强 · 连解析一起看']].forEach(function(o){
    h+='<option value="'+o[0]+'"'+(s.assist===o[0]?' selected':'')+'>'+o[1]+'</option>';
  });
  h+='</select></div></div>';
  h+='<p class="hint">想练<b>不看译文硬读</b>就把显示程度设成「完全不显示」，读不懂的句子再用鼠标划选、点浮动条上的「翻译」单独翻那一句。'
   + '嫌提示一直弹就选延迟——停留够时间才出现，正常往下读不会跳出来。</p>';
  h+='<p class="hint">推荐用法：第一次学一篇时辅助提示开「强」，把方法看明白；隔天调到「模拟考试」重做一遍，检验自己是不是真会了。</p>';
  h+='<div style="margin-top:12px"><button class="primary" onclick="CET6.saveLearn()">保存</button> <span class="hint" id="lm"></span></div></div>';

  var c = C.CLOUD, cfg = c ? c.cfg : null;
  var lb = c ? c.label() : {t:'未加载', c:''};
  h+='<div class="card"><h3>云端备份（Supabase）</h3>';
  h+='<p class="sub">把<b>生词本、答题记录、每日新词、AI 助记缓存、摘抄本</b>备份到你自己的数据库里，换设备、清缓存都不怕。'
   + '<b>本地优先</b>：云挂了照样能学，只是不同步。</p>';
  h+='<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-bottom:10px">';
  h+='<label class="switch"><input type="checkbox" id="clOn"'+(cfg&&cfg.enabled?' checked':'')+'><i></i><span>启用同步</span></label>';
  h+='<label class="switch"><input type="checkbox" id="clAuto"'+(cfg&&cfg.auto?' checked':'')+'><i></i><span>改动后自动同步</span></label>';
  h+='<span class="pill '+(lb.c||'n')+'" id="clState">'+esc(lb.t)+'</span>';
  h+='<span class="hint" id="clLast">'+ (cfg&&cfg.last ? ('上次同步：'+new Date(cfg.last).toLocaleString('zh-CN')) : '还没同步过') +'</span>';
  if(c && c.owner){
    var own = c.owner();
    h+='<span class="pill '+(own.indexOf('未登录')===0?'r':'g')+'">数据归属：'+esc(own)+'</span>';
  }
  h+='</div>';
  if(c && c.owner && c.owner().indexOf('未登录')===0){
    h+='<p class="hint" style="margin:0 0 10px">现在<b>没登录</b>，同步的数据会落在公共区（谁都能看到）。'
     + '去<a href="#/account">建个账号</a>再同步，数据才真的归你一个人。</p>';
  }
  h+='<div class="row"><label class="f">项目 URL</label><input type="text" id="clUrl" value="'+esc(cfg?cfg.url:'')+'" placeholder="https://xxxx.supabase.co"></div>';
  h+='<div class="row"><label class="f">anon key</label><input type="password" id="clKey" value="'+esc(cfg?cfg.key:'')+'"></div>';
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap">';
  h+='<button class="primary" onclick="CET6.saveCloud()">保存并立即同步</button> ';
  h+='<button onclick="CET6.testCloud()">测试连接</button> ';
  h+='<button onclick="CET6.pullCloud()">只从云端拉回来</button>';
  h+='<span class="hint" id="clMsg"></span></div>';
  h+='<p class="hint" style="margin-top:10px">需要项目 URL 和 <b>anon key</b>（项目后台 Settings → API Keys）。'
   + 'anon key 本来就是给前端用的，真正的安全靠数据库的访问规则，不要把 service_role key 填进来。</p></div>';

  h+='<div class="card"><h3>AI 接口（可选）</h3>';
  h+='<p class="sub">不填也能用。填了之后：给今天的新词生成<b>怎么记的助记</b>（词根/联想/搭配/例句）、'
   + '词典没收的词自动问 AI、划选段落能整段翻译。</p>';
  h+='<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:0 0 10px">';
  h+='<span class="pill n" id="aiState">检测中…</span>';
  h+='<button class="sm primary" onclick="CET6.aiTest()">自检一下</button>';
  h+='<span class="hint" id="aiMsg"></span></div>';
  h+='<label class="chk"><input type="checkbox" id="aiOn"'+(a.enabled?' checked':'')+'>启用 AI</label>';
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0">';
  h+='<span class="hint" style="align-self:center">一键填入：</span>';
  [['deepseek','DeepSeek Flash'],['dskpro','DeepSeek Pro'],['gemini','Gemini'],['openai','OpenAI'],['glm','智谱 GLM']].forEach(function(p){
    h+='<button class="sm" onclick="CET6.presetAI(\''+p[0]+'\')">'+p[1]+'</button>';
  });
  h+='</div>';
  h+='<div class="tseg" style="margin:8px 0"><span>模型</span>'
   + '<input type="text" id="aiModel" list="aiModels" value="'+esc(a.model||'')+'" placeholder="选一个或自己填" style="width:auto;min-width:200px">'
   + '<datalist id="aiModels">'
   + ['deepseek-flash','deepseek-v4-pro','deepseek-v4-flash',
      'gemini-flash-4.1','gemini-2.5-flash','gemini-2.5-pro','gpt-4o-mini','gpt-4o','glm-4-flash','qwen-plus']
       .map(function(m){ return '<option value="'+m+'">' }).join('')
   + '</datalist></div>';
  h+='<div class="row"><label class="f">API Base URL（OpenAI 兼容）</label>'
   + '<input type="text" id="aiUrl" list="aiUrls" value="'+esc(a.baseUrl||'')+'" placeholder="https://api.deepseek.com">'
   + '<datalist id="aiUrls">'
   + ['https://api.deepseek.com','https://api.deepseek.com/v1',
      'https://generativelanguage.googleapis.com/v1beta/openai/',
      'https://api.openai.com/v1','https://open.bigmodel.cn/api/paas/v4']
       .map(function(u){ return '<option value="'+u+'">' }).join('')
   + '</datalist></div>';
  h+='<div class="row"><label class="f">API Key</label><input type="password" id="aiKey" value="'+esc(a.key||'')+'"></div>';
  h+='<p class="hint" style="margin:6px 0 10px">地址和模型名是配套的：点上面的「一键填入」自动配对，或者自己填（'
   + 'DeepSeek = <code>https://api.deepseek.com</code> + <code>deepseek-flash</code>）。'
   + 'DeepSeek 现在的名字是 <code>deepseek-flash</code>（V4.1 Flash）和 <code>deepseek-v4-pro</code>；'
   + '旧名 <code>deepseek-chat</code> / <code>deepseek-reasoner</code> 已停用，'
   + '<code>deepseek-v4-flash</code> 只是个别名，能用但建议写 <code>deepseek-flash</code>。</p>';
  h+='<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-bottom:10px">';
  h+='<label class="chk" style="margin:0"><input type="checkbox" id="aiU1"'+((s.aiUse&&s.aiUse.memory)!==false?' checked':'')+'>生成助记</label>';
  h+='<label class="chk" style="margin:0"><input type="checkbox" id="aiU2"'+((s.aiUse&&s.aiUse.define)!==false?' checked':'')+'>自动补释义</label>';
  h+='<label class="chk" style="margin:0"><input type="checkbox" id="aiU3"'+((s.aiUse&&s.aiUse.translate)!==false?' checked':'')+'>整段翻译</label>';
  h+='</div>';
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap">';
  h+='<button class="primary" onclick="CET6.saveAI()">保存并测试连接</button> ';
  h+='<button onclick="CET6.aiToCloud()">把配置存到云端</button> ';
  h+='<button onclick="CET6.aiFromCloud()">从云端读回来</button></div>';
  /* 把当前这份 AI 配置做成一次性链接，好给另一份站点（比如线上那份）配一次。
     链接只在你自己的浏览器里现算，不会进仓库；本机配置文件里也可以指定 C._aiLink 覆盖。 */
  var aiLink = C._aiLink || C.aiShareLink();
  if(aiLink){
    var isFile = location.protocol === 'file:';
    h+='<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">';
    h+='<a class="sm" style="display:inline-block" href="'+esc(aiLink)+'" onclick="return confirm(\'会用一次性链接把这份 AI 配置带过去（地址栏随后自动清掉）。继续？\')">';
    h+= isFile ? '给线上那份也配上 AI' : '把这份配置复制成一次性链接';
    h+='</a>';
    h+='<span class="hint">'+(isFile
      ? '线上那份没有内置密钥（仓库是公开的），点一下配置一次即可。'
      : '在另一台设备 / 另一份站点上打开这个链接就配好了。')+'</span></div>';
  }else if(!C.aiReady()){
    h+='<p class="hint" style="margin-top:10px">这份没有内置密钥。要么在上面手填，'
     + '要么用一次性链接：<code>你的站点地址/?aikey=你的key&amp;aiurl=https://api.deepseek.com&amp;aimodel=deepseek-flash</code>'
     + '（配置写进浏览器后地址栏会自动清掉）。</p>';
  }
  h+='<p class="hint" style="margin-top:10px">Key 默认只存在<b>这台浏览器</b>里。点「存到云端」会上传到你的数据库——'
   + '<b>只有在你确认这个站点不会被别人打开时才这么做</b>；一旦上传，任何能打开这个页面的人都能读到它。</p></div>';

  h+='<div class="card"><h3>数据</h3>';
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">';
  h+='<button onclick="CET6.exportData()">导出全部数据</button>';
  h+='<button onclick="CET6.wipeLearn()">清空学习记录</button>';
  h+='<button class="danger" onclick="CET6.wipe()">清空全部（含测评）</button></div>';
  h+='<p class="hint">数据存在浏览器 localStorage 里。<b>换浏览器、清缓存、换设备都会丢</b>，重要的话定期导出一份。</p>';
  h+='<div class="row" style="margin-top:12px"><label class="f">导入数据（粘贴导出的 JSON）</label><textarea id="impData" style="min-height:80px"></textarea></div>';
  h+='<button onclick="CET6.importData()">导入</button> <span class="hint" id="dm"></span></div>';

  h+='<div class="card"><h3>关于题库</h3>';
  h+='<p class="sub" style="margin:0">真实六级真题受版权保护，本站不内置真题。内置的是按真题题型、分值、篇幅自编的仿真卷。你拿到真题后，在「导入题目」里上传 PDF 或粘贴文本即可自己加进题库。</p></div>';
  $('app').innerHTML=h;
  C.aiPaintStatus();          /* 进来就先把 AI 状态标出来，不用点才知道连没连上 */
}
C.saveLearn=function(){
  C.settings.hoverTip=$('sHover').checked;
  if($('sHoverMode')) C.settings.hoverMode=+$('sHoverMode').value;
  if($('sHoverDelay')) C.settings.hoverDelay=+$('sHoverDelay').value;
  if($('sWordGoal')) S.setWordGoal(+$('sWordGoal').value);
  C.settings.hoverTip=C.settings.hoverMode>0;
  C.settings.instant=$('sInstant').checked;
  C.settings.assist=+$('sAssist').value;
  C.saveSettings(); C.syncTop();
  $('lm').textContent='已保存';
  setTimeout(function(){ if($('lm')) $('lm').textContent='' },1800);
};
/* 常见接口的预设：只填地址和模型名，key 还是得自己粘 */
var AI_PRESET = {
  deepseek:{url:'https://api.deepseek.com', model:'deepseek-flash', tip:'DeepSeek V4.1 Flash：快、便宜，助记和翻译够用'},
  dskpro:  {url:'https://api.deepseek.com', model:'deepseek-v4-pro', tip:'DeepSeek V4 Pro：拆长难句更稳，也贵一些'},
  gemini:  {url:'https://generativelanguage.googleapis.com/v1beta/openai/', model:'gemini-flash-4.1', tip:'Gemini Flash 4.1'},
  openai:  {url:'https://api.openai.com/v1', model:'gpt-4o-mini', tip:'OpenAI'},
  glm:     {url:'https://open.bigmodel.cn/api/paas/v4', model:'glm-4-flash', tip:'智谱 GLM'}
};
C.presetAI = function(k){
  var p = AI_PRESET[k]; if(!p) return;
  var u = $('aiUrl'), m = $('aiModel');
  if(u) u.value = p.url;
  if(m) m.value = p.model;
  T.toast(p.tip + '——地址已填好，把 Key 粘进去再保存');
};
C.saveAI=function(){
  C.settings.ai={ enabled:$('aiOn').checked, baseUrl:$('aiUrl').value.trim(),
    key:$('aiKey').value.trim(), model:$('aiModel').value.trim()||'deepseek-flash' };
  C.settings.aiUse={ memory:$('aiU1').checked, define:$('aiU2').checked, translate:$('aiU3').checked };
  C.saveSettings();
  C.aiTest();
};
/* 自检：真发一个请求，把"通了 / 为什么没通"说清楚，而不是一句"连接失败" */
C.aiTest=function(){
  var w=C.aiWhy();
  if(w){
    var el=$('aiMsg');
    if(el) el.innerHTML='<b style="color:#B91C1C">没接上</b>：'+esc(w)+'（地址、Key、模型名要全填，并勾上「启用 AI」）';
    else T.toast('AI 未配置：'+w, 3200);
    C.aiPaintStatus(); return;
  }
  var m=$('aiMsg'); if(m) m.textContent='已保存，正在真的发一个请求测试…';
  else T.toast('正在真的发一个请求测试…');
  C.aiSelfTest().then(function(r){
    var el=$('aiMsg');
    var html = r.ok ? '<b style="color:#15803D">'+esc(r.msg)+'</b>'
                    : '<b style="color:#B91C1C">没接上</b>：'+esc(r.msg);
    if(el) el.innerHTML=html; else T.toast(r.msg, 4000);
    C.aiPaintStatus();
  });
};
/* 把当前 AI 配置拼成一次性链接（不含任何硬编码密钥：只读你本机已经填好的配置） */
C.aiShareLink=function(){
  var a=C.settings.ai||{};
  if(!a.key) return '';
  return location.href.split('#')[0].split('?')[0]
    + '?aikey='   + encodeURIComponent(a.key)
    + '&aiurl='   + encodeURIComponent(a.baseUrl||'https://api.deepseek.com')
    + '&aimodel=' + encodeURIComponent(a.model||'deepseek-flash');
};
/* 状态条：不用点也能一眼看到现在是什么情况
   顶栏那个小灯也一起刷 —— 不然在阅读页点了 AI 才发现没配，还得猜为什么 */
C.aiPaintStatus=function(){
  var st=C.aiStatus();
  var el=$('aiState');
  if(el){ el.className='pill '+(st.ok?'g':'r'); el.textContent=st.t }
  var lamp=$('aiLamp');
  if(lamp){
    lamp.className='kbtn '+(st.ok?'ai-ok':'ai-no');
    lamp.textContent=st.ok ? 'AI ✓' : 'AI ✕';
    lamp.title=(st.ok?'AI 已接好':'AI 没接上：'+st.t)+'（点开去设置页自检）';
  }
};
/* AI 配置存/取云端（默认不做，只有用户明确点才做） */
C.aiToCloud=function(){
  if(!C.CLOUD || !C.CLOUD.ready()){ T.toast('先开启并保存云端同步'); return }
  if(!confirm('把 API Key 上传到你的数据库？\n\n任何能打开这个页面的人都能读到它。只在你的站点是私有的情况下这么做。')) return;
  var a=C.settings.ai||{};
  C.CLOUD.setAI(a).then(function(ok){
    T.toast(ok ? '已存到云端' : '上传失败，看看云端是不是没连通');
  });
};
C.aiFromCloud=function(){
  if(!C.CLOUD || !C.CLOUD.ready()){ T.toast('先开启并保存云端同步'); return }
  C.CLOUD.getAI().then(function(o){
    if(!o){ T.toast('云端没有存过 AI 配置'); return }
    C.settings.ai = Object.assign({enabled:false, baseUrl:'', key:'', model:''}, o);
    C.saveSettings(); renderSettings();
    T.toast('已从云端读回 AI 配置');
  });
};
/* 云端同步的三个按钮 */
C.saveCloud=function(){
  if(!C.CLOUD) return;
  C.CLOUD.setCfg({ enabled:$('clOn').checked, auto:$('clAuto').checked,
                   url:$('clUrl').value.trim(), key:$('clKey').value.trim() });
  var m=$('clMsg');
  if(!C.CLOUD.ready()){ if(m) m.textContent='没启用或信息不全'; return }
  m.textContent='正在同步…';
  C.CLOUD.sync().then(function(ok){
    renderSettings();
    if(!ok && m) m.textContent='没连上：' + (C.CLOUD.msg||'');
  });
};
C.testCloud=function(){
  if(!C.CLOUD) return;
  C.CLOUD.setCfg({ url:$('clUrl').value.trim(), key:$('clKey').value.trim() });
  var m=$('clMsg'); if(m) m.textContent='测试中…';
  C.CLOUD.test().then(function(ok){
    if(m) m.textContent = ok ? '连接正常' : ('连接失败：' + (C.CLOUD.msg||''));
    var p=$('clState'); if(p && C.CLOUD.label()) p.textContent=C.CLOUD.label().t;
  });
};
C.pullCloud=function(){
  if(!C.CLOUD || !C.CLOUD.ready()){ T.toast('先开启同步'); return }
  var m=$('clMsg'); if(m) m.textContent='拉取中…';
  C.CLOUD.sync().then(function(ok){
    if(m) m.textContent = ok ? '已从云端合并到本地' : ('失败：'+(C.CLOUD.msg||''));
    T.refreshBadges();
  });
};
/* 备份 / 清空都只碰"当前账号名下"的数据：
   导出时把前缀去掉存进文件，这样这份备份导到另一个账号（或另一台机器）也能用 */
var KEEP={'cet6_accounts_v1':1,'cet6_session_v1':1};   /* 账号表和会话不属于任何人的学习数据 */
C.dataKeys=function(){
  var out=[], pre=(C.ns?C.ns():'')||'', i, k;
  for(i=0;i<localStorage.length;i++){
    k=localStorage.key(i); if(!k || KEEP[k]) continue;
    if(pre){ if(k.indexOf(pre)===0) out.push(k) }        /* 登录后：只取自己名下的 */
    else { if(k.indexOf('u:')!==0) out.push(k) }         /* 未登录：只取还没归属的 */
  }
  return out;
};
C.exportData=function(){
  var pre=(C.ns?C.ns():'')||'', o={_v:1, _at:Date.now(), _account:(C.ACC&&C.ACC.cur()?C.ACC.cur().name:'')};
  C.dataKeys().forEach(function(full){
    var v=localStorage.getItem(full);
    if(v!=null) o[full.slice(pre.length)]=v;
  });
  var n=Object.keys(o).length-1;
  var blob=new Blob([JSON.stringify(o,null,2)],{type:'application/json'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='cet6-backup'+(o._account?('-'+o._account):'')+'-'+S.today()+'.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  T.toast('已导出 '+n+' 项'+(o._account?('（账号：'+o._account+'）'):''));
};
C.importData=function(){
  var m=$('dm');
  try{
    var o=JSON.parse($('impData').value);
    var n=0;
    Object.keys(o).forEach(function(k){
      if(k.charAt(0)==='_') return;
      localStorage.setItem(C.K(k), o[k]); n++;
    });
    m.textContent='导入成功（'+n+' 项），正在刷新…';
    setTimeout(function(){ location.reload() },800);
  }catch(e){ m.textContent='导入失败：'+e.message }
};
C.wipeLearn=function(){
  var who=C.ACC&&C.ACC.cur()?('账号「'+C.ACC.cur().name+'」的'):'';
  if(!confirm('清空'+who+'所有答题记录、生词本、错题本？测评结果保留。')) return;
  S.wipeLearn(); C.del('cet6_reason_v1');
  if(C.PHARMSTAT && C.PHARMSTAT.wipe) { /* 药学的只清有记录的，不在这里一并清 */ }
  location.href='#/home'; location.reload();
};
C.wipe=function(){
  var who=C.ACC&&C.ACC.cur()?('账号「'+C.ACC.cur().name+'」的'):'';
  if(!confirm('清空'+who+'全部本地数据（含测评结果与导入的题）？\n\n不会动其他账号的数据。')) return;
  C.dataKeys().forEach(function(k){ localStorage.removeItem(k) });
  location.href='#/home'; location.reload();
};

/* ================= 账号：每个账号的数据分开存 ================= */
function p2n(n){ return n<10?('0'+n):(''+n) }
function fmtT(ts){ var d=new Date(ts); return d.getFullYear()+'-'+p2n(d.getMonth()+1)+'-'+p2n(d.getDate())+' '+p2n(d.getHours())+':'+p2n(d.getMinutes()) }
/* 密码要跑 6 万轮哈希，会卡不到一秒 —— 先把提示画出来再算，否则界面像卡死了 */
function heavy(fn){ T.toast('正在验证…', 3000); setTimeout(fn, 50) }

function loginCard(title, pre, btn, fn){
  var h='<div class="card"><h3>'+title+'</h3>'
   + '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
   + '<input type="text" id="'+pre+'Name" placeholder="账号名" style="width:auto;min-width:150px">'
   + '<input type="password" id="'+pre+'Pwd" placeholder="密码" style="width:auto;min-width:150px">'
   + '<button class="primary" onclick="'+fn+'">'+btn+'</button></div>'
   + '<p class="hint" style="margin-top:8px">账号名 2–16 个字符，密码至少 6 位。</p></div>';
  return h;
}

function renderAccount(){
  var A=C.ACC||{}, u=A.cur?A.cur():null, h='', i;
  h+='<div class="card"><h1 style="margin:0 0 6px">账号</h1>'
   + '<p class="sub" style="margin:0">每个账号的学习数据<b>分开存放</b>——登录谁，看到的就是谁的进度、生词本和错题本。'
   + '不登录也能用（数据就存在这台浏览器里）；登录之后，同一台机器换个人登录，也看不到你的东西。</p></div>';

  var all = A.users?A.users():[];

  if(u){
    var n = A.dataCount?A.dataCount(u.id):0;
    h+='<div class="card"><h3>当前账号</h3>'
     + '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:baseline">'
     + '<b style="font-size:18px">'+esc(u.name)+'</b><span class="pill g">已登录</span></div>'
     + '<p class="hint" style="margin-top:8px">建于 '+fmtT(u.created||Date.now())+' · 名下 '+n+' 项数据'
     + (C.CLOUD&&C.CLOUD.ready()?' · 云端同步会带上这个账号的标识':'')+'</p>'
     + '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">'
     + '<button onclick="CET6.accLogout()">退出登录</button>'
     + '<button onclick="CET6.accRename()">改账号名</button>'
     + '<button onclick="location.href=\'#/home\'">回去学习</button>'
     + '</div></div>';

    h+='<div class="card"><h3>改密码</h3>'
     + '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
     + '<input type="password" id="pwOld" placeholder="现在的密码" style="width:auto;min-width:140px">'
     + '<input type="password" id="pwNew" placeholder="新密码" style="width:auto;min-width:140px">'
     + '<button onclick="CET6.accPasswd()">改密码</button></div>'
     + '<p class="hint" style="margin-top:8px">只存哈希和随机盐，明文密码不落盘 —— 所以忘了只能清掉重来，找不回来。</p></div>';

    if(all.length>1){
      h+='<div class="card"><h3>换一个人</h3>';
      h+='<p class="hint" style="margin-top:0">这台机器上建过的账号（输密码才能切过去，防止随手点进别人那里）：</p>';
      for(i=0;i<all.length;i++){
        if(all[i].id===u.id) continue;
        h+='<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px">'
         + '<span style="min-width:120px">'+esc(all[i].name)+'</span>'
         + '<input type="password" id="sw_'+all[i].id+'" placeholder="密码" style="width:auto;min-width:140px">'
         + '<button class="sm" onclick="CET6.accSwitch(\''+all[i].id+'\')">切换</button>'
         + '<span class="hint">'+(A.dataCount?A.dataCount(all[i].id):0)+' 项数据</span></div>';
      }
      h+='</div>';
    }

    h+='<div class="card"><h3 style="color:#B91C1C">删除这个账号</h3>'
     + '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
     + '<input type="password" id="rmPwd" placeholder="输入密码确认" style="width:auto;min-width:140px">'
     + '<button class="danger" onclick="CET6.accRemove()">连数据一起删掉</button></div>'
     + '<p class="hint" style="margin-top:8px">会删掉这个账号名下的全部学习数据，其他账号不受影响。删完回到未登录状态。</p></div>';
  }else{
    h+=loginCard('登录','lg','登录','CET6.accLogin()');

    h+='<div class="card"><h3>还没有账号？建一个</h3>'
     + '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
     + '<input type="text" id="rgName" placeholder="账号名" style="width:auto;min-width:150px">'
     + '<input type="password" id="rgPwd" placeholder="密码（至少 6 位）" style="width:auto;min-width:150px">'
     + '<input type="password" id="rgPwd2" placeholder="再输一次" style="width:auto;min-width:150px">'
     + '<button class="primary" onclick="CET6.accSignup()">建账号</button></div></div>';

    if(all.length){
      h+='<div class="card"><h3>这台机器上的账号</h3>';
      for(i=0;i<all.length;i++){
        h+='<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px">'
         + '<span style="min-width:120px">'+esc(all[i].name)+'</span>'
         + '<span class="hint">建于 '+fmtT(all[i].created||0)+' · '+(A.dataCount?A.dataCount(all[i].id):0)+' 项数据</span>'
         + '<button class="sm" onclick="document.getElementById(\'lgName\').value=\''+esc(all[i].name)+'\';document.getElementById(\'lgPwd\').focus()">填进来</button>'
         + '</div>';
      }
      h+='</div>';
    }

    var pend = A.pendingCount?A.pendingCount():0;
    h+='<div class="card"><h3>登录会发生什么</h3>'
     + '<p class="hint" style="margin-top:0">登录后，这台机器上会划出一块只属于这个账号的地方，之后收的词、做的题都记在他名下。'
     + '现在还没归属的数据有 <b>'+pend+'</b> 项，第一次登录时会问你要不要一起搬过去。</p>'
     + '<p class="hint">换设备、换浏览器不会自动跟过来 —— 用设置页的「导出 / 导入」搬，或者开云端同步。</p></div>';
  }
  $('app').innerHTML=h;
}

function val(id){ var e=$(id); return e?String(e.value||'').trim():'' }

/* 登录后问一次：本机现有的（还没归属的）数据要不要归到这个账号 */
function askAdopt(uid){
  var pend = C.ACC.pendingCount?C.ACC.pendingCount():0;
  if(!pend) return 0;
  if(!confirm('这个账号名下还没有数据。\n\n要把这台机器上现有的 '+pend+' 项学习数据归到它名下吗？\n\n'
    + '选「确定」= 搬过去（原处保留一份，不影响别的账号）；选「取消」= 从空白开始。')) return 0;
  return C.ACC.adopt(uid);
}

C.accLogin=function(){
  var n=val('lgName'), p=val('lgPwd');
  if(!n||!p){ T.toast('账号名和密码都要填'); return }
  heavy(function(){
    var r=C.ACC.login(n,p);
    if(!r.ok){ T.toast(r.err,3000); return }
    var moved=askAdopt(r.uid);
    T.toast(moved?('已把 '+moved+' 项数据归到「'+r.user.name+'」'):('已登录：'+r.user.name), 2500);
    setTimeout(function(){ location.reload() }, 700);
  });
};
C.accSignup=function(){
  var n=val('rgName'), p=val('rgPwd'), p2=val('rgPwd2');
  if(p!==p2){ T.toast('两次输入的密码不一样'); return }
  heavy(function(){
    var r=C.ACC.signup(n,p);
    if(!r.ok){ T.toast(r.err,3000); return }
    C.ACC.login(n,p);
    var moved=askAdopt(r.uid);
    T.toast(moved?('账号建好了，顺便把 '+moved+' 项数据归到它名下'):('账号建好了：'+r.user.name), 2500);
    setTimeout(function(){ location.reload() }, 700);
  });
};
C.accLogout=function(){
  C.ACC.logout();
  T.toast('已退出，现在看到的是未登录时的数据');
  setTimeout(function(){ location.reload() }, 600);
};
C.accSwitch=function(uid){
  var u=C.ACC.byId(uid); if(!u){ T.toast('找不到这个账号'); return }
  var p=val('sw_'+uid);
  if(!p){ T.toast('要先输入「'+u.name+'」的密码'); return }
  heavy(function(){
    var r=C.ACC.login(u.name,p);
    if(!r.ok){ T.toast(r.err,3000); return }
    askAdopt(r.uid);
    T.toast('已切换到：'+r.user.name, 2500);
    setTimeout(function(){ location.reload() }, 700);
  });
};
C.accPasswd=function(){
  var o=val('pwOld'), n=val('pwNew');
  if(!o||!n){ T.toast('旧密码和新密码都要填'); return }
  heavy(function(){
    var r=C.ACC.passwd(o,n);
    T.toast(r.ok?'密码已改':r.err, 3000);
    if(r.ok) setTimeout(function(){ location.reload() }, 700);
  });
};
C.accRename=function(){
  var u=C.ACC.cur(); if(!u) return;
  var n=prompt('新的账号名（2–16 个字符）：', u.name||'');
  if(n==null) return;
  var r=C.ACC.rename(n);
  T.toast(r.ok?('已改名为：'+String(n).trim()):r.err, 3000);
  if(r.ok) setTimeout(function(){ location.reload() }, 700);
};
C.accRemove=function(){
  var u=C.ACC.cur(); if(!u) return;
  var p=val('rmPwd');
  if(!p){ T.toast('要输入密码才让删'); return }
  if(!confirm('确定删除账号「'+u.name+'」？\n\n它名下的全部学习数据会一起删掉，删了找不回来。')) return;
  heavy(function(){
    var r=C.ACC.remove(p);
    if(!r.ok){ T.toast(r.err,3000); return }
    T.toast('账号已删除', 2500);
    setTimeout(function(){ location.href='#/account'; location.reload() }, 700);
  });
};
/* 顶栏账号灯 */
C.accPaint=function(){
  var el=$('accLamp'); if(!el) return;
  var u=(C.ACC&&C.ACC.cur)?C.ACC.cur():null;
  var c=$('cAcc');
  if(u){
    el.className='kbtn acc-on';
    el.textContent=u.name;                 /* 太长由 CSS 截断，悬停能看全名 */
    el.title='已登录：'+u.name+'（点开看账号与切换）';
    if(c){ c.textContent=u.name; c.style.display='' }
  }else{
    el.className='kbtn acc-off';
    el.textContent='登录';
    el.title='还没登录（数据存在这台浏览器里）。点开可以建账号或登录';
    if(c){ c.textContent='登录'; c.style.display='' }
  }
};

/* 暴露给词汇训练模块复用（它自己不重复实现练习引擎） */
C._practice = practice;
C._renderRead = renderRead;

/* ================= 启动 ================= */
window.addEventListener('hashchange',route);
if('speechSynthesis' in window){ speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged=function(){speechSynthesis.getVoices()} }
/* 用 hash 反推当前考试，避免刷新后菜单与内容不一致 */
if((location.hash||'').indexOf('#/p/')===0){ C.exam='pharm' }
C.applyExam();
route();
})();
