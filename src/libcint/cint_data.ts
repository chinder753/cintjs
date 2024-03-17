export { CintData };

import { AtomGroup, JsonBasis } from "../ts/extype";


export const enum ENV_GLOBAL_PARAMETERS{
    // global parameters in env
    // Overall cutoff for integral prescreening, value needs to be ~ln(threshold)
    PTR_EXPCUTOFF = 0,
    // R_C of (r-R_C) in dipole, GIAO operators
    PTR_COMMON_ORIG = 1,
    // R_O in 1/|r-R_O|
    PTR_RINV_ORIG = 4,
    // ZETA parameter for Gaussian charge distribution (Gaussian nuclear model)
    PTR_RINV_ZETA = 7,
    // omega parameter in range-separated coulomb operator
    // LR interaction: erf(omega*r12)/r12 if omega > 0
    // SR interaction: erfc(omega*r12)/r12 if omega < 0
    PTR_RANGE_OMEGA = 8,
    // Yukawa potential and Slater-type geminal e^{-zeta r}
    PTR_F12_ZETA = 9,
    // Gaussian type geminal e^{-zeta r^2}
    PTR_GTG_ZETA = 10,
    NGRIDS = 11,
    PTR_GRIDS = 12,
    PTR_ENV_START = 20
}

export const enum ATM_SOLT{
    CHARGE_OF,
    PTR_COORD,
    NUC_MOD_OF,
    PTR_ZETA,
    PTR_FRAC_CHARGE,
    RESERVE_ATMSLOT,
    ATM_SLOTS
}

export const enum BAS_SOLT{
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

export const enum ENV_OFFSET{
    ATM = 4
}

class CintData{
    public static fromGroup(groups: AtomGroup[], basis: JsonBasis[][]){
        let natm = 0, nbas = 0, nbaspar = 0
            , atm_offset = 0, env_offset = ENV_GLOBAL_PARAMETERS.PTR_ENV_START
            , basis_index = new Array<number>()
            , bas_template: Int32Array[] = [];
        // natm
        groups.forEach((atom_group: AtomGroup) => {
            natm += atom_group.coordinates.length;
        });
        // basis parameter length in env
        basis.forEach((ele_basis: JsonBasis[]) => {
            ele_basis.forEach((json_basis: JsonBasis) => {
                nbaspar += json_basis.exponents.length * (json_basis.coefficients.length + 1);
            });
        });
        //
        let env: Float64Array = new Float64Array(ENV_GLOBAL_PARAMETERS.PTR_ENV_START + natm * ENV_OFFSET.ATM + nbaspar)
            , atm: Int32Array = new Int32Array(natm * ATM_SOLT.ATM_SLOTS);
        // atom
        groups.forEach((atom_group: AtomGroup) => {
            atom_group.coordinates.forEach((coor) => {
                // atm
                atm[atm_offset + ATM_SOLT.CHARGE_OF] = atom_group.CHARGE_OF;
                atm[atm_offset + ATM_SOLT.PTR_COORD] = env_offset;
                atm[atm_offset + ATM_SOLT.NUC_MOD_OF] = atom_group.NUC_MOD_OF;
                atm[atm_offset + ATM_SOLT.PTR_ZETA] = env_offset + 3;
                // atom coordinates
                env.set(coor, env_offset);  // coordinates
                env[env_offset + 3] = atom_group.zeta;  // zeta
                //
                basis_index.push(atom_group.basis_index);
                //
                atm_offset += ATM_SOLT.ATM_SLOTS;
                env_offset += ENV_OFFSET.ATM;
            });
        });
        // basis parameter
        basis.forEach((ele_basis: JsonBasis[]) => {
            // basis parameter
            let temp_bas_template: number[] = [];
            ele_basis.forEach((json_basis) => {
                let ptr_exp = env_offset
                    , exp_len = json_basis.exponents.length
                    , coeff_len = json_basis.coefficients.length;
                // exponents
                env.set(json_basis.exponents, ptr_exp);
                env_offset += exp_len;
                //
                json_basis.angular_momentum.forEach((ang, i) => {
                    // basis template
                    temp_bas_template.push(
                        0                       // ATOM_OF
                        , ang                   // ANG_OF
                        , exp_len               // NPRIM_OF
                        , 1                     // NCTR_OF
                        , json_basis.KAPPA_OF   // KAPPA_OF
                        , ptr_exp               // PTR_EXP
                        , env_offset            // PTR_COEFF
                        , 0                     // RESERVE_BASLOT
                    );
                    // coefficients
                    env.set(json_basis.coefficients[i], env_offset);
                    env_offset += exp_len;
                });
            });
            bas_template.push(new Int32Array(temp_bas_template));
        });

        return new CintData(atm, env, basis_index, bas_template);
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

    constructor(atm: Int32Array, env: Float64Array, basis_index: number[], bas_template: Int32Array[]){
        this.atm = atm;
        this.env = env;
        this.basis_index = basis_index;
        this.bas_template = bas_template;
    }

    public basis_index: number[];
    public bas_template: Int32Array[];  // same as "coefficients" in BSE
    public atm: Int32Array;
    public env: Float64Array;

    public atm_coor(atm_i: number){
        let begin = ENV_GLOBAL_PARAMETERS.PTR_ENV_START + atm_i * ENV_OFFSET.ATM
            , end = begin + ENV_OFFSET.ATM;
        return this.env.subarray(begin, end);
    }

    public get_bas(bas_i: number){
        return this.bas_template[bas_i];
    }

    public get_atm_bas(atm_i: number): Int32Array{
        return this.bas_template[this.basis_index[atm_i]];
    }

}
