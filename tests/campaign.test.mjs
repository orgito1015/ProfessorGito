import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { missions, campaign, scenarios, missionsFor } from '../src/content/missions.js';
import { freshState,execute,submitReport,nextCase,chooseEnding,replayCase } from '../src/engine/game.js';
import { setUsername,normalizeUsername } from '../src/engine/profile.js';
import { endings,endingsFor,endingText } from '../src/content/endings.js';
import { parseSave,serializeSave } from '../src/storage/saves.js';
const run=(s,c)=>execute(s,c).state;
function finish(s,disrupt=false){
 const m=missions.find(m=>m.id===s.missionId);s=run(s,'scope');
 for(const n of [...m.nodes].reverse())if(m.initialScope.includes(n.id)){
  s=run(s,'connect '+n.id);for(const f of [...n.files].reverse()){s=run(s,'cat '+f.path);s=run(s,'collect '+f.id);}
 }
 if(m.extension)s=run(s,'request-scope');if(m.puzzle)s=run(s,'solve '+m.puzzle.answers[0]);
 const a=disrupt?m.actions.at(-1):m.actions[0];s=run(s,'connect '+a.node);s=run(s,'respond '+a.id);s=run(s,'verify');
 return submitReport(s,m.correctFinding,m.requiredEvidence,true);
}
function full(disrupt=false){let s=setUsername(freshState(),'GIto_42');for(let i=0;i<campaign.length;i++){s=finish(s,disrupt);s=parseSave(serializeSave(s));if(i<campaign.length-1)s=nextCase(s);}return s;}
function fullScenario(scenarioId,disrupt=false){const list=missionsFor(scenarioId);let s=setUsername(freshState(list[0].id),'Shadow_7');for(let i=0;i<list.length;i++){s=finish(s,disrupt);s=parseSave(serializeSave(s));if(i<list.length-1)s=nextCase(s);}return s;}
test('username validates, personalizes tutorial evidence, and survives saves',()=>{
 let s=setUsername(freshState(),'  Nova_42  ');assert.equal(s.username,'Nova_42');assert.equal(s.profileSet,true);
 s=run(s,'scope');s=run(s,'connect training');const result=execute(s,'cat /logs/access.log');assert.match(result.output,/Nova_42: enabled/);assert.doesNotMatch(result.output,/{username}/);
 assert.equal(parseSave(serializeSave(result.state)).username,'Nova_42');assert.equal(execute(s,'whoami').output,'Nova_42');
 for(const value of ['', 'x', '1gito', '<img>', 'a b', 'a'.repeat(21),null])assert.throws(()=>normalizeUsername(value));
});
test('seven linked cases reach all three persistent endings',()=>{
 const s=full();assert.equal(campaign.length,7);assert.ok(campaign.every(c=>c.status==='playable'));assert.equal(s.completed.length,7);assert.equal(s.username,'GIto_42');assert.equal(Object.keys(s.caseResults).length,7);
 for(const e of endings){const final=chooseEnding(s,e.id);assert.equal(parseSave(serializeSave(final)).ending,e.id);const text=endingText(final);assert.equal(text.average,100);assert.equal(text.outages,0);assert.match(text.text[0],/GIto_42/);assert.throws(()=>chooseEnding(final,e.id));}
});
test('second scenario (cinder-shadow) is an independent three-case chain with its own endings',()=>{
 const s=fullScenario('cinder-shadow');assert.equal(missionsFor('cinder-shadow').length,3);assert.equal(s.completed.length,3);assert.equal(Object.keys(s.caseResults).length,3);
 for(const e of endingsFor('cinder-shadow')){const final=chooseEnding(s,e.id);assert.equal(parseSave(serializeSave(final)).ending,e.id);const text=endingText(final);assert.equal(text.average,100);assert.equal(text.outages,0);assert.match(text.text[0],/Shadow_7/);assert.throws(()=>chooseEnding(final,e.id));}
 assert.throws(()=>chooseEnding(fullScenario('cinder-shadow'),'disclosure'));
});
test('scenario replay unlocking is scoped per scenario, not the global mission list',()=>{
 const shadowFirst=missionsFor('cinder-shadow')[0].id;
 assert.doesNotThrow(()=>replayCase(freshState(shadowFirst),shadowFirst));
 const primeFresh=freshState();assert.throws(()=>replayCase(primeFresh,missionsFor('cinder-shadow')[1].id));
});
test('earlier service disruptions change the epilogue',()=>{const s=chooseEnding(full(true),'disclosure'),text=endingText(s);assert.ok(text.outages>=5);assert.ok(text.average<100);assert.match(text.text[1],/interrupted legitimate services/);});
test('endings cannot be chosen before the final report',()=>{assert.throws(()=>chooseEnding(freshState(),'disclosure'));assert.throws(()=>chooseEnding(full(),'invented'));});
test('replay preserves profile and records but clears final choice',()=>{const s=chooseEnding(full(),'offer');s.preferences={fontSize:20,contrast:true};const r=replayCase(s,'null-route');assert.equal(r.ending,null);assert.equal(r.username,s.username);assert.deepEqual(r.caseResults,s.caseResults);assert.deepEqual(r.preferences,s.preferences);assert.throws(()=>replayCase(freshState(),'blackout'));});
test('deduction requires evidence; wrong answers cannot unlock response',()=>{
 let s=freshState('supply-chain');assert.match(execute(s,'solve Q17-B').output,/Preserve/);s=run(s,'scope');s=run(s,'connect build-server');assert.match(execute(s,'respond rollback-release').output,/investigation question/);
 assert.equal(s.flags.includes('puzzle'),false);
});
test('dead drop decode is real hex decoding and never executable',()=>{let s=freshState('inside');s=run(s,'scope');s=run(s,'connect iva-drop');assert.match(execute(s,'decode drop').output,/Read/);s=run(s,'cat /drop/message.hex');assert.equal(execute(s,'decode drop').output,'Decoded text: HLC-OPS');s=run(s,'cat /drop/letter.txt');assert.match(execute(s,'decode letter').output,/not a hexadecimal/);});
test('legacy version-one completed save migrates without inventing historical grades',()=>{
 const old=JSON.parse(readFileSync(new URL('./fixtures/legacy-cold-boot.json',import.meta.url),'utf8'));
 const s=parseSave(JSON.stringify(old));assert.equal(s.version,2);assert.equal(s.username,'operator');assert.equal(s.profileSet,false);assert.equal(s.report.score,100);assert.equal(s.caseResults['cold-boot'].score,100);assert.equal(nextCase(s).missionId,'bakery');
});
test('corrupt campaign profile, summary, and ending are rejected',()=>{
 const s=full();for(const mutate of [r=>r.username='<script>',r=>r.preferences.fontSize=99,r=>r.ending='fake',r=>r.caseResults.bakery.score=999,r=>delete r.caseResults.bakery,r=>r.flags.push('admin')]){const bad=structuredClone(s);mutate(bad);assert.throws(()=>parseSave(JSON.stringify(bad)));}
});
test('authored runtime and docs contain no unwanted dash character',()=>{
 const root=new URL('../',import.meta.url);const walk=url=>{for(const file of readdirSync(url,{withFileTypes:true})){const path=new URL(file.name+(file.isDirectory()?'/':''),url);if(file.isDirectory())walk(path);else assert.ok(!readFileSync(path,'utf8').includes(String.fromCharCode(0x2014)),path.href);}};for(const area of ['src','docs','public'])walk(new URL(area+'/',root));
});
