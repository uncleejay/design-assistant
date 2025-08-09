require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration for Figma plugins - more permissive
app.use((req, res, next) => {
  // Set CORS headers for all requests
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Rate limiting - prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Main critique endpoint
app.post('/api/critique', async (req, res) => {
  try {
    // Validate request
    if (!req.body || !req.body.messages) {
      return res.status(400).json({
        error: 'Invalid request format',
        code: 'INVALID_REQUEST'
      });
    }

    // Validate OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'Server configuration error',
        code: 'SERVER_CONFIG_ERROR'
      });
    }

    // Add request validation
    const payload = {
      model: req.body.model || 'gpt-3.5-turbo',
      messages: req.body.messages,
      max_tokens: Math.min(req.body.max_tokens || 1000, 2000), // Cap max tokens
      temperature: req.body.temperature || 0.7
    };

    // Making OpenAI request

    // Make request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Figma-Design-Critique-Plugin/1.0'
      },
      body: JSON.stringify(payload)
    });

    // Handle OpenAI response
    if (!response.ok) {
      const errorText = await response.text();
      
      // Return user-friendly error messages
      let userMessage = 'Failed to get design critique';
      if (response.status === 429) {
        userMessage = 'API rate limit exceeded. Please try again in a few minutes.';
      } else if (response.status === 401) {
        userMessage = 'Authentication failed. Please contact support.';
      } else if (response.status >= 500) {
        userMessage = 'OpenAI service is temporarily unavailable. Please try again later.';
      }

      return res.status(response.status).json({
        error: userMessage,
        code: 'OPENAI_API_ERROR',
        statusCode: response.status
      });
    }

    const data = await response.json();

    // Validate OpenAI response format
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({
        error: 'Invalid response from AI service',
        code: 'INVALID_RESPONSE'
      });
    }

    // Successful request

    // Return the critique content
    res.json({
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  res.status(500).json({
    error: 'Internal server error',
    code: 'SERVER_ERROR'
  });
});

app.listen(PORT, () => {
  // Server started - production mode (no logging)
});

module.exports = app;
