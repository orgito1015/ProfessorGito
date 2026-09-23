import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { freshState, execute, messagesFor, nextCase, submitReport } from '../src/engine/game.js';
import { missionById } from '../src/content/missions.js';
import { exercises } from '../src/content/extras.js';
import { updateNote,toggleLink,solveExercise,evaluateExercise,restoreResponse,nextGuidedStep } from '../src/engine/extensions.js';
import { parseSave,serializeSave } from '../src/storage/saves.js';
import { AudioBus } from '../src/ui/audio.js';
const run=(s,...lines)=>lines.reduce((s,line)=>execute(s,line).state,s);
function prepared(id){let s=run(freshState(id),'scope');for(const n of missionById(id).nodes)if(missionById(id).initialScope.includes(n.id)){s=run(s,'connect '+n.id);for(const f of n.files)s=run(s,'cat '+f.path,'collect '+f.id);}return s;}
test('automatic response checkpoint restores evidence and removes response and final report',()=>{
 let s=prepared('bakery');s=updateNote(s,'export','Compare policy and route.');s=toggleLink(s,'export','policy');s=run(s,'connect bakery-config','respond restrict-export','verify');s=submitReport(s,'public-data',['export','policy','route'],true);
 const saved=parseSave(serializeSave(s));assert.equal(saved.autoCheckpoint.action,null);assert.equal(saved.autoCheckpoint.autoCheckpoint,null);saved.preferences.theme='crimson';
 const restored=restoreResponse(saved);assert.equal(restored.action,null);assert.equal(restored.report,null);assert.equal(restored.verified,false);assert.equal(restored.preferences.theme,'crimson');assert.equal(restored.board.notes.export,'Compare policy and route.');assert.deepEqual(restored.evidence,['export','policy','route']);assert.ok(!restored.completed.includes('bakery'));assert.doesNotThrow(()=>serializeSave(restored));
});
test('failed responses never create a checkpoint and nested snapshots are rejected',()=>{
 const s=run(freshState(),'scope','connect training','respond revoke-visitor');assert.equal(s.autoCheckpoint,null);
 const ready=run(prepared('cold-boot'),'respond revoke-visitor');const bad=structuredClone(ready);bad.autoCheckpoint.autoCheckpoint=freshState();assert.throws(()=>serializeSave(bad));
 const cross=structuredClone(ready);cross.autoCheckpoint=freshState('bakery');assert.throws(()=>serializeSave(cross));
});
test('oversized notes and stale cross-case evidence links cannot poison active state',()=>{
 let s=prepared('cold-boot');assert.throws(()=>updateNote(s,'handover','x'.repeat(2001)));assert.deepEqual(s.board.notes,{});
 s=updateNote(s,'handover','x'.repeat(2000));s=toggleLink(s,'handover','access');assert.doesNotThrow(()=>serializeSave(s));s=toggleLink(s,'access','handover');assert.equal(s.board.links.length,0);
 const bakery=prepared('bakery');assert.throws(()=>toggleLink(bakery,'handover','policy'));assert.deepEqual(bakery.board.links,[]);
});
test('all seven practice exercises accept valid solutions and reject incorrect alternatives',()=>{
 for(const e of exercises){let s=prepared(e.mission);const answer=e.type==='classify'?Object.fromEntries(e.items.map(i=>[i.id,i.answer])):e.answer;
 assert.equal(evaluateExercise(e,answer),true);assert.equal(evaluateExercise(e,e.type==='classify'?{}:[]),false);
 s=solveExercise(s,e.id,answer);assert.ok(parseSave(serializeSave(s)).exerciseSolved.includes(e.id));assert.equal(solveExercise(s,e.id,answer).exerciseSolved.length,1);
 assert.throws(()=>solveExercise(freshState(e.mission),e.id,answer));}
});
test('chronological exercise rejects reversed and duplicate event order',()=>{
 const e=exercises.find(e=>e.id==='incident-order');assert.equal(evaluateExercise(e,[...e.answer].reverse()),false);assert.equal(evaluateExercise(e,['approval','approval','beacon','health']),false);
});
test('guided suggestions track current state; standard and expert have no automatic answer prompts',()=>{
 let s=freshState();const m=missionById(s.missionId);assert.equal(nextGuidedStep(s,m),null);s.preferences.difficulty='guided';assert.equal(nextGuidedStep(s,m).command,'scope');s=run(s,'scope');assert.equal(nextGuidedStep(s,m).command,'connect training');s=run(s,'connect training');assert.equal(nextGuidedStep(s,m).command,'cat /docs/handover.txt');s.preferences.difficulty='expert';assert.equal(nextGuidedStep(s,m),null);
});
test('unquoted whitespace in order answers reaches the engine matcher',()=>{
 const m=missionById('supply-chain'),original=m.puzzle;
 try{m.puzzle={...original,type:'order',answers:['build,registry,audit']};let s=prepared(m.id);s=run(s,'solve build, registry, audit');assert.ok(s.flags.includes('puzzle'));}finally{m.puzzle=original;}
});
test('message identifiers are stable and unread state survives export',()=>{
 let s=prepared('cold-boot');const first=messagesFor(s)[0];s.readMessages.push(first.id);s=run(s,'respond revoke-visitor','verify');assert.ok(messagesFor(s).some(m=>m.id==='cold-boot:response'));assert.deepEqual(parseSave(serializeSave(s)).readMessages,[first.id]);assert.ok(messagesFor(s).every(m=>m.subject));
});
test('uploaded-version saves retain board notes, difficulty, sound and theme',()=>{
 const s=parseSave(readFileSync(new URL('./fixtures/uploaded-version-save.json',import.meta.url),'utf8'));
 assert.equal(s.board.notes.handover,'My own review note');assert.deepEqual(s.board.links,[['access','handover']]);assert.equal(s.preferences.difficulty,'expert');assert.equal(s.preferences.sound,true);assert.equal(s.preferences.theme,'arctic');assert.equal(s.preferences.ambience,false);assert.equal(s.preferences.volume,25);assert.equal(s.autoCheckpoint,null);assert.deepEqual(s.exerciseSolved,[]);
});
test('new preference values and exercise/message IDs are validated',()=>{
 const s=freshState();for(const bad of [{preferences:{...s.preferences,volume:101}},{preferences:{...s.preferences,ambience:'yes'}},{exerciseSolved:['missing']},{readMessages:['fake:brief']}])assert.throws(()=>serializeSave({...s,...bad}));
});
test('audio stays opt-in, mutes when hidden, reuses one context, and handles unsupported browsers',async()=>{
 let count=0,started=0,closed=0;const gains=[];
 const factory=()=>{count++;return {state:'running',currentTime:0,destination:{},createGain(){const g={gain:{value:0,setTargetAtTime(v){g.last=v;},setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};gains.push(g);return g;},createOscillator(){return {frequency:{value:0},connect(){},disconnect(){},start(){started++;},stop(){}};},close:async()=>{closed++;}};};
 const audio=new AudioBus(factory);await audio.configure({sound:false,ambience:false,volume:25},true);assert.equal(count,0);
 await audio.configure({sound:true,ambience:true,volume:25},true);assert.equal(count,1);assert.equal(started,2);assert.ok(gains[0].last>0);await audio.setHidden(true);assert.equal(gains[0].last,0);await audio.setHidden(false);assert.ok(gains[0].last>0);await audio.configure({sound:false,ambience:false,volume:25});assert.equal(gains[0].last,0);await audio.close();assert.equal(closed,1);
 assert.equal(await new AudioBus(()=>null).configure({sound:true,ambience:false,volume:25},true),false);
});
