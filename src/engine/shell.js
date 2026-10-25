// Formatting helpers that make the simulated shell read like a real one. No real system access.
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const two=n=>String(n).padStart(2,'0');
// Each command advances the in-game clock by 23 seconds from the mission's authored start time.
export function clock(m,tick){return new Date(Date.parse((m.date||'2026-03-02T08:00:00')+'Z')+tick*23000);}
export function longDate(d){return `${DAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2)} ${two(d.getUTCHours())}:${two(d.getUTCMinutes())}:${two(d.getUTCSeconds())} UTC ${d.getUTCFullYear()}`;}
export function shortDate(d){return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2)} ${two(d.getUTCHours())}:${two(d.getUTCMinutes())}`;}
// Deterministic 256-bit-looking digest for chain-of-custody display. Not a cryptographic hash.
export function digest(text){let out='',h=0x811c9dc5;for(let r=0;r<8;r++){for(const c of text+'#'+r){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}out+=h.toString(16).padStart(8,'0');}return out;}
export function isDir(files,path){return path==='/'||files.some(f=>f.path.startsWith(path+'/'));}
// Immediate children of a directory: {name, dir, file}.
export function children(files,dir){
 const prefix=dir==='/'?'/':dir+'/',out=new Map();
 for(const f of files){if(!f.path.startsWith(prefix))continue;const [head,...rest]=f.path.slice(prefix.length).split('/');if(rest.length)out.set(head+'/',{name:head,dir:true});else out.set(head,{name:head,dir:false,file:f});}
 return [...out.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
export function glob(pattern){return new RegExp('^'+pattern.replace(/[.+^${}()|[\]\\]/g,'\\$&').replaceAll('*','.*').replaceAll('?','.')+'$','i');}
// Split short flags (-la becomes l,a) from operands. A lone '-' or numbers like -5 stay operands.
export function splitFlags(args){const flags=new Set(),ops=[];for(const a of args){if(/^-[A-Za-z]+$/.test(a))for(const c of a.slice(1))flags.add(c);else ops.push(a);}return {flags,ops};}
export function longEntry(entry,date){
 if(entry.dir)return `drwxr-x---  2 root   staff  4096 ${date} ${entry.name}/`;
 const f=entry.file;return `-rw-r-----  1 ${(f.owner||'root').padEnd(6)} staff ${String(f.text.length).padStart(5)} ${date} ${entry.name}`;
}
export const MAN={
 help:'help [command]\n  List the available commands, or show usage for one command.',
 man:'man <command>\n  Show the manual entry for a command.',
 brief:'brief\n  Re-read the client brief and the current investigation question.',
 scope:'scope\n  Print the rules of engagement: which hosts you may touch.',
 scan:'scan\n  Summarise known hosts and whether each is authorized.',
 nmap:'nmap [-sn] [host]\n  Service discovery on authorized hosts only. -sn: host discovery without a port listing.\n  Out-of-scope hosts are skipped; no packets are sent to them.',
 connect:'connect <host>\n  Open a session on an authorized host. Alias: ssh [user@]host',
 ssh:'ssh [user@]<host>\n  Open a session on an authorized host using the case key.',
 exit:'exit\n  Close the current remote session. Aliases: logout, disconnect',
 ls:'ls [-l] [-a] [-R] [path]\n  List a directory. -l long format, -a include . and .., -R recurse.',
 cd:'cd [path]\n  Change directory. With no argument, returns to /.',
 pwd:'pwd\n  Print the working directory.',
 cat:'cat <path> [path...]\n  Print files. Reading a record makes it eligible for collect. Aliases: less, more',
 head:'head [-n N] <path>\n  Print the first N lines (default 10).',
 tail:'tail [-n N] <path>\n  Print the last N lines (default 10).',
 grep:'grep [-i] [-n] [-r] [-l] <pattern> [path...]\n  Search file contents. -i ignore case, -n line numbers, -r recurse into directories, -l list matching files.',
 find:'find [path] [-name <glob>] [-type f|d]\n  Walk the directory tree.',
 wc:'wc [-l] [-w] [-c] <path>\n  Count lines, words and bytes.',
 sha256sum:'sha256sum <path>\n  Print a content digest for chain of custody (simulated digest).',
 collect:'collect <evidence-id|path>\n  Preserve a record you have read, with source, time and digest.',
 evidence:'evidence\n  List preserved records.',
 decode:'decode <evidence-id|path>\n  Decode a hexadecimal byte record to text. Alias: xxd -r -p <path>',
 xxd:'xxd -r -p <evidence-id|path>\n  Reverse a plain hex dump into text.',
 solve:'solve <answer>\n  Submit the deduction asked for in brief.',
 'request-scope':'request-scope\n  Ask the client for incident-response authority, citing your preserved lead.',
 actions:'actions\n  List authorized response options and their expected impact.',
 respond:'respond <action-id>\n  Apply one response. Only one response per attempt.',
 verify:'verify\n  Check containment and whether the legitimate service is still up.',
 status:'status\n  Show objective progress.',
 hint:'hint\n  Progressive hints. No score penalty.',
 report:'report\n  Open the case report panel.',
 mail:'mail [n]\n  List your inbox, or read message n. Reading marks it as read.',
 ps:'ps [aux]\n  List processes on the connected host.',
 netstat:'netstat [-tnp]\n  List network connections on the connected host. Alias: ss',
 history:'history\n  Show commands entered in this case.',
 whoami:'whoami\n  Print your operator name.',
 id:'id\n  Print user and group identity.',
 hostname:'hostname\n  Print the current host name.',
 uname:'uname [-a]\n  Print system information.',
 date:'date\n  Print the in-game date and time.',
 uptime:'uptime\n  Print how long the host has been running.',
 echo:'echo [text...]\n  Print text.',
 clear:'clear\n  Clear the terminal transcript.'
};
