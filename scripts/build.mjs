import {cp,mkdir,rm,copyFile} from 'node:fs/promises';
import {validateContent} from '../src/engine/game.js';
validateContent();
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(const p of ['src','public'])await cp(p,'dist/'+p,{recursive:true});
await copyFile('index.html','dist/index.html');
console.log('Built dist/: static ES modules, no dependency installation required.');
