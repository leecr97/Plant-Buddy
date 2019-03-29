import {mat4} from 'gl-matrix';
import DrawingRule from './DrawingRule';
import ExpansionRule from './ExpansionRule';

export default class LSystem {
    axiom: string;
    expansionRule: ExpansionRule;
    drawingRule: DrawingRule;
    iterations : number
    branchData: mat4[];
    leafData: mat4[]

    constructor(axiom: string, iterations: number) {
        this.axiom = axiom;
        console.log("axiom: " + axiom);
        this.iterations = iterations;
        this.expansionRule = new ExpansionRule();
        this.drawingRule = new DrawingRule();
    }

    parseLSystem() {
        let expandedAxiom: string = this.expansionRule.expand(this.axiom, this.iterations);
        console.log("expanded: " + expandedAxiom);
        this.drawingRule.draw(expandedAxiom);
        this.branchData = this.drawingRule.branchData;
        this.leafData = this.drawingRule.leafData;
    }
}