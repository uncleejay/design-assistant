// =============================================================================
// DESIGN CRITIQUE ASSISTANT - FIGMA PLUGIN
// Bundled version for Figma compatibility
// =============================================================================

// Configuration
var CONFIG = {
  API: {
    BASE_URL: 'https://api.openai.com/v1',
    MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7,
    TIMEOUT: 30000,
    ENDPOINT: '/chat/completions'
  },
  UI: {
    WIDTH: 400,
    HEIGHT: 600,
    ANIMATION_DURATION: 200
  },
  CACHE: {
    TTL: 5 * 60 * 1000, // 5 minutes
    MAX_SIZE: 100
  },
  STORAGE: {
    API_KEY_KEY: 'figma-critique-api-key'
  },
  DESIGN: {
    MAX_ELEMENTS_FOR_ANALYSIS: 1000,
    MAX_TEXT_LENGTH: 10000
  }
};

// Message types
var MESSAGE_TYPES = {
  PLUGIN_LOADED: 'plugin-loaded',
  SELECTION_UPDATED: 'selection-updated',
  CRITIQUE_RECEIVED: 'critique-received',
  ERROR: 'error',
  GET_SELECTION: 'get-selection',
  GET_CRITIQUE: 'get-critique',
  CLOSE: 'close',
  RESIZE_WINDOW: 'resize-window'
};

// Error codes
var ERROR_CODES = {
  INVALID_API_KEY: 'INVALID_API_KEY',
  API_REQUEST_FAILED: 'API_REQUEST_FAILED',
  NO_ELEMENTS_SELECTED: 'NO_ELEMENTS_SELECTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  ANALYSIS_FAILED: 'ANALYSIS_FAILED'
};

// Logger utility
function Logger() {}
Logger.isDevelopment = false; // Set to false for production

Logger.info = function(message, data) {
  // Only log in development mode
  if (Logger.isDevelopment) {
    console.log('[INFO] ' + message);
  }
};

Logger.error = function(message, error) {
  // Always log errors
  console.error('[ERROR] ' + message);
};

Logger.debug = function(message, data) {
  // Only log debug info in development
  if (Logger.isDevelopment) {
    console.log('[DEBUG] ' + message);
  }
};

Logger.warn = function(message, data) {
  // Always log warnings
  console.warn('[WARN] ' + message);
};

Logger.time = function(label, startTime) {
  if (Logger.isDevelopment) {
    var duration = Date.now() - startTime;
    console.log(label + ' completed in ' + duration + 'ms');
  }
};

// Validation utilities
function ValidationError(message, code, details) {
  this.message = message;
  this.name = 'ValidationError';
  this.code = code;
  this.details = details || {};
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

function Validators() {}

Validators.validateApiKey = function(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    throw new ValidationError(
      'API key is required and must be a string',
      ERROR_CODES.INVALID_API_KEY
    );
  }

  if (apiKey.trim().length === 0) {
    throw new ValidationError(
      'API key cannot be empty',
      ERROR_CODES.INVALID_API_KEY
    );
  }

  if (apiKey.length < 10) {
    throw new ValidationError(
      'API key appears to be too short',
      ERROR_CODES.INVALID_API_KEY
    );
  }

  if (!apiKey.startsWith('sk-')) {
    throw new ValidationError(
      'API key should start with "sk-"',
      ERROR_CODES.INVALID_API_KEY
    );
  }

  return true;
};

Validators.validateDesignElements = function(nodes) {
  if (!Array.isArray(nodes)) {
    throw new ValidationError(
      'Design elements must be an array',
      ERROR_CODES.NO_ELEMENTS_SELECTED
    );
  }

  if (nodes.length === 0) {
    throw new ValidationError(
      'Please select at least one design element',
      ERROR_CODES.NO_ELEMENTS_SELECTED
    );
  }

  if (nodes.length > CONFIG.DESIGN.MAX_ELEMENTS_FOR_ANALYSIS) {
    throw new ValidationError(
      'Too many elements selected (' + nodes.length + '). Maximum allowed is ' + CONFIG.DESIGN.MAX_ELEMENTS_FOR_ANALYSIS,
      ERROR_CODES.ANALYSIS_FAILED
    );
  }

  return true;
};

Validators.validateContext = function(context) {
  if (context && typeof context !== 'string') {
    throw new ValidationError(
      'Context must be a string',
      ERROR_CODES.INVALID_RESPONSE
    );
  }

  if (context && context.length > CONFIG.DESIGN.MAX_TEXT_LENGTH) {
    throw new ValidationError(
      'Context is too long (' + context.length + ' characters). Maximum allowed is ' + CONFIG.DESIGN.MAX_TEXT_LENGTH,
      ERROR_CODES.INVALID_RESPONSE
    );
  }

  return true;
};

Validators.validateDesignInfo = function(designInfo) {
  if (!designInfo || typeof designInfo !== 'object') {
    throw new ValidationError(
      'Design info must be an object',
      ERROR_CODES.INVALID_RESPONSE
    );
  }

  var requiredFields = ['count', 'types', 'colors', 'fonts', 'elements', 'dimensions'];
  for (var i = 0; i < requiredFields.length; i++) {
    var field = requiredFields[i];
    if (!(field in designInfo)) {
      throw new ValidationError(
        'Design info missing required field: ' + field,
        ERROR_CODES.INVALID_RESPONSE
      );
    }
  }

  return true;
};

// Secure storage utility
function SecureStorage() {}

SecureStorage.setApiKey = function(apiKey) {
  try {
    sessionStorage.setItem(CONFIG.STORAGE.API_KEY_KEY, apiKey);
    Logger.debug('API key stored successfully');
  } catch (error) {
    Logger.error('Failed to store API key', error);
    throw new Error('Failed to store API key securely');
  }
};

SecureStorage.getApiKey = function() {
  try {
    return sessionStorage.getItem(CONFIG.STORAGE.API_KEY_KEY);
  } catch (error) {
    Logger.error('Failed to retrieve API key', error);
    return null;
  }
};

SecureStorage.clearApiKey = function() {
  try {
    sessionStorage.removeItem(CONFIG.STORAGE.API_KEY_KEY);
    Logger.debug('API key cleared successfully');
  } catch (error) {
    Logger.error('Failed to clear API key', error);
  }
};

SecureStorage.hasApiKey = function() {
  return this.getApiKey() !== null;
};

// Design analyzer
function DesignAnalyzer() {
  this.cache = new Map();
  this.colorSet = new Set();
  this.fontSet = new Set();
  this.typeSet = new Set();
  this.elementCount = 0;
  this.totalWidth = 0;
  this.totalHeight = 0;
  this.textContent = [];
  this.elements = [];
}

DesignAnalyzer.prototype.analyze = function(nodes) {
  var startTime = Date.now();
  
  try {
    Validators.validateDesignElements(nodes);
    this._resetState();
    
    for (var i = 0; i < nodes.length; i++) {
      this._analyzeNode(nodes[i]);
    }
    
    var result = this._buildResult(nodes.length);
    Logger.time('Design analysis', startTime);
    return result;
    
  } catch (error) {
    Logger.error('Design analysis failed', error);
    throw error;
  }
};

DesignAnalyzer.prototype._resetState = function() {
  this.colorSet.clear();
  this.fontSet.clear();
  this.typeSet.clear();
  this.elementCount = 0;
  this.totalWidth = 0;
  this.totalHeight = 0;
  this.textContent = [];
  this.elements = [];
};

DesignAnalyzer.prototype._analyzeNode = function(node) {
  try {
    var elementInfo = {
      type: node.type,
      name: node.name || 'Unnamed',
      id: node.id
    };
    
    this.elements.push(elementInfo);
    this.typeSet.add(node.type);
    this.elementCount++;
    
    this._extractColors(node);
    this._extractTextInfo(node);
    this._extractDimensions(node);
    this._analyzeChildren(node);
    
  } catch (error) {
    Logger.warn('Error analyzing node: ' + (node.name || 'unnamed'), error);
  }
};

DesignAnalyzer.prototype._extractColors = function(node) {
  if ('fills' in node && node.fills && Array.isArray(node.fills)) {
    for (var i = 0; i < node.fills.length; i++) {
      var fill = node.fills[i];
      if (fill.type === 'SOLID' && fill.color) {
        var color = this._rgbToString(fill.color);
        this.colorSet.add(color);
      }
    }
  }
  
  if ('strokes' in node && node.strokes && Array.isArray(node.strokes)) {
    for (var i = 0; i < node.strokes.length; i++) {
      var stroke = node.strokes[i];
      if (stroke.type === 'SOLID' && stroke.color) {
        var color = this._rgbToString(stroke.color);
        this.colorSet.add(color);
      }
    }
  }
};

DesignAnalyzer.prototype._extractTextInfo = function(node) {
  if (node.type === 'TEXT') {
    if (node.characters) {
      this.textContent.push(node.characters);
    }
    
    if (node.fontName) {
      var font = node.fontName.family + ' ' + node.fontName.style;
      this.fontSet.add(font);
    }
  }
};

DesignAnalyzer.prototype._extractDimensions = function(node) {
  if (node.width && node.height) {
    this.totalWidth += node.width;
    this.totalHeight += node.height;
  }
};

DesignAnalyzer.prototype._analyzeChildren = function(node) {
  if ('children' in node && node.children && Array.isArray(node.children)) {
    for (var i = 0; i < node.children.length; i++) {
      var child = node.children[i];
      if (child && typeof child === 'object') {
        this._analyzeNode(child);
      }
    }
  }
};

DesignAnalyzer.prototype._rgbToString = function(color) {
  var r = Math.round(color.r * 255);
  var g = Math.round(color.g * 255);
  var b = Math.round(color.b * 255);
  return 'rgb(' + r + ', ' + g + ', ' + b + ')';
};

DesignAnalyzer.prototype._buildResult = function(topLevelCount) {
  return {
    count: this.elementCount,
    types: Array.from(this.typeSet),
    colors: Array.from(this.colorSet),
    fonts: Array.from(this.fontSet),
    textContent: this.textContent,
    elements: this.elements,
    dimensions: {
      totalWidth: Math.round(this.totalWidth),
      totalHeight: Math.round(this.totalHeight)
    },
    summary: this._generateSummary(topLevelCount)
  };
};

DesignAnalyzer.prototype._generateSummary = function(topLevelCount) {
  var typeList = Array.from(this.typeSet).join(', ');
  return 'Selected ' + topLevelCount + ' top-level element(s) containing ' + this.elementCount + ' total elements of type(s): ' + typeList;
};

DesignAnalyzer.prototype.clearCache = function() {
  this.cache.clear();
};

// API client
function ApiError(message, code, statusCode, response) {
  this.message = message;
  this.name = 'ApiError';
  this.code = code;
  this.statusCode = statusCode || null;
  this.response = response || null;
}

ApiError.prototype = Object.create(Error.prototype);
ApiError.prototype.constructor = ApiError;

function ApiClient() {
  this.baseUrl = CONFIG.API.BASE_URL;
  this.timeout = CONFIG.API.TIMEOUT;
  this.retryAttempts = 3;
  this.retryDelay = 1000;
}

ApiClient.prototype.getDesignCritique = function(designInfo, apiKey, context) {
  context = context || '';
  var startTime = Date.now();
  
  try {
    Validators.validateApiKey(apiKey);
    Validators.validateDesignInfo(designInfo);
    Validators.validateContext(context);
    
    Logger.info('Making API request to OpenAI', {
      model: CONFIG.API.MODEL,
      maxTokens: CONFIG.API.MAX_TOKENS
    });
    
    var self = this;
    return this._makeRequest(designInfo, apiKey, context).then(function(response) {
      Logger.time('API request', startTime);
      return response;
    });
    
  } catch (error) {
    Logger.error('API request failed', error);
    throw error;
  }
};

ApiClient.prototype._makeRequest = function(designInfo, apiKey, context) {
  var self = this;
  var lastError;
  
  return new Promise(function(resolve, reject) {
    function attempt(attemptNumber) {
      self._performRequest(designInfo, apiKey, context).then(function(response) {
        resolve(response);
      }).catch(function(error) {
        lastError = error;
        
        if (error instanceof ValidationError || (error.statusCode && error.statusCode >= 400 && error.statusCode < 500)) {
          reject(error);
          return;
        }
        
        if (attemptNumber < self.retryAttempts) {
          Logger.warn('API request failed, retrying (' + attemptNumber + '/' + self.retryAttempts + ')', error);
          setTimeout(function() {
            attempt(attemptNumber + 1);
          }, self.retryDelay * attemptNumber);
        } else {
          reject(new ApiError(
            'API request failed after ' + self.retryAttempts + ' attempts',
            'API_REQUEST_FAILED',
            lastError ? lastError.statusCode : null,
            lastError ? lastError.response : null
          ));
        }
      });
    }
    
    attempt(1);
  });
};

ApiClient.prototype._performRequest = function(designInfo, apiKey, context) {
  var payload = this._buildPayload(designInfo, context);
  var self = this;
  
  Logger.debug('API request payload', {
    model: payload.model,
    maxTokens: payload.max_tokens,
    hasDesignInfo: !!designInfo
  });
  
  return new Promise(function(resolve, reject) {
    try {
      // Send request to UI to make the actual API call
      var requestId = Date.now() + Math.random();
      
      // Store the promise resolution functions
      self.pendingRequests = self.pendingRequests || {};
      self.pendingRequests[requestId] = { resolve: resolve, reject: reject };
      
      // Send message to UI to make the API request
      figma.ui.postMessage({
        type: 'make-api-request',
        requestId: requestId,
        payload: payload,
        apiKey: apiKey,
        timeout: self.timeout
      });
      
      // Set timeout for the request
      setTimeout(function() {
        if (self.pendingRequests[requestId]) {
          delete self.pendingRequests[requestId];
          reject(new ApiError(
            'API request timed out',
            'API_TIMEOUT',
            408
          ));
        }
      }, self.timeout);
      
    } catch (error) {
      reject(new ApiError(
        'Failed to make API request: ' + error.message,
        'NETWORK_ERROR',
        null
      ));
    }
  });
};

ApiClient.prototype._buildPayload = function(designInfo, context) {
  var systemPrompt = 'You are a senior UX/UI designer and design consultant providing detailed, actionable design critiques. Your expertise covers visual design, user experience, accessibility, and design systems.\n\nCRITICAL REQUIREMENTS:\n- Be SPECIFIC about what to change, not general\n- Always explain HOW TO FIX each issue with concrete steps\n- Explain WHY each change will improve the design\n- Reference actual elements, colors, fonts mentioned in the data\n- Give measurable recommendations (specific pixel values, color codes, etc.)\n\nYour critique should be comprehensive but focused, covering:\n1. Visual Hierarchy \u0026 Layout Issues\n2. Typography \u0026 Readability Problems\n3. Color Usage \u0026 Accessibility Concerns\n4. Spacing \u0026 Alignment Issues\n5. Component Organization \u0026 Consistency\n6. User Experience \u0026 Usability\n\nFORMAT REQUIREMENTS:\n- Use numbered section headers (e.g., "1. Visual Hierarchy Issues:")\n- Use bullet points (•) for each specific recommendation\n- Each bullet should include: Problem + Solution + Reason\n- Be direct and actionable\n- No asterisks (*) in your response';

  var userPrompt = 'Analyze this Figma design and provide a detailed, specific critique:\n\n=== DESIGN ANALYSIS DATA ===\nTotal Elements: ' + designInfo.count + ' components\nElement Types: ' + designInfo.types.join(', ') + '\nColors Detected: ' + (designInfo.colors.length > 0 ? designInfo.colors.join(', ') : 'None detected') + '\nFonts Used: ' + (designInfo.fonts.length > 0 ? designInfo.fonts.join(', ') : 'None detected') + '\nText Content: ' + (designInfo.textContent.length > 0 ? '"' + designInfo.textContent.join('", "') + '"' : 'No text content found') + '\nCanvas Size: ' + designInfo.dimensions.totalWidth + 'px × ' + designInfo.dimensions.totalHeight + 'px\n\n=== COMPONENT BREAKDOWN ===\n' + designInfo.elements.map(function(el, index) {
    return (index + 1) + '. ' + el.name + ' (' + el.type + ')';
  }).join('\n') + '\n\n=== PROJECT CONTEXT ===\n' + (context || 'General design review - no specific context provided') + '\n\n=== CRITIQUE REQUEST ===\nProvide a detailed, actionable design critique. For each issue you identify:\n\n1. WHAT: Clearly describe the specific problem\n2. HOW: Give exact steps to fix it (specific values, actions)\n3. WHY: Explain how this improves the design\n\nBe specific about the actual elements, colors, and fonts mentioned above. Don\'t give generic advice - reference the real data from this design.\n\nExample format:\n• Problem: The primary button uses rgb(100, 150, 200) which has poor contrast\n• Solution: Change to rgb(0, 86, 179) for 4.5:1 contrast ratio\n• Why: Ensures WCAG AA compliance and better readability\n\nAnalyze the specific elements, colors, and text content provided. Give actionable, measurable recommendations.';

  return {
    model: CONFIG.API.MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: CONFIG.API.MAX_TOKENS,
    temperature: CONFIG.API.TEMPERATURE
  };
};



ApiClient.prototype._delay = function(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
};

// Message handler
function MessageHandler() {
  this.designAnalyzer = new DesignAnalyzer();
  this.apiClient = new ApiClient();
  this.selectedNodes = [];
}

MessageHandler.prototype.handleMessage = function(msg) {
  var self = this;
  try {
    Logger.info('Plugin received message', { type: msg.type });
    
    switch (msg.type) {
      case MESSAGE_TYPES.GET_SELECTION:
        this._handleGetSelection();
        break;
        
      case MESSAGE_TYPES.GET_CRITIQUE:
        this._handleGetCritique(msg);
        break;
        
      case MESSAGE_TYPES.CLOSE:
        this._handleClose();
        break;
        
      case 'api-response':
        this._handleApiResponse(msg);
        break;
        
      case MESSAGE_TYPES.RESIZE_WINDOW:
        this._handleResizeWindow(msg);
        break;
        
      default:
        Logger.warn('Unknown message type', { type: msg.type });
        this._sendError('Unknown message type: ' + msg.type);
    }
    
  } catch (error) {
    Logger.error('Error in message handler', error);
    this._sendError('Plugin error: ' + error.message);
  }
};

MessageHandler.prototype._handleGetSelection = function() {
  try {
    var selection = figma.currentPage.selection;
    this.selectedNodes = selection;
    
    Logger.info('Processing selection', { 
      count: selection.length,
      types: selection.map(function(node) { return node.type; })
    });
    
    var designInfo = this.designAnalyzer.analyze(selection);
    Logger.info('Sending design info', designInfo);
    
    this._sendMessage(MESSAGE_TYPES.SELECTION_UPDATED, designInfo);
    
  } catch (error) {
    Logger.error('Error processing selection', error);
    this._sendError('Error processing selection: ' + error.message);
  }
};

MessageHandler.prototype._handleGetCritique = function(msg) {
  var self = this;
  try {
    Logger.info('Starting critique request', {
      designInfoCount: msg.designInfo ? msg.designInfo.count : undefined,
      hasContext: !!(msg.prompt && msg.prompt.context)
    });
    
    var designInfo = msg.designInfo;
    var prompt = msg.prompt;
    
    if (!designInfo || designInfo.count === 0) {
      throw new Error('No design elements selected for critique');
    }
    
    if (!prompt || !prompt.apiKey) {
      throw new Error('API key is required');
    }
    
    this.apiClient.getDesignCritique(
      designInfo,
      prompt.apiKey,
      prompt.context || ''
    ).then(function(critique) {
      Logger.info('Critique received', { length: critique.length });
      self._sendMessage(MESSAGE_TYPES.CRITIQUE_RECEIVED, critique);
    }).catch(function(error) {
      Logger.error('Error getting critique', error);
      
      var errorMessage = error.message;
      if (error.code === ERROR_CODES.INVALID_API_KEY) {
        errorMessage = 'Please check your API key and try again';
      } else if (error.code === ERROR_CODES.API_REQUEST_FAILED) {
        errorMessage = 'Failed to get critique. Please check your internet connection and try again';
      } else if (error.code === ERROR_CODES.NO_ELEMENTS_SELECTED) {
        errorMessage = 'Please select some design elements first';
      }
      
      self._sendError(errorMessage);
    });
    
  } catch (error) {
    Logger.error('Error getting critique', error);
    this._sendError('Error getting critique: ' + error.message);
  }
};

MessageHandler.prototype._handleClose = function() {
  Logger.info('Closing plugin');
  figma.closePlugin();
};

MessageHandler.prototype._sendMessage = function(type, data) {
  try {
    if (figma && figma.ui && typeof figma.ui.postMessage === 'function') {
      var message = {
        type: type,
        data: data
      };
      
      figma.ui.postMessage(message);
      
      Logger.debug('Message sent to UI', { type: type, dataSize: JSON.stringify(data).length });
    } else {
      Logger.warn('figma.ui.postMessage not available');
    }
    
  } catch (error) {
    Logger.error('Failed to send message to UI', error);
    console.error('Message sending error details:', {
      figma: !!figma,
      figmaUi: !!(figma && figma.ui),
      postMessage: !!(figma && figma.ui && typeof figma.ui.postMessage === 'function'),
      type: type,
      error: error.message
    });
  }
};

MessageHandler.prototype._sendError = function(message) {
  this._sendMessage(MESSAGE_TYPES.ERROR, message);
};

MessageHandler.prototype.initialize = function() {
  try {
    var currentSelection = figma.currentPage.selection;
    var designInfo = this.designAnalyzer.analyze(currentSelection);
    
    Logger.info('Plugin initialized', { 
      selectionCount: currentSelection.length,
      designInfoCount: designInfo.count
    });
    
    // Add a small delay to ensure UI is ready
    var self = this;
    setTimeout(function() {
      self._sendMessage(MESSAGE_TYPES.PLUGIN_LOADED, designInfo);
    }, 200);
    
  } catch (error) {
    Logger.error('Failed to initialize plugin', error);
    this._sendError('Initialization failed: ' + error.message);
  }
};

MessageHandler.prototype.handleSelectionChange = function() {
  try {
    Logger.debug('Selection changed, updating UI');
    
    var selection = figma.currentPage.selection;
    var designInfo = this.designAnalyzer.analyze(selection);
    
    this._sendMessage(MESSAGE_TYPES.SELECTION_UPDATED, designInfo);
    
  } catch (error) {
    Logger.error('Error handling selection change', error);
  }
};

MessageHandler.prototype._handleApiResponse = function(msg) {
  try {
    var requestId = msg.requestId;
    var response = msg.response;
    var error = msg.error;
    
    if (this.apiClient.pendingRequests && this.apiClient.pendingRequests[requestId]) {
      var request = this.apiClient.pendingRequests[requestId];
      delete this.apiClient.pendingRequests[requestId];
      
      if (error) {
        request.reject(new ApiError(
          error.message || 'API request failed',
          error.code || 'API_REQUEST_FAILED',
          error.statusCode,
          error.response
        ));
      } else {
        request.resolve(response);
      }
    } else {
      Logger.warn('Received API response for unknown request', { requestId: requestId });
    }
  } catch (error) {
    Logger.error('Error handling API response', error);
  }
};

MessageHandler.prototype._handleResizeWindow = function(msg) {
  try {
    var size = msg.size;
    
    if (size === 'auto') {
      // Calculate dynamic size based on content
      // For critique page, make it taller to accommodate more content
      figma.ui.resize(CONFIG.UI.WIDTH, Math.min(800, window.screen.height * 0.8));
      Logger.info('Window resized to auto size');
    } else if (size === 'default') {
      // Reset to default size
      figma.ui.resize(CONFIG.UI.WIDTH, CONFIG.UI.HEIGHT);
      Logger.info('Window reset to default size');
    } else {
      Logger.warn('Unknown resize size requested', { size: size });
    }
    
  } catch (error) {
    Logger.error('Error handling window resize', error);
  }
};

MessageHandler.prototype.cleanup = function() {
  try {
    this.designAnalyzer.clearCache();
    Logger.info('Message handler cleaned up');
  } catch (error) {
    Logger.error('Error during cleanup', error);
  }
};

// Main plugin class
function DesignCritiquePlugin() {
  this.messageHandler = new MessageHandler();
  this.isInitialized = false;
}

DesignCritiquePlugin.prototype.initialize = function() {
  try {
    Logger.info('Initializing Design Critique Plugin');
    
    figma.showUI(__html__, { 
      width: CONFIG.UI.WIDTH, 
      height: CONFIG.UI.HEIGHT 
    });
    
    var self = this;
    figma.ui.onmessage = function(msg) {
      self.messageHandler.handleMessage(msg);
    };
    
    figma.on('selectionchange', function() {
      self.messageHandler.handleSelectionChange();
    });
    
    // Give UI time to load before initializing
    setTimeout(function() {
      self.messageHandler.initialize();
    }, 100);
    
    this.isInitialized = true;
    Logger.info('Plugin initialized successfully');
    
  } catch (error) {
    Logger.error('Failed to initialize plugin', error);
    throw error;
  }
};

DesignCritiquePlugin.prototype.cleanup = function() {
  try {
    if (this.messageHandler) {
      this.messageHandler.cleanup();
    }
    Logger.info('Plugin cleanup completed');
  } catch (error) {
    Logger.error('Error during plugin cleanup', error);
  }
};

// Initialize plugin
var plugin = new DesignCritiquePlugin();

try {
  plugin.initialize();
} catch (error) {
  Logger.error('Plugin initialization failed', error);
  figma.notify('Failed to initialize plugin. Please try again.');
} 