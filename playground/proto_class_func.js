function greeterFactory(greeting = "Hello", name = "World") {
  return {
    greet: () => `${greeting}, ${name}!`,
  };
}
const greeter = greeterFactory("Hey", "folks");

function PrototypicalGreeting(greeting = "Hello", name = "World") {
  this.greeting = greeting;
  this.name = name;
}


PrototypicalGreeting.prototype.greet = function() {
  return `${this.greeting}, ${this.name}!`;
};

const greetProto = new PrototypicalGreeting("Hey", "folks");

class ClassicalGreeting {
  constructor(greeting = "Hello", name = "World") {
    this.greeting = greeting;
    this.name = name;
  }

  greet() {
    return `${this.greeting}, ${this.name}!`;
  }
}

const classyGreeting = new ClassicalGreeting("Hey", "folks");


greeter.greet();
greetProto.greet();
classyGreeting.greet();