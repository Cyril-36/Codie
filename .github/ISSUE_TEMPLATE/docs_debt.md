---
name: "Docs Debt"
about: "Auto-generated issue for missing or stale documentation/changelog"
title: "Docs Debt: [PR #{PR_NUMBER}]"
labels: ["docs-debt", "documentation"]
assignees: []
---

## Summary
CI detected missing or outdated documentation and/or changelog entries associated with PR #{PR_NUMBER}.

## Affected Paths (auto-detected)
- Code changes:
  - {CODE_PATHS}
- Missing/Outdated docs:
  - {DOC_PATHS_MISSING}
- Missing/Outdated changelogs:
  - {CHANGELOG_PATHS_MISSING}
- Related OpenAPI (if any):
  - {OPENAPI_FILES}

## Severity
- Level: {SEVERITY} (merge-blocking | release-blocking | advisory)
- Reason: {REASON}

## Required Actions
- [ ] Update docs at the missing paths listed above
- [ ] Update module CHANGELOG(s) and root CHANGELOG.md
- [ ] If API changed, regenerate OpenAPI and update docs/references
- [ ] Add screenshots/examples where applicable

## Quick Buttons
- [ ] Fixed—request recheck by CI
- [ ] N/A—false positive (explain below)
- [ ] Deferred—link follow-up tracking issue: #

## Links
- PR: #{PR_NUMBER}
- Commit(s): {COMMITS}
- Module owners: {OWNERS}

## Notes
Please push a commit that addresses the items above. CI will re-evaluate this issue on the next run. If this was generated in error, mark as N/A with justification.
