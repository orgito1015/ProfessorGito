// Locally synthesized atmosphere. Never autoplay and never carry essential information.
export class AudioBus {
 constructor(factory=()=>{const C=globalThis.AudioContext||globalThis.webkitAudioContext;return C?new C():null;}){this.factory=factory;this.ctx=null;this.hum=null;this.oscillators=[];this.hidden=false;this.preferences={sound:false,ambience:false,volume:25};}
 async configure(preferences,activate=false){
  this.preferences={...preferences};
  try{
   if(!this.ctx&&activate&&(preferences.sound||preferences.ambience))this.ctx=this.factory();
   if(!this.ctx)return false;
   if(activate&&this.ctx.state==='suspended')await this.ctx.resume();
   if(preferences.ambience&&!this.hum){this.hum=this.ctx.createGain();this.hum.gain.value=0;this.hum.connect(this.ctx.destination);for(const f of [55,82.4]){const o=this.ctx.createOscillator();o.type='sine';o.frequency.value=f;o.connect(this.hum);o.start();this.oscillators.push(o);}}
   if(this.hum)this.hum.gain.setTargetAtTime(!this.hidden&&preferences.ambience?preferences.volume/100*.018:0,this.ctx.currentTime,.1);
   return true;
  }catch{return false;}
 }
 async cue(){
  if(!this.preferences.sound||this.hidden||!this.preferences.volume)return;
  if(!await this.configure(this.preferences,true)||!this.ctx)return;
  try{const o=this.ctx.createOscillator(),g=this.ctx.createGain(),t=this.ctx.currentTime;o.frequency.value=660;o.connect(g);g.connect(this.ctx.destination);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(this.preferences.volume/100*.08,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.1);o.start(t);o.stop(t+.12);o.onended=()=>{o.disconnect();g.disconnect();};}catch{/* sound is optional */}
 }
 setHidden(hidden){this.hidden=hidden;return this.configure(this.preferences);}
 close(){for(const o of this.oscillators){try{o.stop();o.disconnect();}catch{}}this.oscillators=[];this.hum=null;const c=this.ctx;this.ctx=null;return c?.close().catch(()=>{});}
}
