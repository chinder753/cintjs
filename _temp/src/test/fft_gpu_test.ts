import { fft_gpu } from "../intergre/fft_gpu";
import { Complex, ComplexArray } from "../intergre/fft";

const NPOINTS = Math.pow(2, 3);
let data = new Float32Array([...Array(NPOINTS*2)].keys()).map(x => x%2==1 ? 0 : Math.cos(x/NPOINTS/2));

let complex_data = ComplexArray.fromRealArray(new Float64Array([...Array(NPOINTS)].keys()).map(x => Math.cos(x/NPOINTS)));
console.log(complex_data.fft())
console.log("\n\n\n\n\n")
console.log(fft_gpu(data));


