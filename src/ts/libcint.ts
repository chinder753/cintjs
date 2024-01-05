export { Libcint }

import { AtomGroup, JsonBasis, TemplateBasis } from "./extype";


const enum ENV_GLOBAL_PARAMETERS {
    // global parameters in env
    // Overall cutoff for integral prescreening, value needs to be ~ln(threshold)
    PTR_EXPCUTOFF =   0,
    // R_C of (r-R_C) in dipole, GIAO operators
    PTR_COMMON_ORIG = 1,
    // R_O in 1/|r-R_O|
    PTR_RINV_ORIG =   4,
    // ZETA parameter for Gaussian charge distribution (Gaussian nuclear model)
    PTR_RINV_ZETA =   7,
    // omega parameter in range-separated coulomb operator
    // LR interaction: erf(omega*r12)/r12 if omega > 0
    // SR interaction: erfc(omega*r12)/r12 if omega < 0
    PTR_RANGE_OMEGA = 8,
    // Yukawa potential and Slater-type geminal e^{-zeta r}
    PTR_F12_ZETA =    9,
    // Gaussian type geminal e^{-zeta r^2}
    PTR_GTG_ZETA =    10,
    NGRIDS =          11,
    PTR_GRIDS =       12,
    PTR_ENV_START =   20
}

const enum ATM_SOLT {
    CHARGE_OF,
    PTR_COORD,
    NUC_MOD_OF,
    PTR_ZETA,
    PTR_FRAC_CHARGE,
    RESERVE_ATMSLOT,
    ATM_SLOTS
}

const enum BAS_SOLT {
    ATOM_OF,
    ANG_OF,
    NPRIM_OF,
    NCTR_OF,
    KAPPA_OF,
    PTR_EXP,
    PTR_COEFF,
    RESERVE_BASLOT,
    BAS_SLOTS
}

const enum ENV_OFFSET {
    ATM = 4
}

class Libcint {
    private atm: Int32Array;
    private basis_index: number[];

    private bas_template: TemplateBasis[][];

    public env: Float64Array;

    constructor(atm: Int32Array, env: Float64Array, basis_index: number[], bas_template: TemplateBasis[][]) {
        this.atm = atm;
        this.env = env;
        this.basis_index = basis_index;
        this.bas_template = bas_template;
    }


    public static fromGroup(groups: AtomGroup[], basis: JsonBasis[][]) {
        // natm
        let natm: number = 0;
        groups.forEach((atom_group: AtomGroup) => {
            natm += atom_group.coordinates.length;
        });
        let atm: Int32Array = new Int32Array(natm * ATM_SOLT.ATM_SLOTS);

        // atm
        let bas_index: number = 20;
        let atm_index: number = 0;
        groups.forEach((atom_group: AtomGroup) => {
            atom_group.coordinates.forEach(() => {
                atm[atm_index * ATM_SOLT.ATM_SLOTS] = atom_group.CHARGE_OF;
                atm[atm_index * ATM_SOLT.ATM_SLOTS + ATM_SOLT.PTR_COORD] = bas_index;
                atm[atm_index * ATM_SOLT.ATM_SLOTS + ATM_SOLT.NUC_MOD_OF] = atom_group.NUC_MOD_OF;
                atm[atm_index * ATM_SOLT.ATM_SLOTS + ATM_SOLT.PTR_ZETA] = bas_index + 3;
                atm_index++;
                bas_index += ENV_OFFSET.ATM;
            });
        });


        // length of basis parameter in nev
        let nbaspar: number = 0;
        basis.forEach((ele_basis: JsonBasis[]) => {
            ele_basis.forEach((json_basis: JsonBasis) => {
                nbaspar += json_basis.exponents.length * (json_basis.coefficients.length + 1);
            });
        });


        // env
        let env: Float64Array = new Float64Array(20 + natm * ENV_OFFSET.ATM + nbaspar);
        let bas_template: TemplateBasis[][] = [];
        let basis_index: number[] = [];

        // let bas_index: number = 20 + natm * ENV_OFFSET.ATM;
        atm_index = 0;
        groups.forEach((atom_group: AtomGroup) => {
            // atom coordinates
            atom_group.coordinates.forEach((coor) => {
                env.set(coor, 20 + atm_index * ENV_OFFSET.ATM);
                // 20 + atm_index * ENV_OFFSET.ATM + 3
                env[23 + atm_index * ENV_OFFSET.ATM] = atom_group.zeta;
                atm_index++;
                basis_index.push(atom_group.basis_index);
            });
            // basis parameter
            let temp_bas_template: TemplateBasis[] = [];
            basis[atom_group.basis_index].forEach((json_basis) => {
                // basis template
                temp_bas_template.push({
                    NPRIM_OF: json_basis.exponents.length, NCTR_OF: json_basis.coefficients.length
                    , KAPPA_OF: json_basis.KAPPA_OF
                    , PTR_EXP: bas_index, PTR_COEFF: bas_index + json_basis.exponents.length
                    , angular_momentum: json_basis.angular_momentum
                });

                // basis exponents in env
                env.set(json_basis.exponents, bas_index);
                bas_index += json_basis.exponents.length;

                // basis coefficients in env
                json_basis.coefficients.forEach((exponents: number[]) => {
                    env.set(exponents, bas_index);
                    bas_index += exponents.length;
                });
            });
            bas_template.push(temp_bas_template);
        });

        return new Libcint(atm, env, basis_index, bas_template);
    }


    // ENV_GLOBAL_PARAMETERS
    get PTR_EXPCUTOFF(): number{
        return this.env[ENV_GLOBAL_PARAMETERS.PTR_ENV_START];
    }
    set PTR_EXPCUTOFF(PTR_EXPCUTOFF: number){
        this.env[ENV_GLOBAL_PARAMETERS.PTR_ENV_START] = PTR_EXPCUTOFF;
    }

    get PTR_COMMON_ORIG(): Float64Array{
        return this.env.slice(ENV_GLOBAL_PARAMETERS.PTR_COMMON_ORIG, ENV_GLOBAL_PARAMETERS.PTR_RINV_ORIG);
    }
    set PTR_COMMON_ORIG(PTR_COMMON_ORIG: number[]){
        if(PTR_COMMON_ORIG.length != ENV_GLOBAL_PARAMETERS.PTR_RINV_ORIG - ENV_GLOBAL_PARAMETERS.PTR_COMMON_ORIG)
        this.env.set(PTR_COMMON_ORIG, ENV_GLOBAL_PARAMETERS.PTR_COMMON_ORIG);
    }

    get PTR_RINV_ORIG(): Float64Array{
        return this.env.slice(ENV_GLOBAL_PARAMETERS.PTR_RINV_ORIG, ENV_GLOBAL_PARAMETERS.PTR_RINV_ZETA);
    }
    set PTR_RINV_ORIG(PTR_RINV_ORIG: number[]){
        this.env.set(PTR_RINV_ORIG, ENV_GLOBAL_PARAMETERS.PTR_RINV_ORIG);
    }

    get PTR_RINV_ZETA(): number{
        return this.env[ENV_GLOBAL_PARAMETERS.PTR_RINV_ZETA];
    }
    set PTR_RINV_ZETA(PTR_RINV_ZETA: number){
        this.env[ENV_GLOBAL_PARAMETERS.PTR_RINV_ZETA] = PTR_RINV_ZETA;
    }

    get PTR_RANGE_OMEGA(): number{
        return this.env[ENV_GLOBAL_PARAMETERS.PTR_RANGE_OMEGA];
    }
    set PTR_RANGE_OMEGA(PTR_RANGE_OMEGA: number){
        this.env[ENV_GLOBAL_PARAMETERS.PTR_RANGE_OMEGA] = PTR_RANGE_OMEGA;
    }

    get PTR_F12_ZETA(): number{
        return this.env[ENV_GLOBAL_PARAMETERS.PTR_F12_ZETA];
    }
    set PTR_F12_ZETA(PTR_F12_ZETA: number){
        this.env[ENV_GLOBAL_PARAMETERS.PTR_F12_ZETA] = PTR_F12_ZETA;
    }

    get PTR_GTG_ZETA(){
        return this.env[ENV_GLOBAL_PARAMETERS.PTR_GTG_ZETA];
    }
    set PTR_GTG_ZETA(PTR_GTG_ZETA: number){
        this.env[ENV_GLOBAL_PARAMETERS.PTR_GTG_ZETA] = PTR_GTG_ZETA;
    }

    get NGRIDS(): number{
        return this.env[ENV_GLOBAL_PARAMETERS.NGRIDS];
    }
    set NGRIDS(NGRIDS: number){
        this.env[ENV_GLOBAL_PARAMETERS.NGRIDS] = NGRIDS;
    }

    get PTR_GRIDS(): Float64Array{
        return this.env.slice(ENV_GLOBAL_PARAMETERS.PTR_GRIDS, ENV_GLOBAL_PARAMETERS.PTR_ENV_START);
    }
    set PTR_GRIDS(PTR_GRIDS: number[]){
        if(PTR_GRIDS.length != ENV_GLOBAL_PARAMETERS.PTR_GRIDS - ENV_GLOBAL_PARAMETERS.PTR_ENV_START)
        this.env.set(PTR_GRIDS, ENV_GLOBAL_PARAMETERS.PTR_GRIDS);
    }

}
