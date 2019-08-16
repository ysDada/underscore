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

    _.isArguments = function(obj){
        return toString.call(obj) === '[object Arguments]'
    }

    _.isNaN = function(obj){
        return _.isNumber(obj) && obj != obj
    }

    _.clone = function(obj){
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj)
    }

    _.extend = function(target, obj){
        if(_.isObject(obj)){
            for(let key in obj){
                if(_.isObject(obj[key])){
                    target[key] = {}
                    _.extend(target[key], obj[key])
                } else {
                    target[key] = obj[key]
                }
            }
        }
    }

    //返回一个 [min, max] 范围内的任意整数
    _.random = function(min, max){
        if(max == null){
            max = min
            min = 0
        }
        //Math.random()  !0 ~ <1
        return min + Math.floor(Math.random() * (max - min + 1))
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

    // _.unique = function(arr, callback){
    //     var ret = [];
    //     var target, i = 0;
    //     for(; i < arr.length; i++){
    //         target = callback ? callback(arr[i]) : arr[i]
    //         if(ret.indexOf(target) === -1){
    //             ret.push(target)
    //         }
    //     }
    //     return ret
    // }

    _.unique = function(array, isSorted, iteratee, context){
        //没有传入isSorted
        if(!_.isBoolean(isSorted)){
            isSorted = false
            context = iteratee
            iteratee = isSorted
        }

        if(iteratee != null)    iteratee = cb(iteratee, context)
        var result = [],
            seen

        for(var i = 0; i < array.length; i++){
            var computed = iteratee ? iteratee(value, i, array) : array[i]
            //如果是有序数组，当前元素只需跟上一个元素对比即可
            //用seen变量保存一个元素
            if(isSorted){
                if(!i || seen !== computed) result.push(computed)
                seen = computed
            } else if(result.indexOf(computed) === -1){
                result.push(computed)
            }
        }

        return result

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

    //去掉数组中所有的假值  _.identity = function(value){ return value }
    _.compact = function(array){
        return _.filter(array, _.identify)
    }

    //返回某一范围内的数值组成的数组
    _.range = function(start, stop, step){
        if(stop == null){
            stop = start || 0
            start = 0
        }

        step = step || 1

        var length = Math.max(Math.ceil((stop - start) / step), 0)

        var range = Array(length)

        for(var index = 0; index < length; index++){
            range[index] = start
            start += step
        }

        return range
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

    //抽样函数
    _.sample = function (arr, n) {
        if(n == null){
            return arr[_.random(arr.length - 1)]
        }

        let sample = _.clone(arr)
            length = sample.length
        n = Math.max(Math.min(n, length), 0)

        for(let index = 0; index < n; index++){
            //随机数 index
            let rand = _.random(index, length - 1)
            let temp = sample[index]
            sample[index] = sample[rand]
            sample[rand] = temp
        }
        return sample.slice(0, n)
    }

    _.shuffle = function(array) {
        return _.sample(array, Infinity)
    }

    //数组定位，摊平数组
    var flatten = function(array, shallow) {
        var ret = []
        var index = 0 
        for(var i = 0; i < array.length; i++){
            var value = array[i]    //展开一次
            if(_.isArray(value) || _.isArguments(value)){
                //递归全部展开
                if(!shallow){
                    value = flatten(value, shallow)
                }
                var j = 0,
                    len = value.length
                ret.length += len
                while(j < len){
                    ret[index++] = value[j++]
                }
            } else {
                ret[index++] = value
            }
        }
        return ret
    }

    _.flatten = function(array, shallow){
        return flatten(array, shallow)
    }

    //数组定位
    //返回数组中除了最后一个元素外的其他全部元素。 在arguments对象特别有用
    _.initial = function(array, n){
        return [].slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n)))
    }

    //返回数组中除了第一个元素外的其他全部元素。 传递 n 参数将返回从 n 开始的剩余所有元素
    _.rest = function(array, n){
        return [].slice.call(array, n == null ? 1 : n)
    }

    _.delay = function(func, wait){
        var args = [].slice.call(arguments, 2)
        return setTimeout(()=>{
            func.apply(this, args)
        }, wait)
    }

    //字符串逃逸，把一些不安全的字符变成字符串的实体
    var escapeMap = {
        '&' : '&amp',
        '<' : '&lt',
        '>' : '&gt',
        '"' : '&quot',
        "'" : '&#x27',
        '`' : '&#x60'
    }

    var creatEscaper = function(map){
        //Object.keys(map).join('|')   会把escapeMap对象中的key变成  &|<|>|"|'|`
        var source = "(?:" + Object.keys(map).join('|') + ")"
        var testExp = new RegExp(source, 'g')
        var replace = function(match){
            //replace方法，函数作为第二个参数，在这种情况下，当匹配执行后，该函数就会执行。 函数的返回值作为替换字符串
            //match代表匹配的字串
            return map[match]
        }
        return function(string){
            return testExp.test(string) ? string.replace(testExp, replace) : string
        }
    }

    _.escape = creatEscaper(escapeMap)

    //函数组合
    _.compose = function(){
        var args = arguments
        var end = args.length - 1 //终点
        return function (data) {
            var i = end
            var result = args[i].apply(this, arguments)
            while(i--){
                result = args[i].call(this, result)
            }
            return result
        }
    }

    //函数组合
    _.composePlus = function(){
        var length = arguments.length
        var func = []
        for (let index = 0; index < length; index++) {
            func[index] = arguments[index];
        }

        if(func.length === 0){
            return function (params) {
                return params
            }
        }

        if(func.length === 1){
            return func[0]
        }

        return func.reduce(function(total, item) {
            return function() {
                return total(item.apply(undefined, arguments))
            }
        })
    }

    _.mixin(_)
    root._ = _
})(this)