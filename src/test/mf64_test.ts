import { MatrixF64 } from "../ts/matrix/mf64.js";
import { Float64 } from "../ts/num/f64.js";



let a: MatrixF64 = MatrixF64.fromArray([[new Float64(1), new Float64(2), new Float64(3)]
    , [new Float64(4), new Float64(5), new Float64(6)]]);

MatrixF64.identity(5).print();

let b = a.matAdd(a);
a.print("a");
b.print("b = a + a");

let a_t = a.transpose;
a_t.print("a^T");

b.matMul(a_t).print("b @ a^T");

b.kron(a_t).print("b \otimes a^T");
