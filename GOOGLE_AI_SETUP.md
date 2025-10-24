# 🤖 Google AI Setup Guide

This guide will help you set up Google AI (Gemini) integration for the brand guideline extraction system.

## 🆓 Why Google AI?

- **FREE**: Google AI offers a generous free tier
- **Fast**: Gemini 1.5 Flash is optimized for speed
- **Reliable**: Google's infrastructure ensures high availability
- **No Credit Card**: No payment method required for free tier

## 🔑 Getting Your API Key

### Step 1: Visit Google AI Studio
Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Step 2: Sign In
- Use your Google account to sign in
- If you don't have a Google account, create one

### Step 3: Create API Key
- Click "Create API Key"
- Choose "Create API key in new project" (recommended)
- Copy the generated API key

### Step 4: Add to Environment
Add the API key to your `.env` file:

```env
GOOGLE_AI_API_KEY=your_actual_api_key_here
```

## 🚀 Quick Start

### 1. Update Your .env File
```env
# Google AI (FREE)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# ConvertAPI
VITE_CONVERTAPI_SECRET=KPmCFHs3hLNgAllWIygR6r8l5fHAl5Hk
```

### 2. Restart Development Server
```bash
npm run dev
```

### 3. Test the Integration
```bash
node test-extractor.js
```

## 📊 Expected Output

```
🧪 Testing Enhanced Brand Guideline Extractor with Google AI Integration...
📄 Text length: 11456
📄 Text preview: Partner Brand Guidelines...

🎨 Extracted Guidelines:
📊 Confidence: 0.85
🤖 LLM Enhancement: google
🔧 Method: enhanced-heuristic-llm-hybrid
💰 Cost: FREE (Google AI)

📋 Detailed Results:
🎨 Colors: { primary: '#1DB954', palette: ['#1DB954', '#191414', '#FFFFFF'], confidence: 0.9 }
🔤 Typography: { primaryFont: 'Circular', fonts: ['Circular', 'Arial'], confidence: 0.8 }
🧩 Logo: { minPrintSize: '0.4 inch (10mm)', minDigitalSize: '45px', clearspace: '1/3 of logo width', confidence: 0.85 }
🗣 Tone: { style: 'Friendly, music-driven, conversational, inclusive', examples: ['With Spotify, your music is everywhere'], confidence: 0.8 }
```

## 🔧 Configuration Options

### Switch Between Providers
```javascript
import { llmBrandEnhancer } from './src/lib/services/llmBrandEnhancer.js';

// Use Google AI (default, free)
llmBrandEnhancer.configure('google', 'your-google-ai-key');

// Use OpenAI (paid)
llmBrandEnhancer.configure('openai', 'your-openai-key');

// Use Anthropic (paid)
llmBrandEnhancer.configure('anthropic', 'your-anthropic-key');
```

### Adjust Confidence Threshold
```javascript
// High threshold (less LLM usage)
llmBrandEnhancer.setConfidenceThreshold(0.8);

// Low threshold (more LLM usage)
llmBrandEnhancer.setConfidenceThreshold(0.4);
```

## 💰 Cost Comparison

| Provider | Model | Cost per 1K tokens | Free Tier |
|----------|-------|-------------------|-----------|
| **Google AI** | Gemini 1.5 Flash | **$0** | **15 requests/minute** |
| OpenAI | GPT-4o-mini | $0.00015 | No free tier |
| Anthropic | Claude 3.5 Haiku | $0.00025 | No free tier |

## 🚨 Troubleshooting

### "Google AI API key not configured"
- Check that `GOOGLE_AI_API_KEY` is in your `.env` file
- Restart your development server
- Verify the API key is correct

### "Google AI API error: 403"
- Check your API key is valid
- Ensure you're using the correct project
- Check if you've exceeded rate limits

### "Google AI API error: 400"
- Check your request format
- Ensure the text length is within limits
- Verify the model name is correct

### Low Quality Results
- Try adjusting the confidence threshold
- Check the input text quality
- Consider using a different model

## 🔍 Debug Mode

Enable detailed logging to see what's happening:

```javascript
// In your browser console or Node.js
console.log('🔍 Debug mode enabled');
```

## 📈 Performance Tips

1. **Use Gemini 1.5 Flash**: Fastest and most cost-effective
2. **Adjust confidence threshold**: Higher = less LLM usage
3. **Text truncation**: System automatically limits to 12,000 characters
4. **Caching**: Results are cached to avoid re-processing

## 🔄 Migration from OpenAI

If you were using OpenAI before:

1. Get your Google AI API key
2. Update your `.env` file
3. The system will automatically switch to Google AI
4. No code changes needed!

## 📚 API Reference

### Google AI Service
```javascript
import { googleAIService } from './src/lib/services/googleAIService.js';

// Check if configured
googleAIService.isConfigured();

// Test connection
await googleAIService.testConnection();

// Enhance brand guidelines
const result = await googleAIService.enhanceBrandGuidelines(text, brandName, baseResult, context);
```

## 🎯 Benefits of Google AI Integration

- ✅ **FREE**: No cost for brand guideline extraction
- ✅ **Fast**: Optimized for speed with Gemini 1.5 Flash
- ✅ **Reliable**: Google's enterprise-grade infrastructure
- ✅ **Easy Setup**: Simple API key configuration
- ✅ **High Quality**: Excellent semantic understanding
- ✅ **No Limits**: Generous free tier for development

## 🔮 Future Enhancements

- Multi-modal support (images + text)
- Fine-tuned models for brand guidelines
- Advanced RAG with vector databases
- Real-time learning from user feedback

---

## 🎉 You're All Set!

With Google AI integration, you now have a powerful, free, and reliable brand guideline extraction system that can:

- Extract colors, typography, logos, tone, and imagery
- Use semantic understanding to fill gaps
- Provide confidence scoring
- Learn from historical brand data
- Work with messy PDF text

**Happy extracting!** 🚀
