/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var inputs = readline().split(' ');
var w = parseInt(inputs[0]); // width of the board
var h = parseInt(inputs[1]); // height of the board
var playerCount = parseInt(inputs[2]); // number of players (2 or 3)
var myId = parseInt(inputs[3]); // id of my player (0 = 1st player, 1 = 2nd player, ...)

function isNodeObjective(id, xPos, yPost) {
    if(id === 0) {
        return xPos === 8;
    } else if (id === 1) {
        return xPos === 0;
    } else {
        return yPos === 8;
    }
}

class Node {
     constructor(x, y) {
         this.x = x;
         this.y = y;
         this.shortestPath = null;
         this.visited = false;
         this.reachableNodeCoords = [];
     }

     static generateKey(x,y) {
        return x + "-" + y;
     }
}

class Graph {
    constructor(walls) {
        this.nodes = new Map();
        for(let x = 0; x < 9; x++) {
            for(let y = 0; y < 9; y++) {
                let node = new Node(x,y);
                if (x > 0 && !isMoveBlockedByWall(x, x-1, y, y, walls)) {
                    node.reachableNodeCoords.push([x-1, y]);
                }
                if (x < 8 && !isMoveBlockedByWall(x, x+1, y, y, walls)) {
                    node.reachableNodeCoords.push([x+1, y]);
                }
                if (y > 0 && !isMoveBlockedByWall(x, x, y, y-1, walls)) {
                    node.reachableNodeCoords.push([x, y-1]);
                }
                if (y < 8 && !isMoveBlockedByWall(x, x, y, y+1, walls)) {
                    node.reachableNodeCoords.push([x, y+1]);
                }
                this.nodes.set(Node.generateKey(x,y), node);
            }
        }
    }

    getNode(x, y) {
        return this.nodes.get(Node.generateKey(x,y));
    }

    getNextUnvisitedNode() {
        return this.nodes.filter(node => {
            return !node.visited && node.path;
        }).reduce((node, prevNode) => {
            if (!prevNode || prevNode.path.length > node.path.length) {
                return node;
            }
            return prevNode;

        }, null)
    }
}

//Wall represented by [x, y, orientation]
function isMoveBlockedByWall(x0, x1, y0, y1, wall) {
    if (x0 !== x1 && wall[2] === "V") {
        let yDistBelowWallStart = wall[1] - y0;
        let crosesX = (x0 === wall[0] && x1 === wall[0] -1) || (x1 === wall[0] && x0 === wall[0] -1);
        return (yDistBelowWallStart === 1 || yDistBelowWallStart === 0) && crosesX;
    } else if (y0 !== y1 && wall[2] === "H") {
        var xDistRightWallStart = wall[0] - x0;
        let crosesY = (y0 === wall[1] && y1 === wall[1] -1) || (y1 === wall[1] && y0 === wall[1] -1);
        return (xDistRightWallStart === 1 || xDistRightWallStart === 0) && crosesY;
    }
    return false;
}

function isDestination(id, node) {
    let x = node.x,
        y = node.y;
    if (id === 0 && x === 8) {
        return true;
    } else if (id === 1 && x === 0) {
        return true;
    } else if (id === 2 && y === 8) {
        return true;
    }

    return false;
}

//Returns [path, isOnlyPath] where path is Q of nodes to move, isOnlyPath is boolean representing if there is only 1 path
function findPath(id, xPos, yPos, walls) {
    let graph = new Graph(walls)
    let currNode = graph.getNode(xPos, yPos);
    currNode.shortestPath = [];
    let prevNode = null;
    let foundPath = null;
    let secondPath = null;

    while(currNode && (!foundPath && !secondPath)) {
        if (isDestination(id, currNode)) {
            if (foundPath) {
                secondPath = currNode.shortestPath;
            } else {
                foundPath = currNode.shortestPath;
            }
        }
        currNode.reachableNodeCoords.forEach((coord) => {
            let otherNode = graph.getNode(coord[0], coord[1]);
            if (!otherNode.shortestPath || otherNode.shortestPath.length > currNode.shortestPath.length +1) {
                otherNode.shortestPath = currNode.shortestPath.concat([currNode]);
            }
        });
        currNode.visited = true;
        currNode = graph.getNextUnvisitedNode();
    }

    return [foundPath, !!secondPath];
}

// game loop
while (true) {
    let playerPosition = new Map();
    for (var i = 0; i < playerCount; i++) {
        var inputs = readline().split(' ');
        var x = parseInt(inputs[0]); // x-coordinate of the player
        var y = parseInt(inputs[1]); // y-coordinate of the player
        var wallsLeft = parseInt(inputs[2]); // number of walls available for the player
        playerPosition.set(i, {x: x, y: y});
    }
    var wallCount = parseInt(readline()); // number of walls on the board

    let walls = [];
    for (var i = 0; i < wallCount; i++) {
        var inputs = readline().split(' ');
        var wallX = parseInt(inputs[0]); // x-coordinate of the wall
        var wallY = parseInt(inputs[1]); // y-coordinate of the wall
        var wallOrientation = inputs[2]; // wall orientation ('H' or 'V')
        walls.push([wallX, wallY, wallOrientation]);
    }

    let currPos = playerPosition.get(myId);
    var foundPath = findPath(myId, currPos.x, currPos.y, walls)[0];
    var nextNode = foundPath[0];

    let move = null;
    if (nextNode.x !== currPos.x) {
        move = nextNode.x > currPos.x ? "RIGHT" : "LEFT";
    } else {
        move = nextNode.y > currPos.y ? "DOWN" : "UP";
    }


    // action: LEFT, RIGHT, UP, DOWN or "putX putY putOrientation" to place a wall
    print(move);
}