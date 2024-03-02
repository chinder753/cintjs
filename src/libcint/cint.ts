// @ts-ignore
import cint_wasm from "./libcint.mjs";

import { ATM_SOLT, BAS_SOLT, CintData } from "../cint_data.js";

type TypedArray =
    Int8Array
    | Int16Array
    | Int32Array
    | Uint8Array
    | Uint16Array
    | Uint32Array
    | Float32Array
    | Float64Array;

async function ready(){
    let cint: any;
    await cint_wasm().then<any, never>((cint_t: any) => cint = cint_t);

    // const CLASS_REGISTER = new FinalizationRegistry((v: WeakRef<any>) => v.deref().delete());
    // const ARRAY_REGISTER = new FinalizationRegistry(p => Cint._cint._free(p));

    class IntegerCalculator{
        private _di: number[] = [];

        get di(){
            return this._di.map(x => x);
        }

        get index(){
            let i = 0
                , int_index: number[] = [];
            this._di.forEach(x => {
                int_index.push(i);
                i += x;
            });
            return int_index;
        }

        constructor(p_atm: number, natm: number
            , bas_p: number, nbas: number
            , p_env: number){
            for(let i = 0; i < nbas; i++){
                this._di.push(Cint._cint._CINTcgto_cart(i, bas_p));
            }
            let shls_p = cint._malloc(4 * Int32Array.BYTES_PER_ELEMENT)
                , max_di = Math.max(...this._di)
                , buf_len = max_di * max_di * max_di * max_di
                , buf_p = cint._malloc(buf_len * Float64Array.BYTES_PER_ELEMENT);
            this.p_atm = p_atm;
            this.natm = natm;
            this.p_bas = bas_p;
            this.nbas = nbas;
            this.p_env = p_env;
            this.shls = cint.HEAP32.subarray(shls_p / 4, shls_p / 4 + 4);
            this.buf = cint.HEAPF64.subarray(buf_p / 8, buf_p / 8 + buf_len);
            // CLASS_REGISTER.register(this, new WeakRef(this));
        }

        readonly natm: number;
        readonly nbas: number;
        readonly buf: Float64Array;
        private p_atm: number;
        private p_bas: number;
        private p_env: number;
        private shls: Int32Array;

        public intor(shls: number[], int_name: string){
            if(shls.length > 4 || shls.length < 2) throw "";
            this.shls.set(shls);
            cint[int_name](this.buf.byteOffset, 0, this.shls.byteOffset
                , this.p_atm, this.natm
                , this.p_bas, this.nbas
                , this.p_env);
            let out_dim = 1;
            shls.forEach(v => out_dim *= this._di[v]);
            return new Float64Array(this.buf.subarray(0, out_dim));
        }

        public int2c_full(int_name: string): { dim: number, storage: "full", data: Float64Array }{
            let int_index = this.index
                , di = this.di
                , data_dim = di.reduce((p, c) => p + c)
                , data = new Float64Array(data_dim * data_dim);
            for(let i = 0; i < this.nbas; i++){
                for(let j = 0; j <= i; j++){
                    let subdata = this.intor([i, j], int_name);
                    for(let m = 0; m < di[i]; m++){
                        for(let n = 0; n < di[j]; n++){
                            data[data_dim * (int_index[i] + m) + int_index[j] + n] = subdata[di[j] * m + n];
                        }
                    }
                }
            }
            for(let i = 0; i < data_dim; i++){
                for(let j = 0; j < data_dim; j++){
                    data[data_dim * i + j] = data[data_dim * j + i];
                }
            }
            return {dim: data_dim, storage: "full", data: data};
        }

        public int2c_pack(int_name: string): { dim: number, storage: "pack", data: Float64Array }{
            let int_index = this.index
                , di = this.di
                , data_dim = di.reduce((p, c) => p + c)
                , data = new Float64Array(data_dim * (data_dim + 1) / 2);
            for(let j = 0; j < this.nbas; j++){
                for(let i = 0; i <= j; i++){
                    let subdata = this.intor([j, i], int_name);
                    for(let n = 0; n < di[j]; n++){
                        let index_j = int_index[j] + n;
                        data.set(subdata.subarray(di[i] * n, di[i] * (n + 1)), index_j * (index_j + 1) / 2 + int_index[i]);
                    }
                }
            }
            return {dim: data_dim, storage: "pack", data: data};
        }

        public delete(){
            cint._free(this.buf.byteOffset);
            cint._free(this.shls.byteOffset);
        }
    }

    class Cint{
        static readonly _cint = cint;

        public static malloc(len: number, bytes_per_element: number): number{
            return this._cint._malloc(len * bytes_per_element) / bytes_per_element;
        }

        public static free(pointer: number){
            this._cint._free(pointer);
        }

        public static moveToHeap<T extends TypedArray>(js_array: T): T{
            let p = Cint._cint._malloc(js_array.byteLength) / js_array.BYTES_PER_ELEMENT
                , heap_array: T;
            if(js_array instanceof Int8Array){
                Cint._cint.HEAP8.set(js_array, p);
                heap_array = Cint._cint.HEAP8.subarray(p, p + js_array.length);
            }else if(js_array instanceof Int16Array){
                Cint._cint.HEAP16.set(js_array, p);
                heap_array = Cint._cint.HEAP16.subarray(p, p + js_array.length);
            }else if(js_array instanceof Int32Array){
                Cint._cint.HEAP32.set(js_array, p);
                heap_array = Cint._cint.HEAP32.subarray(p, p + js_array.length);
            }else if(js_array instanceof Uint8Array){
                Cint._cint.HEAPU8.set(js_array, p);
                heap_array = Cint._cint.HEAPU8.subarray(p, p + js_array.length);
            }else if(js_array instanceof Uint16Array){
                Cint._cint.HEAPU16.set(js_array, p);
                heap_array = Cint._cint.HEAPU16.subarray(p, p + js_array.length);
            }else if(js_array instanceof Uint32Array){
                Cint._cint.HEAPU32.set(js_array, p);
                heap_array = Cint._cint.HEAPU32.subarray(p, p + js_array.length);
            }else if(js_array instanceof Float32Array){
                Cint._cint.HEAPF32.set(js_array, p);
                heap_array = Cint._cint.HEAPF32.subarray(p, p + js_array.length);
            }else if(js_array instanceof Float64Array){
                Cint._cint.HEAPF64.set(js_array, p);
                heap_array = Cint._cint.HEAPF64.subarray(p, p + js_array.length);
            }else{
                throw "";
            }
            // ARRAY_REGISTER.register(heap_array, heap_array.byteOffset, {p: heap_array.byteOffset});
            return heap_array;
        }

        public static getPointer(array: TypedArray): number{
            return array.byteOffset * array.BYTES_PER_ELEMENT;
        }

        public static fromCintData(cint_data: CintData){
            return new Cint(cint_data.basis_index, cint_data.bas_template, cint_data.atm, cint_data.env);
        }

        constructor(basis_index: number[], bas_template: Int32Array[], atm: Int32Array, env: Float64Array){
            this.basis_index = basis_index;
            bas_template.forEach(bas => {
                this.bas_template.push(Cint.moveToHeap(bas));
            });
            this.atm = Cint.moveToHeap(atm);
            this.natm = this.atm.length / ATM_SOLT.ATM_SLOTS;
            this.env = Cint.moveToHeap(env);
            // CINT_REGISTER.register(this, new WeakRef(this));
        }

        private atm: Int32Array;
        private natm: number;
        private basis_index: number[];
        private bas_template: Int32Array[] = [];  // same as "coefficients" in BSE
        private env: Float64Array;

        public delete(){
            this.bas_template.forEach(bas => {
                // ARRAY_REGISTER.unregister({p: bas.byteOffset});
                Cint._cint._free(bas.byteOffset);
            });
            // ARRAY_REGISTER.unregister({p: this.atm.byteOffset});
            // ARRAY_REGISTER.unregister({p: this.env.byteOffset});
            Cint._cint._free(this.atm.byteOffset);
            Cint._cint._free(this.env.byteOffset);
        }

        public normalize(): this{
            this.bas_template.forEach(bas => {
                for(let coeff_index = 0; coeff_index < bas[2]; coeff_index++){
                    for(let bas_index = 0; bas_index <= bas.length / 8; bas_index++){
                        this.env[bas[6 + bas_index * 8] + coeff_index] *= Cint._cint._CINTgto_norm(bas[1 + bas_index * 8], this.env[bas[5 + bas_index * 8] + coeff_index]);
                    }
                }
            });
            return this;
        }

        public selectBas(select_bas: { atm_index: number, shell_index: number }[]): IntegerCalculator{
            let p_bas: number = Cint._cint._malloc(select_bas.length * BAS_SOLT.BAS_SLOTS * Int32Array.BYTES_PER_ELEMENT)
                , bas_offset: number = p_bas / Int32Array.BYTES_PER_ELEMENT;
            select_bas.forEach(v => {
                let bas_template = this.bas_template[this.basis_index[v.atm_index]];
                if(v.shell_index > bas_template.length) throw "";
                let template_index: number = bas_template.byteOffset / Int32Array.BYTES_PER_ELEMENT + v.shell_index * BAS_SOLT.BAS_SLOTS
                    ,
                    bas = Cint._cint.HEAP32.copyWithin(bas_offset, template_index, template_index + BAS_SOLT.BAS_SLOTS).subarray(bas_offset, bas_offset + BAS_SOLT.BAS_SLOTS);
                bas[0] = v.atm_index;
                bas_offset += BAS_SOLT.BAS_SLOTS;
            });
            return new IntegerCalculator(this.atm.byteOffset, this.natm
                , p_bas, select_bas.length
                , this.env.byteOffset);
        }

        public allBas(): IntegerCalculator{
            let nbas = 0;
            this.basis_index.forEach((bas_index) => {
                nbas += this.bas_template[bas_index].length / BAS_SOLT.BAS_SLOTS;
            });
            let p_bas: number = Cint._cint._malloc(nbas * BAS_SOLT.BAS_SLOTS * Int32Array.BYTES_PER_ELEMENT)
                , bas_offset = p_bas / Int32Array.BYTES_PER_ELEMENT;
            this.basis_index.forEach((bas_index, atm_index) => {
                let bas_template = this.bas_template[bas_index]
                    , template_offset = bas_template.byteOffset / Int32Array.BYTES_PER_ELEMENT;
                for(let i = 0; i < bas_template.length / BAS_SOLT.BAS_SLOTS; i++){
                    bas_template[i * BAS_SOLT.BAS_SLOTS] = atm_index;
                }
                Cint._cint.HEAP32.copyWithin(bas_offset, template_offset, template_offset + bas_template.length);
                bas_offset += bas_template.length;
            });
            return new IntegerCalculator(this.atm.byteOffset, this.natm
                , p_bas, nbas
                , this.env.byteOffset);
        }
    }

    return Cint;
}

export default ready();
