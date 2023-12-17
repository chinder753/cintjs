import { Basis } from "./basis.js";
import { Atom } from "./atom.js";



export { FixedLengthArray, AtomGroup };

type FixedLengthArray<
    T,
    N extends number,
    R extends Array<T> = []
> = R['length'] extends N ? R : FixedLengthArray<T, N, [T, ...R]>


type AtomGroup = {
    name: string, element_info: Map<number, {atom: WeakSet<Atom>, basis: Basis[]}>
}
