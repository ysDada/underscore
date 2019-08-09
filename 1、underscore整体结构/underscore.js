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

    _.map = function(args, callback){
        var i = 0
        for(; i < args.length; i++){
            args[i] = callback.call(this, args[i])
        }
        return args
    }

    _.mixin(_)
    root._ = _
})(this)