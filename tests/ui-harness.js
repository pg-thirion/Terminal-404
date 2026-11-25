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
 check($('solved').textContent==='0 / '+catalogue().length,'initial score');
 check($('missions').children.length===catalogue().length,'mission count');
 $('search').value='Packet';$('search').trigger('input');check($('missions').children.length===1,'search');$('search').value='';$('difficulty').value='Beginner';$('difficulty').trigger('change');check($('missions').children.length===catalogue().filter(m=>m.level==='Beginner').length,'difficulty');$('difficulty').value='all';$('difficulty').trigger('change');$('bookmark').trigger('click');$('mission-filter').value='bookmarked';$('mission-filter').trigger('change');check($('missions').children.length===1,'bookmark filter');$('mission-filter').value='all';$('mission-filter').trigger('change');$('notes').value='Evidence note';$('notes').trigger('input');$('large-text').trigger('click');check($('output').className==='large-text','large text');$('dismiss-tutorial').trigger('click');check($('tutorial').hidden,'dismiss tutorial');$('show-tutorial').trigger('click');check(!$('tutorial').hidden,'show tutorial');$('next').trigger('click');check($('mission-title').textContent==='Ghost Process','next case');$('previous').trigger('click');check($('notes').value==='Evidence note','per-case note');launch();check($('notes').value==='Evidence note'&&$('output').className==='large-text','persist note and text');$('restart').trigger('click');check($('notes').value==='Evidence note','restart preserves notes');
 cmd('ls -a');check(output().includes('.message'),'hidden file');
 cmd('submit wrong');check(output().includes('Flag rejected'),'incorrect flag');check($('attempt-count').textContent==='1','wrong flag stat');check(Number($('command-count').textContent)>=2,'command stat');
 $('hint').trigger('click');check(output().includes('HINT 1'),'hint');
 $('hint').trigger('click');check($('hint').disabled,'hint limit');$('clear').trigger('click');$('repeat-hints').trigger('click');check(output().includes('HINT 1')&&output().includes('HINT 2'),'review hints');check($('hint-total').textContent==='2','hint stat');
 cmd('submit T404{first_contact}');check($('score').textContent==='0050','hint score');
 cmd('submit T404{first_contact}');check($('score').textContent==='0050','no duplicate score');
 check($('solved').textContent==='1 / '+catalogue().length,'solved count');check($('achievements').textContent.includes('First flag'),'achievement');check($('lesson').textContent.length>0,'lesson');$('mission-filter').value='solved';$('mission-filter').trigger('change');check($('missions').children.length===1,'solved filter');$('mission-filter').value='all';$('mission-filter').trigger('change');
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
 check($('solved').textContent===catalogue().length+' / '+catalogue().length,'complete all');check($('score').textContent===String(all.reduce((s,m)=>s+m.points,0)),'total score');
 check($('rank').textContent==='Elite investigator','final rank');check(output().includes('ALL CASES SOLVED'),'completion message');
 store.set('terminal404.v1','{bad');launch();check($('solved').textContent==='0 / '+catalogue().length,'invalid saved JSON');
 store.set('terminal404.v1',JSON.stringify({solved:{'01':99},hints:{'01':0},active:'invalid'}));launch();check($('solved').textContent==='0 / '+catalogue().length,'invalid saved score');
 blocked=true;launch();check($('storage-status').textContent.includes('Storage unavailable'),'blocked storage');cmd('ls');check(output().includes('README.txt'),'blocked storage gameplay');
}
