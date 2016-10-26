// function test (num) {
// 	// 创建一个内存副本
//  按值传递 string,number,boolen
// 	num = num +1;
// 	return num;
// }

// var num = 1;
// console.log(test(1));
// console.log(num);
// 

function test(obj){
	// 按引用传递 object array
	obj.age = 20;
	console.log('内部', obj);
}

var obj = {
	name:'xiaoqiang'
}
test(obj);
console.log(obj);

function setName(obj) {
    obj.name = "Nicholas";
    var obj = new Object();
    obj.name = "Greg";
}
var person = new Object();
setName(person);
alert(person.name);//=>"Nicholas"