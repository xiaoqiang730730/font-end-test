
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
