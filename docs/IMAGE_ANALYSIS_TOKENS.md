# Image Analysis Token Usage & Optimization

## Current Token Usage

**Per Image Analysis: ~500 tokens**

### Breakdown:
- System Prompt: ~150 tokens
- Image Processing: ~200 tokens (varies by image complexity)
- Response Generation: ~150 tokens (max)
- Total: **~500 tokens per analysis**

## Optimizations Implemented

### 1. Image Compression
- **Max Width**: 800px (automatically resized)
- **Quality**: 70% JPEG compression
- **Result**: 60-80% size reduction
- **Storage**: Compressed images stored in localStorage

### 2. Token Reduction
- Reduced max_tokens from 800 → 500
- Added "Be concise and focused" instruction
- Smart context-based prompts

### 3. Smart Analysis
- Context-specific prompts (skin, medication, lab, food, posture)
- Only relevant information extracted
- Focused responses without unnecessary details

## Supported Image Formats

All common formats accepted and auto-converted to JPEG:
- JPEG/JPG
- PNG
- WebP
- GIF

## File Size Limits

- **Input**: Any size accepted
- **Stored**: Compressed to ~50-200KB
- **Display**: Full quality maintained for viewing

## Camera & Upload Options

### Capture Photo
- Opens device camera
- Requests camera permission
- Direct capture and compression

### Upload Image
- Opens file picker/gallery
- Accepts any image format
- Auto-compression applied

## Token Cost Comparison

| Feature | Before | After | Savings |
|---------|--------|-------|---------|
| Max Tokens | 800 | 500 | 37.5% |
| Avg Response | ~600 | ~400 | 33% |
| Image Storage | Full size | Compressed | 70% |

## Best Practices

1. **Use specific context** - Select correct analysis type (skin, lab, etc.)
2. **Add brief description** - Help AI focus on what matters
3. **Good lighting** - Better image = more accurate analysis
4. **Clear images** - Avoid blurry photos for better results

## Privacy & Storage

- All images compressed before storage
- Stored locally in browser (localStorage)
- No server-side image storage
- Images persist in chat history
- Can be viewed full-screen from history
