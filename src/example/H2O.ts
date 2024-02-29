import { readXYZ2Group } from "../io.js";
import { BSE } from "../bse.js";
import { CintData } from "../cint_data.js";

import cint from "../wasm/cint.js";

import fs from "fs";


cint.then(Cint => {
    //
    let atom_group = readXYZ2Group("3\n\nH 0.0 0.5 0.0\nO 0.0 0.0 0.0\nH 0.0 -0.5 0.0\n")
        , bse = new BSE(fs.readFileSync("lib/basis_set_exchange/basis_set_exchange/data/sto/STO-3G.1.json").toString());
    atom_group[1].basis_index = 1;
    //
    let cint_data = CintData.fromGroup(atom_group, [bse.getJsonBasis(atom_group[0].CHARGE_OF.toString()), bse.getJsonBasis(atom_group[1].CHARGE_OF.toString())])
        , cint = Cint.fromCintData(cint_data);
    console.log(cint.normalize(), "\n");
    //
    console.log("select_bas");
    let select_bas = cint.selectBas([
        {atm_index: 0, shell_index: 0}
        , {atm_index: 1, shell_index: 0}
        , {atm_index: 2, shell_index: 1}]);
    for(let i = 0; i < select_bas.nbas; i++){
        for(let j = 0; j < i; j++){
            console.log(select_bas.intor([i, j], "_int1e_ovlp_cart"));
        }
    }
    select_bas.delete();
    //
    console.log("all_bas");
    let all_bas = cint.allBas();
    for(let i = 0; i < all_bas.nbas; i++){
        for(let j = 0; j < i; j++){
            console.log(all_bas.intor([i, j], "_int1e_ovlp_cart"));
        }
    }
    all_bas.delete();
    //
    cint.delete();
});

