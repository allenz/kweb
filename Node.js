/**
 * Author: Allen
 * Date: 8/7/12
 */
/*global KWEB:false*/

/**
 * Represents a graph-theoretic node positioned in 3D space. Keeps track of
 * identity, position, and adjacencies. Includes convenience spherical methods.
 * Note that the z-coordinate is interpreted as being out of the page.
 * 
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {string} MID
 */
KWEB.Node = function(x, y, z, MID, adjList) {
    "use strict";
    
    if (!(this instanceof KWEB.Node)) {
        throw new Error("KWEB.Node constructor called as a function");
    }
    
    /**
     * Serves as the identity of the node in Freebase queries.
     * Must be unique or hashes and dependencies, in particular KWEB.Isom:calcDists(), will fail.
     * @type {string}
     */
    this.MID = MID;

    this.x = x;
    this.y = y;
    this.z = z; // TODO 3D

    this.adjList = adjList; // TODO

    this.visible = true;
};

// static constants
KWEB.Node.ORIGIN = new KWEB.Node(0, 0, 0, "origin", []);
KWEB.Node.FULL_CIRCLE = 2 * Math.PI;
KWEB.Node.DIST_MAX = KWEB.R * KWEB.Node.FULL_CIRCLE;

/**
 * Calculates the projection of this node from 3D to screen coordinates
 * @returns {{x: number, y:number, r:number}}
 */
KWEB.Node.prototype.proj = function() {
    var scale = KWEB.f / (KWEB.f + this.z);
    return {
        x: scale * this.x,
        y: scale * this.y,
        r: scale * KWEB.RADIUS
    };
};

/**
 * Rotates the Node around the y-axis. TODO rotate along x-axis as well.
 * @param {number} angle
 */
KWEB.Node.prototype.rotate = function(angle) {
    var cosRY = Math.cos(angle * Math.PI / 180);
    var sinRY = Math.sin(angle * Math.PI / 180);

    var tempX = this.x;
    this.x = (this.z * sinRY) + (tempX * cosRY);
    this.z = (this.z * cosRY) - (tempX * sinRY);

    this.visible = this.z > 20 - KWEB.f;
};

// VECTOR OPERATIONS

/**
 * Adds Node o to this Node in place.
 * @param {KWEB.Node} o
 * @returns {KWEB.Node}
 */
KWEB.Node.prototype.add = function(o) {
    this.x += o.x;
    this.y += o.y;
    this.z += o.z;
    return this;
};

/**
 * Subtracts Node o from this Node in place.
 * @param {KWEB.Node} o
 * @returns {KWEB.Node}
 */
KWEB.Node.prototype.subtract = function(o) {
    this.x -= o.x;
    this.y -= o.y;
    this.z -= o.z;
    return this;
};

/** @return {number} */
KWEB.Node.prototype.magnitude = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};

/** @returns {!KWEB.Node} this Node, scaled */

/**
 * Increases the magnitude of this Node by s, in place.
 * @param {number} s
 * @returns {KWEB.Node}
 */
KWEB.Node.prototype.scale = function(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
};

/** @returns {!KWEB.Node} this Node, normalized to the KWEB sphere */
KWEB.Node.prototype.normalize = function() {
    return this.scale(KWEB.R / this.magnitude());
};

/**
 * @param {KWEB.Node} a
 * @param {KWEB.Node} b
 * @return {number} The dot-product of the two Nodes
 */
KWEB.Node.dot = function(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
};

/**
 * @param {Node|{x:number, y:number, z:number}} a
 * @param {Node} b
 * @return {number} the distance between two Nodes on the KWEB sphere
 */
KWEB.Node.dist = function(a, b) {
    var inv = 1 / KWEB.R;
    return KWEB.Node.dot(a, b) * inv * inv;
};

// RANDOM AND CONVERSION METHODS

/**
 * Creates a Node from spherical coordinates with radius KWEB.R, for testing purposes.
 * @param {number} theta
 * @param {number} phi
 * @returns {KWEB.Node}
 */
KWEB.Node.fromSphere = function(theta, phi, MID, adjList) {
    return new KWEB.Node(KWEB.R * Math.cos(theta) * Math.sin(phi), KWEB.R * Math.sin(theta) * Math.sin(phi), KWEB.R * Math.cos(phi), MID, adjList);
};

/**
 * http://mathworld.wolfram.com/SpherePointPicking.html
 * @return {!KWEB.Node} A random unit vector.
 */
KWEB.Node.randomUnit = function() {
    var theta = Math.random() * KWEB.Node.FULL_CIRCLE;
    var phi = Math.random() * KWEB.Node.FULL_CIRCLE;

    var z = Math.cos(phi);
    var x = Math.sqrt(1 - z * z) * Math.cos(theta);
    var y = Math.sqrt(1 - z * z) * Math.sin(theta);

    return new KWEB.Node(x, y, z, 'unit', []);
};

/**
 * Creates a random Node on the KWEB sphere with a sequential MID and no adjacencies. For testing purposes.
 * @return {KWEB.Node}
 */
KWEB.Node.random = function() {
    var unit = KWEB.Node.randomUnit().scale(KWEB.R);
    unit.MID = 'random';
    return unit;
};

// DRAW

KWEB.Node.prototype.draw = function(active) {
    var proj = this.proj();

    KWEB.ctx.beginPath();
    var gradient = KWEB.ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, proj.r);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.4, "white");
    gradient.addColorStop(1, "black");

    KWEB.ctx.fillStyle = gradient;
    KWEB.ctx.arc(proj.x, proj.y, proj.r, 0, Math.PI * 2, false);
    KWEB.ctx.fill();
};

KWEB.Node.prototype.drawEdges = function(){
    var proj = this.proj();
    for (var i = 0; i < this.adjList.length; i++) {
        var oProj = this.adjList[i].proj();
    
        KWEB.ctx.beginPath();
        KWEB.ctx.moveTo(proj.x, proj.y);
        KWEB.ctx.lineTo(oProj.x, oProj.y);
        KWEB.ctx.stroke();
    
        //console.log(proj.x + "," + proj.y + " to " + oProj.x + "," + oProj.y);
    }
};

// debug only
KWEB.Node.prototype.toString = function(){
    return this.MID + " (" + this.x + "," + this.y + "," + this.z + ")";
};