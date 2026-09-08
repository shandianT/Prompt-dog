// One automated look at the v2 flow canvas: drive drag / port-drag connect / drag-to-empty quick add /
// lane rule / diff toggle / marquee group / drill-down inside the artboard iframe, screenshot twice.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const [file, out] = process.argv.slice(2);
const BIN = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const port = 9335;
const chrome = spawn(BIN, ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, '--window-size=2200,1300', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function targetWs() { for (let i = 0; i < 40; i++) { try { const r = await fetch(`http://127.0.0.1:${port}/json`); const l = await r.json(); const p = l.find(t => t.type === 'page'); if (p) return p.webSocketDebuggerUrl; } catch {} await sleep(250); } throw new Error('no target'); }
const ws = new WebSocket(await targetWs()); await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map(); const contexts = []; const errors = [];
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } if (msg.method === 'Runtime.executionContextCreated') contexts.push(msg.params.context); if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception && msg.params.exceptionDetails.exception.description || msg.params.exceptionDetails.text); };
const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable'); await send('Runtime.enable'); await send('Page.navigate', { url: 'file://' + file }); await sleep(7000);
const shot = async (name) => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${out}-${name}.png`, Buffer.from(r.result.data, 'base64')); };
let ctx = null; for (const c of contexts) { const r = await send('Runtime.evaluate', { expression: `document.querySelector('.fc .canvas')?'flow':'no'`, contextId: c.id, returnByValue: true }); if (r.result && r.result.result && r.result.result.value === 'flow') { ctx = c.id; break; } }
console.log('flow ctx:', ctx, 'errors so far:', errors.length);
const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, contextId: ctx, returnByValue: true }); if (r.result && r.result.exceptionDetails) return 'EXC ' + (r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description); return r.result && r.result.result ? r.result.result.value : JSON.stringify(r); };
const H = `var fire=function(el,t,x,y){el.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0,view:window}));};var cv=document.querySelector('.fc .canvas');var cr=cv.getBoundingClientRect();var node=function(id){return document.querySelector('.node[data-id="'+id+'"]');};var mid=function(el){var r=el.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];};`;
const steps = [
  ['drag n9 up', `${H}var n=node('n9');var r=n.getBoundingClientRect();var x=r.left+60,y=r.top+40;fire(n,'mousedown',x,y);fire(window,'mousemove',x+6,y-30);fire(window,'mousemove',x+10,y-110);fire(window,'mouseup',x+10,y-110);'ok'`],
  ['check n9', `node('n9').parentNode.getAttribute('style')`],
  ['port drag n8->n13', `${H}var p=node('n8').querySelector('.port.out');var pr=p.getBoundingClientRect();fire(p,'mousedown',pr.left+6,pr.top+6);var m=mid(node('n13'));fire(window,'mousemove',m[0]-20,m[1]);fire(window,'mousemove',m[0],m[1]);fire(window,'mouseup',m[0],m[1]);'ok'`],
  ['edges count', `document.querySelectorAll('.esvg .hit').length`],
  ['port drag n6->empty', `${H}var p=node('n6').querySelector('.port.out');var pr=p.getBoundingClientRect();fire(p,'mousedown',pr.left+6,pr.top+6);fire(window,'mousemove',cr.left+900,cr.top+330);fire(window,'mousemove',cr.left+905,cr.top+335);fire(window,'mouseup',cr.left+905,cr.top+335);'ok'`],
  ['quick open?', `!!document.querySelector('.quick')`],
  ['pick 联网检索', `var q=[].slice.call(document.querySelectorAll('.quick .qi')).filter(function(e){return e.textContent.indexOf('联网检索')>=0;})[0];q?(q.click(),'clicked'):'none'`],
  ['nodes count', `document.querySelectorAll('.node').length`],
  ['drag n14 into AI lane', `${H}var n=node('n14');var r=n.getBoundingClientRect();var x=r.left+60,y=r.top+40;fire(n,'mousedown',x,y);fire(window,'mousemove',x+40,y-200);fire(window,'mousemove',x+60,y-330);fire(window,'mouseup',x+60,y-330);'ok'`],
  ['n14 class', `node('n14').className`],
  ['toggle diff+labels', `[].slice.call(document.querySelectorAll('.tb-btn')).filter(function(b){return b.textContent.indexOf('对照现状')>=0||b.textContent.indexOf('产物')>=0;}).forEach(function(b){b.click();});'ok'`],
  ['diff chips', `document.querySelectorAll('.df').length`],
  ['select n2', `${H}var n=node('n2');var r=n.getBoundingClientRect();fire(n,'mousedown',r.left+50,r.top+30);fire(window,'mouseup',r.left+50,r.top+30);'ok'`],
  ['SHOT', 'mid'],
  ['close inspector', `var b=[].slice.call(document.querySelectorAll('.ins .btn')).filter(function(e){return e.textContent.indexOf('关闭')>=0;})[0];b?(b.click(),'closed'):'none'`],
  ['marquee n3 n5 n6', `${H}fire(cv,'mousedown',cr.left+330,cr.top+40);fire(window,'mousemove',cr.left+500,cr.top+150);fire(window,'mousemove',cr.left+690,cr.top+280);fire(window,'mouseup',cr.left+690,cr.top+280);'ok'`],
  ['multi bar?', `var b=document.querySelector('.bar');b?b.textContent:'none'`],
  ['group', `var b=document.querySelector('.bar .bb');b?(b.click(),'grouped'):'none'`],
  ['nodes after group', `document.querySelectorAll('.node').length`],
  ['dblclick new dog', `${H}var d=[].slice.call(document.querySelectorAll('.node.k-dog')).filter(function(e){return e.textContent.indexOf('新工作狗')>=0;})[0];if(!d)'none';else{var m=mid(d);d.dispatchEvent(new MouseEvent('dblclick',{bubbles:true,cancelable:true,clientX:m[0],clientY:m[1],view:window}));'dbl'}`],
  ['crumb?', `var c=document.querySelector('.crumb');c?c.textContent:'none'`],
  ['SHOT', 'after'],
];
for (const [name, expr] of steps) {
  if (name === 'SHOT') { await sleep(500); await shot(expr); console.log('shot', expr); continue; }
  const v = await ev(expr); await sleep(350); console.log(name, '=>', v);
}
console.log('exceptions:', errors.slice(0, 5));
ws.close(); chrome.kill();
