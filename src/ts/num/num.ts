export { Num };

interface Num<T, Self>{

    value: T;

    add(other: Self): Self;

    addSelf(other: Self): this;

    sub(other: Self): Self;

    subSelf(other: Self): this;

    mul(other: Self): Self;

    mulSelf(other: Self): this;

    div(other: Self): Self;

    divSelf(other: Self): this;

    toString(): string;

    get neg(): Self;

    get negSelf(): this;
}


