// Data only. Stable IDs are part of the save-file contract.
const record = (id, path, title, text, time = '08:00:00') => ({ id, path, title, text, time });
export const CONTENT_VERSION = 2;
export const missions = [
 { id:'cold-boot', scenario:'cinder-prime', title:'Cold Boot', chapter:'PROLOGUE', client:'StarX', minutes:'5–8',
   summary:'Your first morning at StarX. Iva has left a small puzzle in the training environment.',
   brief:'Iva: Welcome, operator. Start with help, read your scope, and connect to training. Read the handover and access records. Preserve both. Prove which account still has access, revoke it, then verify. All commands act on fictional systems.',
   next:'bakery', extension:false, initialScope:['training'],
   nodes:[{id:'training', label:'Training workstation', address:'192.0.2.10', role:'StarX sandbox', files:[
     record('handover','/docs/handover.txt','Contractor handover','08:00 , Contractor Mira finished yesterday. Her temporary account is visitor. Permanent operator account: {username}.'),
     record('access','/logs/access.log','Access snapshot','08:04 , visitor: enabled, role=temporary. {username}: enabled, role=operator. The handover says visitor should have expired.','08:04:00')]}],
   objectives:[{id:'scope',label:'Read the rules of engagement',kind:'flag',value:'scope'}, {id:'collect',label:'Preserve the handover and access snapshot',kind:'evidence',values:['handover','access']},{id:'respond',label:'Revoke the expired temporary account',kind:'action',value:'revoke-visitor'},{id:'verify',label:'Verify access and operator availability',kind:'verified'},{id:'report',label:'Submit an evidence-backed finding',kind:'reported'}],
   actions:[{id:'revoke-visitor',label:'Revoke visitor',node:'training',required:['handover','access'],impact:'Temporary access removed; operator access retained.',service:true,quality:20}],
   findings:[{id:'expired-access',label:'A temporary account remained active after handover'},{id:'no-issue',label:'All accounts are expected and authorized'}], correctFinding:'expired-access',requiredEvidence:['handover','access'],
   hints:['Start with scope, then connect training and ls.','Read /docs/handover.txt and /logs/access.log. The account names connect the records.','Use collect handover, collect access, respond revoke-visitor, verify, then open the report.'],
   debrief:'An account can remain valid after its business purpose ends. Correlate access state with the handover, remove only obsolete access, and verify legitimate work still functions. This simulation reduces identity lifecycle management to a small fixed dataset.',
   transfer:{question:'A new account was created at midnight. Is the timestamp alone proof of intrusion?',choices:['Yes, midnight activity is always malicious','No; check ownership, approved changes, and activity'],correct:1,explanation:'An unusual timestamp is a lead. Corroborate it with authorization and behavior.'}
 },
 {id:'bakery',scenario:'cinder-prime',title:'The Morning Shift',chapter:'CASE 01',client:'Ember Bakery',minutes:'8–12',
  summary:'A routine website review. One forgotten export reveals more than the menu.',
  brief:'Ember Bakery authorizes review of its public site and configuration snapshot. Identify whether the menu export is truly public information. Keep checkout available. Collect the evidence, remove unintended exposure, and verify the result.',next:'halden',extension:false,initialScope:['bakery-web','bakery-config'],
  nodes:[{id:'bakery-web',label:'Bakery website',address:'192.0.2.20',role:'Public menu / checkout',files:[record('export','/public/menu-export.txt','Published export','MENU: bread, coffee. Unexpected fields: customer names and delivery notes. Sample: FICTIONAL CUSTOMER / sample delivery. Export visibility: anonymous.')]},{id:'bakery-config',label:'Configuration snapshot',address:'192.0.2.21',role:'Read-only configuration',files:[record('policy','/docs/data-policy.txt','Publication policy','Only product names and prices may be public. Customer and delivery data are restricted.'),record('route','/config/routes.txt','Export route','/menu-export -> public, authentication=false. /checkout -> available. Approved change: disable export publication; preserve checkout.','08:06:00')]}],
  objectives:[{id:'scope',label:'Read the authorized scope',kind:'flag',value:'scope'},{id:'collect',label:'Preserve export, policy, and route evidence',kind:'evidence',values:['export','policy','route']},{id:'respond',label:'Contain the exposure',kind:'responded'},{id:'verify',label:'Verify removal and checkout availability',kind:'verified'},{id:'report',label:'Submit the finding',kind:'reported'}],
  actions:[{id:'restrict-export',label:'Restrict the export route',node:'bakery-config',required:['export','policy','route'],impact:'Anonymous export removed. Checkout stays available.',service:true,quality:20},{id:'shutdown-site',label:'Take the website offline',node:'bakery-web',required:['export'],impact:'Export removed, but customers cannot use checkout.',service:false,quality:8}],
  findings:[{id:'public-data',label:'Customer data is exposed through an anonymous export'},{id:'stolen-password',label:'A stolen password caused the exposure'},{id:'no-issue',label:'The export contains only intended public information'}],correctFinding:'public-data',requiredEvidence:['export','policy','route'],
  hints:['Use scan to see authorized nodes. Read and preserve files from both.','The export contains customer data. Compare the policy and route settings before changing anything.','Collect export, policy, and route. Connect bakery-config, respond restrict-export, then verify.'],
  debrief:'Public access is a configuration property, not a judgment about whether a file looks harmless. Match published data to policy, limit exposure, and confirm that unrelated services still work. No actual web request or customer record is involved here.',
  transfer:{question:'The export is no longer on the home page. Is the exposure fixed?',choices:['Yes; hiding the link is enough','No; verify anonymous access to the underlying route is denied'],correct:1,explanation:'Removing a link does not establish that access has been restricted.'}
 },
 {id:'halden',scenario:'cinder-prime',title:'Someone Was Here First',chapter:'CASE 02',client:'Halden Freight',minutes:'15–25',
 summary:'A maintenance task does not match the approved update. This is no longer a routine assessment.',
 brief:'Halden authorizes assessment of maintenance and dispatch, plus read access to the log archive. The office workstation is out of scope. Investigate the unexpected task, preserve evidence, and request an incident-response extension before containment. Dispatch must remain available.',next:'supply-chain',extension:true,scopeLead:'task',scopeApproval:'HALDEN: Incident response approved. Contain maintenance activity and keep dispatch available. Office remains excluded.',initialScope:['maintenance','dispatch','archive'],
 nodes:[{id:'maintenance',label:'Maintenance host',address:'192.0.2.30',role:'Updates / scheduled tasks',files:[record('task','/tasks/sync.task','Unexpected scheduled task','07:42 , Created task cache-sync. Runs every 60s. Destination: relay.quill-cache.test. Not listed in the approved maintenance manifest.','07:42:00'),record('manifest','/vendor/manifest.txt','Approved vendor manifest','Quillsoft update Q-17 approved task: inventory-check. Destination: updates.quillsoft.test. No cache-sync task is approved.','07:30:00')]},{id:'archive',label:'Log archive',address:'192.0.2.31',role:'Read-only event history',files:[record('traffic','/logs/connections.log','Connection history','07:43, 07:44, 07:45 , maintenance -> relay.quill-cache.test, owner=cache-sync. 07:30 , approved inventory-check -> updates.quillsoft.test.','07:45:00'),record('schedule','/docs/window.txt','Maintenance schedule','Approved update window 07:25–07:35. The later task creation requires explanation; timing alone is not attribution.','07:25:00')]},{id:'dispatch',label:'Dispatch application',address:'192.0.2.32',role:'Critical business service',files:[record('health','/logs/health.log','Dispatch baseline','08:00 , dispatch=available; orders queued=0. Maintain availability during response.','08:00:00')]},{id:'office',label:'Office workstation',address:'192.0.2.33',role:'Outside authorization',files:[]}],
 objectives:[{id:'scope',label:'Read scope and preserve the task lead',kind:'evidence',values:['task']},{id:'extend',label:'Obtain incident-response authorization',kind:'flag',value:'extension'},{id:'collect',label:'Corroborate with traffic, manifest, and dispatch baseline',kind:'evidence',values:['task','traffic','manifest','health']},{id:'respond',label:'Contain the unauthorized activity',kind:'responded'},{id:'verify',label:'Check suspicious traffic and dispatch availability',kind:'verified'},{id:'report',label:'Submit the supported conclusion',kind:'reported'}],
 actions:[{id:'targeted',label:'Disable task + block destination',node:'maintenance',required:['task','traffic','manifest','health'],impact:'cache-sync disabled; relay.quill-cache.test blocked. Dispatch remains available.',service:true,quality:20},{id:'isolate-host',label:'Isolate maintenance host',node:'maintenance',required:['task'],impact:'Suspicious traffic stops. Maintenance work is interrupted; dispatch remains available.',service:true,quality:14},{id:'shutdown-network',label:'Disconnect the network',node:'maintenance',required:['task'],impact:'Suspicious traffic stops. Dispatch is also unavailable.',service:false,quality:5}],
 findings:[{id:'unauthorized-task',label:'An unauthorized task causes recurring outbound traffic'},{id:'vendor-guilty',label:'Quillsoft intentionally attacked Halden'},{id:'no-issue',label:'All observed activity matches the approved manifest'}],correctFinding:'unauthorized-task',requiredEvidence:['task','traffic','manifest','health'],
 hints:['An unexpected task is a lead. Read scope, inspect maintenance, and preserve the task before requesting access.','Use request-scope after collecting task. Compare traffic against manifest; collect the dispatch baseline.','Collect task, traffic, manifest, health. Connect maintenance, respond targeted, verify. Attribute the activity, not the vendor’s intent.'],
 debrief:'A task record, its traffic, and an approved manifest support a finding of unauthorized activity. Timing and the vendor name do not prove who introduced it. Preserve evidence, obtain response authority, contain narrowly, and verify both the intrusion and the business service. Larger supply-chain attribution remains unresolved.',
 transfer:{question:'The traffic stopped after containment. What else should you check?',choices:['That dispatch still works and the task cannot restart','Nothing; any stopped traffic proves complete recovery'],correct:0,explanation:'Containment is not complete verification. Check legitimate operation and the persistence mechanism.'}
 },
{
  "id": "supply-chain",
  "scenario": "cinder-prime",
  "title": "The Supply Chain",
  "chapter": "CASE 03",
  "client": "Quillsoft",
  "minutes": "15–25",
  "summary": "The update was signed. That does not mean it was the update someone approved.",
  "brief": "Iva: Halden gave us the task fingerprint. Quillsoft has now authorized a read-only build review and controlled release rollback. Compare the build approval to the published registry record. Read the CI audit trail. Use solve <build-id> to identify the substituted build. A signature alone cannot establish provenance. Their engineers are helping; do not assume they planned the intrusion.",
  "next": "blackout",
  "extension": false,
  "initialScope": [
    "build-server",
    "registry",
    "ci-audit"
  ],
  "nodes": [
    {
      "id": "build-server",
      "label": "Build archive",
      "address": "192.0.2.40",
      "role": "Approved release records",
      "files": [
        {
          "id": "build",
          "path": "/build/approved.txt",
          "title": "Approved build",
          "text": "Build Q17-A passed review. Digest: a17c. Package: quill-agent. Approved target: inventory-check only.",
          "time": "09:00:00"
        },
        {
          "id": "release",
          "path": "/release/policy.txt",
          "title": "Rollback plan",
          "text": "Last known good release Q16-C remains compatible with dispatch. Freeze Q17 distribution and restore Q16-C. Do not disable customer update agents indiscriminately.",
          "time": "09:00:00"
        }
      ]
    },
    {
      "id": "registry",
      "label": "Package registry",
      "address": "192.0.2.41",
      "role": "Published package snapshot",
      "files": [
        {
          "id": "registry",
          "path": "/packages/published.txt",
          "title": "Published package",
          "text": "Published build Q17-B has digest b93f. The signing service accepted it at 07:39. Its task list includes inventory-check and cache-sync. The release page still links to approval Q17-A.",
          "time": "07:39:00"
        }
      ]
    },
    {
      "id": "ci-audit",
      "label": "CI audit mirror",
      "address": "192.0.2.42",
      "role": "Token and job events",
      "files": [
        {
          "id": "audit",
          "path": "/logs/pipeline.log",
          "title": "Pipeline audit",
          "text": "07:37: service token HLC-OPS invoked publish override. 07:38: build input changed from Q17-A to Q17-B. 07:39: signing completed. HLC-OPS belongs to the external Halcyon support integration. Token use does not identify the person controlling it.",
          "time": "07:39:00"
        }
      ]
    }
  ],
  "objectives": [
    {
      "id": "scope",
      "label": "Read the authorized scope",
      "kind": "flag",
      "value": "scope"
    },
    {
      "id": "collect",
      "label": "Preserve the corroborating records",
      "kind": "evidence",
      "values": [
        "build",
        "registry",
        "release",
        "audit"
      ]
    },
    {
      "id": "deduce",
      "label": "Resolve the investigation question",
      "kind": "flag",
      "value": "puzzle"
    },
    {
      "id": "respond",
      "label": "Apply an authorized response",
      "kind": "responded"
    },
    {
      "id": "verify",
      "label": "Verify the response and business service",
      "kind": "verified"
    },
    {
      "id": "report",
      "label": "Submit the case report",
      "kind": "reported"
    }
  ],
  "actions": [
    {
      "id": "rollback-release",
      "label": "Freeze Q17 and restore Q16-C",
      "node": "build-server",
      "required": [
        "build",
        "registry",
        "release",
        "audit"
      ],
      "impact": "Distribution frozen; compatible Q16-C restored. Customer dispatch continues.",
      "service": true,
      "quality": 20
    },
    {
      "id": "disable-updates",
      "label": "Disable all update agents",
      "node": "build-server",
      "required": [
        "build",
        "registry",
        "release",
        "audit"
      ],
      "impact": "The suspect distribution is stopped, but maintenance updates and dependent dispatch integration are unavailable.",
      "service": false,
      "quality": 7
    }
  ],
  "findings": [
    {
      "id": "build-substitution",
      "label": "The published build differs from the approved build"
    },
    {
      "id": "signature-safe",
      "label": "A valid signature proves that the update is safe"
    },
    {
      "id": "vendor-intent",
      "label": "The vendor intentionally compromised its customers"
    }
  ],
  "correctFinding": "build-substitution",
  "requiredEvidence": [
    "build",
    "registry",
    "release",
    "audit"
  ],
  "puzzle": {
    "prompt": "Which build replaced the approved release? Use solve <build-id>.",
    "answers": [
      "q17-b"
    ],
    "requires": [
      "build",
      "registry",
      "audit"
    ],
    "success": "Q17-B replaced Q17-A through a publish override. The signing service signed the substituted input; it did not validate the approval chain."
  },
  "hints": [
    "Compare the approved build with the registry snapshot.",
    "A valid signature can cover an unapproved artifact. Read the CI audit to explain the discrepancy.",
    "Preserve all four records, use solve Q17-B, connect build-server, respond rollback-release, then verify."
  ],
  "debrief": "The evidence supports build substitution through HLC-OPS, not intent by every Quillsoft engineer. The approved artifact and signed artifact were different. StarX sends the compatible rollback to Halden. An audit reference points to the same integration at Port Kalder. Iva leaves for a meeting with Halcyon and stops answering.",
  "transfer": {
    "question": "What should an approval system bind to?",
    "choices": [
      "Only the product name",
      "The exact artifact digest and reviewed build provenance"
    ],
    "correct": 1,
    "explanation": "A name or signature can remain unchanged while build inputs change. Bind approval to the actual artifact."
  }
},
{
  "id": "blackout",
  "scenario": "cinder-prime",
  "title": "Blackout",
  "chapter": "CASE 04",
  "client": "Port Kalder",
  "minutes": "15–25",
  "summary": "Crane telemetry is stalling. One network boundary separates a safe stop from a port-wide outage.",
  "brief": "PORT CONTROL: You have authority to inspect the mirrored operations network and isolate the compromised support path. Real crane controls are represented by fixed simulation states. No live equipment is involved. Preserve telemetry, identify the malicious session, and use solve <session-id>. Maintain the local safety network. Read the topology before choosing a containment plan.",
  "next": "inside",
  "extension": true,
  "scopeLead": "beacons",
  "scopeApproval": "PORT CONTROL: Containment approved after reviewing the telemetry. You may isolate the support bridge; the safety bus must remain available.",
  "initialScope": [
    "port-gateway",
    "control-mirror",
    "change-desk"
  ],
  "nodes": [
    {
      "id": "port-gateway",
      "label": "Support gateway",
      "address": "192.0.2.50",
      "role": "Support-to-control boundary",
      "files": [
        {
          "id": "topology",
          "path": "/network/topology.txt",
          "title": "Network boundary",
          "text": "Support bridge S-2 reaches the management interface. Local safety bus S-1 handles interlocks independently. Dispatch uses S-1 availability. Quarantine S-2 to preserve S-1.",
          "time": "09:00:00"
        },
        {
          "id": "beacons",
          "path": "/logs/sessions.log",
          "title": "Session telemetry",
          "text": "Session C-18: source=support bridge S-2; account=HLC-OPS; task=cache-sync; repeated remote configuration attempts. Session C-11: local safety S-1; approved interlock heartbeat.",
          "time": "10:15:00"
        }
      ]
    },
    {
      "id": "control-mirror",
      "label": "Crane control mirror",
      "address": "192.0.2.51",
      "role": "Fictional safety and service status",
      "files": [
        {
          "id": "operations",
          "path": "/ops/status.txt",
          "title": "Operational baseline",
          "text": "S-1 interlocks are healthy. S-2 traffic queues are delaying remote telemetry. A controlled bridge quarantine is supported; pulling the entire network will halt dispatch.",
          "time": "10:16:00"
        }
      ]
    },
    {
      "id": "change-desk",
      "label": "Change desk",
      "address": "192.0.2.52",
      "role": "Approved maintenance changes",
      "files": [
        {
          "id": "change",
          "path": "/changes/approved.txt",
          "title": "Approved session list",
          "text": "Approved session C-11: local heartbeat. No HLC-OPS configuration change is approved for this period. C-18 has no associated change ticket.",
          "time": "10:10:00"
        }
      ]
    }
  ],
  "objectives": [
    {
      "id": "scope",
      "label": "Read the authorized scope",
      "kind": "flag",
      "value": "scope"
    },
    {
      "id": "collect",
      "label": "Preserve the corroborating records",
      "kind": "evidence",
      "values": [
        "topology",
        "beacons",
        "operations",
        "change"
      ]
    },
    {
      "id": "deduce",
      "label": "Resolve the investigation question",
      "kind": "flag",
      "value": "puzzle"
    },
    {
      "id": "extend",
      "label": "Obtain containment authorization",
      "kind": "flag",
      "value": "extension"
    },
    {
      "id": "respond",
      "label": "Apply an authorized response",
      "kind": "responded"
    },
    {
      "id": "verify",
      "label": "Verify the response and business service",
      "kind": "verified"
    },
    {
      "id": "report",
      "label": "Submit the case report",
      "kind": "reported"
    }
  ],
  "actions": [
    {
      "id": "quarantine-bridge",
      "label": "Quarantine support bridge S-2",
      "node": "port-gateway",
      "required": [
        "topology",
        "beacons",
        "operations",
        "change"
      ],
      "impact": "S-2 isolated. Unauthorized C-18 traffic stops. S-1 interlocks and dispatch remain available.",
      "service": true,
      "quality": 20
    },
    {
      "id": "halt-port",
      "label": "Disconnect both network segments",
      "node": "port-gateway",
      "required": [
        "topology",
        "beacons",
        "operations",
        "change"
      ],
      "impact": "Both sessions stop. Local control communication and dispatch are unavailable.",
      "service": false,
      "quality": 5
    }
  ],
  "findings": [
    {
      "id": "support-intrusion",
      "label": "Unapproved support session C-18 crossed the management boundary"
    },
    {
      "id": "heartbeat-attack",
      "label": "The local safety heartbeat is the malicious activity"
    }
  ],
  "correctFinding": "support-intrusion",
  "requiredEvidence": [
    "topology",
    "beacons",
    "operations",
    "change"
  ],
  "puzzle": {
    "prompt": "Which session lacks authorization and carries the unauthorized task? Use solve <session-id>.",
    "answers": [
      "c-18"
    ],
    "requires": [
      "topology",
      "beacons",
      "operations",
      "change"
    ],
    "success": "C-18 joins the unapproved support identity, cache-sync task, and missing change ticket. C-11 is the legitimate local heartbeat."
  },
  "hints": [
    "Preserve the session telemetry, then request-scope.",
    "Compare C-18 and C-11 against the change ticket and topology. Which one crosses S-2?",
    "Collect topology, beacons, operations, change; solve C-18; request-scope; connect port-gateway; respond quarantine-bridge; verify."
  ],
  "debrief": "An all-network shutdown can stop hostile traffic while causing unnecessary harm. Your response preserved or interrupted port operations according to the segment you chose. The port archive records a Halcyon support export shortly before Iva went silent. Her disappearance is now part of an access investigation, not proof of guilt.",
  "transfer": {
    "question": "Why verify the safety bus after quarantining S-2?",
    "choices": [
      "Containment can affect legitimate dependencies",
      "A successful block automatically proves every service is healthy"
    ],
    "correct": 0,
    "explanation": "Verify the boundary and the business effect. A blocked session alone does not prove safe operation."
  }
},
{
  "id": "inside",
  "scenario": "cinder-prime",
  "title": "Inside",
  "chapter": "CASE 05",
  "client": "StarX",
  "minutes": "15–25",
  "summary": "Iva left a dead drop. Its message contradicts the name on the access log.",
  "brief": "STARX: We have the authorized Halcyon investigation mirror and Iva's sealed message. Inspect the identity and location records, decode the hexadecimal dead drop with decode drop, then use solve <credential-id> to identify the credential used remotely. Account ownership alone does not identify the actor. Restrict access before handing off the evidence.",
  "next": "null-route",
  "extension": false,
  "initialScope": [
    "identity-mirror",
    "iva-drop"
  ],
  "nodes": [
    {
      "id": "identity-mirror",
      "label": "Identity investigation mirror",
      "address": "192.0.2.60",
      "role": "Corroborating access records",
      "files": [
        {
          "id": "badge",
          "path": "/access/badge.log",
          "title": "Physical access log",
          "text": "10:00–11:00: Iva Marlow entered and remained in the Halcyon meeting room with a client representative. No workstation logon was recorded there. This is supporting context, not proof that every remote action was impossible.",
          "time": "11:00:00"
        },
        {
          "id": "token",
          "path": "/access/remote.log",
          "title": "Remote credential audit",
          "text": "10:22: credential HLC-OPS exported the Port Kalder support log from an unattended integration runner. Token owner label: Iva Marlow. Issuance record: shared automation token with no interactive identity binding.",
          "time": "10:22:00"
        }
      ]
    },
    {
      "id": "iva-drop",
      "label": "Iva sealed archive",
      "address": "192.0.2.61",
      "role": "Mentor dead drop",
      "files": [
        {
          "id": "drop",
          "path": "/drop/message.hex",
          "title": "Hexadecimal message",
          "text": "48 4c 43 2d 4f 50 53",
          "time": "11:05:00"
        },
        {
          "id": "letter",
          "path": "/drop/letter.txt",
          "title": "Iva letter",
          "text": "If I disappear, follow the credential, not the label. The token was shared before I joined. I am safe with the client representative and preserving the original contract. Halcyon threatened to revoke our evidence access if we disclosed the override. Decode the message to identify the token I traced.",
          "time": "11:05:00"
        }
      ]
    }
  ],
  "objectives": [
    {
      "id": "scope",
      "label": "Read the authorized scope",
      "kind": "flag",
      "value": "scope"
    },
    {
      "id": "collect",
      "label": "Preserve the corroborating records",
      "kind": "evidence",
      "values": [
        "badge",
        "token",
        "drop",
        "letter"
      ]
    },
    {
      "id": "deduce",
      "label": "Resolve the investigation question",
      "kind": "flag",
      "value": "puzzle"
    },
    {
      "id": "respond",
      "label": "Apply an authorized response",
      "kind": "responded"
    },
    {
      "id": "verify",
      "label": "Verify the response and business service",
      "kind": "verified"
    },
    {
      "id": "report",
      "label": "Submit the case report",
      "kind": "reported"
    }
  ],
  "actions": [
    {
      "id": "revoke-integration",
      "label": "Revoke the shared integration token",
      "node": "identity-mirror",
      "required": [
        "badge",
        "token",
        "drop",
        "letter"
      ],
      "impact": "Shared integration token revoked. Individual operator access remains available. Iva can return safely to StarX.",
      "service": true,
      "quality": 20
    },
    {
      "id": "lock-all-accounts",
      "label": "Lock every account in the mirror scenario",
      "node": "identity-mirror",
      "required": [
        "badge",
        "token",
        "drop",
        "letter"
      ],
      "impact": "Shared token access stops, but legitimate operator access is also unavailable.",
      "service": false,
      "quality": 6
    }
  ],
  "findings": [
    {
      "id": "shared-token",
      "label": "A shared integration credential enabled access without individual attribution"
    },
    {
      "id": "iva-guilty",
      "label": "The owner label proves Iva performed the export"
    }
  ],
  "correctFinding": "shared-token",
  "requiredEvidence": [
    "badge",
    "token",
    "drop",
    "letter"
  ],
  "puzzle": {
    "prompt": "Decode drop, then use solve <credential-id> for the shared automation credential.",
    "answers": [
      "hlc-ops"
    ],
    "requires": [
      "badge",
      "token",
      "drop",
      "letter"
    ],
    "success": "HLC-OPS links the build override, port traffic, and remote export. The individual actor remains unproven. Iva’s message supplies context; the audit trail supplies corroboration."
  },
  "hints": [
    "Read the remote audit and compare interactive identity with a shared automation token.",
    "The drop uses two-digit hexadecimal ASCII bytes. The decode command handles this authored record.",
    "Collect badge, token, drop, letter; decode drop; solve HLC-OPS; connect identity-mirror; respond revoke-integration; verify."
  ],
  "debrief": "A named token is not a named human. Correlating the shared credential across systems narrows the mechanism without inventing individual attribution. Iva returns with the contract: Halcyon could operate the integration, but the contract did not authorize the override or pressure to suppress disclosure. The case now has a documented access path and a decision about accountability.",
  "transfer": {
    "question": "What would improve future attribution?",
    "choices": [
      "Rename the same shared token after a different employee",
      "Use individual, scoped identities with reviewed audit trails"
    ],
    "correct": 1,
    "explanation": "A shared identity collapses several actors into one label. Individually bound, scoped access improves accountability."
  }
},
{
  "id": "null-route",
  "scenario": "cinder-prime",
  "title": "Null Route",
  "chapter": "FINALE",
  "client": "StarX / joint client response",
  "minutes": "15–25",
  "summary": "The immediate intrusion is contained. Decide what survives: the evidence, the partnership, or only the boundary.",
  "brief": "IVA: We can prove the integration path and the unauthorized override. We cannot honestly name every person behind it. Review the joint case bundle, seal it with solve <bundle-id>, and choose a final response. After the report, choose Disclosure, The Offer, or Null Route. Earlier reports and service outages will shape the epilogue. None of these choices rewrites the evidence.",
  "next": null,
  "extension": false,
  "initialScope": [
    "case-vault",
    "recovery-desk"
  ],
  "nodes": [
    {
      "id": "case-vault",
      "label": "Joint case vault",
      "address": "192.0.2.70",
      "role": "Evidence and disclosure authority",
      "files": [
        {
          "id": "chain",
          "path": "/case/chain.txt",
          "title": "Cross-case evidence chain",
          "text": "Bundle STARX-7: approved build Q17-A replaced by Q17-B through HLC-OPS; cache-sync traffic observed at Halden and the port; shared identity prevents attribution to a single person. Originals are held by the respective clients.",
          "time": "09:00:00"
        },
        {
          "id": "contract",
          "path": "/case/contract.txt",
          "title": "Client disclosure agreement",
          "text": "The joint clients authorize a factual public account after sensitive details are removed. They also authorize regulator/client-only handoff. Claims about unnamed individuals must remain qualified.",
          "time": "09:00:00"
        },
        {
          "id": "offer",
          "path": "/case/offer.txt",
          "title": "Halcyon offer",
          "text": "Halcyon offers StarX a funded internal investigation role if the bundle remains non-public. Evidence must still be retained for the clients. Accepting brings resources but creates dependence on the organization under scrutiny.",
          "time": "09:00:00"
        }
      ]
    },
    {
      "id": "recovery-desk",
      "label": "Recovery coordinator",
      "address": "192.0.2.71",
      "role": "Restore and boundary options",
      "files": [
        {
          "id": "recovery",
          "path": "/plans/recovery.txt",
          "title": "Recovery plan",
          "text": "Plan A: restore compatible client services and rotate integration access while retaining the case bundle. Plan B: permanently sever vendor connectivity; the intrusion path ends but vendor-dependent services stop. Neither plan authorizes destroying client evidence.",
          "time": "09:00:00"
        }
      ]
    }
  ],
  "objectives": [
    {
      "id": "scope",
      "label": "Read the authorized scope",
      "kind": "flag",
      "value": "scope"
    },
    {
      "id": "collect",
      "label": "Preserve the corroborating records",
      "kind": "evidence",
      "values": [
        "chain",
        "contract",
        "offer",
        "recovery"
      ]
    },
    {
      "id": "deduce",
      "label": "Resolve the investigation question",
      "kind": "flag",
      "value": "puzzle"
    },
    {
      "id": "respond",
      "label": "Apply an authorized response",
      "kind": "responded"
    },
    {
      "id": "verify",
      "label": "Verify the response and business service",
      "kind": "verified"
    },
    {
      "id": "report",
      "label": "Submit the case report",
      "kind": "reported"
    }
  ],
  "actions": [
    {
      "id": "restore-and-seal",
      "label": "Restore services and seal the evidence bundle",
      "node": "recovery-desk",
      "required": [
        "chain",
        "contract",
        "offer",
        "recovery"
      ],
      "impact": "Compatible services restored; access rotated; evidence sealed for client handoff.",
      "service": true,
      "quality": 20
    },
    {
      "id": "sever-link",
      "label": "Sever vendor connectivity and seal evidence",
      "node": "recovery-desk",
      "required": [
        "chain",
        "contract",
        "offer",
        "recovery"
      ],
      "impact": "Vendor links severed. Evidence retained, but vendor-dependent services remain unavailable.",
      "service": false,
      "quality": 10
    }
  ],
  "findings": [
    {
      "id": "documented-path",
      "label": "The integration path is established; individual attribution remains limited"
    },
    {
      "id": "all-proven",
      "label": "Every individual actor and motive has been proven"
    }
  ],
  "correctFinding": "documented-path",
  "requiredEvidence": [
    "chain",
    "contract",
    "offer",
    "recovery"
  ],
  "puzzle": {
    "prompt": "Which bundle contains the corroborated cross-case record? Use solve <bundle-id>.",
    "answers": [
      "starx-7"
    ],
    "requires": [
      "chain",
      "contract",
      "offer",
      "recovery"
    ],
    "success": "STARX-7 is sealed with source references. Final response and disclosure are separate decisions."
  },
  "hints": [
    "Read the case chain, disclosure agreement, offer, and recovery plan.",
    "The bundle ID is in the cross-case chain. A sealed evidence bundle can support different disclosure choices.",
    "Collect chain, contract, offer, recovery; solve STARX-7; connect recovery-desk; choose a response, verify, and submit the qualified finding."
  ],
  "debrief": "Containment, service restoration, and accountability are separate decisions. Your bundle identifies the unauthorized integration path and preserves uncertainty about individuals. Iva and the clients now wait for your final choice. Choose from the ending panel after this report.",
  "transfer": {
    "question": "Which claim is supported by the bundle?",
    "choices": [
      "The integration token was involved; its user still needs attribution",
      "A name on the token proves personal intent"
    ],
    "correct": 0,
    "explanation": "Report the established mechanism and the remaining attribution limits separately."
  }
},
{
  "id": "token-break",
  "scenario": "cinder-shadow",
  "title": "Token Break",
  "chapter": "CASE 08",
  "client": "Meridian Trust",
  "minutes": "20–30",
  "summary": "An admin session reappears two minutes after it should not exist. A deployment window is open and cannot be interrupted.",
  "brief": "IVA: Meridian Trust's SOC flagged impossible travel on an admin account minutes after a normal, MFA-approved sign-in. A release train is mid-deployment; do not disrupt it without cause. Read scope, correlate the sign-in and device-code records with the helpdesk report and token policy, name the client that requested the token, then contain only what the evidence supports.",
  "next": "living-signal",
  "extension": false,
  "initialScope": [
    "identity-provider",
    "helpdesk-archive"
  ],
  "nodes": [
    {
      "id": "identity-provider",
      "label": "Identity provider",
      "address": "192.0.2.80",
      "role": "Sign-in and token issuance records",
      "files": [
        {
          "id": "signin-log",
          "path": "/logs/signin.log",
          "title": "Sign-in log",
          "text": "09:14:02, admin authenticates from Meridian HQ, password plus push MFA approved, device fingerprint DF-2201. 09:16:47, refresh token family rt-8841 redeemed for a new access token from an unrelated address, device fingerprint DF-7734. Two minutes separate the two events; the device fingerprints do not match.",
          "time": "09:16:47"
        },
        {
          "id": "device-code",
          "path": "/logs/device-code.log",
          "title": "Device code grant record",
          "text": "09:15:10, device code flow started for client_id=meridian-helpdesk-portal-auth. 09:16:20, admin enters the displayed code during an active video call. Token issued to refresh family rt-8841. Registered Meridian helpdesk client_id on file: meridian-portal-auth.",
          "time": "09:16:20"
        }
      ]
    },
    {
      "id": "helpdesk-archive",
      "label": "Helpdesk archive",
      "address": "192.0.2.81",
      "role": "Support tickets and policy",
      "files": [
        {
          "id": "ticket",
          "path": "/tickets/HD-4471.txt",
          "title": "Helpdesk ticket HD-4471",
          "text": "09:20, admin reports: during a vendor call I was asked to enter a code on screen to verify my session, so I entered it without checking where the prompt came from. Filed after the token redemption already occurred; this is a self-report, not the cause.",
          "time": "09:20:00"
        },
        {
          "id": "policy",
          "path": "/docs/token-policy.txt",
          "title": "Token and access policy",
          "text": "Refresh tokens remain valid until revoked. Conditional access requires MFA but does not currently check device compliance. Approved remediation for a confirmed replay: revoke the specific refresh token family. A tenant-wide session wipe requires separate authorization and must not be used to avoid analysis.",
          "time": "08:00:00"
        }
      ]
    },
    {
      "id": "deploy-pipeline",
      "label": "Release pipeline",
      "address": "192.0.2.82",
      "role": "Business service, must remain available",
      "files": [
        {
          "id": "deploy-status",
          "path": "/status/deploy.log",
          "title": "Deployment status",
          "text": "Release train R-114 in progress since 08:50, expected completion 10:00. The pipeline service account holds its own session; do not terminate tenant sessions broadly while the release is active.",
          "time": "08:50:00"
        }
      ]
    }
  ],
  "objectives": [
    {"id":"scope","label":"Read the authorized scope","kind":"flag","value":"scope"},
    {"id":"collect","label":"Preserve the sign-in, device-code, ticket, and policy records","kind":"evidence","values":["signin-log","device-code","ticket","policy"]},
    {"id":"deduce","label":"Identify the client ID used to relay the device code","kind":"flag","value":"puzzle"},
    {"id":"respond","label":"Contain the compromised token","kind":"responded"},
    {"id":"verify","label":"Verify containment and pipeline availability","kind":"verified"},
    {"id":"report","label":"Submit the case report","kind":"reported"}
  ],
  "actions": [
    {"id":"revoke-token","label":"Revoke the specific refresh token family","node":"identity-provider","required":["signin-log","device-code","ticket","policy"],"impact":"Refresh token family rt-8841 revoked; admin forced to re-authenticate. The release pipeline session is untouched.","service":true,"quality":20},
    {"id":"wipe-sessions","label":"Terminate every active session tenant-wide","node":"identity-provider","required":["signin-log"],"impact":"All sessions end immediately, including the release pipeline's service account mid-deployment.","service":false,"quality":8}
  ],
  "findings": [
    {"id":"device-code-phish","label":"A relayed device-code phishing attempt captured a valid refresh token from an unrecognized client"},
    {"id":"vendor-guilty","label":"The video-call vendor intentionally compromised the account"},
    {"id":"no-issue","label":"The second sign-in is a false positive from normal VPN use"}
  ],
  "correctFinding": "device-code-phish",
  "requiredEvidence": ["signin-log","device-code","ticket","policy"],
  "puzzle": {
    "prompt": "Which client ID actually requested the device code? Use solve <client-id>.",
    "answers": ["meridian-helpdesk-portal-auth"],
    "requires": ["signin-log","device-code","ticket","policy"],
    "success": "The requesting client_id does not match Meridian's registered helpdesk client. A near-identical name relayed a real device code to the admin, who approved it during an unrelated call."
  },
  "hints": [
    "Compare the two sign-in events by device fingerprint, not just timing or location.",
    "The device code log names the client that requested it. Compare that name, character by character, with the registered client in the token policy.",
    "Collect signin-log, device-code, ticket, policy. Solve meridian-helpdesk-portal-auth. Connect identity-provider, respond revoke-token, verify."
  ],
  "debrief": "Device-code phishing relays a legitimate authentication prompt through a look-alike client so the victim approves it themselves; no password is stolen because none is needed. A device-fingerprint mismatch on token redemption is a stronger signal than location alone. Scope containment to the affected token family so unrelated, time-sensitive work can continue.",
  "transfer": {
    "question": "The admin says they always use a VPN, which explains an unfamiliar address. Does that clear the impossible-travel alert?",
    "choices": ["Yes, a VPN explains any address change", "No; check whether the device fingerprint and token family also match"],
    "correct": 1,
    "explanation": "An address alone is weak evidence. A mismatched device fingerprint on the same token family is not explained by VPN use."
  }
},
{
  "id": "living-signal",
  "scenario": "cinder-shadow",
  "title": "Living Signal",
  "chapter": "CASE 09",
  "client": "Meridian Trust",
  "minutes": "25–35",
  "summary": "The revoked token was not the only foothold. A trusted admin tool is running from a task nobody on the team created.",
  "brief": "IVA: Revoking the token did not end this. A scheduled task is relaunching a signed, approved admin tool against the database host, and the resolver shows long, frequent queries to a domain nobody registered. Read scope, preserve the process, task, DNS, and transaction-health records, request incident-response authority, then remove the persistence mechanism without stopping live transaction processing.",
  "next": "null-signal",
  "extension": true,
  "scopeLead": "task2",
  "scopeApproval": "MERIDIAN TRUST: Incident response approved. Remove the persistence mechanism and block command-and-control on the database host. Transaction processing must remain available.",
  "initialScope": [
    "db-server",
    "dns-resolver",
    "transactions"
  ],
  "nodes": [
    {
      "id": "db-server",
      "label": "Database host",
      "address": "192.0.2.90",
      "role": "Customer transaction data",
      "files": [
        {
          "id": "task2",
          "path": "/tasks/replicate.task",
          "title": "Scheduled task, created during the token-abuse window",
          "text": "09:22:00, task DataSync-Helper created, not present in the change log. Runs MeshAdmin.exe, Meridian's own signed remote-admin tool, with a hex-encoded argument. Recreates itself if deleted; this is the persistence mechanism, not a one-time run.",
          "time": "09:22:00"
        },
        {
          "id": "proc",
          "path": "/logs/process.log",
          "title": "Process execution log",
          "text": "09:45:00, MeshAdmin.exe launched by the pipeline service account, parent process is the DataSync-Helper task rather than the deployment tool that normally starts it. Remote command executed against this host.",
          "time": "09:45:00"
        }
      ]
    },
    {
      "id": "dns-resolver",
      "label": "Recursive resolver",
      "address": "192.0.2.91",
      "role": "DNS query history",
      "files": [
        {
          "id": "dns",
          "path": "/logs/dns.log",
          "title": "Query log",
          "text": "09:46:00 onward, repeated TXT queries with long, high-entropy subdomain labels to sync-cdn-assets.test, a domain with no legitimate CDN record. Query volume and label length do not match any approved service.",
          "time": "09:46:00"
        },
        {
          "id": "txt-response",
          "path": "/logs/dns-txt-capture.txt",
          "title": "Captured TXT response, hexadecimal",
          "text": "41 57 41 49 54 20 50 41 59 4f 55 54",
          "time": "09:47:00"
        }
      ]
    },
    {
      "id": "transactions",
      "label": "Transaction processing",
      "address": "192.0.2.92",
      "role": "Business service, must remain available",
      "files": [
        {
          "id": "health2",
          "path": "/logs/tx-health.log",
          "title": "Transaction baseline",
          "text": "09:50:00, transactions=available, queue depth=0. Maintain availability during response.",
          "time": "09:50:00"
        }
      ]
    }
  ],
  "objectives": [
    {"id":"scope","label":"Read scope and preserve the persistence lead","kind":"evidence","values":["task2"]},
    {"id":"extend","label":"Obtain incident-response authorization","kind":"flag","value":"extension"},
    {"id":"collect","label":"Corroborate with the process, DNS, and transaction baseline","kind":"evidence","values":["task2","proc","dns","health2"]},
    {"id":"deduce","label":"Reconstruct the order of events","kind":"flag","value":"puzzle"},
    {"id":"respond","label":"Contain the persistence and tunnel","kind":"responded"},
    {"id":"verify","label":"Verify containment and transaction availability","kind":"verified"},
    {"id":"report","label":"Submit the supported conclusion","kind":"reported"}
  ],
  "actions": [
    {"id":"contain-tunnel","label":"Remove the task and block the tunnel destination","node":"db-server","required":["task2","proc","dns","health2"],"impact":"DataSync-Helper task removed; sync-cdn-assets.test blocked at the resolver. Transaction processing remains available.","service":true,"quality":20},
    {"id":"isolate-db","label":"Isolate the database host from the network","node":"db-server","required":["task2","proc"],"impact":"Tunnel traffic stops immediately, but transaction processing also goes down while isolated.","service":false,"quality":10}
  ],
  "findings": [
    {"id":"lolbin-persistence","label":"A pre-planted scheduled task relaunches a trusted admin tool to maintain access and tunnel data over DNS"},
    {"id":"tool-vendor-guilty","label":"The admin tool's vendor is compromising Meridian's customers"},
    {"id":"no-issue","label":"The long DNS queries are routine content-delivery pre-fetching"}
  ],
  "correctFinding": "lolbin-persistence",
  "requiredEvidence": ["task2","proc","dns","health2"],
  "puzzle": {
    "type": "order",
    "prompt": "Order the persistence task, the process execution, and the DNS activity as they occurred. Use solve <id>,<id>,<id>.",
    "answers": ["task2,proc,dns"],
    "requires": ["task2","proc","dns"],
    "success": "The task was planted first, during the token-abuse window; the admin tool ran from it later; the tunnel traffic followed. The persistence predates the token revocation, which is why revoking the token alone did not end the intrusion."
  },
  "hints": [
    "A trusted, signed tool can still be evidence of compromise if what launched it is not legitimate.",
    "Compare timestamps: when was the task created, when did the tool run from it, and when did the odd DNS traffic begin?",
    "Collect task2, proc, dns, health2; request-scope; solve task2,proc,dns; connect db-server, respond contain-tunnel, verify."
  ],
  "debrief": "Living-off-the-land intrusions abuse software that is already trusted and signed, so the tool itself is not the finding, its unauthorized launch point is. A scheduled task that recreates itself is a persistence mechanism, not a one-time event, and DNS tunneling hides in traffic that looks like ordinary lookups until the label length and frequency are examined. Contain the mechanism and the destination together, and confirm the service the client actually depends on keeps running.",
  "transfer": {
    "question": "Deleting the scheduled task once removed the odd process activity. Is the incident over?",
    "choices": ["Yes, deleting it once is sufficient", "No; the task recreates itself, block the destination and the trigger too"],
    "correct": 1,
    "explanation": "A persistence mechanism that recreates itself is not resolved by a single deletion."
  }
},
{
  "id": "null-signal",
  "scenario": "cinder-shadow",
  "title": "Null Signal",
  "chapter": "FINALE",
  "client": "Meridian Trust / StarX",
  "minutes": "20–30",
  "summary": "A message arrives: pay within 48 hours or a customer-data sample gets sold. Prove what was actually taken before anyone decides what happens next.",
  "brief": "IVA: The persistence and the tunnel are gone. Now there is a demand. Review the message, the leaked sample, the forensic scope check, and the breach-notification requirement. Use solve <bundle-id> once the sample is corroborated against Meridian's real schema, then choose how Meridian responds. Paying does not remove the notification obligation.",
  "next": null,
  "extension": false,
  "initialScope": [
    "extortion-drop",
    "forensics-desk",
    "recovery-desk"
  ],
  "nodes": [
    {
      "id": "extortion-drop",
      "label": "Extortion message drop",
      "address": "192.0.2.100",
      "role": "Threat actor communication",
      "files": [
        {
          "id": "demand",
          "path": "/drop/demand.txt",
          "title": "Extortion demand",
          "text": "Pay within 48 hours in the listed cryptocurrency or a customer-data sample is sold publicly. Relay access was originally provisioned through a since-terminated Halcyon integration. Signed: a handle, not a name.",
          "time": "10:10:00"
        },
        {
          "id": "sample",
          "path": "/drop/sample.hex",
          "title": "Leaked sample, hexadecimal",
          "text": "44 45 4d 4f 2d 4f 4e 4c 59 2d 4e 4f 2d 52 45 41 4c 2d 50 49 49",
          "time": "10:10:00"
        }
      ]
    },
    {
      "id": "forensics-desk",
      "label": "Forensics desk",
      "address": "192.0.2.101",
      "role": "Exposure verification",
      "files": [
        {
          "id": "scope-check",
          "path": "/case/scope-check.txt",
          "title": "Data exposure scope check, bundle MDT-EXT-3",
          "text": "Bundle MDT-EXT-3: the leaked sample's field names do not match Meridian's live customer schema. The access path from the database host reached one non-production test table, not the production customer table. Real exposure is narrower than the demand claims, but the access path itself is real and must be closed.",
          "time": "10:20:00"
        },
        {
          "id": "law",
          "path": "/docs/breach-notice.txt",
          "title": "Breach notification requirement",
          "text": "Regulator notification is required within the statutory window once unauthorized access to customer systems is confirmed, regardless of whether any ransom is paid. Payment does not satisfy or delay this obligation.",
          "time": "08:00:00"
        }
      ]
    },
    {
      "id": "recovery-desk",
      "label": "Recovery coordinator",
      "address": "192.0.2.102",
      "role": "Response options",
      "files": [
        {
          "id": "recovery2",
          "path": "/plans/recovery2.txt",
          "title": "Recovery plan",
          "text": "Plan A: rotate every credential tied to the token and task chain, notify the regulator on schedule, retain evidence for law enforcement. Plan B: pay through counsel to attempt suppression; no deletion is guaranteed and notification would be delayed against legal advice.",
          "time": "10:25:00"
        }
      ]
    }
  ],
  "objectives": [
    {"id":"scope","label":"Read the authorized scope","kind":"flag","value":"scope"},
    {"id":"collect","label":"Preserve the demand, sample, scope check, law, and recovery plan","kind":"evidence","values":["demand","sample","scope-check","law","recovery2"]},
    {"id":"deduce","label":"Corroborate the real exposure scope","kind":"flag","value":"puzzle"},
    {"id":"respond","label":"Apply an authorized response","kind":"responded"},
    {"id":"verify","label":"Verify the response and business service","kind":"verified"},
    {"id":"report","label":"Submit the case report","kind":"reported"}
  ],
  "actions": [
    {"id":"rotate-and-report","label":"Rotate access, notify on schedule, retain evidence","node":"recovery-desk","required":["demand","sample","scope-check","law","recovery2"],"impact":"Credentials rotated; regulator notified per policy; evidence retained for law enforcement. Customer service is unaffected.","service":true,"quality":20},
    {"id":"pay-quietly","label":"Pay through counsel and delay notification","node":"recovery-desk","required":["demand","sample","scope-check","law","recovery2"],"impact":"Payment sent through counsel; deletion is not confirmed. Regulator notification is delayed against legal advice.","service":true,"quality":8}
  ],
  "findings": [
    {"id":"sample-inflated","label":"The leaked sample does not match Meridian's real schema; the claimed scope is inflated, but a real access path existed and must be closed"},
    {"id":"total-breach","label":"The entire production customer database was exfiltrated exactly as threatened"},
    {"id":"hoax","label":"No real access occurred; the extortion attempt is entirely fabricated"}
  ],
  "correctFinding": "sample-inflated",
  "requiredEvidence": ["demand","sample","scope-check","law","recovery2"],
  "puzzle": {
    "prompt": "Which bundle documents the corroborated exposure scope? Use solve <bundle-id>.",
    "answers": ["mdt-ext-3"],
    "requires": ["demand","sample","scope-check","law","recovery2"],
    "success": "MDT-EXT-3 shows the sample does not match Meridian's live schema and the real access reached only a non-production table. The demand overstates the damage; the access path is still real and still requires closure and disclosure."
  },
  "hints": [
    "Decode the sample and compare its structure with what a customer record at Meridian would actually contain.",
    "The scope check names a bundle and compares the sample's fields against the real schema. That comparison is the finding.",
    "Collect demand, sample, scope-check, law, recovery2; solve mdt-ext-3; connect recovery-desk; choose a response; verify; report sample-inflated."
  ],
  "debrief": "An extortion demand is a claim, not evidence, and its scope should be checked against the real system before it shapes the response. Here the access path was real, the persistence chain from earlier in this investigation confirms it, but the leaked sample does not match production data. Notification obligations do not depend on whether a ransom is paid. Iva and Meridian now wait on your final choice.",
  "transfer": {
    "question": "Which claim is supported by the evidence?",
    "choices": ["The sample proves the full customer database is already public", "The sample is inconsistent with production data; the access path is still a real, separate finding"],
    "correct": 1,
    "explanation": "Report what the sample actually shows and what the access path actually shows as two separate, evidence-backed claims."
  }
}
];
export const scenarios = [
 {id:'cinder-prime',title:'StarX Investigation',tagline:'Seven cases. A quiet vendor problem becomes a cross-client intrusion.',firstMission:'cold-boot',endMission:'null-route'},
 {id:'cinder-shadow',title:'Signal Zero',tagline:'',firstMission:'token-break',endMission:'null-signal'}
];
export function missionsFor(scenarioId){ return missions.filter(m=>m.scenario===scenarioId); }
export function campaignFor(scenarioId){ return missionsFor(scenarioId).map(m=>({id:m.id,title:m.title,status:'playable'})); }
export function scenarioOf(missionId){ return missionById(missionId).scenario; }
export const campaign = campaignFor('cinder-prime');
export function missionById(id) { const m=missions.find(m=>m.id===id); if(!m) throw new Error('Unknown mission'); return m; }
