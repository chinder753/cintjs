import {readXYZ2Group} from "../io.js";
import {BSE} from "../bse.js";
import {CintData} from "../cint_data.js";

import cint from "../wasm/cint.js"

import fs from "fs";

cint.then(Cint => {
    let atom_xyz = "3\n" +
        "\n" +
        "H 0.0 0.5 0.0\n" +
        "O 0.0 0.0 0.0\n" +
        "H 0.0 -0.5 0.0\n";

    let atom_group = readXYZ2Group(atom_xyz);
    atom_group[1].basis_index = 1;
    let bse = new BSE(
        fs.readFileSync("lib/basis_set_exchange/basis_set_exchange/data/sto/STO-3G.1.json").toString()
    );
    let cint_data = CintData.fromGroup(atom_group, [bse.getJsonBasis(atom_group[0].CHARGE_OF.toString()), bse.getJsonBasis(atom_group[1].CHARGE_OF.toString())]);

    let cint = Cint.fromCintData(cint_data);
    cint.normalize();
    console.log(cint);
})
