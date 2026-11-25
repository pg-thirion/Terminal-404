// Minimal DOM doubles exercise the actual application's event handlers without a browser.
export function runUiChecks(app,catalogue,createShell,check) {
 class Element {
  constructor(){this.children=[];this.dataset={};this.handlers={};this.textContent='';this.value='';this.disabled=false;this.scrollHeight=0;}
  append(...els){this.children.push(...els);for(const el of els)el.parent=this;}
  replaceChildren(){this.children=[];}
  get firstElementChild(){return this.children[0];}
  remove(){this.parent.children.splice(this.parent.children.indexOf(this),1);}
  addEventListener(type,fn){this.handlers[type]=fn;}
  setAttribute(k,v){this[k]=v;}
  focus(){document.activeElement=this;}
  trigger(type,event={}){this.handlers[type]?.({preventDefault(){},...event});}
 }
 let elements=new Map(), store=new Map(), allowReset=true, blocked=false;
 const document={activeElement:null,getElementById(id){if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},createElement(){return new Element();}};
 const storage={getItem(k){if(blocked)throw Error('blocked');return store.get(k)||null;},setItem(k,v){if(blocked)throw Error('blocked');store.set(k,v);}};
 const $=id=>document.getElementById(id);
 const launch=()=>{elements=new Map();document.activeElement=null;new Function('document','localStorage','confirm','catalogue','createShell',app.replace(/^import[^\n]*\n/,''))(document,storage,()=>allowReset,catalogue,createShell);};
 const cmd=v=>{$('command').value=v;$('command-form').trigger('submit');};
 const output=()=>$('output').children.map(el=>el.textContent).join('\n');
 const select=i=>$('missions').children[i].trigger('click');
 launch();
 check($('solved').textContent==='0 / 10','initial score');
 check($('missions').children.length===10,'mission count');
 cmd('ls -a');check(output().includes('.message'),'hidden file');
 cmd('submit wrong');check(output().includes('Flag rejected'),'incorrect flag');
 $('hint').trigger('click');check(output().includes('HINT 1'),'hint');
 $('hint').trigger('click');check($('hint').disabled,'hint limit');
 cmd('submit T404{first_contact}');check($('score').textContent==='0050','hint score');
 cmd('submit T404{first_contact}');check($('score').textContent==='0050','no duplicate score');
 check($('solved').textContent==='1 / 10','solved count');
 select(1);cmd('cd /var/log');check($('prompt').textContent.includes('/var/log'),'prompt update');
 cmd('grep ANOMALY system.log');check(output().includes('T404{ghost_process}'),'relative file');
 $('command').trigger('keydown',{key:'ArrowUp'});check($('command').value==='grep ANOMALY system.log','history up');
 $('command').trigger('keydown',{key:'ArrowDown'});check($('command').value==='','history down');
 $('command').value='whoa';$('command').trigger('keydown',{key:'Tab'});check($('command').value==='whoami ','autocomplete');
 $('flag').value='T404{ghost_process}';$('flag-form').trigger('submit');check($('score').textContent==='0200','flag form');
 launch();check($('score').textContent==='0200'&&$('mission-title').textContent==='Ghost Process','reload persistence');
 $('clear').trigger('click');check(output()==='','clear button');
 cmd('echo <script>');check(output().includes('<script>'),'literal output');
 allowReset=false;$('reset').trigger('click');check($('score').textContent==='0200','cancel reset');
 allowReset=true;$('reset').trigger('click');check($('score').textContent==='0000','reset');
 const all=catalogue();for(let i=0;i<all.length;i++){select(i);for(const c of all[i].route)cmd(c);cmd('submit '+all[i].flag);}
 check($('solved').textContent==='10 / 10','complete all');check($('score').textContent===String(all.reduce((s,m)=>s+m.points,0)),'total score');
 check($('rank').textContent==='Elite investigator','final rank');check(output().includes('ALL CASES SOLVED'),'completion message');
 store.set('terminal404.v1','{bad');launch();check($('solved').textContent==='0 / 10','invalid saved JSON');
 store.set('terminal404.v1',JSON.stringify({solved:{'01':99},hints:{'01':0},active:'invalid'}));launch();check($('solved').textContent==='0 / 10','invalid saved score');
 blocked=true;launch();check($('storage-status').textContent.includes('Storage unavailable'),'blocked storage');cmd('ls');check(output().includes('README.txt'),'blocked storage gameplay');
}
