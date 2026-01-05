# Vision-Powered Health Analysis Feature

## Overview
Lumora now supports AI-powered image analysis using Grok-2 Vision for health-related images.

## Supported Image Types

1. **Skin Conditions** - Analyze rashes, moles, lesions
2. **Medication Labels** - Extract drug info, dosage, warnings
3. **Lab Reports** - Parse test results and explain values
4. **Food/Nutrition** - Estimate calories, macros, health rating
5. **Posture Check** - Ergonomic assessment and corrections

## How It Works

### User Flow
1. Click the **+** button in chat input
2. Select an image from device
3. Choose image category from modal
4. AI analyzes and provides insights

### Technical Implementation

#### API Route: `/api/lumora-vision/route.ts`
- Uses `grok-2-vision-1212` model
- Context-specific prompts for each image type
- Built-in safety disclaimers
- Max 800 tokens, temperature 0.3 for accuracy

#### ChatInterface Updates
- Added context selection modal
- Image preview with cancel option
- Icons for each category (Camera, Pill, FileText, Utensils, User)

#### Main Page Integration
- `handleImageAnalysis()` function
- Sends image + context to vision API
- Displays results in chat history

## Safety Features

[DISCLAIMER] Prominent Disclaimers - Every response includes "[DISCLAIMER] AI Analysis - Not a Medical Diagnosis"

[URGENT] Urgency Detection - Flags severe symptoms and recommends emergency care

[CAUTIOUS] No Definitive Diagnoses - Uses cautious language ("possible", "may indicate")

[CONSULT] Professional Consultation - Always recommends seeing a doctor for concerns

## Privacy

- Images processed via API (not stored)
- No server-side storage
- Encrypted local chat history only

## Usage Example

```typescript
// User uploads skin rash photo
// Selects "Skin Condition" context
// AI responds with:
// - Visual observations
// - Possible conditions (with confidence)
// - Urgency level
// - Next steps
// - Disclaimer
```

## Error Handling

- Invalid image format → 400 error
- API unavailable → 503 error
- Empty response → 500 error
- User-friendly error messages in chat

## Future Enhancements

- Multi-image comparison
- Progress tracking (before/after)
- Export analysis as PDF
- Voice description of findings
