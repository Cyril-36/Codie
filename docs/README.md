# Codie Documentation

Welcome to the comprehensive documentation for the Codie project - a modern code analysis and security scanning platform.

## 📚 Documentation Structure

### 🏠 [Getting Started](./GETTING_STARTED.md)
- Project overview and setup instructions
- Development environment configuration
- First steps and basic usage

### 🚀 [Production Guide](./PRODUCTION_README.md)
- Production deployment instructions
- Environment configuration
- Performance optimization tips
- Security considerations

### 📋 [Changelog](./CHANGELOG.md)
- Complete project history and changes
- Feature additions and improvements
- Bug fixes and security updates

## 🎯 Frontend Documentation

### 📱 [Frontend Overview](./frontend/FRONTEND_OVERVIEW.md)
- React application architecture
- Component library and design system
- State management and routing

### 🎨 [UI Components](./components/)
- [Button Component](./components/Button.md) - Interactive button system
- [Score Display](./components/ScoreDisplay.md) - Score visualization components
- [Page Transitions](./components/PageTransition.md) - Smooth page transitions

### 🌙 [Enhanced Dark Mode](./frontend/ENHANCED_DARK_MODE.md)
- Dark mode implementation details
- Theme system architecture
- Color token management

### 🧪 [Testing Guide](./frontend/TESTING.md)
- Testing strategy and framework
- Unit, integration, and E2E testing
- Accessibility testing guidelines

### ♿ [Accessibility & UI Improvements](./frontend/ACCESSIBILITY_AND_UI_IMPROVEMENTS.md)
- Accessibility features and compliance
- UI/UX improvements and standards
- Screen reader support

## 🔧 Backend Documentation

### 🗄️ [Database Management](./backend/DATABASE_FIX_SUMMARY.md)
- Database setup and configuration
- Migration management with Alembic
- Database health monitoring

### 📊 [API Reference](./api/README.md)
- REST API endpoints and usage
- Request/response schemas
- Authentication and authorization

## 🚀 Implementation Guides

### 🔒 [Security Improvements](./implementation/IMPROVEMENTS_IMPLEMENTATION_SUMMARY.md)
- Security scanner enhancements
- CVE database integration
- Vulnerability detection improvements

### 🎨 [UI Implementation](./implementation/ENHANCED_UI_IMPLEMENTATION_COMPLETE.md)
- Complete UI enhancement guide
- Motion system implementation
- Design system improvements

### 🎭 [Motion & Tokens](./implementation/MOTION_AND_TOKENS_IMPLEMENTATION_COMPLETE.md)
- Animation system architecture
- Design token management
- Performance optimization

### 🎯 [UI Summary](./implementation/ENHANCED_UI_IMPLEMENTATION_SUMMARY.md)
- UI improvements overview
- Component enhancement status
- Implementation checklist

## 📊 Monitoring & Infrastructure

### 📈 [Monitoring Setup](./monitoring/)
- Prometheus configuration
- Grafana dashboards
- Metrics collection and alerting

### 🐳 [Infrastructure](./infra/)
- Docker Compose configurations
- Vault integration
- Deployment scripts

## 🛠️ Development Tools

### 📝 [Pre-commit Hooks](./.pre-commit-config.yaml)
- Code quality checks
- Linting and formatting
- Security scanning

### 🧪 [Testing Configuration](./pytest.ini)
- Backend testing setup
- Test discovery and execution
- Coverage reporting

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd codie
   ```

2. **Set up the backend**
   ```bash
   cd src/backend
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🔗 Useful Links

- **GitHub Repository**: [Project Repository]
- **Issue Tracker**: [GitHub Issues]
- **CI/CD Pipeline**: [GitHub Actions]
- **Security Policy**: [SECURITY.md]

## 📞 Support

- **Documentation Issues**: Create an issue in the repository
- **Feature Requests**: Use the feature request template
- **Bug Reports**: Use the bug report template
- **Security Issues**: Report to cyrilchaitanya@gmail.com

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Pull request process
- Testing requirements

---

*Last updated: January 2025*
*Documentation version: 1.0.0*
