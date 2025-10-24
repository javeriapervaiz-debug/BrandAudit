/**
 * LLM Configuration
 * Centralized configuration for LLM providers and settings
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

export const LLM_CONFIG = {
  // Available providers
  providers: {
    google: {
      name: 'Google AI (Gemini)',
      models: ['gemini-flash-latest', 'gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'],
      defaultModel: 'gemini-flash-latest',
      maxTokens: 4000,
      temperature: 0.2,
      costPer1kTokens: 0 // FREE! Google AI offers free tier
    },
    local: {
      name: 'Local LLM',
      models: ['llama3', 'mistral', 'phi3', 'gemma'],
      defaultModel: 'llama3',
      maxTokens: 4000,
      temperature: 0.2,
      costPer1kTokens: 0 // Free when running locally
    }
  },

  // Default settings
  defaults: {
    provider: 'google', // Changed to Google AI as default (free)
    confidenceThreshold: 0.6,
    maxTextLength: 12000,
    enableRAG: true,
    enableFallback: true
  },

  // API Keys (should be set via environment variables)
  apiKeys: {
    google: null // Will be set dynamically
  },

  // Local LLM settings
  localLLM: {
    ollama: {
      baseUrl: 'http://localhost:11434',
      timeout: 30000
    },
    lmStudio: {
      baseUrl: 'http://localhost:1234',
      timeout: 30000
    }
  }
};

/**
 * Get LLM configuration for a specific provider
 */
export function getLLMConfig(provider = LLM_CONFIG.defaults.provider) {
  const config = LLM_CONFIG.providers[provider];
  if (!config) {
    throw new Error(`LLM provider '${provider}' not supported`);
  }
  
  return {
    ...config,
    apiKey: LLM_CONFIG.apiKeys[provider],
    isConfigured: !!LLM_CONFIG.apiKeys[provider]
  };
}

/**
 * Check if a provider is properly configured
 */
export function isProviderConfigured(provider) {
  const config = getLLMConfig(provider);
  return config.isConfigured;
}

/**
 * Get available providers that are configured
 */
export function getAvailableProviders() {
  return Object.keys(LLM_CONFIG.providers).filter(provider => 
    provider === 'local' || isProviderConfigured(provider)
  );
}

/**
 * Estimate cost for LLM processing
 */
export function estimateCost(textLength, provider = LLM_CONFIG.defaults.provider) {
  const config = getLLMConfig(provider);
  const tokens = Math.ceil(textLength / 4); // Rough estimate: 4 chars per token
  const cost = (tokens / 1000) * config.costPer1kTokens;
  
  return {
    tokens,
    cost: cost.toFixed(6),
    currency: 'USD'
  };
}

export const getGoogleAIAPIKey = () => {
  // Server-side: use process.env
  if (typeof process !== 'undefined' && process.env?.GOOGLE_AI_API_KEY) {
    console.log('🔑 Google AI API key found in process.env');
    return process.env.GOOGLE_AI_API_KEY;
  }
  // Client-side: use import.meta.env (but this should be avoided for API keys)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_AI_API_KEY) {
    console.log('🔑 Google AI API key found in import.meta.env');
    return import.meta.env.VITE_GOOGLE_AI_API_KEY;
  }
  console.log('⚠️ Google AI API key not found in environment variables');
  return null;
};
