# Health Timeline & Insights Feature

## Overview
Transform chat history into longitudinal health intelligence with AI-powered analysis.

## Features Implemented

### 1. **Symptom Tracker**
- Auto-extracts symptoms from conversations
- Plots occurrences over time
- Tracks severity levels (1-10 scale)
- Visual timeline with date badges

### 2. **Medication Adherence**
- Identifies medications discussed
- Tracks start dates and frequency
- Visual medication cards with status

### 3. **Health Score**
- Aggregates wellness metrics from conversations
- Dynamic scoring (0-100)
- Color-coded indicators (green/yellow/red)

### 4. **Pattern Detection**
- AI-powered insight generation
- Identifies recurring health patterns
- Provides actionable recommendations
- Confidence scoring for each insight

### 5. **Export to Doctor**
- Generate professional medical summary
- Markdown format for easy sharing
- Includes symptoms, medications, and insights
- One-click download

## Technical Implementation

### Files Created
1. `/app/lib/healthTimeline.ts` - Core service with AI extraction logic
2. `/app/api/health-timeline/route.ts` - API endpoint using Grok-2
3. `/app/timeline/page.tsx` - Timeline visualization page

### Files Modified
1. `/app/components/NavigationSidebar.tsx` - Added Timeline link
2. `/app/components/MobileDrawer.tsx` - Added Timeline to mobile nav

## API Integration

The feature uses **xAI Grok-2** for intelligent health data extraction:
- Analyzes conversation history
- Extracts structured health data
- Generates insights with confidence scores
- Fallback to keyword-based extraction if API fails

## Usage

1. Navigate to `/timeline` from the sidebar
2. View your health metrics and insights
3. Click "Export Summary" to download medical report
4. Share with healthcare providers

## Data Privacy

- All processing happens client-side or via secure API
- No data stored on servers
- Encrypted local storage
- Export data anytime

## Future Enhancements

- Medication reminders
- Lifestyle tracking (sleep, exercise, stress)
- Chart visualizations
- PDF export with formatting
- Doctor appointment scheduler
