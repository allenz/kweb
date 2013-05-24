/**
 * Author: Allen
 * Date: 8/7/12
 */
//var URL = "https://www.googleapis.com/freebase/v1/text/m/";
/**
 * Knowledge Web namespace. Provides a framework for loading nodes and
 * reponding to user input.
 */
var KWEB = {
    /** @type {boolean} if the stage should be redraw in the next animation frame */
    invalidated: true,

    /** @type {Array.<KWEB.Node>} */
    nodes: [],
    activeNode: null, //TODO what is this?
    
    /**
    * Precondition: KWEB.Nodes is z-sorted
    */
    redraw: function() {
       KWEB.ctx.clearRect(-KWEB.canvas.width / 2, -KWEB.canvas.height / 2, KWEB.canvas.width, KWEB.canvas.height);

       KWEB.ctx.fillStyle = 'white';
       KWEB.ctx.globalCompositeOperation = 'lighter'; // blends with bg

       KWEB.Node.ORIGIN.draw();

       //optimize: find index where z ~ 0
       for(var i = KWEB.nodes.length - 1; i >= 0; i--) {
           if(KWEB.nodes[i].visible) {
               KWEB.nodes[i].draw();
           }
       }
       if(KWEB.activeNode) KWEB.activeNode.drawEdges();

       KWEB.invalidated = false;
   },

    /**
     * @param {number} x
     * @param {number} y
     * @returns {KWEB.Node}
     */
    findNode: function(x, y) {
        "use strict";

        function dist(ax, ay, bx, by) {
            var dx = ax - bx;
            var dy = ay - by;
            return Math.sqrt(dx * dx + dy * dy);
        }

        for(var i = 0; i < KWEB.nodes.length; i++) {
            var proj = KWEB.nodes[i].proj();
            if(dist(x, y, proj.x, proj.y) <= proj.r) {
                return KWEB.nodes[i];
            }
        }
        return null;
    },
    R: 220,
    /** radius of the large sphere */
    f: 300,
    /** focus */
    RADIUS: 5 /** radius of each node */
};

// ~~~~~~~~~~~~~~~~~~~~ INIT CANVAS&CONTEXT ~~~~~~~~~~~~~~~~~~~~ //
KWEB.canvas = document.getElementById('kweb');
KWEB.ctx = KWEB.canvas.getContext('2d');
KWEB.ctx.translate(KWEB.canvas.width / 2, KWEB.canvas.height / 2); // make the center (0,0)
KWEB.ctx.strokeStyle = "#B2BEB5"; // for edges