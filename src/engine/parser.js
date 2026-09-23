export function tokenize(input) {
 if (typeof input !== 'string' || input.length > 2048) throw new Error('Command is too long (maximum 2048 characters).');
 const result=[]; let word='', quote=null, active=false;
 for (const c of input.trim()) {
  if (quote) { if(c===quote) quote=null; else word+=c; active=true; }
  else if(c==='"' || c==="'") {quote=c;active=true;}
  else if(/\s/.test(c)) {if(active){result.push(word);word='';active=false;}}
  else {word+=c;active=true;}
 }
 if(quote) throw new Error('Unclosed quote. Close the filename quote and try again.');
 if(active) result.push(word);
 return result;
}
export function normalizePath(input, cwd='/') {
 const parts=(input.startsWith('/')?input:cwd+'/'+input).split('/'); const result=[];
 for(const p of parts){if(!p||p==='.')continue;if(p==='..')result.pop();else result.push(p);}
 return '/'+result.join('/');
}
