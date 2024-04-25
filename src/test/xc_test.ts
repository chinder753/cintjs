import xc_wasm from "../libxc/xc.js";



xc_wasm.then(XC => {
    let ver_p = 1000;
    XC._xc["_xc_version"](ver_p, ver_p + 4, ver_p + 8);
    console.log("Libxc version:", XC._xc["HEAP32"].subarray(ver_p / 4, ver_p / 4 + 3));

    let a_p = 10000
        , npotints = XC.LEBEDEV_ORDER[5]
        , dim = XC._xc["_MakeAngularGrid"](a_p, npotints)
        , out = XC._xc["HEAPF64"].subarray(a_p / 8, a_p / 8 + dim * 4);
    console.log(`${npotints}, ${dim}`);
    for(let i = 0; i < out.length; i += 4){
        console.log(`${out[i]}\t${out[i + 1]}\t${out[i + 2]}\t${out[i + 3]}`);
    }
});