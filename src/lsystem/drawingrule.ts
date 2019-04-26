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
                                     vec3.fromValues(0,1,0),
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
        // T - step forward without drawing branch
        this.drawingMap.set("T", this.currTurtle.stepForward.bind(this.currTurtle));
        // M - step forward a small amount without drawing branch
        this.drawingMap.set("M", this.currTurtle.stepForwardSmall.bind(this.currTurtle));
        // J - jump forward a large amount
        this.drawingMap.set("J", this.currTurtle.jumpForward.bind(this.currTurtle));

        // L, P, S - draw leaf
        // this.drawingMap.set("X", this.currTurtle.drawLeafRotate.bind(this.currTurtle));
        this.drawingMap.set("L", this.currTurtle.drawLeaf.bind(this.currTurtle));
        this.drawingMap.set("P", this.currTurtle.drawPalmLeaf.bind(this.currTurtle));
        this.drawingMap.set("S", this.currTurtle.drawShrubLeaf.bind(this.currTurtle));

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
        let ori: vec3 = vec3.create();
        vec3.copy(ori, this.currTurtle.orientation);
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

        let newT : Turtle = new Turtle(pos, ori, q, this.angle, s, 
                        this.currTurtle.recursionDepth, f, u, r);
        this.turtleStack.push(newT);
    }

    popTurtle() {
        let newT : Turtle = this.turtleStack.pop();
        if (newT) {
            this.currTurtle.position = newT.position;
            this.currTurtle.orientation = newT.orientation;
            this.currTurtle.quaternion = newT.quaternion;
            this.currTurtle.scale = newT.scale;
            this.currTurtle.recursionDepth++;
            this.currTurtle.angle = newT.angle;
            // this.currTurtle.forward = newT.forward;
            // this.currTurtle.up = newT.up;
            // this.currTurtle.right = newT.right;
            // console.log(this.currTurtle.getTransformation());
        }
    }

    draw(axiom: string, iterations: number) {
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
                // console.log("depth: " + this.currTurtle.recursionDepth);

                let mat: mat4;
                mat = mat4.create();

                if (c == 'L') {
                    mat = this.currTurtle.getLeafTransformation(this.wilt, false, false);
                    this.leafData.push(mat);
                }
                else if (c == 'P') {
                    mat = this.currTurtle.getLeafTransformation(this.wilt, true, false);
                    this.leafData.push(mat);
                }
                else if (c == 'S') {
                    if (this.currTurtle.scale[0] > 0.02) {
                        this.currTurtle.scale[0] *= 0.97;
                        this.currTurtle.scale[1] *= 0.97;
                        this.currTurtle.scale[2] *= 0.97;
                    }
                    mat = this.currTurtle.getLeafTransformation(this.wilt, true, true);
                    this.leafData.push(mat);
                }
                else if (c == 'F') {
                    if (this.currTurtle.scale[0] > 0.01) {
                        this.currTurtle.scale[0] *= 0.97;
                        this.currTurtle.scale[1] *= 0.97;
                        this.currTurtle.scale[2] *= 0.97;
                    }
                    if (this.currTurtle.orientation[1] < 0 && !this.wilt) {
                        this.currTurtle.pointUp();
                    }
                    if (this.wilt) {
                        // if (this.currTurtle.scale[0] > 0.01) {
                        //     this.currTurtle.scale[0] *= 0.9;
                        //     this.currTurtle.scale[1] *= 0.9;
                        //     this.currTurtle.scale[2] *= 0.9;
                        // }
                    }

                    mat = this.currTurtle.getTransformation();
                    this.branchData.push(mat);
                }
            }

        }
    }

}