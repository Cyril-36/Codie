# Changelog (Root)

All notable changes to this project will be documented in this file. The format is based on Keep a Changelog and this project adheres to Semantic Versioning. Entries use Conventional Commits.

## [Unreleased]
### Added
- Monorepo bootstrap with governance files:
  - README, LICENSE, .editorconfig, .gitignore, CODEOWNERS
  - .github/pull_request_template.md
  - .github/ISSUE_TEMPLATE/docs_debt.md
- Documentation scaffold:
  - docs/getting-started.md
  - docs/architecture/system-architecture.md
  - docs/prd/product-vision.md
  - docs/roadmap/roadmap-phases.md
  - docs/CHANGELOG.md
- Planning: roadmap with explicit docs/changelog steps and CI gates

### Security
- Security baseline documented (sandboxed runtime, SBOM/scans, LLM redaction)
- CODEOWNERS to ensure reviews on sensitive paths

## [0.1.0] - 2025-08-01
### Added
- Initial repository setup and documentation structure
