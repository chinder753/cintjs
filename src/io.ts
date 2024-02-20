export {readXYZ2Group};

import {AtomGroup} from "./extype";


const PERIODIC_TABLE = ["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og", "Uue"];


function readXYZ2Group(xyz: string) {
    // parse
    let xyz_list: string[] = xyz.trim().split(/\r?\n/);
    let natm: number = parseInt(<string>(xyz_list.shift()));
    xyz_list.shift();
    if (natm != xyz_list.length) throw "";

    // read symbol and coordinates
    let atom_map: Map<string, number[][]> = new Map();
    for (let line of xyz_list) {
        line = line.trim();
        let info: string[] = line.split(/ +/);
        if (!atom_map.has(info[0])) atom_map.set(info[0], []);
        atom_map.get(info[0])?.push([parseFloat(info[1]) * 1.88972, parseFloat(info[2]) * 1.88972, parseFloat(info[3]) * 1.88972]);
    }

    // generate AtomGroup
    let atom_group: AtomGroup[] = [];
    atom_map.forEach((coordinates, sym) => {
        // check element symbol
        if (!PERIODIC_TABLE.includes(sym)) throw "";
        atom_group.push({
            basis_index: 0,
            CHARGE_OF: PERIODIC_TABLE.indexOf(sym) + 1,
            NUC_MOD_OF: 0,
            zeta: 0,
            frac_charge: [],
            coordinates: coordinates
        });
    });

    return atom_group;
}
