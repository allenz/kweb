/**
 * requestAnimationFrame POLYFILL
 * This module provides cross-browser support for the animation loop.
 * See also http://paulirish.com/2011/requestanimationframe-for-smart-animating
 * and http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating.
 *
 * Author: Erik Möller with fixes from Paul Irish and Tino Zijdel
 */
(function() {
    var lastTime = 0;
    
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 40 - (currTime - lastTime)); // 25 fps
        var id = window.setTimeout(function() {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };

    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}());

// indexOf
//if (!Array.prototype.indexOf) {
//    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
//        "use strict";
//        if (this == null) {
//            throw new TypeError();
//        }
//        var t = Object(this);
//        var len = t.length >>> 0;
//        if (len === 0) {
//            return -1;
//        }
//        var n = 0;
//        if (arguments.length > 0) {
//            n = Number(arguments[1]);
//            if (n != n) { // shortcut for verifying if it's NaN
//                n = 0;
//            } else if (n != 0 && n != Infinity && n != -Infinity) {
//                n = (n > 0 || -1) * Math.floor(Math.abs(n));
//            }
//        }
//        if (n >= len) {
//            return -1;
//        }
//        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
//        for (; k < len; k++) {
//            if (k in t && t[k] === searchElement) {
//                return k;
//            }
//        }
//        return -1;
//    }
//}