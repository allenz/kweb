/**
 * EVENT HANDLING
 * This module sets up the main animation loop and handles mouse events (i.e.
 * select, rotate, tooltip). Requires reqAnim.
 * TODO momentum http://andrew-hoyer.com/experiments/clock/
 * 
 * Author: Allen
 * Date: 8/7/12
 */
/*global KWEB:false*/
(function() {
	"use strict";
	var pos;
    var offsetX, offsetY; //needed for tooltip--use pos() for events

	// calculate offsets
	(function() {

		function calculateOffsets() {
			offsetX = 0; // reset
			offsetY = 0;
			var element = KWEB.canvas;
			if(element.offsetParent) {
				do {
					offsetX += element.offsetLeft;
					offsetY += element.offsetTop;
				} while ((element = element.offsetParent));
			}

			offsetX += KWEB.canvas.width / 2;
			offsetY += KWEB.canvas.height / 2;
		}
		calculateOffsets();

		/**
		 * Returns the position of a mouse event in canvas coords.
		 */
		pos = function(e) {
			var x = 0,
				y = 0;
			if(e.pageX !== undefined) {
				x = e.pageX;
				y = e.pageY;
			} else {
				x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			}
			return {
				x: x - offsetX,
				y: y - offsetY
			};
		};
	})();
    
    // select node
    KWEB.canvas.addEventListener('click', function onClick(e){
        var p = pos(e);
		KWEB.activeNode = KWEB.findNode(p.x, p.y);
		if(KWEB.activeNode !== null) {
			//KWEB.Tooltip.show(node);
		}
        KWEB.invalidated = true;
    }, false);

	// handle rotation
	var rotating = false,
		startPos, endPos;
	KWEB.canvas.addEventListener('mousedown', function startRotate(e) {
		if(!rotating) {
			rotating = true;
			startPos = endPos = pos(e);
		}
	}, false);
	KWEB.canvas.addEventListener('mouseup', stopRotate, false);
	KWEB.canvas.addEventListener('mouseout', stopRotate, false);

	function stopRotate(e) {
		if(rotating) {
			rotating = false;
			rotate();
		}
	}

	KWEB.canvas.addEventListener('mousemove', function showTooltip(e) {
		if(rotating) endPos = pos(e);
		else { // tooltip
			var p = pos(e);
			var node = KWEB.findNode(p.x, p.y);
			node === null ? hide(node) : show(node);
		}
	}, false);

	function rotate() {
        if (!endPos) return;
		var angle = endPos.x - startPos.x;
		if(angle === 0) return;
		startPos = endPos;

		for(var i = 0; i < KWEB.nodes.length; i++)
			KWEB.nodes[i].rotate(angle);

		KWEB.nodes.sort(function compareZ(a,b){
            return a.z - b.z;
        });
		KWEB.invalidated = true;
	}
    
    //tooltip
    var tooltip = document.getElementById('tooltip');
    function show(node) {
        var proj = node.proj();
        
        tooltip.style.left = proj.x + 15 + offsetX + "px";
        tooltip.style.top = proj.y - 30 + offsetY + "px";
        tooltip.innerText = node.MID;
    }
    function hide(node) {
        tooltip.style.left = '-999px';
    }

	//animation loop
	function step() {
		window.requestAnimationFrame(step);
		if(rotating) rotate();
		if(KWEB.invalidated) KWEB.redraw();
	}
	step();
}());