# Roadmap

## Current Status: v1.0.0 ✅

- [x] Core sync functionality
- [x] Zero dependencies
- [x] Watch mode
- [x] CI/CD integration
- [x] Configuration files
- [x] 75+ language mappings
- [x] Atomic file writes
- [x] Interactive mode
- [x] Comprehensive test suite

## Short Term (v1.1.0)

- [ ] Binary diff mode for large files
  - Only rewrite changed portions
  - Reduce I/O for large files
- [ ] Merge conflict detection
  - Warn about conflicting edits during watch mode
  - Show diff of conflicts
- [ ] Remote file support
  - HTTP/HTTPS URLs in sync blocks
  - Cache remote files locally

## Medium Term (v1.2.0)

- [ ] Plugin architecture
  - Custom parsers for unusual formats
  - Transform hooks for content modification
- [ ] Template system
  - Predefined sync block templates
  - Integration with popular frameworks
- [ ] Language server protocol (LSP)
  - IDE autocomplete for sync blocks
  - Real-time validation
- [ ] Batch mode flags
  - Process multiple markdown files in one run
  - Recursive directory scanning

## Long Term (v2.0.0)

- [ ] Cross-language support
  - Port to other languages
  - Language-independent core
- [ ] Webhooks
  - Trigger external services on sync
  - Integration with CMS platforms
- [ ] GUI application
  - Desktop app with visual diff
  - Drag-and-drop interface
- [ ] Cloud sync
  - S3/GCS/Azure integration
  - CDN invalidation

## Under Consideration

- [ ] Git hooks package
- [ ] VS Code extension
- [ ] Pre-commit framework integration
- [ ] Docker image
- [ ] Homebrew/formula packages

## Community Wishlist

Vote on these features by opening an issue with 👍 reactions:

- [ ] Support for Jupyter notebooks
- [ ] Integration with Docusaurus
- [ ] PDF generation
- [ ] Multi-file concatenation
- [ ] Line-based selective sync

## Versioning Policy

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes to CLI interface
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, documentation updates

## Release Schedule

- v1.1.0 - Q2 2024 (estimated)
- v1.2.0 - Q3 2024 (estimated)
- v2.0.0 - Q4 2024 (estimated)

Dates are tentative and subject to change based on community needs and contributions.
