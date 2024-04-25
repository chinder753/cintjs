export { Pointer };



class Pointer{
    public p: number;
    public i8: number;
    public u8: number;
    public i16: number;
    public u16: number;
    public i32: number;
    public u32: number;
    public i64: number;
    public u64: number;
    public f32: number;
    public f64: number;
    public pointer: number;

    constructor(p: number){
        this.p = p;
        this.i8 = p;
        this.u8 = p;
        this.i16 = p / 2;
        this.u16 = p / 2;
        this.i32 = p / 4;
        this.u32 = p / 4;
        this.i64 = p / 8;
        this.u64 = p / 8;
        this.f32 = p / 4;
        this.f64 = p / 8;
        this.pointer = p / 4;
    }

    get nextPointer(): Pointer{
        return new Pointer(this.p + 4);
    }

    get next8(): Pointer{
        return new Pointer(this.p + 1);
    }

    get next16(): Pointer{
        return new Pointer(this.p + 2);
    }

    get next32(): Pointer{
        return new Pointer(this.p + 4);
    }

    get next64(): Pointer{
        return new Pointer(this.p + 8);
    }

    public movePointer(){
        this.p = this.p + 4;
    }

    public move8(){
        this.p = this.p + 1;
    }

    public move16(){
        this.p = this.p + 2;
    }

    public move32(){
        this.p = this.p + 4;
    }

    public move64(){
        this.p = this.p + 8;
    }
}