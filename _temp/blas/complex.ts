export { Complex, ComplexArray }

class Complex {
    private array: Float64Array;

    constructor(array: Float64Array) {
        this.array = array;
    }

    public static from(real: number, imag: number){
        return new Complex(new Float64Array([real, imag]));
    }

    public static zero(){
        return new Complex(new Float64Array([0, 0]));
    }

    public static add(a: Complex, b: Complex|number): Complex{
        if(typeof b == "number"){
            a.array[0] += b;
        }else{
            [a.array[0], a.array[1]] = [a.array[0]+b.array[0], a.array[1]+b.array[1]];
        }
        return a;
    }

    public static sub(a: Complex, b: Complex|number): Complex{
        if(typeof b == "number"){
            a.array[0] -= b;
        }else{
            [a.array[0], a.array[1]] = [a.array[0]-b.array[0], a.array[1]-b.array[1]];
        }
        return a;
    }

    public static mul(a: Complex, b: Complex|number): Complex{
        if(typeof b == "number"){
            a.array[0] *= b;
            a.array[1] *= b;
        }else{
            [a.array[0], a.array[1]] = [a.array[0] * b.array[0] - a.array[1] * b.array[1], a.array[0] * b.array[1] + a.array[1] * b.array[0]];
        }
        return a;
    }

    public static div(a: Complex, b: Complex|number): Complex{
        if(typeof b == "number"){
            return a.mul(1/b);
        }else{
            return a.mul(b.conj).div(b.abs_square);
        }
    }

    get real(){
        return this.array[0];
    }

    set real(x: number){
        this.array[0] = x;
    }

    get imag(){
        return this.array[1];
    }

    set imag(x: number){
        this.array[1] = x;
    }

    get copy(): Complex{
        return new Complex(this.array.map(x => x));
    }

    get data(): Float64Array{
        return this.array;
    }

    get abs(){
        return Math.sqrt(Math.pow(this.array[0], 2) + Math.pow(this.array[1], 2));
    }

    get abs_square(){
        return Math.pow(this.array[0], 2) + Math.pow(this.array[1], 2);
    }

    get conj(): this{
        this.array[1] = -this.array[1];
        return this;
    }

    public add(other: Complex|number): Complex{
        return Complex.add(this, other);
    }

    public sub(other: Complex|number): Complex{
        return Complex.sub(this, other);
    }

    public mul(other: Complex|number): Complex{
        return Complex.mul(this, other);
    }

    public div(other: Complex|number): Complex{
        return Complex.div(this, other);
    }

}



class ComplexArray {
    private _length: number;
    private array: Float64Array;

    constructor(complex_array: Float64Array) {
        if(complex_array.length%2 != 0) throw "";
        this._length = complex_array.length/2;
        this.array = complex_array;
    }

    public static zeros(length: number): ComplexArray{
        return new ComplexArray(new Float64Array(length*2).fill(0));
    }

    public static fromRealArray(array: Float64Array): ComplexArray{
        let result: Float64Array = new Float64Array(array.length * 2).fill(0);
        array.forEach((v, i) => result[i*2] = v);
        return new ComplexArray(result);
    }

    private static operate(a: ComplexArray, b: ComplexArray|number, operator: (a: Complex, b: Complex|number) => Complex): ComplexArray{
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

    get real(): Float64Array{
        let result: Float64Array = new Float64Array(this._length);
        for(let i=0; i<this._length; i++){
            result[i] = this.array[i*2];
        }
        return result;
    }

    get imag(): Float64Array{
        let result: Float64Array = new Float64Array(this._length);
        for(let i=0; i<this._length; i++){
            result[i] = this.array[i*2+1];
        }
        return result;
    }

    get copy(): ComplexArray{
        return new ComplexArray(this.array.map(x => x));
    }

    get abs(): Float64Array{
        return (new Float64Array(this._length)).map((v, i) => this.get(i).abs);
    }

    get abs_square(): Float64Array{
        let abs_array = new Float64Array(this._length);
        abs_array.map((v, i) => this.get(i).abs_square);
        return abs_array;
    }

    get conj(): this{
        for(let i=0; i<this.array.length; i+=2){
            this.array[i+1] = -this.array[i+1];
        }
        return this;
    }

    public set(index: number, complex: Complex): void{
        index *= 2;
        this.array.set(complex.data, index);
        // this.array[index] = complex.real;
        // this.array[index+1] = complex.imag;
    }

    public get(index: number): Complex{
        index *= 2;
        return new Complex(this.array.subarray(index, index+2));
    }

    public fill(value: Complex, start: number = 0, end: number = this._length){
        for(let i=start; i<end; i++){
            this.set(i, value);
        }
    }

    public slice(start: number = 0, end: number = this._length): ComplexArray{
        return new ComplexArray(this.array.slice(start*2, end*2));
    }

    public map(callback: (value: Complex, index: number, array: ComplexArray) => Complex): ComplexArray{
        let result: ComplexArray = this.copy;
        for(let i: number = 0; i<this._length; i++){
            result.set(i, callback(result.get(i).copy, i, this));
        }
        return result;
    }

    public forEach(callback: (value: Complex, index: number, array: ComplexArray) => void): void{
        for(let i=0; i<this._length; i++){
            callback(this.get(i).copy, i, this);
        }
    }

    public reduce(callbackfn: (previousValue: Complex, currentValue: Complex, currentIndex: number, array: ComplexArray) => Complex): Complex{
        let result: Complex = Complex.zero();
        for(let i=0; i<this._length; i++){
            result.add(callbackfn(result, this.get(i).copy, i, this));
        }
        return result;
    }

    public reduceRight(callbackfn: (previousValue: Complex, currentValue: Complex, currentIndex: number, array: ComplexArray) => Complex): Complex{
        let previousValue: Complex = Complex.zero();
        for(let i=this._length-1; i>-1; i--){
            previousValue.add(callbackfn(previousValue, this.get(i).copy, i, this));
        }
        return previousValue;
    }

    public subarray(begin: number = 0, end: number = this._length):ComplexArray {
        return new ComplexArray(this.array.subarray(begin*2, end*2));
    }

    public add(other: ComplexArray|number): ComplexArray{
        return ComplexArray.operate(this, other, Complex.add);
    }

    public sub(other: ComplexArray): ComplexArray{
        return ComplexArray.operate(this, other, Complex.sub);
    }

    public mul(other: ComplexArray): ComplexArray{
        return ComplexArray.operate(this, other, Complex.mul);
    }

    public div(other: ComplexArray): ComplexArray{
        return ComplexArray.operate(this, other, Complex.div);
    }

    public dft(): ComplexArray{
        let npoints: number = this._length;
        return this.map((v, k) => {
            let omega = -2*Math.PI/npoints*k;
            return this.reduce((t_total, t, n) => {
                return Complex.from(Math.cos(omega * n), Math.sin(omega * n)).mul(t);
            });
        });
    }


}

