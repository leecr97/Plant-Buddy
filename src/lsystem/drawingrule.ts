import {vec3, mat4, quat} from 'gl-matrix';
import Turtle from "./Turtle";

export default class DrawingRule {
    // precondition: string;
    // drawAction: any;
    // probability: number;
    // new_symbol: string;
    currTurtle: Turtle;
    turtleStack: Turtle[];
    drawingMap: Map<string, any> = new Map<string, any>();
    angle: number = 25.0;

    branchData: mat4[] = [];
    leafData: mat4[] = [];

    constructor() {
        this.initTurtle();
        this.createDrawingRules();
    }

    initTurtle() {
        this.currTurtle = new Turtle(vec3.fromValues(0,0,0), 
                                     vec3.fromValues(0,1,0),
                                     quat.fromValues(0,0,0,1), this.angle, 1);
        this.turtleStack = [];
    }

    createDrawingRules() {
        // F - move forware
        this.drawingMap.set("F", this.currTurtle.moveForward.bind(this.currTurtle));
        // X - draw leaf
        this.drawingMap.set("X", this.currTurtle.drawLeafRotate.bind(this.currTurtle));
        this.drawingMap.set("L", this.currTurtle.drawLeaf.bind(this.currTurtle));
        // rotations
        this.drawingMap.set("-", this.currTurtle.rotateForwardPos.bind(this.currTurtle));
        this.drawingMap.set("+", this.currTurtle.rotateUpPos.bind(this.currTurtle));
        this.drawingMap.set("~", this.currTurtle.rotateRightPos.bind(this.currTurtle));

        this.drawingMap.set("=", this.currTurtle.rotateForwardNeg.bind(this.currTurtle));
        this.drawingMap.set("_", this.currTurtle.rotateUpNeg.bind(this.currTurtle));
        this.drawingMap.set("*", this.currTurtle.rotateRightNeg.bind(this.currTurtle));
    }

    pushTurtle() {
        let pos: vec3 = vec3.create();
        vec3.copy(pos, this.currTurtle.position);
        let ori: vec3 = vec3.create();
        vec3.copy(ori, this.currTurtle.orientation);
        let q: quat = quat.create();
        quat.copy(q, this.currTurtle.quaternion);

        let newT : Turtle = new Turtle(pos, ori, q, this.angle, this.currTurtle.scale);
        this.turtleStack.push(newT);
    }

    popTurtle() {
        let newT : Turtle = this.turtleStack.pop();
        if (newT) {
            this.currTurtle.position = newT.position;
            this.currTurtle.orientation = newT.orientation;
            this.currTurtle.quaternion = newT.quaternion;
            this.currTurtle.scale = newT.scale;
            // console.log(this.currTurtle.getTransformation());
        }
    }

    draw(axiom: string) {
        let scale : number = 1;
        for (let i: number = 0; i < axiom.length; i++) {
            let c: string = axiom[i];
            let drawFunc: any = this.drawingMap.get(c);

            // stack stuff
            if (c == "[") {
                this.pushTurtle();
            }

            if (c == "]") {
                this.popTurtle();
            }

            // drawing stuff
            if (drawFunc) {
                drawFunc();

                let mat: mat4;
                mat = mat4.create();

                if (c == 'X' || c == 'L') {
                    mat = this.currTurtle.getTransformation(1);
                    this.leafData.push(mat);
                }
                else if (c == 'F') {
                    mat = this.currTurtle.getTransformation(scale);
                    this.branchData.push(mat);
                    scale *= 0.98;
                    if (scale < 0.02) {
                        scale = 0.02;
                    }
                }
                else {
                    mat = this.currTurtle.getTransformation(scale);
                    this.branchData.push(mat);
                }
            }

        }
    }

}