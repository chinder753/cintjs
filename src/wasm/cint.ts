import cint_wasm from "./libcint.mjs"
import {CintData} from "../cint_data.js";

type TypedArray = Int8Array | Int16Array | Int32Array |Uint8Array | Uint16Array | Uint32Array | Float32Array | Float64Array;

async function ready(){
    let cint: any;
    await cint_wasm().then(cint_t => cint = cint_t);

    class Cint{
        static readonly _cint = cint;

        public static malloc(len: number, bytes_per_element: number): number{
            return this._cint._malloc(len * bytes_per_element) / bytes_per_element;
        }

        public static free(pointer: number, bytes_per_element: number){
            this._cint._free(pointer) * bytes_per_element;
        }

        public static moveToHeap<T extends TypedArray>(array: T): T{
            let p = Cint._cint._malloc(array.byteLength)/array.BYTES_PER_ELEMENT;
            if(array instanceof Int8Array){
                Cint._cint.HEAP8.set(array, p);
                return Cint._cint.HEAP8.subarray(p, p + array.length);
            }else if(array instanceof Int16Array){
                Cint._cint.HEAP16.set(array, p);
                return Cint._cint.HEAP16.subarray(p, p + array.length);
            }else if(array instanceof Int32Array){
                Cint._cint.HEAP32.set(array, p);
                return Cint._cint.HEAP32.subarray(p, p + array.length);
            }else if(array instanceof Uint8Array){
                Cint._cint.HEAPU8.set(array, p);
                return Cint._cint.HEAPU8.subarray(p, p + array.length);
            }else if(array instanceof Uint16Array){
                Cint._cint.HEAPU16.set(array, p);
                return Cint._cint.HEAPU16.subarray(p, p + array.length);
            }else if(array instanceof Uint32Array){
                Cint._cint.HEAPU32.set(array, p);
                return Cint._cint.HEAPU32.subarray(p, p + array.length);
            }else if(array instanceof Float32Array){
                Cint._cint.HEAPF32.set(array, p);
                return Cint._cint.HEAPF32.subarray(p, p + array.length);
            }else if(array instanceof Float64Array){
                Cint._cint.HEAPF64.set(array, p);
                return Cint._cint.HEAPF64.subarray(p, p + array.length);
            }else{
                throw "";
            }
        }

        public static getPointer(array: TypedArray): number{
            return array.byteOffset * array.BYTES_PER_ELEMENT;
        }

        public static fromCintData(cint_data: CintData){
            return new Cint(cint_data.basis_index, cint_data.bas_template, cint_data.atm, cint_data.env);
        }

        private basis_index: number[];
        private bas_template: Int32Array[] = [];  // same as "coefficients" in BSE
        private atm: Int32Array;
        private env: Float64Array;

        constructor(basis_index: number[], bas_template: Int32Array[], atm: Int32Array, env: Float64Array) {
            this.basis_index = basis_index;
            bas_template.forEach(bas => {
                this.bas_template.push(Cint.moveToHeap(bas));
            });
            this.atm = Cint.moveToHeap(atm);
            this.env = Cint.moveToHeap(env);
        }

        public normalize(){
            this.bas_template.forEach(bas => {
                for(let coeff_index = 0; coeff_index<bas[2]; coeff_index++){
                    for(let bas_index = 0; bas_index<=bas.length/8; bas_index++){
                        this.env[bas[6+bas_index*8]+coeff_index] *= Cint._cint._CINTgto_norm(bas[1+bas_index*8], this.env[bas[5+bas_index*8]+coeff_index]);
                    }
                }
            })
        }
    }

    return Cint
}

export default ready()
