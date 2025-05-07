# Talk to Code

A lightweight JavaScript library that lets developers interact with their code using natural language in the browser console.

## 🧠 What it is

Talk to Code provides a natural language interface for your JavaScript code. It hooks into the browser's console and lets you run commands like:

```javascript
talk("what's in myAppState?");
// → { score: 42, level: 3 }

talk("call startGame with easy mode");
// → calls `startGame('easy')`

talk("log all DOM elements with class player");
// → logs all `.player` elements
```

## 🚀 Installation

```bash
npm install talk-to-code
```

## 📋 Basic Usage

```javascript
// ES Modules
import { talk, setContext } from 'talk-to-code';

// CommonJS
const { talk, setContext } = require('talk-to-code');

// Browser (UMD)
<script src="dist/talkToCode.min.js"></script>
const { talk, setContext } = TalkToCode;

// Set up the context that Talk to Code can access
setContext({
  startGame,
  myAppState,
  player
});

// Start using natural language commands
talk("what's in myAppState?");
talk("call startGame with easy mode");
```

## 🛠️ Core Features

### Natural Language Command Processing

Talk to Code interprets natural language commands and maps them to JavaScript code, functions, or data:

```javascript
talk("what is counter?");     // Gets a variable's value
talk("show user profile");    // Displays nested objects
talk("call resetGame");       // Calls a function without arguments
talk("run saveScore with 42"); // Calls a function with arguments
```

### Context Management

Tell Talk to Code what variables and functions it can access:

```javascript
// Set the initial context
setContext({
  game: {
    score: 100,
    level: 3,
    player: { health: 80 }
  },
  startGame: (difficulty) => { /* ... */ },
  resetGame: () => { /* ... */ }
});

// Add more items to the context later
addToContext({
  saveScore: (score) => { /* ... */ }
});
```

### DOM Querying

Find DOM elements using natural language:

```javascript
talk("find elements with class player");
// → Returns array of elements with class "player"

talk("search for elements having id game-container");
// → Returns element with id "game-container"
```

### Voice Mode (Experimental)

Enable voice commands in supported browsers:

```javascript
import { enableVoiceMode } from 'talk-to-code';

// Start voice recognition
const voice = enableVoiceMode();

// Now you can speak commands like "What is game score"

// Stop voice recognition when done
voice.stop();
```

## 📘 API Reference

### `talk(command: string): any`

Processes a natural language command and returns the result.

- **command**: The natural language command to process
- **returns**: The result of executing the command

```javascript
talk("what is user.name?");
talk("call greetUser with Alice");
```

### `setContext(context: object): boolean`

Sets the context (variables and functions) that Talk to Code can access.

- **context**: An object containing references to variables and functions
- **returns**: `true` if successful, `false` otherwise

```javascript
setContext({
  myApp: window.myApp,
  startGame: window.startGame
});
```

### `addToContext(additionalContext: object): boolean`

Adds items to the existing context.

- **additionalContext**: Additional context items to add
- **returns**: `true` if successful, `false` otherwise

```javascript
addToContext({
  newVariable: 'new value',
  newFunction: () => console.log('Hello')
});
```

### `enableVoiceMode(options?: object): object | false`

Enables voice command mode in supported browsers.

- **options**: Optional configuration
  - **continuous**: Keep listening after processing a command (default: false)
  - **lang**: Language for speech recognition (default: 'en-US')
- **returns**: Controller object with `stop()` method, or `false` if not supported

```javascript
const voice = enableVoiceMode({ 
  continuous: true,
  lang: 'en-US'
});

// Stop listening
voice.stop();
```

## 🗣️ Supported Commands

### Get Variables/Data

```javascript
talk("what is counter?");
talk("show me user");
talk("display user.profile");
talk("log the game.score");
```

### Call Functions

```javascript
talk("call startGame");
talk("run resetGame");
talk("execute calculateScore");
talk("call startGame with easy");
talk("run setVolume with 50");
talk("execute movePlayer with left, 10");
```

### Find Elements

```javascript
talk("find elements with class player");
talk("search for elements having id game-container");
```

## 📝 Examples

### Game Development Example

```javascript
import { talk, setContext } from 'talk-to-code';

const gameState = {
  score: 0,
  level: 1,
  player: {
    health: 100,
    position: { x: 0, y: 0 }
  }
};

function startGame(difficulty = 'normal') {
  console.log(`Starting game in ${difficulty} mode`);
  return `Game started in ${difficulty} mode`;
}

function movePlayer(direction, amount) {
  const position = gameState.player.position;
  
  switch(direction) {
    case 'left': position.x -= amount; break;
    case 'right': position.x += amount; break;
    case 'up': position.y -= amount; break;
    case 'down': position.y += amount; break;
  }
  
  return `Player moved ${direction} by ${amount}`;
}

setContext({
  gameState,
  startGame,
  movePlayer
});

// Now you can use natural language commands
talk("what is gameState.player.health");  // 100
talk("call startGame with hard");         // "Game started in hard mode"
talk("call movePlayer with right, 5");    // "Player moved right by 5"
talk("what is gameState.player.position"); // { x: 5, y: 0 }
```

## 🧪 Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build
```

## 📄 License

MIT