// @ts-ignore
import xc_wasm from "./libxc.mjs";
import { Pointer } from "../ts/pointer";



const XC_UNPOLARIZED = 1;
const XC_POLARIZED = 2;

const XC_NON_RELATIVISTIC = 0;
const XC_RELATIVISTIC = 1;

const XC_EXCHANGE = 0;
const XC_CORRELATION = 1;
const XC_EXCHANGE_CORRELATION = 2;
const XC_KINETIC = 3;

const XC_FAMILY = {
    UNKNOWN: -1
    , LDA: 1
    , GGA: 2
    , MGGA: 4
    , LCA: 8
    , OEP: 16
    , HYB_GGA: 32
    , HYB_MGGA: 64
    , HYB_LDA: 128
};



/* flags that can be used in info.flags. Don't reorder these since it
   will break the ABI of the library. */
const enum XC_FLAGS{
    HAVE_EXC = 1 << 0 /*     1 */
    , HAVE_VXC = 1 << 1 /*     2 */
    , HAVE_FXC = 1 << 2 /*     4 */
    , HAVE_KXC = 1 << 3 /*     8 */
    , HAVE_LXC = 1 << 4 /*    16 */
    , _1D = 1 << 5 /*    32 */
    , _2D = 1 << 6 /*    64 */
    , _3D = 1 << 7 /*   128 */
    /* range separation via error function (usual case) */
    , HYB_CAM = 1 << 8 /*   256 */
    /* range separation via Yukawa function (rare) */
    , HYB_CAMY = 1 << 9 /*   512 */
    , VV10 = 1 << 10 /*  1024 */
    /* range separation via error function i.e. same as XC_FLAGS_HYB_CAM; deprecated */
    , HYB_LC = 1 << 11 /*  2048 */
    /* range separation via Yukawa function i.e. same as XC_FLAGS_HYB_CAMY; deprecated */
    , HYB_LCY = 1 << 12 /*  4096 */
    , STABLE = 1 << 13 /*  8192 */
    /* functionals marked with the development flag may have significant problems in the implementation */
    , DEVELOPMENT = 1 << 14 /* 16384 */
    , NEEDS_LAPLACIAN = 1 << 15 /* 32768 */
    , NEEDS_TAU = 1 << 16 /* 65536 */
    /* This is the case for most functionals in libxc */
    , HAVE_ALL = XC_FLAGS.HAVE_EXC | XC_FLAGS.HAVE_VXC | XC_FLAGS.HAVE_FXC | XC_FLAGS.HAVE_KXC | XC_FLAGS.HAVE_LXC
}



/* This magic value means use default parameter */
const XC_EXT_PARAMS_DEFAULT = -999998888;

const XC_MAX_REFERENCES = 5;
const FUNC_PARAMS_TYPE_SIZE = 4 + 4 + 4 + 4 + 4;
const FUNCS_VARIANTS_SIZE = 4 * 5 + 4 * 5;

const LEBEDEV_ORDER = {
    0: 1,
    3: 6,
    5: 14,
    7: 26,
    9: 38,
    11: 50,
    13: 74,
    15: 86,
    17: 110,
    19: 146,
    21: 170,
    23: 194,
    25: 230,
    27: 266,
    29: 302,
    31: 350,
    35: 434,
    41: 590,
    47: 770,
    53: 974,
    59: 1202,
    65: 1454,
    71: 1730,
    77: 2030,
    83: 2354,
    89: 2702,
    95: 3074,
    101: 3470,
    107: 3890,
    113: 4334,
    119: 4802,
    125: 5294,
    131: 5810
};


async function ready(){
    let xc: any;
    await xc_wasm().then<any, never>((cint_t: any) => xc = cint_t);

    function read_c_string(p: number): [String, number]{
        let offset = p;
        while(xc["HEAP8"][offset] != "\0") offset += 1;
        return [String.fromCharCode(...xc["HEAP8"].subarray(p, offset)), offset];
    }

    class func_reference_type{
        readonly p: Pointer;
        readonly ref: String;
        readonly doi: String;
        readonly bibtex: String;
        readonly key: String;

        constructor(p: Pointer){
            this.p = p;
            this.ref = read_c_string(xc["_xc_func_reference_get_ref"](p))[0];
            this.doi = read_c_string(xc["_xc_func_reference_get_doi"](p))[0];
            this.bibtex = read_c_string(xc["_xc_func_reference_get_bibtex"](p))[0];
            this.key = read_c_string(xc["_xc_func_reference_get_key"](p))[0];
        }

        public delete(){
            xc["_free"](this.p);
        }
    }

    class func_params_type{
        readonly p: Pointer;
        readonly n: number; /* Number of parameters */
        readonly names: String[] = []; /* ATTENTION: if name starts with a _ it is an *internal* parameter,
                        changing the value effectively changes the functional! */
        readonly descriptions: String[] = []; /* long description of the parameters */
        readonly values: Float64Array; /* default values of the parameters */

        constructor(p: Pointer){
            this.p = p;
            this.n = xc["HEAP32"][this.p.i32];
            let p_names = xc["HEAP32"][this.p.i32 + 1]
                , p_descriptions = xc["HEAP32"][this.p.i32 + 2];
            for(let i = 0; i < this.n; i++){
                let temp_names: String
                    , temp_descriptions: String;
                [temp_names, p_names] = read_c_string(p_names);
                [temp_descriptions, p_descriptions] = read_c_string(p_descriptions);
                this.names.push(temp_names);
                this.descriptions.push(temp_descriptions);
            }
            this.values = xc["HEAPF64"].subarray(xc["HEAP32"][this.p.i32 + 3], xc["HEAP32"][this.p.i32 + 3] + this.n);
            this.set = xc.table.get(xc["HEAP32"][this.p.i32 + 4]);
        }

        set: (p_xc_func_type: Pointer, p_ext_params: Pointer) => void;
    }

    class xc_func_info_type{
        public p: Pointer;
        public number: number;
        public kind: number;     /* XC_EXCHANGE, XC_CORRELATION, XC_EXCHANGE_CORRELATION, XC_KINETIC */
        public name: String;     /* name of the functional, e.g. "PBE" */
        public family: number;   /* type of the functional, e.g. XC_FAMILY_GGA */
        public refs: func_reference_type[] = [];  /* index of the references */
        public flags: number;    /* see above for a list of possible flags */
        // public dens_threshold: number;
        // /* this allows to have external parameters in the functional */
        // public ext_params: func_params_type;
        // public p_lda: number;
        // public p_gga: number;
        // public p_mgga: number;
        // init: (p_xc_func_type: Pointer) => void;
        // end: (p_xc_func_type: Pointer) => void;

        constructor(p: Pointer){
            this.p = p;
            this.number = xc["_xc_func_info_get_number"](this.p);
            this.kind = xc["_xc_func_info_get_kind"](this.p);
            this.name = read_c_string(xc["_xc_func_info_get_name"](this.p))[0];
            this.family = xc["_xc_func_info_get_family"](this.p);
            for(let i = 0; i < XC_MAX_REFERENCES; i++){
                this.refs.push(xc["_xc_func_info_get_references"](this.p, i));
            }
            this.flags = xc["_xc_func_info_get_flags"](this.p);
        }

    }

    class XC{
        static readonly _xc = xc;
        static readonly LEBEDEV_ORDER = LEBEDEV_ORDER;
        static readonly XC_FAMILY = XC_FAMILY;
    }

    return XC;
}

export default ready();