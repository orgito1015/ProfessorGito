// Story layer: authored conditions and event triggers evaluated against saved state. Pure functions only.
export const TRIGGERS=['start','read','collect','flag','action','verified','report','tick','intel'];
// A condition object: {intel, notIntel, chose:'mission:action', notChose:'mission:action'}. All present keys must hold.
export function storyMatch(s,w){
 if(!w)return true;
 const intel=s.intel||[];
 const chosen=key=>{const [mid,aid]=key.split(':');return (mid===s.missionId?s.action:s.caseResults?.[mid]?.action)===aid;};
 if(w.intel&&!intel.includes(w.intel))return false;
 if(w.notIntel&&intel.includes(w.notIntel))return false;
 if(w.chose&&!chosen(w.chose))return false;
 if(w.notChose&&chosen(w.notChose))return false;
 return true;
}
// Trigger strings are 'kind' or 'kind:value', e.g. 'read:task', 'action:targeted', 'tick:8'.
export function triggered(s,on){
 const i=on.indexOf(':'),kind=i<0?on:on.slice(0,i),value=i<0?'':on.slice(i+1);
 if(kind==='start')return true;
 if(kind==='read')return s.read.includes(value);
 if(kind==='collect')return s.evidence.includes(value);
 if(kind==='flag')return s.flags.includes(value);
 if(kind==='action')return value?s.action===value:!!s.action;
 if(kind==='verified')return s.verified;
 if(kind==='report')return !!s.report;
 if(kind==='tick')return s.tick>=Number(value);
 if(kind==='intel')return (s.intel||[]).includes(value);
 return false;
}
export function storyEvents(m,s){return (m.events||[]).filter(e=>triggered(s,e.on)&&storyMatch(s,e.when));}
export function visibleFiles(s,node){return node.files.filter(f=>storyMatch(s,f.when));}
export function visibleActions(s,m){return m.actions.filter(a=>storyMatch(s,a.when));}
