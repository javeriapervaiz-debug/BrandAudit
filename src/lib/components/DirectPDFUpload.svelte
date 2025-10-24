<script>
  import { convertAPIClient } from '$lib/services/pdf-extraction/convertapiClient.js';
  import { onMount } from 'svelte';

  let pdfFile = null;
  let companyName = '';
  let isProcessing = false;
  let extractedText = '';
  let brandGuidelines = null;
  let error = '';
  let apiKey = '';

  onMount(() => {
    // Check if API key is available
    apiKey = convertAPIClient.apiKey;
  });

  async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      pdfFile = file;
      error = '';
    } else {
      error = 'Please select a valid PDF file';
    }
  }

  async function processPDF() {
    if (!pdfFile || !companyName.trim()) {
      error = 'Please select a PDF file and enter a company name';
      return;
    }

    if (!convertAPIClient.isAvailable) {
      error = 'ConvertAPI not available. Please set your API key.';
      return;
    }

    isProcessing = true;
    error = '';
    extractedText = '';
    brandGuidelines = null;

    try {
      console.log('🔄 Processing PDF with ConvertAPI...');
      
      // Convert PDF to text
      extractedText = await convertAPIClient.convertPdfToText(pdfFile);
      
      // Extract brand guidelines from text
      brandGuidelines = convertAPIClient.extractBrandGuidelines(extractedText, companyName);
      
      console.log('✅ PDF processing completed:', brandGuidelines);
      
    } catch (err) {
      console.error('❌ PDF processing failed:', err);
      error = `Processing failed: ${err.message}`;
    } finally {
      isProcessing = false;
    }
  }

  function setApiKey() {
    if (apiKey.trim()) {
      convertAPIClient.setApiKey(apiKey.trim());
      error = '';
    } else {
      error = 'Please enter a valid API key';
    }
  }

  function downloadText() {
    if (extractedText) {
      const blob = new Blob([extractedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${companyName || 'extracted'}_text.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  function downloadGuidelines() {
    if (brandGuidelines) {
      const blob = new Blob([JSON.stringify(brandGuidelines, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${companyName || 'brand'}_guidelines.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
</script>

<div class="direct-pdf-upload">
  <h2>🔄 Direct PDF to Text Conversion</h2>
  
  <!-- API Key Setup -->
  <div class="api-key-section">
    <h3>ConvertAPI Setup</h3>
    <div class="input-group">
      <input 
        type="password" 
        bind:value={apiKey} 
        placeholder="Enter your ConvertAPI secret"
        class="api-key-input"
      />
      <button on:click={setApiKey} class="set-key-btn">
        Set API Key
      </button>
    </div>
    <p class="api-status">
      Status: {convertAPIClient.isAvailable ? '✅ Available' : '❌ Not Available'}
    </p>
  </div>

  <!-- File Upload -->
  <div class="upload-section">
    <h3>PDF Upload</h3>
    <div class="input-group">
      <input 
        type="file" 
        accept=".pdf" 
        on:change={handleFileSelect}
        class="file-input"
      />
    </div>
    {#if pdfFile}
      <p class="file-info">📄 Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)</p>
    {/if}
  </div>

  <!-- Company Name -->
  <div class="company-section">
    <h3>Company Information</h3>
    <div class="input-group">
      <input 
        type="text" 
        bind:value={companyName} 
        placeholder="Enter company name"
        class="company-input"
      />
    </div>
  </div>

  <!-- Process Button -->
  <div class="process-section">
    <button 
      on:click={processPDF} 
      disabled={isProcessing || !pdfFile || !companyName.trim() || !convertAPIClient.isAvailable}
      class="process-btn"
    >
      {isProcessing ? '🔄 Processing...' : '🚀 Process PDF'}
    </button>
  </div>

  <!-- Error Display -->
  {#if error}
    <div class="error-message">
      ❌ {error}
    </div>
  {/if}

  <!-- Results -->
  {#if extractedText}
    <div class="results-section">
      <h3>📄 Extracted Text</h3>
      <div class="text-preview">
        <textarea 
          value={extractedText} 
          readonly 
          class="text-area"
          rows="10"
        ></textarea>
        <button on:click={downloadText} class="download-btn">
          💾 Download Text
        </button>
      </div>
    </div>
  {/if}

  {#if brandGuidelines}
    <div class="guidelines-section">
      <h3>🎨 Brand Guidelines</h3>
      <div class="guidelines-preview">
        <pre class="guidelines-json">{JSON.stringify(brandGuidelines, null, 2)}</pre>
        <button on:click={downloadGuidelines} class="download-btn">
          💾 Download Guidelines
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .direct-pdf-upload {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  .api-key-section,
  .upload-section,
  .company-section,
  .process-section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #f9f9f9;
  }

  .input-group {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }

  .api-key-input,
  .company-input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }

  .file-input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
  }

  .set-key-btn,
  .process-btn {
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .set-key-btn:hover,
  .process-btn:hover {
    background: #0056b3;
  }

  .process-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .api-status {
    margin: 10px 0;
    font-weight: bold;
  }

  .file-info {
    margin: 10px 0;
    color: #666;
  }

  .error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 15px;
    border-radius: 4px;
    margin: 20px 0;
  }

  .results-section,
  .guidelines-section {
    margin-top: 30px;
    padding: 20px;
    border: 1px solid #d4edda;
    border-radius: 8px;
    background: #d1ecf1;
  }

  .text-preview,
  .guidelines-preview {
    position: relative;
  }

  .text-area {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    resize: vertical;
  }

  .guidelines-json {
    background: white;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    max-height: 400px;
    overflow-y: auto;
  }

  .download-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 8px 12px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }

  .download-btn:hover {
    background: #218838;
  }

  h2, h3 {
    color: #333;
    margin-bottom: 15px;
  }

  h2 {
    text-align: center;
    color: #007bff;
  }
</style>
