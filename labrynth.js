/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var inputs = readline().split(' ');
var R = parseInt(inputs[0]); // number of rows.
var C = parseInt(inputs[1]); // number of columns.
var A = parseInt(inputs[2]); // number of rounds between the time the alarm countdown is activated and the time the alarm goes off.

var foundControlRoom = false;

class Graph {
    constructor(startX, startY, cols, rows) {
        this.closedSet = new Set();
        this.openSet = new Set();
        this.nodes = new Map();
        this.cols = cols;
        this.rows = rows;

        for(let x = 0; x < cols; x++) {
            for(let y = 0; y < rows; y++) {
                let node = new Node(x,y, Infinity, Infinity);
                this.nodes.set(node.getId(), node);
            }
        }

        this.startNode = this.nodes.get(Node.generateId(startX, startY));
    }

    findGoal(targetVal) {
        return (Array.from(this.nodes.values())).find(elm => {
            return elm.val === targetVal;
        });
    }

    setValue(x, y, val) {
        let node = this.nodes.get(Node.generateId(x, y));
        node.val = val;
    }

    getNode(x, y) {
        return this.nodes.get(Node.generateId(x, y));
    }

    getNeighboursToVisit(node) {
        let neighboursToVisit = [];
        if (node.x - 1 >= 0) {
            neighboursToVisit.push(this.getNode(node.x - 1, node.y));
        }
        if (node.x + 1 < C) {
            neighboursToVisit.push(this.getNode(node.x + 1, node.y));
        }
        if (node.y - 1 >= 0) {
            neighboursToVisit.push(this.getNode(node.x, node.y - 1));
        }
        if (node.y + 1 < R) {
            neighboursToVisit.push(this.getNode(node.x, node.y + 1));
        }
        neighboursToVisit = neighboursToVisit.filter(node => {
            return node.val !== "#";
        });
        return neighboursToVisit;
    }

    print(currX, currY) {
        printErr("-------------Printing graph-----------------------")
        for(let y = 0; y < this.rows; y++) {
            let row = "";
            for(let x = 0; x < this.cols; x++) {
                let node = this.getNode(x,y);
                if (node.x === currX && node.y === currY) {
                    row += "X";
                } else {
                    row += node.val;
                }
            }
            printErr(row);
        }
    }
}

class Node {
    constructor(x, y, gScore, fScore) {
        this.x = x;
        this.y = y;
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

class AStarSolver {
    constructor(graph) {
        this.graph = graph;
        this.closedSet = new Set();
        this.openSet = new Set();
        this.gScores = new Map();
        this.fScores = new Map();

        for(let node of graph.nodes.values()) {
            this.gScores.set(node.getId(), Infinity);
            this.fScores.set(node.getId(), Infinity);
            node.parent = null;
        }

        let startNode = graph.startNode;
        this.openSet.add(startNode);
        this.gScores.set(startNode.getId(), 0);
        this.fScores.set(startNode.getId(), this._calculateHeuristic(startNode));
    }

    getFScore(node) {
        return this.fScores.get(node.getId());
    }

    getGScore(node) {
        return this.gScores.get(node.getId());
    }

    getNextOpenNode() {
        if (this.openSet.size === 0) {
            return null;
        }
        let minNode = null;
        for(let node of this.openSet) {
            if (!minNode || this.getFScore(minNode) > this.getFScore(node)) {
                minNode = node;
            }
        }
        return minNode;
    }

    getNextMove () {
        let nextMove = null;
        while (this.openSet.size && !nextMove) {
            let currNode = this.getNextOpenNode();
            if (currNode.val === "T") {
                nextMove = getNextMoveInstruction(reconstructPath(currNode, this.graph.startNode), this.graph.startNode);
            } else {
                this.visit(currNode);
            }
        }

        return nextMove;
    }

    visit(node) {
        this.openSet.delete(node);
        this.closedSet.add(node);
        let neighboursToVisit = this.graph.getNeighboursToVisit(node);

        for (let neighbour of neighboursToVisit) {
            if (!this.closedSet.has(neighbour)) {
                let tentativeGScore = this.getGScore(node) + 1;
                if (!this.openSet.has(neighbour)) {
                    this.openSet.add(neighbour);
                } else if (tentativeGScore >= this.getGScore(neighbour)) {
                    continue;
                }
                neighbour.parent = node;
                this.gScores.set(neighbour.getId(), tentativeGScore);
                this.fScores.set(neighbour.getId(), tentativeGScore + this._calculateHeuristic(neighbour));

            }
        }
    }

        //Use Manhattan distance if we know where the goal is. Otherwise assume that the goal is in the middle of the graph
    _calculateHeuristic(node) {
        let goal = this.graph.findGoal("T");
        if (goal) {
            return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
        }
        return Math.abs(node.x - Math.floor(this.cols/2)) + Math.abs(node.y - Math.floor(this.rows/2));
    }
}

class BFSSolver {
    constructor(graph) {
        this.graph = graph;
        for (let node of graph.nodes.values()) {
            node.parent = null;
            node.distance = Infinity;
        }
        graph.startNode.distance = 0;
        this.queue = [graph.startNode];
    }

    _removeNodeFromQueue() {
        let minNode = this.queue.reduce((minNode, node) => {
            return !minNode || minNode.distance > node.distance ? node : minNode;
        }, null);

        if (minNode) {
            this.queue = this.queue.filter(node => {
                return node !== minNode;
            });
        }
        return minNode;
    }

    getNextMove() {
        let nextMove = null;
        while (this.queue.length > 0 && !nextMove) {
            let currNode = this.queue.shift();
            if (currNode.val === "C" || currNode.val === "?") {
                let nextNode = currNode;
                while (nextNode.parent && nextNode.parent !== this.graph.startNode) {
                    nextNode = nextNode.parent;
                }
                nextMove = getNextMoveInstruction(nextNode, this.graph.startNode);
            } else if (currNode.val !== "#") {
                for (let node of this.graph.getNeighboursToVisit(currNode)) {
                    if (node.distance === Infinity) {
                        node.distance = currNode.distance + 1;
                        node.parent = currNode;
                        this.queue.push(node);
                    }
                }
            }
        }
        return nextMove;
    }
}

function getNextMoveInstruction(nextNode, startNode) {
    while (nextNode.parent && nextNode.parent !== startNode) {
        nextNode = nextNode.parent;
    }
    if (startNode.x !== nextNode.x) {
        return startNode.x > nextNode.x ? "LEFT" : "RIGHT";
    }
    return startNode.y > nextNode.y ? "UP" : "DOWN";
}

function reconstructPath(nextNode, startNode) {
    while (nextNode.parent && nextNode.parent !== startNode) {
        nextNode = nextNode.parent;
    }
    return nextNode
}

// game loop
while (true) {
    var inputs = readline().split(' ');
    var startY = parseInt(inputs[0]); // row where Kirk is located.
    var startX = parseInt(inputs[1]); // column where Kirk is located.

    let graph = new Graph(startX, startY, C, R);
    for (var y = 0; y < R; y++) {
        var row = readline(); // C of the characters in '#.TC?' (i.e. one line of the ASCII maze).
        row.split("").forEach((ch, x) => {
            graph.setValue(x, y, ch);
        });
    }

    if (graph.startNode.val === "C") {
        foundControlRoom = true;
    }

    let solver = null;
    if (!foundControlRoom) {
        solver = new BFSSolver(graph);
    } else {
        solver = new AStarSolver(graph);
    }
    print(solver.getNextMove());
}