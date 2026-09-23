import { responseSnapshot } from './extensions.js';
import { exercises, connections, storyFor } from '../content/extras.js';
import { missions, missionById, CONTENT_VERSION, scenarios, missionsFor, scenarioOf } from '../content/missions.js';
import { endingsFor } from '../content/endings.js';
import { personalize, normalizeUsername } from './profile.js';
import { tokenize, normalizePath } from './parser.js';
export const commands=['help','brief','scope','scan','connect','ls','cd','pwd','cat','collect','evidence','request-scope','actions','respond','verify','status','hint','report','clear','solve','decode','whoami'];
export function freshState(id='cold-boot', completed=[], carry={}) {
 const m=missionById(id);
 return {version:2,autoCheckpoint:null,exerciseSolved:[...(carry.exerciseSolved||[])],readMessages:[...(carry.readMessages||[])],username:carry.username||'operator',profileSet:carry.profileSet||false,preferences:structuredClone(carry.preferences||{fontSize:16,contrast:false,theme:'cinder',difficulty:'standard',sound:false,ambience:false,volume:25}),caseResults:structuredClone(carry.caseResults||{}),ending:null,contentVersion:CONTENT_VERSION,missionId:id,completed:[...completed],node:null,cwd:'/',flags:[],read:[],evidence:[],action:null,verified:false,report:null,hintLevel:0,tick:0,events:[],board:{notes:{},links:[]},transcript:[{kind:'system',text:`CINDER / SECURE WORKSPACE\n${m.title}\n${m.brief}\n\nType help to get started.`}]};
}
export function puzzleMatches(puzzle,answer){
 const norm=String(answer).trim().toLowerCase();
 if(puzzle.type==='order')return puzzle.answers.map(a=>a.toLowerCase()).includes(norm.split(/\s*,\s*/).join(','));
 return puzzle.answers.includes(norm);
}
export function messagesFor(state){
 const m=missionById(state.missionId),out=[{id:m.id+':brief',subject:storyFor(m.id)[1],from:storyFor(m.id)[0],text:personalize(storyFor(m.id)[2]+'\n\n'+m.brief,state.username),tick:0}];
 if(m.extension&&state.flags.includes('extension'))out.push({id:m.id+':scope',subject:'Response authority',from:m.client,text:m.scopeApproval,tick:1});
 if(state.action){const a=m.actions.find(a=>a.id===state.action);if(a)out.push({id:m.id+':response',subject:'Response status',from:'Iva',text:'Response applied at '+m.actions.find(x=>x.id===state.action).node+': '+a.impact,tick:2});}
 if(state.verified)out.push({id:m.id+':verify',subject:'Verification complete',from:'Iva',text:'Verification complete. The report tab is ready when you are.',tick:3});
 if(state.report)out.push({id:m.id+':report',subject:'Case review',from:m.client,text:m.debrief+'\n\nReport received. Score: '+state.report.score+'/100.',tick:4});
 return out;
}
export function objectiveDone(s,o){
 if(o.kind==='flag')return s.flags.includes(o.value);
 if(o.kind==='evidence')return o.values.every(id=>s.evidence.includes(id));
 if(o.kind==='action')return s.action===o.value;
 if(o.kind==='responded')return !!s.action;
 if(o.kind==='verified')return s.verified;
 if(o.kind==='reported')return !!s.report;
 return false;
}
function event(s,text){s.events.push({tick:s.tick,text});s.events=s.events.slice(-150);}
function flag(s,id){if(!s.flags.includes(id))s.flags.push(id);}
export function evidenceRecords(m){return m.nodes.flatMap(n=>n.files.map(f=>({...f,node:n.id})));}
export function execute(state,input){
 const s=structuredClone(state); const m=missionById(s.missionId); let output='';let intent=null;
 const say=t=>{output=t;};
 try {
 const [cmd,...parsedArgs]=tokenize(input);const args=cmd==='solve'&&m.puzzle?.type==='order'?[parsedArgs.join(' ')]:parsedArgs; if(!cmd)return {state:s,output:'',intent:null};
 s.tick++; s.transcript.push({kind:'input',text:input});
 const arity={whoami:0,solve:1,decode:1,help:0,brief:0,scope:0,scan:0,connect:1,ls:0,cd:1,pwd:0,cat:1,collect:1,evidence:0,'request-scope':0,actions:0,respond:1,verify:0,status:0,hint:0,report:0,clear:0};
 if(!Object.hasOwn(arity,cmd)) throw new Error(`Unknown command: ${cmd}. Try help. This is a simulation, not a system shell.`);
 if(args.length!==arity[cmd])throw new Error(`Usage: ${cmd}${arity[cmd]?' <value>':''}. Type help for examples.`);
 const node=m.nodes.find(n=>n.id===s.node);
 switch(cmd){
 case 'help':say('help / brief / scope / scan\nconnect <node> , select an authorized host\nls / cd <directory> / pwd / cat <path>\ncollect <evidence-id> , preserve a record you read\nevidence , show preserved records\nrequest-scope , obtain incident response authority\nactions / respond <action-id> / verify\nstatus / hint / report / clear / whoami\nsolve <answer> / decode <evidence-id>\n\nExample: connect training, then ls. Each command runs separately. Up/Down recalls commands; Tab completes the command name.');break;
 case 'brief':say(m.brief+(m.puzzle?'\n\nINVESTIGATION: '+m.puzzle.prompt:''));break;
 case 'whoami':say(s.username);break;
 case 'solve':{
 if(!m.puzzle)throw new Error('This case has no separate deduction gate. Follow the objectives.');
 if(!m.puzzle.requires.every(id=>s.evidence.includes(id)))throw new Error('Preserve the relevant evidence before submitting a deduction: '+m.puzzle.requires.join(', '));
 if(!puzzleMatches(m.puzzle,args[0]))throw new Error(m.puzzle.type==='order'?'That order does not match the preserved records. List evidence IDs in event order, comma separated.':'That deduction does not match the preserved records. Compare the identifiers and try again.');
 if(!s.flags.includes('puzzle'))event(s,'Resolved the investigation question.');flag(s,'puzzle');say(m.puzzle.success);break;}
 case 'decode':{
 const f=evidenceRecords(m).find(f=>f.id===args[0]);
 if(!f||!s.read.includes(f.id))throw new Error('Read the encoded evidence first.');
 if(!/^(?:[0-9a-fA-F]{2} )(?:[0-9a-fA-F]{2} ?)*$/.test(f.text.trim()))throw new Error('This record is not a hexadecimal byte message.');
 say('Decoded text: '+f.text.trim().split(/\s+/).map(h=>String.fromCharCode(parseInt(h,16))).join(''));break;}
 case 'scope':flag(s,'scope');say(`AUTHORIZED: ${m.initialScope.join(', ')}. All other hosts are excluded. ${m.extension?'Response changes require request-scope approval.':'Listed response actions are authorized.'}`);break;
 case 'scan':if(!s.flags.includes('scope'))throw new Error('Read scope before inspecting the network.');say(m.nodes.map(n=>`${n.id.padEnd(16)} ${n.address}  ${m.initialScope.includes(n.id)?'AUTHORIZED':'OUT OF SCOPE'}  ${n.role}`).join('\n'));break;
 case 'connect':{
 if(!s.flags.includes('scope'))throw new Error('Read scope first.');
 const n=m.nodes.find(n=>n.id===args[0]||n.address===args[0]);if(!n)throw new Error('Unknown simulated host. Use scan.');
 if(!m.initialScope.includes(n.id))throw new Error('Access blocked: host is outside your rules of engagement. No connection was made.');
 s.node=n.id;s.cwd='/';say(`Connected to ${n.id}. Use ls to list its evidence files.`);break;}
 case 'pwd':if(!node)throw new Error('Connect to a host first.');say(s.cwd);break;
 case 'cd':{
 if(!node)throw new Error('Connect to a host first.');const path=normalizePath(args[0],s.cwd);
 if(path!=='/'&&!node.files.some(f=>f.path.startsWith(path+'/')))throw new Error('Directory not found.');s.cwd=path;say(path);break;}
 case 'ls':if(!node)throw new Error('Connect to a host first.');say(node.files.filter(f=>s.cwd==='/'||f.path.startsWith(s.cwd+'/')).map(f=>`${f.path}  [${f.id}]`).join('\n')||'No files.');break;
 case 'cat':{
 if(!node)throw new Error('Connect to a host first.');const path=normalizePath(args[0],s.cwd);const f=node.files.find(f=>f.path===path);
 if(!f)throw new Error('File not found. Use ls to inspect available paths.');if(!s.read.includes(f.id))s.read.push(f.id);
 say(`${f.title} [${f.id}]\nSource: ${node.id}:${f.path} / ${f.time}\n\n${f.text}\n\nPreserve with: collect ${f.id}`);break;}
 case 'collect':{
 const f=evidenceRecords(m).find(f=>f.id===args[0]);if(!f||!s.read.includes(f.id))throw new Error('Read this evidence record with cat before preserving it.');
 if(s.evidence.includes(f.id)){say('Already preserved.');break;}
 s.evidence.push(f.id);event(s,`Preserved ${f.id} from ${f.node}:${f.path}`);say(`Preserved ${f.title}. Source and timestamp added to the notebook.`);break;}
 case 'evidence':say(s.evidence.map(id=>{const f=evidenceRecords(m).find(f=>f.id===id);return `${id}: ${f.title} (${f.node}, ${f.time})`;}).join('\n')||'No evidence preserved yet.');break;
 case 'request-scope':
 if(!m.extension){say('The listed response actions are already authorized.');break;}
 if(!s.evidence.includes(m.scopeLead))throw new Error('Preserve '+m.scopeLead+' to justify the response-scope request.');
 if(!s.flags.includes('extension'))event(s,'Client approved incident-response extension.');flag(s,'extension');say(m.scopeApproval);break;
 case 'actions':say(m.actions.map(a=>`${a.id}: ${a.label}\n  Host: ${a.node}; evidence needed: ${a.required.join(', ')}\n  Expected impact: ${a.impact}`).join('\n'));break;
 case 'respond':{
 if(s.report)throw new Error('This report is finalized. Retry the case to explore another response.');
 if(m.puzzle&&!s.flags.includes('puzzle'))throw new Error('Resolve the investigation question first. Use brief for its solve prompt.');
 const a=m.actions.find(a=>a.id===args[0]);if(!a)throw new Error('Unknown response. Use actions.');
 if(s.node!==a.node)throw new Error(`Connect to ${a.node} to apply this response.`);
 if(m.extension&&!s.flags.includes('extension'))throw new Error('Request incident-response scope before changing the system.');
 if(!a.required.every(id=>s.evidence.includes(id)))throw new Error(`Preserve required evidence first: ${a.required.join(', ')}.`);
 if(s.action)throw new Error('A response has already been applied. Verify and report, or retry this case.');
 s.autoCheckpoint=responseSnapshot(state);s.action=a.id;s.verified=false;event(s,a.impact);say(a.impact+'\nRun verify to confirm the outcome.');break;}
 case 'verify':{
 if(!s.action)throw new Error('Apply a response first. Use actions.');const a=m.actions.find(a=>a.id===s.action);
 if(!s.verified)event(s,`Verified: incident contained; business service ${a.service?'available':'unavailable'}.`);s.verified=true;
 say(`RESPONSE CHECK: expected unwanted activity has stopped.\nSERVICE CHECK: ${a.service?'AVAILABLE':'UNAVAILABLE , document this impact in your report.'}`);break;}
 case 'status':say(m.objectives.map(o=>`${objectiveDone(s,o)?'[✓]':'[ ]'} ${o.label}`).join('\n'));break;
 case 'hint':{const level=Math.min(s.hintLevel,m.hints.length-1);say(m.hints[level]+(level>=m.hints.length-1?' (final hint)':` (hint ${level+1} of ${m.hints.length})`));s.hintLevel=Math.min(s.hintLevel+1,m.hints.length);break;}
 case 'report':intent='report';say('Open the Case report panel to link evidence and submit your conclusion.');break;
 case 'clear':s.transcript=[];break;
 }
 }catch(e){output=e.message;}
 output=personalize(output,s.username);
 if(output)s.transcript.push({kind:'output',text:output});s.transcript=s.transcript.slice(-160);
 return {state:s,output,intent};
}
export function submitReport(state, finding, cited, uncertainty){
 const s=structuredClone(state),m=missionById(s.missionId);
 if(s.report)throw new Error('Report already finalized. Retry to attempt another outcome.');
 if(!s.action||!s.verified)throw new Error('Apply a response and verify its result before submitting.');
 if(!m.findings.some(f=>f.id===finding))throw new Error('Select a finding.');
 if(!Array.isArray(cited)||!cited.length||cited.some(id=>!s.evidence.includes(id)))throw new Error('Cite at least one preserved evidence record.');
 const unique=[...new Set(cited)], a=m.actions.find(a=>a.id===s.action);
 const corroborated=m.requiredEvidence.every(id=>unique.includes(id));
 const parts={finding:finding===m.correctFinding&&corroborated?30:0,evidence:Math.round(25*m.requiredEvidence.filter(id=>unique.includes(id)).length/m.requiredEvidence.length),response:a.quality,verification:a.service?15:8,scope:uncertainty?10:5};
 const score=Object.values(parts).reduce((a,b)=>a+b,0);
 s.report={finding,cited:unique,uncertainty:!!uncertainty,score,parts};s.tick++;event(s,`Case report submitted: ${score}/100.`);
 if(!s.completed.includes(m.id))s.completed.push(m.id);
 s.caseResults[m.id]={...structuredClone(s.report),action:s.action,service:a.service,legacy:false};
 return s;
}
export function nextCase(s){const m=missionById(s.missionId);if(!s.report||!m.next)throw new Error('No next case available.');return freshState(m.next,s.completed,s);}
export function validateContent(){
 const ids=new Set();for(const m of missions){
 if(ids.has(m.id))throw new Error('Duplicate mission ID');ids.add(m.id);
 if(m.extension&&(!m.scopeLead||!m.scopeApproval))throw new Error('Missing scope extension data');
 const es=evidenceRecords(m),eids=es.map(f=>f.id),nodes=m.nodes.map(n=>n.id);
 if(new Set(eids).size!==eids.length||new Set(nodes).size!==nodes.length)throw new Error('Duplicate content IDs');
 if(m.extension&&!eids.includes(m.scopeLead))throw new Error('Invalid scope lead');
 if(m.puzzle&&(m.puzzle.requires.some(id=>!eids.includes(id))||!m.puzzle.answers.length))throw new Error('Invalid puzzle');
 if(m.puzzle&&m.puzzle.type&&!['text','order'].includes(m.puzzle.type))throw new Error('Invalid puzzle type');
 if(m.puzzle&&m.puzzle.type==='order'&&m.puzzle.answers.some(a=>a.split(',').some(id=>!eids.includes(id))))throw new Error('Invalid order puzzle answer');
 for(const id of m.requiredEvidence)if(!eids.includes(id))throw new Error('Missing evidence reference');
 for(const a of m.actions)if(!nodes.includes(a.node)||a.required.some(id=>!eids.includes(id)))throw new Error('Invalid response reference');
 for(const o of m.objectives)if(o.kind==='evidence'&&o.values.some(id=>!eids.includes(id)))throw new Error('Invalid objective');
 if(m.next&&!missions.some(x=>x.id===m.next))throw new Error('Invalid next mission');
 if(!m.findings.some(f=>f.id===m.correctFinding))throw new Error('Missing correct finding');
 if(!scenarios.some(x=>x.id===m.scenario))throw new Error('Invalid scenario reference');
 }
 for(const scen of scenarios){
 if(!missionsFor(scen.id).some(m=>m.id===scen.firstMission))throw new Error('Invalid scenario firstMission');
 if(!missionsFor(scen.id).some(m=>m.id===scen.endMission))throw new Error('Invalid scenario endMission');
 }
 for(const e of exercises){const m=missionById(e.mission),ids=evidenceRecords(m).map(f=>f.id);if(e.requires.some(id=>!ids.includes(id)))throw new Error('Invalid exercise reference');}
 for(const [id,edges] of Object.entries(connections)){const ids=missionById(id).nodes.map(n=>n.id);if(edges.some(e=>!ids.includes(e.from)||!ids.includes(e.to)))throw new Error('Invalid map connection');}
 return true;
}

export function chooseEnding(state,id){
 const s=structuredClone(state);
 const scen=scenarios.find(x=>x.endMission===s.missionId);
 const list=scen?missionsFor(scen.id):[];
 if(!scen||!s.report||!list.every(m=>s.completed.includes(m.id)))throw new Error('Finish the campaign and final report before choosing an ending.');
 if(s.ending)throw new Error('Ending already chosen. Replay the finale to explore another ending.');
 const endings=endingsFor(scen.id);
 if(!endings.some(e=>e.id===id))throw new Error('Unknown ending.');
 s.ending=id;s.tick++;event(s,'Final decision: '+endings.find(e=>e.id===id).title);return s;
}
export function replayCase(state,id){
 const m=missionById(id),list=missionsFor(m.scenario);
 const index=list.findIndex(x=>x.id===id);
 if(index<0||!(index===0||state.completed.includes(list[index-1].id)||state.completed.includes(id)||state.missionId===id))throw new Error('Complete the previous case to unlock this case.');
 return freshState(id,state.completed,state);
}
