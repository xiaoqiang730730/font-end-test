

// 	js中的数据类型分为两大类：原始类型和对象类型。
// 	（1）原始类型包括：数值、字符串、布尔值、null、undefined
// （后两个是特殊的原始值，这里不做详细的说明，我的上一篇博客有谈到过一些）
// 	（2）对象类型包括：对象即是属性的集合，当然这里又两个特殊的对象----函数（js中的一等对象）、数组（键值的有序集合）。

function className (obj){
	if( obj === null ){
		return "Null";
	}
	if( obj ===undefined ){
		return "Undefined";
	}
	return Object.prototype.toString.call(obj).slice(8,-1);
}


function deepClone (obj) {
	var result;
	var oClass=className(obj);
	if( oClass === "Object" ){
		result = {};
	}else if ( oClass === "Array" ){
		result = [];
	} else {
		return obj;
	}

	for( key in obj ){
		var copy = obj[key];
		if(className(copy) === "Object" ){
			result[key] = arguments.callee(copy);
		} else if(className(copy) === "Array" ){
			result[key] = arguments.callee(copy);
		} else {
			result[key]=obj[key];
		}
	}
	return result;
}


// test code

var oPerson = {
	oName:"hello",
	oAge:"18",
	oAddress:{
		province:"shanghai"
	},
	ofavorite:[
		"swimming",
		{reading:"history book"}
	],
	skill:function(){
		console.log("hello is coding");
	}
}

var oNew = deepClone( oPerson );

oNew.ofavorite[1].reading="picture";

console.log(oPerson.ofavorite[1].reading);
console.log(oNew.ofavorite[1].reading);

oNew.skill = function (){
	console.log("hhahahahah");
}

oPerson.skill();
oNew.skill();



// other ways
// 
function deepClone1(obj){
	var o;
	if( typeof obj === "object"){
		if( obj === null){
			o = null;
		}else{
			if( obj instanceof Array ){
				o = [];
				for ( var i=0, len = obj.length; i<len; i++ ){
					o.push(deepClone1(obj[i]));
				}
			}else{
				o = {};
				for( var k in obj ){
					o[k] = deepClone1(obj[k]);
				}
			}
		}
	}else{
		o = obj;
	}
	return o;
}

function deepClone2(obj){
	var o;
	if( obj.constructor.name == "Object" ){
		o = new obj.constructor();
	}else{
		o = new obj.constructor(obj.valueOf());
	}

	for (var key in obj ){
		if( o[key] != obj[key] ){
			if( typeof(obj[key]) == 'object' ){
				o[key] = deepClone2(obj[key]);
			}else{
				o[key] = obj[key];
			}
		}
	}
	o.toString = obj.toString;
	o.valueOf=obj.valueOf;
	return o;
}

function deepClone3(obj){
	function fn(){};
	fn.prototype = obj;
	var o=new fn();
	for(var a in o ){
		if( typeof o[a] == "object" ){
			o[a]= deepClone3(o[a]);
		}
	}
	return o;
}

var oNew3=deepClone3(oPerson);
console.log(oNew3.ofavorite[1].reading);


// 可以使用
// JSON.stringify();
// JSON.parse();
// 做个转化，
// 但是存在function()对象无法成功
