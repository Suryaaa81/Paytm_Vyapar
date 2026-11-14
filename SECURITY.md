# Security Policy — Paytm Vyapar-Brain

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security and privacy of neighborhood commerce and merchant data seriously. If you discover a security vulnerability or security-sensitive flaw within this repository, please report it responsibly.

### Responsible Disclosure Process

1. **Do Not File Public Issues:** Please do not disclose vulnerabilities through public GitHub issues, discussions, or pull requests.
2. **Private Reporting:** 
   - Open a **GitHub Private Vulnerability Report** directly via the repository's Security tab (Security > Advisories > Report a vulnerability).
   - Alternatively, reach out to the project maintainers through private repository communication channels.
3. **Information to Include:**
   - A detailed description of the vulnerability.
   - Exact steps, scripts, or payloads to reproduce the issue.
   - Affected endpoints, components, or files.
   - Potential impact on merchant or customer confidentiality and data integrity.

### Maintainer Commitments
- Acknowledge receipt within **48 hours**.
- Provide an initial assessment and timeline for a patch.
- Credit the security researcher upon patch publication (unless anonymity is requested).

## Security Configuration Best Practices

- **Secrets Management:** Never commit actual `.env` files, production database connection strings, or third-party API keys. Use the provided `.env.example` as a template.
- **Cryptographic Keys:** Always set a high-entropy `SECRET_KEY` in production environments for HMAC session verification.
- **CORS Configuration:** Configure `CORS_ORIGINS` to allow only trusted frontend domains rather than wildcards.
- **Database Backups:** Local SQLite databases (`*.db`) are ignored by `.gitignore`. Fictional demo seed data is generated automatically on initial startup.
- **Data Protection:** Marketing communications must strictly comply with the **Digital Personal Data Protection (DPDP) Act 2023** by verifying explicit consumer consent flags (`allow_promotions`).
