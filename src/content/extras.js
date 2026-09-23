// Optional investigation exercises: these extend practice without invalidating old saves.
export const exercises = [
 {id:'account-triage',mission:'cold-boot',type:'classify',title:'Access triage',prompt:'Classify each account using the handover and access snapshot.',requires:['handover','access'],options:['expected','review'],items:[{id:'operator',label:'Permanent operator account remains enabled',answer:'expected'},{id:'visitor',label:'Temporary visitor account remains enabled after handover',answer:'review'}],explanation:'A valid account is not always expected access. Compare identity state with its business purpose.'},
 {id:'route-diff',mission:'bakery',type:'compare',title:'Configuration comparison',prompt:'Select only the changed settings that remove unintended anonymous export access while retaining checkout.',requires:['export','policy','route'],before:{export_visibility:'public',export_auth:'false',checkout:'enabled',menu:'public'},after:{export_visibility:'private',export_auth:'true',checkout:'enabled',menu:'public'},answer:['export_visibility','export_auth'],explanation:'Export visibility and authentication changed. Checkout and the menu remain available.'},
 {id:'incident-order',mission:'halden',type:'order',title:'Reconstruct the incident',prompt:'Arrange these events from earliest to latest. Use the timestamps, not the order you discovered the records.',requires:['task','traffic','manifest','health'],items:[{id:'beacon',label:'07:43: first recurring relay connection'},{id:'health',label:'08:00: dispatch availability recorded'},{id:'approval',label:'07:30: approved inventory update'},{id:'task',label:'07:42: cache-sync task created'}],answer:['approval','task','beacon','health'],explanation:'The approved update precedes the unexpected task; recurring traffic follows task creation. Sequence alone still does not prove intent.'},
 {id:'build-diff',mission:'supply-chain',type:'compare',title:'Approval versus publication',prompt:'Select every field that changed between the approved and published build snapshots.',requires:['build','registry','audit'],before:{build:'Q17-A',digest:'a17c',package:'quill-agent',task:'inventory-check'},after:{build:'Q17-B',digest:'b93f',package:'quill-agent',task:'inventory-check + cache-sync'},answer:['build','digest','task'],explanation:'The package name remained the same. Build, digest, and task content changed.'},
 {id:'port-triage',mission:'blackout',type:'classify',title:'Find the false positive',prompt:'Classify both sessions against the approved change record.',requires:['topology','beacons','operations','change'],options:['expected','review'],items:[{id:'c11',label:'C-11: local S-1 interlock heartbeat with an approved record',answer:'expected'},{id:'c18',label:'C-18: HLC-OPS remote configuration without a change ticket',answer:'review'}],explanation:'Periodic traffic is not automatically malicious. The authorized local safety heartbeat must remain available.'},
 {id:'identity-triage',mission:'inside',type:'classify',title:'Facts and assumptions',prompt:'Classify what the preserved records support.',requires:['badge','token','drop','letter'],options:['supported','unproven'],items:[{id:'used',label:'HLC-OPS was used for the remote export',answer:'supported'},{id:'person',label:'The token owner label identifies the person using it',answer:'unproven'},{id:'shared',label:'The credential was shared automation access',answer:'supported'}],explanation:'A shared credential explains the mechanism but cannot on its own identify the human operator.'},
 {id:'handoff-order',mission:'null-route',type:'order',title:'Responsible handoff',prompt:'Order the prepared handoff steps according to their dependencies.',requires:['chain','contract','offer','recovery'],items:[{id:'release',label:'Release the client-approved account'},{id:'review',label:'Have clients review the qualified account and redactions'},{id:'preserve',label:'Preserve original evidence and source references'}],answer:['preserve','review','release'],explanation:'Preserve sources before preparing a reviewable account. Client review precedes publication.'}
];
export const exerciseById=id=>exercises.find(e=>e.id===id);
export const connections={
 'cold-boot':[],
 bakery:[{from:'bakery-config',to:'bakery-web',label:'Route configuration'}],
 halden:[{from:'maintenance',to:'dispatch',label:'Maintenance dependency'},{from:'maintenance',to:'archive',label:'Event mirror'}],
 'supply-chain':[{from:'build-server',to:'registry',label:'Published artifact'},{from:'ci-audit',to:'build-server',label:'Audit mirror'}],
 blackout:[{from:'port-gateway',to:'control-mirror',label:'Support boundary S-2'},{from:'change-desk',to:'port-gateway',label:'Authorization record'}],
 inside:[{from:'identity-mirror',to:'iva-drop',label:'Credential reference'}],
 'null-route':[{from:'case-vault',to:'recovery-desk',label:'Evidence handoff'}]
};
const stories={
 'cold-boot':['Iva Marlow','Your first shift','Welcome, {username}. The terminal is only a tool. The real work is deciding what a record can support. Read your scope, then follow the handover.'],
 bakery:['Ember Bakery','Keep the morning orders moving','Please investigate the export without shutting down checkout. Every delayed order is visible to a real person in our fictional shop.'],
 halden:['Halden response lead','A second set of footprints','Our maintenance team does not recognize cache-sync. Preserve what you find. We can extend your authority once you have a specific lead.'],
 'supply-chain':['Iva Marlow','A signature is not an approval','The vendor is cooperating. Follow the exact artifact through the build system. I am meeting the support partner while you review the records.'],
 blackout:['Port control','Separate support from safety','Remote telemetry is delayed, but the local safety heartbeat is healthy. Do not mistake recurring legitimate traffic for the intrusion.'],
 inside:['Iva Marlow','Follow the credential','I am safe. The shared token carries my name, but it predates my role. My sealed message tells you which credential links the cases.'],
 'null-route':['Joint client response','Your final account','We have authorized a careful handoff. Preserve uncertainty about individuals. You have earned a decision about what happens next, not permission to invent certainty.']
};
export function messagesFor(m,state){
 const [sender,subject,body]=stories[m.id];
 const out=[{id:m.id+':brief',sender,subject,body}];
 if(state.evidence.length)out.push({id:m.id+':evidence',sender:'Cinder case desk',subject:'Your evidence archive is open',body:'Source references have been preserved. Use the Board to connect records and add your own notes. These notes are hypotheses, not automatic findings.'});
 if(state.action)out.push({id:m.id+':response',sender:m.client,subject:'Response status',body:m.actions.find(a=>a.id===state.action).impact});
 if(state.report)out.push({id:m.id+':report',sender:'Iva Marlow',subject:'Case review',body:m.debrief});
 return out;
}

export const storyFor=id=>stories[id];
