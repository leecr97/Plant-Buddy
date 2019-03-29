export default class ExpansionRule {
    // precondition: string;
    // expAction: any;
    // probability: number;
    // new_symbol: string;
    grammar: Map<string, Array<[string, number]>> = new Map<string, Array<[string, number]>>();

    constructor() {
        this.createExpansionRules();
    }

    createExpansionRules() {
        // this.grammar.set("F", [["F", 0.7], 
        //                        ["FF", 0.3]]);
        // this.grammar.set("X", [["FL[+FX][FL[++FX][~~FLX][-FX]][--FLX][~FX]", 0.5], 
        //                        ["FL[_FX][FL[__FX][**FLX][=FX]][==FLX][*FX]", 0.5]]);

        this.grammar.set("F", [["", 1.0]]);
        // this.grammar.set("L", [["F", 1.0]]);
        this.grammar.set("X", [["FL[_FFX][FL[++FFX][~~FFLX][=FFX]][--FFLX][*FFX]", 1.0]]);

        // this.grammar.set("F", [["FF-[-X+F]+[+X-F]", 1.0]]);
        // this.grammar.set("X", [["FF+[+X]+[-F]", 1.0]]);

        // this.grammar.set("F", [["F", 1.0]]);
        // this.grammar.set("X", [["F[+FX][F[++FX][~~FX][-FX]][--FX][~FX]", 1.0]]);
    }

    map(str: string, xi: number) : string {
        if (this.grammar.has(str)) {
            let sumprob: number = 0;
            let probs = this.grammar.get(str);

            for (let i: number = 0; i < probs.length; i++) {
                sumprob += probs[i][1];
                if (xi <= sumprob) {
                    return probs[i][0];
                }
            }
        }
        else return "";
    }

    expand(axiom: string, iterations: number) : string {
        let ret: string = axiom;
        for (let i: number = 0; i < iterations; i++) {
            let exp: string = "";
            for (let j: number = 0; j < ret.length; j++) {
                let c: string = ret.charAt(j);
                exp += this.map(c, Math.random());
            }
            ret = exp;
        }
        return ret;
    }

}
