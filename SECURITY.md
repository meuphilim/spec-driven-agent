# Security Policy

> 🌐 Leia esta documentação em [Português](SECURITY_pt.md).

## Supported Versions

| Version | Supported |
|---------|-----------|
| 4.3.x | ✅ |
| 4.2.x | ✅ |
| < 4.2 | ❌ |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please send an email to Meuphilim. All security vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response timeline

- **Acknowledgment:** Within 48 hours
- **Initial assessment:** Within 1 week
- **Fix or mitigation:** Within 2 weeks (critical), 1 month (high)

## Security Measures

### Input Validation

- All user input is sanitized via `sanitizePath()` in CLI
- Prohibited characters: `;&|`$(){}!<>`
- Shell commands use `execFileSync` with argument arrays (never string interpolation)

### Data Protection

- No sensitive data is logged
- Session state (`state.json`) is gitignored
- Environment variables are never committed

### Dependencies

- Zero runtime dependencies (CLI uses only Node.js built-ins)
- Regular `npm audit` checks recommended

## Best Practices

When using this framework:

1. **Keep dependencies updated** — run `npm audit` regularly
2. **Use environment variables** — never hardcode secrets
3. **Validate input** — especially in custom skills or hooks
4. **Review hooks** — ensure shell scripts don't expose sensitive data
5. **Limit permissions** — use Claude Code's permission system

## Scope

This security policy applies to:

- The `spec-driven-agent` npm package
- The CLI tool (`sda`)
- The framework templates and skills
- The hook scripts

It does **not** apply to:

- Third-party integrations
- Custom skills created by users
- Projects that use this framework
