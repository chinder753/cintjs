
function identity(a_rank: number): Float64Array{
    return new Float64Array(a_rank*a_rank).map((x, i) => (Math.floor(i/a_rank) == i%a_rank) ? 1 : 0);
}


function off(a: Float64Array, a_rank: number){
    let sum = 0;
    for(let i=1; i<a_rank; i++){
        for(let j=0; j<i; j++){
            sum += a[a_rank*i+j];
        }
    }
    return Math.abs(sum);
}

function mul(a: Float64Array, b: Float64Array, a_rank: number){
    let result = new Float64Array(a.length).fill(0);
    for(let i=0; i<a_rank; i++){
        for(let j=0; j<a_rank; j++){
            for(let k=0; k<a_rank; k++){
                result[a_rank*i+j] += a[a_rank*i+k] * b[a_rank*k+j];
            }
        }
    }
    return result;
}


// The normalized (unit "length") eigenvectors, such that the
// row eigenvectors[i, :] is the eigenvector corresponding to the eigenvalue eigenvalues[i].
export function jocobi(a: Float64Array, a_rank: number, tolerance: number){
    let a_off = 1
        , v = identity(a_rank);
    while(a_off>tolerance){
        for (let i = 1; i < a_rank; i++) {
            for (let j = 0; j < i; j++) {
                if(Math.abs(a[a_rank * i + j]) < tolerance) continue;
                let tau: number = (a[a_rank * i + i] - a[a_rank * j + j]) / (2 * a[a_rank * i + j])
                    , t = Math.sign(tau) / (Math.abs(tau) + Math.sqrt(1 + tau ** 2))
                    , c = 1 / Math.sqrt(1 + t ** 2), s = c * t;
                // G A
                for(let k=0; k<a_rank; k++){
                    [a[a_rank*i+k], a[a_rank*j+k]] = [a[a_rank*i+k] * c + a[a_rank*j+k] * s, -a[a_rank*i+k] * s + a[a_rank*j+k] * c];
                    [v[a_rank*i+k], v[a_rank*j+k]] = [v[a_rank*i+k] * c + v[a_rank*j+k] * s, -v[a_rank*i+k] * s + v[a_rank*j+k] * c];
                }
                // A G^{\mathrm{T}}
                for(let k=0; k<a_rank; k++){
                    [a[a_rank*k+i], a[a_rank*k+j]] = [a[a_rank*k+i] * c + a[a_rank*k+j] * s, -a[a_rank*k+i] * s + a[a_rank*k+j] * c];
                }
            }
        }
        a_off = off(a, a_rank);
    }
    a = new Float64Array(a_rank).map((a_i, i) => a[a_rank*i+i]);
    return [a, v];
}

