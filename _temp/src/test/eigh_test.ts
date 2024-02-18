import { jocobi } from "../intergre/eigh";

let a = new Float64Array([1, 1, 1
    , 1, 2, 2
    , 1, 2, 3]);
let a_rank = 3;

let [eigenvalues , eigenvectors ] = jocobi(a, 3, 1e-15);


console.log(eigenvalues);

for(let i=0; i<a_rank; i++){
    let temp_str: string = "";
    for(let j=0; j<a_rank; j++) {
        temp_str += `${Math.abs(eigenvectors[a_rank*i+j]) < 1e-15 ? 0 : eigenvectors[a_rank*i+j]}\t`
    }
    console.log(temp_str);
}



