/**
 * Loads and processes KWEB nodes.
 *
 * @author Allen
 */

/*global KWEB:false*/

KWEB.processData = function(json) {
    var count = json.length;
    console.log(count);
    
    var lookup = {}; // MID -> Node
    
    for(var i = 0; i < count; i++){
        var curr = KWEB.Node.random();
        curr.MID = json[i].M;
        KWEB.nodes.push(curr);
        lookup[curr.MID] = curr;
    }
    
    var max = 0, MID = "";
    
    var strAdj;
    for(i = 0; i < count; i++){
        curr = KWEB.nodes[i];
        strAdj = json[i].l;
        for(var j = 0; j < strAdj.length; j++){
            if(lookup[strAdj[j]] !== undefined) curr.adjList.push(lookup[strAdj[j]]);
            else KWEB.log.INIT('could not find ' + strAdj[j]); // TODO
        }
        if(curr.adjList.length > max){
            max = curr.adjList.length;
            MID = curr.MID;
        }
    }
    console.log(MID + ": " + max);

    //KWEB.setClusters(5, 5, 0.8, 0.01);

    KWEB.Isom();
};

KWEB.setClusters = function(clusters, numberPer, clusterProb, oProb) {
    for (var i = 0; i < clusters * numberPer; i++) {
        var curr = KWEB.Node.random();
        curr.MID = "" + i;
        KWEB.nodes.push(curr);
    }

    for (i = 0; i < clusters * numberPer; i++) {
        curr = KWEB.nodes[i];
        var currCluster = Math.floor(i / clusters);
        for (var j = 0; j < i; j++) {
            var o = KWEB.nodes[j];
            var oCluster = Math.floor(j / clusters);
            if ((currCluster === oCluster && Math.random() < clusterProb) || Math.random() < oProb) {
                curr.adjList.push(o);
                o.adjList.push(curr);
            }
        }
    }
};

//KWEB.processData();

/*function setNodes() {
    for(var i = 0; i < 1000; i++){
        var curr = KWEB.Node.random();
        var currAdj = [];
        for(var j = 0; j < i; j++){
            if(Math.random() < 0.3){
                currAdj.push(KWEB.nodes[j]);
            }
        }
        curr.adjList = currAdj;
        KWEB.nodes.push(curr);
    }
    
    KWEB.Isom();
}*/