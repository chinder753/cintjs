import { Matrix } from "./matrix.js";
import { Float64 } from "../num/f64.js";



export { MatrixF64 };



// @ts-ignore
class MatrixF64 extends Matrix<Float64Array, Float64, MatrixF64>{

    public static zero(shape: [number, number]): MatrixF64{
        return new MatrixF64(shape, new Float64Array(shape[0] * shape[1]));
    }

    get copy(): MatrixF64{
        return new MatrixF64(this.shape, this.array.map(x => x));
    }

    get(i: number, j: number): Float64{
        return new Float64(this.array[this.shape[1] * i + j]);
    }

    set(i: number, j: number, value: Float64): void{
        this.array[this.shape[1] * i + j] = value.value;
    }

}