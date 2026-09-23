import { el,button } from './dom.js';
import { exercises } from '../content/extras.js';
export function exercisePanel(state,onSubmit){
 const list=exercises.filter(e=>e.mission===state.missionId);
 return el('section',{},el('h3',{},'Investigation practice'),el('p',{class:'muted'},'Optional exercises use the records you preserved. They do not change your case score.'),list.map(e=>{
  const ready=e.requires.every(id=>state.evidence.includes(id)),solved=state.exerciseSolved.includes(e.id),answer=e.type==='classify'?{}:[];
  const card=el('article',{class:'evidence-card'},el('div',{class:'eyebrow'},e.type.toUpperCase()+(solved?' / SOLVED':'')),el('h3',{},e.title),el('p',{},e.prompt));
  if(!ready){card.append(el('p',{class:'warning'},'Preserve these records first: '+e.requires.join(', ')));return card;}
  if(solved){card.append(el('p',{class:'feedback'},e.explanation));return card;}
  const form=el('form'),error=el('p',{class:'warning',role:'alert'});
  if(e.type==='order')for(let i=0;i<e.items.length;i++){const select=el('select',{required:true,'aria-label':'Event in position '+(i+1)},el('option',{value:''},'Choose an event'),e.items.map(item=>el('option',{value:item.id},item.label)));select.onchange=()=>answer[i]=select.value;form.append(el('label',{},'Position '+(i+1),select));}
  if(e.type==='compare'){
   form.append(el('div',{class:'comparison-wrap'},el('table',{class:'comparison-table'},el('thead',{},el('tr',{},['Field','Before','After','Changed?'].map(t=>el('th',{scope:'col'},t)))),el('tbody',{},Object.keys(e.before).map(key=>el('tr',{},el('th',{scope:'row'},key),el('td',{},e.before[key]),el('td',{},e.after[key]),el('td',{},el('input',{type:'checkbox','aria-label':key+' changed',onChange:event=>{if(event.target.checked)answer.push(key);else answer.splice(answer.indexOf(key),1);}}))))))));
  }
  if(e.type==='classify')for(const item of e.items){const select=el('select',{required:true,'aria-label':item.label},el('option',{value:''},'Choose classification'),e.options.map(o=>el('option',{value:o},o)));select.onchange=()=>answer[item.id]=select.value;form.append(el('label',{},item.label,select));}
  if(state.preferences.difficulty==='guided')form.append(el('p',{class:'muted'},e.type==='order'?'Place each event once; compare timestamps or dependencies.':e.type==='compare'?'Compare each field on the same row; unchanged values are not differences.':'Distinguish expected behavior from an unsupported claim.'));
  form.append(error,el('button',{type:'submit',class:'primary'},'Check deduction'));form.onsubmit=event=>{event.preventDefault();try{onSubmit(e.id,answer);}catch(err){error.textContent=err.message;}};card.append(form);return card;
 }));
}
