// Open Book: an exposed storage bucket, a responsible researcher, and a data broker. Data only; stable IDs are save contract.
const record=(id,path,title,text,time='10:05:00',extra={})=>({id,path,title,text,time,...extra});
const MOTD='NORTHFIELD UNIVERSITY . IT SERVICES\nUnauthorised access is an offence. Sessions are recorded.';
export const scenario={id:'open-book',title:'Open Book',tagline:'A stranger says your student records are public. He is right. He is not the only one who noticed.',
 setting:'Northfield University . Tuesday, 10:05',difficulty:'Introductory',firstMission:'ob-report',endMission:'ob-disclose',
 intro:[
  'Tuesday, 10:05. A forwarded email lands in the StarX queue with three words added on top: "Is this real?"',
  'The original is from Sam Okoro, an independent security researcher: "Your admissions export bucket is publicly listable. It contains applicant records. I am telling you first."',
  'Joss Mercer, StarX disclosure lead, takes the call with Northfield\'s data protection officer. "{username}, you\'ve got read access to their cloud console. Confirm it before anyone panics."',
  'Professor Helen Marsh, Dean of Admissions, is also on the line. "Can we ask this man to sign something and keep quiet? We have open days next month."',
  'Joss mutes the dean. "Rule one of disclosure: thank the person who told you. Rule two: find out who did not tell you."'
 ],
 epilogues:[
  {when:{chose:'ob-report:delete-bucket'},text:'Deleting the bucket in the first hour cost six days of access logs. The investigation reconstructed most of it from the nightly archive, but never all of it.'},
  {when:{chose:'ob-logs:blame-researcher'},text:'Sam Okoro was cleared within a week. He never reported a vulnerability to a university again, and he wrote about why.'},
  {when:{chose:'ob-logs:preserve-and-request'},text:"The broker's hosting provider honored the preservation request. The applicant list disappeared from the catalog four days later."},
  {when:{chose:'ob-disclose:soft-notice'},text:'The original letter told 18,904 applicants there was no evidence their data had been accessed. The access logs said otherwise, and the regulator read both.'},
  {when:{intel:'broker-listing'},text:'The broker catalog snapshot became the centerpiece of the regulator\'s inquiry into ListRight Data.'}
 ],
 coda:'Nobody broke into Northfield. A door was left open for a vendor demo and stayed open for ninety days. One person walked in and told you. Another walked in and sold what they found. You made the difference between them visible.'};
export const endings=[
 {id:'coordinated',title:'Coordinated Disclosure',summary:'Publish together with Sam on Friday, crediting his report and stating exactly what happened.',
  openingStrong:"Northfield and Sam publish on the same morning. The university's statement credits him by name and gives the real numbers. Applicants read it before the press does.",
  openingWeak:'Northfield publishes with Sam, but weak earlier findings leave the statement vague in places that journalists notice.',
  closing:'Northfield opens a vulnerability disclosure page the following month. Sam is the first name on its thank-you list.'},
 {id:'broker',title:'Follow the Money',summary:'Hand the broker evidence to the regulator and press for action against ListRight Data.',requires:{intel:'broker-listing'},requiresText:'Find the broker catalog that offered the applicant records.',
  openingStrong:'The regulator opens an inquiry into ListRight Data within a week, using the harvest logs and the catalog snapshot you preserved.',
  openingWeak:'The regulator opens an inquiry, but gaps in the case notes slow the evidence review.',
  closing:"Helen Marsh calls Joss to say the open days went fine. Then she asks whether other universities' buckets are listed in the same catalog. They are."},
 {id:'silence',title:'Quiet Patch',summary:'Ask Sam to stay silent and publish nothing beyond the regulator report.',
  openingStrong:'The regulator is told and the bucket is fixed. The public hears nothing. Sam keeps his word and his notes.',
  openingWeak:'The regulator is told. The public hears nothing, and the weak case file makes the silence harder to defend.',
  closing:'A year later, a journalist finds the ListRight catalog entry. The story is about Northfield, not the broker.'}
];
export const missions=[
 {id:'ob-report',scenario:'open-book',title:'Responsible Disclosure',chapter:'CHAPTER 1',client:'Northfield University',minutes:'8-12',date:'2026-09-08T10:05:00',handler:'Joss',
  story:['Joss Mercer','Is this real?','A researcher says Northfield\'s admissions exports are public. Confirm it from the console, find out how it happened, then close it without destroying the evidence.'],
  summary:'A researcher reports that applicant records are publicly readable. Confirm it, find the cause, and close it without destroying the evidence.',
  brief:'Joss: Scope covers the security inbox, the cloud storage console and the change ticket system. Confirm the exposure, find the change that caused it, and remove public access while keeping the access logs. Use solve <ticket> to name the change ticket.',
  next:'ob-logs',extension:false,initialScope:['secinbox','storage','tickets'],
  links:[{from:'secinbox',to:'storage',label:'Report concerns this bucket'},{from:'tickets',to:'storage',label:'Change applied here'}],
  nodes:[
   {id:'secinbox',label:'Security inbox',address:'192.0.2.120',role:'security@ mailbox (read-only)',motd:MOTD,
    files:[record('report','/inbox/okoro-report.txt','Report from Sam Okoro',"Bucket nfu-admissions-exports is publicly listable. It contains applicant exports with names, dates of birth and personal statements.\nI downloaded one file to confirm, then deleted it. I will wait 30 days before publishing anything.\nSam Okoro",'09:48:00')]},
   {id:'storage',label:'Cloud storage console',address:'192.0.2.121',role:'Object storage administration',motd:MOTD,ports:[['22','ssh','OpenSSH 9.6p1'],['443','https','storage API (simulated)']],
    files:[
     record('acl','/buckets/nfu-admissions-exports/policy.json','Bucket access policy','{"public_read": true, "listing": true, "changed_by": "d.patel", "changed_at": "2026-06-11T14:02Z", "ticket": "CHG-2210", "access_logging": true}','10:00:00'),
     record('objects','/buckets/nfu-admissions-exports/inventory.txt','Object inventory','412 files: applicant exports from 2024 to 2026. Largest: applicants_2026_full.csv (18,904 rows).','10:00:00')]},
   {id:'tickets',label:'Change tickets',address:'192.0.2.122',role:'IT change management',motd:MOTD,
    files:[record('chg','/changes/CHG-2210.txt','Change CHG-2210','Requested by D. Patel: make the export bucket public for one week so the CRM vendor can test an import.\nRevert task assigned to D. Patel, due 18 June.\nStatus: OPEN. Never closed.','2026-06-11')]}],
  objectives:[{id:'scope',label:'Read the rules of engagement',kind:'flag',value:'scope'},{id:'collect',label:'Preserve the report, policy, inventory and change ticket',kind:'evidence',values:['report','acl','objects','chg']},{id:'deduce',label:'Name the change that caused the exposure',kind:'flag',value:'puzzle'},{id:'respond',label:'Close the exposure',kind:'responded'},{id:'verify',label:'Verify public access is gone',kind:'verified'},{id:'report',label:'Submit the case report',kind:'reported'}],
  actions:[
   {id:'make-private',label:'Remove public access, keep the bucket and its access logs',node:'storage',required:['report','acl','objects','chg'],impact:'Public read and listing removed. Admissions staff and the CRM integration keep access through their own roles. Access logging stays on.',verify:'anonymous list and read now denied; logging active.',service:true,quality:20},
   {id:'delete-bucket',label:'Delete the bucket entirely',node:'storage',required:['acl'],impact:'The bucket and its recent access logs are deleted. The exposure ends, and so do six days of evidence about who downloaded what. The admissions CRM loses its import source.',service:false,quality:5}],
  findings:[{id:'misconfig',label:'An unreverted change left applicant records publicly readable for three months'},{id:'researcher-attack',label:'The researcher broke into the university'},{id:'no-exposure',label:'The bucket was never public'}],
  correctFinding:'misconfig',requiredEvidence:['report','acl','objects','chg'],
  puzzle:{prompt:'Which change ticket made the bucket public? Use solve <ticket>.',answers:['chg-2210'],requires:['acl','chg'],success:'CHG-2210. A one-week vendor test in June, never reverted. Ninety days of public access.'},
  hints:['Confirm the report against the bucket policy itself.','The policy names a ticket. Read it on the ticket system: find / -name "CHG-*".','Collect all four records, solve chg-2210, ssh storage, respond make-private, verify.'],
  debrief:'Most data exposures are configuration, not intrusion. The researcher\'s report was accurate and the change ticket explains the cause. Closing access while keeping the logs preserves the ability to answer the next question: who else saw it.',
  transfer:{question:'The quickest fix is deleting the bucket. Why not do that?',choices:['No reason; deletion is safest','Deletion destroys the access logs that show who else downloaded the data'],correct:1,explanation:'Close the exposure in a way that keeps the evidence needed for notification decisions.'},
  events:[
   {id:'dean-nda',on:'tick:5',chat:true,from:'Helen Marsh',text:'Can we ask him to sign a confidentiality agreement? We have open days next month.'},
   {id:'dev',on:'read:chg',chat:true,from:'Dev Patel',text:"That was me. The vendor test. I forgot to revert it. I'm so sorry. What do you need from me?"},
   {id:'joss-logs',on:'read:acl',chat:true,from:'Joss',text:'access_logging is true. Good. Whatever you do next, keep those logs.'},
   {id:'sam-confirm',on:'action:make-private',from:'Sam Okoro',subject:'Confirmed',text:'Bucket now returns access denied. Thank you for moving quickly. My 30 days still stand; I hope we can publish together.'},
   {id:'logs-gone',on:'action:delete-bucket',from:'Joss Mercer',subject:'The logs went with it',text:'The bucket is gone, and so are the last six days of access logs. We will have to work from the nightly archive. Next time, close the door; do not burn the house.'}]},
 {id:'ob-logs',scenario:'open-book',title:'Not the Only One',chapter:'CHAPTER 2',client:'Northfield University',minutes:'12-18',date:'2026-09-08T13:30:00',handler:'Joss',
  story:['Joss Mercer','Who else?','Sam says he downloaded one file. Logs will tell us whether that is true, and whether anyone else was in there. The log archive, an intel notebook and the data protection office are in scope.'],
  summary:'Sam says he took one file. The logs say someone else took everything.',
  brief:'Joss: Check the access logs against Sam\'s account and find any other downloads. Use solve <address> for the address that downloaded every file. Response actions need incident-response authority: preserve the access summary first, then request-scope.',
  next:'ob-disclose',extension:true,scopeLead:'access',scopeApproval:'NORTHFIELD UNIVERSITY (Data Protection Officer): Approved. Block the harvester address at the storage edge and send a preservation and takedown request.',initialScope:['logarchive','intel-notes','dpo'],
  links:[{from:'logarchive',to:'intel-notes',label:'Address enrichment'},{from:'intel-notes',to:'dpo',label:'Breach assessment'}],
  nodes:[
   {id:'logarchive',label:'Log archive',address:'192.0.2.130',role:'Nightly storage log exports',motd:MOTD,
    files:[
     record('access','/storage-logs/nfu-admissions-exports/summary.txt','Bucket access summary, June to September',"2026-08-29 198.51.100.201 GET applicants_2026_full.csv (1 object; matches Sam Okoro's report)\n2026-09-02 203.0.113.140 LIST, then GET of all 412 objects in 6 minutes, user-agent \"lr-harvester/2.3\"\nNo other anonymous reads recorded.",'13:20:00'),
     record('gap','/storage-logs/nfu-admissions-exports/gap-notice.txt','Log gap notice','The bucket was deleted on 8 September. Logs for 2 to 8 September were recovered from the nightly export; same-day entries may be missing.','13:20:00',{when:{chose:'ob-report:delete-bucket'}})]},
   {id:'intel-notes',label:'Threat intel notebook',address:'192.0.2.131',role:'StarX enrichment notes',motd:'STARX THREAT INTEL NOTEBOOK . TLP:AMBER',
    files:[
     record('ipinfo','/notes/203.0.113.140.txt','Address notes','203.0.113.140: small cloud provider. Reverse lookup: crawler-07.listright.example. The user-agent "lr-harvester" appears in public complaints about ListRight Data, a marketing list broker.','13:25:00'),
     record('listing','/notes/archive/listright-catalog-0906.txt','Broker catalog snapshot','ListRight Data catalog, 6 September: "University applicants 2026, 18,900 records, with personal statements." Priced per record. Seller notes: fresh harvest.','2026-09-06',{intel:'broker-listing'})]},
   {id:'dpo',label:'Data protection office',address:'192.0.2.132',role:'Breach assessment and response',motd:MOTD,
    files:[record('dpa','/guidance/breach-assessment.txt','Breach assessment guidance','A breach must be reported to the regulator within 72 hours of awareness when there is a risk to individuals. A confirmed bulk download by an unknown party is reportable. Affected individuals must be told when the risk is high.','13:00:00')]}],
  objectives:[{id:'scope',label:'Read scope and preserve the access summary',kind:'evidence',values:['access']},{id:'extend',label:'Obtain incident-response authority',kind:'flag',value:'extension'},{id:'collect',label:'Preserve the address notes and breach guidance',kind:'evidence',values:['access','ipinfo','dpa']},{id:'deduce',label:'Name the bulk downloader',kind:'flag',value:'puzzle'},{id:'respond',label:'Respond to the bulk download',kind:'responded'},{id:'verify',label:'Verify the block and the breach clock',kind:'verified'},{id:'report',label:'Submit the case report',kind:'reported'}],
  actions:[
   {id:'preserve-and-request',label:'Block the harvester, send a preservation and takedown request, start the 72-hour clock',node:'dpo',required:['access','ipinfo','dpa'],impact:"The harvester address is blocked. A preservation and takedown letter goes to the broker's hosting provider. The data protection officer starts the 72-hour clock.",verify:'harvester blocked; preservation request acknowledged; regulator deadline set.',service:true,quality:20},
   {id:'blame-researcher',label:'Report Sam Okoro to the police as the attacker',node:'dpo',required:['access'],impact:'The university reports Sam. Police find he downloaded one file and reported it responsibly. The real bulk download goes unaddressed for a week.',verify:'a complaint is filed against the wrong person; the harvester is not blocked.',service:true,quality:3}],
  findings:[{id:'bulk-harvest',label:'An automated crawler linked to a data broker downloaded every file; the researcher downloaded one, as he reported'},{id:'researcher-bulk',label:'Sam Okoro downloaded the whole bucket'},{id:'no-third-party',label:'Only the researcher accessed the data'}],
  correctFinding:'bulk-harvest',requiredEvidence:['access','ipinfo','dpa'],
  puzzle:{prompt:'Which address downloaded every file? Use solve <address>.',answers:['203.0.113.140'],requires:['access','ipinfo'],success:'203.0.113.140, a crawler tied to ListRight Data. Sam took one file, exactly as he said. Somebody else took all 412.'},
  hints:['Compare the access summary with what Sam said he did.','Enrich the address in the intel notebook. ls -R / there; older notes live in subfolders.','Collect access, request-scope, collect ipinfo and dpa, solve 203.0.113.140, ssh dpo, respond preserve-and-request.'],
  debrief:'Access logs separate the responsible reporter from the silent collector. A user-agent and reverse lookup tie the bulk download to a broker, which changes the risk to applicants and therefore the notification duty. Blaming the reporter wastes the time the logs gave you.',
  transfer:{question:'The researcher admits downloading one file. Should he be treated as the attacker?',choices:['Yes, he accessed the data','No; his access matches his report, while another party took everything silently'],correct:1,explanation:'Weigh access against intent and disclosure. The silent bulk download is the threat.'},
  events:[
   {id:'archive-saved',on:'start',when:{chose:'ob-report:delete-bucket'},from:'Joss Mercer',subject:'The nightly archive saved us, mostly',text:'The bucket deletion took recent logs with it, but the nightly export to the log archive survived. Same-day entries may be missing.'},
   {id:'truth',on:'read:access',chat:true,from:'Joss',text:'He told the truth. One file. Someone else took all 412.'},
   {id:'vc',on:'tick:7',chat:true,from:'Helen Marsh',text:'The Vice-Chancellor wants to know if this will be in the papers.'},
   {id:'sam-broker',on:'intel:broker-listing',chat:true,from:'Sam Okoro',text:"Someone is selling it? Then I can't wait thirty days. Your call what happens next, but it has to be soon."},
   {id:'cleared',on:'action:blame-researcher',from:'Joss Mercer',subject:'We reported the wrong person',text:'Police spoke to Sam this afternoon. His one download matches his report exactly. Meanwhile the crawler address is still unblocked. This has cost us a week and a lot of trust.'}]},
 {id:'ob-disclose',scenario:'open-book',title:'Open Book',chapter:'FINALE',client:'Northfield University',minutes:'10-15',date:'2026-09-10T09:00:00',handler:'Joss',
  story:['Joss Mercer','The letter','The regulator deadline is Thursday at two. The dean\'s office has drafted a letter to applicants. Read it before it goes anywhere.'],
  summary:"The regulator deadline is tomorrow. The dean's draft letter says something the logs contradict.",
  brief:'Joss: Check the draft letter against the facts, count who must be told (solve <count>), and send the notice. Sam publishes on Friday either way.',
  next:null,extension:false,initialScope:['dpo-desk','comms-office'],
  links:[{from:'dpo-desk',to:'comms-office',label:'Notice and statement'}],
  nodes:[
   {id:'dpo-desk',label:'Data protection desk',address:'192.0.2.140',role:'Notification drafting',motd:MOTD,
    files:[
     record('draft','/drafts/applicant-letter-v1.txt',"Draft applicant letter (Dean's office)",'Dear applicant, we recently became aware of a configuration issue. We have no evidence that your information was accessed by anyone. No action is needed.','08:40:00'),
     record('affected','/data/affected-count.txt','Affected applicant count','Unique applicants across all 412 files after de-duplication: 18,904.','08:30:00')]},
   {id:'comms-office',label:'Communications office',address:'192.0.2.141',role:'Press and deadlines',motd:MOTD,
    files:[
     record('sam-post','/monitoring/okoro-draft-post.txt',"Sam Okoro's draft post (shared with you)","I will publish on Friday. I would like to say the university handled this well. Whether I can is up to them.",'08:00:00'),
     record('regulator','/deadlines/regulator.txt','Regulator deadline','Report due Thursday 14:00. Late reports must explain the delay.','08:00:00')]}],
  objectives:[{id:'scope',label:'Read the authorized scope',kind:'flag',value:'scope'},{id:'collect',label:'Preserve the draft, count, post and deadline',kind:'evidence',values:['draft','affected','sam-post','regulator']},{id:'deduce',label:'Count who must be told',kind:'flag',value:'puzzle'},{id:'respond',label:'Send the notice',kind:'responded'},{id:'verify',label:'Verify the notice and regulator report',kind:'verified'},{id:'report',label:'Submit the final report',kind:'reported'}],
  actions:[
   {id:'honest-notice',label:'Correct the letter, notify all 18,904 applicants and the regulator on time',node:'dpo-desk',required:['draft','affected','regulator'],impact:'The corrected letter goes out: what happened, what was taken, what applicants should watch for. The regulator receives the report before the deadline.',verify:'18,904 notices sent; regulator report filed on time.',service:true,quality:20},
   {id:'soft-notice',label:"Send the dean's original letter",node:'dpo-desk',required:['draft','affected','regulator'],impact:'Applicants receive a letter saying there is no evidence their data was accessed. The logs say otherwise.',verify:'notices sent; content contradicts the preserved access logs.',service:true,quality:5}],
  findings:[{id:'notify-all',label:'All 18,904 applicants were exposed to a confirmed bulk download and must be told accurately'},{id:'no-notice',label:'No notification is needed because the bucket is now private'},{id:'researcher-only',label:'Only applicants in the one file Sam downloaded need to be told'}],
  correctFinding:'notify-all',requiredEvidence:['draft','affected','sam-post','regulator'],
  puzzle:{prompt:'How many applicants must be notified? Use solve <count>.',answers:['18904','18,904'],requires:['affected','draft'],success:'18,904. Every applicant in the harvested files. The draft letter is wrong on its central claim and has to change.'},
  hints:['Read the draft letter and compare its main claim with what you found in chapter 2.','The affected count is in the data protection desk. wc and grep help you check both files.','Collect all four records, solve 18904, ssh dpo-desk, respond honest-notice, verify.'],
  debrief:'Notification letters are evidence too. A letter that says "no evidence of access" when the logs show a bulk download is a second failure on top of the first. Accurate numbers, clear advice and an on-time regulator report are what the people affected are owed.',
  transfer:{question:'The draft letter says there is no evidence of access. What do you do?',choices:['Send it; it reassures people','Correct it to match the logs before it goes out'],correct:1,explanation:'Public statements must match the evidence you hold.'},
  events:[
   {id:'dean-plea',on:'read:draft',chat:true,from:'Helen Marsh',text:'Our lawyers prefer that wording. Is "no evidence" really so wrong?'},
   {id:'joss-answer',on:'tick:6',chat:true,from:'Joss',text:"\"No evidence\" is only true if you haven't looked. We looked."},
   {id:'dev-apology',on:'start',chat:true,from:'Dev Patel',text:"I've added a revert check to every temporary change ticket. It won't undo this, but it won't happen this way again."},
   {id:'sam-final',on:'action:honest-notice',from:'Sam Okoro',subject:'Friday',text:'I read the letter. It is honest. I will say so on Friday.'}]}
];
