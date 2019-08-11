;(function(root){
    var _ = function(obj){
        if(!(this instanceof _)){
            return new _(obj)
        }

        this._wrapped = obj
    }

    _.chain = function(obj){
        var instance = _(obj)
        //当前underscore支持链接式调用
        instance._chain = true
        return instance
    }

    //调用chain的时候，obj指的是数据
    var result = function(instance, obj){
        return instance._chain ? _(obj).chain() : obj
    }

    _.prototype.value = function(){
        return this._wrapped
    }

    _.isArray = function(array){
        return toString.call(array) === '[object Array]'
    }

    _.isFunction = function(func){
        return toString.call(func) === '[object Function]'
    }

    _.isObject = function(obj){
        return toString.call(obj) === '[object Object]'
    }

    _.each = function(target, callback){
        var key, i = 0
        if(_.isArray(target)){
            var length = target.length
            for(; i < length; i++){
                callback.call(target, target[i], i)
            }
        } else {
            for(key in target){
                callback.call(target, key, target[key])
            }
        }
    }

    _.functions = function(obj){
        var result = []
        var key
        for(key in obj){
            result.push(key)
        }
        return result
    }

    _.unique = function(arr, callback){
        var ret = [];
        var target, i = 0;
        for(; i < arr.length; i++){
            target = callback ? callback(arr[i]) : arr[i]
            if(ret.indexOf(target) === -1){
                ret.push(target)
            }
        }
        return ret
    }

    _.mixin = function(obj){
        _.each(_.functions(obj), function(name, index){
            var func = obj[name]
            _.prototype[name] = function(){
                var args = [this._wrapped];
                [].push.apply(args, arguments)
                //有_chain属性，返回的是underscore实例对象，没有_chain属性，返回数据_wrapped
                return result(this, func.apply(this, args))
            }
        })
    }

    _.map = function(obj, iteratee, context){
        var iteratee = cb(iteratee, context)
        //分辨是数组还是obj对象
        var keys = !_.isArray(obj) && Object.keys(obj)
        var length = (keys || obj).length
        var result = Array(length)

        for(var index = 0; index < length; index++){
            var currentKey = keys ? keys[index] : index
            result[index] = iteratee(obj[currentKey], index, obj)
        }

        return result
    }

    var cb = function (iteratee, context, count) {
        if(iteratee == null){
            return _.identify
        }

        if(_.isFunction(iteratee)){
            return optimizeCb(iteratee, context, count)
        }
    }

    _.identify = function (value) {
        return value
    }

    var optimizeCb = function (func, context, count) {
        if(context == void 0){
            return func
        }

        switch (count == null ? 3 : count) {
            case 1:
                return function(value){
                    return func.call(context, value)
                }
            case 3:
                return function (value, index, obj) {
                    return func.call(context, value, index, obj)
                }
        }
    }

    _.restArguments = function(func){
        //func.length属性是获取函数形参 第一个具有默认值之前的参数个数 
        //function(a = 1, b, c)     length为0
        //function(b, a = 1, c)     length为1
        //function(b, a, c)         length为3
        var startIndex = func.length - 1
        return function () {
            var length = arguments.length - startIndex  //获取放入rest参数里的长度
                rest = Array(length)
                index = 0
            //放入rest里的成员
            for(; index < length; index++){
                rest[index] = arguments[index + startIndex]
            }
            var args = Array(startIndex + 1)
            //非rest成员
            for(index = 0; index < startIndex; index++){
                args[index] = arguments[index]
            }
            args[startIndex] = rest //args = [1,2,[3,4]]
            return func.apply(this, args)
        }
    }

    var Ctor = function(){}

    _.baseCreat = function (prototype) {
        if(!_.isObject(prototype)) return {}
        if(Object.create){
            return Object.create(prototype)
        }

        //如果浏览器不支持Object.create
        Ctor.prototype = prototype
        var result = new Ctor()
        Ctor.prototype = null   //清空Ctor对象的原型
        return result
    }

    _.mixin(_)
    root._ = _
})(this)