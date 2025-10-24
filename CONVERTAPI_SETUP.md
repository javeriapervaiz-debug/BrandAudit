# 🔄 ConvertAPI PDF to Text Setup Guide

## **Why Use ConvertAPI?**

- ✅ **Simple Setup**: Just need an API key
- ✅ **Reliable**: High-quality PDF to text conversion
- ✅ **Fast**: Quick processing
- ✅ **Free Tier**: 25 free conversions per month
- ✅ **No Dependencies**: No complex Python libraries needed
- ✅ **Good Accuracy**: Better than basic text extraction

## **Step 1: Get ConvertAPI Access**

1. **Sign up for ConvertAPI**:
   - Go to [ConvertAPI.com](https://www.convertapi.com/)
   - Create a free account
   - Get your API secret from the dashboard

2. **Add API key to your `.env` file**:
   ```env
   # ConvertAPI Configuration
   CONVERTAPI_SECRET=your_convertapi_secret_here
   ```

## **Step 2: Install Dependencies**

```bash
cd C:\Users\BiM\Desktop\prototype\AI-Brand-Guideline-Assistant\python-pdf-service
pip install -r convertapi_requirements.txt
```

## **Step 3: Start ConvertAPI Service**

```bash
# Terminal 1 - ConvertAPI PDF Service (Port 8003)
cd C:\Users\BiM\Desktop\prototype\AI-Brand-Guideline-Assistant\python-pdf-service
python convertapi_pdf_service.py
```

## **Step 4: Test ConvertAPI Service**

```bash
# Test ConvertAPI service
python test_convertapi_service.py
```

## **Step 5: Complete System Startup**

```bash
# Terminal 1 - Database
docker run --name brand-analyzer-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=brand_analyzer -p 5432:5432 -d postgres:16

# Terminal 2 - ConvertAPI PDF Service (Port 8003) - PRIMARY
cd C:\Users\BiM\Desktop\prototype\AI-Brand-Guideline-Assistant\python-pdf-service
python convertapi_pdf_service.py

# Terminal 3 - RAG Service (Port 8001) - FALLBACK 1
cd C:\Users\BiM\Desktop\prototype\AI-Brand-Guideline-Assistant\python-pdf-service
python rag_pdf_extractor.py

# Terminal 4 - Basic Service (Port 8000) - FALLBACK 2
cd C:\Users\BiM\Desktop\prototype\AI-Brand-Guideline-Assistant\python-pdf-service
python basic_pdf_extractor.py

# Terminal 5 - SvelteKit App
cd C:\Users\BiM\Desktop\prototype\AI-Brand-Guideline-Assistant
npm run dev
```

## **Service Priority Order**

1. **ConvertAPI PDF to Text** (Port 8003) - Primary
2. **RAG Service** (Port 8001) - Fallback 1
3. **Basic Service** (Port 8000) - Fallback 2

## **Testing Commands**

```bash
# Test ConvertAPI service
python test_convertapi_service.py

# Test with real PDF
python -c "import requests; files = {'file': open('temp/Habib_Bank_Brand_Guidelines.pdf', 'rb')}; data = {'company_name': 'Habib Bank'}; r = requests.post('http://localhost:8003/extract-brand-guidelines', files=files, data=data); print('ConvertAPI Response:', r.json() if r.status_code == 200 else f'Error {r.status_code}: {r.text}')"
```

## **Expected Results**

**ConvertAPI PDF to Text** should return:
- ✅ **Success**: `true`
- ✅ **Brand Name**: Extracted from PDF
- ✅ **Colors**: Hex codes, RGB values, categorized colors
- ✅ **Typography**: Font names, sizes, weights
- ✅ **Logo**: Size, usage rules, clear space
- ✅ **Tone**: Style keywords, forbidden words
- ✅ **Spacing**: Base units, multiples, gutters
- ✅ **Extraction Method**: `convertapi_pdf_to_text`

## **Features of ConvertAPI Integration**

### **Color Extraction**
- Finds hex colors (6-digit and 3-digit)
- Finds RGB colors
- Categorizes colors by context (primary, secondary, accent, neutral)
- Handles color naming conventions

### **Typography Extraction**
- Extracts font names from various patterns
- Finds font sizes (pt, px, em, rem)
- Identifies font weights (regular, bold, light, etc.)
- Sets primary and secondary fonts

### **Logo Information**
- Extracts logo size requirements
- Finds clear space specifications
- Identifies usage rules and restrictions
- Detects logo variants

### **Tone of Voice**
- Identifies style keywords
- Finds forbidden words/phrases
- Extracts brand personality traits

### **Spacing Guidelines**
- Finds base spacing units
- Identifies spacing multiples
- Extracts gutter specifications
- Detects margin requirements

## **Benefits Over Other Services**

| Feature | ConvertAPI | RAG Service | Basic Service |
|---------|------------|-------------|---------------|
| **Setup** | ✅ Simple | ❌ Complex | ✅ Simple |
| **Dependencies** | ✅ Minimal | ❌ Many | ✅ Minimal |
| **Accuracy** | ✅ High | ✅ High | ⚠️ Medium |
| **Speed** | ✅ Fast | ⚠️ Medium | ✅ Fast |
| **Cost** | ✅ Free tier | ✅ Free | ✅ Free |
| **Reliability** | ✅ High | ⚠️ Variable | ⚠️ Variable |

## **Troubleshooting**

### **ConvertAPI Not Working**
- Check `CONVERTAPI_SECRET` is set correctly
- Verify API key is valid
- Check if you've exceeded free tier limits (25 conversions/month)

### **Service Not Starting**
- Make sure port 8003 is available
- Check if dependencies are installed
- Verify Python is working

### **Fallback to Other Services**
- If ConvertAPI service fails, system automatically falls back to RAG service
- If RAG service fails, system falls back to basic service
- Check logs to see which service is being used

## **ConvertAPI Pricing**

- **Free Tier**: 25 conversions per month
- **Paid Plans**: Starting from $9/month for 1,000 conversions
- **No Credit Card Required**: For free tier

## **Next Steps**

1. **Sign up for ConvertAPI** at [ConvertAPI.com](https://www.convertapi.com/)
2. **Get your API secret** from the dashboard
3. **Add it to your `.env` file**
4. **Install dependencies**
5. **Start the ConvertAPI service**
6. **Test with real PDFs**
7. **Enjoy reliable PDF extraction!** 🎉

