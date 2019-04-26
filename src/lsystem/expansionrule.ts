export default class ExpansionRule {
    grammar: Map<string, Array<[string, number]>> = new Map<string, Array<[string, number]>>();
    wilt: boolean;
    plantType: number;

    constructor(w: boolean, pt: number) {
        this.wilt = w;
        this.plantType = pt;
        this.createExpansionRules();
    }

    createExpansionRules() {
        // this.grammar.set("F", [["F", 1.0]]);
        // this.grammar.set("L", [["F", 1.0]]);
        // this.grammar.set("X", [["FL[_-X][FL[++FX][~~FLX][*FX]][--FLX][*FX]", 1.0]]);
        // this.grammar.set("X", [["F[+FX][F[++FX][FX][-FX]][--FX]", 1.0]]);
        
        if (this.plantType == 0) { // tree
            if (!this.wilt) {
                // this.grammar.set("F", [["FF", 1.0]]);
                this.grammar.set("X", [["FFF[_FFFF=FFFFFX]=[=FFFFF__FFFFX]~[*FFFFF~~FFFFX]", 1.0]]);
                // "FFFL[+FFFL+FFFL-FLF=FLFX[X[XL]]FFFFL_FFXL][-FFLF~F*FFLX[X[XL]]]L"
                // "LX[=+L][=-L][-_-L]S[=+L][++_L][-_L]"
                // "[=FLX][_FLX]F"
                // "F[=FXL][F[==FXL][FXL][_FXL]][__FXL]"
                // "F[=FFXL][FF[==FFXL][FFXL][_FFXL]][__FFXL]"
                // "FFFL[~FFFL~FFFL*FLF=FLFX[X[XL]]FFFFL_FFXL][*FFLF~F*FFLX[X[XL]]]L"
            }
            else {
                this.grammar.set("X", [["FFL[+FF-FF+FF=FFX[X[X]]FFF=FXL][-FF~F~FFLX[X[X]]]L", 1.0]]);
            }
        }
        else if (this.plantType == 1) { // palm tree
            if (!this.wilt) {
                this.grammar.set("F", [["FF", 1.0]]);
                this.grammar.set("X", [["PX[=+P][=-P][-_-P]S[=+P][++_P][-_P]", 1.0]]);
                // "PX[*P][~P][~~P]S[*P][**P][~P]"
                // "PX[=P][_P][__P]S[=P][==P][_P]"
                // "PX[+P][-P][--P]S[+P][++P][-P]"
            }
            else {
                // this.grammar.set("F", [["F", 1.0]]);
                // this.grammar.set("X", [["L[+FLX][=FLX][~LX][-FLX][_FLX][*LX]", 1.0]]);
            }
        }
        else if (this.plantType == 2) { // shrub
            if (!this.wilt) {
                this.grammar.set("X", [["LLL[+FLLX][=FLLLX][~FLLX][-FLLLX][_FLLX][*FLLLX]", 1.0]]);
            }
            else {
                this.grammar.set("X", [["L[+FLX][=FLX][~LX][-FLX][_FLX][*LX]", 1.0]]);
            }
        }
        
    }

    map(str: string, xi: number) : string {
        let ret: string = "";
        if (this.grammar.has(str)) {
            let sumprob: number = 0;
            let probs = this.grammar.get(str);

            for (let i: number = 0; i < probs.length; i++) {
                sumprob += probs[i][1];
                if (xi <= sumprob) {
                    ret += probs[i][0];
                    break;
                }
            }
            return ret;
        }
        else return "";
    }

    expand(axiom: string, iterations: number) : string {
        let ret: string = axiom;
        for (let i: number = 0; i < iterations; i++) {
            let exp: string = "";
            for (let j: number = 0; j < ret.length; j++) {
                let c: string = ret.charAt(j);
                if (!this.grammar.has(c)) {
                    exp += c;
                    continue;
                }
                exp += this.map(c, Math.random());
            }
            ret = exp;
        }
        return ret;
    }
}
