// Test Comprehensive Extractor with Enhanced Color & Spacing Focus
import { ComprehensiveExtractor } from './src/lib/services/comprehensiveExtractor.js';
import dotenv from 'dotenv';

dotenv.config();

async function testComprehensiveExtractor() {
  console.log('🧪 Testing Comprehensive Extractor with Enhanced Focus...\n');
  
  try {
    const extractor = new ComprehensiveExtractor();
    console.log('✅ Comprehensive Extractor initialized');
    
    // Test with Buffer brand guidelines sample (more comprehensive)
    const sampleText = `
    Buffer Brand Guidelines
    
    PRIMARY COLORS:
    Black #231F20
    Blue #2C4BFF  
    Yellow #FADE2A
    White #FFFFFF
    
    SECONDARY COLORS:
    Dark Blue #121E66
    Light Blue #6B81FF
    Lighter Red #F3AFB9  
    Light Orange #FF9B6B
    
    FULL COLOR PALETTE:
    Reds: #F3AFB9, #E97284, #E0364F, #9D2637, #5A1620
    Oranges: #FFC6AB, #FF9B6B, #FF702C, #B34E1F, #662D12
    Yellows: #FDF2AA, #FCE86A, #FADE2A, #A8961D, #645911
    Greens: #CFE7A6, #ABD464, #87C221, #5F8817, #364E0D
    Teals: #99E9EC, #4DD9DD, #00C8CF, #008C91, #005053
    Blues: #ABB7FF, #6B81FF, #2C4BFF, #1F35B3, #121E66
    Purples: #D7AAFF, #BA6BFF, #9C2BFF, #6D1EB3, #3E1166
    Pinks: #F0A8DE, #E466C5, #D925AC, #981A78, #570F45
    Grays: #F5F5F5, #E0E0E0, #B8B8B8, #636363, #3D3D3D
    
    TYPOGRAPHY:
    Primary Font: Poppins (Bold, 800) - 18px for headings
    Secondary Font: Roboto (Bold) - 16px for body text
    
    LOGO:
    Use the full logo whenever possible
    Use the icon separately
    Use the icon in the white version on dark backgrounds
    On colored light backgrounds use the black logo
    Use the navy logo only on white and light gray backgrounds
    On dark backgrounds use the white logo
    Do not change the color of the logo
    Do not mix colors together
    Do not use the navy logo on a colored background
    Do not outline the logo
    Do not change proportions of the logo
    Do not use the stacked version of the logo
    Clear space: Defined by 'x' unit
    
    SPACING:
    8pt grid system
    Base unit: 8px
    Section gap: 64px
    Component gap: 24px
    Whitespace: x x x x (spacing indicators)
    Clear space around logo for breathing room
    `;
    
    console.log('📝 Testing comprehensive extraction with enhanced focus...');
    const result = await extractor.extractWithEnhancedFocus(sampleText, 'Buffer');
    
    console.log('✅ Comprehensive extraction completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Comprehensive extraction failed:', error.message);
    console.error('📊 Error details:', error);
  }
}

testComprehensiveExtractor();

