import {mat4} from 'gl-matrix';
import DrawingRule from './DrawingRule';
import ExpansionRule from './ExpansionRule';

export default class LSystem {
    axiom: string;
    expansionRule: ExpansionRule;
    drawingRule: DrawingRule;
    iterations : number;
    branchData: mat4[];
    leafData: mat4[];
    lenscale: number;
    wilt: boolean;
    plantType: number;
    expandedAxiom: string;

    constructor(axiom: string, iterations: number, s: number, w: boolean, pt: number) {
        this.axiom = axiom;
        // console.log("axiom: " + axiom);
        this.iterations = iterations;
        this.wilt = w;
        this.plantType = pt;
        this.expansionRule = new ExpansionRule(this.wilt, this.plantType);
        this.lenscale = s;
        this.drawingRule = new DrawingRule(this.lenscale, this.wilt);
        this.branchData = [];
        this.leafData = [];
        this.expandedAxiom = "";
    }

    parseLSystem() {
        // console.log("ax: " + this.axiom);
        let expandedAxiom: string = this.expansionRule.expand(this.axiom, this.iterations);
        this.expandedAxiom = expandedAxiom;
        // console.log("expanded: " + expandedAxiom);
        this.drawingRule.draw(expandedAxiom, this.iterations);
        this.branchData = this.drawingRule.branchData;
        this.leafData = this.drawingRule.leafData;
    }
}