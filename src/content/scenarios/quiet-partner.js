// The Quiet Partner: an insider data-theft case at a law firm. Data only; stable IDs are part of the save contract.
const record=(id,path,title,text,time='17:52:00',extra={})=>({id,path,title,text,time,...extra});
const MOTD='HARROW & VALE LLP . PRIVILEGED AND CONFIDENTIAL\nAccess is logged for legal hold purposes.';
export const scenario={id:'quiet-partner',title:'The Quiet Partner',tagline:'A leaver, a merger, and 4 GB of documents that should never have left the building.',
 setting:'Harrow & Vale LLP . Thursday, 17:52',difficulty:'Intermediate',firstMission:'qp-exit',endMission:'qp-hold',
 intro:[
  'Thursday, 17:52. The call comes from a general counsel who sounds like he has already decided.',
  '"Graham Holt, Harrow and Vale. One of our associates, Noor Haddad, left today. Our data-loss system says she uploaded the Kestrel merger files to her personal cloud an hour ago."',
  '"Kestrel is announced on Monday. If those files are out, it is a disaster. I want her dismissed tonight and a statement ready. I just need you to confirm it."',
  'Iva Marlow, your mentor at StarX, mutes the line. "{username}. He wants a confirmation, not an investigation. We do not sell confirmations."',
  '"Pull the logs. Find out whose hands were on the keyboard. Then we tell him what the evidence says, whoever it lands on."'
 ],
 epilogues:[
  {when:{chose:'qp-exit:dismiss-noor'},text:'Noor Haddad was dismissed by phone on a Thursday night for something she did not do. The firm settled her claim quietly, and the reference letter it wrote her was very warm.'},
  {when:{chose:'qp-exit:suspend-sessions'},text:'Noor Haddad started at her new firm the following Monday. She never learned how close she came to carrying the blame, only that someone checked the badge logs.'},
  {when:{chose:'qp-mailbox:confront-bea'},text:'Bea Lindgren deleted her chat history the afternoon she was confronted. Without it, the case against the person who gave her instructions took a year longer.'},
  {when:{chose:'qp-hold:via-graham'},text:'Graham took the package to Callum "for context" before compliance saw it. Two days were lost, and the regulator asked why.'},
  {when:{intel:'callum-chat'},text:'The cached chat was eleven lines long. It was the only record of who asked for the upload, and it existed because someone looked past the files the brief told them to read.'}
 ],
 coda:'The forwarding rule was called archive-k. It was never an archive. You followed a saved password back to the desk outside the managing partner\'s door, and you made sure the blame did not land on the person who had already left.'};
export const endings=[
 {id:'committee',title:'The Committee',summary:'Deliver the evidence to the audit committee and the compliance officer and let them decide.',
  openingStrong:'The audit committee suspends the managing partner pending investigation. The compliance officer files a suspicious transaction report with the financial regulator within the week.',
  openingWeak:'The committee receives the package, but gaps in the earlier reports give the managing partner room to contest every point.',
  closing:'Iva closes the file with a single note: "Evidence went to the people with the authority to act on it. That is the job."'},
 {id:'whistle',title:'Whistleblower',summary:'Send the evidence package, including the cached chat, directly to the financial regulator.',requires:{intel:'callum-chat'},requiresText:'Recover the instruction behind the forwarding rule from the HV-WS-0007 image.',
  openingStrong:'The regulator opens an insider dealing investigation within days. The cached chat is quoted in the first notice, and the firm cannot pretend it was a misunderstanding.',
  openingWeak:'The regulator opens an investigation, but inconsistencies in the earlier reports slow it down.',
  closing:'StarX loses Harrow and Vale as a client. Iva says it is the best client StarX has ever lost.'},
 {id:'buried',title:'Buried',summary:"Accept the firm's settlement and sign the confidentiality agreement.",
  openingStrong:'The firm thanks StarX warmly, pays the invoice early, and asks for every copy of the evidence to be returned.',
  openingWeak:'The firm pays, collects the evidence, and the file is closed with no findings.',
  closing:'Kestrel is announced on Monday. A family trust sells its shares on Tuesday at a very good price.'}
];
export const missions=[
 {id:'qp-exit',scenario:'quiet-partner',title:'Exit Interview',chapter:'CHAPTER 1',client:'Harrow & Vale LLP',minutes:'12-18',date:'2026-05-21T17:52:00',handler:'Iva',
  story:['Graham Holt','Deal with this tonight','Noor Haddad uploaded the Kestrel files on her way out. I need this confirmed and her access gone tonight. Please do not complicate it.'],
  summary:'A data-loss alert says a departing associate uploaded merger files on her last day. The general counsel wants her walked out tonight.',
  brief:'Iva: Scope covers the data-loss alert queue, the sign-in log and the device inventory. Find out whose session actually made the upload before anyone acts. Use solve <device> to name the device the upload came from.',
  next:'qp-mailbox',extension:false,initialScope:['dlp','signin','inventory'],
  links:[{from:'dlp',to:'signin',label:'Alert to session'},{from:'signin',to:'inventory',label:'Device lookup'}],
  nodes:[
   {id:'dlp',label:'Data-loss alert queue',address:'203.0.113.10',role:'Upload and labeling alerts',motd:MOTD,ports:[['22','ssh','OpenSSH 9.6p1'],['443','https','DLP console (simulated)']],
    files:[record('dlpalert','/alerts/DLP-4471.txt','DLP alert 4471',"17:31 user=n.haddad uploaded 214 files (4.1 GB) to personal cloud storage.\nLabels: PROJECT-KESTREL (merger, strictly confidential).\nPolicy action: logged only.",'17:31:00')]},
   {id:'signin',label:'Sign-in log',address:'203.0.113.11',role:'Identity provider sign-in history',motd:MOTD,
    files:[record('signins','/logs/signins-0521.log','Sign-in log, 21 May',"16:58 n.haddad device=HV-LT-0214 location=office mfa=ok\n17:12 n.haddad device=HV-LT-0214 signed out; laptop handed to IT at exit\n17:29 n.haddad device=HV-WS-0007 session resumed from a saved browser login, no MFA prompt\n17:31 upload event from HV-WS-0007",'17:31:00')]},
   {id:'inventory',label:'Device inventory',address:'203.0.113.12',role:'Asset and HR exit records',motd:MOTD,
    files:[
     record('devices','/cmdb/devices.csv','Device inventory',"HV-LT-0214, laptop, assigned n.haddad, returned to IT 17:12\nHV-WS-0007, desktop, partners' floor, assigned b.lindgren (assistant to C. Vale)\nHV-WS-0031, desktop, associates' floor, assigned n.haddad",'17:40:00'),
     record('exit','/hr/exit-checklist-nhaddad.txt','Exit checklist',"17:10 laptop returned. 17:12 badge deactivated for the partners' floor. 17:15 escorted out by reception.\nBadge logs: no entry to the partners' floor after 16:40.",'17:15:00')]},
   {id:'hr-mail',label:'HR mailbox',address:'203.0.113.13',role:'Out of scope: personnel correspondence',files:[]}],
  objectives:[{id:'scope',label:'Read the rules of engagement',kind:'flag',value:'scope'},{id:'collect',label:'Preserve the alert, sign-ins, device inventory and exit checklist',kind:'evidence',values:['dlpalert','signins','devices','exit']},{id:'deduce',label:'Name the device behind the upload',kind:'flag',value:'puzzle'},{id:'respond',label:'Respond without punishing the wrong person',kind:'responded'},{id:'verify',label:'Verify the session is closed',kind:'verified'},{id:'report',label:'Submit the case report',kind:'reported'}],
  actions:[
   {id:'suspend-sessions',label:'Revoke all n.haddad sessions, lock HV-WS-0007 for forensics, preserve the upload',node:'signin',required:['dlpalert','signins','devices','exit'],impact:'All sessions for n.haddad are revoked, HV-WS-0007 is locked and imaged, and the upload is preserved for legal hold. Nobody is dismissed tonight.',verify:'no active sessions for n.haddad; HV-WS-0007 locked and imaged.',service:true,quality:20},
   {id:'dismiss-noor',label:'Recommend immediate dismissal of Noor Haddad',node:'dlp',required:['dlpalert'],impact:'Graham dismisses Noor by phone. The session on HV-WS-0007 stays active overnight.',verify:"Noor's account is disabled, but the saved session on HV-WS-0007 is still live.",service:true,quality:4}],
  findings:[{id:'framed-session',label:"The upload came from a saved session on another person's desktop after Noor had left the building"},{id:'noor-exfil',label:'Noor Haddad uploaded the files herself before leaving'},{id:'cloud-breach',label:'The personal cloud provider was breached'}],
  correctFinding:'framed-session',requiredEvidence:['dlpalert','signins','devices','exit'],
  puzzle:{prompt:'Which device made the upload? Use solve <device>.',answers:['hv-ws-0007'],requires:['dlpalert','signins','devices'],success:"HV-WS-0007. Noor's laptop was handed in at 17:12 and she was escorted out at 17:15. The upload ran at 17:31 from a desktop on the partners' floor, through a saved login that skipped MFA."},
  hints:['An account name in an alert is not a person. Check which device made the upload.','Line up the times: grep -n HV- across the sign-in log and the device inventory.','Collect all four records, solve hv-ws-0007, ssh signin, respond suspend-sessions, verify.'],
  debrief:'Alerts name accounts, not people. The device, the time and the badge record together showed the upload happened after Noor had left, from someone else\'s desk, through a saved login. Revoking sessions and preserving the device protected the evidence without punishing anyone on an unverified claim.',
  transfer:{question:'The DLP alert names n.haddad. Is that enough to dismiss her?',choices:['Yes, the account did it','No; confirm the device, location and session before attributing an action to a person'],correct:1,explanation:'Saved logins, shared desks and session reuse mean an account name is a lead, not an identity.'},
  events:[
   {id:'graham-push',on:'tick:5',chat:true,from:'Graham Holt',text:'Kestrel is announced Monday. Is it her or not? I need a yes.'},
   {id:'badge',on:'read:exit',chat:true,from:'Iva',text:'She was escorted out at 17:15. The upload was at 17:31. Hold that thought.'},
   {id:'whose-desk',on:'flag:puzzle',from:'Iva Marlow',subject:'Whose desk is that?',text:"HV-WS-0007 sits outside Callum Vale's office. He is the managing partner. It is his assistant's desk. Be careful who you say that to, and be certain before you say it at all."},
   {id:'noor-wrong',on:'action:dismiss-noor',from:'Noor Haddad',subject:'You got it wrong',text:'I was on the train at half past five. Check the badge logs. I will be speaking to a lawyer.'},
   {id:'noor-thanks',on:'action:suspend-sessions',chat:true,from:'Noor Haddad',text:"IT says my sessions were locked pending review. I didn't take anything. I hope you can prove that."}]},
 {id:'qp-mailbox',scenario:'quiet-partner',title:'Rules of the House',chapter:'CHAPTER 2',client:'Harrow & Vale LLP',minutes:'15-22',date:'2026-05-22T09:15:00',handler:'Iva',
  story:['Iva Marlow','A rule nobody remembers','Graham approved a review of the mail journal, the HV-WS-0007 image and the trading pre-clearance register. Callum Vale\'s own mailbox is out of scope. Look carefully, and look beyond the obvious files.'],
  summary:"HV-WS-0007 belongs to the managing partner's assistant. Her mailbox has a forwarding rule nobody remembers creating.",
  brief:'Iva: Find where the merger documents went. Use solve <address> to name the outside forwarding address. Changes to the mailbox need incident-response authority: preserve the mailbox rule first, then request-scope. The managing partner\'s mailbox is out of scope.',
  next:'qp-hold',extension:true,scopeLead:'rule',scopeApproval:"HARROW & VALE (General Counsel): Approved. Disable the forwarding rule and preserve the mailbox. Do not access the managing partner's mailbox.",initialScope:['journal','ws7','register'],
  links:[{from:'ws7',to:'journal',label:'Rule created from this desktop'},{from:'journal',to:'register',label:'Deal timing'},{from:'journal',to:'cvale-mbx',label:'Out of scope'}],
  nodes:[
   {id:'journal',label:'Mail journal',address:'203.0.113.20',role:'Mailbox rules and message journal',motd:MOTD,ports:[['22','ssh','OpenSSH 9.6p1'],['993','imaps','journal archive (simulated)']],
    files:[
     record('rule','/rules/b.lindgren.txt','Mailbox rules for b.lindgren','Rule "archive-k": IF subject contains "Kestrel" THEN forward to kestrel.notes@fastmail-alt.example AND delete from Sent.\nCreated 2026-04-30 18:02 from HV-WS-0007.','09:10:00'),
     record('fwdcount','/stats/forwards.txt','Forwarding statistics','57 messages forwarded by rule "archive-k" between 30 April and 21 May. The destination domain is not on the approved list.','09:10:00')]},
   {id:'ws7',label:'HV-WS-0007 disk image',address:'203.0.113.21',role:'Forensic image (read-only)',motd:'FORENSIC IMAGE HV-WS-0007 . READ-ONLY MOUNT\nImaged 21 May 18:40. Hash recorded.',
    files:[
     record('browser','/Users/blindgren/AppData/browser-logins.txt','Saved browser logins',"Saved credential for portal.harrowvale.example: user n.haddad\nSaved 2026-03-02, during Noor's secondment to the partners' floor.",'2026-03-02'),
     record('chat','/Users/blindgren/AppData/chat-cache/c.vale.txt','Cached chat with C. Vale',"C.Vale 20 May 19:44: Use Noor's login for the Kestrel upload tomorrow. She's leaving anyway, nobody will question it.\nB.Lindgren 20 May 19:51: I don't feel right about this.\nC.Vale 20 May 19:52: You'll be fine. Delete this after.",'2026-05-20',{intel:'callum-chat',when:{notChose:'qp-mailbox:confront-bea'}}),
     record('downloads','/Users/blindgren/Downloads/readme.txt','Downloads folder note','Empty apart from printer drivers.','2026-04-01')]},
   {id:'register',label:'Trading pre-clearance register',address:'203.0.113.22',role:'Compliance records',motd:MOTD,
    files:[record('trades','/compliance/preclearance-2026.txt','Pre-clearance register',"No pre-clearance requests for Kestrel-related securities from any partner.\nCompliance note: a brokerage account linked to \"C. Vale family trust\" bought shares in the merger target on 2 May and 14 May.",'09:00:00')]},
   {id:'cvale-mbx',label:"Managing partner's mailbox",address:'203.0.113.23',role:'Out of scope',files:[]}],
  objectives:[{id:'scope',label:'Read scope and preserve the mailbox rule',kind:'evidence',values:['rule']},{id:'extend',label:'Obtain incident-response authority',kind:'flag',value:'extension'},{id:'collect',label:'Preserve the forwarding stats, saved logins and trading register',kind:'evidence',values:['rule','fwdcount','browser','trades']},{id:'deduce',label:'Name the outside forwarding address',kind:'flag',value:'puzzle'},{id:'respond',label:'Stop the forwarding and preserve the mailbox',kind:'responded'},{id:'verify',label:'Verify forwarding has stopped',kind:'verified'},{id:'report',label:'Submit the case report',kind:'reported'}],
  actions:[
   {id:'disable-rule',label:'Disable the rule, preserve the mailbox and place it on legal hold',node:'journal',required:['rule','fwdcount','browser','trades'],impact:'Rule archive-k is disabled and the mailbox placed on legal hold. Saved credentials on HV-WS-0007 are cleared. The firm keeps working normally.',verify:'no messages forwarded since the rule was disabled; legal hold active.',service:true,quality:20},
   {id:'confront-bea',label:'Delete the rule and let Graham confront Bea directly',node:'journal',required:['rule'],impact:'The rule is deleted without preservation. Bea is confronted, panics, and clears her chat history from the synced profile.',verify:'forwarding stopped; rule history not preserved.',service:true,quality:7},
   {id:'freeze-email',label:'Suspend email for the whole firm',node:'journal',required:['rule'],impact:'Forwarding stops, but the whole firm loses email for a day before the merger announcement.',service:false,quality:4}],
  findings:[{id:'directed-forwarding',label:"A rule on the assistant's mailbox forwarded merger documents outside the firm, and a saved login made the upload look like Noor's"},{id:'bea-alone',label:'The assistant acted alone for personal gain'},{id:'noor-again',label:'Noor Haddad created the forwarding rule'}],
  correctFinding:'directed-forwarding',requiredEvidence:['rule','fwdcount','browser','trades'],
  puzzle:{prompt:'Where were the Kestrel messages forwarded? Use solve <address>.',answers:['kestrel.notes@fastmail-alt.example'],requires:['rule','fwdcount'],success:'kestrel.notes@fastmail-alt.example. Fifty-seven messages since 30 April, and the Sent copies deleted each time. Who reads that address is not yet proven.'},
  hints:['The rule on the journal is your lead for request-scope. Then read the forwarding statistics.','The disk image has more than the obvious files. Try find / -name "*.txt" on ws7, or grep -ri kestrel / there.','Collect rule, request-scope, collect fwdcount, browser and trades, solve kestrel.notes@fastmail-alt.example, respond disable-rule on journal.'],
  debrief:'A forwarding rule that deletes its own sent copies is designed not to be noticed. The saved login explains how the upload was made to look like Noor. The trading register supplies a motive. Without direct evidence of instruction, attributing intent to a specific partner is still a claim, not a finding.',
  transfer:{question:'The trading register shows a family trust bought shares. Does that prove the partner ordered the forwarding?',choices:['Yes, motive is proof','No; it is a motive, and the instruction needs its own evidence'],correct:1,explanation:'Motive narrows the question. Only a record of instruction or action answers it.'},
  events:[
   {id:'solicitor',on:'start',when:{chose:'qp-exit:dismiss-noor'},from:"Noor Haddad's solicitor",subject:'Unfair dismissal',text:'We act for Ms Haddad. Her badge records place her outside the building at the time of the upload. Please preserve all relevant logs.'},
   {id:'look-deeper',on:'read:rule',chat:true,from:'Iva',text:'Created at 18:02 from HV-WS-0007. Same desk again. The image has more on it than the brief mentions. Good investigators look past the required files.'},
   {id:'motive',on:'read:trades',from:'Iva Marlow',subject:'Motive',text:'A family trust linked to the managing partner bought the target\'s shares twice before announcement. That is a motive. It is not yet proof.'},
   {id:'found-chat',on:'intel:callum-chat',chat:true,from:'Iva',text:'That is the instruction. Preserve it carefully. And think about who sees it next: Graham reports to Callum.'},
   {id:'callum-asks',on:'tick:9',chat:true,from:'Graham Holt',text:'Callum is asking me for an update. What do I tell him?'},
   {id:'gone',on:'action:confront-bea',from:'Iva Marlow',subject:'The chat cache is gone',text:'Bea cleared her synced profile within an hour of being confronted. Whatever was on that desktop about who asked her to do this, we will not see it now.'}]},
 {id:'qp-hold',scenario:'quiet-partner',title:'Monday',chapter:'FINALE',client:'Harrow & Vale LLP',minutes:'10-15',date:'2026-05-25T07:30:00',handler:'Iva',
  story:['Iva Marlow','Before nine','The announcement is at nine. The audit committee meets at eight. Build the hold package, check what actually left, and decide where it goes.'],
  summary:'The announcement is at nine. You have the evidence. Now decide who gets to see it.',
  brief:'Iva: Build the legal-hold package and check what the forwarded messages carried. Use solve <count> with the number of forwarded messages that contained Kestrel deal documents. Then choose who receives the package.',
  next:null,extension:false,initialScope:['hold','comms'],
  links:[{from:'hold',to:'comms',label:'Reporting route'}],
  nodes:[
   {id:'hold',label:'Legal hold vault',address:'203.0.113.30',role:'Preserved evidence',motd:MOTD,
    files:[
     record('package','/hold/manifest.txt','Legal hold manifest','Items: DLP-4471, sign-in log, device inventory, mailbox rule, forwarding statistics, pre-clearance register, HV-WS-0007 image (hash recorded).','07:20:00'),
     record('recipients','/hold/forward-analysis.txt','Forwarded content analysis','Of 57 forwarded messages, 23 carried Kestrel deal documents as attachments. The other 34 were calendar notices and meeting moves.','07:20:00')]},
   {id:'comms',label:'Compliance desk',address:'203.0.113.31',role:'Reporting duties and options',motd:MOTD,
    files:[
     record('policy','/policy/regulatory-reporting.txt','Reporting duty','Suspected insider dealing must be reported to the financial regulator through the compliance officer. The audit committee, not the managing partner, decides on internal discipline.','07:00:00'),
     record('options','/plans/response.txt','Delivery options','Option 1: deliver to the audit committee chair and compliance officer together.\nOption 2: deliver to the general counsel to manage.\nGeneral counsel reports to the managing partner.','07:00:00')]}],
  objectives:[{id:'scope',label:'Read the authorized scope',kind:'flag',value:'scope'},{id:'collect',label:'Preserve the manifest, analysis, duty and options',kind:'evidence',values:['package','recipients','policy','options']},{id:'deduce',label:'Count the deal documents that left',kind:'flag',value:'puzzle'},{id:'respond',label:'Deliver the package',kind:'responded'},{id:'verify',label:'Verify delivery and chain of custody',kind:'verified'},{id:'report',label:'Submit the final report',kind:'reported'}],
  actions:[
   {id:'audit-committee',label:'Deliver the hold package to the audit committee and compliance officer',node:'hold',required:['package','recipients','policy','options'],impact:'The package goes to the audit committee chair and the compliance officer under privilege. The general counsel is copied; the managing partner is not.',verify:'delivery acknowledged by both recipients; hashes match.',service:true,quality:20},
   {id:'via-graham',label:'Hand the package to the general counsel to manage',node:'hold',required:['package','recipients','policy','options'],impact:'Graham takes the package to Callum "for context" first. Two days pass before compliance sees it.',verify:'package delivered; chain of custody includes an unplanned review by the subject.',service:true,quality:8}],
  findings:[{id:'deal-docs-left',label:'23 messages carrying Kestrel deal documents left the firm through the rule, and the evidence must reach compliance independently'},{id:'nothing-left',label:'Only calendar notices were forwarded'},{id:'all-57',label:'All 57 forwarded messages contained deal documents'}],
  correctFinding:'deal-docs-left',requiredEvidence:['package','recipients','policy','options'],
  puzzle:{prompt:'How many forwarded messages carried Kestrel deal documents? Use solve <count>.',answers:['23'],requires:['recipients'],success:'Twenty-three. The other thirty-four were noise that made the rule look harmless at a glance.'},
  hints:['Read the analysis in the hold vault: not every forwarded message matters equally.','The reporting duty says who decides discipline. The options file says who the general counsel reports to.','Collect all four records, solve 23, ssh hold, respond audit-committee, verify.'],
  debrief:'Where evidence goes is part of the investigation. Delivering to the people with independent authority keeps the subject of an investigation away from the evidence about them. The scope of what left, 23 deal-document messages, is what the report must state, not the larger or smaller number.',
  transfer:{question:'Your client contact reports to the person the evidence implicates. Who should receive the package?',choices:['Your client contact, as usual','An independent body with authority, such as the audit committee and compliance'],correct:1,explanation:'Route evidence around conflicts of interest, and record why.'},
  events:[
   {id:'callum-call',on:'tick:5',chat:true,from:'Callum Vale',text:"Morning. Graham tells me you've been thorough. I'd appreciate seeing the package before the committee does. Just for context."},
   {id:'iva-warn',on:'read:options',chat:true,from:'Iva',text:'Graham reports to Callum. You know what Option 2 means.'},
   {id:'no-chat',on:'start',when:{notIntel:'callum-chat'},from:'Iva Marlow',subject:'What we can prove',text:'We can prove the rule, the saved login and the trades. We cannot prove who gave the instruction. Write the report to that line, not past it.'},
   {id:'delivered',on:'action:audit-committee',from:'Audit committee chair',subject:'Received',text:'Received and acknowledged. The committee will meet without the managing partner. Thank you for routing this correctly.'}]}
];
