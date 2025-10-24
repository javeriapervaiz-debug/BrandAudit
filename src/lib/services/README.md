# Services Directory Structure

This directory contains all the service modules organized by functionality for better maintainability and clarity.

## 📁 Directory Structure

### 🎯 **audit/**
Contains all brand compliance analysis and auditing services.

**Files:**
- `complianceAnalyzer.js` - Original compliance analyzer
- `enhancedComplianceAnalyzer.js` - Enhanced compliance analyzer with better scoring
- `enhancedComplianceAnalyzerV2.js` - Alternative enhanced analyzer
- `enhancedColorAnalyzer.js` - Enhanced color analysis with tolerance
- `enhancedTypographyAnalyzer.js` - Enhanced typography analysis with fuzzy matching
- `enhancedLogoAnalyzer.js` - Enhanced logo analysis with better rule checking
- `universalBrandAuditor.js` - Universal brand auditor integrating all analyzers
- `universalColorAnalyzer.js` - Universal color analyzer with flexible data structures
- `universalFontAnalyzer.js` - Universal font analyzer with family recognition
- `universalLogoAnalyzer.js` - Universal logo analyzer with constraint validation
- `universalLayoutAnalyzer.js` - Universal layout analyzer for spacing and hierarchy
- `universalConfidenceScorer.js` - Universal confidence scorer for reliability assessment
- `llmIssueProcessor.js` - LLM-based issue processing for grouping and CSS generation

### 📄 **pdf-extraction/**
Contains all PDF processing and brand guideline extraction services.

**Files:**
- `enhancedBrandExtractor.js` - Main brand guideline extractor
- `perfectBrandGuidelineExtractor.js` - Perfect extraction with comprehensive analysis
- `enhancedLLMExtractor.js` - LLM-based extraction service
- `advancedColorExtractor.js` - Advanced color extraction with context
- `categoryAwareExtractor.js` - Category-aware extraction service
- `contextAwareFontExtractor.js` - Context-aware font extraction
- `enhancedSpacingExtractor.js` - Enhanced spacing extraction
- `enhancedTextPreprocessor.js` - Text preprocessing for extraction
- `robustFontDetector.js` - Robust font detection service
- `specializedExtractors.js` - Specialized extraction utilities
- `llmBrandEnhancer.js` - LLM brand enhancement service
- `llmEnhancementService.js` - LLM enhancement service
- `convertapiClient.js` - ConvertAPI client for PDF to text conversion

### 🌐 **web-scraping/**
Contains all web scraping and data extraction services.

**Files:**
- `enhancedWebScraper.js` - Enhanced web scraper with comprehensive data extraction
- `multiStrategyScraper.js` - Multi-strategy scraper with fallback options
- `playwrightScraper.js` - Playwright-based scraper
- `webScraper.js` - Basic web scraper

### 🔧 **utilities/**
Contains utility services and shared functionality.

**Files:**
- `brandDetection.js` - Brand detection service
- `brandSynonymMapper.js` - Brand synonym mapping service
- `dynamicAnalyzer.js` - Dynamic website analyzer
- `fontDetector.js` - Font detection utility
- `googleAIService.js` - Google AI service integration

## 🔄 **Import Path Updates**

All import paths have been updated to reflect the new folder structure:

### From API Routes:
```javascript
// Before
import { enhancedBrandExtractor } from '$lib/services/enhancedBrandExtractor.js';

// After
import { enhancedBrandExtractor } from '$lib/services/pdf-extraction/enhancedBrandExtractor.js';
```

### From Components:
```javascript
// Before
import { convertAPIClient } from '$lib/services/convertapiClient.js';

// After
import { convertAPIClient } from '$lib/services/pdf-extraction/convertapiClient.js';
```

### Internal Service Imports:
```javascript
// Before
import { getGoogleAIAPIKey } from '../config/llmConfig.js';

// After
import { getGoogleAIAPIKey } from '../../config/llmConfig.js';
```

## 🎯 **Benefits of This Organization**

1. **Clear Separation**: Audit, PDF extraction, web scraping, and utilities are clearly separated
2. **Better Maintainability**: Related files are grouped together
3. **Easier Navigation**: Developers can quickly find the services they need
4. **Reduced Confusion**: No more mixed audit and extraction files
5. **Scalability**: Easy to add new services in the appropriate category
6. **Team Collaboration**: Different team members can work on different areas without conflicts

## 🚀 **Usage Examples**

### For Audit Analysis:
```javascript
import { enhancedComplianceAnalyzer } from '$lib/services/audit/enhancedComplianceAnalyzer.js';
import { universalBrandAuditor } from '$lib/services/audit/universalBrandAuditor.js';
```

### For PDF Extraction:
```javascript
import { enhancedBrandExtractor } from '$lib/services/pdf-extraction/enhancedBrandExtractor.js';
import { convertAPIClient } from '$lib/services/pdf-extraction/convertapiClient.js';
```

### For Web Scraping:
```javascript
import { enhancedWebScraper } from '$lib/services/web-scraping/enhancedWebScraper.js';
import { multiStrategyScraper } from '$lib/services/web-scraping/multiStrategyScraper.js';
```

### For Utilities:
```javascript
import { googleAIService } from '$lib/services/utilities/googleAIService.js';
import { brandDetection } from '$lib/services/utilities/brandDetection.js';
```

This organization makes the codebase much more maintainable and easier to understand! 🎉
