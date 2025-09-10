# Contributing to Evolution API MCP Server

Thank you for your interest in contributing to the Evolution API MCP Server! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please read and follow these guidelines to ensure a welcoming environment for everyone.

### Our Standards

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be collaborative**: Work together and help each other
- **Be constructive**: Provide helpful feedback and suggestions
- **Be professional**: Maintain a professional tone in all interactions

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Spam or off-topic discussions
- Sharing private information without permission
- Any behavior that would be inappropriate in a professional setting

## Getting Started

### Prerequisites

Before contributing, make sure you have:

- Node.js 18+ installed
- Git installed and configured
- A GitHub account
- Basic knowledge of TypeScript/JavaScript
- Familiarity with the Evolution API
- Understanding of the MCP (Model Context Protocol)

### First Contribution

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/evolution-api-mcp.git
   cd evolution-api-mcp
   ```
3. **Set up the development environment** (see [Development Setup](#development-setup))
4. **Look for good first issues** labeled with `good-first-issue` or `help-wanted`
5. **Read the documentation** to understand the project structure

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Create a `.env` file for development:

```env
EVOLUTION_URL=http://localhost:8080
EVOLUTION_API_KEY=your-dev-api-key
LOG_LEVEL=debug
NODE_ENV=development
```

### 3. Build the Project

```bash
npm run build
```

### 4. Run Tests

```bash
npm test
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Verify Setup

Test that everything works:

```bash
# Validate configuration
npm run dev -- --validate-config

# Test connection (requires Evolution API running)
npm run dev -- --test-connection
```

## Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes**: Fix issues and improve stability
- **New features**: Add new functionality or tools
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Performance**: Optimize performance and efficiency
- **Refactoring**: Improve code quality and maintainability

### Before You Start

1. **Check existing issues** to see if your idea is already being worked on
2. **Create an issue** to discuss new features or major changes
3. **Get feedback** from maintainers before starting large changes
4. **Follow the coding standards** described below

### Coding Standards

#### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer `const` over `let`, avoid `var`
- Use async/await over Promises when possible

#### Code Style

```typescript
// Good
interface UserConfig {
  name: string;
  email: string;
  isActive: boolean;
}

class UserManager {
  private users: Map<string, UserConfig> = new Map();

  /**
   * Add a new user to the system
   * @param config User configuration
   * @returns Promise that resolves when user is added
   */
  async addUser(config: UserConfig): Promise<void> {
    if (!config.name || !config.email) {
      throw new Error('Name and email are required');
    }
    
    this.users.set(config.email, config);
  }
}
```

#### File Organization

- Keep files focused and single-purpose
- Use descriptive file names
- Group related functionality in directories
- Export only what's necessary
- Use barrel exports (`index.ts`) for clean imports

#### Error Handling

```typescript
// Good error handling
try {
  const result = await apiCall();
  return { success: true, data: result };
} catch (error) {
  logger.error('API call failed', { error: error.message });
  return { 
    success: false, 
    error: {
      type: 'API_ERROR',
      message: 'Failed to fetch data',
      details: error.message
    }
  };
}
```

### Git Workflow

#### Branch Naming

Use descriptive branch names:

- `feature/add-group-management`
- `fix/message-sending-timeout`
- `docs/update-api-reference`
- `refactor/http-client-structure`

#### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(messaging): add support for interactive buttons

fix(auth): handle expired API keys gracefully

docs(api): update webhook configuration examples

test(client): add integration tests for HTTP client
```

## Pull Request Process

### 1. Prepare Your Changes

- Ensure your code follows the coding standards
- Add or update tests for your changes
- Update documentation if needed
- Run the full test suite: `npm test`
- Build the project: `npm run build`

### 2. Create Pull Request

1. **Push your branch** to your fork
2. **Create a pull request** from your branch to `main`
3. **Fill out the PR template** completely
4. **Link related issues** using keywords like "Fixes #123"

### 3. PR Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] Tests pass locally
- [ ] Added new tests for changes
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)

## Related Issues
Fixes #(issue number)
```

### 4. Review Process

- **Automated checks** must pass (tests, linting, build)
- **Code review** by at least one maintainer
- **Address feedback** promptly and professionally
- **Squash commits** if requested before merging

## Issue Guidelines

### Reporting Bugs

Use the bug report template and include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment details** (OS, Node.js version, etc.)
- **Error messages** and stack traces
- **Configuration** (without sensitive data)

### Feature Requests

Use the feature request template and include:

- **Clear description** of the proposed feature
- **Use case** and motivation
- **Proposed implementation** (if you have ideas)
- **Alternatives considered**
- **Additional context** or examples

### Questions and Discussions

For questions:
- Check existing documentation first
- Search existing issues
- Use GitHub Discussions for general questions
- Be specific about what you're trying to achieve

## Development Workflow

### 1. Setting Up Your Environment

```bash
# Fork and clone the repository
git clone https://github.com/your-username/evolution-api-mcp.git
cd evolution-api-mcp

# Add upstream remote
git remote add upstream https://github.com/original-repo/evolution-api-mcp.git

# Install dependencies
npm install

# Create development branch
git checkout -b feature/your-feature-name
```

### 2. Making Changes

```bash
# Make your changes
# Add tests for your changes
# Update documentation if needed

# Run tests
npm test

# Run linting
npm run lint

# Build project
npm run build
```

### 3. Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Update main branch
git checkout main
git merge upstream/main

# Rebase your feature branch
git checkout feature/your-feature-name
git rebase main
```

### 4. Submitting Changes

```bash
# Push your branch
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## Testing

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
├── fixtures/      # Test data and fixtures
└── helpers/       # Test utilities
```

### Writing Tests

#### Unit Tests

```typescript
describe('HttpClient', () => {
  let client: HttpClient;
  
  beforeEach(() => {
    client = new HttpClient({
      baseUrl: 'https://api.example.com',
      apiKey: 'test-key'
    });
  });

  it('should make GET requests with proper headers', async () => {
    // Test implementation
  });

  it('should handle authentication errors', async () => {
    // Test implementation
  });
});
```

#### Integration Tests

```typescript
describe('Evolution API Integration', () => {
  let server: EvolutionMcpServer;
  
  beforeAll(async () => {
    server = new EvolutionMcpServer(testConfig);
    await server.initialize();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should create and connect instance', async () => {
    // Test implementation
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/http-client.test.ts

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Documentation

### Types of Documentation

1. **Code Documentation**: JSDoc comments for APIs
2. **User Documentation**: README, guides, examples
3. **Developer Documentation**: Contributing guide, architecture docs
4. **API Documentation**: Tool reference, configuration options

### Writing Documentation

#### Code Comments

```typescript
/**
 * Send a text message to a WhatsApp contact
 * 
 * @param instance - The WhatsApp instance name
 * @param number - Recipient phone number in international format
 * @param text - Message text content
 * @param options - Additional message options
 * @returns Promise that resolves with message result
 * 
 * @example
 * ```typescript
 * await sendTextMessage('my-bot', '5511999999999', 'Hello!');
 * ```
 */
async sendTextMessage(
  instance: string,
  number: string,
  text: string,
  options?: MessageOptions
): Promise<MessageResult> {
  // Implementation
}
```

#### User Documentation

- Use clear, concise language
- Include practical examples
- Provide step-by-step instructions
- Add troubleshooting information
- Keep documentation up to date

### Documentation Standards

- Use Markdown for all documentation
- Include code examples that work
- Add screenshots for UI-related docs
- Link between related documents
- Test documentation examples

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release notes
4. Tag the release
5. Publish to npm
6. Update documentation

## Getting Help

### Resources

- **Documentation**: Check the `/docs` directory
- **Examples**: See `/examples` directory
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions

### Contact

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: [maintainer-email] for security issues

### Community

- Be patient and respectful
- Help others when you can
- Share your experiences and use cases
- Contribute to discussions and reviews

## Recognition

Contributors are recognized in:

- `CONTRIBUTORS.md` file
- Release notes
- GitHub contributor graphs
- Special mentions for significant contributions

Thank you for contributing to the Evolution API MCP Server! Your contributions help make WhatsApp automation more accessible to everyone.

---

**Questions?** Don't hesitate to ask! We're here to help you contribute successfully.