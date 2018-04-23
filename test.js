var Parent = function(){
    this.name = "lvjun";
    this.old = "29";
    this.job = '444'
};
Parent.prototype.showName = function(){
    console.log(this.name);
};
Parent.prototype.showOld = function(){
    console.log(this.Old);
};

var Child =  function() {
    this.job = "developer"
};

function extend1(Child,Parent){
    var p = Parent.prototype;
    var c = Child.prototype;
    //c === p;
    //for (var i in p){
    //    c[i] = p[i];
    //}
    c.showJob = function () {
        console.log(Child.job);
    };
    console.log(p);
    console.log(c);
    return c;
}
extend1(Child,Parent);
//var p = new Parent();
//var c = new Child();

//console.log(Parent.prototype);

//var Parent1 = function(Child,Parent){
//    var p = Parent.prototype;
//    var c = Parent1.prototype;
//    c = p;
//    c.uber = "我槽"
//};

//var p1 = new Parent1(Parent);
//console.log(Parent.uber);