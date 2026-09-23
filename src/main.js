import { restoreResponse, updateNote, toggleLink, solveExercise, nextGuidedStep } from './engine/extensions.js';
import { connections } from './content/extras.js';
import { graph } from './ui/graphs.js';
import { exercisePanel } from './ui/exercises.js';
import { AudioBus } from './ui/audio.js';
import { themes, applyTheme } from './ui/themes.js';
import { missionById, scenarios, campaignFor, missionsFor, scenarioOf } from './content/missions.js';
import { freshState, execute, objectiveDone, evidenceRecords, commands, submitReport, nextCase, chooseEnding, replayCase, messagesFor } from './engine/game.js';
import { loadLocal, saveLocal, parseSave, serializeSave, MAX_SAVE_BYTES, saveCheckpoint, listCheckpoints, loadCheckpoint, deleteCheckpoint, renameCheckpoint } from './storage/saves.js';
import { endingsFor, endingText } from './content/endings.js';
import { setUsername, personalize } from './engine/profile.js';
import { el, button, emptyIcon } from './ui/dom.js';
const TAB_IDS=['evidence','brief','map','board','practice','messages','timeline','report','record'];

let state=freshState(),activeTab='evidence',history=[],historyIndex=0,saveQueue=Promise.resolve(),saving=false,status='Loading local workspace…',boardLinking=null;let boot={view:'loading'};
let reportDraft={finding:'',cited:[],uncertainty:false},transferAnswer=null,bootError=null;
const app=document.querySelector('#app');
const audio=new AudioBus();
let noteTimer=null,pendingSaves=0;
let commandDraft='',historyDraft='',followTerminal=true,resetTerminal=false,focusMode=false,sidebarOpen=true;
let chosenScenarioId=scenarios[0].id,welcomeUsernameDraft='';
let renderedTab=null;const panelScroll={};
try{focusMode=localStorage.getItem('gito-focus-mode')==='true';}catch{}
function setFocusMode(value){focusMode=value;try{localStorage.setItem('gito-focus-mode',String(value));}catch{}}
function toggleFocus(){setFocusMode(!focusMode);render();document.querySelector('#focus-toggle')?.focus();}
try{sidebarOpen=localStorage.getItem('gito-sidebar-open')!=='false';}catch{}
function toggleSidebar(){sidebarOpen=!sidebarOpen;try{localStorage.setItem('gito-sidebar-open',String(sidebarOpen));}catch{}render();document.querySelector('#sidebar-toggle')?.focus();}
function insertCommand(text){const input=document.querySelector('#command');commandDraft=text;if(input){input.value=text;input.focus();input.setSelectionRange(text.length,text.length);}}
function commandGuide(){
 const d=el('dialog',{class:'settings-dialog command-guide','aria-labelledby':'guide-title'});
 const groups=[['Explore',[['scope','Read authorized hosts'],['scan','List the network'],['connect ','Connect to a host'],['ls','List evidence files'],['cat ','Read a file path']]],['Investigate',[['collect ','Preserve a record ID'],['decode ','Decode a record ID'],['solve ','Submit a deduction'],['hint','Ask for a clue']]],['Resolve',[['actions','Compare available responses'],['request-scope','Request response authority'],['respond ','Apply a response ID'],['verify','Check the result'],['report','Open your report']]]];
 d.append(el('div',{class:'eyebrow'},'TERMINAL COMPANION'),el('h2',{id:'guide-title'},'A command at a time.'),el('p',{},'Choose a command to place it in the terminal. Add a host, path, or record ID when needed, then press Enter.'),groups.map(([name,items])=>el('section',{},el('h3',{},name),el('div',{class:'guide-grid'},items.map(([cmd,desc])=>button(el('span',{},el('code',{},cmd.trim()),el('small',{},desc)),()=>{d.close();insertCommand(cmd);},'guide-command'))))),el('p',{class:'muted'},'↑ ↓ Command history · Tab Complete a command · Alt+/ Focus terminal'),button('Close',()=>d.close(),'primary'));
 document.body.append(d);d.addEventListener('close',()=>d.remove());d.showModal();
}
function notice(text){status=text;document.querySelector('#save-status')?.replaceChildren(text);}
function persist(){
 const snapshot=structuredClone(state);pendingSaves++;saving=true;
 saveQueue=saveQueue.catch(()=>{}).then(()=>saveLocal(snapshot)).then(()=>notice('Saved on this browser')).catch(()=>notice('Local save unavailable; use Export save')).finally(()=>{pendingSaves--;saving=pendingSaves>0;});
}
function changeCase(next){clearTimeout(noteTimer);noteTimer=null;boardLinking=null;commandDraft='';historyDraft='';resetTerminal=true;state=next;reportDraft={finding:'',cited:[],uncertainty:false};transferAnswer=null;history=[];historyIndex=0;activeTab='evidence';persist();render();}
function beep(){audio.configure(state.preferences,true).then(()=>audio.cue());}
function run(input){
 commandDraft='';historyDraft='';followTerminal=true;
 if(!input.trim()){
  const s=structuredClone(state);s.transcript.push({kind:'input',text:''});s.transcript=s.transcript.slice(-160);state=s;
  persist();render();document.querySelector('#command')?.focus();return;
 }
 clearTimeout(noteTimer);noteTimer=null;const beforeTick=state.tick,r=execute(state,input);state=r.state;if(r.intent){activeTab=r.intent;setFocusMode(false);}
 if(state.tick>beforeTick&&r.state.events.at(-1)?.tick===state.tick)beep();
 history.push(input);history=history.slice(-100);historyIndex=history.length;
 persist();render();document.querySelector(r.intent?'#case-panel':'#command')?.focus();
}
function exportSave(){const blob=new Blob([serializeSave(state)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a',{href:url,download:`professor-gito-${state.missionId}.json`});a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('Save exported');}
async function importSave(file){
 if(!file)return;
 try{if(file.size>MAX_SAVE_BYTES)throw new Error('Save exceeds 1 MB.');const next=parseSave(await file.text());if(!confirm('Replace the current case with this imported save?'))return;changeCase(next);}catch(e){notice(e.message);}
}
function profileDialog(){
 const d=el('dialog',{id:'profile-dialog',class:'settings-dialog','aria-labelledby':'profile-title'});
 const input=el('input',{id:'player-name',name:'username',type:'text',autocomplete:'nickname',maxlength:20,placeholder:'gito',value:state.username,required:true});
 const error=el('p',{role:'alert',class:'warning'});
 const preview=el('p',{class:'username-preview'},(input.value||'yourname')+'@cinder:/$');
 input.addEventListener('input',()=>{preview.textContent=(input.value||'yourname')+'@cinder:/$';});
 const form=el('form',{},el('div',{class:'eyebrow'},'OPERATOR PROFILE'),el('h2',{id:'profile-title'},'Change your username'),el('p',{},'This name appears in the terminal, case records, and ending. It stays on this browser and in your exported save.'),el('label',{for:'player-name'},'Username'),input,preview,el('small',{},'2 to 20 characters. Start with a letter. Letters, numbers, underscores, and hyphens are allowed.'),error,el('button',{type:'submit',class:'primary'},'Save username'),button('Cancel',()=>d.close(),'secondary'));
 form.onsubmit=e=>{e.preventDefault();try{state=setUsername(state,input.value);d.close();d.remove();persist();render();document.querySelector('#command')?.focus();}catch(e){error.textContent=e.message;}};
 d.append(form);d.addEventListener('close',()=>d.remove());document.body.append(d);d.showModal();input.focus();
}
function welcomeScreen(){
 const input=el('input',{id:'player-name',name:'username',type:'text',autocomplete:'nickname',maxlength:20,placeholder:'gito',value:welcomeUsernameDraft,required:true});
 const error=el('p',{role:'alert',class:'warning'});
 const preview=el('p',{class:'username-preview'},(input.value||'yourname')+'@cinder:/$');
 input.addEventListener('input',()=>{welcomeUsernameDraft=input.value;preview.textContent=(input.value||'yourname')+'@cinder:/$';});
 const missionGrid=el('div',{class:'mission-grid',role:'radiogroup','aria-label':'Mission'},scenarios.map(scen=>el('button',{type:'button',class:'mission-choice','aria-pressed':chosenScenarioId===scen.id,onClick:()=>{chosenScenarioId=scen.id;render();document.querySelector('#player-name')?.focus();}},el('strong',{},scen.title),el('small',{},missionsFor(scen.id).length+' cases'),el('p',{},scen.tagline))));
 const form=el('form',{class:'welcome-form'},el('label',{for:'player-name'},'Username'),input,preview,el('small',{},'2 to 20 characters. Start with a letter. Letters, numbers, underscores, and hyphens are allowed.'),error,el('button',{type:'submit',class:'primary'},'Start the campaign'));
 form.onsubmit=e=>{e.preventDefault();try{const scen=scenarios.find(s=>s.id===chosenScenarioId)||scenarios[0];state=freshState(scen.firstMission);state=setUsername(state,input.value);persist();boot.view='game';render();document.querySelector('#command')?.focus();}catch(e){error.textContent=e.message;}};
 return el('div',{class:'welcome-screen'},el('div',{class:'welcome-card'},el('span',{class:'brand-mark'},el('img',{src:'./public/logo.png',alt:'','aria-hidden':true})),el('h1',{},'ProfessorGito'),el('p',{class:'muted'},'A fictional Cinder investigation. Choose a mission, then a terminal username, to begin.'),el('h2',{class:'welcome-subhead'},'Mission'),missionGrid,form));
}
function finalPanel(){
 if(!state.ending)return el('section',{class:'ending-panel'},el('div',{class:'eyebrow'},'YOUR FINAL DECISION'),el('h3',{},'What happens to the truth?'),el('p',{},'Your earlier reports and service disruptions shape the epilogue. The selected ending is saved; replay the finale to explore another.'),endingsFor(scenarioOf(state.missionId)).map(e=>button(e.title+' · '+e.summary,()=>{try{state=chooseEnding(state,e.id);persist();render();}catch(err){notice(err.message);}},'choice')));
 const end=endingText(state);
 return el('section',{class:'ending-panel'},el('div',{class:'eyebrow'},'CAMPAIGN COMPLETE'),el('h2',{},end.title),end.text.map(t=>el('p',{},t)),el('p',{class:'feedback'},'Recorded case average: '+end.average+'/100. Service interruptions: '+end.outages+'. Legacy cases without archived scores are excluded.'),button('Export campaign record',exportCampaign,'primary'),el('h3',{},'Credits'),el('p',{},'ProfessorGito. An original fictional Cinder investigation. Thank you for following the evidence.'),button('Start a new campaign',newCampaign,'secondary'));
}
function exportCampaign(){
 const lines=['ProfessorGito / campaign record','Operator: '+state.username,'Ending: '+(state.ending?endingText(state).title:'Not chosen'),''];
 for(const m of missionsFor(scenarioOf(state.missionId))){const result=state.caseResults[m.id];lines.push(m.title+': '+(result?(result.legacy?'Completed in older version; score unavailable':result.score+'/100 | '+result.action+' | service '+(result.service?'available':'unavailable')):'Not completed'));}
 if(state.ending)lines.push('',...endingText(state).text);
 const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain'}));el('a',{href:url,download:'professor-gito-campaign.txt'}).click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function newCampaign(){if(confirm('Start over? Export your save first to retain this campaign. Your username and preferences will be kept.')){const scen=scenarios.find(s=>s.id===scenarioOf(state.missionId))||scenarios[0];changeCase(freshState(scen.firstMission,[],{username:state.username,profileSet:state.profileSet,preferences:state.preferences}));}}
function checkpointsDialog(){
 const d=el('dialog',{class:'settings-dialog','aria-label':'Checkpoints'});
 const list=el('div',{class:'checkpoint-list'});
 const labelInput=el('input',{type:'text',maxlength:60,placeholder:'e.g. Before responding'});
 const err=el('p',{role:'alert',class:'warning'});
 async function refresh(){
  list.replaceChildren(el('p',{class:'muted'},'Loading checkpoints…'));
  try{
   const items=await listCheckpoints();
   list.replaceChildren(el('div',{},items.length?items.map(c=>el('article',{class:'evidence-card checkpoint'},el('strong',{},c.label),el('p',{},new Date(c.savedAt).toLocaleString()),button('Rename',async()=>{const name=prompt('Checkpoint name',c.label);if(name===null)return;try{await renameCheckpoint(c.id,name);await refresh();}catch(e){err.textContent=e.message;}},'secondary'),button('Export',async()=>{try{const saved=await loadCheckpoint(c.id);downloadText('professor-gito-checkpoint.json',serializeSave(saved),'application/json');}catch(e){err.textContent=e.message;}},'secondary'),button('Load',async()=>{
    if(!confirm('Replace the current game with this checkpoint? Export your current save first if you want to keep it.'))return;
    try{const loaded=await loadCheckpoint(c.id);d.close();d.remove();changeCase(loaded);}catch(e){err.textContent=e.message;}
   },'secondary'),button('Delete',async()=>{if(!confirm('Delete this checkpoint?'))return;try{await deleteCheckpoint(c.id);await refresh();}catch(e){err.textContent=e.message;}},'secondary'))):el('p',{class:'muted'},'No checkpoints saved yet.')));
  }catch(e){list.replaceChildren(el('p',{class:'warning'},'Checkpoints unavailable: '+e.message));}
 }
 const saveBtn=button('Save checkpoint here',async()=>{
  try{saveBtn.disabled=true;await saveCheckpoint(labelInput.value,state);labelInput.value='';err.textContent='';await refresh();}catch(e){err.textContent=e.message;}finally{saveBtn.disabled=false;}
 },'primary');
 d.append(el('h2',{},'Checkpoints'),state.autoCheckpoint?el('div',{class:'feedback'},el('p',{},'Automatic checkpoint: before your last response in this case.'),button('Restore before response',()=>{if(!confirm('Undo this response and return to the pre-response state?'))return;d.close();changeCase(restoreResponse(state));},'secondary')):el('p',{class:'muted'},'An automatic checkpoint is created before an authorized response.'),el('p',{},'Save a snapshot of this case to come back to before a decision. Up to 12 are kept on this browser; the oldest is dropped first.'),el('label',{},'Label ',labelInput),saveBtn,err,el('h3',{},'Saved checkpoints'),list,button('Close',()=>{d.close();d.remove();},'secondary'));
 document.body.append(d);d.addEventListener('close',()=>d.remove());d.showModal();refresh();
}
function settings(){
 const d=el('dialog',{class:'settings-dialog','aria-label':'Workspace settings'});
 const current=el('p',{class:'theme-current',role:'status'},'Selected: '+themes.find(t=>t.id===state.preferences.theme)?.name);
 const themeGrid=el('div',{class:'theme-grid','aria-label':'Color themes'},themes.map(t=>el('button',{type:'button',class:'theme-choice','data-theme-choice':t.id,'aria-pressed':state.preferences.theme===t.id,onClick:()=>{
  state.preferences.theme=t.id;applyTheme(state.preferences);persist();
  d.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.getAttribute('data-theme-choice')===t.id)));
  current.textContent='Selected: '+t.name;
 }},el('span',{class:'theme-swatch',style:'background:'+t.colors.accent,'aria-hidden':'true'}),t.name)));
 const size=el('input' ,{type:'range',min:14,max:22,value:state.preferences.fontSize,'aria-label':'Text size',onInput:e=>{state.preferences.fontSize=Number(e.target.value);document.documentElement.style.setProperty('--font-size',e.target.value+'px');persist();}});
 const contrast=el('input',{type:'checkbox',checked:state.preferences.contrast,onChange:e=>{state.preferences.contrast=e.target.checked;applyTheme(state.preferences);persist();}});
 const sound=el('input',{type:'checkbox',checked:state.preferences.sound,onChange:e=>{state.preferences.sound=e.target.checked;audio.configure(state.preferences,true);persist();}});
 const ambience=el('input',{type:'checkbox',checked:state.preferences.ambience,onChange:e=>{state.preferences.ambience=e.target.checked;audio.configure(state.preferences,true);persist();}});
 const volume=el('input',{type:'range',min:0,max:100,value:state.preferences.volume,'aria-label':'Audio volume',onInput:e=>{state.preferences.volume=Number(e.target.value);audio.configure(state.preferences,true);persist();}});
 const difficultyGrid=el('div',{class:'difficulty-grid','aria-label':'Difficulty mode'},[['guided','Guided','Shows a next-step tip and keeps quick command shortcuts.'],['standard','Standard','The default experience.'],['expert','Expert','Hides quick shortcuts and generic objective labels for a harder read.']].map(([id,name,desc])=>el('button',{type:'button',class:'difficulty-choice','data-difficulty-choice':id,'aria-pressed':state.preferences.difficulty===id,onClick:()=>{
  state.preferences.difficulty=id;persist();render();
  d.querySelectorAll('[data-difficulty-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.getAttribute('data-difficulty-choice')===id)));
 }},el('strong',{},name),el('small',{},desc))));
 d.append(el('h2',{},'Workspace settings'),el('h3',{class:'theme-legend'},'Color theme'),themeGrid,current,el('label',{},'Text size ',size),el('label',{},contrast,' High contrast'),el('label',{},sound,' Sound effects (optional)'),el('label',{},ambience,' Ambient sound (optional)'),el('label',{},'Audio volume ',volume),el('h3',{class:'theme-legend'},'Difficulty'),difficultyGrid,el('p',{},'All gameplay is keyboard accessible. Essential information is text; sound is optional and off by default. Settings are included in your save.'),button('Change username',()=>{d.close();profileDialog();},'secondary'),button('Checkpoints',()=>{d.close();checkpointsDialog();},'secondary'),button('New campaign',()=>{d.close();newCampaign();},'secondary'),button('Close',()=>{d.close();d.remove();},'primary'));document.body.append(d);d.showModal();d.addEventListener('close',()=>d.remove());
}
function reportPanel(m){
 if(state.report){const r=state.report;return el('div',{class:'report-result'},el('div',{class:'eyebrow'},'CASE CLOSED'),el('div',{class:'score'},r.score,el('small',{},' / 100')),el('h3',{},r.score>=85?'A supported conclusion':'A case to learn from'),el('p',{},m.debrief),el('dl',{class:'score-parts'},Object.entries(r.parts).map(([k,v])=>[el('dt',{},k),el('dd',{},v)])),r.parts.finding===0?el('p',{class:'warning'},'The finding was incorrect or lacked full corroboration.'):null,
 el('h3',{},'One more question'),el('p',{},m.transfer.question),m.transfer.choices.map((text,i)=>button(text,()=>{transferAnswer=i;render();},'choice '+(transferAnswer===i?'selected':''))),transferAnswer!==null?el('p',{class:'feedback'},(transferAnswer===m.transfer.correct?'Correct. ':'Reconsider. ')+m.transfer.explanation):null,
 m.next?button('Continue to next case →',()=>changeCase(nextCase(state)),'primary'):finalPanel(),button('Retry this case',()=>{if(confirm('Restart this case? Your completed-case history is retained.'))changeCase(replayCase(state,m.id));},'secondary'));
 }
 const form=el('form',{class:'report-form'});const select=el('select',{'aria-label':'Finding',required:true},el('option',{value:''},'Select a supported finding'),m.findings.map(f=>el('option',{value:f.id},f.label)));select.value=reportDraft.finding;select.onchange=()=>reportDraft.finding=select.value;
 const error=el('p',{role:'alert',class:'warning'});
 form.append(el('h3',{},'State what the evidence supports'),el('p',{},'Preserve records, apply a response, then verify. No essays required.'),el('label',{},'Finding',select),el('fieldset',{},el('legend',{},'Supporting evidence'),state.evidence.length?state.evidence.map(id=>{const f=evidenceRecords(m).find(f=>f.id===id);return el('label',{class:'check'},el('input',{type:'checkbox',checked:reportDraft.cited.includes(id),onChange:e=>{reportDraft.cited=e.target.checked?[...reportDraft.cited,id]:reportDraft.cited.filter(x=>x!==id);}}),f.title);}):el('p',{},'No records preserved yet. Use collect <id>.')),el('label',{class:'check'},el('input',{type:'checkbox',checked:reportDraft.uncertainty,onChange:e=>reportDraft.uncertainty=e.target.checked}),'I distinguish confirmed facts from unknown attribution.'),error,el('button',{type:'submit',class:'primary'},'Submit case report'));
 form.onsubmit=e=>{e.preventDefault();try{state=submitReport(state,reportDraft.finding,reportDraft.cited,reportDraft.uncertainty);persist();render();}catch(e){error.textContent=e.message;}};return form;
}
function boardPanel(m){
 const records=evidenceRecords(m).filter(f=>state.evidence.includes(f.id));
 if(!records.length)return el('div',{class:'empty'},el('div',{class:'empty-icon'},emptyIcon()),el('h3',{},'Nothing to connect yet.'),el('p',{},'Preserve evidence records, then link them here and add notes.'));
 const linkKey=(a,b)=>[a,b].sort().join('|');
 const cards=records.map(f=>{
  const linked=boardLinking===f.id;
  const note=el('textarea',{class:'board-note',rows:3,maxlength:2000,id:'note-'+f.id,'aria-label':'Notes for '+f.title,placeholder:'Personal notes…'},state.board.notes[f.id]||'');
  note.oninput=()=>{try{state=updateNote(state,f.id,note.value);clearTimeout(noteTimer);noteTimer=setTimeout(()=>{noteTimer=null;persist();},350);}catch(e){notice(e.message);}};
  note.onblur=()=>{clearTimeout(noteTimer);noteTimer=null;persist();};
  const linkBtn=button(linked?'Cancel link':'Link to…',()=>{
   if(boardLinking===null){boardLinking=f.id;render();return;}
   if(boardLinking===f.id){boardLinking=null;render();return;}
   try{state=toggleLink(state,boardLinking,f.id);}catch(e){notice(e.message);boardLinking=null;return;}
   boardLinking=null;persist();render();
  },'secondary'+(linked?' selected':''));
  return el('article',{class:'evidence-card board-card'},el('div',{class:'eyebrow'},f.id),el('h3',{},f.title),note,linkBtn);
 });
 const links=state.board.links.map(([a,b])=>{
  const fa=records.find(f=>f.id===a),fb=records.find(f=>f.id===b);
  if(!fa||!fb)return null;
  return el('li',{},fa.title+' to '+fb.title+' ',button('Remove',()=>{state.board.links=state.board.links.filter(p=>linkKey(p[0],p[1])!==linkKey(a,b));persist();render();},'secondary'));
 }).filter(Boolean);
 return el('div',{},el('p',{class:'muted'},'Pick "Link to…" on two records to connect them. Notes save automatically (2000 characters maximum).'),graph(records.map(f=>({id:f.id,status:f.title.length>23?f.title.slice(0,21)+'…':f.title,ariaLabel:'Edit note for '+f.title})),state.board.links.map(([from,to])=>({from,to})),{label:'Evidence connections',onSelect:id=>document.querySelector('#note-'+id)?.focus()}),el('div',{class:'board-grid'},cards),links.length?el('div',{},el('h3',{},'Connections'),el('ul',{class:'board-links'},links)):null);
}
function messagesPanel(m){
 const msgs=messagesFor(state);
 return el('div',{class:'messages-panel'},msgs.map(msg=>{
  const read=state.readMessages.includes(msg.id);
  return el('article',{class:'evidence-card message-card'},el('div',{class:'eyebrow'},msg.from+(read?' / READ':' / NEW')),el('h3',{},msg.subject),el('p',{},personalize(msg.text,state.username)),read?null:button('Mark read',()=>{state.readMessages.push(msg.id);persist();render();},'secondary'));
 }));
}
function networkMap(m){
 const edges=connections[m.id]||[];
 const response=state.action?m.actions.find(a=>a.id===state.action):null;
 return el('section',{},el('p',{class:'muted'},'A case relationship map, not a live network scan. Read scope, then select an authorized host to connect.'),graph(m.nodes.map(n=>({id:n.id,status:m.initialScope.includes(n.id)?(state.node===n.id?'CONNECTED':'AUTHORIZED'):'OUT OF SCOPE',locked:!m.initialScope.includes(n.id),active:state.node===n.id,ariaLabel:'Connect to '+n.label})),edges,{label:'Case host relationships',onSelect:id=>run('connect '+id)}),edges.length?el('ul',{class:'relationship-list'},edges.map(e=>el('li',{},e.from+' → '+e.to+': '+e.label))):el('p',{class:'muted'},'Single-host training environment.'),response?el('p',{class:'feedback'},'Response: '+response.impact):null,el('div',{class:'host-details'},m.nodes.map(n=>el('article',{class:'evidence-card'},el('strong',{},n.label),el('p',{},n.address+' / '+n.role)))));
}
function panel(m){
 if(activeTab==='record')return el('section',{},el('h3',{},'Campaign record'),el('p',{},'Operator: '+state.username),missionsFor(scenarioOf(state.missionId)).map(c=>{const r=state.caseResults[c.id];return el('article',{class:'evidence-card'},el('strong',{},c.title),el('p',{},r?(r.legacy?'Completed in the previous version; score not archived.':r.score+'/100. '+r.action+'. Service '+(r.service?'available.':'unavailable.')):'Not completed.'));}),button('Export campaign record',exportCampaign,'secondary'));

 if(activeTab==='practice')return exercisePanel(state,(id,answer)=>{state=solveExercise(state,id,answer);beep();persist();render();});
 if(activeTab==='report')return reportPanel(m);
 if(activeTab==='board')return boardPanel(m);
 if(activeTab==='messages')return messagesPanel(m);
 if(activeTab==='map')return networkMap(m);
 if(activeTab==='timeline')return el('div',{class:'timeline'},state.events.length?state.events.map(e=>el('article',{},el('small',{},'STEP '+String(e.tick).padStart(2,'0')),el('p',{},e.text))):el('p',{class:'muted'},'Nothing recorded yet.'));
 if(activeTab==='brief')return el('div',{},el('p',{class:'brief-text'},personalize(m.brief,state.username)),m.puzzle?el('p',{class:'feedback'},m.puzzle.prompt):null,el('h3',{class:'responses-title'},'Response actions'),m.actions.map(a=>el('article',{class:'evidence-card'},el('strong',{},a.label),el('p',{},a.impact),el('code',{},'respond '+a.id))));
 const records=evidenceRecords(m).filter(f=>state.evidence.includes(f.id));
 return el('div',{},records.length?el('div',{class:'panel-intro'},el('span',{class:'count'},records.length+'/'+evidenceRecords(m).length+' PRESERVED')):null,records.length?records.map(f=>el('article',{class:'evidence-card'},el('div',{class:'eyebrow'},f.id+' / '+f.time),el('h3',{},f.title),el('p',{},personalize(f.text,state.username)),el('code',{},f.node+':'+f.path))):el('div',{class:'empty'},el('div',{class:'empty-icon'},emptyIcon()),el('h3',{},'Nothing preserved yet.'),el('p',{},'Read a record with cat, then collect <id>.'),button('Show a hint',()=>run('hint'),'secondary')));
}
function titleScreen(){
 const started=state.profileSet||state.completed.length||state.tick>0||state.transcript.length>1;
 const start=()=>{boot.view='game';render();document.querySelector('#command')?.focus();};
 const scen=scenarios.find(s=>s.id===scenarioOf(state.missionId));
 return el('div',{class:'title-screen'},el('main',{class:'title-card'},el('div',{class:'title-mark','aria-hidden':'true'},el('img',{src:'./public/logo.png',alt:'','aria-hidden':true})),el('div',{class:'eyebrow'},'CINDER INVESTIGATION WORKSPACE'),el('h1',{class:'title-logo'},'Professor',el('span',{class:'title-gito'},'Gito')),el('p',{class:'title-tag'},scen?.tagline||'A terminal investigation thriller.'),el('button',{type:'button',class:'primary title-btn',onClick:start},started?'Continue':'New investigation'),started?button('Start a new campaign',()=>{if(confirm('Start over? Export your save first to retain this campaign. Your username and preferences will be kept.')){boot.view='game';newCampaign();}},'title-alt'):el('p',{class:'title-note muted'},'Pick a username, then investigate by typing commands. Progress saves automatically on this browser.'),el('p',{class:'title-sim'},'● LOCAL SIMULATION · NO NETWORK · NO ACCOUNTS')));
}
function render(){
 applyTheme(state.preferences);
 if(!state.profileSet){app.replaceChildren(welcomeScreen());if(bootError)app.firstChild.prepend(el('div',{class:'boot-warning',role:'alert'},bootError));return;}
 const oldLog=document.querySelector('#terminal-log'),oldCommand=document.querySelector('#command');
 const focused=app.contains(document.activeElement)?document.activeElement:null;
 const focusedId=focused?.id,selection=focused?.selectionStart;
 if(resetTerminal){for(const id of Object.keys(panelScroll))delete panelScroll[id];renderedTab=null;}
 else if(renderedTab){const oldPanel=document.querySelector('#case-panel');if(oldPanel?.getClientRects().length)panelScroll[renderedTab]=oldPanel.scrollTop;}
 const oldScroll=resetTerminal?0:(oldLog?.scrollTop||0);
 const atBottom=resetTerminal||!oldLog||oldLog.scrollHeight-oldLog.scrollTop-oldLog.clientHeight<40;
 const follow=resetTerminal||followTerminal||atBottom;
 // Capture view state before replacing the workspace, without touching campaign saves.
 if(oldCommand&&!resetTerminal&& !followTerminal)commandDraft=oldCommand.value;
 resetTerminal=false;followTerminal=false;
 applyTheme(state.preferences);audio.configure(state.preferences);
 if(boot.view!=='game'){app.replaceChildren(titleScreen());app.querySelector('.title-btn')?.focus();return;}
 const m=missionById(state.missionId),done=m.objectives.filter(o=>objectiveDone(state,o)).length;
 const file=el('input',{type:'file',accept:'.json,application/json',hidden:true,'aria-label':'Import save file',onChange:e=>importSave(e.target.files[0])});
 const saveMenu=el('details',{class:'save-menu'},el('summary',{},'Save & restore'),el('div',{class:'save-menu-items'},button('Checkpoints',()=>{saveMenu.open=false;checkpointsDialog();}),button('Export save',()=>{saveMenu.open=false;exportSave();}),button('Import save',()=>{saveMenu.open=false;file.click();})));
 const sidebarToggle=el('button',{type:'button',id:'sidebar-toggle','aria-expanded':sidebarOpen,'aria-label':sidebarOpen?'Hide case files':'Show case files',onClick:toggleSidebar},'☰');
 const header=el('header',{class:'topbar'},el('div',{class:'brand-group'},sidebarToggle,el('a',{class:'brand',href:'#',onClick:e=>e.preventDefault()},el('span',{class:'brand-mark'},el('img',{src:'./public/logo.png',alt:'','aria-hidden':true})),el('span',{},'ProfessorGito',el('small',{},'CINDER / INVESTIGATION WORKSPACE')))),el('div',{class:'top-actions'},saveMenu,button('Settings',settings),file));
 const activeScenario=scenarioOf(state.missionId),sidebarCampaign=campaignFor(activeScenario);
 const sidebar=sidebarOpen?el('aside',{class:'sidebar'},el('div',{class:'eyebrow'},'OPERATIONS DESK'),el('h2',{},scenarios.find(s=>s.id===activeScenario)?.title||'Case files'),el('nav',{'aria-label':'Campaign'},sidebarCampaign.map((c,i)=>{const available=c.status==='playable'&&(i===0||state.completed.includes(sidebarCampaign[i-1].id)||state.completed.includes(c.id)||c.id===state.missionId);const done=state.completed.includes(c.id),tag=c.id===state.missionId?(state.report?'DONE':'NOW'):done?'DONE':available?'':'LOCKED';return button([el('span',{class:'case-top'},el('span',{class:'case-number'},String(i+1).padStart(2,'0')),el('strong',{class:'case-name'},c.title)),tag?el('span',{class:'case-tag'+(tag==='LOCKED'?' locked':'')},tag):null],()=>{if(c.id===state.missionId)return;if(confirm('Open this case from the beginning? Export your save first if you want to keep this attempt.'))changeCase(replayCase(state,c.id));},'case '+(c.id===state.missionId?'active':'')+(available?'':' locked'));}))):null;
 // Disable unavailable campaign entries without hiding their content slots.
 if(sidebar){[...sidebar.querySelectorAll('.locked')].forEach(b=>b.disabled=true);sidebar.querySelector('.case.active')?.setAttribute('aria-current','step');}
 const input=el('input',{id:'command',name:'command',autocomplete:'off',spellcheck:'false','aria-label':'Terminal command',placeholder:'',value:commandDraft,maxlength:2048,onInput:e=>{commandDraft=e.target.value;}});
 input.onkeydown=e=>{if(e.key==='ArrowUp'){e.preventDefault();if(historyIndex===history.length)historyDraft=input.value;historyIndex=Math.max(0,historyIndex-1);input.value=history[historyIndex]||'';}if(e.key==='ArrowDown'){e.preventDefault();historyIndex=Math.min(history.length,historyIndex+1);input.value=history[historyIndex]??historyDraft;}if(e.key==='Tab'&&input.value&&!input.value.includes(' ')){const matches=commands.filter(c=>c.startsWith(input.value));if(matches.length===1){e.preventDefault();input.value=matches[0]+' ';}}};
 const promptLine=el('form',{class:'command-form line input',onSubmit:e=>{e.preventDefault();run(input.value);}},el('span',{class:'live-prompt','aria-hidden':true},state.username+'@'+(state.node||'cinder')+':'+state.cwd+'$ '),input);
 const terminalLog=el('div',{class:'terminal-log',id:'terminal-log',role:'log','aria-label':'Terminal transcript',tabindex:0,onClick:()=>{if(window.getSelection().isCollapsed)input.focus();}},[...state.transcript.map(t=>el('pre',{class:'line '+t.kind},t.kind==='input'?state.username+'@cinder:$ '+t.text:personalize(t.text,state.username))),promptLine]);
 const expert=state.preferences.difficulty==='expert',guided=state.preferences.difficulty==='guided';
 const shortcutIds=guided?['help','brief','scope','scan','ls','actions','hint','status']:['help','scope','scan','ls','actions','hint'];
 const focusButton=el('button',{type:'button',id:'focus-toggle','aria-pressed':focusMode,onClick:toggleFocus},focusMode?'Exit focus':'Focus mode');
 const latest=button('↓ Latest output',()=>{terminalLog.scrollTop=terminalLog.scrollHeight;},'latest-output');
 const updateLatest=()=>{latest.hidden=terminalLog.scrollHeight-terminalLog.scrollTop-terminalLog.clientHeight<40;};
 terminalLog.addEventListener('scroll',updateLatest,{passive:true});
 const terminal=el('section',{class:'terminal','aria-label':'Simulated terminal'},el('div',{class:'terminal-title'},el('span',{class:'terminal-dot','aria-hidden':'true'}),el('span',{class:'terminal-name'},'CINDER SHELL'),el('div',{class:'terminal-tools'},button('Commands',commandGuide),focusButton)),el('div',{class:'terminal-body'},terminalLog,latest),expert?null:el('div',{class:'terminal-bottom'},el('div',{class:'terminal-shortcuts'},shortcutIds.map(c=>button(c,()=>run(c))))));
 const tabLabels={evidence:'Evidence ('+state.evidence.length+')',brief:'Brief',map:'Map',board:'Board',practice:'Practice',messages:'Inbox ('+messagesFor(state).filter(m=>!state.readMessages.includes(m.id)).length+')',timeline:'Timeline',report:'Report',record:'Campaign'};
 const tabs=el('div',{class:'tabs',role:'tablist','aria-label':'Case panels'},TAB_IDS.map(id=>el('button',{type:'button',role:'tab',id:'tab-'+id,'aria-controls':'case-panel','aria-selected':activeTab===id,tabindex:activeTab===id?0:-1,onKeydown:e=>{let target=null;if(e.key==='ArrowRight')target=TAB_IDS[(TAB_IDS.indexOf(id)+1)%TAB_IDS.length];if(e.key==='ArrowLeft')target=TAB_IDS[(TAB_IDS.indexOf(id)+TAB_IDS.length-1)%TAB_IDS.length];if(e.key==='ArrowDown')target=TAB_IDS[(TAB_IDS.indexOf(id)+3)%TAB_IDS.length];if(e.key==='ArrowUp')target=TAB_IDS[(TAB_IDS.indexOf(id)+TAB_IDS.length-3)%TAB_IDS.length];if(e.key==='Home')target=TAB_IDS[0];if(e.key==='End')target=TAB_IDS.at(-1);if(target){e.preventDefault();activeTab=target;render();document.querySelector('#tab-'+target)?.focus();}},class:activeTab===id?'selected':'',onClick:()=>{activeTab=id;render();document.querySelector('#tab-'+id)?.focus();}},tabLabels[id])));
 const suggestion=nextGuidedStep(state,m);
 const tip=guided&&suggestion?el('div',{class:'feedback tip'},el('p',{},suggestion.text),button('Run: '+suggestion.command,()=>run(suggestion.command),'secondary')):null;
 const workspace=el('main',{class:'workspace'},el('div',{class:'case-heading'},el('div',{class:'case-title'},el('h1',{},m.title),el('details',{class:'case-brief-toggle'},el('summary',{},'CASE BRIEF'),el('p',{},m.summary))),el('div',{class:'case-progress'},el('strong',{},done+'/'+m.objectives.length),el('small',{},'OBJECTIVES'),el('progress',{max:m.objectives.length,value:done,'aria-label':'Completed objectives'}))),tip,el('div',{class:'objectives','aria-label':'Mission objectives'},m.objectives.map((o,i)=>el('div',{class:objectiveDone(state,o)?'done':''},el('span',{'aria-hidden':true},objectiveDone(state,o)?'✓':'○'),expert?'Objective '+(i+1):o.label))),el('div',{class:'desk'},terminal,el('section',{class:'intel','aria-label':'Case intelligence'},tabs,el('div',{class:'panel',id:'case-panel',role:'tabpanel',tabindex:0,'aria-labelledby':'tab-'+activeTab},panel(m)))),el('footer',{},el('span',{id:'save-status',role:'status'},status)));
 app.replaceChildren(header,el('div',{class:'layout'+(focusMode?' focus-mode':'')+(sidebarOpen?'':' sidebar-collapsed')},sidebar,workspace));
 if(bootError){const alert=el('div',{class:'boot-warning',role:'alert'},bootError,button('Dismiss',()=>{bootError=null;render();}));workspace.prepend(alert);}
 document.querySelector('#case-panel').scrollTop=panelScroll[activeTab]||0;renderedTab=activeTab;
 if(focusedId){const replacement=document.getElementById(focusedId);replacement?.focus({preventScroll:true});if(selection!=null&&replacement?.setSelectionRange)replacement.setSelectionRange(selection,selection);}
 terminalLog.scrollTop=follow?terminalLog.scrollHeight:oldScroll;updateLatest();}
try{const saved=await loadLocal();if(saved){state=saved.state;status=saved.recovered?'Recovered previous valid save':'Local save restored';}else status='New workspace · progress saves automatically';}catch(e){bootError=e.message+' Use Export save to keep a portable copy.';status='Local save unavailable';}
boot.view='title';render();
window.addEventListener('beforeunload',e=>{if(saving||noteTimer){e.preventDefault();e.returnValue='';}});

function downloadText(filename,text,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type}));el('a',{href:url,download:filename}).click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.addEventListener('visibilitychange',()=>audio.setHidden(document.hidden));
document.addEventListener('pointerdown',()=>audio.configure(state.preferences,true),{passive:true});
document.addEventListener('keydown',e=>{
 audio.configure(state.preferences,true);
 if(e.altKey&&e.code==='Slash'&&!document.querySelector('dialog[open]')){e.preventDefault();document.querySelector('#command')?.focus();}
 if(e.key==='Escape'){document.querySelector('.save-menu')?.removeAttribute('open');}
});
document.addEventListener('click',e=>{const menu=document.querySelector('.save-menu');if(menu&&!menu.contains(e.target))menu.open=false;});
window.addEventListener('pagehide',()=>audio.close());
