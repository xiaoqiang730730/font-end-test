// function test(){
// 	console.log(this.m);
// }

// test(); // window.test();
// 
// this.m = 1000;
// var obj = {
// 	m:100,
// 	test: function(){
// 		console.log(this.m);
// 		return function(){
// 			console.log(this.m);
// 		}
// 	}
// }

// obj.test()(); // 指向obj
// 执行完之后 放回的function 指向了window
// var t = obj.test();
// t();// window.t();
// 
// 
// 
// var style = {
// 	color:'green'
// }
// test(); // window.test()
// function test(){
// 	console.log(this.style.color);
// }
// var testDiv = document.getElementById('test');
// testDiv.onclick = test;
// 
// 
// 
// this.a = 1000;
// function test(){
// 	this.a = 1;
// }
// test.prototype.getA = function() {
// 	return this.a;
// };

// var p = new test;
// console.log(p.getA());// 1;
// 
// 
function test(){
	this.a = 1;
}
test.prototype.a = 100;
var p = new test;
console.log(p);
