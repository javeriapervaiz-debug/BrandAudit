/**
 * ConvertAPI Client for Direct PDF to Text Conversion
 * Converts PDFs to text directly in JavaScript without Python service
 */
import { browser } from '$app/environment';

export class ConvertAPIClient {
  constructor() {
    this.apiKey = '';
    this.apiUrl = 'https://v2.convertapi.com/convert/pdf/to/txt';
    this.isAvailable = false;
    
    if (browser) {
      this.initialize();
    }
  }

  async initialize() {
    // Get API key from environment or localStorage
    this.apiKey = import.meta.env.VITE_CONVERTAPI_SECRET || 
                  localStorage.getItem('convertapi_secret') || '';
    
    this.isAvailable = !!this.apiKey && this.apiKey.length > 10; // ConvertAPI keys are usually long
    
    if (this.isAvailable) {
      console.log('✅ ConvertAPI Client initialized with environment key');
    } else {
      console.warn('⚠️ ConvertAPI secret not found. Add VITE_CONVERTAPI_SECRET to .env file');
    }
  }

  /**
   * Convert PDF to text using ConvertAPI
   * @param {File} pdfFile - PDF file to convert
   * @returns {Promise<string>} Extracted text
   */
  async convertPdfToText(pdfFile) {
    if (!this.isAvailable) {
      throw new Error('ConvertAPI not available - missing API key');
    }

    try {
      console.log('🔄 Converting PDF to text with ConvertAPI...');
      console.log('🔑 Using API key:', {
        hasKey: !!this.apiKey,
        keyLength: this.apiKey ? this.apiKey.length : 0,
        keyStart: this.apiKey ? this.apiKey.substring(0, 4) : 'None',
        keyEnd: this.apiKey ? this.apiKey.substring(this.apiKey.length - 4) : 'None'
      });
      
      const formData = new FormData();
      formData.append('file', pdfFile);
      // Don't add secret to form data, we'll add it as query parameter
      
      console.log('📋 Form Data:', {
        hasFile: !!pdfFile,
        fileName: pdfFile.name,
        fileSize: pdfFile.size,
        fileType: pdfFile.type,
        hasSecret: !!this.apiKey
      });

      // Try with secret as query parameter
      const url = `${this.apiUrl}?secret=${encodeURIComponent(this.apiKey)}`;
      console.log('🌐 Calling ConvertAPI URL:', url);
      
      console.log('📤 Sending request to ConvertAPI...');
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let browser set it for FormData
        }
      });
      
      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ConvertAPI Error Response:', errorText);
        
        if (response.status === 401) {
          throw new Error(`ConvertAPI Authentication Failed (401). Please check your API key and ensure it's valid. Error: ${errorText}`);
        }
        
        throw new Error(`ConvertAPI error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // ConvertAPI returns JSON with Files array containing the text
      const result = await response.json();
      console.log('📄 ConvertAPI Response:', result);
      console.log('📄 Files array:', result.Files);
      console.log('📄 First file:', result.Files && result.Files[0]);
      console.log('📄 Response keys:', Object.keys(result));
      console.log('📄 Files type:', typeof result.Files);
      console.log('📄 Files length:', result.Files ? result.Files.length : 'undefined');
      
      // Handle different response structures
      let textContent = null;
      
      if (result.Files && result.Files.length > 0) {
        const firstFile = result.Files[0];
        
        if (firstFile && firstFile.FileData) {
          // ConvertAPI returns base64-encoded text data directly
          console.log('📄 Decoding base64 text data...');
          try {
            // Decode base64 to get the actual text
            textContent = atob(firstFile.FileData);
            console.log(`✅ PDF converted to text: ${textContent.length} characters`);
            return textContent;
          } catch (error) {
            console.error('❌ Failed to decode base64 data:', error);
            throw new Error('Failed to decode ConvertAPI response data');
          }
        } else if (firstFile && firstFile.Url) {
          // Standard ConvertAPI response structure with URL
          console.log('📄 Fetching text from URL:', firstFile.Url);
          
          const textResponse = await fetch(firstFile.Url);
          
          if (!textResponse.ok) {
            throw new Error(`Failed to fetch converted text: ${textResponse.status} ${textResponse.statusText}`);
          }
          
          textContent = await textResponse.text();
          console.log(`✅ PDF converted to text: ${textContent.length} characters`);
          return textContent;
        }
      } else if (result.files && result.files.length > 0) {
        // Alternative response structure (lowercase 'files')
        const firstFile = result.files[0];
        if (firstFile && firstFile.url) {
          console.log('📄 Fetching text from URL:', firstFile.url);
          
          const textResponse = await fetch(firstFile.url);
          
          if (!textResponse.ok) {
            throw new Error(`Failed to fetch converted text: ${textResponse.status} ${textResponse.statusText}`);
          }
          
          textContent = await textResponse.text();
          console.log(`✅ PDF converted to text: ${textContent.length} characters`);
          return textContent;
        }
      } else if (result.file && result.file.url) {
        // Single file response structure
        console.log('📄 Fetching text from URL:', result.file.url);
        
        const textResponse = await fetch(result.file.url);
        
        if (!textResponse.ok) {
          throw new Error(`Failed to fetch converted text: ${textResponse.status} ${textResponse.statusText}`);
        }
        
        textContent = await textResponse.text();
        console.log(`✅ PDF converted to text: ${textContent.length} characters`);
        return textContent;
      } else if (result.url) {
        // Direct URL response structure
        console.log('📄 Fetching text from URL:', result.url);
        
        const textResponse = await fetch(result.url);
        
        if (!textResponse.ok) {
          throw new Error(`Failed to fetch converted text: ${textResponse.status} ${textResponse.statusText}`);
        }
        
        textContent = await textResponse.text();
        console.log(`✅ PDF converted to text: ${textContent.length} characters`);
        return textContent;
      }
      
      console.error('❌ No valid text data found in response:', result);
      throw new Error('ConvertAPI did not return any valid text data');
      
    } catch (error) {
      console.error('❌ ConvertAPI conversion failed:', error);
      throw error;
    }
  }

  /**
   * Extract brand guidelines from text (calls server-side API)
   * @param {string} text - Extracted text
   * @param {string} companyName - Company name
   * @returns {Promise<Object>} Brand guidelines
   */
  async extractBrandGuidelines(text, companyName) {
    console.log('🔍 Extracting brand guidelines from text...');
    
    try {
      // Try perfect extraction first
      const response = await fetch('/api/extract-brand-guidelines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          companyName,
          usePerfectExtractor: true // Flag to use perfect extractor
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const guidelines = await response.json();
      
      console.log('✅ Brand guidelines extracted:', {
        colors: guidelines.colors?.palette?.length || 0,
        fonts: guidelines.typography?.fonts_found?.length || 0,
        hasLogo: !!guidelines.logo?.size || !!guidelines.logo?.clear_space,
        confidence: guidelines.metadata?.confidence_score || 0,
        method: guidelines.metadata?.extraction_method || 'unknown'
      });
      
      return guidelines;
    } catch (error) {
      console.error('❌ Failed to extract brand guidelines:', error);
      throw error;
    }
  }

  /**
   * Set API key
   * @param {string} apiKey - ConvertAPI secret
   */
  setApiKey(apiKey) {
    // Trim whitespace and validate
    const trimmedKey = apiKey ? apiKey.trim() : '';
    
    this.apiKey = trimmedKey;
    this.isAvailable = !!trimmedKey && trimmedKey.length > 10; // ConvertAPI keys are usually long
    
    console.log('🔑 API Key set:', {
      hasKey: !!trimmedKey,
      keyLength: trimmedKey ? trimmedKey.length : 0,
      keyPreview: trimmedKey ? `${trimmedKey.substring(0, 8)}...` : 'None',
      isValid: this.isAvailable,
      keyFormat: trimmedKey ? (trimmedKey.includes('-') ? 'Contains dashes' : 'No dashes') : 'None'
    });
    
    if (browser) {
      localStorage.setItem('convertapi_secret', trimmedKey);
    }
  }
}

// Export singleton instance
export const convertAPIClient = new ConvertAPIClient();