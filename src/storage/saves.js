import { exerciseById } from '../content/extras.js';
import { DEFAULT_THEME, validTheme } from '../ui/themes.js';
import { normalizeUsername } from '../engine/profile.js';
import { endingsFor } from '../content/endings.js';
import { missions, missionById, CONTENT_VERSION, scenarios, missionsFor, scenarioOf } from '../content/missions.js';
import { evidenceRecords, submitReport } from '../engine/game.js';
export const MAX_SAVE_BYTES=1_000_000;
const fail=()=>{throw new Error('Invalid or incompatible save. Your current game has not been replaced.');};
export function validateSave(raw,depth=0){
 if(!raw||typeof raw!=='object')fail();
 if(raw.version===1&&raw.contentVersion===1){
  if(!['cold-boot','bakery','halden'].includes(raw.missionId)||!Array.isArray(raw.completed)||raw.completed.some(id=>!['cold-boot','bakery','halden'].includes(id)))fail();
  raw=structuredClone(raw);raw.version=2;raw.contentVersion=CONTENT_VERSION;raw.username='operator';raw.profileSet=false;
  raw.preferences={fontSize:16,contrast:false};raw.ending=null;raw.caseResults={};
  for(const id of raw.completed)raw.caseResults[id]={legacy:true,score:0,service:true,action:null};
  if(raw.report){const m=missionById(raw.missionId),a=m.actions.find(a=>a.id===raw.action);if(!a)fail();raw.caseResults[m.id]={...raw.report,action:raw.action,service:a.service,legacy:false};}
 }
 if(raw.version!==2||raw.contentVersion!==CONTENT_VERSION)fail();
 try{if(normalizeUsername(raw.username)!==raw.username)fail();}catch{fail();}
 if(typeof raw.profileSet!=='boolean')fail();
 const pref=raw.preferences;
 if(!pref||!Number.isInteger(pref.fontSize)||pref.fontSize<14||pref.fontSize>22||typeof pref.contrast!=='boolean')fail();
 const theme=pref.theme===undefined?DEFAULT_THEME:pref.theme;
 if(!validTheme(theme))fail();
 const difficulty=pref.difficulty===undefined?'standard':pref.difficulty;
 if(!['guided','standard','expert'].includes(difficulty))fail();
 const sound=pref.sound===undefined?false:pref.sound;
 if(typeof sound!=='boolean')fail();
 const ambience=pref.ambience===undefined?false:pref.ambience,volume=pref.volume===undefined?25:pref.volume;
 if(typeof ambience!=='boolean'||!Number.isInteger(volume)||volume<0||volume>100)fail();
 if(raw.ending!==null){const scen=scenarios.find(x=>x.endMission===raw.missionId);if(!scen||!endingsFor(scen.id).some(e=>e.id===raw.ending)||!raw.report||!Array.isArray(raw.completed)||!missionsFor(scen.id).every(m=>raw.completed.includes(m.id)))fail();}
 let m;try{m=missionById(raw.missionId);}catch{fail();}
 const strings=(a,max=200)=>Array.isArray(a)&&a.length<=max&&a.every(x=>typeof x==='string'&&x.length<=200);
 if(!strings(raw.completed)||raw.completed.some(id=>{try{missionById(id);return false;}catch{return true;}}))fail();
 const ids=evidenceRecords(m).map(f=>f.id);
 const boardIn=raw.board===undefined?{notes:{},links:[]}:raw.board;
 if(!boardIn||typeof boardIn!=='object'||Array.isArray(boardIn))fail();
 const notesIn=boardIn.notes;
 if(!notesIn||typeof notesIn!=='object'||Array.isArray(notesIn))fail();
 for(const [id,text] of Object.entries(notesIn))if(!ids.includes(id)||typeof text!=='string'||text.length>2000)fail();
 if(!Array.isArray(boardIn.links)||boardIn.links.length>200)fail();
 const linkSeen=new Set();
 for(const pair of boardIn.links){
  if(!Array.isArray(pair)||pair.length!==2||!ids.includes(pair[0])||!ids.includes(pair[1])||pair[0]===pair[1])fail();
  const key=[...pair].sort().join('|');if(linkSeen.has(key))fail();linkSeen.add(key);
 }
 const board={notes:{...notesIn},links:boardIn.links.map(pair=>[...pair].sort())};
 if(!strings(raw.flags)||raw.flags.some(f=>!['scope','extension','puzzle'].includes(f)))fail();
 for(const key of ['read','evidence'])if(!strings(raw[key])||new Set(raw[key]).size!==raw[key].length||raw[key].some(id=>!ids.includes(id)))fail();
 if(raw.evidence.some(id=>!raw.read.includes(id)))fail();
 if(raw.node!==null&&!m.initialScope.includes(raw.node))fail();
 if(typeof raw.cwd!=='string'||raw.cwd.length>256||!raw.cwd.startsWith('/'))fail();
 if(raw.node===null&&raw.cwd!=='/')fail();
 if(raw.node&&raw.cwd!=='/'&&!m.nodes.find(n=>n.id===raw.node).files.some(f=>f.path.startsWith(raw.cwd+'/')))fail();
 if(!Number.isSafeInteger(raw.tick)||raw.tick<0||raw.tick>1e9||!Number.isInteger(raw.hintLevel)||raw.hintLevel<0||raw.hintLevel>m.hints.length||typeof raw.verified!=='boolean')fail();
 if(!Array.isArray(raw.events)||raw.events.length>150||raw.events.some(e=>!e||!Number.isSafeInteger(e.tick)||e.tick<0||e.tick>raw.tick||typeof e.text!=='string'||e.text.length>4000))fail();
 if(!Array.isArray(raw.transcript)||raw.transcript.length>160||raw.transcript.some(e=>!e||!['system','input','output'].includes(e.kind)||typeof e.text!=='string'||e.text.length>16000))fail();
 if(raw.flags.includes('puzzle')&&(!m.puzzle||!m.puzzle.requires.every(id=>raw.evidence.includes(id))))fail();
 if(raw.action!==null){const a=m.actions.find(a=>a.id===raw.action);if(!a||!a.required.every(id=>raw.evidence.includes(id))||(m.extension&&!raw.flags.includes('extension'))||(m.puzzle&&!raw.flags.includes('puzzle')))fail();}
 if(raw.verified&&!raw.action)fail();
 if(raw.flags.includes('extension')&&(!m.extension||!raw.evidence.includes(m.scopeLead)))fail();
 const caseResults={};
 if(!raw.caseResults||typeof raw.caseResults!=='object'||Array.isArray(raw.caseResults)||Object.keys(raw.caseResults).length>missions.length)fail();
 for(const [id,result] of Object.entries(raw.caseResults)){
  if(!raw.completed.includes(id)||!result||typeof result!=='object')fail();
  if(result.legacy===true){if(!['cold-boot','bakery','halden'].includes(id))fail();caseResults[id]={legacy:true,score:0,service:true,action:null};continue;}
  const cm=missionById(id),a=cm.actions.find(a=>a.id===result.action);
  if(!a||result.legacy!==false||typeof result.uncertainty!=='boolean'||result.service!==a.service||!Array.isArray(result.cited)||result.cited.length>50||new Set(result.cited).size!==result.cited.length||!result.cited.length||result.cited.some(e=>!evidenceRecords(cm).some(f=>f.id===e))||!cm.findings.some(f=>f.id===result.finding))fail();
  const parts={finding:result.finding===cm.correctFinding&&cm.requiredEvidence.every(id=>result.cited.includes(id))?30:0,evidence:Math.round(25*cm.requiredEvidence.filter(id=>result.cited.includes(id)).length/cm.requiredEvidence.length),response:a.quality,verification:a.service?15:8,scope:result.uncertainty?10:5};
  const score=Object.values(parts).reduce((a,b)=>a+b,0);if(score!==result.score)fail();
  caseResults[id]={finding:result.finding,cited:[...result.cited],uncertainty:result.uncertainty,score,parts,action:a.id,service:a.service,legacy:false};
 }
 if(raw.completed.some(id=>!Object.hasOwn(caseResults,id)))fail();
 let report=null;
 if(raw.report!==null){
 const r=raw.report;if(!r||typeof r.uncertainty!=='boolean')fail();
 try{report=submitReport({...raw,report:null},r.finding,r.cited,r.uncertainty).report;}catch{fail();}
 if(report.score!==r.score||!raw.completed.includes(m.id)||!caseResults[m.id]||caseResults[m.id].legacy||caseResults[m.id].score!==report.score||caseResults[m.id].action!==raw.action||caseResults[m.id].finding!==report.finding||caseResults[m.id].uncertainty!==report.uncertainty||JSON.stringify(caseResults[m.id].cited)!==JSON.stringify(report.cited))fail();
 }
 const exerciseSolved=raw.exerciseSolved===undefined?[]:raw.exerciseSolved;
 if(!strings(exerciseSolved,7)||new Set(exerciseSolved).size!==exerciseSolved.length||exerciseSolved.some(id=>!exerciseById(id)))fail();
 const readMessages=raw.readMessages===undefined?[]:raw.readMessages;
 const messageIDs=missions.flatMap(m=>['brief','scope','response','verify','report'].map(s=>m.id+':'+s));
 if(!strings(readMessages,35)||new Set(readMessages).size!==readMessages.length||readMessages.some(id=>!messageIDs.includes(id)))fail();
 let autoCheckpoint=null;
 if(raw.autoCheckpoint!==undefined&&raw.autoCheckpoint!==null){
  if(depth!==0)fail();autoCheckpoint=validateSave(raw.autoCheckpoint,1);
  if(autoCheckpoint.missionId!==raw.missionId||autoCheckpoint.action!==null||autoCheckpoint.report!==null||autoCheckpoint.tick>raw.tick)fail();
 }
 // Build a clean object; never retain arbitrary imported properties.
 return {version:2,autoCheckpoint,exerciseSolved:[...exerciseSolved],readMessages:[...readMessages],username:raw.username,profileSet:raw.profileSet,preferences:{fontSize:pref.fontSize,contrast:pref.contrast,theme,difficulty,sound,ambience,volume},caseResults,ending:raw.ending,contentVersion:CONTENT_VERSION,missionId:m.id,completed:[...new Set(raw.completed)],node:raw.node,cwd:raw.cwd,flags:[...new Set(raw.flags)],read:[...raw.read],evidence:[...raw.evidence],action:raw.action,verified:raw.verified,report,hintLevel:raw.hintLevel,tick:raw.tick,events:raw.events.map(e=>({tick:e.tick,text:e.text.replaceAll('\u2014',',')})),board,transcript:raw.transcript.map(e=>({kind:e.kind,text:e.text.replaceAll('\u2014',',')}))};
}
export function parseSave(text){if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_SAVE_BYTES)throw new Error('Save exceeds the 1 MB limit.');let raw;try{raw=JSON.parse(text);}catch{throw new Error('This is not a JSON save file.');}return validateSave(raw);}
export function serializeSave(state){return JSON.stringify(validateSave(state),null,2);}
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open('professor-gito',2);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('saves'))db.createObjectStore('saves');if(!db.objectStoreNames.contains('checkpoints'))db.createObjectStore('checkpoints',{autoIncrement:true});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(new Error('Save database is blocked by another tab.'));});}
export async function loadLocal(){
 const db=await openDB();
 try{return await new Promise((resolve,reject)=>{const tx=db.transaction('saves','readonly'),store=tx.objectStore('saves');let current,previous;const a=store.get('current'),b=store.get('previous');a.onsuccess=()=>current=a.result;b.onsuccess=()=>previous=b.result;tx.oncomplete=()=>{try{if(current)resolve({state:parseSave(current),recovered:false});else resolve(null);}catch{try{if(previous)resolve({state:parseSave(previous),recovered:true});else reject(new Error('Local save is damaged; import an exported save or start a new case.'));}catch{reject(new Error('Both local saves are damaged.'));}}};tx.onerror=()=>reject(tx.error);});}finally{db.close();}
}
export async function saveLocal(state){
 const text=serializeSave(state),db=await openDB();
 try{await new Promise((resolve,reject)=>{const tx=db.transaction('saves','readwrite'),store=tx.objectStore('saves'),req=store.get('current');req.onsuccess=()=>{if(req.result){try{parseSave(req.result);store.put(req.result,'previous');}catch{/* retain last known good backup */}}store.put(text,'current');};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}
}
const MAX_CHECKPOINTS=12;
export async function saveCheckpoint(label,state){
 const text=serializeSave(state),entry={label:String(label).trim().slice(0,60)||'Checkpoint',savedAt:Date.now(),text},db=await openDB();
 try{await new Promise((resolve,reject)=>{const tx=db.transaction('checkpoints','readwrite'),store=tx.objectStore('checkpoints');store.add(entry);const req=store.getAllKeys();req.onsuccess=()=>{const keys=req.result;for(const k of keys.slice(0,Math.max(0,keys.length-MAX_CHECKPOINTS)))store.delete(k);};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}
}
export async function listCheckpoints(){
 const db=await openDB();
 try{return await new Promise((resolve,reject)=>{const tx=db.transaction('checkpoints','readonly'),req=tx.objectStore('checkpoints').openCursor(),out=[];req.onsuccess=()=>{const cur=req.result;if(cur){out.push({id:cur.primaryKey,label:cur.value.label,savedAt:cur.value.savedAt});cur.continue();}else resolve(out.sort((a,b)=>b.savedAt-a.savedAt));};tx.onerror=()=>reject(tx.error);});}finally{db.close();}
}
export async function loadCheckpoint(id){
 const db=await openDB();
 try{
  const text=await new Promise((resolve,reject)=>{const tx=db.transaction('checkpoints','readonly'),req=tx.objectStore('checkpoints').get(id);req.onsuccess=()=>resolve(req.result?.text);tx.onerror=()=>reject(tx.error);});
  if(!text)throw new Error('Checkpoint not found.');
  return parseSave(text);
 }finally{db.close();}
}
export async function deleteCheckpoint(id){
 const db=await openDB();
 try{await new Promise((resolve,reject)=>{const tx=db.transaction('checkpoints','readwrite');tx.objectStore('checkpoints').delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}finally{db.close();}
}

export async function renameCheckpoint(id,label){
 if(typeof label!=='string'||!label.trim()||label.length>60)throw new Error('Use a label between 1 and 60 characters.');
 const db=await openDB();
 try{await new Promise((resolve,reject)=>{const tx=db.transaction('checkpoints','readwrite'),store=tx.objectStore('checkpoints'),req=store.get(id);let missing=false;req.onsuccess=()=>{if(!req.result){missing=true;tx.abort();return;}store.put({...req.result,label:label.trim()},id);};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(new Error(missing?'Checkpoint not found.':'Checkpoint rename failed.'));});}finally{db.close();}
}
