# Frequently Asked Questions (FAQ)

## Privacy & Data

### Why don't you save my chat history on your servers?

**This is intentional, not a limitation.**

Lumora uses a **Zero-Knowledge Architecture** where your health conversations never leave your device. Here's why:

- **Maximum Privacy**: We can't lose data we never had
- **No Data Breaches**: No server database = no honeypot for hackers
- **User Control**: You own 100% of your health data
- **HIPAA Simplified**: No Protected Health Information (PHI) on our servers

Your chat history is stored locally in your browser. You can export it anytime, and it's automatically deleted when you clear your browser cache.

### What happens if I clear my browser cache?

Your chat history will be deleted. This is by design - you have complete control over your data.

**Pro tip**: Use the export feature to save important conversations before clearing cache.

### Can I sync my chats across devices?

Not currently. Cross-device sync would require storing your data on our servers, which violates our zero-knowledge principle.

**Future options** (privacy-preserving):
- End-to-end encrypted sync (your encryption keys only)
- Manual export/import with password protection
- Self-hosted option for enterprises

### How is this different from other health apps?

| Traditional Health Apps | Lumora |
|------------------------|--------|
| Store all your data | Store nothing |
| "Trust us, it's encrypted" | "We can't see it, cryptographically" |
| Data breach risk | No data = no breach |
| Complex HIPAA compliance | Simplified (no PHI stored) |
| You hope they protect your data | You control your data |

### Is this really HIPAA compliant?

Yes. In fact, it's **more compliant** than traditional approaches because:
- No Protected Health Information (PHI) is stored on our servers
- No risk of unauthorized access to health data
- No need for complex encryption-at-rest systems
- Simplified audit requirements

See `docs/PRIVACY_ARCHITECTURE.md` for technical details.

### Can I trust Lumora with my health information?

You don't have to trust us - that's the point. 

With zero-knowledge architecture, we **cryptographically cannot** access your health data. It never reaches our servers. This is verifiable through our open-source code.

### What data DO you collect?

We collect minimal, anonymous usage data:
- API call counts (for billing)
- Response times (for performance)
- Error rates (for reliability)
- No health information
- No personal identifiers
- No conversation content

### Can Lumora employees see my chats?

**No.** Your chats are stored only on your device. Even if we wanted to (we don't), we couldn't access them.

### What if I want to share my chat with my doctor?

You can:
1. Export your chat history (JSON format)
2. Take screenshots
3. Copy/paste specific conversations
4. Print the conversation

You control what you share and with whom.

---

## Technical

### Why no database?

**It's a feature, not a bug.**

Traditional apps use databases because they want to:
- Analyze your data
- Train AI models on your conversations
- Sell insights to third parties
- Lock you into their platform

We don't do any of that. Our business model is simple: charge for the AI service, not for your data.

### How do you scale without a database?

Our backend is **stateless** - each request is independent. This makes horizontal scaling trivial:
- No database bottleneck
- No connection pool limits
- No replication lag
- Just add more servers

### What about rate limiting without Redis?

We use in-memory rate limiting, which works perfectly for our stateless architecture. Each server instance tracks its own limits.

For extreme scale, we can add Redis, but it's not necessary for most deployments.

### Can I self-host Lumora?

Yes! The entire codebase is open-source. You can:
- Run it on your own servers
- Add a database if you want (with proper encryption)
- Customize for your organization
- Maintain complete control

See `DEPLOY.md` for instructions.

---

## Business

### How do you make money without user data?

We charge for the service:
- Pay-per-use AI consultations
- Premium features (voice, multi-language)
- Enterprise white-label solutions
- Self-hosted support contracts

**We don't**:
- Sell user data (we don't have it)
- Show ads (no user profiles)
- Train AI on your chats (no access)

### Is this sustainable?

Yes. Privacy-first is a competitive advantage:
- Users trust us more
- Lower compliance costs
- Simpler infrastructure
- Differentiated positioning

### What about investors?

Privacy-first is attractive to investors because:
- Lower regulatory risk
- Unique market position
- Sustainable business model
- Growing privacy-conscious market

---

## Medical

### Is Lumora a replacement for a doctor?

**No.** Lumora is an AI health assistant for:
- General health information
- Symptom understanding
- Wellness guidance
- Health education

**Always consult a licensed healthcare provider for**:
- Medical diagnosis
- Treatment decisions
- Prescriptions
- Emergencies

### Can I use Lumora for emergencies?

**No.** For emergencies:
- Call 911 (US) or your local emergency number
- Go to the nearest emergency room
- Contact your doctor immediately

Lumora is for non-emergency health questions only.

### How accurate is the AI?

Our AI is trained on medical literature and provides evidence-based information. However:
- AI can make mistakes
- Every person is unique
- Context matters
- Professional diagnosis is essential

Use Lumora as a starting point, not a final answer.

---

## Getting Started

### How do I start using Lumora?

1. Visit the website
2. Start chatting - no signup required
3. Your conversations are saved locally
4. Export anytime for your records

### Do I need to create an account?

No! This is part of our privacy-first design. No accounts = no user database = maximum privacy.

### How much does it cost?

See our pricing page for current rates. We offer:
- Free tier (limited queries)
- Pay-as-you-go
- Monthly subscriptions
- Enterprise plans

### Can I try it for free?

Yes! Start chatting immediately with our free tier.

---

## Support

### I found a bug. How do I report it?

- GitHub Issues: [github.com/yourusername/lumora/issues](https://github.com/yourusername/lumora/issues)
- Email: support@lumora.dev
- Security issues: security@lumora.dev

### Can I contribute to Lumora?

Yes! We welcome contributions:
- Code improvements
- Documentation
- Translations
- Bug reports
- Feature suggestions

See `CONTRIBUTING.md` for guidelines.

### Where can I learn more?

- **Architecture**: `docs/ARCHITECTURE.md`
- **Privacy**: `docs/PRIVACY_ARCHITECTURE.md`
- **Security**: `docs/SECURITY.md`
- **API**: `docs/API.md`
- **Deployment**: `DEPLOY.md`

---

**Still have questions?** Open an issue on GitHub or email support@lumora.dev
