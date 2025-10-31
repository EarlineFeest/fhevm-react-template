# Contributing to FHEVM Universal Template

Thank you for your interest in contributing to the FHEVM Universal Template!

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request:

1. Check if the issue already exists
2. Create a new issue with a clear description
3. Include steps to reproduce (for bugs)
4. Include expected vs actual behavior

### Submitting Changes

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Test your changes thoroughly
5. Commit with clear messages (`git commit -m 'Add feature X'`)
6. Push to your fork (`git push origin feature/your-feature`)
7. Create a Pull Request

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Write tests for new features

### Testing

Before submitting:

```bash
# Test SDK
cd packages/fhevm-sdk
npm test

# Test examples
cd examples/nextjs-app
npm run build

cd ../nodejs-app
npm start
```

### Documentation

- Update README files for significant changes
- Add JSDoc comments for public APIs
- Include usage examples for new features

## Development Setup

```bash
# Clone repository
git clone <repository-url>
cd fhevm-react-template

# Install dependencies
npm run install:all

# Build SDK
npm run build

# Run tests
npm test
```

## Project Structure

```
├── packages/fhevm-sdk/     # Main SDK package
├── examples/               # Example applications
├── docs/                   # Documentation
└── tests/                  # Test files
```

## Areas for Contribution

- **SDK Features**: Add new encryption types, utilities
- **Framework Adapters**: Vue, Svelte, Angular support
- **Examples**: More real-world use cases
- **Documentation**: Tutorials, guides, API docs
- **Testing**: Unit tests, integration tests
- **Performance**: Optimization, caching

## Questions?

Feel free to open an issue for discussion!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
