import { eigh_full, gemm, transpose } from "./matrix.js";

export function get_int2e(i: number, j: number, k: number, l: number, int2e: Float64Array, rank: number){
    return int2e[rank * (rank * (rank * i + j) + k) + l]
}

export function calc_S_half_inv(S: Float64Array, rank: number){
    let S_eigh = eigh_full(S, rank, true, 1e-20)
        , S_half_inv = transpose(S_eigh.vector, rank, rank)
        , S_val = S_eigh.value.map(v => 1/Math.sqrt(v));
    for(let i = 0; i < rank; i++){
        for(let j = 0; j < rank; j++){
            S_half_inv[i * rank + j] *= S_val[j];
        }
    }
    return gemm(S_half_inv, S_eigh.vector, rank, rank, rank);
}

export function get_init_by_1e(H_core: Float64Array, S_half_inv: Float64Array, rank: number){
    let F_prime = gemm(gemm(S_half_inv, H_core, rank, rank, rank), S_half_inv, rank, rank, rank)
        , init_by_1e = eigh_full(F_prime, rank, true, 1e-20)
        , C = transpose(gemm(S_half_inv, transpose(init_by_1e.vector, rank, rank), rank, rank, rank), rank, rank);
    return {e_mo: init_by_1e.value, c_mo: C};
}

export function get_er_matrix(int2e: Float64Array, density_matrix: Float64Array, rank: number){
    let G = new Float64Array(rank*rank);
    for(let i=0; i<rank; i++){
        for(let j=0; j <= i; j++){
            for(let mu=0; mu<rank; mu++){
                for(let nu=0; nu<rank; nu++){
                    G[i*rank+j] += (2 * get_int2e(i, j, mu, nu, int2e, rank) - get_int2e(i, mu, j, nu, int2e, rank)) * density_matrix[mu * rank + nu];
                }
            }
        }
    }
    for(let i=0; i<rank; i++){
        for(let j=0; j < i; j++){
            G[j*rank+i] = G[i*rank+j];
        }
    }
    return G;
}
