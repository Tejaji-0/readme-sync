# Contributing to readme-sync

Thank you for your interest in contributing to readme-sync! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and constructive in all interactions
- Focus on what is best for the community
- Give credit where it is due

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues. When reporting bugs, include:

- Node.js version (`node --version`)
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Sample markdown and source files

### Suggesting Features

Feature suggestions are welcome! Please:

- Check if the feature has already been suggested
- Provide a clear use case
- Explain why it would be useful

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test` and `npm run test:edge`)
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/readme-sync.git
cd readme-sync

# Run tests
npm test

# Run with verbose output
node bin/readme-sync.js --verbose

# Check if README is synced
npm run sync:check
```

## Testing

We have three levels of tests:

- **Unit tests**: `npm test` - Core functionality
- **Edge cases**: `npm run test:edge` - Boundary conditions
- **Integration**: Combined testing

## Code Style

- Zero external dependencies (core philosophy)
- Use native Node.js modules
- Follow existing patterns
- Add JSDoc comments for functions
- Keep functions small and focused

## Documentation

When adding features:

- Update README.md with usage examples
- Add to CLI help text if adding flags
- Update this guide if changing workflow

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
