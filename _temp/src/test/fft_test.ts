import { ComplexArray } from "../intergre/fft";

const NPOINTS = Math.pow(2, 3);

let data = new Float32Array([...Array(NPOINTS)].keys()).map(x => Math.cos(x/NPOINTS));
let complex_data = ComplexArray.fromRealArray(data);

console.log(complex_data.fft())

console.log("my_version");
console.time("fft");
complex_data.fft();
console.timeEnd("fft");