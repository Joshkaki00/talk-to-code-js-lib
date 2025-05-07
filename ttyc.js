/**
 * TalkToCode - Natural Console Interface
 * A lightweight library that lets developers interact with their code using natural language
 */

// Main context that holds all the references to variables and functions
let _context = {};

// Intent patterns for matching different types of commands
const intents = {
  get: {
    patterns: [
      /what('s| is) (in |the |my |our )?(.+)\??$/i,
      /show (me )?(the |my |our )?(.+)$/i,
      /display (the |my |our )?(.+)$/i,
      /log (the |my |our )?(.+)$/i,
    ],
    handler: (matches, ctx) => {
      const targetPath = matches[matches.length - 1].trim();
      return getValueFromPath(targetPath, ctx);
    }
  },
  call: {
    patterns: [
      /call (the |my |our )?(.+?) (with|using) (.+)$/i,
      /run (the |my |our )?(.+?) (with|using) (.+)$/i,
      /execute (the |my |our )?(.+?) (with|using) (.+)$/i,
    ],
    handler: (matches, ctx) => {
      const funcName = matches[2].trim();
      const argsText = matches[4].trim();
      
      const func = getFunctionFromPath(funcName, ctx);
      if (typeof func !== 'function') {
        return {
          error: `Could not find function "${funcName}"`,
          suggestions: findSimilarFunctions(funcName, ctx)
        };
      }
      
      const args = parseArguments(argsText);
      return callFunction(func, args);
    }
  },
  callNoArgs: {
    patterns: [
      /call (the |my |our )?(.+?)$/i,
      /run (the |my |our )?(.+?)$/i,
      /execute (the |my |our )?(.+?)$/i,
    ],
    handler: (matches, ctx) => {
      const funcName = matches[2].trim();
      
      const func = getFunctionFromPath(funcName, ctx);
      if (typeof func !== 'function') {
        return {
          error: `Could not find function "${funcName}"`,
          suggestions: findSimilarFunctions(funcName, ctx)
        };
      }
      
      return callFunction(func, []);
    }
  },
  find: {
    patterns: [
      /find (all )?(.+?) (with|that has|having) (.+)$/i,
      /search (for )?(.+?) (with|that has|having) (.+)$/i,
    ],
    handler: (matches, ctx) => {
      const targetType = matches[2].trim();
      const condition = matches[4].trim();
      
      if (targetType.includes('dom') || targetType.includes('element')) {
        return findDOMElements(condition);
      } else {
        return findInContext(targetType, condition, ctx);
      }
    }
  }
};

/**
 * Main function to process natural language commands
 * @param {string} command - The natural language command
 * @returns {any} - The result of executing the command
 */
export function talk(command) {
  if (!command || typeof command !== 'string') {
    console.error('🗣️ Please provide a valid command string');
    return;
  }
  
  try {
    // Check if the command matches any intent pattern
    for (const [intentName, intent] of Object.entries(intents)) {
      for (const pattern of intent.patterns) {
        const matches = command.match(pattern);
        if (matches) {
          const result = intent.handler(matches, _context);
          prettyPrint(result, intentName, command);
          return result;
        }
      }
    }
    
    // If no pattern matched
    console.warn(`🤔 I'm not sure how to process: "${command}"`);
    console.log('Try phrases like: "what is myVariable" or "call myFunction with param1"');
    
  } catch (error) {
    console.error('🚨 Error executing command:', error);
  }
}

/**
 * Set the context for the library to use
 * @param {Object} context - An object containing references to variables and functions
 */
export function setContext(context) {
  if (!context || typeof context !== 'object') {
    console.error('🗣️ Context must be an object');
    return;
  }
  
  _context = context;
  console.log(`🗣️ Context set with ${Object.keys(context).length} items`);
}

/**
 * Add items to the existing context
 * @param {Object} additionalContext - Additional context items to add
 */
export function addToContext(additionalContext) {
  if (!additionalContext || typeof additionalContext !== 'object') {
    console.error('🗣️ Additional context must be an object');
    return;
  }
  
  _context = { ..._context, ...additionalContext };
  console.log(`🗣️ Added ${Object.keys(additionalContext).length} items to context`);
}

// Helper functions

function getValueFromPath(path, ctx) {
  try {
    // Handle dot notation (e.g., "user.profile.name")
    const parts = path.split('.');
    let current = ctx;
    
    for (const part of parts) {
      if (current === undefined || current === null) {
        return { 
          error: `Cannot read property '${part}' of ${current}`,
          path: path
        };
      }
      
      const trimmedPart = part.trim();
      if (!(trimmedPart in current)) {
        return {
          error: `Property "${trimmedPart}" not found`,
          suggestions: findSimilarProperties(trimmedPart, current),
          path: path
        };
      }
      
      current = current[trimmedPart];
    }
    
    return current;
  } catch (error) {
    return { error: error.message, path: path };
  }
}

function getFunctionFromPath(path, ctx) {
  // This handles basic dot notation for functions
  return getValueFromPath(path, ctx);
}

function parseArguments(argsText) {
  // This is a simplified argument parser
  // It splits by commas, then tries to interpret each arg

  const argStrings = argsText.split(',').map(arg => arg.trim());
  
  return argStrings.map(arg => {
    // Try to parse as JSON (handles strings, numbers, booleans, null)
    try {
      // Check for common string patterns but without quotes
      if (/^[a-z][a-z0-9_]*$/i.test(arg)) {
        return arg; // Return as is, could be a parameter name
      }
      
      // Add quotes for apparent strings without them
      if (!arg.startsWith('"') && !arg.startsWith("'") && 
          !arg.startsWith('true') && !arg.startsWith('false') && 
          !arg.startsWith('null') && isNaN(Number(arg))) {
        arg = `"${arg}"`;
      }
      
      return JSON.parse(arg);
    } catch (e) {
      // If parsing fails, return as-is
      return arg;
    }
  });
}

function callFunction(func, args) {
  try {
    return func(...args);
  } catch (error) {
    return { 
      error: error.message,
      args: args
    };
  }
}

function findSimilarProperties(prop, obj) {
  const properties = Object.keys(obj);
  return properties.filter(p => 
    p.toLowerCase().includes(prop.toLowerCase()) || 
    levenshteinDistance(p, prop) <= 3
  );
}

function findSimilarFunctions(funcName, ctx) {
  const allKeys = getAllKeysDeep(ctx);
  return allKeys.filter(key => {
    const value = getValueFromPath(key, ctx);
    return typeof value === 'function' && 
           (key.toLowerCase().includes(funcName.toLowerCase()) || 
            levenshteinDistance(key, funcName) <= 3);
  });
}

function getAllKeysDeep(obj, prefix = '', depth = 0, maxDepth = 3) {
  if (depth >= maxDepth || typeof obj !== 'object' || obj === null) {
    return [];
  }
  
  const keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(fullKey);
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllKeysDeep(obj[key], fullKey, depth + 1, maxDepth));
    }
  }
  return keys;
}

function findDOMElements(selector) {
  try {
    // Handle natural language selectors
    let actualSelector = selector;
    
    // Map common phrases to selectors
    if (selector.includes('class')) {
      actualSelector = selector.replace(/class\s+([a-zA-Z0-9_-]+)/g, '.$1');
    }
    if (selector.includes('id')) {
      actualSelector = selector.replace(/id\s+([a-zA-Z0-9_-]+)/g, '#$1');
    }
    
    // Clean up the selector
    actualSelector = actualSelector.replace(/elements?|with|the/gi, '').trim();
    
    const elements = document.querySelectorAll(actualSelector);
    return Array.from(elements);
  } catch (error) {
    return { error: `Invalid selector: ${error.message}` };
  }
}

function findInContext(type, condition, ctx) {
  // TODO: Implement searching within context objects
  return { error: "Advanced context searching not implemented yet" };
}

function prettyPrint(result, intentType, originalCommand) {
  console.group(`🗣️ ${originalCommand}`);
  
  if (result && result.error) {
    console.error(`❌ ${result.error}`);
    
    if (result.suggestions && result.suggestions.length > 0) {
      console.log('💡 Did you mean one of these?');
      console.log(result.suggestions);
    }
  } else if (Array.isArray(result)) {
    console.log(`📊 Found ${result.length} results:`);
    console.table(result);
  } else if (typeof result === 'object' && result !== null) {
    console.log('📦 Result:');
    console.dir(result, { depth: 3, colors: true });
  } else {
    console.log('✅ Result:', result);
  }
  
  console.groupEnd();
}

// Utility functions

function levenshteinDistance(a, b) {
  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Optional: Voice mode integration
export function enableVoiceMode(options = {}) {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error("🎙️ Speech recognition not supported in this browser");
    return false;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = options.continuous || false;
  recognition.interimResults = false;
  recognition.lang = options.lang || 'en-US';
  
  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    console.log(`🎙️ Voice command: "${transcript}"`);
    talk(transcript);
  };
  
  recognition.onerror = (event) => {
    console.error(`🎙️ Voice recognition error: ${event.error}`);
  };
  
  recognition.start();
  console.log("🎙️ Voice mode enabled. Try speaking a command.");
  
  return {
    stop: () => recognition.stop(),
    recognition
  };
}