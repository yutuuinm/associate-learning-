/* 导入模块：PDF / TXT / 粘贴文本 → 自动解析 → 可视化校对 → 存入题库
   不依赖任何命令行或技术操作 */
(function(){
var C = window.CET6;
var esc = C.esc;
var IMP = C.IMP = {};
var ST = {raw:'', parsed:null, srcName:''};

/* ============ 1. 文本解析 ============ */

/* 一行里可能有多个选项：A. xxx B. yyy C. zzz */
function splitInlineOpts(line){
  var re = /(?:^|\s)([A-D])\s*[.、．)）:：]\s*/g, pos = [], m;
  while((m = re.exec(line))){
    if(m[1] && pos.length && pos[pos.length-1].k >= m[1]) continue;
    pos.push({k:m[1], start:m.index, end:m.index + m[0].length});
  }
  if(pos.length < 2) return null;
  var out = [];
  for(var i=0;i<pos.length;i++){
    var end = (i+1 < pos.length) ? pos[i+1].start : line.length;
    out.push({k:pos[i].k, v:line.slice(pos[i].end, end).trim(), start:pos[i].start});
  }
  return out;
}

var RE_QNO   = /^\s*(\d{1,3})\s*[.、．)）]\s*(.+)$/;
var RE_OPT   = /^\s*([A-D])\s*[.、．)）:：]\s*(.+)$/;
var RE_ANSWER_LINE = /(答案|参考答案|Answer|Answers|Key|Keys|KEY)\s*[:：]?/i;

/* 解析答案块。支持：
   "1-5 BCADB" / "56-60: BDACA" / "1.B 2.C 3.A" / "答案：1-5 BCADB" */
function parseAnswers(lines){
  var ans = {};
  lines.forEach(function(line){
    var raw = line.trim();
    if(!raw) return;
    /* 范围式：1-5 BCADB */
    var m = raw.match(/(\d{1,3})\s*[-–—~至]\s*(\d{1,3})\s*[:：]?\s*([A-E\s,，]{1,60})$/);
    if(m){
      var a = +m[1], b = +m[2];
      var ls = (m[3].match(/[A-E]/g) || []);
      for(var k=0; k<ls.length && (a+k) <= b; k++) ans[a+k] = ls[k];
      return;
    }
    /* 只在疑似答案行里做单题匹配：含"答案/Key"字样，或整行全是 题号+字母 的组合 */
    var looksLikeKey = RE_ANSWER_LINE.test(raw) ||
      (/^\s*(\d{1,3}\s*[.、．)）]?\s*[A-E]\s*[,，;；\s]*)+$/.test(raw));
    if(!looksLikeKey) return;
    var re = /(\d{1,3})\s*[.、．)）:：]\s*([A-E])(?![A-Za-z])/g, mm, hit = 0;
    while((mm = re.exec(raw))){ ans[+mm[1]] = mm[2]; hit++ }
    if(!hit && RE_ANSWER_LINE.test(raw)){
      var only = raw.replace(RE_ANSWER_LINE,'').trim();
      if(/^[A-E]$/.test(only)) ans.__last = only;
    }
  });
  return ans;
}

/* 主解析：切出文章段落、题目、选项 */
IMP.parse = function(text){
  text = String(text||'').replace(/\r\n?/g,'\n');
  var lines = text.split('\n');
  var answers = parseAnswers(lines);

  var paras = [], qs = [], cur = null, started = false;
  var buf = [], ansSingle = {};

  function flushPara(){
    var s = buf.join('\n').trim();
    if(s) paras.push(s);
    buf = [];
  }

  lines.forEach(function(line){
    var t = line.trim();
    if(!t){ if(!started) buf.push(''); return }

    /* 答案行不进正文（否则会粘到选项末尾） */
    if(RE_ANSWER_LINE.test(t)){
      var only = t.replace(RE_ANSWER_LINE, '').trim();
      /* 范围式 "1-5 BCADB"：已由 parseAnswers 处理 */
      if(/(\d{1,3})\s*[-–—~至]\s*(\d{1,3})/.test(t)) return;
      /* 紧跟某题的单个字母 "答案：B"：挂到当前题 */
      if(/^[A-E]$/.test(only) && cur){ ansSingle[cur.n] = only; return }
      /* 题号+字母串 "1.B 2.C"：也已由 parseAnswers 处理 */
      if(/^\s*(\d{1,3}\s*[.、．)）:：]?\s*[A-E]\s*[,，;；\s]*)+$/.test(only)) return;
    }

    var mq = t.match(RE_QNO);
    var mo = t.match(RE_OPT);

    /* 题号行。注意 PDF 复制常见「题干和选项挤在同一行」，要就地拆开 */
    if(mq && !mo){
      var n = +mq[1];
      if(n >= 1 && n <= 200){
        var rest = mq[2];
        var inline = splitInlineOpts(rest);
        flushPara();
        started = true;
        if(inline && inline.length >= 2){
          cur = {n:n, q:rest.slice(0, inline[0].start).trim(), o:inline.map(function(x){ return {k:x.k, v:x.v} })};
        }else{
          cur = {n:n, q:rest.trim(), o:[]};
        }
        qs.push(cur);
        return;
      }
    }

    if(mo && cur){
      cur.o.push({k:mo[1], v:mo[2].trim()});
      return;
    }
    var inline = splitInlineOpts(t);
    if(inline && cur){
      inline.forEach(function(x){ cur.o.push({k:x.k, v:x.v}) });
      return;
    }

    /* 其他文本 */
    if(cur){
      /* 还没有选项 → 题干续行；已有选项 → 选项续行 */
      if(cur.o.length === 0) cur.q += ' ' + t;
      else cur.o[cur.o.length-1].v += ' ' + t;
    }else{
      buf.push(t);
      started = true;
    }
  });
  flushPara();

  /* 整理 */
  qs = qs.filter(function(q){ return q.o.length >= 2 });
  qs.forEach(function(q){
    /* 只保留 A-D，按字母排序，补齐到 4 个 */
    var map = {};
    q.o.forEach(function(x){ if(!map[x.k]) map[x.k] = x.v });
    q.o = ['A','B','C','D'].map(function(k){ return map[k] != null ? map[k] : '' });
    var an = answers[q.n] || ansSingle[q.n];
    q.ansLetter = an || '';
    q.a = an ? (an.charCodeAt(0) - 65) : 0;
  });

  /* 段落合并：把连续短行合成段 */
  var merged = [], tmp = '';
  paras.forEach(function(p){
    if(!p){ if(tmp){ merged.push(tmp); tmp='' } return }
    if(tmp && /[.。!?！？]$/.test(tmp) === false && tmp.length < 200){ tmp += ' ' + p }
    else { if(tmp) merged.push(tmp); tmp = p }
  });
  if(tmp) merged.push(tmp);

  return {paras:merged, qs:qs, answers:answers, raw:text};
};

/* ============ 2. PDF 文本提取 ============ */
IMP.pdfReady = false;
IMP.loadPDF = function(cb){
  if(window.pdfjsLib){ IMP.pdfReady = true; cb(true); return }
  if(IMP.__loading){ IMP.__loading.push(cb); return }
  IMP.__loading = [cb];
  var s = document.createElement('script');
  s.src = 'js/lib/pdf.min.js';
  s.onload = function(){
    try{
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/lib/pdf.worker.min.js';
      IMP.pdfReady = true;
    }catch(e){}
    var l = IMP.__loading; IMP.__loading = null;
    l.forEach(function(f){ f(IMP.pdfReady) });
  };
  s.onerror = function(){
    var l = IMP.__loading; IMP.__loading = null;
    l.forEach(function(f){ f(false) });
  };
  document.head.appendChild(s);
};

IMP.extractPDF = function(file, onProgress, cb){
  IMP.loadPDF(function(ok){
    if(!ok){ cb(null, 'PDF 解析库加载失败。可以改用「粘贴文本」：在 PDF 里全选复制，粘到下面的框里。'); return }
    var fr = new FileReader();
    fr.onload = function(){
      var data = new Uint8Array(fr.result);
      window.pdfjsLib.getDocument({data:data}).promise.then(function(pdf){
        var total = pdf.numPages, out = [], i = 1;
        function next(){
          if(i > total){
            var txt = out.join('\n\n');
            if(txt.replace(/\s/g,'').length < 50){
              cb(null, '这个 PDF 里没提取到文字，多半是扫描件（图片版）。请用「粘贴文本」或找有文字的版本。');
            }else cb(txt, null);
            return;
          }
          onProgress && onProgress(i, total);
          pdf.getPage(i).then(function(page){
            return page.getTextContent();
          }).then(function(tc){
            var line = '', lastY = null;
            tc.items.forEach(function(it){
              if(lastY !== null && Math.abs(it.transform[5] - lastY) > 3){
                out.push(line); line = '';
              }
              line += it.str;
              lastY = it.transform[5];
              if(/[.。!?？]$/.test(it.str)){ out.push(line); line = '' }
            });
            if(line) out.push(line);
            i++; next();
          }).catch(function(){ i++; next() });
        }
        next();
      }).catch(function(e){ cb(null, 'PDF 读取失败：' + (e && e.message || e)) });
    };
    fr.onerror = function(){ cb(null, '文件读取失败') };
    fr.readAsArrayBuffer(file);
  });
};

/* ============ 3. 导入页面 ============ */
IMP.render = function(){
  var h = '';
  h += '<div class="card"><h1>导入题目</h1>';
  h += '<p class="sub">上传 PDF / TXT，或直接把题目粘贴进来。系统会自动拆出文章、题干和选项，你核对一下答案就能存进题库。</p></div>';

  if(!ST.parsed){
    h += '<div class="card"><h3>第一步：把题目弄进来</h3>';
    h += '<div id="drop" style="border:1.5px dashed rgba(0,0,0,.25);border-radius:12px;padding:28px 20px;text-align:center;background:#FAFAF8">';
    h += '<div style="font-size:14px;margin-bottom:6px">把 PDF 或 TXT 拖到这里，或者点下面选文件</div>';
    h += '<div class="hint">支持 PDF（有文字的版本）、TXT、MD。扫描版 PDF 没有文字层，请用下面的粘贴方式。</div>';
    h += '<div style="margin-top:14px"><input type="file" id="file" accept=".pdf,.txt,.md,.text"></div></div>';
    h += '<div class="row" style="margin-top:16px"><label class="f">或者直接粘贴题目文本（从 PDF 里全选复制也行）</label>';
    h += '<textarea id="paste" style="min-height:180px" placeholder="把整篇内容粘进来，包含文章、题目、选项。答案如果写在文末（比如「1-5 BCADB」）也能自动识别。"></textarea></div>';
    h += '<div style="margin-top:12px"><button class="primary" onclick="CET6.IMP.doParse()">开始解析</button> ';
    h += '<span class="hint" id="pmsg"></span></div>';
    h += '</div>';

    h += '<div class="card"><h3>解析能力说明</h3><ul class="list">';
    h += '<li><span class="tag">自动</span><span>识别题号（1. / 56. / Q1）、选项（A) A. A、）、文章段落</span></li>';
    h += '<li><span class="tag">自动</span><span>识别文末答案：「1-5 BCADB」「答案：56-60 BDACA」「1.B 2.C」这几种都能认</span></li>';
    h += '<li><span class="tag">需核对</span><span>PDF 复制常带乱码、断行、页眉页脚。解析后请你校对一遍，尤其是答案</span></li>';
    h += '<li><span class="tag">AI 可选</span><span>在设置里配了 API 的话，可以一键生成中文翻译和解析</span></li>';
    h += '</ul></div>';
  }else{
    h += IMP.previewHTML();
  }
  C.$('app').innerHTML = h;
  if(!ST.parsed) bindDrop();
};

function bindDrop(){
  var d = C.$('drop'), f = C.$('file');
  if(!d) return;
  ['dragenter','dragover'].forEach(function(ev){
    d.addEventListener(ev, function(e){ e.preventDefault(); d.style.borderColor = '#185FA5' });
  });
  ['dragleave','drop'].forEach(function(ev){
    d.addEventListener(ev, function(e){ e.preventDefault(); d.style.borderColor = 'rgba(0,0,0,.25)' });
  });
  d.addEventListener('drop', function(e){
    var file = e.dataTransfer.files && e.dataTransfer.files[0];
    if(file) handleFile(file);
  });
  if(f) f.addEventListener('change', function(){ if(f.files[0]) handleFile(f.files[0]) });
}

function handleFile(file){
  var msg = C.$('pmsg');
  ST.srcName = file.name;
  if(/\.(txt|md|text)$/i.test(file.name)){
    var fr = new FileReader();
    fr.onload = function(){ C.$('paste').value = fr.result; msg.textContent = '已读取 ' + file.name + '，点「开始解析」'; };
    fr.readAsText(file, 'utf-8');
    return;
  }
  if(/\.pdf$/i.test(file.name)){
    msg.textContent = '正在读取 PDF…';
    IMP.extractPDF(file, function(p, t){
      msg.textContent = '正在读取 PDF 第 ' + p + ' / ' + t + ' 页…';
    }, function(txt, err){
      if(err){ msg.textContent = err; return }
      C.$('paste').value = txt;
      msg.textContent = 'PDF 已提取 ' + txt.length + ' 字，点「开始解析」';
    });
    return;
  }
  if(/^image\//i.test(file.type)){
    msg.textContent = '图片需要先做文字识别，本工具暂不支持。请用「粘贴文本」，或在手机/电脑上把图片里的文字复制出来。';
    return;
  }
  msg.textContent = '不认识的文件类型，请用 PDF / TXT，或粘贴文本。';
}

IMP.doParse = function(){
  var t = C.$('paste').value || '';
  if(t.trim().length < 30){ C.$('pmsg').textContent = '内容太少，没有可解析的东西'; return }
  ST.raw = t;
  ST.parsed = IMP.parse(t);
  IMP.render();
};

/* ============ 4. 校对预览 ============ */
var TYPES = [['main','主旨题'],['detail','细节题'],['meaning','词义句意题'],['attitude','态度题'],['infer','推断题']];

IMP.previewHTML = function(){
  var p = ST.parsed;
  var h = '';
  h += '<div class="card"><h2>第二步：核对一下</h2>';
  h += '<p class="sub">解析出 <b>' + p.qs.length + '</b> 道题、<b>' + p.paras.length + '</b> 个段落。答案如果没自动识别出来，请手动选——这是唯一必须核对的地方。</p>';
  h += '<div style="display:flex;gap:12px;flex-wrap:wrap;margin:10px 0">';
  h += '<button onclick="CET6.IMP.save()">存入题库</button>';
  h += '<button onclick="CET6.IMP.reset()">重新导入</button>';
  if(C.aiReady()) h += '<button onclick="CET6.IMP.aiFill()">用 AI 生成翻译和解析</button>';
  h += '</div><span class="hint" id="smsg"></span></div>';

  h += '<div class="card"><h3>文章</h3>';
  h += '<div class="row"><label class="f">标题</label><input type="text" id="pTitle" value="' + esc(ST.srcName ? ST.srcName.replace(/\.[^.]+$/,'') : '导入的题目') + '"></div>';
  p.paras.forEach(function(t, i){
    h += '<div class="row"><label class="f">第 ' + (i+1) + ' 段（英文）</label>';
    h += '<textarea class="pEn" style="min-height:70px">' + esc(t) + '</textarea>';
    h += '<label class="f" style="margin-top:6px">中文翻译（可留空）</label>';
    h += '<textarea class="pZh" style="min-height:50px" placeholder="留空也能保存，只是划句翻译没有中文"></textarea></div>';
  });
  if(!p.paras.length){
    h += '<div class="row"><label class="f">没解析出段落，可以手动粘文章</label><textarea class="pEn" style="min-height:90px"></textarea>';
    h += '<textarea class="pZh" style="min-height:50px" placeholder="中文翻译（可留空）"></textarea></div>';
  }
  h += '</div>';

  h += '<div class="card"><h3>题目（' + p.qs.length + ' 道）</h3>';
  p.qs.forEach(function(q, idx){
    h += '<div class="card tight" style="background:#FAFAF8;margin:10px 0">';
    h += '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px">';
    h += '<b>第 ' + q.n + ' 题</b>';
    h += '<select class="qType" style="width:auto">';
    TYPES.forEach(function(t){ h += '<option value="' + t[0] + '">' + t[1] + '</option>' });
    h += '</select>';
    h += '<span>正确答案</span>';
    h += '<select class="qAns" style="width:auto">';
    ['A','B','C','D'].forEach(function(k, i){
      h += '<option value="' + i + '"' + (q.a === i ? ' selected' : '') + '>' + k + '</option>';
    });
    h += '</select>';
    if(!q.ansLetter) h += '<span class="pill a">答案未识别，请手动选</span>';
    h += '</div>';
    h += '<textarea class="qText" style="min-height:46px">' + esc(q.q) + '</textarea>';
    q.o.forEach(function(o, i){
      h += '<div style="display:flex;gap:8px;align-items:center;margin-top:5px"><b style="min-width:14px">' + 'ABCD'[i] + '</b>';
      h += '<input type="text" class="qOpt" value="' + esc(o) + '"></div>';
    });
    h += '<label class="f" style="margin-top:8px">解析（可留空）</label>';
    h += '<textarea class="qWhy" style="min-height:44px" placeholder="为什么选这个答案"></textarea>';
    h += '</div>';
  });
  if(!p.qs.length){
    h += '<p class="sub">没解析出题目。可能是格式太乱，建议回到上一步，把文本整理成「1. 题干 / A. 选项」的样子再试。</p>';
  }
  h += '</div>';
  h += '<div class="card center"><button class="primary big" onclick="CET6.IMP.save()">存入题库</button></div>';
  return h;
};

IMP.reset = function(){ ST.parsed = null; ST.raw = ''; IMP.render() };

function collectAll(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)) }

IMP.save = function(){
  var msg = C.$('smsg');
  var ens = collectAll('.pEn'), zhs = collectAll('.pZh');
  var text = ens.map(function(e, i){ return [e.value.trim(), (zhs[i] ? zhs[i].value.trim() : '')] })
                .filter(function(x){ return x[0] });
  if(!text.length){ msg.textContent = '文章内容是空的，至少填一段'; return }

  var types = collectAll('.qType'), anss = collectAll('.qAns'),
      qts = collectAll('.qText'), whys = collectAll('.qWhy'),
      opts = collectAll('.qOpt');

  var qs = [];
  ST.parsed.qs.forEach(function(q, i){
    var o = [];
    for(var k=0;k<4;k++){ o.push(opts[i*4+k] ? opts[i*4+k].value.trim() : '') }
    if(o.filter(function(x){return x}).length < 2) return;
    qs.push({
      n: i+1,
      type: (types[i] ? types[i].value : 'detail'),
      q: (qts[i] ? qts[i].value.trim() : ''),
      o: o,
      a: +(anss[i] ? anss[i].value : 0),
      why: (whys[i] ? whys[i].value.trim() : '') || '（导入时未填解析）',
      trap: [], l2: '', guess: '', loc: '', locZh: ''
    });
  });

  var title = (C.$('pTitle') ? C.$('pTitle').value.trim() : '') || '导入的题目';
  var item = {
    type: 'reading',
    id: 'IMP' + Date.now(),
    title: title,
    topic: '导入',
    src: 'user',
    text: text,
    qs: qs
  };
  if(!qs.length){ msg.textContent = '没有有效题目，至少要有题干和两个选项'; return }

  var arr = C.get('cet6_imported', []);
  arr.push(item);
  C.set('cet6_imported', arr);
  C.BANK.readings.push(item);
  msg.textContent = '已存入题库：' + qs.length + ' 道题';
  setTimeout(function(){ location.href = '#/bank' }, 700);
};

/* AI 补全：段落中文 + 每题解析 */
IMP.aiFill = async function(){
  if(!C.aiReady()){ alert('先在设置里配置 AI 接口'); return }
  var msg = C.$('smsg');
  var ens = collectAll('.pEn'), zhs = collectAll('.pZh');
  msg.textContent = 'AI 正在翻译段落…';
  for(var i=0;i<ens.length;i++){
    var t = ens[i].value.trim();
    if(!t) continue;
    var zh = await C.aiChat('把下面这段英文翻译成中文，只输出译文，不要任何解释：\n\n' + t, 900);
    if(zh && zhs[i]) zhs[i].value = zh;
  }
  var qts = collectAll('.qText'), whys = collectAll('.qWhy'),
      anss = collectAll('.qAns'), types = collectAll('.qType'), opts = collectAll('.qOpt');
  msg.textContent = 'AI 正在生成解析…';
  for(var j=0;j<qts.length;j++){
    var q = qts[j].value.trim();
    if(!q) continue;
    var o = [];
    for(var k=0;k<4;k++) o.push(opts[j*4+k] ? opts[j*4+k].value.trim() : '');
    var right = o[+(anss[j] ? anss[j].value : 0)] || '';
    var prompt = '这是一道大学英语六级题。题干：' + q + '\n选项：' + o.map(function(x,idx){ return 'ABCD'[idx] + '. ' + x }).join(' | ') +
      '\n正确答案：' + 'ABCD'[+(anss[j] ? anss[j].value : 0)] + '（' + right + '）\n' +
      '请用中文写一段 60–120 字的解析，说明：为什么这个答案对，以及三个干扰项各自的错处。只输出解析正文。';
    var r = await C.aiChat(prompt, 400);
    if(r && whys[j]) whys[j].value = r;
  }
  msg.textContent = 'AI 已补全，核对一下再保存';
};

})();
