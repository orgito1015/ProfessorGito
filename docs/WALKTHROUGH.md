# Walkthrough , spoilers

Commands run one at a time. The interface uses fictional hosts only.

## Cold Boot

```text
scope
connect training
cat /docs/handover.txt
collect handover
cat /logs/access.log
collect access
respond revoke-visitor
verify
report
```

Select the temporary-account finding. Cite both records and acknowledge uncertainty. Submit; continue to the Bakery.

## The Morning Shift

```text
scope
connect bakery-web
cat /public/menu-export.txt
collect export
connect bakery-config
cat /docs/data-policy.txt
collect policy
cat /config/routes.txt
collect route
respond restrict-export
verify
report
```

Select the anonymous-export finding; cite all three records. Full website shutdown is an alternative with a lower response/availability score.

## Someone Was Here First

```text
scope
connect maintenance
cat /tasks/sync.task
collect task
request-scope
cat /vendor/manifest.txt
collect manifest
connect archive
cat /logs/connections.log
collect traffic
cat /docs/window.txt
collect schedule
connect dispatch
cat /logs/health.log
collect health
connect maintenance
respond targeted
verify
report
```

Select unauthorized task/recurring traffic. Cite task, manifest, traffic, and health; schedule is optional context. Acknowledge uncertain attribution. Starting with archive traffic also works; scope extension still requires preserving the task.

`respond isolate-host` and `respond shutdown-network` are alternate responses. Retry the case from the report screen to compare consequences. The latter stops dispatch and reduces the score.


## The Supply Chain

```text
scope
connect build-server
cat /build/approved.txt
collect build
cat /release/policy.txt
collect release
connect registry
cat /packages/published.txt
collect registry
connect ci-audit
cat /logs/pipeline.log
collect audit
solve Q17-B
connect build-server
respond rollback-release
verify
report
```

Select the build-substitution finding, cite all four records, and qualify attribution. The signature covered the published artifact; it did not prove review of that artifact.

## Blackout

```text
scope
connect port-gateway
cat /network/topology.txt
collect topology
cat /logs/sessions.log
collect beacons
request-scope
connect control-mirror
cat /ops/status.txt
collect operations
connect change-desk
cat /changes/approved.txt
collect change
solve C-18
connect port-gateway
respond quarantine-bridge
verify
report
```

Select the unauthorized support-session finding and cite all four records. Quarantining S-2 preserves S-1; halting the whole port harms service availability.

## Inside

```text
scope
connect identity-mirror
cat /access/badge.log
collect badge
cat /access/remote.log
collect token
connect iva-drop
cat /drop/message.hex
collect drop
decode drop
cat /drop/letter.txt
collect letter
solve HLC-OPS
connect identity-mirror
respond revoke-integration
verify
report
```

Select the shared-credential finding. The audit's owner label alone does not prove Iva used the token. Cite all four records and preserve uncertainty.

## Null Route and endings

```text
scope
connect case-vault
cat /case/chain.txt
collect chain
cat /case/contract.txt
collect contract
cat /case/offer.txt
collect offer
connect recovery-desk
cat /plans/recovery.txt
collect recovery
solve CINDER-7
respond restore-and-seal
verify
report
```

Select the established-path/limited-attribution finding. Cite all four records and qualify the conclusion. After submitting, choose Disclosure, The Offer, or Null Route in the report panel. Every earlier case must be completed. The ending saves with your campaign.

All three choices are available after legitimate campaign progression. Their epilogues use average recorded report score and service interruption history. Legacy completed cases from old saves without scores are excluded from those averages. Replay the finale to choose another ending, or use New Campaign to start over.


## Optional Practice solutions

- Cold Boot: permanent operator access is expected; expired visitor access needs review.
- Bakery: export_visibility and export_auth changed.
- Halden: approval, task, beacon, health.
- Supply Chain: build, digest, and task changed; package did not.
- Blackout: C-11 expected, C-18 review.
- Inside: token use supported; individual attribution unproven; shared identity supported.
- Finale: preserve, review, release.

Practice completion is independent of the report score. Before trying a different response, use the automatic checkpoint from the Checkpoints dialog. Named checkpoints can be exported individually for backup.
