# Contributing to Lumora

Thank you for your interest in contributing to Lumora! This guide will help you get started with contributing to our AI-powered health consultation platform.

## 🌟 Ways to Contribute

- 🐛 **Bug Reports**: Help us identify and fix issues
- 💡 **Feature Requests**: Suggest new features or improvements
- 📝 **Documentation**: Improve our docs and guides
- 🔧 **Code Contributions**: Submit bug fixes and new features
- 🎨 **Design**: Improve UI/UX and accessibility
- 🧪 **Testing**: Help us test new features and find edge cases

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **OpenRouter API Key** ([Get one here](https://openrouter.ai/))

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/lumora.git
   cd lumora
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/lumora.git
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   
   # Frontend
   cd ../frontend
   cp .env.example .env.local
   # Add your XAI_API_KEY to .env.local
   ```

5. **Start development servers**
   ```bash
   # From project root
   ./start.sh
   ```

6. **Verify setup**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000/health

## 📋 Development Workflow

### 1. Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow our [coding standards](#-coding-standards)
- Write tests for new functionality
- Update documentation as needed
- Test your changes thoroughly

### 3. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Examples:
git commit -m "feat: add voice input support"
git commit -m "fix: resolve CSRF token expiration issue"
git commit -m "docs: update API documentation"
git commit -m "style: improve button hover animations"
```

**Commit Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 4. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create PR on GitHub
# Include description, screenshots, and testing notes
```

## 🎯 Coding Standards

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow **ESLint** configuration
- Use **Prettier** for formatting
- Prefer **functional components** with hooks
- Use **async/await** over promises

```typescript
// ✅ Good
const fetchUserData = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};

// ❌ Avoid
function fetchUserData(userId) {
  return fetch('/api/users/' + userId)
    .then(response => response.json())
    .catch(error => {
      console.log(error);
    });
}
```

### React Components

- Use **functional components** with hooks
- Implement proper **error boundaries**
- Add **ARIA labels** for accessibility
- Use **TypeScript interfaces** for props

```typescript
// ✅ Good
interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isUser, 
  timestamp 
}) => {
  return (
    <div 
      className={`message ${isUser ? 'user' : 'assistant'}`}
      role="article"
      aria-live={isUser ? undefined : 'polite'}
    >
      {message}
    </div>
  );
};
```

### CSS/Styling

- Use **Tailwind CSS** classes
- Follow **4-point grid system** (4px, 8px, 12px, 16px)
- Use **semantic color names** from theme
- Ensure **WCAG AA** color contrast

```css
/* ✅ Good - Using theme colors and grid system */
.chat-message {
  @apply bg-surface text-starlight p-4 rounded-lg mb-3;
}

/* ❌ Avoid - Hardcoded values */
.chat-message {
  background-color: #161B22;
  color: #FFFFFF;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}
```

### API Design

- Use **RESTful** conventions
- Implement **proper error handling**
- Add **input validation** with Zod
- Include **rate limiting**

```typescript
// ✅ Good
const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  conversation: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversation } = chatRequestSchema.parse(body);
    // ... handle request
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
```

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# E2E tests
npm run test:e2e

# Linting
npm run lint
```

### Writing Tests

- Write **unit tests** for utilities and components
- Add **integration tests** for API endpoints
- Include **accessibility tests** with jest-axe
- Test **error scenarios** and edge cases

```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';

describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    render(
      <ChatMessage 
        message="Hello" 
        isUser={true} 
        timestamp={new Date()} 
      />
    );
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveClass('user');
  });
});
```

## 📝 Documentation

### Code Documentation

- Add **JSDoc comments** for functions
- Document **complex algorithms**
- Explain **business logic** decisions
- Include **usage examples**

```typescript
/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - Raw user input string
 * @returns Sanitized string safe for display
 * @example
 * ```typescript
 * const safe = sanitizeChatMessage('<script>alert("xss")</script>');
 * // Returns: '&lt;script&gt;alert("xss")&lt;/script&gt;'
 * ```
 */
export const sanitizeChatMessage = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};
```

### README Updates

When adding user-facing features:
- Update the **Features** section
- Add **usage examples**
- Update **screenshots** if UI changed
- Add **configuration** instructions

## 🔒 Security Guidelines

### Input Validation

- **Always validate** user input
- Use **Zod schemas** for type safety
- **Sanitize HTML** content with DOMPurify
- **Escape SQL** queries (when applicable)

### Authentication & Authorization

- Implement **CSRF protection** for state-changing operations
- Use **rate limiting** to prevent abuse
- **Never expose** API keys in frontend code
- **Validate tokens** on every protected request

### Data Privacy

- **Never log** sensitive user data
- **Minimize data collection**
- **Encrypt** data in transit and at rest
- Follow **GDPR/CCPA** guidelines

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test on latest version** of main branch
3. **Check documentation** for known limitations
4. **Try minimal reproduction** steps

### Bug Report Template

```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 96]
- Node.js: [e.g. 18.0.0]
- Version: [e.g. 1.0.0]

**Additional Context**
Any other context about the problem.
```

## 💡 Feature Requests

### Before Requesting

1. **Check roadmap** for planned features
2. **Search discussions** for similar ideas
3. **Consider scope** and complexity
4. **Think about alternatives**

### Feature Request Template

```markdown
**Feature Description**
A clear description of the feature you'd like.

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How would you like this implemented?

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Screenshots, mockups, or examples.
```

## 📊 Pull Request Guidelines

### PR Checklist

- [ ] **Tests pass** locally
- [ ] **Linting passes** (ESLint)
- [ ] **Type checking passes** (TypeScript)
- [ ] **Documentation updated** if needed
- [ ] **Screenshots included** for UI changes
- [ ] **Accessibility tested** with screen reader
- [ ] **Mobile responsive** design verified
- [ ] **Performance impact** considered

### PR Description Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots
Include before/after screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added for new functionality
```

## 🎨 Design Contributions

### Design System

Follow our established design system:
- **Colors**: Use theme colors (void, surface, starlight, muted, aura)
- **Typography**: Inter (UI) + Lora (AI responses)
- **Spacing**: 4-point grid system
- **Animations**: Subtle, purposeful motion

### Accessibility

- **Color contrast**: WCAG AA minimum (4.5:1)
- **Keyboard navigation**: All interactive elements
- **Screen readers**: Proper ARIA labels
- **Focus indicators**: Visible focus states
- **Motion**: Respect prefers-reduced-motion

## 🏆 Recognition

Contributors are recognized in:
- **README.md** contributors section
- **CHANGELOG.md** for significant contributions
- **GitHub releases** notes
- **Social media** shoutouts (with permission)

## 📞 Getting Help

- **GitHub Discussions**: Ask questions and share ideas
- **Discord**: Join our community chat (link in README)
- **Email**: contributors@lumora.health
- **Office Hours**: Weekly contributor calls (schedule in Discord)

## 📄 License

By contributing to Lumora, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Lumora! Together, we're making healthcare more accessible through AI. 🌟