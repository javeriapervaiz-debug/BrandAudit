# Services Usage Analysis

## 🟢 **ACTIVELY USED FILES**

### **Core Application Files (Directly Imported)**
These files are directly imported by API routes and components:

#### **PDF Extraction (Active)**
- ✅ `pdf-extraction/enhancedBrandExtractor.js` - **MAIN EXTRACTOR** (used in `/api/extract-brand-guidelines`)
- ✅ `pdf-extraction/convertapiClient.js` - **PDF CONVERSION** (used in audit page + DirectPDFUpload)

#### **Web Scraping (Active)**
- ✅ `web-scraping/webScraper.js` - **MAIN SCRAPER** (used in `/api/scrape-website`)
- ✅ `web-scraping/multiStrategyScraper.js` - **STRATEGY COORDINATOR** (imported by webScraper)
- ✅ `web-scraping/enhancedWebScraper.js` - **ENHANCED SCRAPER** (imported by multiStrategyScraper)
- ✅ `web-scraping/playwrightScraper.js` - **PLAYWRIGHT SCRAPER** (imported by multiStrategyScraper)

#### **Audit Analysis (Active)**
- ✅ `audit/enhancedComplianceAnalyzer.js` - **MAIN AUDITOR** (used in `/api/scrape-website`)
- ✅ `audit/complianceAnalyzer.js` - **LEGACY AUDITOR** (used in `/api/analyze-compliance`)

#### **Utilities (Active)**
- ✅ `utilities/brandDetection.js` - **BRAND DETECTION** (used in `/api/detect-brand` + `/api/analyze`)
- ✅ `utilities/dynamicAnalyzer.js` - **DYNAMIC ANALYZER** (used in `/api/analyze`)
- ✅ `utilities/googleAIService.js` - **AI SERVICE** (imported by LLM services)

### **Supporting Files (Indirectly Used)**
These files are imported by the main files:

#### **PDF Extraction Support**
- ✅ `pdf-extraction/perfectBrandGuidelineExtractor.js` - **PERFECT EXTRACTOR** (imported by enhancedBrandExtractor)
- ✅ `pdf-extraction/enhancedLLMExtractor.js` - **LLM EXTRACTOR** (imported by perfectBrandGuidelineExtractor)
- ✅ `pdf-extraction/llmBrandEnhancer.js` - **LLM ENHANCER** (imported by enhancedBrandExtractor)
- ✅ `pdf-extraction/llmEnhancementService.js` - **LLM SERVICE** (imported by enhancedBrandExtractor)
- ✅ `pdf-extraction/advancedColorExtractor.js` - **COLOR EXTRACTOR** (imported by perfectBrandGuidelineExtractor)
- ✅ `pdf-extraction/categoryAwareExtractor.js` - **CATEGORY EXTRACTOR** (imported by perfectBrandGuidelineExtractor)
- ✅ `pdf-extraction/contextAwareFontExtractor.js` - **FONT EXTRACTOR** (imported by perfectBrandGuidelineExtractor)
- ✅ `pdf-extraction/enhancedSpacingExtractor.js` - **SPACING EXTRACTOR** (imported by perfectBrandGuidelineExtractor)
- ✅ `pdf-extraction/enhancedTextPreprocessor.js` - **TEXT PREPROCESSOR** (imported by perfectBrandGuidelineExtractor)
- ✅ `pdf-extraction/robustFontDetector.js` - **FONT DETECTOR** (imported by perfectBrandGuidelineExtractor)
- ✅ `pdf-extraction/specializedExtractors.js` - **SPECIALIZED EXTRACTORS** (imported by enhancedBrandExtractor)

#### **Audit Analysis Support**
- ✅ `audit/llmIssueProcessor.js` - **LLM ISSUE PROCESSOR** (imported by enhancedComplianceAnalyzer)
- ✅ `audit/universalBrandAuditor.js` - **UNIVERSAL AUDITOR** (imported by enhancedComplianceAnalyzer)
- ✅ `audit/universalColorAnalyzer.js` - **UNIVERSAL COLOR ANALYZER** (imported by universalBrandAuditor)
- ✅ `audit/universalFontAnalyzer.js` - **UNIVERSAL FONT ANALYZER** (imported by universalBrandAuditor)
- ✅ `audit/universalLogoAnalyzer.js` - **UNIVERSAL LOGO ANALYZER** (imported by universalBrandAuditor)
- ✅ `audit/universalLayoutAnalyzer.js` - **UNIVERSAL LAYOUT ANALYZER** (imported by universalBrandAuditor)
- ✅ `audit/universalConfidenceScorer.js` - **CONFIDENCE SCORER** (imported by universalBrandAuditor)
- ✅ `audit/enhancedColorAnalyzer.js` - **ENHANCED COLOR ANALYZER** (imported by enhancedComplianceAnalyzer)
- ✅ `audit/enhancedTypographyAnalyzer.js` - **ENHANCED TYPOGRAPHY ANALYZER** (imported by enhancedComplianceAnalyzer)
- ✅ `audit/enhancedLogoAnalyzer.js` - **ENHANCED LOGO ANALYZER** (imported by enhancedComplianceAnalyzer)

## 🟡 **POTENTIALLY UNUSED FILES**

### **Legacy/Alternative Implementations**
These files exist but may not be actively used in the current workflow:

#### **Audit Analysis (Legacy)**
- ❓ `audit/enhancedComplianceAnalyzerV2.js` - **ALTERNATIVE V2** (not directly imported)
- ❓ `audit/complianceAnalyzer.js` - **LEGACY ANALYZER** (used in analyze-compliance API, but may be legacy)

#### **Utilities (Unclear Usage)**
- ❓ `utilities/brandSynonymMapper.js` - **SYNONYM MAPPER** (not directly imported)
- ❓ `utilities/fontDetector.js` - **FONT DETECTOR** (not directly imported)

## 🔴 **DEFINITELY UNUSED FILES**

### **No Import References Found**
These files appear to be completely unused:

#### **Web Scraping (Unused)**
- ❌ `web-scraping/webScraper.js` - **BASIC SCRAPER** (not imported by anything)

## 📊 **Usage Summary**

### **Active Files: 25**
- **PDF Extraction**: 12 files (all actively used)
- **Web Scraping**: 3 files (multiStrategyScraper, enhancedWebScraper, playwrightScraper)
- **Audit Analysis**: 8 files (enhancedComplianceAnalyzer + universal analyzers + support)
- **Utilities**: 2 files (brandDetection, dynamicAnalyzer, googleAIService)

### **Potentially Unused: 3**
- **Legacy/Alternative**: 2 files
- **Unclear Usage**: 1 file

### **Definitely Unused: 1**
- **Basic Web Scraper**: 1 file

## 🎯 **Recommendations**

### **Keep (Active)**
All files marked with ✅ should be kept as they're actively used.

### **Consider Removing**
- `web-scraping/webScraper.js` - Basic scraper, replaced by enhancedWebScraper
- `audit/enhancedComplianceAnalyzerV2.js` - Alternative implementation, not used
- `utilities/brandSynonymMapper.js` - No import references found
- `utilities/fontDetector.js` - No import references found

### **Investigate Further**
- `audit/complianceAnalyzer.js` - Used in analyze-compliance API, but may be legacy
- Check if analyze-compliance API is actually used in the application

## 🚀 **Current Active Workflow**

1. **PDF Upload** → `convertapiClient.js` → `enhancedBrandExtractor.js` → `perfectBrandGuidelineExtractor.js`
2. **Web Scraping** → `webScraper.js` → `multiStrategyScraper.js` → `enhancedWebScraper.js`
3. **Audit Analysis** → `enhancedComplianceAnalyzer.js` → `universalBrandAuditor.js` → Universal analyzers
4. **Brand Detection** → `brandDetection.js` + `dynamicAnalyzer.js`

The system is well-organized with clear active workflows! 🎉
