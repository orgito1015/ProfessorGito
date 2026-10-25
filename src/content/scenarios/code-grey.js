// Code Grey: a hospital ransomware night shift. Data only; stable IDs are part of the save contract.
const record=(id,path,title,text,time='02:41:00',extra={})=>({id,path,title,text,time,...extra});
const MOTD="ST BRIGID'S REGIONAL HOSPITAL . AUTHORISED USE ONLY\nThis system is monitored. Incident CG-0314 in progress.";
export const scenario={id:'code-grey',title:'Code Grey',tagline:"Three hours to dawn. A hospital's records are going dark, one ward at a time.",
 setting:"St. Brigid's Regional Hospital . Saturday, 02:41",difficulty:'Intermediate',firstMission:'cg-triage',endMission:'cg-restore',
 intro:[
  "02:38. Your phone buzzes on the nightstand. A text from a number you do not know: \"Tomasz Wren, IT at St. Brigid's. We need StarX. Now.\"",
  "02:41. The bridge call connects. Behind Tomasz, someone is reading bed numbers aloud from a paper list.",
  "\"The patient record system froze twenty minutes ago. Files on the ward share are being renamed. There's a note on a nurse's screen.\"",
  "Rhea Castellanos, StarX on-call lead, joins the call: \"{username}, you're on terminal. Remote access is up. Scope is coming through.\"",
  "Dr. Amara Okafor, chief medical officer, speaks last: \"Whatever you do, the infusion pumps and the emergency department stay online. People are on those machines.\""
 ],
 epilogues:[
  {when:{chose:'cg-restore:restore-online'},text:"St. Brigid's was seeing patients normally by Sunday lunchtime. The backups you protected at four in the morning made that possible."},
  {when:{chose:'cg-restore:restore-tape'},text:"The tape restore took thirty-one hours. Castlemoor absorbed the diverted ambulances, and the night staff still talk about the weekend of paper charts."},
  {when:{chose:'cg-restore:pay-decryptor'},text:"The payment cleared on Monday. The decryptor failed on a third of the machines, and the money funded the next attack on the next hospital."},
  {when:{chose:'cg-triage:kill-network'},text:"The nine minutes without pump telemetry became a training case for the clinical safety team. Nobody was harmed. Everyone knows how close it was."},
  {when:{chose:'cg-lateral:rotate-only'},text:"The review noted that the online restore points were lost after containment began. Rotating a password is not the same as taking the attacker's tools away."}
 ],
 coda:"GREY was a label for an encryptor, not a face. You traced it from a nurse's inbox back to a contractor password nobody rotated, and you kept the pumps running while you did it."};
export const endings=[
 {id:'full-account',title:'Full Account',summary:'Publish the complete incident report, including how the contractor account was exempted from MFA.',
  openingStrong:"The hospital publishes a full, precise account: the lookalike email, the nine days of contractor access, and the exemption that allowed it. Other hospitals use it to check their own VPNs within the week.",
  openingWeak:"The hospital publishes a full account, but gaps in the earlier reports force corrections in the following weeks.",
  closing:"Tomasz Wren keeps his job but loses the security brief. He sends you a short email a month later: the new MFA rollout covers the imaging carts."},
 {id:'protect-tomasz',title:'Protect Tomasz',summary:'Notify the regulator fully, but leave the name behind the MFA exemption out of the public report.',requires:{intel:'mfa-exemption'},requiresText:'Find out who signed off the contractor MFA exemption.',
  openingStrong:"The regulator receives every detail. The public report describes \"an approved exception that was never reviewed\" and names no one.",
  openingWeak:"The regulator receives the details, but the thin public report draws questions the hospital cannot answer cleanly.",
  closing:"Tomasz fixes the exemption list himself the following Monday. Rhea tells you it was the right call and the wrong precedent, and that both can be true."},
 {id:'board-line',title:"The Board's Version",summary:'Let the board announce "a sophisticated cyber attack" with no technical detail.',
  openingStrong:"The board's statement blames an unstoppable, sophisticated adversary. Your report sits in a drawer, accurate and unread.",
  openingWeak:"The board's statement is vague, and your incomplete reports make it hard to argue for anything better.",
  closing:"Six months later, a hospital two counties away is hit through a contractor VPN account with an MFA exemption."}
];
export const missions=[
 {id:'cg-triage',scenario:'code-grey',title:'Code Grey',chapter:'CHAPTER 1',client:"St. Brigid's Hospital",minutes:'12-18',date:'2026-03-14T02:41:00',handler:'Rhea',
  story:['Rhea Castellanos','Code Grey: you are on terminal',"{username}, it's Rhea. The hospital has declared Code Grey. Tomasz is on the bridge, Dr. Okafor is pacing behind him. Find where this started. Do not touch the clinical segment."],
  summary:"Files on the ward share are being renamed and a ransom note sits on a nurse's screen. Find the first infected machine without taking clinical systems down.",
  brief:"Rhea: Scope covers the ward file share, the endpoint security console and the clinical network monitor. Find the first machine in the chain, contain the spread narrowly, and keep the infusion pump gateway and emergency department online. Use solve <hostname> once you can name the first infected workstation.",
  next:'cg-lateral',extension:false,initialScope:['fileshare','edr','clinmon'],
  links:[{from:'edr',to:'fileshare',label:'Endpoint agents on ward workstations'},{from:'clinmon',to:'ehr-db',label:'Clinical segment (separate)'}],
  nodes:[
   {id:'fileshare',label:'Ward file share',address:'198.51.100.10',role:'File share for wards 1 to 6',motd:MOTD,user:'svc_audit',
    ports:[['22','ssh','OpenSSH 9.6p1'],['445','microsoft-ds','Samba smbd 4.19']],
    procs:[['root','1','/sbin/init'],['root','644','/usr/sbin/smbd --foreground'],['root','702','/usr/sbin/auditd'],['root','655','/usr/sbin/sshd -D']],
    conns:[['198.51.100.10:445','198.51.100.47:50112','ESTABLISHED','644/smbd (WS-WARD4-07)'],['198.51.100.10:445','198.51.100.33:49870','ESTABLISHED','644/smbd (WS-WARD2-03)']],
    files:[
     record('renames','/var/log/audit/file-events.log','File rename audit',"02:19:44 WS-WARD4-07 user=nurse.kowal RENAME rota_march.xlsx -> rota_march.xlsx.grey\n02:19:45 WS-WARD4-07 user=nurse.kowal RENAME discharge_template.docx -> discharge_template.docx.grey\n02:20:02 WS-WARD2-03 user=nurse.osei RENAME handover_ward2.docx -> handover_ward2.docx.grey\n02:21:10 to 02:41:00: 4,112 further RENAME events from 43 workstations\nFirst rename on this share: 02:19:44 from WS-WARD4-07.\nRename events only show where files were changed, not what started the process.",'02:41:00'),
     record('note','/wards/ward4/READ_ME_GREY.txt','Ransom note',"Your network is encrypted. Do not restart machines. Do not contact police.\nOpen the portal in the instructions and enter case key GREY-5521.\nWe also have your patient files. You have 72 hours.",'02:22:00')]},
   {id:'edr',label:'Endpoint security console',address:'198.51.100.20',role:'Endpoint alerts and process history',motd:MOTD,
    ports:[['22','ssh','OpenSSH 9.6p1'],['443','https','endpoint console (simulated)']],
    files:[
     record('alerts','/alerts/overnight.txt','Overnight endpoint alerts',"02:18:51 WS-WARD2-03 MEDIUM Office macro started a script host. Allowed by policy exception \"clinical-compat\".\n02:19:30 WS-WARD4-07 HIGH Unknown binary grey.exe started by svc_deploy. Mass file modification.\n02:20:01 WS-WARD2-03 HIGH grey.exe started by svc_deploy.\n02:20:05 to 02:24:40 grey.exe started by svc_deploy on 41 more endpoints.\nsvc_deploy is the software deployment service account.",'02:41:00'),
     record('proctree','/hosts/WS-WARD2-03/process-tree.txt','Process tree, WS-WARD2-03',"02:18:49 mail client opened attachment \"Updated rota - March.xlsm\" from rota-office@stbrigids-rota.example\n02:18:51 spreadsheet -> script host (macro)\n02:18:58 script host -> remote session using svc_deploy credentials cached on this workstation\n02:19:28 svc_deploy -> pushed grey.exe to WS-WARD4-07, WS-WARD2-03 and 41 other endpoints\nNote: stbrigids-rota.example is not a hospital domain.",'02:19:28'),
     record('policy-ex','/policy/exceptions.txt','Endpoint policy exceptions',"clinical-compat: allow office macros on ward workstations (legacy rota and pharmacy templates). Approved 2023, review overdue.\nIsolation from this console cuts a workstation off the network but leaves its local display running.",'2025-10-01',{owner:'secops'})]},
   {id:'clinmon',label:'Clinical network monitor',address:'198.51.100.30',role:'Medical device segment health (read-only)',motd:MOTD,
    ports:[['22','ssh','OpenSSH 9.6p1'],['161','snmp','net-snmp (read-only)']],
    files:[
     record('pumps','/status/clinical.txt','Clinical systems status',"02:40 Infusion pump gateway PGW-1: online, 64 pumps reporting.\n02:40 Emergency department tracking board: online.\n02:40 Patient record system: degraded. Mapped drives to the ward share failing.\nClinical devices sit on a separate segment. Isolating individual ward workstations does not affect PGW-1. Shutting down the core switch does.",'02:40:00')]},
   {id:'ehr-db',label:'Patient record database',address:'198.51.100.40',role:'Out of scope: clinical data',files:[]}],
  objectives:[{id:'scope',label:'Read the rules of engagement',kind:'flag',value:'scope'},{id:'collect',label:'Preserve the rename audit, alerts, process tree and clinical status',kind:'evidence',values:['renames','alerts','proctree','pumps']},{id:'deduce',label:'Name the first infected workstation',kind:'flag',value:'puzzle'},{id:'respond',label:'Contain the spread',kind:'responded'},{id:'verify',label:'Verify containment and clinical systems',kind:'verified'},{id:'report',label:'Submit the case report',kind:'reported'}],
  actions:[
   {id:'isolate-endpoints',label:'Isolate the affected workstations and disable svc_deploy',node:'edr',required:['alerts','proctree','pumps'],impact:'The 43 affected workstations are isolated from the endpoint console and svc_deploy is disabled. Renaming stops. Infusion pumps and the ED board stay online.',verify:'no new rename events since isolation; svc_deploy sign-ins blocked.',service:true,quality:20},
   {id:'isolate-ward4',label:'Isolate only WS-WARD4-07',node:'edr',required:['renames'],impact:'WS-WARD4-07 is isolated, but svc_deploy keeps running grey.exe elsewhere. Renames continue on Ward 2 and beyond.',verify:'renames stopped from WS-WARD4-07 only; 42 endpoints still active.',service:true,quality:6},
   {id:'kill-network',label:'Shut down the hospital core switch',node:'edr',required:['alerts'],impact:'Renaming stops everywhere. The infusion pump gateway and ED tracking board also go dark; nurses switch to manual pump checks for nine minutes.',service:false,quality:5}],
  findings:[{id:'macro-svcacct',label:'A macro on WS-WARD2-03 used a cached deployment account to push the encryptor to the wards'},{id:'ward4-origin',label:'WS-WARD4-07 is the origin because the ransom note appeared there'},{id:'insider-nurse',label:'A nurse deliberately launched the ransomware'}],
  correctFinding:'macro-svcacct',requiredEvidence:['renames','alerts','proctree','pumps'],
  puzzle:{prompt:'Which workstation was infected first? Use solve <hostname>.',answers:['ws-ward2-03'],requires:['renames','alerts','proctree'],success:"WS-WARD2-03. The note appeared on Ward 4, but the first event in the chain is a macro on Ward 2 at 02:18:51. It reused the deployment account cached on that machine to push grey.exe everywhere else. The note marks where the damage became visible, not where it began."},
  hints:['Start with scope and nmap. The file share shows where files changed; the endpoint console shows what ran.','Compare the first rename time with the first alert time. Then read the process tree for the earlier machine: grep -r svc_deploy / on the endpoint console helps.','Collect renames, alerts, proctree and pumps. solve ws-ward2-03, then ssh edr, respond isolate-endpoints, verify.'],
  debrief:'Where damage shows up first is not always where an intrusion began. Process history tied a macro on one workstation to a cached service account that pushed the encryptor to the rest. Isolating endpoints and disabling the shared account stopped the spread without touching clinical devices. Real ransomware response also involves law enforcement, insurers and clinical safety officers; this case reduces that to a few authored records.',
  transfer:{question:'The ransom note is on Ward 4. Should you assume Ward 4 is where the attackers got in?',choices:['Yes, the note marks the entry point','No; trace process and account history back to the earliest event'],correct:1,explanation:'Ransom notes are dropped wherever the encryptor runs. The earliest corroborated event is the lead.'},
  events:[
   {id:'tomasz-note',on:'read:note',chat:true,from:'Tomasz Wren',text:"It says don't restart anything. Should we just pay? The board wants an answer by six."},
   {id:'okafor-pumps',on:'tick:7',chat:true,from:'Dr. Okafor',text:'Two wards are on paper charts now. Tell me the pumps are safe.'},
   {id:'rhea-zero',on:'read:alerts',chat:true,from:'Rhea',text:'The note is on Ward 4, but check what ran first. Patient zero is rarely where the screaming starts.'},
   {id:'lookalike',on:'read:proctree',from:'Rhea Castellanos',subject:'That rota email',text:'stbrigids-rota.example is a lookalike domain. It was registered eleven days ago. Eleven days. Keep that number in your head.'},
   {id:'thanks',on:'verified',when:{chose:'cg-triage:isolate-endpoints'},from:'Dr. Amara Okafor',subject:'Pumps steady',text:'The pumps never blinked. Thank you. Now find out how they got in, before they do it again.'},
   {id:'dark',on:'verified',when:{chose:'cg-triage:kill-network'},from:'Dr. Amara Okafor',subject:'Nine minutes',text:'The pumps were dark for nine minutes. Nobody was hurt. That was luck, not planning. Please be more careful.'},
   {id:'still-spreading',on:'verified',when:{chose:'cg-triage:isolate-ward4'},chat:true,from:'Rhea',text:'Ward 2 is still renaming files. We stopped one machine, not the account doing the pushing.'}]},
 {id:'cg-lateral',scenario:'code-grey',title:'Eleven Days',chapter:'CHAPTER 2',client:"St. Brigid's Hospital",minutes:'15-22',date:'2026-03-14T04:05:00',handler:'Rhea',
  story:['Rhea Castellanos','Eleven days','The spread is stopped. Now the harder question: how long were they inside, and do we still have backups? The VPN logs, domain audit and backup server are yours.'],
  summary:'The spread is stopped. Now find out how long they were inside, and whether the backups survived.',
  brief:'Rhea: The lookalike domain is eleven days old, so the email was not the start. Scope covers the VPN gateway, the domain controller audit and the backup server. Find the account the attackers first came in with (solve <account>) and protect what is left of the backups. Changes on the backup server need incident-response authority: preserve the backup job log, then request-scope.',
  next:'cg-restore',extension:true,scopeLead:'jobs',scopeApproval:"ST BRIGID'S: Incident response approved for the backup server and VPN gateway. The patient record database remains out of scope.",initialScope:['vpn','dc-audit','backup'],
  links:[{from:'vpn',to:'dc-audit',label:'Contractor sign-ins'},{from:'dc-audit',to:'backup',label:'svc_deploy group change'}],
  nodes:[
   {id:'vpn',label:'VPN gateway',address:'198.51.100.50',role:'Remote access for staff and vendors',motd:MOTD,ports:[['22','ssh','OpenSSH 9.6p1'],['443','https','VPN portal (simulated)']],
    conns:[['198.51.100.50:443','203.0.113.15:61022','ESTABLISHED','vpnd (radiology on-call)']],
    files:[
     record('vpnlog','/var/log/vpn/auth.log','VPN authentication log',"03 Mar 23:12:08 user=m.lind (Lindqvist Medical IT) from 203.0.113.77 mfa=EXEMPT result=success\n04 Mar to 13 Mar: 31 further sessions for m.lind, all between 22:00 and 04:00, all from 203.0.113.77\nm.lind is the imaging vendor's contractor account. Contractor last on site: November 2025.",'04:00:00'),
     record('exempt','/etc/vpn/mfa-exemptions.conf','MFA exemption list',"# Exemptions require CISO sign-off.\nm.lind    # temporary: vendor carts cannot do app MFA. TW 2025-09-02\n# No CISO sign-off recorded for this entry.",'2025-09-02',{owner:'root',intel:'mfa-exemption'})]},
   {id:'dc-audit',label:'Domain controller audit',address:'198.51.100.60',role:'Privileged account change history',motd:MOTD,
    files:[
     record('dcaudit','/audit/privileged-changes.log','Privileged account changes',"04 Mar 00:03 m.lind enumerated domain groups.\n06 Mar 01:40 m.lind read deploy.ps1 on the scripts share; the script contains the svc_deploy password in plain text.\n13 Mar 22:10 svc_deploy added to Backup Operators.\nNine days between the first contractor session and encryption.",'04:00:00'),
     record('scripts','/shares/scripts/README.txt','Scripts share readme',"deploy.ps1: pushes ward software. Credentials inline \"until the vault project lands\". Owner: IT operations.",'2024-02-11')]},
   {id:'backup',label:'Backup server',address:'198.51.100.70',role:'Online restore points',motd:MOTD,ports:[['22','ssh','OpenSSH 9.6p1'],['8443','https','backup console (simulated)']],
    procs:[['root','1','/sbin/init'],['backup','1180','/opt/backup/bin/scheduler'],['svc_deploy','5521','/opt/backup/bin/prune --all wards-*']],
    files:[
     record('jobs','/var/log/backup/jobs.log','Backup job log',"14 Mar 02:30 svc_deploy: DELETE restore points wards-* (12 of 30 deleted)\n14 Mar 04:04 deletion still in progress, 18 restore points remain\nOffline tape set T-0312 (written 12 Mar) is not reachable from the network.",'04:04:00'),
     record('tapes','/docs/tape-rotation.txt','Tape rotation note','Weekly tapes leave the building every Thursday. T-0312 is in the records office safe. A full restore from tape takes about 30 hours.','2026-03-12'),
     record('late-spread','/var/log/backup/late-spread.txt','Late spread report',"Because only one workstation was isolated earlier, grey.exe reached 9 more endpoints after 02:45, including the radiology reading room.",'03:10:00',{when:{chose:'cg-triage:isolate-ward4'}})]}],
  objectives:[{id:'scope',label:'Read scope and preserve the backup job log',kind:'evidence',values:['jobs']},{id:'extend',label:'Obtain incident-response authority',kind:'flag',value:'extension'},{id:'collect',label:'Preserve the VPN log and domain audit',kind:'evidence',values:['jobs','vpnlog','dcaudit']},{id:'deduce',label:'Name the account used to get in',kind:'flag',value:'puzzle'},{id:'respond',label:'Protect the remaining restore points',kind:'responded'},{id:'verify',label:'Verify backups and remote access',kind:'verified'},{id:'report',label:'Submit the case report',kind:'reported'}],
  actions:[
   {id:'protect-backups',label:'Disable svc_deploy, take the backup server off the network, revoke m.lind',node:'backup',required:['jobs','vpnlog','dcaudit'],impact:'svc_deploy disabled and the backup server taken off the network. Deletion stops with 18 restore points intact. The m.lind VPN account is revoked.',verify:'restore point deletion stopped at 18 of 30; contractor VPN access revoked.',service:true,quality:20},
   {id:'rotate-only',label:'Reset the svc_deploy password and leave the backup server online',node:'backup',required:['jobs'],impact:'The password is reset, but the prune job already running keeps going. The remaining online restore points are deleted. Only offline tape T-0312 survives.',verify:'svc_deploy password changed; online restore points: 0 of 30.',service:true,quality:9},
   {id:'vpn-off',label:'Shut down the VPN for everyone',node:'vpn',required:['vpnlog'],impact:'All remote access is cut, including on-call radiologists reading scans from home. Restore points keep being deleted on the backup server.',service:false,quality:4}],
  findings:[{id:'contractor-vpn',label:'A contractor VPN account exempted from MFA was used for nine days before the encryptor ran'},{id:'phish-only',label:'The intrusion began with the rota email on the night of the attack'},{id:'vendor-attack',label:'Lindqvist Medical IT deliberately attacked the hospital'}],
  correctFinding:'contractor-vpn',requiredEvidence:['jobs','vpnlog','dcaudit'],
  puzzle:{prompt:'Which account did the attackers first sign in with? Use solve <account>.',answers:['m.lind'],requires:['vpnlog','dcaudit'],success:'m.lind. The contractor account signed in on 3 March, nine days before the encryptor ran, with MFA exempted. The rota email was the last step of the operation, not the first.'},
  hints:['The job log on the backup server is your lead for request-scope. Look at what is still running there with ps.','Read the VPN auth log and the privileged change history. Which account appears before svc_deploy is touched? find / -name "*.conf" on the VPN host may also be worth a look.','Collect jobs, request-scope, collect vpnlog and dcaudit, solve m.lind, then ssh backup and respond protect-backups.'],
  debrief:"Ransomware is usually the end of an intrusion, not the start. A contractor account without MFA gave nine days of quiet access; a password stored in a script turned that into control of the deployment account. Protecting restore points first kept recovery possible. Attribution to the vendor's company is unsupported: an account is not a person.",
  transfer:{question:'You reset the compromised password. Is the attacker locked out?',choices:['Yes, a new password ends their access','Not necessarily; running jobs, sessions and other accounts must be stopped too'],correct:1,explanation:'Credential rotation does not stop processes or sessions already running under that identity.'},
  events:[
   {id:'pumps-memory',on:'start',when:{chose:'cg-triage:kill-network'},chat:true,from:'Dr. Okafor',text:'After the pumps went dark earlier, the clinical safety officer is watching every change you make. Narrow, please.'},
   {id:'prune',on:'read:jobs',chat:true,from:'Rhea',text:'That prune job is still running. Every minute we wait, we lose restore points. Get the authority and move.'},
   {id:'tomasz-exempt',on:'read:exempt',chat:true,from:'Tomasz Wren',text:"Before that goes in a report. The imaging carts couldn't do app MFA. I meant to fix it. Can we keep my initials out of it?"},
   {id:'dwell',on:'flag:puzzle',from:'Rhea Castellanos',subject:'Nine days',text:'m.lind signed in on the 3rd. They sat in this network for nine days before pressing the button. The rota email was the finale, not the overture.'},
   {id:'diversion',on:'tick:10',chat:true,from:'Dr. Okafor',text:"We're diverting ambulances to Castlemoor. Every hour costs us. How long to restore?"},
   {id:'lost',on:'action:rotate-only',from:'Rhea Castellanos',subject:'We lost the online backups',text:'The prune job finished after the password change. We still have tape T-0312, but that is thirty hours, not six.'},
   {id:'saved',on:'action:protect-backups',chat:true,from:'Rhea',text:'Eighteen restore points. That is the difference between Sunday and Tuesday. Good work.'}]},
 {id:'cg-restore',scenario:'code-grey',title:'First Light',chapter:'FINALE',client:"St. Brigid's Hospital",minutes:'12-18',date:'2026-03-14T06:10:00',handler:'Rhea',
  story:['Rhea Castellanos','First light',"Dawn. The attackers sent a new message overnight, the board meets at seven, and Tomasz hasn't slept. Let's finish this properly."],
  summary:'Dawn. The board wants the hospital back, the attackers want paying, and their claims need checking.',
  brief:'Rhea: Last chapter. The negotiation inbox has the latest demand, the firewall has the real outbound transfers, and the recovery desk has the options. Check what was actually taken (solve <amount> in GB) and then choose how St. Brigid\'s comes back.',
  next:null,extension:false,initialScope:['negotiation','firewall','recovery'],
  links:[{from:'firewall',to:'negotiation',label:'Claims versus transfers'},{from:'recovery',to:'firewall',label:'Restore plan'}],
  nodes:[
   {id:'negotiation',label:'Negotiation inbox',address:'198.51.100.80',role:'Attacker messages forwarded by counsel',motd:MOTD,
    files:[
     record('demand','/inbox/latest.txt','Latest demand',"Price is now doubled. We hold 300 GB of patient records. Proof attached. If you restore without paying, we publish.",'05:52:00'),
     record('proof','/inbox/proof-filelist.txt','Attacker proof file list',"/wards/rota/*\n/wards/templates/*\n/finance/catering-invoices/*\nTotal claimed in this list: 2.1 GB. No folder from the patient record system appears.",'05:52:00')]},
   {id:'firewall',label:'Firewall egress log',address:'198.51.100.90',role:'Outbound transfer history',motd:MOTD,ports:[['22','ssh','OpenSSH 9.6p1'],['514','syslog','rsyslog']],
    files:[
     record('egress','/logs/egress-summary.txt','Outbound transfer summary',"13 Mar 23:40 to 14 Mar 00:20 fileshare -> 203.0.113.77 2.1 GB\nSource folders: /wards/rota, /wards/templates, /finance/catering-invoices\nNo transfer from the patient record segment in the last 30 days.",'06:00:00')]},
   {id:'recovery',label:'Recovery desk',address:'198.51.100.95',role:'Restore options and legal duties',motd:MOTD,
    files:[
     record('plan','/plans/options.txt','Recovery options',"A: restore wards from the online restore points (about 6 hours). Only possible if online restore points survived.\nB: restore from offline tape T-0312 (about 30 hours; ambulances diverted meanwhile).\nC: pay for a decryptor (unverified, no guarantee, may breach sanctions rules).",'06:05:00'),
     record('notify','/docs/notification.txt','Notification duties','Confirmed unauthorized access to personal data must be reported to the data protection regulator within 72 hours. Staff rota data includes names and phone numbers. Paying does not change this duty.','06:05:00')]}],
  objectives:[{id:'scope',label:'Read the authorized scope',kind:'flag',value:'scope'},{id:'collect',label:'Preserve the demand, proof list, egress log, options and duties',kind:'evidence',values:['demand','proof','egress','plan','notify']},{id:'deduce',label:'Measure what was really taken',kind:'flag',value:'puzzle'},{id:'respond',label:'Choose the recovery',kind:'responded'},{id:'verify',label:'Verify recovery and notification',kind:'verified'},{id:'report',label:'Submit the final report',kind:'reported'}],
  actions:[
   {id:'restore-online',label:'Restore from the surviving online restore points and notify on time',node:'recovery',required:['plan','notify','egress'],when:{chose:'cg-lateral:protect-backups'},impact:'Wards come back from the 18 online restore points in just over six hours. The ED stops diverting by midday. The regulator is notified on time.',verify:'ward systems restored and scanned clean; regulator notified.',service:true,quality:20},
   {id:'restore-tape',label:'Restore from offline tape T-0312 and notify on time',node:'recovery',required:['plan','notify','egress'],impact:'The tape restore begins: thirty hours of paper charts and diverted ambulances, but a clean rebuild. The regulator is notified on time.',verify:'restore in progress from clean media; regulator notified.',service:false,quality:14},
   {id:'pay-decryptor',label:'Pay for the decryptor',node:'recovery',required:['plan','notify','egress'],impact:'A broker makes the payment. The decryptor works on two thirds of machines and corrupts the rest, which are restored from backup anyway.',verify:'partial decryption; corrupted machines still need restoring.',service:true,quality:6}],
  findings:[{id:'inflated-claim',label:'The attackers took 2.1 GB of rota, template and finance files, not the patient records they claim'},{id:'ehr-stolen',label:'The patient record database was stolen as claimed'},{id:'nothing-taken',label:'No data left the network'}],
  correctFinding:'inflated-claim',requiredEvidence:['demand','proof','egress','plan','notify'],
  puzzle:{prompt:'How much data actually left the network? Use solve <amount>, for example solve 5gb.',answers:['2.1gb','2.1','2.1g'],requires:['demand','proof','egress'],success:'2.1 GB, from rota, template and finance folders. The demand claims 300 GB of patient records; the firewall and their own proof list say otherwise. Staff data was still taken, so notification is still required.'},
  hints:['Compare what the demand claims with what the firewall actually saw leaving.','grep -r GB / on the firewall gives you the transferred volume. The proof list is the attackers own evidence.','Collect all five records, solve 2.1gb, ssh recovery and choose a restore. Report inflated-claim.'],
  debrief:'Extortion claims are evidence of intent, not of scope. The transfer log and the attackers own proof list both show a much smaller theft than the demand. Notification duties still apply, and recovery options depend on what was protected earlier in the night.',
  transfer:{question:'The attackers say they have 300 GB of patient data. What do you put in the report?',choices:['300 GB of patient data, as claimed','2.1 GB of staff and finance files, as measured, with the claim noted as unverified'],correct:1,explanation:'Report what the evidence measures and label the claim for what it is.'},
  events:[
   {id:'board',on:'tick:6',chat:true,from:'Tomasz Wren',text:'The board is asking if we can just pay and make it go away. I told them to wait for you.'},
   {id:'no-online',on:'start',when:{notChose:'cg-lateral:protect-backups'},from:'Rhea Castellanos',subject:'No online restore points',text:'Because the online restore points are gone, option A is off the table. Tape or pay. I know which one I would choose.'},
   {id:'truth',on:'flag:puzzle',chat:true,from:'Rhea',text:'2.1 GB. Rotas and catering invoices. They are bluffing about the patient records, but staff phone numbers are still personal data.'},
   {id:'okafor-final',on:'verified',from:'Dr. Amara Okafor',subject:'From the ED',text:'Whatever happens with the board, the night staff kept every patient safe and you kept the machines running for them. That matters more than any statement.'}]}
];
