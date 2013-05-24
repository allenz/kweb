/**
 * Author: Allen
 * Date: 8/7/12
 */
/*global KWEB:false*/

KWEB.Isom = function() {

    /**
     * Configurable parameters: initial radius, initial adaptation,
     * cooling factor, and number of iterations.
     * @type {number}
     */
    var r_init = 3,
        adapt_init = 0.8,
        c = 0.4,
        t_max = 100,
        delay = 0;

    var r, adaptation, t = 1;

    run();

    function run() {

        r = Math.floor(r_init * (t_max - t) / t_max + 1);
        
        adaptation = Math.exp(-c * t / t_max) * adapt_init;

        var random = KWEB.Node.random();
        var w = nearest(random);
        var dists = calcDists(w);

        var d = 0,
            decay = 1;

        for (var i = 0; i < dists.list.length; i++) {
            var curr = dists.list[i];
            
            //console.log(dists[curr.MID]);
            
            if (d !== dists[curr.MID]) {
                d = dists[curr.MID];
                decay = Math.pow(2, - d); // update decay
                //console.log(d);
            }
            
            //console.log("distance " + d);
            
            var diff = random.subtract(curr);
            //console.log("subtract " + diff);
            
            diff.scale(decay * adaptation);
            //console.log("scale " + diff);
            
            curr.add(diff);
            //console.log("add " + curr);
            
            curr.normalize();
            //console.log("normalize " + curr);
        }

        t++;
        KWEB.invalidated = true;
        
        if (t < t_max) setTimeout(run, delay);
    }

    /**
     * Returns an object which maps KWEB.Node MIDs to graph-theoretic distances
     * from the root node. An index of KWEB.Nodes is provided as property 'list'.
     * Runs in O(V). Since JavaScript property access is based on hashmap,
     * retrieval is O(1).
     * 
     * @param {KWEB.Node} root node to calcluate distances from
     * @return {Object}
     */
    function calcDists(root) {

        var visited = {}, toVisit = {}; // map MID -> dist
        var visitedList = [],
            toVisitList = [root]; // ordered list of nodes

        toVisit[root.MID] = 0;
        //console.log('toVisit add ' + root + ' (root)');

        while (toVisitList.length !== 0) {
            
            //KWEB.log.OBJ(toVisitList);
            
            var curr = toVisitList.shift(); // remove first element (breadth-first)
            var d = toVisit[curr.MID];
            delete toVisit[curr.MID];
            
            visitedList.push(curr);
            visited[curr.MID] = d;
            
            //console.log('toVisit pop ' + curr + ' distance: ' + d);

            if (d < r) {
                for (var i = 0; i < curr.adjList.length; i++) {
                    var o = curr.adjList[i];
                    if (visited[o.MID] === undefined && toVisit[o.MID] === undefined) {
                        //if (o === undefined) KWEB.log.OBJ(curr.MID);
                        toVisitList.push(o);
                        toVisit[o.MID] = d + 1;
                        
                        //console.log(d);
                        
                        //console.log('toVisit push ' + o);
                    }
                }
            }
        }
        
        visited.list = visitedList;
        console.log(visited)

        return visited;
    }

    function nearest(node) {
        var nodes = KWEB.nodes;

        var nearestNode = null;
        var distance = KWEB.Node.DIST_MAX;

        for (var i = 0; i < nodes.length; i++) {
            var curr = nodes[i];
            var currD = KWEB.Node.dist(curr, node);
            if (currD < distance) {
                nearestNode = curr;
                distance = currD;
            }
        }
        return nearestNode;
    }
};