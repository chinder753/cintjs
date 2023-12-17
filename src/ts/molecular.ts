import { Atom } from "./atom.js";
import { Basis } from "./basis.js";
import { AtomGroup } from "./extype.js";



export { Molecular };



class Molecular {
    private atom: Set<Atom>;
    private group_map: Map<string, AtomGroup>;

    constructor(atom: Atom[] | Set<Atom>, group_map: Map<string, AtomGroup>) {
        this.atom = new Set(atom);
        this.group_map = group_map;
    }

    public static generateGroup(group_name: string, atom: Atom[], basis_list: Basis[]): AtomGroup {
        let basis_map: Map<number, Basis[]> = new Map();
        basis_list.forEach((b) => {
            if (!basis_map.has(b.nuclear_charge)) basis_map.set(b.nuclear_charge, []);
            (<Basis[]>basis_map.get(b.nuclear_charge)).push(b);
        });

        let ele_list: number[] = [];
        atom.forEach((a: Atom): void => {
            ele_list.push(a.nuclear_charge);
        });
        let ele_set: Set<number> = new Set(ele_list);
        for (let e of ele_set.keys()) {
            if (!basis_map.has(e)) throw "";
        }

        return {
            name: group_name
            , atom: new WeakSet(atom)
            , element_info: basis_map
        };
    }

    public addNewAtomTo(group_name: string, atom_list: Atom | Atom[]): void {
        if (!this.group_map.has(group_name)) throw "";
        if (atom_list instanceof Atom) {
            (<AtomGroup>this.group_map.get(group_name)).atom.add(atom_list);
        } else {
            atom_list.forEach((v) => {
                (<AtomGroup>this.group_map.get(group_name)).atom.add(v);
            });
        }
    }

    public addNewBasisTo(group_name: string, basis_list: Basis[]) {
        if (!this.group_map.has(group_name)) throw "";

        let ele_list: number[] = [];
        basis_list.forEach((b) => {
            ele_list.push(b.nuclear_charge);
        });
        let ele_set: Set<number> = new Set(ele_list);
        if (ele_set.size != 1) throw "";

        (<AtomGroup>this.group_map.get(group_name)).element_info.set(basis_list[0].nuclear_charge, basis_list);
    }

    public createNewGroup(group_name: string) {
        if (this.group_map.has(group_name)) throw "";
        this.group_map.set(group_name, {name: group_name, atom: new WeakSet(), element_info: new Map()});
    }

}
