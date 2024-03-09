// @ts-ignore
import xc_wasm from "./libxc.mjs";

async function ready(){
    let xc: any;
    await xc_wasm().then<any, never>((cint_t: any) => xc = cint_t);

    xc["_MakeAngularGrid"];
}

