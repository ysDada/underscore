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

    _.isBoolean = function(obj){
        return toString.call(obj) === '[object Boolean]'
    }

    _.isNumber = function(obj){
        return toString.call(obj) === '[object Number]'
    }

    _.isNaN = function(obj){
        return _.isNumber(obj) && obj != obj
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
            case 4:
                return function (memo, value, index, obj){
                    return func.call(context, memo, value, index, obj)
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

    var createReduce = function(dir){
        //memo：初始值
        //init：是否有初始值
        var reduce = function(obj, iteratee, memo, init){
            var keys = !_.isArray(obj) && Object.keys(obj),
                length = (keys || obj).length
                index = dir > 0 ? 0 : length - 1
            if(!init){
                memo = obj[keys ? keys[index] : index]
                index += dir    //  1||-1
            }
            for(; index >= 0 && index < length; index += dir){
                var currentKey = keys ? keys[index] : index
                memo = iteratee(memo, obj[currentKey], currentKey, obj)
            }
            return memo
        }

        return function(obj, iteratee, memo, context){
            //判断是否有初始值
            var init = arguments.length >= 3
            return reduce(obj, optimizeCb(iteratee, context, 4), memo, init) 
        }
    }
    
    _.reduce = createReduce(1); //  1||-1

    _.filter = _.select = function(obj, predicate, context){
        var result = []
        predicate = cb(predicate, context)
        _.each(obj, function (value, index) {
            if(predicate(value, index)) result.push(value)
        })
        return result
    }

    _.sortedIndex = function (array, obj, iteratee, context) {
        iteratee = cb(iteratee, context, 1)
        var value = iteratee(obj)
        var low = 0
            high = array.length
        //二分查找
        while(low < high){
            var mid = Math.floor((low + high) / 2)
            if(iteratee(array[mid]) < value){
                low = mid + 1
            } else {
                high = mid
            }
        }
        return low
    }

    function createIndexFinder(dir, predicateFind, sortedIndex){
        // API调用形式
        // _.indexOf(array, value, [isSorted])
        return function (array, item, idx) {
            var i = 0
                length = array.length
            // 第三参数ture用二分查找优化，否则遍历查找
            if(sortedIndex && _.isBoolean(idx) && length){
                // 能用二分查找加速的条件
                // 用 _.sortIndex 找到有序数组中 item 正好插入的位置
                idx = sortedIndex(array, item)
                return array[idx] === item ? idx : -1
            }

            //特殊情况，查找的元素是NaN
            if(item !== item){
                idx = predicateFind([].slice.call(array, i, length), _.isNaN)
                return idx >=0 ? idx + i : -1
            }

            for(idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir){
                if(array[idx] === item){
                    return idx
                }
            }

            return -1
        }
    }

    function createPredicateIndexFinder(dir) {
        return function (array, predicate, context) {
            predicate = cb(predicate, context)
            var length = array.length
            var index = dir > 0 ? 0 : length - 1
            for(; index >= 0 && index < length; index += dir){
                if(predicate(array[index], index, array)){
                    return index
                }
            }

            return -1
        }
    }

    _.findexIndex = createPredicateIndexFinder(1)
    _.findexLastIndex = createPredicateIndexFinder(-1)

    //_.findIndex 特殊情况下的吃力方案 NaN
    //_.sortedIndex 针对排序的数组做二分查找，优化性能
    _.indexOf = createIndexFinder(1, _.findexIndex, _.sortedIndex)
    _.lastIndexOf = createIndexFinder(-1, _.findexIndex)

    _.mixin(_)
    root._ = _
})(this)