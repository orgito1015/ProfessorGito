import test from 'node:test';
import assert from 'node:assert/strict';
import { scenarios, missionsFor, missionById } from '../src/content/missions.js';
import { freshState, execute, submitReport, nextCase, chooseEnding, messagesFor, complete, visibleActions, visibleFiles } from '../src/engine/game.js';
import { setUsername } from '../src/engine/profile.js';
import { endingsFor, endingText } from '../src/content/endings.js';
import { parseSave, serializeSave } from '../src/storage/saves.js';
const run=(s,...lines)=>lines.reduce((s,line)=>execute(s,line).state,s);
// Plays one case: reads every visible file on every authorized host, then applies the chosen response.
function play(s,pick=a=>a[0],skipIntel=false){
 const m=missionById(s.missionId);s=run(s,'scope');
 for(const id of m.initialScope){const n=m.nodes.find(n=>n.id===id);s=run(s,'ssh '+id);for(const f of visibleFiles(s,n).filter(f=>!(skipIntel&&f.intel)))s=run(s,'cat '+f.path,'collect '+f.id);}
 if(m.extension)s=run(s,'request-scope');if(m.puzzle)s=run(s,'solve '+m.puzzle.answers[0]);
 const a=pick(visibleActions(s,m));s=run(s,'ssh '+a.node,'respond '+a.id,'verify');assert.equal(s.action,a.id,m.id+' response applied');
 return submitReport(s,m.correctFinding,m.requiredEvidence,true);
}
function playScenario(id,picks={},skipIntel=false){
 const list=missionsFor(id);let s=setUsername(freshState(list[0].id),'Rook_9');
 for(let i=0;i<list.length;i++){s=play(s,picks[list[i].id],skipIntel);s=parseSave(serializeSave(s));if(i<list.length-1)s=nextCase(s);}
 return s;
}
test('five scenarios exist, the original seven-case campaign is still first, and each has intro, coda and endings',()=>{
 assert.equal(scenarios.length,5);assert.equal(scenarios[0].id,'cinder-prime');assert.equal(missionsFor('cinder-prime').length,7);
 for(const scen of scenarios){assert.ok(scen.intro.length>=3,scen.id);assert.ok(scen.coda,scen.id);assert.ok(scen.tagline,scen.id);assert.equal(endingsFor(scen.id).length,3);}
});
for(const scen of scenarios)test(`${scen.id}: plays start to finish and every ending is reachable on the best path`,()=>{
 const s=playScenario(scen.id),list=missionsFor(scen.id);
 assert.equal(s.completed.length,list.length);for(const m of list)assert.equal(s.caseResults[m.id].score,100,m.id);
 for(const e of endingsFor(scen.id)){const final=chooseEnding(s,e.id),text=endingText(final);assert.equal(text.average,100);assert.match(text.text[0],/Rook_9/);assert.equal(text.text.at(-1),scen.coda);assert.equal(parseSave(serializeSave(final)).ending,e.id);}
});
test('Code Grey: losing the backups in chapter 2 removes the fast restore in the finale and changes the epilogue',()=>{
 const s=playScenario('code-grey',{'cg-lateral':a=>a.find(x=>x.id==='rotate-only'),'cg-restore':a=>a.find(x=>x.id==='restore-tape')});
 const finale=missionById('cg-restore');
 assert.equal(s.caseResults['cg-restore'].action,'restore-tape');assert.equal(s.caseResults['cg-restore'].service,false);
 const replay=run(freshState('cg-restore',s.completed,s),'scope');assert.ok(!visibleActions(replay,finale).some(a=>a.id==='restore-online'));
 assert.ok(messagesFor(replay).some(x=>x.id==='cg-restore:no-online'));
 const text=endingText(chooseEnding(s,'board-line')).text.join(' ');assert.match(text,/tape restore took thirty-one hours/);assert.match(text,/Rotating a password/);
});
test('Quiet Partner: the whistleblower ending stays locked unless the hidden chat was found',()=>{
 const blind=playScenario('quiet-partner',{'qp-mailbox':a=>a.find(x=>x.id==='confront-bea')},true);
 assert.ok(!blind.intel.includes('callum-chat'));assert.throws(()=>chooseEnding(blind,'whistle'),/locked/);assert.doesNotThrow(()=>chooseEnding(blind,'committee'));
 const seen=playScenario('quiet-partner');assert.ok(seen.intel.includes('callum-chat'));assert.match(endingText(chooseEnding(seen,'whistle')).text.join(' '),/eleven lines long/);
 // Confronting the assistant deletes the chat cache from the disk image.
 let s=run(freshState('qp-mailbox'),'scope','ssh ws7');assert.match(execute(s,'ls -R /Users').output,/c\.vale\.txt/);
 s=run(s,'ssh journal','cat /rules/b.lindgren.txt','collect rule','request-scope','cat /stats/forwards.txt','collect fwdcount','solve kestrel.notes@fastmail-alt.example','respond confront-bea','ssh ws7');assert.equal(s.action,'confront-bea');assert.match(execute(s,'cat /Users/blindgren/AppData/chat-cache/c.vale.txt').output,/No such file/);
});
test('story events arrive as terminal chat and mail notices, and mail marks messages read',()=>{
 let s=run(freshState('cg-triage'),'scope','ssh fileshare');
 const r=execute(s,'cat /wards/ward4/READ_ME_GREY.txt');assert.ok(r.notices.some(n=>n.id==='cg-triage:tomasz-note'));assert.ok(r.state.transcript.some(t=>t.text.startsWith('<Tomasz Wren>')));
 s=run(r.state,'ssh edr','cat /hosts/WS-WARD2-03/process-tree.txt');assert.ok(s.transcript.some(t=>/\[MAIL\] New message from Rhea Castellanos: "That rota email"/.test(t.text)));
 const list=execute(s,'mail').output;assert.match(list,/That rota email/);const n=messagesFor(s).findIndex(x=>x.id==='cg-triage:lookalike')+1;
 s=run(s,'mail '+n);assert.ok(s.readMessages.includes('cg-triage:lookalike'));assert.deepEqual(parseSave(serializeSave(s)).readMessages,s.readMessages);
 s=run(freshState('cg-triage'),...Array(7).fill('date'));assert.ok(messagesFor(s).some(x=>x.id==='cg-triage:okafor-pumps'));
});
test('Signal Zero has an inbox again',()=>{for(const m of missionsFor('cinder-shadow'))assert.ok(messagesFor(freshState(m.id))[0].subject);});
test('realistic shell: ls, grep, find, head, tail, wc, sha256sum, history, man and session handling',()=>{
 let s=run(freshState('cg-triage'),'scope');
 assert.match(execute(s,'ls').output,/Not connected/);
 s=run(s,'ssh root@edr');assert.equal(s.node,'edr');
 assert.equal(execute(s,'ls').output,'alerts/  hosts/  policy/');
 assert.match(execute(s,'ls -la /alerts').output,/^total 4\ndrwx.* \.\n.*\.\.\n-rw-r----- +1 root +staff +\d+ Mar 14 02:41 overnight\.txt$/);
 assert.match(execute(s,'grep -rn svc_deploy /').output,/^\/alerts\/overnight\.txt:2:/m);
 assert.match(execute(s,'grep -i MACRO /alerts/overnight.txt').output,/Office macro/);
 assert.match(execute(s,'grep x').output,/no file given/);
 assert.equal(execute(s,'find / -name "*.txt" -type f').output,'/alerts/overnight.txt\n/hosts/WS-WARD2-03/process-tree.txt\n/policy/exceptions.txt');
 assert.match(execute(s,'head -n 1 /alerts/overnight.txt').output,/^02:18:51 WS-WARD2-03/);
 const t=execute(s,'tail -2 /alerts/overnight.txt');assert.match(t.output,/^02:20:05/);assert.ok(t.state.read.includes('alerts'));
 assert.match(execute(s,'wc -l /alerts/overnight.txt').output,/^\s+5 \/alerts\/overnight\.txt$/);
 assert.equal(execute(s,'sha256sum /alerts/overnight.txt').output,execute(s,'sha256sum /alerts/overnight.txt').output);
 assert.match(execute(s,'cd /alerts/overnight.txt').output,/Not a directory/);assert.match(execute(s,'cat /alerts').output,/Is a directory/);
 s=run(s,'cd hosts/WS-WARD2-03','cat process-tree.txt','collect process-tree.txt');assert.ok(s.evidence.includes('proctree'));
 assert.match(execute(s,'history').output,/cd hosts\/WS-WARD2-03/);assert.match(execute(s,'man grep').output,/-r recurse/);assert.match(execute(s,'ls --help').output,/^ls \[-l\]/);
 assert.match(execute(s,'nmap').output,/ehr-db \(198\.51\.100\.40\)\nSkipped: outside the rules of engagement/);assert.match(execute(s,'nmap fileshare').output,/445\/tcp +open +microsoft-ds/);
 assert.match(execute(s,'ps aux').output,/-bash/);assert.match(execute(s,'netstat -tnp').output,/ESTABLISHED/);assert.match(execute(s,'sudo cat /etc/shadow').output,/sudoers/);
 s=run(s,'exit');assert.equal(s.node,null);assert.equal(s.cwd,'/');
 assert.equal(s.transcript.findLast(t=>t.kind==='input').prompt,`${s.username}@edr:/hosts/WS-WARD2-03$`);
});
test('xxd -r -p matches decode on the dead drop',()=>{let s=run(freshState('inside'),'scope','connect iva-drop','cat /drop/message.hex');assert.equal(execute(s,'xxd -r -p /drop/message.hex').output,'HLC-OPS');assert.equal(execute(s,'decode drop').output,'Decoded text: HLC-OPS');});
test('tab completion covers commands, hosts, paths and evidence',()=>{
 let s=run(freshState('cg-triage'),'scope');
 assert.equal(complete(s,'gre').value,'grep ');assert.deepEqual(complete(s,'he').options,['help','head']);
 assert.equal(complete(s,'ssh cl').value,'ssh clinmon ');
 s=run(s,'ssh edr');assert.equal(complete(s,'cat /al').value,'cat /alerts/');assert.equal(complete(s,'cat /alerts/o').value,'cat /alerts/overnight.txt ');
 s=run(s,'cat /alerts/overnight.txt');assert.equal(complete(s,'collect al').value,'collect alerts ');
});
test('intel and transcript prompts survive saves; unknown intel is rejected; older saves default intel to empty',()=>{
 let s=run(freshState('cg-lateral'),'scope','ssh vpn','cat /etc/vpn/mfa-exemptions.conf');assert.deepEqual(s.intel,['mfa-exemption']);
 assert.deepEqual(parseSave(serializeSave(s)),s);
 assert.throws(()=>parseSave(JSON.stringify({...s,intel:['invented']})));
 const old=structuredClone(freshState());delete old.intel;old.transcript.push({kind:'output',text:'x',prompt:'y'});assert.throws(()=>parseSave(JSON.stringify(old)));
 old.transcript.pop();assert.deepEqual(parseSave(JSON.stringify(old)).intel,[]);
});
