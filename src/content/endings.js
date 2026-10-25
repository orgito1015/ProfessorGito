import { scenarioOf, scenarios, missionsFor, scenarioEndings } from './missions.js';
import { storyMatch } from '../engine/story.js';
export const endingSets = {
 'cinder-prime':[
  {id:'disclosure',title:'Disclosure',summary:'Publish a qualified account with the clients. Retain the source bundle and explain what remains unknown.',
   openingStrong:'The clients publish a careful, well-supported account. The unauthorized integration path becomes public without turning uncertainty into an accusation.',
   openingWeak:'The clients publish a limited account. Weak or incomplete earlier findings require additional review; several claims are withheld.',
   closing:'Iva returns to mentoring new operators. The lesson on the first page of her notebook is unchanged: evidence before certainty.'},
  {id:'offer',title:'The Offer',summary:'Accept a funded internal investigation role. Preserve the client evidence, but keep the public waiting.',
   openingStrong:'StarX accepts the funded role under client evidence-retention terms. The investigation continues with resources, but independence becomes a daily negotiation.',
   openingWeak:'StarX accepts the offer with unresolved gaps in the case. Halcyon controls the timetable, and the clients insist on another independent review.',
   closing:'Iva stays at StarX to protect the evidence archive. Her trust is conditional: client records cannot become bargaining chips.'},
  {id:'null-route',title:'Null Route',summary:'End the vendor relationship and send the evidence to the clients. Accept a lasting operational cost.',
   openingStrong:'The clients sever the vendor link and retain a strong evidence bundle. The immediate path is gone; accountability moves to a slower private process.',
   openingWeak:'The vendor link is severed, but gaps in the preserved case make accountability harder. The clients keep the remaining records for a fresh investigation.',
   closing:'Your final decision makes vendor separation permanent. Replacement integrations must be built, even if you restored service during the investigation.'}
 ],
 'cinder-shadow':[
  {id:'rotate-and-disclose',title:'Full Disclosure',summary:'Rotate every credential in the chain and notify the regulator and customers on schedule.',
   openingStrong:'Meridian notifies the regulator and affected customers on schedule, backed by a corroborated scope check. The disclosure is factual and does not overstate what the sample actually proved.',
   openingWeak:'Meridian notifies on schedule, but weak or incomplete earlier findings leave gaps the regulator flags for follow-up.',
   closing:'Iva files the case chain alongside StarX\'s other unresolved Halcyon-linked leads. The relay path is closed; who built it is still an open question.'},
  {id:'quiet-settlement',title:'Quiet Settlement',summary:'Settle through counsel and delay public notice as long as legally possible.',
   openingStrong:'Counsel negotiates a quiet settlement. The technical containment holds, but the delayed notice draws scrutiny once it eventually surfaces.',
   openingWeak:'The settlement proceeds despite unresolved gaps in the case, and the delay compounds the eventual scrutiny.',
   closing:'Meridian keeps the incident out of the news for now. The obligation to notify has only been postponed, not resolved.'},
  {id:'scorched-earth',title:'Scorched Earth',summary:'Sever every system tied to the compromised integration and hand everything to law enforcement.',
   openingStrong:'Meridian severs every system tied to the compromised chain and hands a well-corroborated bundle to law enforcement. The access path is permanently gone.',
   openingWeak:'The systems are severed despite gaps in the preserved case, leaving investigators with a harder reconstruction.',
   closing:'Replacement infrastructure has to be rebuilt from nothing. The relay Halcyon once provisioned will never be used again, by anyone.'}
 ]
};
Object.assign(endingSets,scenarioEndings);
export function endingsFor(scenarioId){ return endingSets[scenarioId]||[]; }
export const endings = endingSets['cinder-prime'];
export function endingText(state) {
 const scenarioId=scenarioOf(state.missionId),scen=scenarios.find(x=>x.id===scenarioId),ids=missionsFor(scenarioId).map(m=>m.id);
 const list=endingsFor(scenarioId);
 const records=ids.map(id=>state.caseResults[id]).filter(Boolean),known=records.filter(r=>!r.legacy);
 const total=known.reduce((n,r)=>n+r.score,0),average=known.length?Math.round(total/known.length):0;
 const outages=known.filter(r=>!r.service).length;
 // Original campaign rule: five scored cases (legacy cases excluded). Shorter scenarios need every case scored.
 const strong=known.length>=Math.min(5,ids.length)&&average>=80;
 const ending=list.find(e=>e.id===state.ending);
 const opening=ending?(strong?ending.openingStrong:ending.openingWeak):'';
 const epilogues=(scen?.epilogues||[]).filter(p=>storyMatch(state,p.when)).map(p=>p.text);
 return {title:ending?.title||'Unchosen',average,outages,text:[
 `${state.username}, your case is closed. ${opening}`,
 outages?`${outages} recorded response${outages===1?'':'s'} interrupted legitimate services. Recovery crews remember those choices alongside the investigation.`:'The recorded responses preserved legitimate services. The clients remember that you protected their work as well as their systems.',
 ending?.closing||'',
 ...epilogues,
 scen?.coda||''
 ].filter(Boolean)};
}
