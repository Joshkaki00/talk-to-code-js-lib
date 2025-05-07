/**
 * Tests for the Talk to Code library
 */

import { talk, setContext, addToContext } from '../src/talkToCode.js';

// Mock console methods
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  group: jest.fn(),
  groupEnd: jest.fn(),
  table: jest.fn(),
  dir: jest.fn(),
};

describe('Talk to Code Library', () => {
  // Reset mocks and context before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setContext', () => {
    test('sets the context when given a valid object', () => {
      const result = setContext({ testVar: 'value' });
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Context set with 1 items'));
    });

    test('rejects non-object contexts', () => {
      const result = setContext('not an object');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    test('rejects null context', () => {
      const result = setContext(null);
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('addToContext', () => {
    test('adds items to existing context', () => {
      setContext({ existingVar: 'value' });
      const result = addToContext({ newVar: 'new value' });
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Added 1 items to context'));
    });

    test('rejects non-object additions', () => {
      const result = addToContext('not an object');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('talk function', () => {
    beforeEach(() => {
      // Set up test context
      setContext({
        testVar: 'test value',
        counter: 42,
        user: {
          name: 'John',
          profile: {
            age: 30
          }
        },
        greeting: function() {
          return 'Hello!';
        },
        greetUser: function(name) {
          return `Hello, ${name}!`;
        },
        sum: function(a, b) {
          return a + b;
        }
      });
    });

    test('rejects invalid input', () => {
      talk();
      expect(console.error).toHaveBeenCalled();
      
      talk(null);
      expect(console.error).toHaveBeenCalledTimes(2);
      
      talk(123);
      expect(console.error).toHaveBeenCalledTimes(3);
    });

    describe('get intent', () => {
      test('retrieves simple variables', () => {
        const result = talk('what is testVar');
        expect(result).toBe('test value');
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Result:'), 'test value');
      });

      test('handles different phrasings for get intent', () => {
        expect(talk('show me testVar')).toBe('test value');
        expect(talk('display testVar')).toBe('test value');
        expect(talk('log the testVar')).toBe('test value');
      });

      test('retrieves nested properties', () => {
        const result = talk('what is user.name');
        expect(result).toBe('John');
        
        const deepResult = talk('what is user.profile.age');
        expect(deepResult).toBe(30);
      });

      test('provides helpful error for non-existent properties', () => {
        const result = talk('what is nonExistent');
        expect(result.error).toContain('not found');
        expect(console.error).toHaveBeenCalled();
      });
    });

    describe('call intent', () => {
      test('calls functions without arguments', () => {
        const result = talk('call greeting');
        expect(result).toBe('Hello!');
      });

      test('calls functions with arguments', () => {
        const result = talk('call greetUser with Alice');
        expect(result).toBe('Hello, Alice!');
      });

      test('handles multiple arguments', () => {
        const result = talk('call sum with 5, 7');
        expect(result).toBe(12);
      });

      test('provides error for non-existent functions', () => {
        const result = talk('call nonExistentFunc');
        expect(result.error).toContain('Could not find function');
        expect(console.error).toHaveBeenCalled();
      });

      test('handles different phrasings for call intent', () => {
        expect(talk('run greeting')).toBe('Hello!');
        expect(talk('execute greeting')).toBe('Hello!');
      });
    });

    test('returns null for unrecognized commands', () => {
      const result = talk('this is not a recognized command');
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  // Since we can't easily test DOM functions and voice mode in Jest,
  // we'll skip those tests for now
});