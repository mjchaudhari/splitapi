/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var _hlp = {};

    // global on the server, window in the browser
    var root;

    root = this;
    if (root != null) {
      
    }
    
    _hlp.regex = {};
    /**
     * create pattern that matches the parent id in commaseparated path where path ends with parent id
    */
    _hlp.regex.parentPattern = function(parentId){
        
        //pattern  \/[8]*\/[,]|\/[\8]*\/$
        //          \/[d]*\/[,]|\/[d]*\/$
        //return "\/"+ parentId + ",\/|\/"+ parentId +"\/$";
        //return "\/["+ parentId+"]*\/[,]|\/["+ parentId+"]*\/$";
        return "\/" + parentId + "\/[,]|\/" + parentId +"\/$";
    } 
    /**
     * create the pattern to match  the ancester id in comma separated path
    */
    _hlp.regex.ancesterPattern = function(parentId){
        
        //pattern  /\/[\d]*\//
        return "\/"+ parentId +"\/";
        
    } ; 
    
//
/**
     * Walk through each node of the tree
     *
     * @param {object} [current node to be iterated for children]
     * @param {function(node)} [callbace that execute when the child node is found]
     * @param {option} [options = {childrenAttribute:'Children'}]
     * @public
     */
    _hlp.treeWalker =  function (node, findNodeHandler, opt) {
        var childrenAttribute = "Children";
        if (opt) {
            if (opt.childrenAttribute && opt.childrenAttribute != "") {
                childrenAttribute = opt.childrenAttribute;
            }
        }

        if (findNodeHandler) {
            findNodeHandler(node);
        }
        if (node[childrenAttribute]) {
            for (var i = 0; i < node[childrenAttribute].length; i++) {
                this.treeWalker(node[childrenAttribute][i],findNodeHandler, opt);
            }
        }

    };
    /**
     * is valid base 64 image url string
     */
    _hlp.isBase64Image = function(b64String){
        var matches = b64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        
        if (matches.length !== 3) {
            return false
        }
        else{
            return true;
        }
                
    };
    /**
     * Check if the object has a value or resolves to undefined
     *
     * @param {object} [object to be checked]
     * @return {boolean}
     * @public
     */
    _hlp.hasValue = function(obj){
        try{
            var o = obj;
            if(o)
            {
                return true;
            }
            else    
            {
                return false;
            }
        }
        catch (e){
            return false;
        }
    };
    
    // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return _hlp;
        });
    }
    // Node.js
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = _hlp;
    }
    // included directly via <script> tag
    else {
        root._hlp = _hlp;
    }

}());

