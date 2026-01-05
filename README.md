# Lumora AI Health Assistant

<div align="center">
  <h3>✨ Privacy-First AI Health Intelligence Platform ✨</h3>
  <p>Your personal health companion powered by xAI Grok-2</p>
</div>

---

## 🌟 Overview

Lumora is a cutting-edge AI health assistant that provides intelligent medical consultations while maintaining complete privacy. All your health data stays on your device - no servers, no databases, no tracking.

### Key Features

- 🤖 **AI-Powered Consultations** - Advanced health guidance using xAI Grok-2
- 🔒 **Zero-Knowledge Architecture** - All data encrypted and stored locally
- 💊 **Medicine Intelligence** - Comprehensive drug information and interactions
- 📊 **Health History** - Track and manage your consultation history
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- ⚙️ **Customizable AI** - Adjust response style, temperature, and context
- 📱 **PWA Ready** - Install as a native app on any device

---

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Hot Toast** - Beautiful notifications

### AI & APIs
- **xAI Grok-2** - Latest AI model for health consultations
- **AES-256 Encryption** - Military-grade data encryption

### Storage & Security
- **Local Storage** - Client-side encrypted storage
- **No Database** - Zero server-side data storage
- **Secure Storage** - Custom encryption layer

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- xAI API Key

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/lumora.git
cd lumora
```

2. **Install dependencies**
```bash
cd frontend
npm install

cd ../backend
npm install
```

3. **Configure environment variables**

Create `.env.local` in the frontend directory:
```env
XAI_API_KEY=your_xai_api_key_here
```

4. **Run development server**
```bash
# Frontend
cd frontend
npm run dev

# Backend (if needed)
cd backend
npm start
```

5. **Open in browser**
```
http://localhost:3000
```

---

## 🎯 Features in Detail

### AI Health Assistant
- **3 Response Modes**: Classic, Medical Professional, Chatty Doctor
- **Custom Instructions**: Personalize AI responses with your health context
- **Advanced Settings**: Control temperature, max tokens, and context window
- **Smart Context**: AI remembers conversation history

### Medicine Intelligence
- Search any medication
- Side effects and interactions
- Dosage information
- Safety warnings
- Cached results for instant access

### Privacy & Security
- **AES-256 Encryption**: All data encrypted before storage
- **Local-Only Storage**: No cloud, no servers
- **Zero Tracking**: No analytics, no cookies
- **Export Data**: Download your data anytime (HTML format)
- **Auto-Delete**: Automatic cleanup of old conversations

### Health History
- Timeline view of all consultations
- Pin important conversations
- Rate consultations
- Search and filter
- Export to HTML/PDF

---

## 🔧 Configuration

### AI Settings
Customize AI behavior in Settings > AI Behavior:
- **Response Mode**: Classic / Medical / Chatty
- **Custom Instructions**: Add personal health context
- **Max Tokens**: 100-1000 (controls response length)
- **Temperature**: 0-1 (creativity vs focus)
- **Context Window**: 2-20 messages

### Storage Settings
- **Auto-Delete**: 7 days to Never
- **Message Limit**: 25-200 messages per chat
- **Notifications**: Daily health check-ins

---

## 📱 PWA Installation

Lumora can be installed as a Progressive Web App:

1. Open Lumora in your browser
2. Click the install icon in the address bar
3. Follow the prompts to install
4. Launch from your home screen/app drawer

---

## 🛡️ Security

### Data Encryption
- All sensitive data encrypted with AES-256
- Encryption keys stored securely in browser
- No plaintext storage

### Privacy Guarantees
- ✅ No user accounts or authentication
- ✅ No server-side data storage
- ✅ No third-party analytics
- ✅ No cookies or tracking
- ✅ No data sharing

### API Security
- HTTPS/TLS for all API calls
- API keys stored in environment variables
- Rate limiting and request validation

---

## 📖 Usage Guide

### Starting a Consultation
1. Type your health question in the input box
2. Or click a suggestion card for quick topics
3. AI responds with personalized guidance
4. Continue the conversation naturally

### Searching Medicines
1. Navigate to Medicines page
2. Search for any medication
3. View comprehensive information
4. Results are cached for instant re-access

### Managing History
1. Go to History page
2. View all past consultations
3. Click "Continue" to resume a conversation
4. Pin, rate, or delete consultations

### Exporting Data
1. Go to Settings
2. Click "Export Data"
3. Download beautiful HTML report
4. Print to PDF using browser (Ctrl+P)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

**Lumora is NOT a medical device or diagnostic tool.**

- Information provided is for educational purposes only
- Always consult qualified healthcare professionals for medical decisions
- Do not use Lumora for medical emergencies
- AI responses may contain errors - always verify information

---

## 🔗 Links

- **Documentation**: [docs/](docs/)
- **Privacy Policy**: [/privacy](https://lumora.app/privacy)
- **Terms of Service**: [/terms](https://lumora.app/terms)
- **Support**: [/support](https://lumora.app/support)

---

## 📊 Project Stats

- **Version**: 1.1
- **AI Model**: xAI Grok-2 Latest
- **License**: MIT
- **Status**: Production Ready ✅

---

## 💖 Acknowledgments

- xAI for Grok-2 API
- Next.js team for the amazing framework
- Open source community

---

<div align="center">
  <p><strong>Built with ❤️ for privacy-conscious health seekers</strong></p>
  <p><em>Lumora</em> - Your Health, Your Privacy, Your Control</p>
</div>
