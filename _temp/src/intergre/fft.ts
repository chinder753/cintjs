import { i, isNaN } from "mathjs";



export { Complex, ComplexArray }

type FloatArray = Float32Array|Float64Array;
type FloatArrayConstructor = Float32ArrayConstructor|Float64ArrayConstructor;

class Complex<T extends FloatArray> {
    private array: T;

    constructor(array: T) {
        this.array = array;
    }

    public static from(real: number, imag: number, bits: 64|128){
        switch (bits){
            case 64:
                return new Complex(new Float32Array([real, imag]));
            case 128:
                return new Complex(new Float64Array([real, imag]));
            default:
                throw "";
        }
    }

    public static zero(bits: 64|128){
        switch (bits){
            case 64:
                return new Complex(new Float32Array(2));
            case 128:
                return new Complex(new Float64Array(2));
            default:
                throw "";
        }
    }

    public static add<T extends FloatArray>(a: Complex<T>, b: Complex<T>|number): Complex<T>{
        if(typeof b == "number"){
            a.array[0] += b;
        }else{
            [a.array[0], a.array[1]] = [a.array[0]+b.array[0], a.array[1]+b.array[1]];
        }
        return a;
    }

    public static sub<T extends FloatArray>(a: Complex<T>, b: Complex<T>|number): Complex<T>{
        if(typeof b == "number"){
            a.array[0] -= b;
        }else{
            [a.array[0], a.array[1]] = [a.array[0]-b.array[0], a.array[1]-b.array[1]];
        }
        return a;
    }

    public static mul<T extends FloatArray>(a: Complex<T>, b: Complex<T>|number): Complex<T>{
        if(typeof b == "number"){
            a.array[0] *= b;
            a.array[1] *= b;
        }else{
            [a.array[0], a.array[1]] = [a.array[0] * b.array[0] - a.array[1] * b.array[1], a.array[0] * b.array[1] + a.array[1] * b.array[0]];
        }
        return a;
    }

    public static div<T extends Float32Array | Float64Array>(a: Complex<T>, b: Complex<T>|number): Complex<T>{
        if(typeof b == "number"){
            return a.mul(1/b);
        }else{
            return a.mul(b.conj).div(b.abs_square);
        }
    }

    get real(): number{
        return this.array[0];
    }

    set real(x: number){
        this.array[0] = x;
    }

    get imag(): number{
        return this.array[1];
    }

    set imag(x: number){
        this.array[1] = x;
    }

    get copy(): Complex<T>{
        return <Complex<T>>(new Complex(this.array.map(x => x)));
    }

    get data(): FloatArray{
        return this.array;
    }

    get abs(): number{
        return Math.sqrt(Math.pow(this.array[0], 2) + Math.pow(this.array[1], 2));
    }

    get abs_square(): number{
        return Math.pow(this.array[0], 2) + Math.pow(this.array[1], 2);
    }

    get conj(): this{
        this.array[1] = -this.array[1];
        return this;
    }

    public add(other: Complex<T>|number): Complex<T>{
        return Complex.add(this, other);
    }

    public sub(other: Complex<T>|number): Complex<T>{
        return Complex.sub(this, other);
    }

    public mul(other: Complex<T>|number): Complex<T>{
        return Complex.mul(this, other);
    }

    public div(other: Complex<T>|number): Complex<T>{
        return Complex.div(this, other);
    }

}



class ComplexArray<T extends FloatArray> {
    private _length: number;
    private array: T;

    constructor(complex_array: T) {
        if(complex_array.length%2 != 0) throw "";
        this._length = complex_array.length/2;
        this.array = complex_array;
    }

    public static new(length: number, bits: 64|128): typeof bits extends 64 ? ComplexArray<Float32Array> : typeof bits extends 128 ? ComplexArray<Float64Array> : unknown{
        switch(bits){
            case 64:
                return new ComplexArray(new Float32Array(length*2));
            case 128:
                return new ComplexArray(new Float64Array(length*2));
            default:
                throw "";
        }
    }

    public static fromRealArray<T extends FloatArray>(array: T): ComplexArray<T>{
        let result: FloatArray = (new (<FloatArrayConstructor>array.constructor)(array.length * 2)).fill(0);
        array.forEach((v, i) => result[i*2] = v);
        return <ComplexArray<T>>(new ComplexArray(result));
    }

    private static operate<T extends FloatArray>(a: ComplexArray<T>, b: ComplexArray<T>|number
                                                 , operator: (a: Complex<FloatArray>, b: Complex<FloatArray>|number) => Complex<T>): ComplexArray<T>{
        if(typeof b == "number"){
            for(let i=0; i<a._length; i++){
                operator(a.get(i), b);
            }
        }else{
            if(a._length != b._length) throw "";
            for(let i=0; i<a._length; i++){
                operator(a.get(i), b.get(i))
            }
        }
        return a;
    }

    get length(){
        return this._length;
    }

    get real(): FloatArray{
        let result: FloatArray = new (<FloatArrayConstructor>this.array.constructor)(this._length);
        for(let i=0; i<this._length; i++){
            result[i] = this.array[i*2];
        }
        return result;
    }

    get imag(): FloatArray{
        let result: FloatArray = new (<FloatArrayConstructor>this.array.constructor)(this._length);
        for(let i=0; i<this._length; i++){
            result[i] = this.array[i*2+1];
        }
        return result;
    }

    get copy(): ComplexArray<T>{
        return <ComplexArray<T>>(new ComplexArray(this.array.map(x => x)));
    }

    get abs(): FloatArray{
        return (new (<FloatArrayConstructor>this.array.constructor)(this._length)).map((v, i) => this.get(i).abs);
    }

    get abs_square(): FloatArray{
        let abs_array: FloatArray = new (<FloatArrayConstructor>this.array.constructor)(this._length);
        abs_array.map((v, i) => this.get(i).abs_square);
        return abs_array;
    }

    get conj(): this{
        for(let i=0; i<this.array.length; i+=2){
            this.array[i+1] = -this.array[i+1];
        }
        return this;
    }

    public set(index: number, complex: Complex<T>): void{
        index *= 2;
        this.array.set(complex.data, index);
    }

    public get(index: number): Complex<T>{
        index *= 2;
        return <Complex<T>>(new Complex(this.array.subarray(index, index+2)));
    }

    public fill(value: Complex<T>, start: number = 0, end: number = this._length): void{
        for(let i=start; i<end; i++){
            this.set(i, value);
        }
    }

    public slice(start: number = 0, end: number = this._length): ComplexArray<T>{
        return new ComplexArray(<T>this.array.slice(start*2, end*2));
    }
    public subarray(begin: number = 0, end: number = this._length):ComplexArray<T> {
        return <ComplexArray<T>>(new ComplexArray(this.array.subarray(begin*2, end*2)));
    }

    public add(other: ComplexArray<T>|number): ComplexArray<T>{
        return <ComplexArray<T>>ComplexArray.operate(this, other, Complex.add);
    }

    public sub(other: ComplexArray<T>): ComplexArray<T>{
        return <ComplexArray<T>>ComplexArray.operate(this, other, Complex.sub);
    }

    public mul(other: ComplexArray<T>): ComplexArray<T>{
        return <ComplexArray<T>>ComplexArray.operate(this, other, Complex.mul);
    }

    public div(other: ComplexArray<T>): ComplexArray<T>{
        return <ComplexArray<T>>ComplexArray.operate(this, other, Complex.div);
    }

    public dft(): ComplexArray<FloatArray>{
        let npoints: number = this._length;
        let result: ComplexArray<FloatArray> = new ComplexArray<FloatArray>(new (<FloatArrayConstructor>this.array.constructor)(this.array.length));
        for(let i=0; i<this._length; i++){
            let omega = -2*Math.PI/npoints*i;
            for(let j=0; j<this._length; j++){
                result.array[j*2] += this.array[j*2] * Math.cos(omega * j) - this.array[j*2+1] * Math.sin(omega * j);
                result.array[j*2+1] += this.array[j*2+1] * Math.cos(omega * j) + this.array[j*2] * Math.sin(omega * j);
            }
        }
        return result;
    }

    public fft(): ComplexArray<T>{
        let complex_data = this.copy;
        const NPOINTS_HALF = this._length/2;

        for(let i=2; i<this._length; i+=4){
            let [t_real, t_imag] = [complex_data.array[i], complex_data.array[i+1]];
            [complex_data.array[i], complex_data.array[i+1]] = [complex_data.array[i+this._length-2], complex_data.array[i+this._length-1]];
            [complex_data.array[i+this._length-2], complex_data.array[i+this._length-1]] = [t_real, t_imag];
        }

        let fftStep: number = 1;
        let block_size: number = 2;
        let nblock: number = NPOINTS_HALF;

        while(nblock>=1){
            let degree: number = -2*Math.PI/block_size  // -2 \pi \frac{1}{n_{block_size}}
                , omega_list: FloatArray = new (<FloatArrayConstructor>this.array.constructor)(block_size)  // half of block
                , block_offset_list: Int32Array = new Int32Array(nblock).map((v, block_index) => block_index*block_size);
            // omega
            for(let i=0; i<block_size; i+=2){
                [omega_list[i], omega_list[i+1]] = [Math.cos(degree * i/2), Math.sin(degree * i/2)];
            }
            // (block_index, num_index), two data each point
            for(let num_index=0; num_index<fftStep; num_index++){
                // omega = omega_list[num_index]
                let [omega_real, omega_imag] = [omega_list[num_index*2], omega_list[num_index*2+1]];
                for(let block_index=0; block_index<nblock; block_index++){
                    let  e_index = block_offset_list[block_index]+num_index
                        , o_index = e_index+fftStep
                        // e = complex_data[e_index]
                        , [e_real, e_imag ] = [complex_data.array[e_index*2], complex_data.array[e_index*2+1]]
                        // o = complex_data[o_index]
                        , [o_real, o_imag] = [ complex_data.array[o_index*2], complex_data.array[o_index*2+1]];
                    // o *= omega_list[num_index]
                    [o_real, o_imag] = [o_real * omega_real - o_imag * omega_imag, o_real * omega_imag + o_imag * omega_real];
                    // complex_data[e_index] = e + o
                    complex_data.array[e_index*2] = e_real + o_real;
                    complex_data.array[e_index*2+1] = e_imag + o_imag;
                    // complex_data[o_index] = e - o
                    complex_data.array[o_index*2] = e_real - o_real;
                    complex_data.array[o_index*2+1] = e_imag - o_imag;
                }
            }
            nblock /= 2;
            fftStep = block_size;
            block_size *= 2;
        }
        return complex_data;
    }
}

