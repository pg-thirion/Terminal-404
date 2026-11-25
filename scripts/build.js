import {mkdirSync,copyFileSync,rmSync} from 'node:fs';
const output=new URL('../dist/',import.meta.url);
rmSync(output,{recursive:true,force:true});mkdirSync(output,{recursive:true});
for(const file of ['index.html','style.css','app.js','engine.js','favicon.svg'])copyFileSync(new URL('../'+file,import.meta.url),new URL(file,output));
