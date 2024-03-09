import { Num } from "./num";

export { Float64 }

class Float64 implements Num<number, Float64>{
    public static one: Float64 = new Float64(1);
    public static zero: Float64 = new Float64(0);

    get neg(): Float64{
        return new Float64(-this.value);
    }

    get negSelf(): this{
        this.value = -this.value;
        return this;
    }

    constructor(value: number){
        this.value = value;
    }

    value: number;

    add(other: Float64): Float64{
        return new Float64(this.value + other.value);
    }

    addSelf(other: Float64): this{
        this.value += other.value;
        return this;
    }

    div(other: Float64): Float64{
        return new Float64(this.value / other.value);
    }

    divSelf(other: Float64): this{
        this.value /= other.value;
        return this;
    }

    mul(other: Float64): Float64{
        return new Float64(this.value * other.value);
    }

    mulSelf(other: Float64): this{
        this.value *= other.value;
        return this;
    }

    sub(other: Float64): Float64{
        return new Float64(this.value - other.value);
    }

    subSelf(other: Float64): this{
        this.value -= other.value;
        return this;
    }

    toString(): string{
        return this.value.toString();
    }
}
