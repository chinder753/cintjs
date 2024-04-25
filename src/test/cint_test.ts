import { readXYZ2Group } from "../ts/io.js";
import { BSE } from "../ts/bse.js";
import { CintData } from "../libcint/cint_data.js";

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

// (rank_a, rank_k) @ (rank_k, rank_b) = (rank_a, rank_b)
function gemm(A: Float64Array, B: Float64Array, rank_a: number, rank_b: number, rank_k: number): Float64Array{
    let C = new Float64Array(rank_a * rank_b);
    for(let i = 0; i < rank_a; i++){
        for(let j = 0; j < rank_b; j++){
            for(let k = 0; k < rank_k; k++){
                C[i * rank_a + j] += A[i * rank_a + k] * B[k * rank_k + j];
            }
        }
    }
    return C;
}

function gemv(A: Float64Array, B: Float64Array, rank_a: number, rank_b: number): Float64Array{
    let C = new Float64Array(rank_b);
    for(let i = 0; i < rank_a; i++){
        for(let j = 0; j < rank_b; j++){
            C[i] += A[i * rank_a + j] * B[j];
        }
    }
    return C;
}

function transport(A: Float64Array, rank_a: number, rank_k: number): Float64Array{
    let C = new Float64Array(A.length);
    for(let i = 0; i < rank_a; i++){
        for(let j = 0; j < rank_k; j++){
            C[j * rank_k + i] = A[i * rank_a + j];
        }
    }
    return C;
}


cint.then(Cint => {
    //
    let atom_group = readXYZ2Group("3\n\nH 0.0 0.5 0.0\nH 0.0 -0.5 0.0\nO 0.0 0.0 0.0\n")
        , bse = new BSE(fs.readFileSync("lib/basis_set_exchange/basis_set_exchange/data/sto/STO-3G.1.json").toString());
    atom_group[1].basis_index = 1;
    //
    let cint_data = CintData.fromGroup(atom_group, [bse.getJsonBasis(atom_group[0].CHARGE_OF.toString()), bse.getJsonBasis(atom_group[1].CHARGE_OF.toString())])
        , cint = Cint.fromCintData(cint_data);
    cint.normalize();
    // console.log(cint, "\n");
    //
    // console.log("select_bas");
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
    let all_bas = cint.allBas();
    // console.log("\nfull_ovlp\n", all_bas.int2c_full("_int1e_ovlp_cart"));
    // console.log("\npack_ovlp\n", all_bas.int2c_pack("_int1e_ovlp_cart"));
    let {dim: rank, data: K, storage: _storage} = all_bas.int2c_full("_int1e_kin_cart")
        , V = all_bas.int2c_full("_int1e_nuc_cart").data
        , H_core = K.map((t, i) => t + V[i]);
    // console.log("\nH_core\n", H_core);
    // S^{\frac{1}{2}}
    let S_eigh = eigh_full(all_bas.int2c_full("_int1e_ovlp_cart").data, rank, false, 1e-20)
        , S_half_inv = transport(S_eigh.vector, rank, rank)
        , S_val = S_eigh.value.map(v => Math.sqrt(v));
    for(let i = 0; i < rank; i++){
        for(let j = 0; j < rank; j++){
            S_half_inv[i * rank + j] *= S_val[j];
        }
    }
    S_half_inv = gemm(S_half_inv, S_eigh.vector, rank, rank, rank);

    let F_prime = gemm(gemm(S_half_inv, H_core, rank, rank, rank), S_half_inv, rank, rank, rank)
        , init_1e = eigh_full(F_prime, rank);

    console.log(init_1e.value);
    console.log(gemm(S_half_inv, transport(init_1e.vector, rank, rank), rank, rank, rank));

    all_bas.delete();
    //
    cint.delete();
});

