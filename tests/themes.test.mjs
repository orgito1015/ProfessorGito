import test from 'node:test';
import assert from 'node:assert/strict';
import { themes,getPalette,applyTheme } from '../src/ui/themes.js';
import { freshState,replayCase } from '../src/engine/game.js';
import { parseSave,serializeSave } from '../src/storage/saves.js';
function luminance(hex){const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('every theme survives save export/import and case replay with contrast',()=>{
 for(const t of themes){let s=freshState();s.preferences={fontSize:18,contrast:true,theme:t.id};s=parseSave(serializeSave(s));assert.equal(s.preferences.theme,t.id);assert.deepEqual(replayCase(s,'cold-boot').preferences,s.preferences);}
});
test('older preferences default to Cinder without resetting progress; invalid IDs fail',()=>{
 const s=freshState();s.username='Nova';delete s.preferences.theme;
 const migrated=parseSave(JSON.stringify(s));assert.equal(migrated.preferences.theme,'cinder');assert.equal(migrated.username,'Nova');
 for(const id of ['missing',null,{},'url(https://example.test)'])assert.throws(()=>parseSave(JSON.stringify({...s,preferences:{...s.preferences,theme:id}})));
});
test('normal and high-contrast palettes have readable primary text pairs',()=>{
 for(const t of themes)for(const high of [false,true]){
  const c=getPalette(t.id,high).colors;
  for(const [fg,bg] of [['text','bg'],['muted','panel'],['terminalText','terminal'],['accent','selected'],['accentText','accent'],['warning','panel']])assert.ok(ratio(c[fg],c[bg])>=4.5,`${t.id} contrast=${high}: ${fg}/${bg}`);
 }
});
test('theme switching overwrites all palette variables and light/dark color scheme',()=>{
 const styles=new Map(),attributes=new Map();const root={style:{setProperty:(k,v)=>styles.set(k,v)},setAttribute:(k,v)=>attributes.set(k,v)};
 for(const t of themes){applyTheme({theme:t.id,contrast:false,fontSize:19},root);assert.equal(styles.get('color-scheme'),t.scheme);assert.equal(styles.get('--terminal'),t.colors.terminal);assert.equal(styles.get('--accent'),t.colors.accent);assert.equal(styles.get('--font-size'),'19px');assert.equal(attributes.get('data-theme'),t.id);}
});
