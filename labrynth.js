/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var inputs = readline().split(' ');
var R = parseInt(inputs[0]); // number of rows.
var C = parseInt(inputs[1]); // number of columns.
var A = parseInt(inputs[2]); // number of rounds between the time the alarm countdown is activated and the time the alarm goes off.

printErr("init", R, C);
var targetVal = "C";

class Graph {
    constructor(startX, startY, cols, rows) {
        this.closedSet = new Set();
        this.openSet = new Set();
        this.nodes = new Map();
        this.gScores = new Map();
        this.fScores = new Map();
        this.cols = cols;
        this.rows = rows;

        for(let x = 0; x < cols; x++) {
            for(let y = 0; y < rows; y++) {
                let node = new Node(x,y, Infinity, Infinity);
                this.nodes.set(node.getId(), node);
            }
        }

        let startNode = this.nodes.get(Node.generateId(startX, startY));
        this.openSet.add(startNode);
        startNode.gScore = 0 ;
        startNode.fScore = this._calculateHeuristic(startNode);
    }

    visit(node) {
        this.openSet.delete(node);
        this.closedSet.add(node);
        let neighboursToVisit = new Set();
        if (node.x - 1 >= 0) {
            neighboursToVisit.add(this.getNode(node.x - 1, node.y));
        }
        if (node.x + 1 < C) {
            neighboursToVisit.add(this.getNode(node.x + 1, node.y));
        }
        if (node.y - 1 >= 0) {
            neighboursToVisit.add(this.getNode(node.x, node.y - 1));
        }
        if (node.y + 1 < R) {
            neighboursToVisit.add(this.getNode(node.x, node.y + 1));
        }

        for (let neighbour of neighboursToVisit) {
            if (!this.closedSet.has(neighbour) && neighbour.val !== "#") {
                let tentativeGScore = node.gScore + 1;
                if (!this.openSet.has(neighbour)) {
                    this.openSet.add(neighbour);
                }
                if (tentativeGScore < neighbour.gScore) {
                    neighbour.parent = node;
                    neighbour.gScore = tentativeGScore;
                    neighbour.fScore = neighbour.gScore + this._calculateHeuristic(neighbour);
                }
            }
        }
    }

    //Use Manhattan distance if we know where the goal is. Otherwise assume that the goal is in the middle of the graph
    _calculateHeuristic(node) {
        let goal = this.findGoal();
        if (goal) {
            return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
        }
        return Math.abs(node.x - Math.floor(this.cols/2)) + Math.abs(node.y - Math.floor(this.rows/2));
    }

    findGoal() {
        return (new Array(this.nodes.values())).find(elm => {
            return elm.value === targetVal;
        });
    }

    setValue(x, y, val) {
        this.nodes.set(Node.generateId(), val);
    }

    getNextOpenNode() {
        if (this.openSet.size === 0) {
            return null;
        }
        let minNode = null;
        for(let node of this.openSet) {
            if (!minNode || minNode.fScore < node.fScore) {
                minNode = node;
            }
        }
        return minNode;
    }

    getNode(x, y) {
        return this.nodes.get(Node.generateId(x, y));
    }

    getLowestNodeWithLowestDefinedFScore(ignoreNode) {
        let minNode = null;
        for(let node of this.nodes.values()) {
            if (node.fScore && node.fScore !== Infinity && node !== ignoreNode) {
                if (!minNode || minNode.fScore < node.fScore) {
                    minNode = node;
                }
            }
        }
        return minNode;
    }

    print() {
        printErr("-------------Printing graph-----------------------")
        for(let x = 0; x < this.cols; x++) {
            let row = "";
            for(let y = 0; y < this.rows; y++) {
                let node = this.getNode(x,y);
                row += node.val;
            }
            printErr(row);
        }
    }
}

class Node {
    constructor(x, y, gScore, fScore) {
        this.x = x;
        this.y = y;
        this.gScore = gScore;
        this.fScore = fScore;
        this.parent = null;
        this.val = "?";
    }

    static generateId(x, y) {
        return `${x}-${y}`;
    }

    getId() {
        return Node.generateId(this.x, this.y);
    }
}

function getNextMove(targetNode, startNode) {
    while (targetNode.parent !== startNode) {
        targetNode = targetNode.parent;
    }
    if (startNode.x !== targetNode.x) {
        return startNode.x > targetNode.x ? "LEFT" : "RIGHT";
    }
    return startNode.y > targetNode.y ? "UP" : "DOWN";
}

// game loop
while (true) {
    var inputs = readline().split(' ');
    var startY = parseInt(inputs[0]); // row where Kirk is located.
    var startX = parseInt(inputs[1]); // column where Kirk is located.

    let graph = new Graph(startX, startY, C, R);
    for (var y = 0; y < R; y++) {
        var row = readline(); // C of the characters in '#.TC?' (i.e. one line of the ASCII maze).
        row.split().forEach((ch, x) => {
            graph.setValue(x, y, ch);
        });
    }

    printErr(graph.print());
    let nextMove = null;
    while (graph.openSet.size && !nextMove) {
        let currNode = graph.getNextOpenNode();
        if (currNode.val === targetVal) {
            nextMove = getNextMove(currNode, graph.getNode(startX, startY));
        }
        graph.visit(currNode);
    }

    if (nextMove) {
        print(nextMove);
    }

    print(getNextMove(graph.getLowestNodeWithLowestDefinedFScore(graph.getNode(startX, startY)), graph.getNode(startX, startY)));


}