/* 主程序：路由 / 页面渲染 / 练习引擎 */
(function(){
var C=window.CET6, B=C.BANK, A=C.ASSESS;
var $=C.$, esc=C.esc;
var L='ABCD';
function letter(i){return String.fromCharCode(65+i)}

/* ---------- 路由 ---------- */
function route(){
  var h=(location.hash||'#/home').replace(/^#\/?/,'');
  var p=h.split('/');
  var view=p[0]||'home', arg=p[1];
  var app=$('app');
  app.innerHTML='';
  hideTrans();
  if(view==='home') renderHome();
  else if(view==='assess') renderAssess();
  else if(view==='plan') renderPlan();
  else if(view==='bank') renderBank();
  else if(view==='read') renderRead(arg);
  else if(view==='listen') renderListen(arg);
  else if(view==='match') renderMatch(arg);
  else if(view==='cloze') renderCloze(arg);
  else if(view==='settings') renderSettings();
  else renderHome();
  window.scrollTo(0,0);
  markNav(view);
}
function markNav(v){
  var as=document.querySelectorAll('.nav a');
  for(var i=0;i<as.length;i++){
    as[i].className = (as[i].getAttribute('href')==='#/'+v)?'on':'';
  }
}
function hideTrans(){ var t=$('tt'); if(t){t.innerHTML='把鼠标移到任意句子上，这里显示整句翻译';t.className='empty'} }

/* ---------- 顶部开关条（首页与练习页共用） ---------- */
function switchesHTML(){
  var s=C.settings;
  var h='<div class="card tight" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;font-size:13px">';
  h+='<label class="chk" style="margin:0"><input type="checkbox" id="swHover"'+(s.hoverTip?' checked':'')+' onchange="CET6.toggleHover(this.checked)">鼠标移到词上给提示</label>';
  h+='<span style="display:flex;align-items:center;gap:6px">辅助提示';
  h+='<select id="swAssist" style="width:auto" onchange="CET6.setAssist(+this.value)">';
  h+='<option value="0"'+(s.assist===0?' selected':'')+'>关闭（模拟考试）</option>';
  h+='<option value="1"'+(s.assist===1?' selected':'')+'>轻：只给题型口诀</option>';
  h+='<option value="2"'+(s.assist===2?' selected':'')+'>中：加定位提示</option>';
  h+='<option value="3"'+(s.assist===3?' selected':'')+'>强：连解析一起看</option>';
  h+='</select></span>';
  h+='<label class="chk" style="margin:0"><input type="checkbox" id="swInstant"'+(s.instant?' checked':'')+' onchange="CET6.toggleInstant(this.checked)">即时反馈</label>';
  h+='</div>';
  return h;
}
C.toggleHover=function(v){C.settings.hoverTip=v;C.saveSettings()};
C.setAssist=function(v){C.settings.assist=v;C.saveSettings();route()};
C.toggleInstant=function(v){C.settings.instant=v;C.saveSettings()};

/* ---------- 首页 ---------- */
function renderHome(){
  var prof=C.get(PROF,null), h='';
  h+='<div class="card">';
  h+='<h1>CET-6 训练台</h1>';
  h+='<p class="sub">目标不是检验你，是让你在最短时间里学会。所有提示都可以开，先学会再关掉模拟考试。</p>';
  if(!prof){
    h+='<div class="card tight" style="background:#E6F1FB;border-color:#B5D4F4;margin:14px 0 0">';
    h+='<div style="font-weight:500;font-size:14.5px">第一次进来，先花 5–10 分钟做个测评</div>';
    h+='<p class="sub" style="margin:6px 0 12px">测算你的真实词汇量 + 诊断你的答题习惯，然后给你一套针对性的训练方法。只做一次。</p>';
    h+='<button class="primary big" onclick="location.href=\'#/assess\'">开始测评</button></div>';
  }else{
    h+='<div class="grid" style="margin-top:14px">';
    h+='<div class="mc"><div class="l">估算词汇量</div><div class="v">'+prof.vocab+'</div></div>';
    h+='<div class="mc"><div class="l">当前水平</div><div class="v" style="font-size:17px">'+levelName(prof.vocab)+'</div></div>';
    h+='<div class="mc"><div class="l">距考试</div><div class="v">'+daysLeft()+'</div><div class="l">天（12 月 12 日）</div></div>';
    h+='<div class="mc click" onclick="location.href=\'#/plan\'"><div class="l">训练方案</div><div class="v" style="font-size:17px">查看 →</div></div>';
    h+='</div>';
    h+='<div class="card tight"><h3 style="margin-top:0">今天做这三件事</h3><ul class="list">';
    h+='<li><span class="tag">听力</span><span>精听一段讲座，用「扫选项 → 预判 → 抓改写」三步</span></li>';
    h+='<li><span class="tag">阅读</span><span>做一篇仔细阅读，做完逐题复盘并标注错因</span></li>';
    h+='<li><span class="tag">词汇</span><span>过一遍生词本，把今天做题遇到的生词录进去</span></li>';
    h+='</ul></div>';
  }
  h+='</div>';
  h+=switchesHTML();
  h+='<div class="grid2">';
  h+='<div class="card tight"><h3 style="margin-top:0">题库</h3><p class="sub">内置仿真卷，题型分值与真题一致。</p>';
  h+='<button onclick="location.href=\'#/bank\'">进入题库</button></div>';
  h+='<div class="card tight"><h3 style="margin-top:0">设置</h3><p class="sub">AI 接口、导入试卷、重置测评。</p>';
  h+='<button onclick="location.href=\'#/settings\'">打开设置</button></div>';
  h+='</div>';
  h+='<div class="card tight"><h3 style="margin-top:0">关于题库的说明</h3>';
  h+='<p class="sub" style="margin:0">真实六级真题受版权保护，本站不内置真题。内置的是按真题题型、分值、篇幅自编的仿真卷。你拿到官方真题后，可在「设置 → 导入试卷」里粘进来，格式见该页说明。</p></div>';
  $('app').innerHTML=h;
}
function levelName(v){return v<3500?'需要补词':(v<4800?'及格线附近':(v<6000?'够用':'超出要求'))}
function daysLeft(){
  var d=new Date('2026-12-12T15:00:00'), n=new Date();
  return Math.max(0,Math.ceil((d-n)/86400000));
}

/* ---------- 词汇量测评 ---------- */
var PROF='cet6_profile_v1';
var VT={list:[],i:0,ans:{},started:false};

function renderAssess(){
  if(!VT.started) buildVT();
  var h='<div class="card">';
  if(VT.i<VT.list.length){
    var w=VT.list[VT.i];
    var pct=Math.round(VT.i/VT.list.length*100);
    h+='<h2>词汇量测评<span class="pill">第 '+(VT.i+1)+' / '+VT.list.length+'</span></h2>';
    h+='<p class="sub">认识就点「认识」。不确定的一律点「不认识」——高估自己只会得到一份没用的方案。里面混了几个不存在的词。</p>';
    h+='<div class="bar2"><i style="width:'+pct+'%"></i></div>';
    h+='<div class="center"><div class="wt">'+esc(w.w)+'<small>'+(w.band?'（'+w.band+'）':'')+'</small></div>';
    h+='<button class="big" onclick="CET6.vt(1)">认识</button> ';
    h+='<button class="big" onclick="CET6.vt(0)">不认识</button></div>';
    h+='<p class="hint center">键盘也可以：← 认识，→ 不认识</p>';
  }
  h+='</div>';
  $('app').innerHTML=h;
}
function buildVT(){
  var list=[];
  A.bands.forEach(function(b){ b.words.forEach(function(w){ list.push({w:w,band:b.k,label:b.label,size:b.size}) }) });
  A.nonce.forEach(function(w){ list.push({w:w,band:null,nonce:true}) });
  for(var i=list.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=list[i];list[i]=list[j];list[j]=t}
  VT={list:list,i:0,ans:{},started:true};
}
C.vt=function(v){
  VT.ans[VT.list[VT.i].w]=v;
  VT.i++;
  if(VT.i>=VT.list.length){ finishVT() } else { renderAssess() }
};
document.addEventListener('keydown',function(e){
  if(location.hash.indexOf('assess')<0||!VT.started||VT.i>=VT.list.length) return;
  if(e.key==='ArrowLeft') C.vt(1);
  if(e.key==='ArrowRight') C.vt(0);
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
  var h='<div class="card">';
  h+='<h2>词汇量估算结果</h2>';
  h+='<div class="grid" style="margin:12px 0">';
  h+='<div class="mc"><div class="l">估算词汇量</div><div class="v" style="color:#185FA5">'+VT.result.vocab+'</div></div>';
  h+='<div class="mc"><div class="l">水平</div><div class="v" style="font-size:18px">'+levelName(VT.result.vocab)+'</div></div>';
  h+='</div>';
  if(VT.result.fake>3){
    h+='<div class="card tight" style="background:#FCEBEB;border-color:#F09595"><b>注意：</b>你把 '+VT.result.fake+' 个不存在的词也标成了「认识」，结果可能偏高。建议重测一次，不确定的一律选「不认识」。</div>';
  }
  h+='<table><tr><th>词频带</th><th>答对</th><th>折算</th></tr>';
  VT.result.rows.forEach(function(r){
    h+='<tr><td>'+r.k+' · '+r.label+'</td><td class="n">'+r.ok+' / '+r.tot+'</td><td class="n">'+r.add+'</td></tr>';
  });
  h+='</table>';
  h+='<h3>接下来 8 个问题，用来诊断你的答题习惯</h3>';
  h+='<p class="sub">按真实情况选，选错只会让你拿到一份不适合自己的方案。</p>';
  h+='</div>';
  A.quiz.forEach(function(q,idx){
    h+='<div class="card"><div style="font-weight:500;font-size:14.5px">'+(idx+1)+'. '+esc(q.q)+'</div>';
    if(q.multi){
      q.o.forEach(function(o,oi){
        h+='<label class="chk"><input type="checkbox" onchange="CET6.qzMulti('+idx+','+oi+',this.checked)">'+esc(o)+'</label>';
      });
    }else{
      h+='<div class="opts" style="margin-top:8px">';
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
  C.set(PROF,prof);
  location.href='#/plan';
};

/* ---------- 训练方案 ---------- */
function renderPlan(){
  var prof=C.get(PROF,null);
  if(!prof){ $('app').innerHTML='<div class="card center"><p>还没做测评。</p><button class="primary" onclick="location.href=\'#/assess\'">去测评</button></div>'; return }
  var secs=A.plan(prof);
  var h='<div class="card"><h1>你的训练方案</h1>';
  h+='<p class="sub">基于词汇量 '+prof.vocab+' 和你的答题习惯生成。做满两周后回来重测一次词汇量。</p>';
  h+='<div class="grid"><div class="mc"><div class="l">词汇量</div><div class="v">'+prof.vocab+'</div></div>';
  h+='<div class="mc"><div class="l">距考试</div><div class="v">'+daysLeft()+'</div><div class="l">天</div></div>';
  h+='<div class="mc"><div class="l">每周投入</div><div class="v" style="font-size:16px">'+['10h+','5–10h','3–5h','<3h'][prof.hours]+'</div></div></div></div>';
  secs.forEach(function(s){
    h+='<div class="card"><h2>'+esc(s.h)+'</h2><ul class="list">';
    s.items.forEach(function(it){ h+='<li><span>'+it+'</span></li>' });
    h+='</ul></div>';
  });
  h+='<div class="card center"><button onclick="location.href=\'#/bank\'">开始做题</button> ';
  h+='<button onclick="if(confirm(\'重新测评会覆盖当前方案，确定？\')){location.href=\'#/assess\'}">重新测评</button></div>';
  $('app').innerHTML=h;
}

/* ---------- 题库 ---------- */
function renderBank(){
  var imp=C.get('cet6_imported',[]);
  var h='<div class="card"><h1>题库</h1><p class="sub">内置仿真卷按真题题型与分值自编。做完可以开「辅助提示」重做一遍。</p></div>';
  h+='<div class="card"><h3>仔细阅读（每题 14.2 分，全卷最值钱）</h3><ul class="list">';
  B.readings.forEach(function(r){
    h+='<li><span class="tag">'+r.topic+'</span><span style="flex:1">'+esc(r.title)+' · '+r.words+' 词 · '+r.qs.length+' 题</span><button onclick="location.href=\'#/read/'+r.id+'\'">开始</button></li>';
  });
  h+='</ul></div>';
  h+='<div class="card"><h3>听力（讲座每题 14.2 分，占听力 57%）</h3><ul class="list">';
  B.listening.forEach(function(g){
    var nm=g.kind==='lecture'?'讲座':(g.kind==='passage'?'篇章':'长对话');
    h+='<li><span class="tag">'+nm+'</span><span style="flex:1">'+esc(g.title)+' · '+g.qs.length+' 题</span><button onclick="location.href=\'#/listen/'+g.id+'\'">开始</button></li>';
  });
  h+='</ul></div>';
  h+='<div class="card"><h3>选词填空 / 长篇匹配</h3><ul class="list">';
  B.cloze.forEach(function(c){ h+='<li><span class="tag">选词填空</span><span style="flex:1">'+esc(c.title)+' · 10 题 35.5 分</span><button onclick="location.href=\'#/cloze/'+c.id+'\'">开始</button></li>' });
  B.matching.forEach(function(m){ h+='<li><span class="tag">长篇匹配</span><span style="flex:1">'+esc(m.title)+' · 10 题 71 分</span><button onclick="location.href=\'#/match/'+m.id+'\'">开始</button></li>' });
  h+='</ul></div>';
  if(imp.length){
    h+='<div class="card"><h3>我导入的试卷</h3><ul class="list">';
    imp.forEach(function(p,i){
      h+='<li><span class="tag">'+({reading:'阅读',listening:'听力',cloze:'选词',matching:'匹配'}[p.type]||p.type)+'</span><span style="flex:1">'+esc(p.title||p.id)+'</span><button onclick="location.href=\'#/read/'+(p.type==='reading'?p.id:'')+'\'">开始</button> <button onclick="CET6.delImport('+i+')">删除</button></li>';
    });
    h+='</ul></div>';
  }
  h+='<div class="card tight"><p class="sub" style="margin:0">没有你需要的题？在「设置 → 导入试卷」里粘一份进来，格式说明就在那页。</p></div>';
  $('app').innerHTML=h;
}
C.delImport=function(i){ var a=C.get('cet6_imported',[]); a.splice(i,1); C.set('cet6_imported',a); route() };

/* ---------- 阅读练习 ---------- */
var RS={};
function renderRead(id){
  var r=null;
  B.readings.forEach(function(x){ if(x.id===id) r=x });
  if(!r){ var im=C.get('cet6_imported',[]); im.forEach(function(x){ if(x.id===id&&x.type==='reading') r=x }) }
  if(!r){ $('app').innerHTML='<div class="card">找不到这篇文章。<button onclick="location.href=\'#/bank\'">回题库</button></div>'; return }
  RS={r:r,ans:{},done:false};
  var h=switchesHTML();
  h+='<div class="card"><h1>'+esc(r.title)+'<span class="pill">'+esc(r.topic||'')+'</span><span class="pill a">'+r.qs.length+' 题 × 14.2 分</span></h1>';
  h+='<p class="sub">鼠标划过单词看释义，划过句子看整段翻译。建议 9–10 分钟。</p>';
  h+='<div class="passage">';
  r.text.forEach(function(p){
    if(Array.isArray(p)) h+=C.sentHTML(p[0],p[1]);
    else h+=C.sentHTML(p,p);
  });
  h+='</div></div>';
  h+='<div class="card"><h2>Questions</h2>';
  r.qs.forEach(function(q){
    h+=qHTML(q,'rq'+q.n);
  });
  h+='<div class="center" style="margin-top:18px"><button class="primary big" onclick="CET6.gradeRead()">提交并查看解析</button></div></div>';
  $('app').innerHTML=h;
  bindOpts();
}

function qHTML(q,key){
  var s=C.settings, h='';
  h+='<div class="q"><div class="qtext">';
  if(s.assist>0&&q.type) h+='<span class="qbadge">'+C.TYPE[q.type].n+'</span>';
  h+='<b>'+q.n+'.</b> '+C.words(q.q)+'</div>';
  if(s.assist>0&&q.type){
    h+='<div class="assist"><b>提示 1 · 解题方向</b><br>'+C.assistL1(q.type)+'</div>';
  }
  if(s.assist>1&&q.l2){
    h+='<div class="assist"><b>提示 2 · 去哪找</b><br>'+esc(q.l2)+'</div>';
  }
  if(s.assist>2&&q.why){
    h+='<div class="assist"><b>提示 3 · 答案解析</b><br>'+esc(q.why)+'　<b>正确答案：'+letter(q.a)+'</b></div>';
  }
  h+='<div class="opts" style="'+(q.o.length>4?'flex-direction:row;flex-wrap:wrap':'')+'">';
  q.o.forEach(function(o,i){
    h+='<div class="opt" data-k="'+key+'" data-i="'+i+'" style="'+(q.o.length>4?'flex:0 0 auto;padding:6px 13px':'')+'"><span class="k">'+letter(i)+'</span>'+(q.o.length>4?'':'<span>'+C.words(o)+'</span>')+'</div>';
  });
  h+='</div><div id="ex_'+key+'"></div></div>';
  return h;
}

function bindOpts(){
  var els=document.querySelectorAll('.opt[data-k]');
  for(var i=0;i<els.length;i++)(function(el){
    el.addEventListener('click',function(){
      var k=el.getAttribute('data-k'), v=+el.getAttribute('data-i');
      var sibs=el.parentNode.querySelectorAll('.opt');
      for(var j=0;j<sibs.length;j++) sibs[j].classList.remove('sel');
      el.classList.add('sel');
      var n=+k.replace(/\D/g,'');
      RS.ans[n]=v;
      if(C.settings.instant) showOne(n);
    });
  })(els[i]);
}

function expHTML(q,got,key){
  var right=(got===q.a), h='';
  h+='<div class="exp"><div class="h">第 '+q.n+' 题 · '+(right?'<span style="color:#3B6D11">正确</span>':'<span style="color:#A32D2D">错误</span>')+
     '（你选 '+(got!=null?letter(got):'未答')+' / 正确 '+letter(q.a)+'）</div>';
  h+='<div>'+esc(q.why||'')+'</div>';
  if(q.loc) h+='<div class="loc" data-t="'+esc(q.locZh||q.loc)+'"><b>原文依据：</b>'+esc(q.loc)+'</div>';
  if(q.trap&&q.trap.length){
    h+='<div class="trap" style="margin-top:8px"><b>干扰项为什么错</b></div>';
    q.trap.forEach(function(t){ h+='<div class="trap">· '+esc(t)+'</div>' });
  }
  if(q.guess) h+='<div class="tipbox"><b>没读懂时怎么猜</b><br>'+esc(q.guess)+'</div>';
  h+='</div>';
  return h;
}
function showOne(n){
  var q=null; RS.r.qs.forEach(function(x){ if(x.n===n) q=x });
  if(!q) return;
  var el=$('ex_rq'+n); if(!el) return;
  el.innerHTML=expHTML(q,RS.ans[n]);
  var opts=document.querySelectorAll('[data-k="rq'+n+'"]');
  for(var i=0;i<opts.length;i++){
    opts[i].classList.remove('sel');
    if(i===q.a) opts[i].classList.add('ok');
    else if(i===RS.ans[n]) opts[i].classList.add('no');
  }
}
C.gradeRead=function(){
  var ok=0;
  RS.r.qs.forEach(function(q){
    if(RS.ans[q.n]===q.a) ok++;
    showOne(q.n);
  });
  var pct=Math.round(ok/RS.r.qs.length*100);
  var col=pct>=60?'#3B6D11':(pct>=40?'#854F0B':'#A32D2D');
  var h='<div class="card"><h2>结果</h2><div class="grid">';
  h+='<div class="mc"><div class="l">正确率</div><div class="v" style="color:'+col+'">'+pct+'%</div></div>';
  h+='<div class="mc"><div class="l">对 / 总</div><div class="v">'+ok+' / '+RS.r.qs.length+'</div></div>';
  h+='<div class="mc"><div class="l">折合分值</div><div class="v">'+(Math.round(ok*14.2*10)/10)+'</div><div class="l">满分 '+(RS.r.qs.length*14.2)+'</div></div></div>';
  h+='<div style="font-size:14px;line-height:1.8;margin-top:10px">'+(ok>=RS.r.qs.length*0.6?
    '过关。回去确认一下有没有「蒙对」的题——那些比错题更危险。':
    '别先看正确率。逐题判断你是<b>定位错了</b>、<b>句子没拆开</b>还是<b>词汇卡住</b>：定位错练扫读，句子拆不开练长难句，只有词汇卡住才需要背单词。')+'</div></div>';
  $('app').insertAdjacentHTML('afterbegin',h);
  window.scrollTo(0,0);
};

/* ---------- 听力练习 ---------- */
var LS={};
function renderListen(id){
  var g=null;
  B.listening.forEach(function(x){ if(x.id===id) g=x });
  if(!g){ $('app').innerHTML='<div class="card">找不到这段听力。<button onclick="location.href=\'#/bank\'">回题库</button></div>'; return }
  LS={g:g,ans:{},played:false};
  var nm=g.kind==='lecture'?'讲座/讲话':(g.kind==='passage'?'听力篇章':'长对话');
  var h=switchesHTML();
  h+='<div class="card"><h1>'+esc(g.title)+'<span class="pill">'+nm+'</span><span class="pill a">'+g.qs.length+' 题 × '+g.value+' 分</span></h1>';
  h+='<p class="sub">点播放，只播一遍（与考场一致）。播放前题目是锁着的。</p>';
  h+='<div class="card tight" style="background:#EEF3F8">';
  h+='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">';
  h+='<button class="primary" id="pl" onclick="CET6.play()">播放（仅一次）</button>';
  h+='<span class="sub" id="pst" style="margin:0">未播放</span>';
  h+='<span class="sp" style="flex:1"></span>';
  h+='<span class="sub" style="margin:0">语速</span>';
  h+='<select id="rate" style="width:auto" onchange="LSA.rate=+this.value"><option value="0.85">0.85x</option><option value="1" selected>1.0x</option><option value="1.15">1.15x</option></select>';
  h+='<button onclick="CET6.showAudio()">'+(LS.show?'收起原文':'显示原文')+'</button>';
  h+='</div></div>';
  if(LS.show){
    h+='<div class="passage" style="font-size:14px">'+C.words(g.audio)+'</div>';
  }
  h+='<div id="lqs" class="'+(LS.played?'':'locked')+'">';
  g.qs.forEach(function(q){ h+=qHTML(q,'lq'+q.n) });
  h+='</div>';
  h+='<div class="center" style="margin-top:18px"><button class="primary big" onclick="CET6.gradeListen()">提交并查看解析</button></div>';
  h+='</div>';
  $('app').innerHTML=h;
  bindOptsListen();
}
function bindOptsListen(){
  var els=document.querySelectorAll('.opt[data-k^="lq"]');
  for(var i=0;i<els.length;i++)(function(el){
    el.addEventListener('click',function(){
      var k=el.getAttribute('data-k'), v=+el.getAttribute('data-i');
      var sibs=el.parentNode.querySelectorAll('.opt');
      for(var j=0;j<sibs.length;j++) sibs[j].classList.remove('sel');
      el.classList.add('sel');
      LS.ans[+k.replace(/\D/g,'')]=v;
      if(C.settings.instant) showOneL(+k.replace(/\D/g,''));
    });
  })(els[i]);
}
function showOneL(n){
  var q=null; LS.g.qs.forEach(function(x){ if(x.n===n) q=x });
  if(!q) return;
  var el=$('ex_lq'+n); if(!el) return;
  el.innerHTML=expHTML(q,LS.ans[n]);
  var opts=document.querySelectorAll('[data-k="lq'+n+'"]');
  for(var i=0;i<opts.length;i++){
    opts[i].classList.remove('sel');
    if(i===q.a) opts[i].classList.add('ok');
    else if(i===LS.ans[n]) opts[i].classList.add('no');
  }
}
C.showAudio=function(){ LS.show=!LS.show; renderListen(LS.g.id) };
var LSA={rate:1};
C.play=function(){
  if(LS.played){ alert('只播一遍。想重听可以刷新页面重来，但那样就不是模拟考试了。'); return }
  var g=LS.g;
  LS.played=true;
  var b=$('pl'); if(b) b.disabled=true;
  var st=$('pst'); if(st) st.textContent='播放中… 请勿切走页面';
  speak(g.audio, LSA.rate, function(ok){
    if(st) st.textContent = ok? '' : '当前设备没有英文语音，题目已解锁。可在系统里安装语音包，或点"显示原文"练习。';
    var q=$('lqs'); if(q) q.className='';
    if(!ok) LS.played=false, b.disabled=false;
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
C.gradeListen=function(){
  var ok=0;
  LS.g.qs.forEach(function(q){ if(LS.ans[q.n]===q.a) ok++; showOneL(q.n) });
  var pct=Math.round(ok/LS.g.qs.length*100);
  var h='<div class="card"><h2>结果</h2><div class="grid">';
  h+='<div class="mc"><div class="l">正确率</div><div class="v">'+pct+'%</div></div>';
  h+='<div class="mc"><div class="l">对 / 总</div><div class="v">'+ok+' / '+LS.g.qs.length+'</div></div>';
  h+='<div class="mc"><div class="l">折合分值</div><div class="v">'+(Math.round(ok*LS.g.value*10)/10)+'</div><div class="l">满分 '+(LS.g.qs.length*LS.g.value)+'</div></div></div>';
  h+='<div style="font-size:14px;margin-top:10px">听力错得多不用慌——机器语音比真人硬，考场会更容易。重点看每题的原文依据，确认是没听清、还是听到了没反应过来。</div></div>';
  $('app').insertAdjacentHTML('afterbegin',h);
  window.scrollTo(0,0);
};

/* ---------- 长篇匹配 ---------- */
var MS={};
function renderMatch(id){
  var m=null; B.matching.forEach(function(x){ if(x.id===id) m=x });
  if(!m){ $('app').innerHTML='<div class="card">找不到这篇。<button onclick="location.href=\'#/bank\'">回题库</button></div>'; return }
  var qs=m.qs.map(function(q){
    var idx=-1; m.paras.forEach(function(p,i){ if(p.k===q.a) idx=i });
    var para=m.paras[idx]||{t:''};
    return {n:q.n,type:'detail',q:q.q,o:m.paras.map(function(p){return p.k}),a:idx,
      loc:para.t, locZh:'对应上方 ['+q.a+'] 段原文',
      why:'题干是对 '+q.a+' 段的同义改写。匹配题考的是改写识别，不是读懂全文。',
      trap:['干扰项是"话题相关但没有这个细节"的段落。只有题干里的独特名词能帮你确认。','另外有一段是不会被选中的，别硬凑。'],
      l2:'先划出题干里别的段落没有的独特名词，再回头扫段落。',guess:''};
  });
  MS={m:m,ans:{},qs:qs};
  var h=switchesHTML();
  h+='<div class="card"><h1>'+esc(m.title)+'<span class="pill">长篇匹配</span><span class="pill a">10 题 × 7.1 分</span></h1>';
  h+='<p class="sub">'+esc(m.note||'')+'鼠标划词可看释义。</p>';
  m.paras.forEach(function(p){
    h+='<div style="display:flex;gap:10px;margin:9px 0"><b style="min-width:16px;color:#185FA5">'+p.k+'</b><span style="font-size:14px;line-height:1.75">'+C.words(p.t)+'</span></div>';
  });
  h+='</div><div class="card"><h2>Questions</h2>';
  qs.forEach(function(q){ h+=qHTML(q,'mq'+q.n) });
  h+='<div class="center" style="margin-top:18px"><button class="primary big" onclick="CET6.gradeMatch()">提交并查看解析</button></div></div>';
  $('app').innerHTML=h;
  bindOptsM();
}
function bindOptsM(){
  var els=document.querySelectorAll('.opt[data-k^="mq"]');
  for(var i=0;i<els.length;i++)(function(el){
    el.addEventListener('click',function(){
      var k=el.getAttribute('data-k'), v=+el.getAttribute('data-i');
      var sibs=el.parentNode.querySelectorAll('.opt');
      for(var j=0;j<sibs.length;j++) sibs[j].classList.remove('sel');
      el.classList.add('sel');
      MS.ans[+k.replace(/\D/g,'')]=v;
      if(C.settings.instant) showOneM(+k.replace(/\D/g,''));
    });
  })(els[i]);
}
function showOneM(n){
  var q=null; MS.qs.forEach(function(x){ if(x.n===n) q=x });
  if(!q) return;
  var el=$('ex_mq'+n); if(!el) return;
  el.innerHTML=expHTML(q,MS.ans[n]);
  var opts=document.querySelectorAll('[data-k="mq'+n+'"]');
  for(var i=0;i<opts.length;i++){
    opts[i].classList.remove('sel');
    if(i===q.a) opts[i].classList.add('ok');
    else if(i===MS.ans[n]) opts[i].classList.add('no');
  }
}
C.gradeMatch=function(){
  var ok=0;
  MS.qs.forEach(function(q){ if(MS.ans[q.n]===q.a) ok++; showOneM(q.n) });
  var pct=Math.round(ok/MS.qs.length*100);
  var h='<div class="card"><h2>结果</h2><div class="grid">';
  h+='<div class="mc"><div class="l">正确率</div><div class="v">'+pct+'%</div></div>';
  h+='<div class="mc"><div class="l">对 / 总</div><div class="v">'+ok+' / '+MS.qs.length+'</div></div>';
  h+='<div class="mc"><div class="l">折合分值</div><div class="v">'+(Math.round(ok*7.1*10)/10)+'</div><div class="l">满分 71</div></div></div>';
  h+='<div style="font-size:14px;margin-top:10px">匹配题是性价比最高的一块：不依赖词汇量，靠扫读定位。目标是 12 分钟内拿 8 题以上，低于 6 题说明扫读方法还没建立，先练"题干划词 → 扫段落找改写"这两步。</div></div>';
  $('app').insertAdjacentHTML('afterbegin',h);
  window.scrollTo(0,0);
};

/* ---------- 选词填空 ---------- */
var CS={};
function renderCloze(id){
  var c=null; B.cloze.forEach(function(x){ if(x.id===id) c=x });
  if(!c){ $('app').innerHTML='<div class="card">找不到这篇。<button onclick="location.href=\'#/bank\'">回题库</button></div>'; return }
  CS={c:c,ans:{}};
  var h=switchesHTML();
  h+='<div class="card"><h1>'+esc(c.title)+'<span class="pill">选词填空</span><span class="pill a">10 题 × 3.55 分</span></h1>';
  h+='<p class="sub">'+esc(c.note||'')+'</p>';
  h+='<p class="hint" style="margin-bottom:10px"><b>提醒：</b>这 10 题满分只有 35.5 分，是全卷最便宜的题型。考场上建议最后 5 分钟做，不会就按词性蒙。</p>';
  var oh='<div style="margin:8px 0 14px;font-size:14px">';
  c.words15.forEach(function(w,i){ oh+='<span style="display:inline-block;margin:3px 12px 3px 0"><b>'+letter(i)+'.</b> '+esc(w)+'</span>' });
  oh+='</div>';
  h+=oh;
  var parts=c.text.split(/\{\{(\d+)\}\}/);
  var body='';
  for(var i=0;i<parts.length;i++){
    if(i%2===0){ body+=esc(parts[i]).replace(/\n\n/g,'</p><p style="margin:0 0 10px">').replace(/\n/g,'<br>') }
    else{
      var n=parts[i];
      var sel='<select onchange="CET6.clozePick('+n+',this.value)"><option value="">—</option>';
      c.words15.forEach(function(w){ sel+='<option value="'+w+'">'+w+'</option>' });
      sel+='</select>';
      body+='<b style="color:#185FA5">['+n+']</b> '+sel+' ';
    }
  }
  h+='<div class="passage"><p style="margin:0 0 10px">'+body+'</p></div>';
  h+='<div class="center" style="margin-top:16px"><button class="primary big" onclick="CET6.gradeCloze()">提交并查看解析</button></div>';
  h+='<div id="clz"></div></div>';
  $('app').innerHTML=h;
}
C.clozePick=function(n,v){ CS.ans[n]=v };
C.gradeCloze=function(){
  var c=CS.c, ok=0, rows='';
  Object.keys(c.ans).forEach(function(n){
    var got=CS.ans[n], right=(got&&got===c.ans[n]);
    if(right) ok++;
    rows+='<tr><td>'+n+'</td><td class="n" style="color:'+(right?'#3B6D11':'#A32D2D')+'">'+(got||'未答')+'</td><td class="n" style="color:#3B6D11">'+esc(c.ans[n])+'</td></tr>';
  });
  var h='<div class="card"><h2>结果</h2><div class="grid">';
  h+='<div class="mc"><div class="l">正确率</div><div class="v">'+Math.round(ok/10*100)+'%</div></div>';
  h+='<div class="mc"><div class="l">对 / 总</div><div class="v">'+ok+' / 10</div></div>';
  h+='<div class="mc"><div class="l">折合分值</div><div class="v">'+(Math.round(ok*3.55*10)/10)+'</div><div class="l">满分 35.5</div></div></div>';
  h+='<table><tr><th>空</th><th class="n">你的答案</th><th class="n">正确答案</th></tr>'+rows+'</table>';
  h+='<div style="font-size:14px;margin-top:10px">错得多不用焦虑——这题本来就最吃词汇量，而它只值 35.5 分。真正的补救是：把错的词记进生词本，然后把考场上花在它身上的时间压缩到 5 分钟。</div></div>';
  $('app').insertAdjacentHTML('afterbegin',h);
  window.scrollTo(0,0);
};

/* ---------- 设置 ---------- */
function renderSettings(){
  var s=C.settings, a=s.ai||{};
  var h='<div class="card"><h1>设置</h1><p class="sub">提示开关、AI 接口、导入试卷。</p></div>';
  h+='<div class="card"><h3>学习提示</h3>';
  h+=switchesHTML();
  h+='<p class="hint">「辅助提示 强」会直接显示正确答案和解析——适合第一次学时用；学会之后调到「关闭」做模拟考试。</p></div>';

  h+='<div class="card"><h3>AI 接口（可选）</h3>';
  h+='<p class="sub">不填也能用，词典没收录的词就没有提示。填了之后：词典查不到的词会自动问 AI；你也可以让它生成更多解析。</p>';
  h+='<label class="chk"><input type="checkbox" id="aiOn"'+(a.enabled?' checked':'')+'>启用 AI</label>';
  h+='<div class="row"><label class="f">API Base URL（OpenAI 兼容格式）</label><input type="text" id="aiUrl" value="'+esc(a.baseUrl||'')+'" placeholder="https://api.openai.com/v1"></div>';
  h+='<div class="row"><label class="f">API Key</label><input type="password" id="aiKey" value="'+esc(a.key||'')+'"></div>';
  h+='<div class="row"><label class="f">模型</label><input type="text" id="aiModel" value="'+esc(a.model||'gpt-4o-mini')+'"></div>';
  h+='<button class="primary" onclick="CET6.saveAI()">保存并测试连接</button> <span class="hint" id="aiMsg"></span>';
  h+='<p class="hint">Key 只存在你本机浏览器里，不会上传。注意：从浏览器直连 API 需要该服务允许跨域（CORS）。</p></div>';

  h+='<div class="card"><h3>导入试卷</h3>';
  h+='<p class="sub">拿到官方真题或任何其他题目后，按下面的格式粘进来。保存后会出现在题库里。</p>';
  h+='<details><summary>格式说明与示例（点开）</summary>';
  h+='<pre style="background:#F5F4F1;padding:12px;border-radius:8px;font-size:12px;overflow:auto">'+esc(JSON.stringify({
    type:'reading', id:'MY01', title:'我的文章', topic:'科普',
    text:[['English paragraph...','中文翻译...']],
    qs:[{n:1,type:'main',q:'What is the passage mainly about?',
      o:['A项','B项','C项','D项'],a:1,
      loc:'原文依据（英文）', locZh:'原文依据（中文）',
      why:'为什么选它', trap:['干扰项A为什么错','C为什么错','D为什么错'],
      l2:'去第几段找', guess:'没读懂时怎么猜'}]
  },null,2))+'</pre>';
  h+='<p class="hint">type 可选 reading / listening / cloze / matching。a 是正确选项下标（0 开始）。type 可选 main / detail / meaning / attitude / infer。locZh、guess、l2 可以省略。</p></details>';
  h+='<div class="row"><label class="f">试卷 JSON</label><textarea id="impJson" placeholder="在这里粘贴 JSON"></textarea></div>';
  h+='<button onclick="CET6.doImport()">导入</button> <span class="hint" id="impMsg"></span></div>';

  h+='<div class="card"><h3>数据</h3>';
  h+='<button onclick="if(confirm(\'清空所有本地数据？\'))CET6.wipe()">清空本地数据</button>';
  h+='<p class="hint">清空后需要重新测评。</p></div>';
  $('app').innerHTML=h;
}
C.saveAI=function(){
  C.settings.ai={
    enabled:$('aiOn').checked,
    baseUrl:$('aiUrl').value.trim(),
    key:$('aiKey').value.trim(),
    model:$('aiModel').value.trim()||'gpt-4o-mini'
  };
  C.saveSettings();
  var m=$('aiMsg'); m.textContent='已保存，测试中…';
  if(!C.aiReady()){ m.textContent='未启用或信息不全，已保存。'; return }
  C.aiDefine('serendipity','').then(function(d){
    m.textContent = d? ('连接成功，返回：'+d) : '连接失败，请检查地址/Key/跨域设置。';
  });
};
C.doImport=function(){
  var m=$('impMsg');
  try{
    var p=JSON.parse($('impJson').value);
    if(!p.id||!p.type) throw new Error('缺少 id 或 type');
    if(p.type==='reading'&&(!p.text||!p.qs)) throw new Error('reading 需要 text 与 qs');
    var arr=C.get('cet6_imported',[]);
    arr=arr.filter(function(x){return x.id!==p.id});
    arr.push(p); C.set('cet6_imported',arr);
    if(p.type==='reading'){ B.readings.push(p) }
    m.textContent='导入成功，去题库里打开。';
  }catch(e){ m.textContent='导入失败：'+e.message }
};
C.wipe=function(){
  ['cet6_settings_v1','cet6_profile_v1','cet6_dictcache_v1','cet6_imported'].forEach(function(k){localStorage.removeItem(k)});
  location.href='#/home'; location.reload();
};

/* ---------- 启动 ---------- */
window.addEventListener('hashchange',route);
if('speechSynthesis' in window){ speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged=function(){speechSynthesis.getVoices()} }
route();
})();
