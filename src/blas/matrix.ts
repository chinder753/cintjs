
type IntArray = Int8Array | Int16Array | Int32Array;
// type IntArrayConstructor = Int8ArrayConstructor | Int16ArrayConstructor | Int32ArrayConstructor;

type UintArray = Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray;
// type UintArrayConstructor = Uint8ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor | Uint8ClampedArrayConstructor;

type FloatArray = Float32Array | Float64Array;
// type FloatArrayConstructor = Float32ArrayConstructor | Float64ArrayConstructor;

type TypedArray = IntArray | UintArray | FloatArray;
// type TypedArrayConstructor = IntArrayConstructor | UintArrayConstructor | FloatArrayConstructor

interface TypedArrayConstructor<T extends TypedArray> extends Function {
    new (...args: any[]): T;
}

interface NewMatrix<T extends TypedArray>{
    (row: number, col: number, arrayConstructor: TypedArrayConstructor<T>): Matrix<T>
}



// class Matrix<T extends TypedArray>{
//     private row: number;
//     private col: number;
//     private array: T;
//
//     constructor(row: number, col: number, array: T) {
//         this.row = row;
//         this.col = col;
//         this.array = array;
//     }
//
//     public static zeros<T extends TypedArray>(row: number, col: number, arrayConstructor: TypedArrayConstructor<T>): Matrix<T>{
//         return new Matrix(row, col, new arrayConstructor(row*col));
//     }
//
//     public static identity<T extends TypedArray>(row: number, col: number, arrayConstructor: TypedArrayConstructor<T>): Matrix<T>{
//         let array: T = new arrayConstructor(row*col);
//         array.map((x, i) => (i/row === i%row) ? 1 : 0);
//         return new Matrix(row, col, array);
//     }
//
//     public get(i: number, j: number){
//         if(i>this.row || i<0 || j>this.col || j<0) throw new RangeError(`(${i}, ${j}) from a (${this.row}, ${this.col}) matrix`);
//         return this.array[this.row*i+j];
//     }
//
//     public set(i: number, j: number, value: number){
//         if(i>this.row || i<0 || j>this.col || j<0) throw new RangeError(`(${i}, ${j}) from a (${this.row}, ${this.col}) matrix`);
//         this.array[this.row*i+j] = value;
//     }
//
// }
//
// let a = Matrix.zeros(2, 2, Int32Array);








// class Matrix<T extends TypedArray>{
//     readonly shape: [number, number];
//     readonly array: T;
//
//     constructor(shape: [number, number], array: T){
//         if(shape[0] * shape[1] != array.length) throw "";
//         this.shape = shape;
//         this.array = array;
//     }
//
//     // a = a + b
//     public static add<T extends TypedArray>(a: Matrix<T>, b: number | Matrix<T>): Matrix<T>{
//         let c = a.copy;
//         if(typeof b === "number"){
//             for(let m=0; m<a.shape[0]; m++){
//                 for(let n=0; n<a.shape[0]; n++){
//                     c.set(c.get(m, n)+b, m, n);
//                 }
//             }
//         }else{
//             for(let m=0; m<a.shape[0]; m++){
//                 for(let n=0; n<a.shape[0]; n++){
//                     c.set(c.get(m, n)+b.get(m, n), m, n);
//                 }
//             }
//         }
//         return c;
//     }
//
//
//     // c = a @ b
//     // (m, n) = (m, k) @ (k, n)
//     public static mul<T extends TypedArray>(a: Matrix<T>, b: number | Matrix<T>): Matrix<T>{
//         let c: Matrix;
//         if(typeof b === "number"){
//             c = Matrix.zero(a.shape);
//             for(let m = 0; m < a.shape[0]; m++){
//                 for(let n = 0; n < a.shape[1]; n++){
//                     c.set(c.get(m, n)*b, m, n);
//                 }
//             }
//         }else{
//             if(a.shape[1] != b.shape[0]) throw "";
//             c = Matrix.zero([a.shape[0], b.shape[1]]);
//             for(let m = 0; m < a.shape[0]; m++){
//                 for(let n = 0; n < b.shape[1]; n++){
//                     for(let k = 0; k < a.shape[1]; k++){
//                         c.set(c.get(m, n) + a.get(m, k) * b.get(k, n), m, n);
//                     }
//                 }
//             }
//         }
//         return c;
//     }
//
//     // c = a \otimes b
//     // (m*i, n*j) = (m, n) \otimes (i, j)
//     public static kron(a: Matrix, b: Matrix): Matrix{
//         let c = new Matrix([a.shape[0] * b.shape[0], a.shape[1] * b.shape[1]], new Float64Array(a.shape[0] * b.shape[0] * a.shape[1] * b.shape[1]));
//         for(let x = 0; x<c.shape[0]; x++){
//             let m = Math.floor(x/b.shape[0]), i = x%b.shape[0];
//             for(let y = 0; y<c.shape[1]; y++){
//                 let n = Math.floor(y/b.shape[1]), j = y%b.shape[1];
//                 c.set(a.get(m, n)*b.get(i, j), x, y);
//             }
//         }
//         return c;
//     }
//
//     public get(i: number): Float64Array;
//     public get(i: number, j: number): number;
//     public get(i: number, j?: number): Float64Array | number{
//         if(typeof j === "undefined"){
//             return this.array.subarray(this.shape[1] * i, this.shape[1] * (i + 1));
//         }else{
//             return this.array[this.shape[1] * i + j];
//         }
//     }
//
//
//     public set(values: Float64Array, i: number): void;
//     public set(value: number, i: number, j: number): void;
//     public set(value: Float64Array | number, i: number, j?: number): void{
//         if(typeof value === "number" && typeof j === "number"){
//             this.array[this.shape[1] * i + j] = value;
//         }else if(value instanceof Float64Array && typeof j === "undefined"){
//             if(value.length != this.shape[0]) throw "";
//             this.array.set(value, this.shape[1] * i);
//         }
//     }
//
//
//     get copy(): Matrix{
//         return new Matrix(this.shape, this.array);
//     }
//
//     get transpose(): Matrix{
//         let c = new Matrix([this.shape[1], this.shape[0]], this.array.map(x => x));
//         for(let m=0; m<this.shape[0]; m++){
//             for(let n=0; n<this.shape[1]; n++){
//                 c.set(this.get(m, n), n, m);
//             }
//         }
//         return c;
//     }
//
//     public h_slice(start: number = 0, end: number = this.shape[0]){
//         let new_matrix = Matrix.zero([end-start, this.shape[1]]);
//         for(let i=start; i<end; i++){
//             for(let j = 0; j<this.shape[1]; j++){
//                 new_matrix.set(this.get(i, j), i-start, j);
//             }
//         }
//         return new_matrix;
//     }
//
//     public add(b: number|Matrix): Matrix{
//         return Matrix.add(this, b);
//     }
//
//     public mul(b: number): Matrix{
//         for(let m = 0; m < this.shape[0]; m++){
//             for(let n = 0; n < this.shape[1]; n++){
//                 this.set(this.get(m, n)*b, m, n);
//             }
//         }
//         return this
//     }
//
//     public eigh(sort = true, tolerance: number = 1e-17): {value: Float64Array, vector: Matrix}{
//         if(this.shape[0] != this.shape[1]) throw "";
//         let a_off = 1
//             , rank = this.shape[0]
//             , matrix = this.array.map(x => x)
//             , eigh_vector = new Float64Array(rank * rank).map((x, i) => (Math.floor(i / rank) === i % rank) ? 1 : 0);
//         while(a_off > tolerance){
//             a_off = 0;
//             for(let i = 1; i < rank; i++){
//                 for(let j = 0; j < i; j++){
//                     if(Math.abs(matrix[rank * i + j]) < tolerance) continue;
//                     let tau = (matrix[rank * i + i] - matrix[rank * j + j]) / (2 * matrix[rank * i + j])
//                         , t = Math.sign(tau) / (Math.abs(tau) + Math.sqrt(1 + tau ** 2))
//                         , c = 1 / Math.sqrt(1 + t ** 2), s = c * t;
//                     // G A
//                     for(let k = 0; k < rank; k++){
//                         [matrix[rank * i + k], matrix[rank * j + k]] = [matrix[rank * i + k] * c + matrix[rank * j + k] * s, -matrix[rank * i + k] * s + matrix[rank * j + k] * c];
//                         [eigh_vector[rank * i + k], eigh_vector[rank * j + k]] = [eigh_vector[rank * i + k] * c + eigh_vector[rank * j + k] * s, -eigh_vector[rank * i + k] * s + eigh_vector[rank * j + k] * c];
//                     }
//                     // A G^{\mathrm{T}}
//                     for(let k = 0; k < rank; k++){
//                         [matrix[rank * k + i], matrix[rank * k + j]] = [matrix[rank * k + i] * c + matrix[rank * k + j] * s, -matrix[rank * k + i] * s + matrix[rank * k + j] * c];
//                     }
//                     a_off += matrix[rank * i + j];
//                 }
//             }
//             a_off = Math.abs(a_off);
//         }
//
//         if(sort){
//             let temp_value: [number, number][] = [...Array(rank).keys()].map((a_i, i) => [i, matrix[rank * i + i]]);
//             temp_value.sort((a, b) => a[1] - b[1]);
//
//             let temp_eigh_vector = new Float64Array(rank*rank);
//             temp_value.forEach(([sorted_index, v], i) => {
//                 matrix[rank*i+i] = v;
//                 for(let j=0; j<rank; j++){
//                     temp_eigh_vector[rank*i+j] = eigh_vector[rank*sorted_index+j];
//                 }
//             })
//             eigh_vector = temp_eigh_vector;
//         }
//
//         let eigh_value = new Float64Array(rank).map((a_i, i) => matrix[rank * i + i]);
//         return {
//             value: eigh_value
//             , vector: new Matrix([rank, rank], eigh_vector)
//         }
//     }
//
//     public print(comment: string = ""): void{
//         console.log(comment);
//         for(let i = 0; i < this.shape[0]; i++){
//             let out_str = "";
//             for(let j = 0; j < this.shape[1]; j++){
//                 out_str += `${this.array[this.shape[1] * i + j]}\t`;
//             }
//             console.log(out_str);
//         }
//     }
// }
