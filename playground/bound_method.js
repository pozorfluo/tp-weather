// https://jsben.ch/vTmfI

function PrototypicalGreeting(greeting = "Hello", name = "World") {
  this.greeting = greeting;
  this.name = name;

  this.boundGreet = this.greet.bind(this);
  this.arrowGreet = () => `${this.greeting}, ${this.name}!`;
  this.instanceGreet = function() {
  return `${this.greeting}, ${this.name}!`;
};

}


PrototypicalGreeting.prototype.greet = function() {
  return `${this.greeting}, ${this.name}!`;
};

const greetProto = new PrototypicalGreeting("Hey", "folks");


greetProto.greet();
greetProto.boundGreet();
greetProto.instanceGreet();
greetProto.arrowGreet();
(()=> greetProto.greet())();

a = greetProto.greet;
b = greetProto.boundGreet;
c = greetProto.instanceGreet;
d = greetProto.arrowGreet;

a();
// "undefined, !"
b();
// "Hey, folks!"
c();
// "undefined, !"
d();
// "Hey, folks!"