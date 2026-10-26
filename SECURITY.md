# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Considerations

### File System Access

`readme-sync` reads and writes files on your local system:

- **Read**: Source files referenced in sync blocks
- **Write**: The markdown file being synchronized

To minimize risk:
- Never run with elevated privileges unless necessary
- Verify source files before syncing
- Review changes before committing

### Path Resolution

Paths are resolved relative to the markdown file's directory. Absolute paths are supported but discouraged.

### Atomic Writes

File writes use atomic operations (write to temp, then rename) to prevent corruption if the process is interrupted.

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. Do **not** open a public issue
2. Email: security@example.com (replace with actual)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work to resolve the issue promptly.

## Security Best Practices

1. **Use in CI/CD**: Validate README sync in CI before merging
2. **Review changes**: Always review auto-generated changes
3. **Backup**: Keep backups of important documentation
4. **Permissions**: Limit write access to documentation files

## Dependency Security

This project has **zero external dependencies**, which minimizes supply chain attack vectors.

All functionality uses native Node.js modules:
- `fs` - File system operations
- `path` - Path handling
- `readline` - Interactive mode
- `perf_hooks` - Benchmarking
