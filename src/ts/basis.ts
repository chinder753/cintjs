import { FixedLengthArray } from "./extype.js";



export { Basis };


type GTO = {
    exponents: number[];
    coefficients: number[][];
}



class Basis {
    public kappa: number;
    public offset_pgto: number | undefined;
    public offset_cgto: number | undefined;
    public readonly nuclear_charge: number;
    public readonly angular_momentum: number[];
    public readonly gto: GTO;

    constructor(nuclear_charge: number, angular_momentum: number[], gto: GTO, kappa: number = 0) {
        this.nuclear_charge = nuclear_charge;
        this.kappa = kappa;
        this.angular_momentum = angular_momentum;
        this.gto = gto;

        this.offset_pgto = undefined;
        this.offset_cgto = undefined;
    }

    public generateBAS(atom_index: number, angular_momentum: number): Int32Array {
        if (!(<number[]>this.angular_momentum).includes(angular_momentum)) throw "";
        if (typeof this.offset_pgto == "undefined" || typeof this.offset_cgto == "undefined") throw "";
        return new Int32Array([
            atom_index, angular_momentum
            , (<number[]>this.gto.exponents).length, this.gto.coefficients.length
            , this.kappa
            , this.offset_pgto, this.offset_cgto
            , 0, 0
        ]);
    }

}
