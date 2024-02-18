import fs from "fs";
import { BSE } from "../intergre/basis"

const BASIS_PATH = "D:\\Temp\\毕设\\pbc_hf\\basis\\sto\\STO-3G.1.json"

var json_data = fs.readFileSync(BASIS_PATH);
var bse = new BSE(json_data.toString());
console.log(bse.getElementShellFor(1));

const LENGTH = 12.3456789;
const NPOINTS = 100000;
const NCENTER = 100;

const EXP = 0.123456789;
const AMOMENT = 6;

const STEP = LENGTH / NPOINTS;
const RANGE = new Float64Array([...Array(NPOINTS+1).keys()]).map(i => i*STEP);
const CENTER: number[] = [...Array(NCENTER).keys()].map(i => i/NCENTER*LENGTH);

let record: Float64Array[] = [];

CENTER.forEach(center => {

    let distance = RANGE.map(x => x - center);
    let pre_pow: Float64Array[] = [];
    pre_pow.push(distance);
    for(let i=2; i <= Math.max(AMOMENT, 2); i++){
        pre_pow.push(distance.map(x => x**i));
    }

    let pre_exp: Float64Array = pre_pow[1].map(x => Math.exp(-x));


    console.time("pow")
    let s_pow = pre_pow[1].map(x => Math.exp(-EXP*x));
    console.timeEnd("pow")

    console.time("exp")
    let s_exp = pre_exp.map(x => Math.pow(x, EXP));
    console.timeEnd("exp");


    record.push(s_pow);
    record.push(s_exp);

})

console.log(record.length);









