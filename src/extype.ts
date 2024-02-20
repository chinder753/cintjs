export {JsonBasis, AtomGroup};

type TemplateShell = Int32Array[];

interface JsonBasis {
    KAPPA_OF: number,
    angular_momentum: number[],
    exponents: number[],
    coefficients: number[][]
}

interface AtomGroup {
    basis_index: number,
    CHARGE_OF: number,
    NUC_MOD_OF: number,
    zeta: number,
    frac_charge: number[],
    coordinates: number[][]
}

