;(function(root){
    var _ = function(obj){
        if(!(this instanceof _)){
            return new _(obj)
        }

        this._wrapped = obj
    };

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

    _.prototype.unique = _.unique

    _.map = function(){

    }
    root._ = _
})(this)