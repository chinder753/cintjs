import { MatrixF64 } from "../matrix/mf64.js";
import { Float64 } from "../num/f64.js";

let a: MatrixF64 = MatrixF64.fromArray([[new Float64(1), new Float64(2), new Float64(3)]
    , [new Float64(1), new Float64(2), new Float64(3)]]);

let b = a.matAdd(a);
a.print("a")
b.print("b")

let a_t = a.transpose;
a_t.print("a^T");

a.matMul(a_t).print("a @ a^T")