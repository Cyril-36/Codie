# Contributing to Codie

We love your input! We want to make contributing to Codie as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### We Use [Github Flow](https://guides.github.com/introduction/flow/index.html)

All code changes happen through pull requests. Pull requests are the best way to propose changes to the codebase:

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- pnpm 8+
- Docker and Docker Compose
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/codie.git
   cd codie
   ```

2. **Install dependencies**
   ```bash
   make install
   ```

3. **Set up environment variables**
   ```bash
   cp config/environments/env.example config/environments/.env.development
   # Edit the .env.development file with your local settings
   ```

4. **Start development environment**
   ```bash
   make dev
   ```

5. **Verify installation**
   - Backend: http://localhost:8000
   - Frontend: http://localhost:5173
   - API Docs: http://localhost:8000/docs

### Project Structure

Please familiarize yourself with our [Project Structure](PROJECT_STRUCTURE.md) before contributing.

## Contribution Guidelines

### Code Style

#### Python (Backend)
- We use [Black](https://black.readthedocs.io/) for code formatting
- [isort](https://pycqa.github.io/isort/) for import sorting
- [Ruff](https://docs.astral.sh/ruff/) for linting
- [MyPy](https://mypy.readthedocs.io/) for type checking
- Line length: 88 characters

#### TypeScript/JavaScript (Frontend)
- We use [Prettier](https://prettier.io/) for code formatting
- [ESLint](https://eslint.org/) for linting
- Follow [React best practices](https://react.dev/learn)
- Line length: 80 characters

#### Running Code Quality Checks

```bash
# Run all quality checks
make lint

# Fix auto-fixable issues
make format

# Type checking
make type-check
```

### Testing

#### Backend Testing
```bash
# Run all backend tests
make test-backend

# Run specific test
cd src/backend && pytest tests/test_specific.py

# Run with coverage
make test-backend-coverage
```

#### Frontend Testing
```bash
# Run all frontend tests
make test-frontend

# Run unit tests
cd src/frontend && pnpm test:unit

# Run E2E tests
cd src/frontend && pnpm test:e2e

# Run accessibility tests
cd src/frontend && pnpm test:accessibility
```

### Documentation

- Update documentation for any new features or API changes
- Use clear, concise language
- Include code examples where appropriate
- Update API documentation in `/docs/api/`

### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

#### Examples
```
feat(api): add user authentication endpoint
fix(frontend): resolve navigation bar styling issue
docs(readme): update installation instructions
test(backend): add unit tests for user service
```

## Pull Request Process

1. **Update the documentation** if you're changing functionality
2. **Add tests** for new features or bug fixes
3. **Ensure all tests pass** and code quality checks pass
4. **Update the changelog** if your change is user-facing
5. **Request review** from maintainers
6. **Address feedback** promptly and professionally

### Pull Request Template

When creating a pull request, please use this template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated and passing
- [ ] No breaking changes (or properly documented)
```

## Reporting Bugs

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) when creating bug reports.

## Feature Requests

We welcome feature requests! Please use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) and:

- Explain the problem you're trying to solve
- Describe the solution you'd like
- Describe alternatives you've considered
- Include any additional context

## Community

### Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community discussion
- **Discord**: Real-time chat (invite link in README)
- **Email**: cyrilchaitanya@gmail.com for security issues

## Recognition

Contributors who make significant contributions will be:
- Added to the AUTHORS file
- Mentioned in release notes
- Invited to join the maintainers team (for long-term contributors)

## Development Resources

### Useful Commands

```bash
# Development
make dev                    # Start development environment
make dev-backend           # Start only backend
make dev-frontend          # Start only frontend

# Testing
make test                  # Run all tests
make test-backend          # Backend tests only
make test-frontend         # Frontend tests only
make test-e2e             # End-to-end tests

# Quality
make lint                  # Run all linters
make format               # Format all code
make type-check           # Type checking
make security-check       # Security scanning

# Database
make db-migrate           # Run database migrations
make db-seed              # Seed database with test data
make db-reset             # Reset database

# Deployment
make build                # Build for production
make deploy-staging       # Deploy to staging
make deploy-prod          # Deploy to production
```

### Architecture Documentation

- [Backend Architecture](docs/backend/README.md)
- [Frontend Architecture](docs/frontend/README.md)
- [API Documentation](docs/api/README.md)
- [Database Schema](docs/backend/DATABASE_FIX_SUMMARY.md)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Questions?

Don't hesitate to ask! Create an issue with the "question" label, or reach out on our community channels.

Thank you for contributing to Codie! 🚀
