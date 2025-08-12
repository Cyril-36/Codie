# Security Policy

## Supported Versions

We actively support the following versions of Codie with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Codie seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **cyrilchaitanya@gmail.com**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include in Your Report

Please include the following information in your report:

- **Type of issue** (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- **Full paths of source file(s)** related to the manifestation of the issue
- **The location of the affected source code** (tag/branch/commit or direct URL)
- **Any special configuration required** to reproduce the issue
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

### Preferred Languages

We prefer all communications to be in English.

## Security Update Process

1. **Assessment**: We will assess the vulnerability and determine its severity
2. **Fix Development**: Our team will develop a fix for the vulnerability
3. **Testing**: The fix will be thoroughly tested
4. **Release**: A security update will be released
5. **Disclosure**: Public disclosure will occur after the fix is available

## Security Best Practices

When using Codie, please follow these security best practices:

### Environment Configuration
- Never commit sensitive credentials to version control
- Use environment variables for all secrets and API keys
- Regularly rotate API keys and database passwords
- Use HTTPS in production environments

### Database Security
- Use strong, unique passwords for database accounts
- Enable database encryption at rest
- Regularly backup your database and test restore procedures
- Monitor database access logs

### API Security
- Always use HTTPS for API communications
- Implement proper authentication and authorization
- Use rate limiting to prevent abuse
- Validate all input data

### Infrastructure Security
- Keep all dependencies up to date
- Use container scanning for Docker images
- Implement proper network segmentation
- Monitor logs for suspicious activity

## Security Features

Codie includes several built-in security features:

- **Authentication**: JWT-based authentication system
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configurable CORS policies
- **Security Headers**: Automatic security header injection
- **SQL Injection Protection**: ORM-based database queries
- **XSS Protection**: Content Security Policy headers

## Acknowledgments

We would like to thank the following researchers for responsibly disclosing vulnerabilities:

(No vulnerabilities have been reported yet)

## Contact

For any questions about this security policy, please contact:
- Email: cyrilchaitanya@gmail.com
- Security Team: @codie-security-team

---

This security policy is effective as of August 12, 2025 and will be reviewed annually.
