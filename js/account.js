/* 账号系统：用户名 + 密码登录，每个账号的数据单独存放
 *
 * 两条设计底线：
 *   1) 密码永不明文落盘 —— 存的是 PBKDF2-HMAC-SHA256（6 万轮）的哈希 + 随机盐
 *   2) 不登录也能用 —— 这是本地优先的离线站点，账号是"把数据归拢到某人名下"，不是门禁
 *
 * 隔离怎么做到的：登录后所有学习数据的 localStorage 键统一加前缀 u:<uid>:，
 *   所以 A 和 B 在同一台机器、同一个浏览器里也不会看到对方的东西（见 core.js 的 C.get/C.set）
 *
 * 为什么自己写 SHA-256 而不用 crypto.subtle：
 *   subtle 只在"安全上下文"里保证可用，双击打开 file:// 的页面各浏览器表现不一；
 *   自己实现虽然慢一点（登录时一次性约 0.3~0.8 秒），但任何环境行为一致、也能被测试。
 */
window.CET6 = window.CET6 || {};

(function(){
var C = window.CET6;
var K_USERS = 'cet6_accounts_v1';    /* 账号表：全局，不能跟着账号走 */
var K_SESS  = 'cet6_session_v1';     /* 当前登录的是谁：全局 */
var ITER    = 60000;                 /* PBKDF2 轮数 */
var A = C.ACC = {};

/* ---------------- 哈希：SHA-256 / HMAC / PBKDF2 ---------------- */
var KT = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];

function u8(str){
  if(typeof TextEncoder === 'function'){ try{ return new TextEncoder().encode(str) }catch(e){} }
  var s = String(str), out = [], i, c;
  for(i=0;i<s.length;i++){
    c = s.charCodeAt(i);
    if(c < 0x80) out.push(c);
    else if(c < 0x800) out.push(0xc0|(c>>6), 0x80|(c&63));
    else out.push(0xe0|(c>>12), 0x80|((c>>6)&63), 0x80|(c&63));
  }
  return new Uint8Array(out);
}
function rotr(x, n){ return ((x >>> n) | (x << (32 - n))) >>> 0 }

function sha256(msg){
  var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  var ml = msg.length, blocks = Math.ceil((ml + 9) / 64), total = blocks * 64;
  var pad = new Uint8Array(total), i;
  pad.set(msg); pad[ml] = 0x80;
  var hi = Math.floor(ml / 536870912), lo = (ml * 8) >>> 0;   /* 长度按 bit 计，大端 64 位 */
  pad[total-8] = (hi>>>24)&255; pad[total-7] = (hi>>>16)&255; pad[total-6] = (hi>>>8)&255; pad[total-5] = hi&255;
  pad[total-4] = (lo>>>24)&255; pad[total-3] = (lo>>>16)&255; pad[total-2] = (lo>>>8)&255; pad[total-1] = lo&255;
  var w = new Int32Array(64);
  for(var b=0;b<blocks;b++){
    var off = b*64;
    for(i=0;i<16;i++) w[i] = (pad[off+i*4]<<24)|(pad[off+i*4+1]<<16)|(pad[off+i*4+2]<<8)|pad[off+i*4+3];
    for(i=16;i<64;i++){
      var x15 = w[i-15], x2 = w[i-2];
      var s0 = rotr(x15,7) ^ rotr(x15,18) ^ (x15>>>3);
      var s1 = rotr(x2,17) ^ rotr(x2,19) ^ (x2>>>10);
      w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
    }
    var a=H[0], bb=H[1], c=H[2], d=H[3], e=H[4], f=H[5], g=H[6], h=H[7];
    for(i=0;i<64;i++){
      var S1 = rotr(e,6) ^ rotr(e,11) ^ rotr(e,25);
      var ch = (e & f) ^ ((~e) & g);
      var t1 = (h + S1 + ch + KT[i] + w[i]) | 0;
      var S0 = rotr(a,2) ^ rotr(a,13) ^ rotr(a,22);
      var mj = (a & bb) ^ (a & c) ^ (bb & c);
      var t2 = (S0 + mj) | 0;
      h=g; g=f; f=e; e=(d+t1)|0; d=c; c=bb; bb=a; a=(t1+t2)|0;
    }
    H[0]=(H[0]+a)|0; H[1]=(H[1]+bb)|0; H[2]=(H[2]+c)|0; H[3]=(H[3]+d)|0;
    H[4]=(H[4]+e)|0; H[5]=(H[5]+f)|0; H[6]=(H[6]+g)|0; H[7]=(H[7]+h)|0;
  }
  var out = new Uint8Array(32);
  for(i=0;i<8;i++){
    out[i*4] = (H[i]>>>24)&255; out[i*4+1] = (H[i]>>>16)&255; out[i*4+2] = (H[i]>>>8)&255; out[i*4+3] = H[i]&255;
  }
  return out;
}
function hmac(key, msg){
  var B = 64, i;
  var k = key.length > B ? sha256(key) : key;
  var kk = new Uint8Array(B); kk.set(k);
  var ipad = new Uint8Array(B + msg.length), opad = new Uint8Array(B + 32);
  for(i=0;i<B;i++){ ipad[i] = kk[i] ^ 0x36; opad[i] = kk[i] ^ 0x5c; }
  ipad.set(msg, B);
  var inner = sha256(ipad);
  opad.set(inner, B);
  return sha256(opad);
}
function hex(a){
  var s = '';
  for(var i=0;i<a.length;i++){ var v = a[i].toString(16); s += (v.length<2?'0':'') + v }
  return s;
}
function unhex(s){
  var a = new Uint8Array(s.length/2);
  for(var i=0;i<a.length;i++) a[i] = parseInt(s.substr(i*2,2),16);
  return a;
}
/* PBKDF2：返回十六进制串。iter 轮，派生 32 字节 */
A.pbkdf2 = function(pwd, saltBytes, iter, dkLen){
  var key = u8(String(pwd)), n = Math.ceil((dkLen||32)/32), out = new Uint8Array(n*32), i, j;
  for(var b=1;b<=n;b++){
    var block = new Uint8Array(saltBytes.length + 4);
    block.set(saltBytes, 0);
    block[saltBytes.length]   = (b>>>24)&255; block[saltBytes.length+1] = (b>>>16)&255;
    block[saltBytes.length+2] = (b>>>8)&255;  block[saltBytes.length+3] = b&255;
    var u = hmac(key, block), t = new Uint8Array(u);
    for(i=1;i<iter;i++){
      u = hmac(key, u);
      for(j=0;j<32;j++) t[j] ^= u[j];
    }
    out.set(t, (b-1)*32);
  }
  return hex(out.subarray(0, dkLen||32));
};
A.sha256hex = function(s){ return hex(sha256(u8(String(s)))) };

/* ---------------- 账号表 ---------------- */
function users(){
  var u = C.get(K_USERS, []);
  return Object.prototype.toString.call(u) === '[object Array]' ? u : [];
}
function saveUsers(u){ C.set(K_USERS, u) }
function norm(name){ return String(name||'').trim().toLowerCase() }
function rid(){
  /* 账号 id：随机 + 时间，不暴露用户名 */
  var r = '';
  for(var i=0;i<8;i++) r += '0123456789abcdef'.charAt(Math.floor(Math.random()*16));
  return 'u' + Date.now().toString(36) + r;
}
function salt(){
  var a = new Uint8Array(16);
  if(typeof crypto === 'object' && crypto && crypto.getRandomValues){ crypto.getRandomValues(a) }
  else for(var i=0;i<16;i++) a[i] = Math.floor(Math.random()*256);
  return hex(a);
}

A.users = function(){ return users() };
A.byName = function(name){
  var n = norm(name), u = users();
  for(var i=0;i<u.length;i++) if(norm(u[i].name) === n) return u[i];
  return null;
};
A.byId = function(id){
  var u = users();
  for(var i=0;i<u.length;i++) if(u[i].id === id) return u[i];
  return null;
};
/* 当前登录的人（没有就 null） */
A.cur = function(){
  var s = C.get(K_SESS, null);
  if(!s || !s.uid) return null;
  return A.byId(s.uid);
};
A.uid = function(){ var c = A.cur(); return c ? c.id : '' };
/* 数据前缀：没登录就是 ''（和以前一样，老数据照常读），登录后是 u:<id>: */
A.ns = function(){ var id = A.uid(); return id ? ('u:' + id + ':') : '' };
/* 登录状态一变，立刻让存储层换前缀，并把设置按新账号重读一遍
   （换账号本来会刷新页面，但这样即使不刷新也不会串） */
function syncNS(){
  if(C.setNS) C.setNS(A.ns());
  if(C.loadSettings) C.loadSettings();
}

function check(name, pwd){
  if(!name || String(name).trim().length < 2) return '账号名至少 2 个字符';
  if(String(name).trim().length > 16) return '账号名最多 16 个字符';
  if(!pwd || String(pwd).length < 6) return '密码至少 6 位';
  if(String(pwd).length > 64) return '密码最多 64 位';
  return null;
}

/* 注册 */
A.signup = function(name, pwd){
  var bad = check(name, pwd);
  if(bad) return {ok:false, err:bad};
  if(A.byName(name)) return {ok:false, err:'这个账号名已经有人用了'};
  var s = salt();
  var u = { id: rid(), name: String(name).trim(), salt: s, iter: ITER,
            hash: A.pbkdf2(pwd, unhex(s), ITER, 32), created: Date.now(), last: Date.now() };
  var all = users(); all.push(u); saveUsers(all);
  return {ok:true, uid:u.id, user:u};
};
/* 登录：比对哈希，不对就不给进 */
A.login = function(name, pwd){
  var u = A.byName(name);
  if(!u) return {ok:false, err:'没有这个账号'};
  var h = A.pbkdf2(pwd, unhex(u.salt), u.iter || ITER, 32);
  if(h !== u.hash) return {ok:false, err:'密码不对'};
  u.last = Date.now();
  var all = users();
  for(var i=0;i<all.length;i++) if(all[i].id === u.id) all[i] = u;
  saveUsers(all);
  C.set(K_SESS, {uid:u.id, name:u.name, at:Date.now()});
  syncNS();
  return {ok:true, uid:u.id, user:u};
};
A.logout = function(){ C.set(K_SESS, null); syncNS() };
/* 改密码：要验旧密码 */
A.passwd = function(oldP, newP){
  var u = A.cur();
  if(!u) return {ok:false, err:'还没登录'};
  if(A.pbkdf2(oldP, unhex(u.salt), u.iter||ITER, 32) !== u.hash) return {ok:false, err:'旧密码不对'};
  var bad = check(u.name, newP);
  if(bad) return {ok:false, err:bad};
  u.salt = salt(); u.iter = ITER;
  u.hash = A.pbkdf2(newP, unhex(u.salt), ITER, 32);
  var all = users();
  for(var i=0;i<all.length;i++) if(all[i].id === u.id) all[i] = u;
  saveUsers(all);
  return {ok:true};
};
A.rename = function(newName){
  var u = A.cur();
  if(!u) return {ok:false, err:'还没登录'};
  var bad = check(newName, '123456');
  if(bad) return {ok:false, err:bad};
  if(A.byName(newName) && A.byName(newName).id !== u.id) return {ok:false, err:'这个名字被别人用了'};
  u.name = String(newName).trim();
  var all = users();
  for(var i=0;i<all.length;i++) if(all[i].id === u.id) all[i] = u;
  saveUsers(all);
  C.set(K_SESS, {uid:u.id, name:u.name, at:Date.now()});
  return {ok:true};
};
/* 删号：连同这个账号的数据一起删掉（数据清了，账号表里的记录也去掉） */
A.remove = function(pwd){
  var u = A.cur();
  if(!u) return {ok:false, err:'还没登录'};
  if(A.pbkdf2(pwd, unhex(u.salt), u.iter||ITER, 32) !== u.hash) return {ok:false, err:'密码不对，没删'};
  A.wipeData(u.id);
  var all = users().filter(function(x){ return x.id !== u.id });
  saveUsers(all);
  C.set(K_SESS, null);
  syncNS();
  return {ok:true};
};
/* 删某个账号名下的全部数据（只动带这个前缀的键，别的账号和未登录数据不受影响） */
A.wipeData = function(uid){
  var pre = 'u:' + uid + ':', del = [];
  for(var i=0;i<localStorage.length;i++){
    var k = localStorage.key(i);
    if(k && k.indexOf(pre) === 0) del.push(k);
  }
  del.forEach(function(k){ localStorage.removeItem(k) });
  return del.length;
};
/* 这个账号名下有多少条数据（给用户看"确实分开了"） */
A.dataCount = function(uid){
  var pre = 'u:' + uid + ':', n = 0;
  for(var i=0;i<localStorage.length;i++){
    var k = localStorage.key(i);
    if(k && k.indexOf(pre) === 0) n++;
  }
  return n;
};
/* 还没归属给任何账号的数据有几项（首次登录时会问要不要搬过去） */
A.pendingCount = function(){
  var n = 0, i, k;
  for(i=0;i<localStorage.length;i++){
    k = localStorage.key(i); if(!k) continue;
    if(k.indexOf('u:') === 0) continue;
    if(k === K_USERS || k === K_SESS) continue;
    if(k === 'cet6_cloud_v1') continue;
    n++;
  }
  return n;
};
/* 把当前（未登录/或另一个账号）的数据搬到某个账号名下——首次登录时会问一次 */
A.adopt = function(uid){
  var to = 'u:' + uid + ':';
  var ks = [], i;
  for(i=0;i<localStorage.length;i++){
    var k = localStorage.key(i);
    if(!k) continue;
    if(k.indexOf('u:') === 0) continue;                 /* 别的账号的，不动 */
    if(k === K_USERS || k === K_SESS) continue;         /* 账号表和会话，不动 */
    if(k === 'cet6_cloud_v1') continue;              /* 云端服务配置是站点级的，不搬 */
    ks.push(k);
  }
  var moved = 0;
  ks.forEach(function(k){
    var v = localStorage.getItem(k);
    if(v == null) return;
    try{ localStorage.setItem(to + k, v); moved++ }catch(e){}
  });
  return moved;
};
})();
