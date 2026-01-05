# Security Policy

## 🔒 Security Overview

Lumora takes security seriously. This document outlines our security measures, reporting procedures, and best practices for maintaining a secure health consultation platform.

## 🛡️ Security Features

### 1. CSRF Protection

**Implementation:**
- Single-use tokens with 15-minute TTL
- Cryptographically secure token generation
- Automatic cleanup of expired tokens
- Required for all state-changing operations

**Token Lifecycle:**
```
1. Client requests token: GET /api/csrf-token
2. Server generates 32-byte random token
3. Token stored with expiration timestamp
4. Client includes token in x-csrf-token header
5. Server validates and consumes token (single-use)
6. Expired tokens automatically cleaned up
```

### 2. Rate Limiting

**Global Rate Limits:**
- 120 requests per minute per IP address
- 60-second sliding window
- Automatic retry-after headers

**Chat Endpoint Limits:**
- 20 requests per minute per IP address
- Prevents AI API abuse
- Protects against automated attacks

**Implementation:**
```javascript
const rateLimit = ({ windowMs = 60 * 1000, max = 60 } = {}) => {
  const hits = new Map();
  
  return (req, res, next) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const entry = hits.get(key) || { count: 0, reset: now + windowMs };
    
    if (now > entry.reset) {
      entry.count = 0;
      entry.reset = now + windowMs;
    }
    
    entry.count += 1;
    hits.set(key, entry);
    
    if (entry.count > max) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    next();
  };
};
```

### 3. Input Sanitization

**Backend Sanitization:**
- HTML entity escaping for all user input
- Maximum length enforcement (1000 characters)
- Whitespace trimming and normalization

```javascript
const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .substring(0, 1000);
};
```

**Frontend Sanitization:**
- DOMPurify for HTML content sanitization
- Zod schema validation for type safety
- Content Security Policy headers

### 4. CORS Configuration

**Allowed Origins:**
- Development: `http://localhost:3000`
- Production: Configured via environment variables

**Allowed Methods:**
- `GET`, `POST` only

**Allowed Headers:**
- `Content-Type`
- `x-csrf-token`

### 5. HTTPS Enforcement

**Production Requirements:**
- TLS 1.2+ encryption
- HSTS headers
- Secure cookie flags
- Certificate pinning (recommended)

## 🔐 Data Protection

### 1. Data Minimization

**What We Collect:**
- Chat messages (temporary, not persisted)
- IP addresses (for rate limiting only)
- Session tokens (ephemeral)

**What We DON'T Collect:**
- Personal health information (PHI)
- User accounts or profiles
- Persistent conversation history
- Biometric data
- Location data

### 2. Data Retention

**Conversation Data:**
- Stored in memory only
- Automatically cleared on page refresh
- Never written to disk or database
- Not logged or monitored

**Rate Limiting Data:**
- IP addresses stored temporarily
- Automatically purged after rate limit window
- Used only for abuse prevention

### 3. Third-Party Data Sharing

**xAI Integration:**
- Messages sent to xAI API for processing
- No persistent storage by xAI (per their policy)
- Encrypted in transit (HTTPS)
- Subject to xAI's privacy policy

## 🚨 Vulnerability Reporting

### Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

**Instead, please:**

1. **Email**: security@lumora.health
2. **Subject**: "Security Vulnerability Report"
3. **Include**:
   - Detailed description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if known)

### Response Timeline

- **24 hours**: Initial acknowledgment
- **72 hours**: Preliminary assessment
- **7 days**: Detailed response with timeline
- **30 days**: Fix deployed (for critical issues)

### Responsible Disclosure

We follow responsible disclosure practices:

1. **Report received** → Investigation begins
2. **Vulnerability confirmed** → Fix development starts
3. **Fix deployed** → Public disclosure coordinated
4. **CVE assigned** (if applicable) → Credit given to reporter

## 🏆 Security Researcher Recognition

We appreciate security researchers who help improve Lumora's security:

- **Hall of Fame**: Public recognition (with permission)
- **Swag**: Lumora merchandise for valid reports
- **References**: LinkedIn recommendations for significant findings

## 🔍 Security Testing

### Automated Security Scanning

**SAST (Static Analysis):**
- ESLint security rules
- TypeScript strict mode
- Dependency vulnerability scanning

**DAST (Dynamic Analysis):**
- OWASP ZAP integration
- Automated penetration testing
- API security testing

### Manual Security Testing

**Regular Assessments:**
- Code reviews for security issues
- Penetration testing (quarterly)
- Security architecture reviews

**Testing Checklist:**
- [ ] Input validation bypass attempts
- [ ] CSRF token manipulation
- [ ] Rate limiting effectiveness
- [ ] XSS injection attempts
- [ ] SQL injection (when applicable)
- [ ] Authentication bypass
- [ ] Authorization flaws
- [ ] Session management issues

## 🛠️ Security Development Lifecycle

### 1. Design Phase

- **Threat modeling** for new features
- **Security requirements** definition
- **Privacy impact assessment**

### 2. Development Phase

- **Secure coding practices**
- **Input validation** for all user data
- **Output encoding** for all dynamic content
- **Error handling** without information disclosure

### 3. Testing Phase

- **Security unit tests**
- **Integration security tests**
- **Automated vulnerability scanning**

### 4. Deployment Phase

- **Security configuration review**
- **Environment hardening**
- **Monitoring and alerting setup**

## 📋 Security Checklist

### For Developers

- [ ] All user input validated and sanitized
- [ ] CSRF tokens implemented for state changes
- [ ] Rate limiting applied to public endpoints
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies regularly updated
- [ ] Security headers configured
- [ ] HTTPS enforced in production
- [ ] Secrets not hardcoded in source code

### For Deployment

- [ ] Environment variables properly configured
- [ ] Database connections encrypted (if applicable)
- [ ] Log files don't contain sensitive data
- [ ] Backup data encrypted
- [ ] Access controls properly configured
- [ ] Monitoring and alerting active
- [ ] Incident response plan documented

## 🚨 Incident Response

### 1. Detection

**Monitoring:**
- Rate limit violations
- Unusual traffic patterns
- Error rate spikes
- Failed authentication attempts

**Alerting:**
- Real-time notifications for critical events
- Automated response for known attack patterns
- Escalation procedures for security team

### 2. Response

**Immediate Actions:**
1. **Assess** the scope and impact
2. **Contain** the threat (rate limiting, IP blocking)
3. **Investigate** the root cause
4. **Document** all actions taken

**Communication:**
- Internal team notification
- User communication (if data affected)
- Regulatory reporting (if required)
- Public disclosure (after fix deployed)

### 3. Recovery

**Steps:**
1. **Deploy** security fixes
2. **Verify** threat elimination
3. **Monitor** for recurring issues
4. **Update** security measures

### 4. Lessons Learned

**Post-Incident Review:**
- Root cause analysis
- Process improvements
- Security control updates
- Team training needs

## 📚 Security Resources

### Internal Documentation

- [API Security Guide](./API.md#security-features)
- [Deployment Security](../DEPLOYMENT.md#security-notes)
- [Contributing Security Guidelines](./CONTRIBUTING.md#security-guidelines)

### External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [GDPR Privacy Requirements](https://gdpr.eu/)

### Security Tools

**Recommended Tools:**
- [OWASP ZAP](https://www.zaproxy.org/) - Web application security scanner
- [Snyk](https://snyk.io/) - Dependency vulnerability scanning
- [SonarQube](https://www.sonarqube.org/) - Code quality and security analysis
- [Burp Suite](https://portswigger.net/burp) - Web application testing

## 📞 Contact Information

**Security Team:**
- **Email**: security@lumora.health
- **PGP Key**: [Available on request]
- **Response Time**: 24 hours for critical issues

**General Security Questions:**
- **GitHub Discussions**: Security category
- **Documentation**: This security policy
- **Community**: Discord #security channel

---

## 📄 Policy Updates

This security policy is reviewed and updated quarterly. Last updated: [Current Date]

**Version History:**
- v1.0.0 - Initial security policy
- v1.1.0 - Added incident response procedures
- v1.2.0 - Enhanced vulnerability reporting process

---

**Remember**: Security is everyone's responsibility. When in doubt, choose the more secure option.