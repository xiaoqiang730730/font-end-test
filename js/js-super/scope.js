// js函数作用域，
// 在内部能访问外部
// 外部不能访问内部
// 先收集变量
// 执行时复杂
// function test () {
// 	if(false){
// 		var i = 100;
// 	}else{
// 		var t = 100;
// 	}
// 	console.log(t);
// }
// console.log(t);
// test();
// 
//var j = 100;

//~(function test(){console.log(j)})();
// ~ 转化成表达式 进行输出
// 
var j = 100;
function test(){
	console.log(j);
	var j;
	var k = 100;
	return function(){
		return k;
	}
}
var t = test()();
console.log(t);