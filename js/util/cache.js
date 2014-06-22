import "util";

/**
 * Simple hash-based object cache.
 *
 * Adapted from:
 * http://markdaggett.com/blog/2012/03/28/client-side-request-caching-with-javascript/
 *
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.util.cache
 * @returns object literal with a add, get, getKey, and exists property
 * 
 * @example
 * var cache = st.util.cache();
 * var cacheKey = cache.getKey(myObject);
 * if (cache.exists(cacheKey)) {
 *  var cachedObject = cache.get(cacheKey);
 * } else {
 *  var cachedObject = myObject;
 *  cache.add(cacheKey, cachedObject);
 * }
 */
st.util.cache = function () {
    var cache = {},
    keys = [],

    /**
     * Returns an element's index in an array or -1.
     * 
     * @method indexOf
     * @param {object[]} arr - element array
     * @param {object} obj - element
     * @returns the elemen'ts index or -1
     */
    indexOf = function (arr, obj) {
        var len = arr.length;
        for (var i = 0; i < len; i++) {
            if (arr[i] === obj) {
                return i;
            }
        }
        return -1;
    },

    /**
     * Returns a string representation of any input.
     * 
     * @method serialize
     * @param {object} opts - input to stringify
     * @returns the stringified input object
     */
    serialize = function (opts) {
        if ((opts).toString() === "[object Object]") {
            return $.param(opts);
        } else {
            return (opts).toString();
        }
    },

     /**
     * Removes an element from the cache via its key.
     * 
     * @method remove
     * @param {string} key - the element's key
     */
    remove = function (key) {
        var t;
        if ((t = indexOf(keys, key)) > -1) {
            keys.splice(t, 1);
            delete cache[key];
        }
    },

    /**
     * Removes all elements from the cache.
     * 
     * @method removeAll
     */
    removeAll = function () {
        cache = {};
        keys = [];
    },

    /**
     * Adds an element to the cache.
     * 
     * @method add
     * @param {string} key - the element's key
     * @param {object} obj - the element to be added
     */
    add = function (key, obj) {
        if (keys.indexOf(key) === -1) {
            keys.push(key);
        }
        cache[key] = obj;
    },

    /**
     * Checks whether a key has already been added to the cache.
     * 
     * @method exists
     * @param {string} key - the element's key
     * @returns boolean if the key exists in the cache
     */
    exists = function (key) {
        return cache.hasOwnProperty(key);
    },

    /**
     * Removes a selected or all elements from the cache.
     * 
     * @method purge
     * @returns the purged cache array
     */
    purge = function () {
        if (arguments.length > 0) {
            remove(arguments[0]);
        } else {
            removeAll();
        }
        return $.extend(true, {}, cache);
    },

    /**
     * Returns matching keys from the cache in an array.
     * 
     * @method searchKeys
     * @param {string} str - the query key (string)
     * @returns the array of matching keys
     */
    searchKeys = function (str) {
        var keys = [];
        var rStr;
        rStr = new RegExp('\\b' + str + '\\b', 'i');
        $.each(keys, function (i, e) {
            if (e.match(rStr)) {
                keys.push(e);
            }
        });
        return keys;
    },

    /**
     * Returns the element for a given key.
     * 
     * @method get
     * @param {string} key - the element's key
     * @returns the key's cached object
     */
    get = function (key) {
        var val;
        if (cache[key] !== undefined) {
            if ((cache[key]).toString() === "[object Object]") {
                val = $.extend(true, {}, cache[key]);
            } else {
                val = cache[key];
            }
        }
        return val;
    },

    /**
     * Returns the string representation of the element.
     * 
     * @method getKey
     * @param {object} opts - the element to be stringified
     * @returns the string representation fo the element
     */
    getKey = function (opts) {
        return serialize(opts);
    },

    /**
     * Returns all keys stored in the cache.
     * 
     * @method getKeys
     * @returns the array of keys
     */
    getKeys = function () {
        return keys;
    };

    // reference visible (public) functions as properties
    return {
        add: add,
        get: get,
        getKey: getKey,
        exists: exists,
    };
};