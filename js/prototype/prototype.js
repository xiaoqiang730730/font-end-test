Function.prototype.method = Function.prototype.method || function(name, func){
	this.prototype[name] = func;
	return this;
}

String.method('boolean', function(){
	return "true" == this;
});

console.log("true".boolean());