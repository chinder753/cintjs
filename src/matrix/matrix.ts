// type IntArray = Int8Array | Int16Array | Int32Array;
// type IntArrayConstructor = Int8ArrayConstructor | Int16ArrayConstructor | Int32ArrayConstructor;

// type UintArray = Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray;
// type UintArrayConstructor = Uint8ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor | Uint8ClampedArrayConstructor;

// type FloatArray = Float32Array | Float64Array;
// type FloatArrayConstructor = Float32ArrayConstructor | Float64ArrayConstructor;

// type TypedArray = IntArray | UintArray | FloatArray;
// type TypedArrayConstructor = IntArrayConstructor | UintArrayConstructor | FloatArrayConstructor

import { Num } from "../num/num.js";

export {Matrix}

abstract class Matrix<Storage extends { length: number }, Ele extends Num<any, any>, Self extends Matrix<Storage, Ele, Self>>{
    public static zero<Self extends Matrix<any, any, Self>>(shape: [number, number]): Self{
        throw "";
    }

    public static identity<Self extends Matrix<any, any, Self>>(rank: number): Self{
        let a = this.zero<Self>([rank, rank]);
        for(let i = 0; i < rank; i++){
            a.set(i, i, 1);
        }
        return a;
    }

    public static fromArray<Ele extends Num<any, any>, Self extends Matrix<any, Ele, Self>>(array: Ele[][]): Self{
        let shape: [number, number] = [array.length, array[0].length];
        let a = this.zero<Self>(shape);
        for(let i = 0; i < shape[0]; i++){
            for(let j = 0; j < shape[1]; j++){
                a.set(i, j, array[i][j]);
            }
        }
        return a;
    }

    abstract get copy(): Self;

    get transpose(): Self{
        let c = Object.getPrototypeOf(this).zero([this.shape[1], this.shape[0]]);
        for(let m = 0; m < this.shape[0]; m++){
            for(let n = 0; n < this.shape[1]; n++){
                c.set(n, m, this.get(m, n));
            }
        }
        return c;
    }

    constructor(shape: [number, number], array: Storage){
        if(shape[0] * shape[1] != array.length) throw "";
        this.shape = shape;
        this.array = array;
    }

    readonly shape: [number, number];
    readonly array: Storage;

    abstract get(i: number, j: number): Ele;

    abstract set(i: number, j: number, value: Ele): void;

    print(comment: string = ""): void{
        console.log(comment);
        for(let i=0; i<this.shape[0]; i++){
            let line = "";
            for(let j=0; j<this.shape[1]; j++){
                line += this.get(i, j).toString();
            }
            console.log(line);
        }
    };

    public add(b: Ele): Self{
        return this.copy.addSelf(b);
    }

    public addSelf(b: Ele): this{
        for(let m = 0; m < this.shape[0]; m++){
            for(let n = 0; n < this.shape[0]; n++){
                this.set(m, n, this.get(m, n).addSelf(b));
            }
        }
        return this;
    }

    public matAdd(b: Self): Self{
        return this.copy.matAddSelf(b);
    }

    public matAddSelf(b: Self): this{
        if(this.shape[0] != b.shape[0] && this.shape[1] != b.shape[1]) throw "";
        for(let m = 0; m < this.shape[0]; m++){
            for(let n = 0; n < this.shape[0]; n++){
                this.set(m, n, this.get(m, n).addSelf(b.get(m, n)));
            }
        }
        return this;
    }

    public mul(b: number): Self{
        return this.copy.mulSelf(b);
    }

    public mulSelf(b: number): this{
        for(let m = 0; m < this.shape[0]; m++){
            for(let n = 0; n < this.shape[1]; n++){
                this.set(m, n, this.get(m, n).mulSelf(b));
            }
        }
        return this;
    }

    public matMul(b: Self): Self{
        if(this.shape[1] != b.shape[0]) throw "";
        let c = Object.getPrototypeOf(this).zero([this.shape[0], b.shape[1]]) as Self;
        for(let m = 0; m < this.shape[0]; m++){
            for(let n = 0; n < b.shape[1]; n++){
                for(let k = 0; k < this.shape[1]; k++){
                    c.set(m, n, c.get(m, n).addSelf(this.get(m, k).mulSelf(b.get(k, n))));
                }
            }
        }
        return c;
    }

    // (m*i, n*j) = (m, n) \otimes (i, j)
    public kron(b: Self): Self{
        let c = Object.getPrototypeOf(this).zero([this.shape[0] * b.shape[0], this.shape[1] * b.shape[1]]) as Self;
        for(let x = 0; x < c.shape[0]; x++){
            let m = Math.floor(x / b.shape[0]), i = x % b.shape[0];
            for(let y = 0; y < c.shape[1]; y++){
                let n = Math.floor(y / b.shape[1]), j = y % b.shape[1];
                c.set(x, y, this.get(m, n).mulSelf(b.get(i, j)));
            }
        }
        return c;
    }

    public h_slice(start: number = 0, end: number = this.shape[0]): Self{
        let new_matrix = Object.getPrototypeOf(this).zero([end - start, this.shape[1]]) as Self;
        for(let i = start; i < end; i++){
            for(let j = 0; j < this.shape[1]; j++){
                new_matrix.set(i - start, j, this.get(i, j));
            }
        }
        return new_matrix;
    }

    public v_slice(start: number = 0, end: number = this.shape[1]): Self{
        let new_matrix = Object.getPrototypeOf(this).zero([this.shape[0], end - start]) as Self;
        for(let i = 0; i < this.shape[0]; i++){
            for(let j = start; j < end; j++){
                new_matrix.set(i, j - start, this.get(i, j));
            }
        }
        return new_matrix;
    }
}



