import { exerciseById } from '../content/extras.js';
export function responseSnapshot(state){const s=structuredClone(state);s.autoCheckpoint=null;return s;}
export function restoreResponse(state){if(!state.autoCheckpoint)throw new Error('No automatic checkpoint for this case.');const s=structuredClone(state.autoCheckpoint);s.username=state.username;s.profileSet=state.profileSet;s.preferences=structuredClone(state.preferences);return s;}
export function updateNote(state,id,text){
 if(!state.evidence.includes(id))throw new Error('Preserve the evidence before adding a note.');
 if(typeof text!=='string'||text.length>2000)throw new Error('Notes are limited to 2000 characters.');
 const s=structuredClone(state);if(text.trim())s.board.notes[id]=text;else delete s.board.notes[id];return s;
}
export function toggleLink(state,a,b){
 if(a===b||!state.evidence.includes(a)||!state.evidence.includes(b))throw new Error('Choose two different preserved records in this case.');
 const s=structuredClone(state),pair=[a,b].sort(),key=pair.join('|');
 const index=s.board.links.findIndex(p=>[...p].sort().join('|')===key);
 if(index>=0)s.board.links.splice(index,1);else s.board.links.push(pair);return s;
}
export function evaluateExercise(e,answer){
 if(e.type==='order')return Array.isArray(answer)&&answer.length===e.answer.length&&answer.every((id,i)=>id===e.answer[i]);
 if(e.type==='compare')return Array.isArray(answer)&&new Set(answer).size===answer.length&&answer.length===e.answer.length&&e.answer.every(id=>answer.includes(id));
 if(e.type==='classify')return !!answer&&typeof answer==='object'&&!Array.isArray(answer)&&Object.keys(answer).length===e.items.length&&e.items.every(i=>answer[i.id]===i.answer);
 return false;
}
export function solveExercise(state,id,answer){
 const e=exerciseById(id);if(!e||e.mission!==state.missionId)throw new Error('Exercise is not part of this case.');
 if(!e.requires.every(id=>state.evidence.includes(id)))throw new Error('Preserve supporting evidence first: '+e.requires.join(', '));
 if(!evaluateExercise(e,answer))throw new Error('That answer does not fit the records. Recheck the sequence or comparison.');
 const s=structuredClone(state);if(!s.exerciseSolved.includes(id))s.exerciseSolved.push(id);return s;
}
export function nextGuidedStep(state,m){
 if(state.preferences.difficulty!=='guided')return null;
 if(!state.flags.includes('scope'))return {text:'Read the rules of engagement.',command:'scope'};
 const id=m.requiredEvidence.find(id=>!state.evidence.includes(id));
 if(id){const n=m.nodes.find(n=>n.files.some(f=>f.id===id)),f=n.files.find(f=>f.id===id);if(state.node!==n.id)return {text:'Inspect '+n.label+'.',command:'connect '+n.id};if(!state.read.includes(id))return {text:'Read '+f.title+'.',command:'cat '+f.path};return {text:'Preserve this source record.',command:'collect '+id};}
 if(m.extension&&!state.flags.includes('extension'))return {text:'Ask for response authorization.',command:'request-scope'};
 if(m.puzzle&&!state.flags.includes('puzzle'))return {text:'Review the deduction prompt; hints remain available.',command:'brief'};
 if(!state.action)return {text:'Compare response choices and their impact.',command:'actions'};
 if(!state.verified)return {text:'Verify containment and legitimate service.',command:'verify'};
 return {text:'Review or submit your report.',command:'report'};
}
