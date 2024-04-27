
// The normalized (unit "length") eigenvectors, such that the
// row eigenvectors[i, :] is the eigenvector corresponding to the eigenvalue eigenvalues[i].
export function eigh_full(a: Float64Array, rank: number, sort = true, tolerance: number = 1e-10): {
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
export function gemm(A: Float64Array, B: Float64Array, rank_a: number, rank_b: number, rank_k: number): Float64Array{
    let C = new Float64Array(rank_a * rank_b);
    for(let i = 0; i < rank_a; i++){
        for(let j = 0; j < rank_b; j++){
            for(let k = 0; k < rank_k; k++){
                C[rank_b * i + j] += A[rank_k * i + k] * B[rank_b * k + j];
            }
        }
    }
    return C;
}



export function gemv(A: Float64Array, B: Float64Array, rank_a: number, rank_b: number): Float64Array{
    let C = new Float64Array(rank_b);
    for(let i = 0; i < rank_a; i++){
        for(let j = 0; j < rank_b; j++){
            C[i] += A[i * rank_a + j] * B[j];
        }
    }
    return C;
}



export function transpose(A: Float64Array, rank_a: number, rank_k: number): Float64Array{
    let C = new Float64Array(rank_a*rank_k);
    for(let i = 0; i < rank_a; i++){
        for(let j = 0; j < rank_k; j++){
            C[rank_a * j + i] = A[rank_k * i + j];
        }
    }
    return C;
}