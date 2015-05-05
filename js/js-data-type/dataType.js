
// 	js中的数据类型分为两大类：原始类型和对象类型。
// 	（1）原始类型包括：数值、字符串、布尔值、null(是个特色的)、undefined
// （后两个是特殊的原始值，这里不做详细的说明，我的上一篇博客有谈到过一些）
// 	（2）对象类型包括：对象即是属性的集合，当然这里又两个特殊的对象----函数（js中的一等对象）、数组（键值的有序集合）。
// 	
var a=1;
console.log(a,typeof a);

console.log(0.1+0.2);//!=0.3 这是由于IEEE754 64(先装换成32位计算 再装换成64)浮点计算的通病
var result=Number.MAX_VALUE + Number.MAX_VALUE;
console.log(Number.MAX_VALUE);
console.log(isFinite(result));

var b="ssssss";
console.log(b,typeof b);

var c=true;
console.log(c,typeof c);

// null值表示一个空对象指针
var d=null;
console.log(null,typeof null);

// undefined 派生自null
var e=undefined;
console.log(e,typeof e);
console.log(e==d);// true


// 在js中函数也是一种对象，不是一直数据类型。
// 但是函数有些特殊的属性，则通过tepyof可以区分函数和其它对象
var d=function(){};
console.log(d,typeof d);