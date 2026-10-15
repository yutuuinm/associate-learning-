/* 云端同步：把生词本、答题记录、每日新词、AI 助记缓存备份到你自己的 Supabase
   设计原则：**本地优先**——云挂了、网断了，照样能学，只是不同步
   所有请求失败都静默降级，最多提示一次，不刷屏 */
window.CET6 = window.CET6 || {};

(function(){
var C = window.CET6;
/* 注意：stats.js 在本文件之后加载，所以这里不能提前抓 C.STATS 的引用，
   否则第一次同步会在 S.srsAll() 上抛异常、被 catch 吞掉，表现成"连不上"。 */
function ST(){ return C.STATS || {} }
var CL = C.CLOUD = {};
var KEY = 'cet6_cloud_v1', K_LOGIDX = 'cet6_cloud_logidx';

var DEF = {
  enabled: false,
  url: 'https://tecrddvuedpcekictjsp.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlY3JkZHZ1ZWRwY2VraWN0anNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMzIzMjksImV4cCI6MjEwNzYwODMyOX0.9iwagTLA-2PRq7njtygQDzPfUU3LzPyaCEHej5tVfTA',
  auto: true,
  last: 0
};
CL.cfg = Object.assign({}, DEF, C.get(KEY, {}));
CL.state = CL.cfg.enabled ? 'on' : 'off';
CL.msg = '';
CL.save = function(){ C.set(KEY, {enabled:CL.cfg.enabled, url:CL.cfg.url, key:CL.cfg.key, auto:CL.cfg.auto, last:CL.cfg.last}) };
CL.ready = function(){ return !!(CL.cfg.enabled && CL.cfg.url && CL.cfg.key) };

/* 这批数据归谁：登录了就是这个账号的 id，没登录落在 'anon' 公共区
   表的主键都是 (user_id, ...)，所以不同账号的同名数据不会互相覆盖 */
CL.uid = function(){
  try{ var u = C.ACC && C.ACC.cur ? C.ACC.cur() : null; return u ? u.id : 'anon' }
  catch(e){ return 'anon' }
};
function who(){ return 'user_id=eq.' + encodeURIComponent(CL.uid()) }

function base(){ return String(CL.cfg.url||'').replace(/\/+$/,'') + '/rest/v1/' }
function hdr(extra){
  var h = { apikey: CL.cfg.key, Authorization: 'Bearer ' + CL.cfg.key,
            'Content-Type': 'application/json' };
  if(extra) Object.keys(extra).forEach(function(k){ h[k] = extra[k] });
  return h;
}
function req(path, opt){
  if(typeof fetch !== 'function') return Promise.reject(new Error('当前环境不支持联网'));
  return fetch(base() + path, opt).then(function(r){
    if(!r.ok) throw new Error('HTTP ' + r.status);
    var t = r.headers && r.headers.get && r.headers.get('content-type');
    if(t && t.indexOf('json') >= 0) return r.json();
    return r.text();
  });
}

/* ---------- 状态播报 ---------- */
function set(state, msg){
  CL.state = state; CL.msg = msg || '';
  if(C.TOOLS && C.TOOLS.toast) {
    if(state === 'err' && !CL._errShown){ CL._errShown = 1; C.TOOLS.toast('云端没连上，先用本地的' + (msg?('（'+msg+')'):''), 3000) }
    if(state === 'ok') CL._errShown = 0;
  }
  if(C.CLOUDUI && C.CLOUDUI.paint) C.CLOUDUI.paint();
}

/* ---------- 连通性测试 ---------- */
CL.test = function(){
  if(!CL.ready()){ set('off',''); return Promise.resolve(false) }
  return req('study_words?select=word&limit=1&' + who(), { headers: hdr() })
    .then(function(){ set('ok',''); return true })
    .catch(function(e){ set('err', e.message); return false });
};

/* ---------- 生词本：双向合并，谁新听谁的 ---------- */
function rowsFor(m){
  var uid = CL.uid();
  return Object.keys(m).map(function(k){
    var it = m[k] || {};
    return { user_id:uid, word:k, def:it.d||'', ctx_en:it.c||'', ctx_zh:it.cz||'', src:it.src||'', hl:it.hl||'',
             ef:it.ef||2.5, iv:it.iv||1, rep:it.rep||0, due:it.due||'', added_at:it.add||0,
             updated_at:it.up||it.add||0 };
  });
}
function chunk(a, n){
  var out = [];
  for(var i=0;i<a.length;i+=n) out.push(a.slice(i, i+n));
  return out;
}
function mergeLocal(remote){
  var m = ST().srsAll(), changed = 0;
  (remote||[]).forEach(function(r){
    var k = String(r.word||'').toLowerCase(); if(!k) return;
    var it = m[k];
    if(!it){
      m[k] = {w:k, d:r.def||'', c:r.ctx_en||'', cz:r.ctx_zh||'', src:r.src||'', hl:r.hl||'',
              ef:r.ef||2.5, iv:r.iv||1, rep:r.rep||0, due:r.due||'',
              add:r.added_at||Date.now(), up:r.updated_at||Date.now()};
      changed++;
    }else{
      /* 远端更新就补到本地（例如另一台设备练过的复习进度） */
      if((r.updated_at||0) > (it.up||0)){
        it.d = r.def || it.d; it.c = r.ctx_en || it.c; it.cz = r.ctx_zh || it.cz;
        it.src = r.src || it.src; it.hl = r.hl || it.hl;
        it.ef = r.ef || it.ef; it.iv = r.iv || it.iv; it.rep = r.rep || it.rep;
        it.due = r.due || it.due; it.up = r.updated_at;
        changed++;
      }
    }
  });
  if(changed) C.set('cet6_srs_v1', m);
  return changed;
}
CL.pullWords = function(){
  return req('study_words?select=*&' + who(), { headers: hdr() }).then(function(rows){ return mergeLocal(rows) });
};
CL.pushWords = function(){
  var rows = rowsFor(ST().srsAll());
  if(!rows.length) return Promise.resolve(0);
  var jobs = chunk(rows, 200).map(function(c){
    return req('study_words', { method:'POST', headers: hdr({Prefer:'resolution=merge-duplicates,return=minimal'}),
      body: JSON.stringify(c) });
  });
  return Promise.all(jobs).then(function(){ return rows.length });
};

/* ---------- 答题记录：只增量上传 ---------- */
CL.pushLog = function(){
  var logs = ST().logs(), from = C.get(K_LOGIDX, 0);
  var add = logs.filter(function(r){ return (r.t||0) > from });
  if(!add.length) return Promise.resolve(0);
  var uid = CL.uid();
  var rows = add.map(function(r){
    return { user_id:uid, ts:r.t||0, day:r.d||'', kind:r.kind||'', sid:r.sid||'', qn:r.qn||0,
             qtype:r.type||'', ok:r.ok||0, pick:r.pick==null?-1:r.pick, ms:r.ms||0, hint:r.hint||0 };
  });
  var jobs = chunk(rows, 500).map(function(c){
    return req('study_log', { method:'POST', headers: hdr({Prefer:'return=minimal'}), body: JSON.stringify(c) });
  });
  return Promise.all(jobs).then(function(){
    var max = 0; add.forEach(function(r){ if((r.t||0) > max) max = r.t });
    C.set(K_LOGIDX, max || Date.now());
    return rows.length;
  });
};

/* ---------- 每日新词清单：取并集 ---------- */
CL.syncDaily = function(){
  var local = C.get('cet6_wday_v1', {}), uid = CL.uid();
  var rows = [];
  Object.keys(local).forEach(function(d){
    (local[d]||[]).forEach(function(w){ rows.push({user_id:uid, day:d, word:w, added_at:Date.now(), reviewed:0}) });
  });
  var push = rows.length
    ? (chunk(rows, 500).map(function(c){
        return req('daily_words', { method:'POST', headers: hdr({Prefer:'resolution=merge-duplicates,return=minimal'}), body: JSON.stringify(c) });
      }))
    : [Promise.resolve()];
  return Promise.all(push).then(function(){
    return req('daily_words?select=day,word&' + who(), { headers: hdr() });
  }).then(function(remote){
    var ch = 0;
    (remote||[]).forEach(function(r){
      var d = r.day, w = String(r.word||'').toLowerCase();
      if(!d || !w) return;
      if(!local[d]) local[d] = [];
      if(local[d].indexOf(w) < 0){ local[d].push(w); ch++ }
    });
    if(ch) C.set('cet6_wday_v1', local);
    return ch;
  });
};

/* ---------- AI 助记缓存：取新 ---------- */
CL.syncMem = function(){
  var local = ST().memAll(), uid = CL.uid();
  var rows = Object.keys(local).map(function(w){
    return { user_id:uid, word:w, memory: local[w].txt, updated_at: local[w].t||0 };
  });
  var push = rows.length
    ? (chunk(rows, 200).map(function(c){
        return req('word_memory', { method:'POST', headers: hdr({Prefer:'resolution=merge-duplicates,return=minimal'}), body: JSON.stringify(c) });
      }))
    : [Promise.resolve()];
  return Promise.all(push).then(function(){
    return req('word_memory?select=word,memory,updated_at&' + who(), { headers: hdr() });
  }).then(function(remote){
    var ch = 0;
    (remote||[]).forEach(function(r){
      var w = String(r.word||'').toLowerCase(); if(!w) return;
      var it = local[w];
      if(!it || (r.updated_at||0) > (it.t||0)){
        ST().memSet(w, r.memory || ''); local = ST().memAll(); ch++;
      }
    });
    return ch;
  });
};

/* ---------- 摘抄本：存在 app_settings 表的 notes 键里
   本地改动晚于云端就只推不拉（这样"清空"也能生效），否则取并集 ---------- */
CL.syncNotes = function(){
  if(!C.NOTE) return Promise.resolve(0);
  var K_TS = 'cet6_notes_ts';
  var localTs = C.get(K_TS, 0), local = C.NOTE.all(), uid = CL.uid();
  return req('app_settings?k=eq.notes&' + who() + '&select=v,updated_at', { headers: hdr() })
    .then(function(rows){
      var r = (rows||[])[0], remote = [], rts = 0;
      if(r && r.v){ rts = r.updated_at || 0; try{ remote = JSON.parse(r.v)||[] }catch(e){ remote = [] } }
      var out;
      if(localTs > rts){
        out = local;                                   /* 本地更新，以本地为准 */
      }else{
        out = local.slice();
        var seen = {}; out.forEach(function(x){ seen[x.t] = 1 });
        (remote||[]).forEach(function(x){ if(x && x.t && !seen[x.t]){ out.push(x); seen[x.t] = 1 } });
      }
      out.sort(function(a,b){ return (b.ts||0)-(a.ts||0) });
      if(out.length > 500) out = out.slice(0,500);
      C.set('cet6_notes_v1', out);
      C.set(K_TS, Math.max(localTs, rts));
      return req('app_settings', { method:'POST',
        headers: hdr({Prefer:'resolution=merge-duplicates,return=minimal'}),
        body: JSON.stringify({user_id:uid, k:'notes', v: JSON.stringify(out), updated_at: Date.now()}) })
        .then(function(){ return out.length }).catch(function(){ return 0 });
    })
    .catch(function(){ return 0 });
};

/* ---------- 一次完整同步 ---------- */
CL.busy = false;
CL.sync = function(silent){
  if(!CL.ready()){ set('off',''); return Promise.resolve(false) }
  if(CL.busy) return Promise.resolve(false);
  CL.busy = true; set('syncing','');
  return CL.test().then(function(ok){
    if(!ok) throw new Error('连不上');
    return CL.pullWords();
  }).then(function(){
    return CL.pushWords();
  }).then(function(){
    return CL.pushLog();
  }).then(function(){
    return CL.syncDaily();
  }).then(function(){
    return CL.syncMem();
  }).then(function(){
    return CL.syncNotes();
  }).then(function(){
    CL.busy = false;
    CL.cfg.last = Date.now(); CL.save();
    set('ok','');
    if(!silent && C.TOOLS) C.TOOLS.toast('已同步到云端');
    if(C.TOOLS && C.TOOLS.refreshBadges) C.TOOLS.refreshBadges();
    return true;
  }).catch(function(e){
    CL.busy = false;
    set('err', String(e.message||e).slice(0,60));
    return false;
  });
};

/* ---------- 自动同步：收词/做题后延时触发 ---------- */
var timer = null;
function schedule(){
  if(!CL.ready() || !CL.cfg.auto) return;
  if(timer) clearTimeout(timer);
  timer = setTimeout(function(){ timer = null; CL.sync(true) }, 4000);
}
CL.onWord = schedule;
CL.onAnswer = schedule;
CL.onMemory = schedule;
CL.onNote = schedule;

/* ---------- 设置 ---------- */
CL.setCfg = function(o){
  Object.keys(o).forEach(function(k){ CL.cfg[k] = o[k] });
  CL.save();
  set(CL.cfg.enabled ? 'on' : 'off', '');
  CL._errShown = 0;
};
CL.label = function(){
  if(!CL.cfg.enabled) return {t:'未开启', c:''};
  if(CL.state === 'syncing') return {t:'同步中…', c:'pending'};
  if(CL.state === 'err') return {t:'连不上（本地照常用）', c:'bad'};
  if(CL.state === 'ok') return {t:'已同步', c:'good'};
  return {t:'待同步', c:''};
};
/* 云端 AI 配置（可选，默认不同步——见设置页说明） */
CL.getAI = function(){
  return req('app_settings?k=eq.ai&' + who() + '&select=v', { headers: hdr() })
    .then(function(rows){
      var r = (rows||[])[0]; if(!r || !r.v) return null;
      try{ return JSON.parse(r.v) }catch(e){ return null }
    }).catch(function(){ return null });
};
CL.setAI = function(obj){
  return req('app_settings', { method:'POST',
    headers: hdr({Prefer:'resolution=merge-duplicates,return=minimal'}),
    body: JSON.stringify({user_id:CL.uid(), k:'ai', v: JSON.stringify(obj), updated_at: Date.now()}) })
    .then(function(){ return true }).catch(function(){ return false });
};
/* 这批云端数据现在挂在谁名下（给界面显示） */
CL.owner = function(){
  var uid = CL.uid();
  if(uid === 'anon') return '未登录（公共区）';
  var u = (C.ACC && C.ACC.cur) ? C.ACC.cur() : null;
  return u ? u.name : '未登录（公共区）';
};
})();
