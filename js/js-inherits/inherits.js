function inherits(subClass, superClass){
    var key, 
        proto,
        selfProps = subClass.prototype,
        clazz = new Function();
    clazz.prototype = superClass.prototype;
    proto = subClass.prototype = new clazz();

    for (key in selfProps) {
        proto[key] = selfProps[key];
    }
    subClass.prototype.constructor = subClass;
    subClass.super_ = superClass;
    return subClass;
}


var t = {a:1};

var t2 = {a2:2};
console.log(inherits(t2, t));
