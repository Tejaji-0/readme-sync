# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Interactive mode (-i, --interactive) for selective sync
- Glob pattern support for file matching
- Performance benchmarks
- Edge case test suite (10 additional tests)
- Documentation generation script
- Comprehensive CONTRIBUTING.md guide

## [1.0.0] - 2024-01-15

### Added
- Core synchronization functionality
- Zero dependency architecture
- Automatic language detection (40+ languages)
- CI/CD check mode (-c, --check)
- Watch mode (-w, --watch) with auto-sync
- Verbose and silent output modes
- Configuration file support (.readme-sync.json)
- Atomic file writes to prevent corruption
- Clear error messages with line numbers
- GitHub Actions workflow integration
- Pre-commit hook example
- Comprehensive test suite (34 tests)
- MIT License

### Features
- Sync code snippets from source files to markdown
- Detect file extensions and set appropriate code fences
- Handle multiple sync blocks in single README
- Report dangling/unclosed tags with line numbers
- Dry-run validation for CI/CD pipelines
- Cross-platform path handling

## Future Roadmap

### Planned
- [ ] Binary diff mode for large files
- [ ] Merge conflict detection
- [ ] Plugin architecture
- [ ] Language server integration

### Under Consideration
- [ ] GUI/TUI interface improvements
- [ ] Remote file support (HTTP/HTTPS)
- [ ] Template system for common patterns
- [ ] Webhook integration
