import { readXYZ2Group } from "../ts/io.js";
import { BSE } from "../ts/bse.js";
import { AtomGroup } from "../ts/extype";

import cint from "../libcint/cint.js";
import { CintData } from "../libcint/cint_data.js";

import fs from "fs";
import { calc_S_half_inv, get_er_matrix, get_init_by_1e } from "./hf/hf.js";
import { eigh_full, gemm, transpose } from "./hf/matrix.js";



cint.then(Cint => {
    //
    let nele = 0
        , atom_group: AtomGroup[] = readXYZ2Group("3\n\nH 0.0 0.5 0.0\nH 0.0 -0.5 0.0\nO 0.0 0.0 0.0\n")
        , bse = new BSE(fs.readFileSync("lib/basis_set_exchange/basis_set_exchange/data/sto/STO-3G.1.json").toString());
    atom_group[1].basis_index = 1;
    atom_group.forEach(atom => nele += atom.CHARGE_OF * atom.coordinates.length);
    let nocc = nele / 2;
    //
    let cint_data: CintData = CintData.fromGroup(atom_group, [bse.getJsonBasis(atom_group[0].CHARGE_OF.toString()), bse.getJsonBasis(atom_group[1].CHARGE_OF.toString())])
        , cint = Cint.fromCintData(cint_data).normalize();
    //
    let select_bas = cint.selectBas([{atm_index: 0, shell_index: 0}, {atm_index: 1, shell_index: 0}, {
        atm_index: 2,
        shell_index: 1
    }]);
    for(let i = 0; i < select_bas.nbas; i++){
        for(let j = 0; j < i; j++){
            // console.log(select_bas.intor([i, j], "_int1e_ovlp_cart"));
        }
    }
    select_bas.delete();
    //
    let all_bas = cint.allBas()
        // integral 1e
        , {dim: rank, data: K, storage: _storage} = all_bas.int2c_full("_int1e_kin_cart")
        , V: Float64Array = all_bas.int2c_full("_int1e_nuc_cart").data
        , H_core: Float64Array = K.map((t, i) => t + V[i])
        // integral 2e
        , int2e: Float64Array = all_bas.int4c_full("_int2e_cart").data
        // S^{\frac{1}{2}}
        , S_half_inv: Float64Array = calc_S_half_inv(all_bas.int2c_full("_int1e_ovlp_cart").data, rank)
        , {e_mo, c_mo} = get_init_by_1e(H_core, S_half_inv, rank)
        , E = e_mo.reduce((pv, cv) => pv + 2*cv)
        , P = gemm(transpose(c_mo, nocc, rank), c_mo, rank, rank, nocc)
        , G = get_er_matrix(int2e, P, rank)
        , F = H_core.map((h, i) => h + G[i])
        , F_prime = gemm(gemm(S_half_inv, F, rank, rank, rank), S_half_inv, rank, rank, rank)
        , solve = eigh_full(F_prime, rank, true, 1e-20)
        , C = gemm(S_half_inv, transpose(solve.vector, rank, rank), rank, rank, rank);
    console.log(solve)

    all_bas.delete();
    //
    cint.delete();
});

