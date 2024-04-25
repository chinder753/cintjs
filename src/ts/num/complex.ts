import { Num } from "./num";



export { Complex };

type complex = [number, number];  // [real, imag]

class Complex implements Num<complex, Complex>{
    public static i = new Complex([0, 1]);
    public static zero = new Complex([0, 0]);
    public static one = new Complex([1, 0]);

    value: complex;

    constructor(value: complex){
        this.value = value;
    }

    get conj(): Complex{
        return new Complex([this.value[0], -this.value[1]]);
    }

    get conjSelf(): this{
        this.value[1] = -this.value[1];
        return this;
    }

    get neg(): Complex{
        return new Complex([-this.value[0], -this.value[1]]);
    }

    get negSelf(): this{
        this.value[0] = -this.value[0];
        this.value[1] = -this.value[1];
        return this;
    }

    add(other: Complex): Complex{
        return new Complex([this.value[0] + this.value[0], this.value[1] + this.value[1]]);
    }

    addSelf(other: Complex): this{
        this.value[0] += this.value[0];
        this.value[1] += this.value[1];
        return this;
    }

    sub(other: Complex): Complex{
        return new Complex([this.value[0] - this.value[0], this.value[1] - this.value[1]]);
    }

    subSelf(other: Complex): this{
        this.value[0] -= this.value[0];
        this.value[1] -= this.value[1];
        return this;
    }

    mul(other: Complex): Complex{
        return new Complex([
            this.value[0] * other.value[0] - this.value[1] * other.value[1]
            , this.value[0] * other.value[1] + this.value[1] * other.value[0]]);
    }

    mulSelf(other: Complex): this{
        [this.value[0], this.value[1]] = [
            this.value[0] * other.value[0] - this.value[1] * other.value[1]
            , this.value[0] * other.value[1] + this.value[1] * other.value[0]];
        return this;
    }

    div(other: Complex): Complex{
        let abs_other = other.value[0] ** 2 + other.value[1] ** 2;
        return new Complex([
            (this.value[0] * other.value[0] + this.value[1] * other.value[1]) / abs_other
            , (-this.value[0] * other.value[1] - this.value[1] * other.value[0]) / abs_other]);
    }

    divSelf(other: Complex): this{
        let abs_other = other.value[0] ** 2 + other.value[1] ** 2;
        [this.value[0], this.value[1]] = [
            (this.value[0] * other.value[0] + this.value[1] * other.value[1]) / abs_other
            , (-this.value[0] * other.value[1] - this.value[1] * other.value[0]) / abs_other];
        return this;
    }

    toString(): string{
        return `${this.value[0]}${this.value[1] > 0 ? "+" : ""}${this.value[1]}i`;
    }

}
