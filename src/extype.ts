export { JsonBasis, AtomGroup, TemplateBasis };

// type FixedLengthArray<
//     T,
//     N extends number,
//     R extends Array<T> = []
// > = R['length'] extends N ? R : FixedLengthArray<T, N, [T, ...R]>

type TemplateBasis = {
    NPRIM_OF: number, NCTR_OF: number, KAPPA_OF: number, PTR_EXP: number, PTR_COEFF: number, angular_momentum: number[]
}

type JsonBasis = {
    KAPPA_OF: number, angular_momentum: number[], exponents: number[], coefficients: number[][]
}

type AtomGroup = {
    basis_index: number,
    CHARGE_OF: number,
    NUC_MOD_OF: number,
    zeta: number,
    frac_charge: number[],
    coordinates: number[][]
}

