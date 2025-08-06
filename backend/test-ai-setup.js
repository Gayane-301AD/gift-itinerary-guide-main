// Test script to verify AI setup
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAISetup() {
  console.log('🚀 Testing AI Setup...\n');
  
  // Check if API key is configured
  const apiKey = process.env.GEMMA_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMMA_API_KEY not found in environment variables');
    return;
  }
  
  if (apiKey === 'your-actual-google-gemini-api-key-here') {
    console.error('❌ GEMMA_API_KEY is still set to placeholder value');
    console.log('   Please replace it with your actual Google Gemini API key');
    console.log('   Get one from: https://ai.google.dev/');
    return;
  }
  
  console.log('✅ API key found (length:', apiKey.length, ')');
  
  // Test the Google Generative AI connection
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('✅ Google Generative AI client initialized');
    
    // List available models first
    console.log('📋 Checking available models...');
    
    try {
      const models = await genAI.listModels();
      console.log('Available models:');
      models.forEach(model => {
        console.log('  -', model.name);
      });
    } catch (listError) {
      console.log('Could not list models, trying common model names...');
    }
    
    // Try different model names
    const modelNames = [
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'models/gemini-2.0-flash-exp',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro'
    ];
    
    for (const modelName of modelNames) {
      try {
        console.log(`🧪 Testing model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent("Hello! Can you help me with gift recommendations?");
        const response = result.response.text();
        
        console.log('✅ AI response received!');
        console.log('Working model:', modelName);
        console.log('Response preview:', response.substring(0, 100) + '...');
        
        console.log('\n🎉 AI setup is working correctly!');
        console.log('   Use this model name in your code:', modelName);
        return modelName;
        
      } catch (modelError) {
        console.log(`   ❌ ${modelName} failed:`, modelError.message);
        continue;
      }
    }
    
    console.error('❌ None of the common models worked');
    
  } catch (error) {
    console.error('❌ Error testing AI connection:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('   This is likely an invalid API key issue.');
      console.log('   Please verify your Google Gemini API key is correct.');
    } else if (error.message.includes('quota')) {
      console.log('   You may have exceeded your API quota.');
      console.log('   Check your Google AI Studio usage dashboard.');
    } else {
      console.log('   Please check your internet connection and API key.');
    }
  }
}

// Run the test
testAISetup().catch(console.error);