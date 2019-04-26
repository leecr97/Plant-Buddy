import {vec3, mat4, quat} from 'gl-matrix';
import Turtle from "./Turtle";

export default class DrawingRule {
    currTurtle: Turtle;
    turtleStack: Turtle[];
    drawingMap: Map<string, any> = new Map<string, any>();
    angle: number = 25.0;

    branchData: mat4[] = [];
    leafData: mat4[] = [];

    // lenscale: number;
    wilt: boolean;

    constructor(s: number, w: boolean) {
        this.initTurtle();
        this.createDrawingRules();
        this.wilt = w;
        // this.lenscale = s / 5.0;
        // console.log("len: " + this.lenscale);
    }

    initTurtle() {
        this.currTurtle = new Turtle(vec3.fromValues(0,0,0), 
                                     quat.fromValues(0,0,0,1), 
                                     this.angle, 
                                     vec3.fromValues(1,1,1), 
                                     0,
                                     vec3.fromValues(0,1,0),
                                     vec3.fromValues(0,0,1),
                                     vec3.fromValues(1,0,0));
        this.turtleStack = [];
    }

    createDrawingRules() {
        // F - move forward and draw branch
        this.drawingMap.set("F", this.currTurtle.moveForward.bind(this.currTurtle));
        // S - step forward without drawing branch
        this.drawingMap.set("S", this.currTurtle.stepForward.bind(this.currTurtle));
        // L, P - draw leaf
        // this.drawingMap.set("X", this.currTurtle.drawLeafRotate.bind(this.currTurtle));
        this.drawingMap.set("L", this.currTurtle.drawLeaf.bind(this.currTurtle));
        this.drawingMap.set("P", this.currTurtle.drawPalmLeaf.bind(this.currTurtle));

        // rotations
        this.drawingMap.set("+", this.currTurtle.rotateForwardPos.bind(this.currTurtle));
        this.drawingMap.set("=", this.currTurtle.rotateUpPos.bind(this.currTurtle));
        this.drawingMap.set("~", this.currTurtle.rotateRightPos.bind(this.currTurtle));

        this.drawingMap.set("-", this.currTurtle.rotateForwardNeg.bind(this.currTurtle));
        this.drawingMap.set("_", this.currTurtle.rotateUpNeg.bind(this.currTurtle));
        this.drawingMap.set("*", this.currTurtle.rotateRightNeg.bind(this.currTurtle));
    }

    pushTurtle() {
        let pos: vec3 = vec3.create();
        vec3.copy(pos, this.currTurtle.position);
        let q: quat = quat.create();
        quat.copy(q, this.currTurtle.quaternion);
        let s: vec3 = vec3.create();
        vec3.copy(s, this.currTurtle.scale);
        let f: vec3 = vec3.create();
        vec3.copy(f, this.currTurtle.forward);
        let u: vec3 = vec3.create();
        vec3.copy(u, this.currTurtle.up);
        let r: vec3 = vec3.create();
        vec3.copy(r, this.currTurtle.right);

        let newT : Turtle = new Turtle(pos, q, this.angle, s, 
                        this.currTurtle.recursionDepth, f, u, r);
        this.turtleStack.push(newT);
    }

    popTurtle() {
        let newT : Turtle = this.turtleStack.pop();
        if (newT) {
            this.currTurtle.position = newT.position;
            this.currTurtle.quaternion = newT.quaternion;
            this.currTurtle.scale = newT.scale;
            this.currTurtle.recursionDepth++;
            this.currTurtle.angle = newT.angle;
            this.currTurtle.forward = newT.forward;
            this.currTurtle.up = newT.up;
            this.currTurtle.right = newT.right;
            // console.log(this.currTurtle.getTransformation());
        }
    }

    draw(axiom: string) {
        // let scale : number = 1;
        // let lenscale: number = 1;
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

                if (c == 'L' || c == 'P') {
                    mat = this.currTurtle.getLeafTransformation(this.wilt);
                    this.leafData.push(mat);
                }
                else if (c == 'F') {
                    if (this.currTurtle.scale[0] > 0.02) {
                        this.currTurtle.scale[0] *= 0.97;
                        this.currTurtle.scale[2] *= 0.97;
                    }
                    if (this.currTurtle.forward[1] < 0 && !this.wilt && this.currTurtle.recursionDepth < 4) {
                        this.currTurtle.pointUp();
                    }
                    if (this.wilt) {
                        // this.currTurtle.pointDownwards();
                        // console.log(this.currTurtle.orientation[0] + ", " + this.currTurtle.orientation[1] + ", " + this.currTurtle.orientation[2]);
                    }

                    mat = this.currTurtle.getTransformation();
                    this.branchData.push(mat);
                }
            }

        }
    }

}