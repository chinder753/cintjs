import { readXYZ2Group } from "../io.js";
import { BSE } from "../bse.js";
import { CintData } from "../cint_data.js";

import cint from "../libcint/cint.js";

import fs from "fs";


// The normalized (unit "length") eigenvectors, such that the
// row eigenvectors[i, :] is the eigenvector corresponding to the eigenvalue eigenvalues[i].
function eigh_full(a: Float64Array, rank: number, sort = true, tolerance: number = 1e-10): {
    value: Float64Array,
    vector: Float64Array
}{
    let a_off = 1
        , matrix = a.map(x => x)
        , eigh_vector = new Float64Array(rank * rank).map((x, i) => (Math.floor(i / rank) === i % rank) ? 1 : 0);
    while(a_off > tolerance){
        a_off = 0;
        for(let i = 1; i < rank; i++){
            for(let j = 0; j < i; j++){
                if(Math.abs(matrix[rank * i + j]) < tolerance) continue;
                let tau = (matrix[rank * i + i] - matrix[rank * j + j]) / (2 * matrix[rank * i + j])
                    , t = Math.sign(tau) / (Math.abs(tau) + Math.sqrt(1 + tau ** 2))
                    , c = 1 / Math.sqrt(1 + t ** 2), s = c * t;
                // G A
                for(let k = 0; k < rank; k++){
                    [matrix[rank * i + k], matrix[rank * j + k]] = [matrix[rank * i + k] * c + matrix[rank * j + k] * s, -matrix[rank * i + k] * s + matrix[rank * j + k] * c];
                    [eigh_vector[rank * i + k], eigh_vector[rank * j + k]] = [eigh_vector[rank * i + k] * c + eigh_vector[rank * j + k] * s, -eigh_vector[rank * i + k] * s + eigh_vector[rank * j + k] * c];
                }
                // A G^{\mathrm{T}}
                for(let k = 0; k < rank; k++){
                    [matrix[rank * k + i], matrix[rank * k + j]] = [matrix[rank * k + i] * c + matrix[rank * k + j] * s, -matrix[rank * k + i] * s + matrix[rank * k + j] * c];
                }
                a_off += matrix[rank * i + j];
            }
        }
        a_off = Math.abs(a_off);
    }

    if(sort){
        let temp_value: [number, number][] = [...Array(rank).keys()].map((a_i, i) => [i, matrix[rank * i + i]]);
        temp_value.sort((a, b) => a[1] - b[1]);

        let temp_eigh_vector = new Float64Array(rank * rank);
        temp_value.forEach(([sorted_index, v], i) => {
            matrix[rank * i + i] = v;
            for(let j = 0; j < rank; j++){
                temp_eigh_vector[rank * i + j] = eigh_vector[rank * sorted_index + j];
            }
        });
        eigh_vector = temp_eigh_vector;
    }

    let eigh_value = new Float64Array(rank).map((a_i, i) => matrix[rank * i + i]);
    return {
        value: eigh_value
        , vector: eigh_vector
    };
}


cint.then(Cint => {
    //
    let atom_group = readXYZ2Group("3\n\nH 0.0 0.5 0.0\nO 0.0 0.0 0.0\nH 0.0 -0.5 0.0\n")
        , bse = new BSE(fs.readFileSync("lib/basis_set_exchange/basis_set_exchange/data/sto/STO-3G.1.json").toString());
    atom_group[1].basis_index = 1;
    //
    let cint_data = CintData.fromGroup(atom_group, [bse.getJsonBasis(atom_group[0].CHARGE_OF.toString()), bse.getJsonBasis(atom_group[1].CHARGE_OF.toString())])
        , cint = Cint.fromCintData(cint_data);
    console.log(cint.normalize(), "\n");
    //
    console.log("select_bas");
    let select_bas = cint.selectBas([{atm_index: 0, shell_index: 0}, {atm_index: 1, shell_index: 0}, {
        atm_index: 2,
        shell_index: 1
    }]);
    for(let i = 0; i < select_bas.nbas; i++){
        for(let j = 0; j < i; j++){
            console.log(select_bas.intor([i, j], "_int1e_ovlp_cart"));
        }
    }
    select_bas.delete();
    //
    let all_bas = cint.allBas();
    console.log("\nfull_ovlp");
    console.log(all_bas.int2c_full("_int1e_ovlp_cart"));
    console.log("\npack_ovlp");
    console.log(all_bas.int2c_pack("_int1e_ovlp_cart"));
    console.log("\nH_core");
    let {dim: rank, data: H_core, storage: _storage} = all_bas.int2c_full("_int1e_kin_cart"),
        V = all_bas.int2c_full("_int1e_nuc_cart").data;
    H_core = H_core.map((t, i) => t + V[i]);
    console.log(H_core);
    all_bas.delete();
    //
    cint.delete();
});

