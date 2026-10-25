import { responseSnapshot } from './extensions.js';
import { exercises, connections, storyFor } from '../content/extras.js';
import { missions, missionById, CONTENT_VERSION, scenarios, missionsFor, scenarioOf } from '../content/missions.js';
import { endingsFor } from '../content/endings.js';
import { personalize } from './profile.js';
import { tokenize, normalizePath } from './parser.js';
import { storyMatch, storyEvents, visibleFiles, visibleActions, TRIGGERS } from './story.js';
import { clock, longDate, shortDate, digest, isDir, children, glob, splitFlags, longEntry, MAN } from './shell.js';
export { storyMatch, visibleFiles, visibleActions };
export const commands=['help','man','brief','scope','scan','nmap','connect','ssh','exit','logout','disconnect','ls','ll','cd','pwd','cat','less','more','head','tail','grep','find','wc','sha256sum','collect','evidence','request-scope','actions','respond','verify','status','hint','report','clear','solve','decode','xxd','whoami','id','hostname','uname','date','uptime','ps','netstat','ss','history','mail','echo','sudo'];
const READ_ONLY=['rm','mv','cp','chmod','chown','touch','mkdir','rmdir','vi','vim','nano','tee','dd','shred','truncate'];
const EGRESS=['curl','wget','ping','nc','ncat','telnet','ftp','scp','sftp','rsync','traceroute','dig','nslookup'];
const BASE_MESSAGES=['brief','scope','response','verify','report'];
export function freshState(id='cold-boot', completed=[], carry={}) {
 const m=missionById(id);
 return {version:2,autoCheckpoint:null,exerciseSolved:[...(carry.exerciseSolved||[])],readMessages:[...(carry.readMessages||[])],intel:[...(carry.intel||[])],username:carry.username||'operator',profileSet:carry.profileSet||false,preferences:structuredClone(carry.preferences||{fontSize:16,contrast:false,theme:'cinder',difficulty:'standard',sound:false,ambience:false,volume:25}),caseResults:structuredClone(carry.caseResults||{}),ending:null,contentVersion:CONTENT_VERSION,missionId:id,completed:[...completed],node:null,cwd:'/',flags:[],read:[],evidence:[],action:null,verified:false,report:null,hintLevel:0,tick:0,events:[],board:{notes:{},links:[]},transcript:[{kind:'system',text:`STARX SECURE WORKSPACE 4.2 (simulated) . tty1\n${m.chapter} . ${m.title} . client: ${m.client}\n${longDate(clock(m,0))}\n\n${m.brief}\n\nType help for commands. Type mail to read your inbox.`}]};
}
export function puzzleMatches(puzzle,answer){
 const norm=String(answer).trim().toLowerCase();
 if(puzzle.type==='order')return puzzle.answers.map(a=>a.toLowerCase()).includes(norm.split(/\s*,\s*/).join(','));
 return puzzle.answers.includes(norm);
}
export function messagesFor(state){
 const m=missionById(state.missionId),[from,subject,body]=m.story||storyFor(m.id);
 const out=[{id:m.id+':brief',subject,from,text:personalize(body+'\n\n'+m.brief,state.username),tick:0}];
 if(m.extension&&state.flags.includes('extension'))out.push({id:m.id+':scope',subject:'Response authority',from:m.client,text:m.scopeApproval,tick:1});
 if(state.action){const a=m.actions.find(a=>a.id===state.action);if(a)out.push({id:m.id+':response',subject:'Response status',from:m.handler||'Iva',text:'Response applied at '+a.node+': '+a.impact,tick:2});}
 if(state.verified)out.push({id:m.id+':verify',subject:'Verification complete',from:m.handler||'Iva',text:'Verification complete. The report tab is ready when you are.',tick:3});
 if(state.report)out.push({id:m.id+':report',subject:'Case review',from:m.client,text:m.debrief+'\n\nReport received. Score: '+state.report.score+'/100.',tick:4});
 for(const e of storyEvents(m,state))out.push({id:m.id+':'+e.id,subject:e.subject||'Chat',from:e.from,text:personalize(e.text,state.username),chat:!!e.chat,tick:5});
 return out;
}
export function messageIds(){return missions.flatMap(m=>[...BASE_MESSAGES,...(m.events||[]).map(e=>e.id)].map(s=>m.id+':'+s));}
export function intelKeys(){return [...new Set(missions.flatMap(m=>m.nodes.flatMap(n=>n.files.map(f=>f.intel).filter(Boolean))))];}
export function objectiveDone(s,o){
 if(o.kind==='flag')return s.flags.includes(o.value);
 if(o.kind==='evidence')return o.values.every(id=>s.evidence.includes(id));
 if(o.kind==='action')return s.action===o.value;
 if(o.kind==='responded')return !!s.action;
 if(o.kind==='verified')return s.verified;
 if(o.kind==='reported')return !!s.report;
 return false;
}
function event(s,text){s.events.push({tick:s.tick,text});s.events=s.events.slice(-150);}
function flag(s,id){if(!s.flags.includes(id))s.flags.push(id);}
export function evidenceRecords(m){return m.nodes.flatMap(n=>n.files.map(f=>({...f,node:n.id})));}
function usage(cmd){return new Error('Usage: '+(MAN[cmd]||cmd).split('\n')[0]+'. Type man '+cmd+' for details.');}
function helpText(){
 return ['GNU-style command reference (simulated workstation)',
 '',
 'RECON       scope . scan . nmap [-sn] [host]',
 'SESSIONS    ssh <host> (connect) . exit . whoami . id . hostname . uname -a',
 'FILESYSTEM  ls [-la] [path] . cd [path] . pwd . cat <path> . head / tail [-n N] <path>',
 'SEARCH      grep [-inrl] <pattern> [path] . find [path] -name <glob> . wc [-l] <path>',
 'HOST STATE  ps aux . netstat -tnp . uptime . date . history',
 'EVIDENCE    collect <id|path> . evidence . sha256sum <path> . decode <id> . xxd -r -p <path>',
 'CASEWORK    brief . solve <answer> . request-scope . actions . respond <id> . verify . status . report',
 'COMMS       mail [n] . hint . clear',
 '',
 'man <command> explains flags. Tab completes commands, hosts and paths. Up/Down recalls history.',
 'Everything here is a fictional simulation: no real hosts, no outbound network, read-only evidence volumes.'].join('\n');
}
function readable(s,m,node,arg,cmd='cat'){
 const path=normalizePath(arg,s.cwd),files=visibleFiles(s,node),f=files.find(f=>f.path===path);
 if(!f){if(isDir(files,path))throw new Error(`${cmd}: ${arg}: Is a directory`);throw new Error(`${cmd}: ${arg}: No such file or directory`);}
 return f;
}
function markRead(s,f){if(!s.read.includes(f.id))s.read.push(f.id);if(f.intel&&!s.intel.includes(f.intel)){s.intel.push(f.intel);event(s,'Discovered: '+f.title);}}
function recordById(s,m,arg){
 const all=evidenceRecords(m);let f=all.find(f=>f.id===arg);
 if(!f&&s.node){const path=normalizePath(arg,s.cwd);f=all.find(x=>x.node===s.node&&x.path===path);}
 return f;
}
function walk(files,dir){const out=[];for(const c of children(files,dir)){const p=(dir==='/'?'':dir)+'/'+c.name;out.push({path:p,dir:c.dir,file:c.file});if(c.dir)out.push(...walk(files,p));}return out;}
export function execute(state,input){
 const before=new Set(messagesFor(state).map(x=>x.id));
 const s=structuredClone(state); const m=missionById(s.missionId); let output='';let intent=null,error=false;
 s.intel=s.intel||[];
 const say=t=>{output=t;};
 try {
 const [cmd,...parsedArgs]=tokenize(input);const args=cmd==='solve'&&m.puzzle?.type==='order'?[parsedArgs.join(' ')]:parsedArgs; if(!cmd)return {state:s,output:'',intent:null,error:false,notices:[]};
 const node=m.nodes.find(n=>n.id===s.node);
 s.transcript.push({kind:'input',text:input,prompt:`${s.username}@${s.node||'starx'}:${s.cwd}$`});s.tick++;
 const now=clock(m,s.tick);
 const need=()=>{if(!node)throw new Error('Not connected. Open a session first: ssh <host> (or connect <host>).');};
 const exact=n=>{if(args.length!==n)throw usage(cmd);};
 if(args[0]==='--help'&&MAN[cmd]){say(MAN[cmd]);}
 else switch(cmd){
 case 'help':if(args.length>1)throw usage('help');say(args[0]?(MAN[args[0]]||`help: no help topics match '${args[0]}'.`):helpText());break;
 case 'man':exact(1);if(!MAN[args[0]])throw new Error(`No manual entry for ${args[0]}`);say(MAN[args[0]]);break;
 case 'brief':exact(0);say(m.brief+(m.puzzle?'\n\nINVESTIGATION: '+m.puzzle.prompt:''));break;
 case 'whoami':exact(0);say(s.username);break;
 case 'id':say(`uid=1000(${s.username}) gid=1000(${s.username}) groups=1000(${s.username}),4(adm),1207(casework),1310(evidence-ro)`);break;
 case 'hostname':say(node?node.id:'starx-ws-07');break;
 case 'uname':say(args.includes('-a')?`Linux ${node?node.id:'starx-ws-07'} 6.6.12-sim #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`:'Linux');break;
 case 'date':say(longDate(now));break;
 case 'uptime':{const t=longDate(now).slice(11,19);say(` ${t} up ${node?(node.address.split('.').pop()%60)+3:12} days,  4:${String(s.tick%60).padStart(2,'0')},  1 user,  load average: 0.${(s.tick*7)%90+8}, 0.21, 0.17`);break;}
 case 'echo':say(args.join(' '));break;
 case 'sudo':throw new Error(`${s.username} is not in the sudoers file. This incident will be reported.`);
 case 'history':{const lines=s.transcript.filter(t=>t.kind==='input').map(t=>t.text);say(lines.map((l,i)=>String(i+1).padStart(5)+'  '+l).join('\n'));break;}
 case 'solve':{
 exact(1);
 if(!m.puzzle)throw new Error('This case has no separate deduction gate. Follow the objectives.');
 if(!m.puzzle.requires.every(id=>s.evidence.includes(id)))throw new Error('Preserve the relevant evidence before submitting a deduction: '+m.puzzle.requires.join(', '));
 if(!puzzleMatches(m.puzzle,args[0]))throw new Error(m.puzzle.type==='order'?'That order does not match the preserved records. List evidence IDs in event order, comma separated.':'That deduction does not match the preserved records. Compare the identifiers and try again.');
 if(!s.flags.includes('puzzle'))event(s,'Resolved the investigation question.');flag(s,'puzzle');say(m.puzzle.success);break;}
 case 'xxd':case 'decode':{
 const ops=cmd==='xxd'?splitFlags(args).ops:args;
 if(cmd==='xxd'&&!(args.includes('-r')&&args.includes('-p')||args.includes('-rp')))throw new Error('xxd: only reverse plain mode is available here: xxd -r -p <path>');
 if(ops.length!==1)throw usage(cmd);
 const f=recordById(s,m,ops[0]);
 if(!f||!s.read.includes(f.id))throw new Error('Read the encoded evidence first.');
 if(!/^(?:[0-9a-fA-F]{2} )(?:[0-9a-fA-F]{2} ?)*$/.test(f.text.trim()))throw new Error('This record is not a hexadecimal byte message.');
 const text=f.text.trim().split(/\s+/).map(h=>String.fromCharCode(parseInt(h,16))).join('');
 say(cmd==='decode'?'Decoded text: '+text:text);break;}
 case 'scope':exact(0);flag(s,'scope');say(`RULES OF ENGAGEMENT . ${m.client}\nAUTHORIZED: ${m.initialScope.join(', ')}. All other hosts are excluded. ${m.extension?'Response changes require request-scope approval.':'Listed response actions are authorized.'}`);break;
 case 'scan':exact(0);if(!s.flags.includes('scope'))throw new Error('Read scope before inspecting the network.');say('HOST             ADDRESS        STATUS        ROLE\n'+m.nodes.map(n=>`${n.id.padEnd(16)} ${n.address.padEnd(14)} ${(m.initialScope.includes(n.id)?'AUTHORIZED':'OUT OF SCOPE').padEnd(13)} ${n.role}`).join('\n'));break;
 case 'nmap':{
 if(!s.flags.includes('scope'))throw new Error('nmap: refusing to scan before the rules of engagement are read. Run scope first.');
 const {flags,ops}=splitFlags(args.filter(a=>a!=='-sV'&&a!=='-Pn'));if(ops.length>1)throw usage('nmap');
 const targets=ops.length?m.nodes.filter(n=>n.id===ops[0]||n.address===ops[0]):m.nodes;
 if(!targets.length)throw new Error(`Failed to resolve "${ops[0]}". Unknown simulated host.`);
 const up=targets.filter(n=>m.initialScope.includes(n.id));
 const body=targets.map(n=>{
  if(!m.initialScope.includes(n.id))return `Nmap scan report for ${n.id} (${n.address})\nSkipped: outside the rules of engagement. No packets sent.`;
  const head=`Nmap scan report for ${n.id} (${n.address})\nHost is up (0.00${Number(n.address.split('.').pop())%9+1}s latency).`;
  if(flags.has('s')&&flags.has('n'))return head;
  const ports=n.ports||[['22','ssh','OpenSSH 9.6p1 (simulated)']];
  return head+'\nPORT      STATE SERVICE          VERSION\n'+ports.map(([p,svc,ver])=>`${(p+'/tcp').padEnd(9)} open  ${svc.padEnd(16)} ${ver||''}`).join('\n');
 });
 say(`Starting Nmap 7.94 (simulated) at ${shortDate(now)} UTC\n\n${body.join('\n\n')}\n\nNmap done: ${targets.length} IP address${targets.length===1?'':'es'} (${up.length} host${up.length===1?'':'s'} up) scanned.`);break;}
 case 'ssh':case 'connect':{
 exact(1);
 if(!s.flags.includes('scope'))throw new Error('Read scope first. Sessions are only opened inside the rules of engagement.');
 const target=args[0].includes('@')?args[0].split('@').pop():args[0];
 const n=m.nodes.find(n=>n.id===target||n.address===target);if(!n)throw new Error(`ssh: Could not resolve hostname ${target}: Unknown simulated host. Use scan.`);
 if(!m.initialScope.includes(n.id))throw new Error('Access blocked: host is outside your rules of engagement. No connection was made.');
 s.node=n.id;s.cwd='/';
 say(`Connecting to ${n.address} (${n.id})...\nAuthenticated with case key [case:${m.id}].\n${n.motd?'\n'+n.motd+'\n':''}\nLast login: ${longDate(clock(m,-180))} from 192.0.2.250\nConnected to ${n.id}. ${n.label}. Use ls to list its files.`);break;}
 case 'exit':case 'logout':case 'disconnect':
 if(!node){say('logout: no remote session. You are on the StarX workstation.');break;}
 s.node=null;s.cwd='/';say(`Connection to ${node.id} closed.`);break;
 case 'pwd':need();say(s.cwd);break;
 case 'cd':{
 need();if(args.length>1)throw usage('cd');const files=visibleFiles(s,node),path=normalizePath(args[0]||'/',s.cwd);
 if(!isDir(files,path))throw new Error(files.some(f=>f.path===path)?`cd: ${args[0]}: Not a directory`:`cd: ${args[0]}: No such file or directory`);s.cwd=path;say('');break;}
 case 'll':case 'ls':{
 need();const {flags,ops}=splitFlags(args);if(cmd==='ll')flags.add('l');if(ops.length>1)throw usage('ls');
 const files=visibleFiles(s,node),path=normalizePath(ops[0]||'.',s.cwd),date=shortDate(clock(m,0));
 const file=files.find(f=>f.path===path);
 if(file){say(flags.has('l')?longEntry({name:ops[0],dir:false,file},date):ops[0]);break;}
 if(!isDir(files,path))throw new Error(`ls: cannot access '${ops[0]}': No such file or directory`);
 const listing=dir=>{const entries=children(files,dir);const dots=flags.has('a')?[{name:'.',dir:true,dot:true},{name:'..',dir:true,dot:true}]:[];
  const all=[...dots,...entries];if(!all.length)return '';
  if(flags.has('l'))return `total ${entries.length*4}\n`+all.map(e=>e.dot?`drwxr-x---  2 root   staff  4096 ${date} ${e.name}`:longEntry(e,date)).join('\n');
  return all.map(e=>e.name+(e.dir&&!e.dot?'/':'')).join('  ');};
 if(flags.has('R'))say([path,...walk(files,path).filter(e=>e.dir).map(e=>e.path)].map(d=>d+':\n'+listing(d)).join('\n\n'));
 else say(listing(path)||'(empty directory)');break;}
 case 'less':case 'more':case 'cat':{
 need();if(!args.length)throw usage('cat');
 const parts=args.map(a=>{const f=readable(s,m,node,a,cmd);markRead(s,f);return `${f.title} [${f.id}]\nSource: ${node.id}:${f.path} / ${f.time}\n\n${f.text}\n\nPreserve with: collect ${f.id}`;});
 say(parts.join('\n\n'));break;}
 case 'head':case 'tail':{
 need();let n=10;const rest=[];for(let i=0;i<args.length;i++){if(args[i]==='-n'){n=Number(args[++i]);}else if(/^-\d+$/.test(args[i]))n=Number(args[i].slice(1));else rest.push(args[i]);}
 if(rest.length!==1||!Number.isInteger(n)||n<0)throw usage(cmd);
 const f=readable(s,m,node,rest[0],cmd);markRead(s,f);const lines=f.text.split('\n');say((cmd==='head'?lines.slice(0,n):lines.slice(-n||lines.length)).join('\n')+`\n\n[${f.id}] Preserve with: collect ${f.id}`);break;}
 case 'grep':{
 need();const {flags,ops}=splitFlags(args);if(!ops.length)throw usage('grep');
 const [pattern,...paths]=ops;if(pattern.length>200)throw new Error('grep: pattern too long');
 let re;try{re=new RegExp(pattern,flags.has('i')?'i':'');}catch{re=new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),flags.has('i')?'i':'');}
 const files=visibleFiles(s,node);
 if(!paths.length){if(!flags.has('r'))throw new Error('grep: no file given. Standard input is not available in this workspace; pass a path or use -r.');paths.push('.');}
 const targets=[];for(const p of paths){const abs=normalizePath(p,s.cwd),f=files.find(f=>f.path===abs);if(f)targets.push(f);else if(isDir(files,abs)){if(!flags.has('r'))throw new Error(`grep: ${p}: Is a directory`);targets.push(...files.filter(f=>abs==='/'||f.path.startsWith(abs+'/')));}else throw new Error(`grep: ${p}: No such file or directory`);}
 const many=targets.length>1||flags.has('r'),out=[];
 for(const f of targets){const hits=f.text.split('\n').map((l,i)=>[i+1,l]).filter(([,l])=>re.test(l));if(!hits.length)continue;if(flags.has('l')){out.push(f.path);continue;}for(const [i,l] of hits)out.push((many?f.path+':':'')+(flags.has('n')?i+':':'')+l);}
 say(out.join('\n'));if(!out.length)say('(no matches)');break;}
 case 'find':{
 need();const files=visibleFiles(s,node);let start='.',name=null,type=null;
 for(let i=0;i<args.length;i++){if(args[i]==='-name')name=args[++i];else if(args[i]==='-type')type=args[++i];else if(i===0)start=args[i];else throw usage('find');}
 if(args.includes('-name')&&!name||args.includes('-type')&&!['f','d'].includes(type))throw usage('find');
 const root=normalizePath(start,s.cwd);if(!isDir(files,root))throw new Error(`find: '${start}': No such file or directory`);
 const rx=name?glob(name):null;
 const hits=[{path:root,dir:true},...walk(files,root)].filter(e=>(!type||(type==='d')===e.dir)&&(!rx||rx.test(e.path.split('/').pop())));
 say(hits.map(e=>e.path).join('\n')||'(no matches)');break;}
 case 'wc':{
 need();const {flags,ops}=splitFlags(args);if(ops.length!==1)throw usage('wc');const f=readable(s,m,node,ops[0],'wc');
 const counts={l:f.text.split('\n').length,w:f.text.split(/\s+/).filter(Boolean).length,c:f.text.length};
 const pick=['l','w','c'].filter(k=>!flags.size||flags.has(k));say(pick.map(k=>String(counts[k]).padStart(6)).join(' ')+' '+ops[0]);break;}
 case 'sha256sum':{need();if(!args.length)throw usage('sha256sum');say(args.map(a=>digest(readable(s,m,node,a,'sha256sum').text)+'  '+a).join('\n'));break;}
 case 'ps':{
 need();const user=node.user||s.username;
 const procs=node.procs||[['root','1','/sbin/init'],['root','612','/usr/sbin/sshd -D'],['syslog','701','/usr/sbin/rsyslogd -n']];
 say('USER         PID COMMAND\n'+[...procs,[user,'4211','-bash'],[user,'4290','ps aux']].map(([u,p,c])=>`${u.padEnd(11)} ${p.padStart(5)} ${c}`).join('\n'));break;}
 case 'ss':case 'netstat':{
 need();const conns=node.conns||[];
 say('Proto Local Address          Foreign Address        State        PID/Program\n'+[[`${node.address}:22`,'192.0.2.250:51522','ESTABLISHED','612/sshd (you)'],...conns].map(([l,f,st,p])=>`tcp   ${l.padEnd(22)} ${f.padEnd(22)} ${st.padEnd(12)} ${p}`).join('\n'));break;}
 case 'mail':{
 const box=messagesFor(s);if(args.length>1)throw usage('mail');
 if(!args.length){say(`Mail (simulated) . ${box.length} message${box.length===1?'':'s'}\n`+box.map((x,i)=>`${s.readMessages.includes(x.id)?'  ':'> N'} ${String(i+1).padStart(2)} ${x.from.padEnd(22).slice(0,22)} ${x.subject}`).join('\n')+'\n\nType mail <n> to read a message.');break;}
 const x=box[Number(args[0])-1];if(!x)throw new Error(`mail: no message ${args[0]}`);
 if(!s.readMessages.includes(x.id))s.readMessages.push(x.id);
 say(`From: ${x.from}\nSubject: ${x.subject}\n\n${x.text}`);break;}
 case 'collect':{
 exact(1);const f=recordById(s,m,args[0]);if(!f||!s.read.includes(f.id))throw new Error('Read this evidence record with cat before preserving it.');
 if(s.evidence.includes(f.id)){say('Already preserved.');break;}
 s.evidence.push(f.id);event(s,`Preserved ${f.id} from ${f.node}:${f.path}`);say(`Preserved ${f.title}. Source and timestamp added to the notebook.\n  source  ${f.node}:${f.path}\n  sha256  ${digest(f.text)}\n  custody ${s.username} @ ${longDate(now)}`);break;}
 case 'evidence':exact(0);say(s.evidence.map(id=>{const f=evidenceRecords(m).find(f=>f.id===id);return `${id}: ${f.title} (${f.node}, ${f.time})`;}).join('\n')||'No evidence preserved yet.');break;
 case 'request-scope':
 exact(0);if(!m.extension){say('The listed response actions are already authorized.');break;}
 if(!s.evidence.includes(m.scopeLead))throw new Error('Preserve '+m.scopeLead+' to justify the response-scope request.');
 if(!s.flags.includes('extension'))event(s,'Client approved incident-response extension.');flag(s,'extension');say(m.scopeApproval);break;
 case 'actions':exact(0);say(visibleActions(s,m).map(a=>`${a.id}: ${a.label}\n  Host: ${a.node}; evidence needed: ${a.required.join(', ')}\n  Expected impact: ${a.impact}`).join('\n'));break;
 case 'respond':{
 exact(1);
 if(s.report)throw new Error('This report is finalized. Retry the case to explore another response.');
 if(m.puzzle&&!s.flags.includes('puzzle'))throw new Error('Resolve the investigation question first. Use brief for its solve prompt.');
 const a=visibleActions(s,m).find(a=>a.id===args[0]);if(!a)throw new Error('Unknown response. Use actions.');
 if(s.node!==a.node)throw new Error(`Connect to ${a.node} to apply this response.`);
 if(m.extension&&!s.flags.includes('extension'))throw new Error('Request incident-response scope before changing the system.');
 if(!a.required.every(id=>s.evidence.includes(id)))throw new Error(`Preserve required evidence first: ${a.required.join(', ')}.`);
 if(s.action)throw new Error('A response has already been applied. Verify and report, or retry this case.');
 s.autoCheckpoint=responseSnapshot(state);s.action=a.id;s.verified=false;event(s,a.impact);say(a.impact+'\nRun verify to confirm the outcome.');break;}
 case 'verify':{
 exact(0);if(!s.action)throw new Error('Apply a response first. Use actions.');const a=m.actions.find(a=>a.id===s.action);
 if(!s.verified)event(s,`Verified: incident contained; business service ${a.service?'available':'unavailable'}.`);s.verified=true;
 say(`RESPONSE CHECK: ${a.verify||'expected unwanted activity has stopped.'}\nSERVICE CHECK: ${a.service?'AVAILABLE':'UNAVAILABLE , document this impact in your report.'}`);break;}
 case 'status':say(m.objectives.map(o=>`${objectiveDone(s,o)?'[✓]':'[ ]'} ${o.label}`).join('\n'));break;
 case 'hint':{const level=Math.min(s.hintLevel,m.hints.length-1);say(m.hints[level]+(level>=m.hints.length-1?' (final hint)':` (hint ${level+1} of ${m.hints.length})`));s.hintLevel=Math.min(s.hintLevel+1,m.hints.length);break;}
 case 'report':intent='report';say('Open the Case report panel to link evidence and submit your conclusion.');break;
 case 'clear':s.transcript=[];break;
 default:
 if(READ_ONLY.includes(cmd))throw new Error(`${cmd}: cannot modify '${args[0]||''}': Read-only file system. Evidence volumes are mounted read-only to protect chain of custody.`);
 if(EGRESS.includes(cmd))throw new Error(`${cmd}: outbound network access is disabled in this workspace. All hosts are fictional; use the in-scope sessions instead.`);
 throw new Error(`${cmd}: command not found. Type help for the command list. This is a simulation, not a system shell.`);
 }
 }catch(e){output=e.message;error=true;}
 output=personalize(output,s.username);
 if(output)s.transcript.push({kind:'output',text:output});
 const notices=messagesFor(s).filter(x=>!before.has(x.id));
 for(const x of notices)s.transcript.push({kind:'system',text:x.chat?`<${x.from}> ${x.text}`:`[MAIL] New message from ${x.from}: "${x.subject}". Type mail to read it.`});
 s.transcript=s.transcript.slice(-160);
 return {state:s,output,intent,error,notices};
}
// Tab completion for commands, hosts, response IDs, evidence IDs and paths on the current host.
export function complete(state,input){
 const m=missionById(state.missionId),parts=input.split(' '),last=parts.at(-1),cmd=parts[0],node=m.nodes.find(n=>n.id===state.node);
 const paths=()=>{if(!node)return [];const slash=last.lastIndexOf('/'),dirPart=slash<0?'':last.slice(0,slash+1),dir=normalizePath(dirPart||'.',state.cwd);return children(visibleFiles(state,node),dir).map(c=>dirPart+c.name+(c.dir?'/':''));};
 let pool;
 if(parts.length===1)pool=commands;
 else if(['connect','ssh','nmap'].includes(cmd))pool=m.initialScope;
 else if(cmd==='respond')pool=visibleActions(state,m).map(a=>a.id);
 else if(['man','help'].includes(cmd))pool=Object.keys(MAN);
 else if(['collect','decode'].includes(cmd))pool=last.includes('/')?paths():state.read;
 else pool=paths();
 const matches=[...new Set(pool)].filter(p=>p.startsWith(last));
 if(!matches.length)return {value:input,options:[]};
 let prefix=matches[0];for(const x of matches)while(!x.startsWith(prefix))prefix=prefix.slice(0,-1);
 parts[parts.length-1]=prefix+(matches.length===1&&!prefix.endsWith('/')?' ':'');
 return {value:parts.join(' '),options:matches.length>1?matches:[]};
}
export function submitReport(state, finding, cited, uncertainty){
 const s=structuredClone(state),m=missionById(s.missionId);
 if(s.report)throw new Error('Report already finalized. Retry to attempt another outcome.');
 if(!s.action||!s.verified)throw new Error('Apply a response and verify its result before submitting.');
 if(!m.findings.some(f=>f.id===finding))throw new Error('Select a finding.');
 if(!Array.isArray(cited)||!cited.length||cited.some(id=>!s.evidence.includes(id)))throw new Error('Cite at least one preserved evidence record.');
 const unique=[...new Set(cited)], a=m.actions.find(a=>a.id===s.action);
 const corroborated=m.requiredEvidence.every(id=>unique.includes(id));
 const parts={finding:finding===m.correctFinding&&corroborated?30:0,evidence:Math.round(25*m.requiredEvidence.filter(id=>unique.includes(id)).length/m.requiredEvidence.length),response:a.quality,verification:a.service?15:8,scope:uncertainty?10:5};
 const score=Object.values(parts).reduce((a,b)=>a+b,0);
 s.report={finding,cited:unique,uncertainty:!!uncertainty,score,parts};s.tick++;event(s,`Case report submitted: ${score}/100.`);
 if(!s.completed.includes(m.id))s.completed.push(m.id);
 s.caseResults[m.id]={...structuredClone(s.report),action:s.action,service:a.service,legacy:false};
 return s;
}
export function nextCase(s){const m=missionById(s.missionId);if(!s.report||!m.next)throw new Error('No next case available.');return freshState(m.next,s.completed,s);}
export function validateContent(){
 const ids=new Set(),intel=new Set();
 const checkWhen=(w,eids)=>{if(!w)return;for(const k of Object.keys(w))if(!['intel','notIntel','chose','notChose'].includes(k))throw new Error('Invalid story condition');
  for(const key of [w.chose,w.notChose].filter(Boolean)){const [mid,aid]=key.split(':');if(!missions.find(x=>x.id===mid)?.actions.some(a=>a.id===aid))throw new Error('Invalid story choice reference '+key);}};
 for(const m of missions)for(const n of m.nodes)for(const f of n.files)if(f.intel)intel.add(f.intel);
 for(const m of missions){
 if(ids.has(m.id))throw new Error('Duplicate mission ID');ids.add(m.id);
 if(m.extension&&(!m.scopeLead||!m.scopeApproval))throw new Error('Missing scope extension data');
 if(!(m.story||storyFor(m.id)))throw new Error('Missing story intro for '+m.id);
 const es=evidenceRecords(m),eids=es.map(f=>f.id),nodes=m.nodes.map(n=>n.id);
 if(new Set(eids).size!==eids.length||new Set(nodes).size!==nodes.length)throw new Error('Duplicate content IDs');
 if(m.extension&&!eids.includes(m.scopeLead))throw new Error('Invalid scope lead');
 if(m.puzzle&&(m.puzzle.requires.some(id=>!eids.includes(id))||!m.puzzle.answers.length))throw new Error('Invalid puzzle');
 if(m.puzzle&&m.puzzle.type&&!['text','order'].includes(m.puzzle.type))throw new Error('Invalid puzzle type');
 if(m.puzzle&&m.puzzle.type==='order'&&m.puzzle.answers.some(a=>a.split(',').some(id=>!eids.includes(id))))throw new Error('Invalid order puzzle answer');
 for(const id of m.requiredEvidence)if(!eids.includes(id))throw new Error('Missing evidence reference');
 // Required evidence must never be hidden behind a story condition, or the case could become unwinnable.
 for(const f of es){checkWhen(f.when,eids);if(f.when&&(m.requiredEvidence.includes(f.id)||m.actions.some(a=>a.required.includes(f.id))||m.puzzle?.requires.includes(f.id)))throw new Error('Conditional file is required: '+f.id);}
 for(const a of m.actions){if(!nodes.includes(a.node)||a.required.some(id=>!eids.includes(id)))throw new Error('Invalid response reference');checkWhen(a.when,eids);}
 if(!m.actions.some(a=>!a.when))throw new Error('Every case needs an unconditional response: '+m.id);
 for(const o of m.objectives)if(o.kind==='evidence'&&o.values.some(id=>!eids.includes(id)))throw new Error('Invalid objective');
 const evIds=new Set();
 for(const e of m.events||[]){
  if(evIds.has(e.id)||BASE_MESSAGES.includes(e.id))throw new Error('Duplicate story event '+e.id);evIds.add(e.id);
  if(!e.from||!e.text||!e.chat&&!e.subject)throw new Error('Incomplete story event '+e.id);
  const i=e.on.indexOf(':'),kind=i<0?e.on:e.on.slice(0,i),value=i<0?'':e.on.slice(i+1);
  if(!TRIGGERS.includes(kind))throw new Error('Invalid trigger '+e.on);
  if(['read','collect'].includes(kind)&&!eids.includes(value))throw new Error('Invalid trigger reference '+e.on);
  if(kind==='action'&&value&&!m.actions.some(a=>a.id===value))throw new Error('Invalid trigger reference '+e.on);
  if(kind==='intel'&&!intel.has(value)||kind==='tick'&&!(Number(value)>0))throw new Error('Invalid trigger reference '+e.on);
  checkWhen(e.when,eids);
 }
 for(const e of m.links||[])if(!nodes.includes(e.from)||!nodes.includes(e.to))throw new Error('Invalid map link');
 if(m.next&&!missions.some(x=>x.id===m.next))throw new Error('Invalid next mission');
 if(!m.findings.some(f=>f.id===m.correctFinding))throw new Error('Missing correct finding');
 if(!scenarios.some(x=>x.id===m.scenario))throw new Error('Invalid scenario reference');
 }
 for(const scen of scenarios){
 if(!missionsFor(scen.id).some(m=>m.id===scen.firstMission))throw new Error('Invalid scenario firstMission');
 if(!missionsFor(scen.id).some(m=>m.id===scen.endMission))throw new Error('Invalid scenario endMission');
 if(!endingsFor(scen.id).length)throw new Error('Scenario has no endings: '+scen.id);
 for(const e of endingsFor(scen.id))checkWhen(e.requires);
 for(const p of scen.epilogues||[])checkWhen(p.when);
 if(!endingsFor(scen.id).some(e=>!e.requires))throw new Error('Scenario needs an always-available ending: '+scen.id);
 }
 for(const e of exercises){const m=missionById(e.mission),ids=evidenceRecords(m).map(f=>f.id);if(e.requires.some(id=>!ids.includes(id)))throw new Error('Invalid exercise reference');}
 for(const [id,edges] of Object.entries(connections)){const ids=missionById(id).nodes.map(n=>n.id);if(edges.some(e=>!ids.includes(e.from)||!ids.includes(e.to)))throw new Error('Invalid map connection');}
 return true;
}

export function chooseEnding(state,id){
 const s=structuredClone(state);s.intel=s.intel||[];
 const scen=scenarios.find(x=>x.endMission===s.missionId);
 const list=scen?missionsFor(scen.id):[];
 if(!scen||!s.report||!list.every(m=>s.completed.includes(m.id)))throw new Error('Finish the campaign and final report before choosing an ending.');
 if(s.ending)throw new Error('Ending already chosen. Replay the finale to explore another ending.');
 const endings=endingsFor(scen.id),e=endings.find(e=>e.id===id);
 if(!e)throw new Error('Unknown ending.');
 if(!storyMatch(s,e.requires))throw new Error('This ending is locked. '+(e.requiresText||''));
 s.ending=id;s.tick++;event(s,'Final decision: '+e.title);return s;
}
export function replayCase(state,id){
 const m=missionById(id),list=missionsFor(m.scenario);
 const index=list.findIndex(x=>x.id===id);
 if(index<0||!(index===0||state.completed.includes(list[index-1].id)||state.completed.includes(id)||state.missionId===id))throw new Error('Complete the previous case to unlock this case.');
 return freshState(id,state.completed,state);
}
