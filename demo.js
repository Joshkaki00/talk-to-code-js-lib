//const { talkToCode, setContext } = require('./src/talkToCode.js');
const  {talk, setContext} = require('./dist/talkToCode.min.js');
console.log(talk, setContext);
console.log (require('./dist/talkToCode.min.js'));
setContext({
    counter: 42,
    user: {
        name: 'John',
        age: 30,
    },
    greet: function(name) {
        return `Hello ${name}!`;
    }
});

console.log(talk('What is the counter?'));
console.log(talk('What is the user name?'));
console.log(talk('What is the user age?'));
console.log(talk('What is the user name?'));


