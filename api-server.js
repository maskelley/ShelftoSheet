const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { OpenAI } = require('openai');
const fs = require('fs');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = 3000;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json({limit: '50mb'}));

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Add these constants for CORS proxy
const USE_CORS_PROXY = true;
const CORS_PROXY_URL = 'https://corsproxy.io/';
const OPENAI_BASE_URL = 'https://api.openai.com';

// Get API key from environment
const getApiKey = () => {
  const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  
  // Debug log API key presence (not the actual key)
  console.log(`API key found: ${apiKey ? 'Yes' : 'No'}`);
  
  if (!apiKey) {
    console.error('OpenAI API key not found in environment variables');
    console.error('Available env vars:', Object.keys(process.env));
    
    // Check if .env file exists
    try {
      const envContent = fs.readFileSync('.env', 'utf8');
      console.log('Content of .env file (keys only):', 
        envContent.split('\n')
          .filter(line => line.trim())
          .map(line => line.split('=')[0])
      );
    } catch (err) {
      console.error('.env file read error:', err.message);
    }
  }
  
  return apiKey;
};

// Create OpenAI client
const createOpenAIClient = (apiKey) => {
  if (USE_CORS_PROXY) {
    console.log('Using CORS proxy for OpenAI API calls');
    // We'll use axios instead of the OpenAI SDK since we need to route through a proxy
    return null; // We'll use axios directly below
  } else {
    return new OpenAI({
      apiKey: apiKey,
    });
  }
};

// Proxy endpoint for OpenAI Vision API
app.post('/api/vision', async (req, res) => {
  console.log('Vision API request received');
  try {
    const { imageData, productType } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'Missing image data' });
    }
    
    console.log(`Processing ${productType || 'unknown'} product image`);
    console.log(`Image data type: ${typeof imageData}`);
    console.log(`Image data length: ${imageData.length}`);
    
    // Get API key
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({ error: 'API key is missing' });
    }

    // Format the image content as before
    const isUrl = imageData.startsWith('http');
    let imageContent;
    
    if (isUrl) {
      imageContent = imageData;
      console.log(`Using URL image: ${imageData.substring(0, 30)}...`);
    } else {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      imageContent = `data:image/jpeg;base64,${base64Data}`;
      console.log(`Using base64 image (length: ${base64Data.length})`);
    }
    
    // Prepare payload for OpenAI API
    const payload = {
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: `You are a product identification assistant. Identify ${productType} products in the image.`
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `What ${productType} products do you see? Return results as a JSON array with format: [{"name": "Product Name", "brand": "Brand Name", "confidence": 0.95}]`
            },
            { 
              type: "image_url",
              image_url: { url: imageContent }
            }
          ]
        }
      ],
      max_tokens: 1000
    };

    let response;
    
    if (USE_CORS_PROXY) {
      // Use axios with CORS proxy
      console.log('Sending request through CORS proxy');
      response = await axios.post(
        `${CORS_PROXY_URL}?${OPENAI_BASE_URL}/v1/chat/completions`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Format the response to match OpenAI SDK format
      response = response.data;
    } else {
      // Use the OpenAI SDK directly
      const openai = createOpenAIClient(apiKey);
      response = await openai.chat.completions.create(payload);
    }

    console.log('OpenAI API response received');
    res.json(response);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      console.error('Error request:', error.request._currentUrl || error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    res.status(500).json({ 
      error: 'Failed to process image',
      details: error.response?.data || error.message,
      stack: error.stack
    });
  }
});

// Endpoint for product type detection
app.post('/api/detect-type', async (req, res) => {
  console.log('Detect type API request received');
  try {
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'Missing image data' });
    }
    
    console.log(`Image data type: ${typeof imageData}`);
    console.log(`Image data length: ${imageData.length}`);
    
    // Get API key
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({ error: 'API key is missing' });
    }

    // Format the image content as before
    const isUrl = imageData.startsWith('http');
    let imageContent;
    
    if (isUrl) {
      imageContent = imageData;
      console.log(`Using URL image: ${imageData.substring(0, 30)}...`);
    } else {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      imageContent = `data:image/jpeg;base64,${base64Data}`;
      console.log(`Using base64 image (length: ${base64Data.length})`);
    }
    
    // Prepare payload for OpenAI API
    const payload = {
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "You are a product category detection assistant."
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "What type of products are shown? Answer with: beverage, dairy, cereal, vegetable, snack, bakery, meat, seafood, or unknown." 
            },
            { 
              type: "image_url",
              image_url: { url: imageContent }
            }
          ]
        }
      ],
      max_tokens: 50
    };

    let response;
    
    if (USE_CORS_PROXY) {
      // Use axios with CORS proxy
      console.log('Sending request through CORS proxy');
      response = await axios.post(
        `${CORS_PROXY_URL}?${OPENAI_BASE_URL}/v1/chat/completions`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Format the response
      const productType = response.data.choices[0].message.content.trim().toLowerCase();
      const validTypes = ["beverage", "dairy", "cereal", "vegetable", "snack", "bakery", "meat", "seafood"];
      
      return res.json({ 
        productType: validTypes.includes(productType) ? productType : "unknown" 
      });
    } else {
      // Use the OpenAI SDK directly
      const openai = createOpenAIClient(apiKey);
      response = await openai.chat.completions.create(payload);
      
      const productType = response.choices[0].message.content.trim().toLowerCase();
      const validTypes = ["beverage", "dairy", "cereal", "vegetable", "snack", "bakery", "meat", "seafood"];
      
      return res.json({ 
        productType: validTypes.includes(productType) ? productType : "unknown" 
      });
    }
  } catch (error) {
    console.error('Error detecting product type:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      console.error('Error request:', error.request._currentUrl || error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    res.status(500).json({ 
      error: 'Failed to detect product type',
      details: error.response?.data || error.message,
      stack: error.stack
    });
  }
});

// Add a simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`API proxy server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Test if API key is available
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('⚠️ WARNING: OpenAI API key not found! Server may not work correctly.');
    console.warn('Make sure you have a .env file with VITE_OPENAI_API_KEY or OPENAI_API_KEY');
  } else {
    console.log('✓ OpenAI API key found');
  }

  // Check health endpoint
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
});